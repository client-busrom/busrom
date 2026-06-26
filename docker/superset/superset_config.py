# ==============================================================================
# Superset Configuration File
# ==============================================================================
# This file configures Apache Superset for the Busrom CDP project.
# It enables multi-language support (English/Chinese) and connects to PostgreSQL.
#
# SSO: Authenticates browser users via the Payload CMS `payload-token` JWT
# cookie. See docs/superset-payload-sso-design.md (Option A).
# A break-glass local admin account remains available at /login.
# ==============================================================================

import os
from datetime import timedelta

from custom_security import PayloadCMSSecurityManager

# Database connection to Superset metadata (separate from Payload CMS DB)
_default_uri = 'postgresql://busrom:busrom_dev_password@host.docker.internal:5432/busrom_cdp'
_env_uri = os.environ.get('SQLALCHEMY_DATABASE_URI')
SQLALCHEMY_DATABASE_URI = _default_uri if not _env_uri or '***' in _env_uri else _env_uri

# Secret key for session encryption
SECRET_KEY = os.environ.get('SUPERSET_SECRET_KEY', 'busrom-superset-secret-key-2024')

# Disable example data loading
SUPERSET_LOAD_EXAMPLES = False

# Enable embedded dashboard feature
SUPERSET_FEATURE_EMBEDDED_SUPERSET = True

# Multi-language configuration
# Default locale is Simplified Chinese. Translation files (messages.mo and
# messages.json) are installed by the custom Dockerfile from the community
# lutinglt/superset-zh image, which provides a more complete zh translation
# than the official Apache Superset image.
BABEL_DEFAULT_LOCALE = 'zh'
BABEL_DEFAULT_FOLDER = 'superset/translations'
LANGUAGES = {
    'en': {'flag': 'us', 'name': 'English'},
    'zh': {'flag': 'cn', 'name': '简体中文'},
}

# Security configuration
WTF_CSRF_ENABLED = True
TALISMAN_ENABLED = False

# Session cookie settings
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = 'Lax'
SESSION_COOKIE_SECURE = os.environ.get('SESSION_COOKIE_SECURE', 'false').lower() == 'true'
PERMANENT_SESSION_LIFETIME = timedelta(seconds=int(os.environ.get('SESSION_LIFETIME_SECONDS', '28800')))

# ReCaptcha configuration (required by Superset 3.1.0 to prevent KeyError)
RECAPTCHA_PUBLIC_KEY = ''
RECAPTCHA_PRIVATE_KEY = ''

# Cache configuration
CACHE_CONFIG = {
    'CACHE_TYPE': 'SimpleCache',
    'CACHE_DEFAULT_TIMEOUT': 300
}

# Timezone configuration
DEFAULT_TIMEZONE = 'Asia/Shanghai'

# Feature flags
FEATURE_FLAGS = {
    'EMBEDDED_SUPERSET': True,
    'ENABLE_TEMPLATE_PROCESSING': True,
    'DASHBOARD_RBAC': True,
    'DASHBOARD_CROSS_FILTERS': True,
    'ENABLE_JAVASCRIPT_CONTROLS': True,
}

# CORS configuration (for embedding in CMS)
ENABLE_CORS = True
# Override allowed origins with SUPERSET_CORS_ORIGINS (comma-separated) in production.
_default_cors_origins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://cms.busromhouse.com',
    'https://cdp.busromhouse.com',
]
_cors_origins_env = os.environ.get('SUPERSET_CORS_ORIGINS', '')
CORS_OPTIONS = {
    'supports_credentials': True,
    'allow_headers': ['*'],
    'resources': ['*'],
    'origins': [o.strip() for o in _cors_origins_env.split(',') if o.strip()] or _default_cors_origins,
}

# Authentication configuration
AUTH_TYPE = 1  # Database authentication (kept for break-glass admin)
AUTH_USER_REGISTRATION = True
AUTH_USER_REGISTRATION_ROLE = 'Gamma'

# Role mapping (used by the SSO manager when no explicit mapping is provided)
AUTH_ROLES_MAPPING = {
    'admin': ['Admin'],
    'editor': ['Alpha'],
    'viewer': ['Gamma'],
}

# ───────────────────────────────────────────────────────────
# Custom Security Manager for Payload CMS Integration
# ───────────────────────────────────────────────────────────

CUSTOM_SECURITY_MANAGER = PayloadCMSSecurityManager


def FLASK_APP_MUTATOR(app):
    """Register the Payload SSO before_request hook."""
    sm = app.appbuilder.sm
    app.before_request(sm.sso_before_request)
