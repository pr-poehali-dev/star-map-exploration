"""Управление тайтлами манги: создание, получение списка тайтлов автора."""
import json
import os
import psycopg2

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "public")

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Auth-Token",
}

def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])

def get_user_from_token(token: str):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        f"SELECT u.id, u.username, u.role FROM {SCHEMA}.sessions s JOIN {SCHEMA}.users u ON u.id = s.user_id WHERE s.token = '{token}' AND s.expires_at > NOW()"
    )
    row = cur.fetchone()
    conn.close()
    return row

def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": ""}

    method = event.get("httpMethod", "GET")
    token = event.get("headers", {}).get("X-Auth-Token", "")

    # GET /titles — список тайтлов автора
    if method == "GET":
        if not token:
            return {"statusCode": 401, "headers": CORS_HEADERS, "body": json.dumps({"error": "Нет токена"})}
        user = get_user_from_token(token)
        if not user:
            return {"statusCode": 401, "headers": CORS_HEADERS, "body": json.dumps({"error": "Токен недействителен"})}

        user_id, username, role = user
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"SELECT id, title, description, genre, genres, author_name, age_rating, cover_url, status, created_at FROM {SCHEMA}.titles WHERE author_id = {user_id} ORDER BY created_at DESC"
        )
        rows = cur.fetchall()
        conn.close()

        titles = [{"id": r[0], "title": r[1], "description": r[2], "genre": r[3], "genres": r[4], "author_name": r[5], "age_rating": r[6], "cover_url": r[7], "status": r[8], "created_at": str(r[9])} for r in rows]
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": json.dumps({"titles": titles})}

    # POST /titles — создать тайтл
    if method == "POST":
        if not token:
            return {"statusCode": 401, "headers": CORS_HEADERS, "body": json.dumps({"error": "Нет токена"})}
        user = get_user_from_token(token)
        if not user:
            return {"statusCode": 401, "headers": CORS_HEADERS, "body": json.dumps({"error": "Токен недействителен"})}

        user_id, username, role = user
        body = json.loads(event.get("body") or "{}")
        title = body.get("title", "").strip()
        description = body.get("description", "").strip()
        genre = body.get("genre", "").strip()
        genres = body.get("genres", "").strip()
        author_name = body.get("author_name", "").strip()
        age_rating = body.get("age_rating", "12+").strip()

        if not title:
            return {"statusCode": 400, "headers": CORS_HEADERS, "body": json.dumps({"error": "Название обязательно"})}
        if not author_name:
            return {"statusCode": 400, "headers": CORS_HEADERS, "body": json.dumps({"error": "Имя автора обязательно"})}

        title_esc = title.replace("'", "''")
        description_esc = description.replace("'", "''")
        genre_esc = genre.replace("'", "''")
        genres_esc = genres.replace("'", "''")
        author_name_esc = author_name.replace("'", "''")
        age_rating_esc = age_rating.replace("'", "''")

        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"INSERT INTO {SCHEMA}.titles (author_id, title, description, genre, genres, author_name, age_rating) "
            f"VALUES ({user_id}, '{title_esc}', '{description_esc}', '{genre_esc}', '{genres_esc}', '{author_name_esc}', '{age_rating_esc}') RETURNING id"
        )
        title_id = cur.fetchone()[0]
        conn.commit()
        conn.close()

        return {"statusCode": 200, "headers": CORS_HEADERS, "body": json.dumps({"id": title_id, "title": title})}

    return {"statusCode": 405, "headers": CORS_HEADERS, "body": json.dumps({"error": "Method not allowed"})}