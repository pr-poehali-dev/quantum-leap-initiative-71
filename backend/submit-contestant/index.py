"""
Приём заявок участниц конкурса МИСС И МИССИС интернет Забайкальский край.
Сохраняет анкету и до 3 фотографий в S3, данные — в PostgreSQL.
"""
import json
import os
import base64
import uuid
import psycopg2
import boto3
from botocore.exceptions import ClientError


def handler(event: dict, context) -> dict:
    cors_headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors_headers, "body": ""}

    body = json.loads(event.get("body") or "{}")

    # Валидация обязательных полей
    required = ["full_name", "age", "city", "phone", "email", "nomination"]
    for field in required:
        if not body.get(field):
            return {
                "statusCode": 400,
                "headers": cors_headers,
                "body": json.dumps({"error": f"Поле '{field}' обязательно"}),
            }

    # Загрузка фотографий в S3
    s3 = boto3.client(
        "s3",
        endpoint_url="https://bucket.poehali.dev",
        aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
    )

    photo_urls = []
    photos = body.get("photos", [])  # список base64-строк (до 3 штук)

    for i, photo_b64 in enumerate(photos[:3]):
        if not photo_b64:
            photo_urls.append(None)
            continue

        # Определяем формат и декодируем
        if "," in photo_b64:
            header, data = photo_b64.split(",", 1)
            ext = "jpg"
            if "png" in header:
                ext = "png"
            elif "webp" in header:
                ext = "webp"
        else:
            data = photo_b64
            ext = "jpg"

        image_bytes = base64.b64decode(data)
        key = f"contestants/{uuid.uuid4()}_photo{i+1}.{ext}"

        s3.put_object(
            Bucket="files",
            Key=key,
            Body=image_bytes,
            ContentType=f"image/{ext}",
        )

        cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"
        photo_urls.append(cdn_url)

    # Дополняем до 3 элементов
    while len(photo_urls) < 3:
        photo_urls.append(None)

    # Сохранение в БД
    schema = os.environ["MAIN_DB_SCHEMA"]
    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    cur = conn.cursor()

    cur.execute(
        f"""
        INSERT INTO {schema}.contestants
            (full_name, age, city, occupation, about, phone, email,
             photo1_url, photo2_url, photo3_url, nomination)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING id
        """,
        (
            body["full_name"],
            int(body["age"]),
            body["city"],
            body.get("occupation", ""),
            body.get("about", ""),
            body["phone"],
            body["email"],
            photo_urls[0],
            photo_urls[1],
            photo_urls[2],
            body["nomination"],
        ),
    )

    contestant_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()

    return {
        "statusCode": 200,
        "headers": cors_headers,
        "body": json.dumps({
            "success": True,
            "id": contestant_id,
            "message": "Заявка успешно отправлена! Мы свяжемся с вами.",
        }),
    }
