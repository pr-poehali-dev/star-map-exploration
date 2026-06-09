"""Регистрация, вход и проверка сессии пользователя."""
import json
import os
import hashlib
import secrets
import psycopg2
from datetime import datetime, timedelta

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "public")
MODERATOR_EMAIL = "fox7uig.a@gmail.com"

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Auth-Token",
}

def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": ""}

    path = event.get("path", "/")
    body = json.loads(event.get("body") or "{}")

    # Регистрация
    if path.endswith("/register"):
        email = body.get("email", "").lower().strip()
        password = body.get("password", "")
        username = body.get("username", "")

        if not email or not password or not username:
            return {"statusCode": 400, "headers": CORS_HEADERS, "body": json.dumps({"error": "Заполните все поля"})}

        role = "moderator" if email == MODERATOR_EMAIL else "author"

        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"SELECT id FROM {SCHEMA}.users WHERE email = '{email}'")
        if cur.fetchone():
            conn.close()
            return {"statusCode": 409, "headers": CORS_HEADERS, "body": json.dumps({"error": "Email уже зарегистрирован"})}

        cur.execute(
            f"INSERT INTO {SCHEMA}.users (email, password_hash, username, role) VALUES ('{email}', '{hash_password(password)}', '{username}', '{role}') RETURNING id"
        )
        user_id = cur.fetchone()[0]
        conn.commit()

        token = secrets.token_hex(32)
        expires = datetime.now() + timedelta(days=30)
        cur.execute(
            f"INSERT INTO {SCHEMA}.sessions (user_id, token, expires_at) VALUES ({user_id}, '{token}', '{expires}')"
        )
        conn.commit()
        conn.close()

        return {"statusCode": 200, "headers": CORS_HEADERS, "body": json.dumps({"token": token, "role": role, "username": username, "user_id": user_id})}

    # Вход
    if path.endswith("/login"):
        email = body.get("email", "").lower().strip()
        password = body.get("password", "")

        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"SELECT id, username, role FROM {SCHEMA}.users WHERE email = '{email}' AND password_hash = '{hash_password(password)}'")
        row = cur.fetchone()
        if not row:
            conn.close()
            return {"statusCode": 401, "headers": CORS_HEADERS, "body": json.dumps({"error": "Неверный email или пароль"})}

        user_id, username, role = row
        token = secrets.token_hex(32)
        expires = datetime.now() + timedelta(days=30)
        cur.execute(f"INSERT INTO {SCHEMA}.sessions (user_id, token, expires_at) VALUES ({user_id}, '{token}', '{expires}')")
        conn.commit()
        conn.close()

        return {"statusCode": 200, "headers": CORS_HEADERS, "body": json.dumps({"token": token, "role": role, "username": username, "user_id": user_id})}

    # Проверка токена
    if path.endswith("/me"):
        token = event.get("headers", {}).get("X-Auth-Token", "")
        if not token:
            return {"statusCode": 401, "headers": CORS_HEADERS, "body": json.dumps({"error": "Нет токена"})}

        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"SELECT u.id, u.username, u.role FROM {SCHEMA}.sessions s JOIN {SCHEMA}.users u ON u.id = s.user_id WHERE s.token = '{token}' AND s.expires_at > NOW()"
        )
        row = cur.fetchone()
        conn.close()
        if not row:
            return {"statusCode": 401, "headers": CORS_HEADERS, "body": json.dumps({"error": "Токен недействителен"})}

        return {"statusCode": 200, "headers": CORS_HEADERS, "body": json.dumps({"user_id": row[0], "username": row[1], "role": row[2]})}

    return {"statusCode": 404, "headers": CORS_HEADERS, "body": json.dumps({"error": "Not found"})}
