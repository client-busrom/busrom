#!/usr/bin/env python3
"""
Busrom CDP - Payload CMS to Superset User Sync (Idempotent)
同步 Payload CMS 用户到 Superset（幂等，不重复创建）
"""

import os
import sys

sys.path.insert(0, '/app')

from superset.app import create_app

app = create_app()


def sync_users():
    """Sync users from Payload CMS to Superset — idempotent upsert."""
    with app.app_context():
        from superset.extensions import db
        from flask_appbuilder.security.sqla.models import User, Role
        import psycopg2

        # Use hardcoded password because Hermes masks env vars with ***
        raw_password = os.environ.get('POSTGRES_PASSWORD', '')
        password = raw_password if raw_password != '***' else 'busrom_dev_password'
        conn = psycopg2.connect(
            host='host.docker.internal',
            database=os.environ.get('POSTGRES_DB', 'busrom_cms'),
            user=os.environ.get('POSTGRES_USER', 'busrom'),
            password=password,
        )
        cursor = conn.cursor()
        cursor.execute("""
            SELECT email, name, is_admin
            FROM users
            WHERE status = 'active'
        """)
        payload_users = cursor.fetchall()
        cursor.close()
        conn.close()

        created, updated, skipped = 0, 0, 0

        for email, name, is_admin in payload_users:
            user = db.session.query(User).filter_by(username=email).first()
            role_name = 'Admin' if is_admin else 'Gamma'
            role = db.session.query(Role).filter_by(name=role_name).first()

            if not user:
                # Check if email already exists
                existing = db.session.query(User).filter_by(email=email).first()
                if existing:
                    print(f"[SKIP] {email} already exists with different username")
                    continue
                # Create new user
                first = name.split()[0] if name else email
                last = ' '.join(name.split()[1:]) if name and len(name.split()) > 1 else ''
                user = User(
                    username=email,
                    first_name=first,
                    last_name=last,
                    email=email,
                    active=True,
                    roles=[role] if role else [],
                )
                # Placeholder password; real auth goes through Payload CMS
                from werkzeug.security import generate_password_hash
                user.password = generate_password_hash('__payload_synced__')
                db.session.add(user)
                created += 1
                print(f"[CREATE] {email} -> {role_name}")
            else:
                # Update role if changed
                current_roles = {r.name for r in user.roles}
                if role_name not in current_roles:
                    user.roles = [role] if role else []
                    updated += 1
                    print(f"[UPDATE] {email} role -> {role_name}")
                else:
                    skipped += 1
                    print(f"[SKIP] {email} already synced")

        db.session.commit()
        print(f"\nSync complete: {created} created, {updated} updated, {skipped} skipped.")


if __name__ == '__main__':
    sync_users()
