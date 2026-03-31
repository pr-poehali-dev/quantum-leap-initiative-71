"""
Приём заявок участниц конкурса МИСС И МИССИС интернет Забайкальский край.
Сохраняет анкету и до 3 фотографий в S3, данные — в PostgreSQL.
Отправляет уведомление на почту организатора.
"""
import json
import os
import base64
import uuid
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import psycopg2
import boto3


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

    # Отправка email-уведомления организатору
    try:
        nomination_label = "Мисс интернет" if body["nomination"] == "miss" else "Миссис интернет"
        photos_links = "\n".join(
            [f"Фото {i+1}: {url}" for i, url in enumerate(photo_urls) if url]
        ) or "Фотографии не загружены"

        html_body = f"""
        <h2>Новая заявка на конкурс #{contestant_id}</h2>
        <table style="border-collapse:collapse;width:100%">
          <tr><td style="padding:6px;font-weight:bold">Номинация</td><td style="padding:6px">{nomination_label}</td></tr>
          <tr><td style="padding:6px;font-weight:bold">ФИО</td><td style="padding:6px">{body['full_name']}</td></tr>
          <tr><td style="padding:6px;font-weight:bold">Возраст</td><td style="padding:6px">{body['age']}</td></tr>
          <tr><td style="padding:6px;font-weight:bold">Город</td><td style="padding:6px">{body['city']}</td></tr>
          <tr><td style="padding:6px;font-weight:bold">Телефон</td><td style="padding:6px">{body['phone']}</td></tr>
          <tr><td style="padding:6px;font-weight:bold">Email</td><td style="padding:6px">{body['email']}</td></tr>
          <tr><td style="padding:6px;font-weight:bold">Деятельность</td><td style="padding:6px">{body.get('occupation','—')}</td></tr>
          <tr><td style="padding:6px;font-weight:bold">О себе</td><td style="padding:6px">{body.get('about','—')}</td></tr>
        </table>
        <h3>Фотографии:</h3>
        {''.join([f'<p><a href="{url}">Фото {i+1}</a></p>' for i, url in enumerate(photo_urls) if url]) or '<p>Не загружены</p>'}
        """

        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"Новая заявка #{contestant_id} — {body['full_name']} ({nomination_label})"
        msg["From"] = "noreply@poehali.dev"
        msg["To"] = "kot_diana@internet.ru"
        msg.attach(MIMEText(html_body, "html", "utf-8"))

        smtp_password = os.environ.get("SMTP_PASSWORD", "")
        if smtp_password:
            with smtplib.SMTP_SSL("smtp.mail.ru", 465) as server:
                server.login("noreply@poehali.dev", smtp_password)
                server.sendmail("noreply@poehali.dev", "kot_diana@internet.ru", msg.as_string())
    except Exception:
        pass  # Не прерываем ответ если email не ушёл

    return {
        "statusCode": 200,
        "headers": cors_headers,
        "body": json.dumps({
            "success": True,
            "id": contestant_id,
            "message": "Заявка успешно отправлена! Мы свяжемся с вами.",
        }),
    }