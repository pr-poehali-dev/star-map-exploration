"""Панель модератора: список заявок на модерацию, одобрение/отклонение глав."""
import json
import os
import psycopg2

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "public")
MODERATOR_EMAIL = "fox7uig.a@gmail.com"

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
        f"SELECT u.id, u.email, u.role FROM {SCHEMA}.sessions s JOIN {SCHEMA}.users u ON u.id = s.user_id WHERE s.token = '{token}' AND s.expires_at > NOW()"
    )
    row = cur.fetchone()
    conn.close()
    return row

def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": ""}

    method = event.get("httpMethod", "GET")
    token = event.get("headers", {}).get("X-Auth-Token", "")

    if not token:
        return {"statusCode": 401, "headers": CORS_HEADERS, "body": json.dumps({"error": "Нет токена"})}
    user = get_user_from_token(token)
    if not user:
        return {"statusCode": 401, "headers": CORS_HEADERS, "body": json.dumps({"error": "Токен недействителен"})}

    user_id, email, role = user
    if role != "moderator":
        return {"statusCode": 403, "headers": CORS_HEADERS, "body": json.dumps({"error": "Доступ только для модератора"})}

    # GET /moderation — список глав на модерации
    if method == "GET":
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"""
            SELECT 
                c.id, c.chapter_number, c.chapter_title, c.moderation_status, c.created_at,
                t.id as title_id, t.title,
                u.username as author_name,
                (SELECT COUNT(*) FROM {SCHEMA}.pages p WHERE p.chapter_id = c.id) as page_count,
                (SELECT p.image_url FROM {SCHEMA}.pages p WHERE p.chapter_id = c.id ORDER BY p.page_number LIMIT 1) as first_page
            FROM {SCHEMA}.chapters c
            JOIN {SCHEMA}.titles t ON t.id = c.title_id
            JOIN {SCHEMA}.users u ON u.id = t.author_id
            ORDER BY c.created_at DESC
        """)
        rows = cur.fetchall()
        conn.close()

        chapters = [{
            "id": r[0], "chapter_number": r[1], "chapter_title": r[2],
            "moderation_status": r[3], "created_at": str(r[4]),
            "title_id": r[5], "title": r[6], "author_name": r[7],
            "page_count": r[8], "first_page": r[9]
        } for r in rows]

        return {"statusCode": 200, "headers": CORS_HEADERS, "body": json.dumps({"chapters": chapters})}

    # POST /moderation — одобрить или отклонить главу
    if method == "POST":
        body = json.loads(event.get("body") or "{}")
        chapter_id = body.get("chapter_id")
        action = body.get("action")  # "approve" или "reject"
        comment = body.get("comment", "").strip()

        if not chapter_id or action not in ("approve", "reject"):
            return {"statusCode": 400, "headers": CORS_HEADERS, "body": json.dumps({"error": "chapter_id и action (approve/reject) обязательны"})}

        status = "approved" if action == "approve" else "rejected"
        comment_esc = comment.replace("'", "''")

        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"UPDATE {SCHEMA}.chapters SET moderation_status = '{status}', moderation_comment = '{comment_esc}' WHERE id = {chapter_id}"
        )
        conn.commit()
        conn.close()

        return {"statusCode": 200, "headers": CORS_HEADERS, "body": json.dumps({"ok": True, "status": status})}

    return {"statusCode": 405, "headers": CORS_HEADERS, "body": json.dumps({"error": "Method not allowed"})}
