FROM postgres:15-alpine

# Install openssl to generate self-signed certificates
RUN apk add --no-cache openssl

# Create a self-signed certificate for local development
RUN openssl req -new -x509 -days 3650 -nodes -text \
    -out /var/lib/postgresql/server.crt \
    -keyout /var/lib/postgresql/server.key \
    -subj "/CN=localhost"

# Set proper permissions for Postgres to read the keys
RUN chmod 600 /var/lib/postgresql/server.key && \
    chown postgres:postgres /var/lib/postgresql/server.crt /var/lib/postgresql/server.key

# Copy initialization scripts to create additional databases on first startup
COPY ./init-scripts /docker-entrypoint-initdb.d
