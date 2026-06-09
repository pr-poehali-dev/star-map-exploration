"""Комментарии к главам манги: получение и добавление."""
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
    params = event.get("queryStringParameters") or {}
    token = event.get("headers", {}).get("X-Auth-Token", "")

    # GET /comments?chapter_id=X — список комментариев к главе
    if method == "GET":
        chapter_id = params.get("chapter_id")
        if not chapter_id:
            return {"statusCode": 400, "headers": CORS_HEADERS, "body": json.dumps({"error": "chapter_id обязателен"})}

        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"SELECT c.id, c.content, c.created_at, u.username "
            f"FROM {SCHEMA}.comments c JOIN {SCHEMA}.users u ON u.id = c.user_id "
            f"WHERE c.chapter_id = {chapter_id} ORDER BY c.created_at ASC"
        )
        rows = cur.fetchall()
        conn.close()

        comments = [{"id": r[0], "content": r[1], "created_at": str(r[2]), "username": r[3]} for r in rows]
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": json.dumps({"comments": comments})}

    # POST /comments — добавить комментарий
    if method == "POST":
        if not token:
            return {"statusCode": 401, "headers": CORS_HEADERS, "body": json.dumps({"error": "Войдите, чтобы оставить комментарий"})}
        user = get_user_from_token(token)
        if not user:
            return {"statusCode": 401, "headers": CORS_HEADERS, "body": json.dumps({"error": "Токен недействителен"})}

        user_id, username, role = user
        body = json.loads(event.get("body") or "{}")
        chapter_id = body.get("chapter_id")
        content = body.get("content", "").strip()

        if not chapter_id or not content:
            return {"statusCode": 400, "headers": CORS_HEADERS, "body": json.dumps({"error": "chapter_id и текст комментария обязательны"})}

        if len(content) > 2000:
            return {"statusCode": 400, "headers": CORS_HEADERS, "body": json.dumps({"error": "Комментарий слишком длинный (макс. 2000 символов)"})}

        content_esc = content.replace("'", "''")
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"INSERT INTO {SCHEMA}.comments (chapter_id, user_id, content) VALUES ({chapter_id}, {user_id}, '{content_esc}') RETURNING id, created_at"
        )
        row = cur.fetchone()
        conn.commit()
        conn.close()

        return {"statusCode": 200, "headers": CORS_HEADERS, "body": json.dumps({"id": row[0], "username": username, "content": content, "created_at": str(row[1])})}

    return {"statusCode": 405, "headers": CORS_HEADERS, "body": json.dumps({"error": "Method not allowed"})}