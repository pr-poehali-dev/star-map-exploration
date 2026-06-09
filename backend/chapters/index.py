"""Управление главами: создание главы, загрузка страниц, получение списка."""
import json
import os
import base64
import boto3
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

def get_s3():
    return boto3.client(
        "s3",
        endpoint_url="https://bucket.poehali.dev",
        aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
    )

def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": ""}

    method = event.get("httpMethod", "GET")
    token = event.get("headers", {}).get("X-Auth-Token", "")
    path = event.get("path", "/")

    if not token:
        return {"statusCode": 401, "headers": CORS_HEADERS, "body": json.dumps({"error": "Нет токена"})}
    user = get_user_from_token(token)
    if not user:
        return {"statusCode": 401, "headers": CORS_HEADERS, "body": json.dumps({"error": "Токен недействителен"})}

    user_id, username, role = user

    # GET /chapters?title_id=X — список глав тайтла
    if method == "GET":
        params = event.get("queryStringParameters") or {}
        title_id = params.get("title_id")
        if not title_id:
            return {"statusCode": 400, "headers": CORS_HEADERS, "body": json.dumps({"error": "title_id обязателен"})}

        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"SELECT id, chapter_number, chapter_title, moderation_status, moderation_comment, created_at FROM {SCHEMA}.chapters WHERE title_id = {title_id} ORDER BY chapter_number"
        )
        rows = cur.fetchall()
        conn.close()

        chapters = [{"id": r[0], "chapter_number": r[1], "chapter_title": r[2], "moderation_status": r[3], "moderation_comment": r[4], "created_at": str(r[5])} for r in rows]
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": json.dumps({"chapters": chapters})}

    # POST /chapters — создать главу с загрузкой страниц
    if method == "POST":
        body = json.loads(event.get("body") or "{}")
        title_id = body.get("title_id")
        chapter_number = body.get("chapter_number")
        chapter_title = body.get("chapter_title", "").strip()
        pages = body.get("pages", [])  # list of {filename, data (base64)}

        if not title_id or not chapter_number:
            return {"statusCode": 400, "headers": CORS_HEADERS, "body": json.dumps({"error": "title_id и chapter_number обязательны"})}

        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"SELECT id FROM {SCHEMA}.titles WHERE id = {title_id} AND author_id = {user_id}")
        if not cur.fetchone():
            conn.close()
            return {"statusCode": 403, "headers": CORS_HEADERS, "body": json.dumps({"error": "Нет доступа к этому тайтлу"})}

        chapter_title_esc = chapter_title.replace("'", "''")
        cur.execute(
            f"INSERT INTO {SCHEMA}.chapters (title_id, chapter_number, chapter_title) VALUES ({title_id}, {chapter_number}, '{chapter_title_esc}') RETURNING id"
        )
        chapter_id = cur.fetchone()[0]
        conn.commit()

        s3 = get_s3()
        access_key = os.environ["AWS_ACCESS_KEY_ID"]
        page_urls = []

        for i, page in enumerate(pages):
            page_num = i + 1
            filename = page.get("filename", f"page_{page_num}.jpg")
            data = base64.b64decode(page.get("data", ""))
            ext = filename.rsplit(".", 1)[-1].lower()
            content_type = "image/jpeg" if ext in ("jpg", "jpeg") else "image/png"
            key = f"manga/{title_id}/chapters/{chapter_id}/page_{page_num:03d}.{ext}"
            s3.put_object(Bucket="files", Key=key, Body=data, ContentType=content_type)
            url = f"https://cdn.poehali.dev/projects/{access_key}/bucket/{key}"
            cur.execute(f"INSERT INTO {SCHEMA}.pages (chapter_id, page_number, image_url) VALUES ({chapter_id}, {page_num}, '{url}')")
            page_urls.append(url)

        conn.commit()
        conn.close()

        return {"statusCode": 200, "headers": CORS_HEADERS, "body": json.dumps({"chapter_id": chapter_id, "pages_uploaded": len(page_urls)})}

    return {"statusCode": 405, "headers": CORS_HEADERS, "body": json.dumps({"error": "Method not allowed"})}
