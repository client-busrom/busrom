# ==============================================================================
# Busrom Superset SSO - Payload CMS JWT Security Manager
# ==============================================================================
# Implements Option A from docs/superset-payload-sso-design.md:
#   - Reads the HttpOnly `payload-token` cookie on every request.
#   - Validates the JWT signature with HS256 + PAYLOAD_SECRET.
#   - Queries the Payload CMS PostgreSQL DB for user info and roles.
#   - Syncs the user into Superset and logs them in silently.
#   - Redirects to Payload CMS login when the cookie is missing/invalid/expired
#     or when the user is not authorized.
#
# A break-glass local admin account is still available via the standard
# Superset /login page because the before_request hook skips that path.
# ==============================================================================

import hashlib
import json
import logging
import os
from urllib.parse import quote

import jwt
import psycopg2
from flask import redirect, request
from flask_login import current_user, login_user
from superset.extensions import db
from superset.security import SupersetSecurityManager

logger = logging.getLogger(__name__)


class PayloadCMSSecurityManager(SupersetSecurityManager):
    """Custom Superset security manager that authenticates via Payload CMS JWT."""

    # Paths that are never intercepted by the SSO flow.
    # Superset is mounted under /superset/ in production, so both the raw
    # Flask paths and the externally-visible prefixed paths are listed.
    _EXEMPT_PATHS = {
        "/login",
        "/logout",
        "/register",
        "/health",
        "/api/v1/health",
        "/superset/login",
        "/superset/logout",
        "/superset/register",
        "/superset/health",
        "/superset/api/v1/health",
    }

    def __init__(self, appbuilder):
        super().__init__(appbuilder)

        self.payload_secret = os.environ.get("PAYLOAD_SECRET")
        # Payload CMS hashes the configured secret with SHA-256 and uses the
        # first 32 hex chars as the JWT signing key.
        self.payload_signing_secret = (
            hashlib.sha256(self.payload_secret.encode("utf-8")).hexdigest()[:32]
            if self.payload_secret
            else None
        )
        self.payload_cms_url = os.environ.get(
            "PAYLOAD_CMS_URL", "https://cms.busromhouse.com"
        )
        self.payload_cookie_domain = os.environ.get("PAYLOAD_COOKIE_DOMAIN")

        # Payload DB URI: explicit value, or build from Postgres variables.
        self.payload_db_uri = os.environ.get(
            "PAYLOAD_DB_URI",
            "postgresql://{user}:{password}@{host}:{port}/{database}".format(
                user=os.environ.get("POSTGRES_USER", "busrom"),
                password=os.environ.get("POSTGRES_PASSWORD", "busrom_dev_password"),
                host=os.environ.get("POSTGRES_HOST", "postgres"),
                port=os.environ.get("POSTGRES_PORT", "5432"),
                database=os.environ.get("POSTGRES_DB", "busrom_cms"),
            ),
        )

        # Comma-separated list of Payload role codes allowed to use Superset.
        allowed = os.environ.get("PAYLOAD_SSO_ALLOWED_ROLES", "")
        self.allowed_roles = {r.strip() for r in allowed.split(",") if r.strip()}

        # Fallback Superset role when no mapping matches.
        self.default_role = os.environ.get("PAYLOAD_SSO_DEFAULT_ROLE", "Gamma")

        # JSON mapping from Payload role code -> Superset role name(s).
        self.role_mapping = self._load_role_mapping()

    def _load_role_mapping(self):
        """Load role mapping from env, falling back to sensible defaults."""
        mapping_json = os.environ.get("PAYLOAD_SSO_ROLE_MAPPING", "")
        if mapping_json:
            try:
                return json.loads(mapping_json)
            except Exception as exc:  # noqa: BLE001
                logger.warning("PAYLOAD_SSO_ROLE_MAPPING is invalid JSON: %s", exc)

        return {
            "admin": ["Admin"],
            "editor": ["Alpha"],
            "viewer": ["Gamma"],
            "analytics": ["Gamma"],
        }

    # --------------------------------------------------------------------------
    # helpers
    # --------------------------------------------------------------------------

    def _is_exempt_path(self, path):
        if path in self._EXEMPT_PATHS:
            return True
        if path.startswith("/static/") or path.startswith("/appbuilder/"):
            return True
        if path.startswith("/api/") or path.startswith("/superset/api/"):
            # Let Superset's existing auth layer handle API calls.
            return True
        for prefix in ("/login/", "/logout/", "/register/",
                       "/superset/login/", "/superset/logout/", "/superset/register/"):
            if path.startswith(prefix):
                return True
        return False

    def _redirect_to_cms_login(self, clear_cookie=False):
        target = f"{self.payload_cms_url}/admin/login?redirect={quote(request.url, safe='')}"
        response = redirect(target, code=302)
        if clear_cookie and "payload-token" in request.cookies:
            response.delete_cookie(
                "payload-token",
                domain=self.payload_cookie_domain or None,
                path="/",
            )
        return response

    def _validate_payload_token(self, token):
        if not self.payload_secret:
            raise jwt.InvalidTokenError("PAYLOAD_SECRET is not configured")
        if not self.payload_signing_secret:
            raise jwt.InvalidTokenError("PAYLOAD_SECRET could not be hashed")

        return jwt.decode(
            token,
            self.payload_signing_secret,
            algorithms=["HS256"],
            options={"require": ["exp"]},
        )

    def _get_pg_conn(self):
        return psycopg2.connect(self.payload_db_uri)

    def _lookup_payload_user(self, email):
        """Fetch active Payload user with role codes from Postgres."""
        conn = self._get_pg_conn()
        try:
            with conn.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT
                        u.id,
                        u.email,
                        u.name,
                        u.is_admin,
                        u.status,
                        COALESCE(array_agg(r.code) FILTER (WHERE r.code IS NOT NULL), ARRAY[]::varchar[])
                    FROM users u
                    LEFT JOIN users_rels ur
                        ON ur.parent_id = u.id
                        AND ur.path = 'roles'
                    LEFT JOIN roles r
                        ON r.id = ur.roles_id
                        AND r.is_active = true
                    WHERE u.email = %s
                    GROUP BY u.id, u.email, u.name, u.is_admin, u.status
                    """,
                    (email,),
                )
                row = cursor.fetchone()
                if not row:
                    return None

                return {
                    "id": row[0],
                    "email": row[1],
                    "name": row[2] or row[1],
                    "is_admin": bool(row[3]),
                    "status": row[4],
                    "roles": [r for r in (row[5] or []) if r],
                }
        finally:
            conn.close()

    def _map_roles(self, payload_roles, is_admin):
        """Map Payload role codes to Superset role names."""
        role_names = set()

        if is_admin:
            role_names.add("Admin")

        for code in payload_roles:
            mapped = self.role_mapping.get(code)
            if not mapped:
                continue
            if isinstance(mapped, str):
                role_names.add(mapped)
            elif isinstance(mapped, list):
                role_names.update(mapped)

        if not role_names:
            role_names.add(self.default_role)

        return list(role_names)

    def _resolve_superset_roles(self, role_names):
        """Convert role names to FAB role objects, falling back to default."""
        roles = []
        for name in role_names:
            role = self.find_role(name)
            if role:
                roles.append(role)
            else:
                logger.warning("Superset role '%s' does not exist", name)

        if not roles:
            default = self.find_role(self.default_role)
            if default:
                roles.append(default)

        return roles

    def _find_user_by_email(self, email):
        """Find a Superset user by email address."""
        return (
            db.session.query(self.user_model)
            .filter_by(email=email)
            .one_or_none()
        )

    def _sync_user_to_superset(self, payload_user):
        """Idempotent create/update Superset user from Payload user data."""
        email = payload_user["email"]
        name = payload_user.get("name") or email
        is_admin = bool(payload_user.get("is_admin"))
        payload_roles = payload_user.get("roles", [])

        target_role_names = self._map_roles(payload_roles, is_admin)
        target_roles = self._resolve_superset_roles(target_role_names)

        # Prefer lookup by email so we can merge with a break-glass admin
        # account that may have a different username.
        user = self._find_user_by_email(email)
        if not user:
            user = self.find_user(username=email)

        if not user:
            parts = name.split(None, 1)
            first_name = parts[0] if parts else email
            last_name = parts[1] if len(parts) > 1 else ""

            # Create with first role to satisfy FAB's add_user signature.
            user = self.add_user(
                username=email,
                first_name=first_name,
                last_name=last_name,
                email=email,
                role=target_roles[0] if target_roles else None,
                password=os.urandom(32).hex(),
            )

            if not user or not hasattr(user, "roles"):
                logger.error("add_user failed for %s", email)
                db.session.rollback()
                return None

            if target_roles:
                user.roles = target_roles
                db.session.commit()

            logger.info("Created Superset user from Payload SSO: %s", email)
        else:
            current_names = {r.name for r in user.roles}
            if current_names != set(target_role_names):
                user.roles = target_roles
                db.session.commit()
                logger.info("Updated Superset roles for %s: %s", email, target_role_names)

        return user

    # --------------------------------------------------------------------------
    # Flask before_request hook
    # --------------------------------------------------------------------------

    def sso_before_request(self):
        """Silently authenticate users that carry a valid Payload JWT cookie."""
        if self._is_exempt_path(request.path):
            return None

        if current_user.is_authenticated:
            return None

        token = request.cookies.get("payload-token")
        if not token:
            return self._redirect_to_cms_login()

        try:
            payload = self._validate_payload_token(token)
        except jwt.InvalidTokenError as exc:
            logger.warning("Invalid payload-token from %s: %s", request.remote_addr, exc)
            return self._redirect_to_cms_login(clear_cookie=True)

        email = payload.get("email")
        if not email:
            logger.warning("payload-token missing email claim")
            return self._redirect_to_cms_login(clear_cookie=True)

        payload_user = self._lookup_payload_user(email)
        if not payload_user or payload_user.get("status") != "active":
            logger.warning(
                "Payload user not found or inactive: %s (status=%s)",
                email,
                payload_user.get("status") if payload_user else "None",
            )
            return self._redirect_to_cms_login(clear_cookie=True)

        if self.allowed_roles:
            user_roles = set(payload_user.get("roles", []))
            if not user_roles.intersection(self.allowed_roles) and not payload_user.get(
                "is_admin"
            ):
                logger.warning(
                    "User %s lacks allowed Payload roles (%s)",
                    email,
                    self.allowed_roles,
                )
                return self._redirect_to_cms_login()

        try:
            superset_user = self._sync_user_to_superset(payload_user)
            if not superset_user:
                logger.error("Failed to sync Superset user for %s", email)
                return self._redirect_to_cms_login()

            self.update_user_auth_stat(superset_user, True)
            login_user(superset_user, remember=False)
            logger.info("SSO login successful for %s", email)
        except Exception:  # noqa: BLE001
            logger.exception("SSO sync/login failed for %s", email)
            db.session.rollback()
            return self._redirect_to_cms_login()

        return None
