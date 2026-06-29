# ==============================================================================
# Busrom CDP - Apache Superset Custom Image
# ==============================================================================
# Based on the official Apache Superset image with:
# - PostgreSQL driver installed
# - Complete Chinese (zh) translations from lutinglt/superset-zh
# - Pinned Superset version for reproducible builds
# ==============================================================================

ARG SUPERSET_VERSION=4.1.1-py311
ARG SUPERSET_ZH_VERSION=4.1.1-py311-20250715

# -----------------------------------------------------------------------------
# Stage 1: Extract complete Chinese translations from superset-zh image
# -----------------------------------------------------------------------------
FROM lutinglt/superset-zh:${SUPERSET_ZH_VERSION} AS zh-translations

# -----------------------------------------------------------------------------
# Stage 2: Build production image based on official Superset
# -----------------------------------------------------------------------------
FROM apache/superset:${SUPERSET_VERSION}
USER root

# Install PostgreSQL driver, bcrypt, PyJWT, and flask-cors for Payload SSO / CORS
RUN pip install --no-cache-dir psycopg2-binary bcrypt pyjwt flask-cors

# Install complete Chinese translations copied from superset-zh image.
# This fixes the incomplete/outdated zh translations bundled with the
# official image. Both messages.mo (backend) and messages.json (frontend)
# must be present for full UI localization.
COPY --from=zh-translations \
    /app/superset/translations/zh/LC_MESSAGES/messages.mo \
    /app/superset/translations/zh/LC_MESSAGES/messages.mo
COPY --from=zh-translations \
    /app/superset/translations/zh/LC_MESSAGES/messages.json \
    /app/superset/translations/zh/LC_MESSAGES/messages.json

# Ensure translation files are readable
RUN chmod -R a+r /app/superset/translations/zh/LC_MESSAGES

# Copy custom Superset configuration, Payload SSO security manager, and startup script.
# The base image adds /app/pythonpath to PYTHONPATH, so configs placed
# there are loaded automatically.
COPY superset_config.py /app/pythonpath/superset_config.py
COPY custom_security.py /app/pythonpath/custom_security.py
COPY start.sh /app/start.sh
RUN chmod -R a+r /app/pythonpath && chmod a+rx /app/start.sh

USER superset
# Use the project startup script (db upgrade, init roles, start gunicorn).
CMD ["/app/start.sh"]
