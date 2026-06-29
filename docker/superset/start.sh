#!/bin/bash
set -e

# Superset's runtime Python interpreter. Newer official images use the system
# Python directly (/usr/local/bin/python); older images used a venv at
# /app/.venv. The system interpreter always has pip, so we use it to install
# packages into the interpreter's site-packages (or into the venv's
# site-packages via --target when a venv is present).
SYSTEM_PYTHON=/usr/local/bin/python

if [[ -x /app/.venv/bin/python ]]; then
    RUNTIME_PYTHON=/app/.venv/bin/python
    PYTHON_VERSION=$(${RUNTIME_PYTHON} -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')
    PIP_TARGET="--target /app/.venv/lib/python${PYTHON_VERSION}/site-packages"
else
    RUNTIME_PYTHON=${SYSTEM_PYTHON}
    PIP_TARGET=""
fi

echo "Runtime Python: ${RUNTIME_PYTHON}"
echo "Installing packages with: ${SYSTEM_PYTHON} -m pip install ${PIP_TARGET}"

# Ensure runtime dependencies are available.
# (psycopg2-binary, bcrypt, pyjwt, flask-cors are also installed in the Dockerfile.)
${SYSTEM_PYTHON} -m pip install --no-cache-dir ${PIP_TARGET} psycopg2-binary || true
${SYSTEM_PYTHON} -m pip install --no-cache-dir ${PIP_TARGET} bcrypt || true
${SYSTEM_PYTHON} -m pip install --no-cache-dir ${PIP_TARGET} pyjwt || true
${SYSTEM_PYTHON} -m pip install --no-cache-dir ${PIP_TARGET} flask-cors || true

# Initialize database
superset db upgrade

# Create admin user (ignore error if exists). Prefer ADMIN_PASSWORD env var;
# otherwise generate a random password so we do not ship a hardcoded credential.
if [ -z "$ADMIN_PASSWORD" ]; then
  ADMIN_PASSWORD=$(python -c "import secrets; print(secrets.token_urlsafe(32))")
fi
superset fab create-admin --username admin --firstname Admin --lastname User --email admin@busrom.com --password "$ADMIN_PASSWORD" || true

# Initialize roles
superset init || true

# Start server
exec gunicorn -w 2 -k gthread --bind 0.0.0.0:8088 --timeout 120 --limit-request-line 0 "superset.app:create_app()"
