"""
Голосование за участницу конкурса МИСС И МИССИС интернет Забайкальский край.
Один IP — один голос за одну участницу.
Голосование открыто с 20 апреля 2026 года.
"""
import json
import os
from datetime import datetime, timezone, timedelta
import psycopg2


VOTE_START = datetime(2026, 4, 20, 0, 0, 0, tzinfo=timezone(timedelta(hours=8)))  # UTC+8 Чита


def handler(event: dict, context) -> dict:
    cors_headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors_headers, "body": ""}

    now = datetime.now(tz=timezone(timedelta(hours=8)))
    if now < VOTE_START:
        return {
            "statusCode": 403,
            "headers": cors_headers,
            "body": json.dumps({"error": "Голосование ещё не открыто. Старт 20 апреля 2026 года."}),
        }

    body = json.loads(event.get("body") or "{}")
    contestant_id = body.get("contestant_id")
    if not contestant_id:
        return {
            "statusCode": 400,
            "headers": cors_headers,
            "body": json.dumps({"error": "Не указан contestant_id"}),
        }

    voter_ip = (
        event.get("requestContext", {}).get("identity", {}).get("sourceIp")
        or event.get("headers", {}).get("X-Forwarded-For", "unknown").split(",")[0].strip()
    )

    schema = os.environ["MAIN_DB_SCHEMA"]
    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    cur = conn.cursor()

    # Проверяем что участница существует
    cur.execute(f"SELECT id FROM {schema}.contestants WHERE id = %s", (contestant_id,))
    if not cur.fetchone():
        cur.close()
        conn.close()
        return {
            "statusCode": 404,
            "headers": cors_headers,
            "body": json.dumps({"error": "Участница не найдена"}),
        }

    # Проверяем что IP уже не голосовал за эту участницу
    cur.execute(
        f"SELECT id FROM {schema}.votes WHERE contestant_id = %s AND voter_ip = %s",
        (contestant_id, voter_ip),
    )
    if cur.fetchone():
        cur.close()
        conn.close()
        return {
            "statusCode": 409,
            "headers": cors_headers,
            "body": json.dumps({"error": "Вы уже проголосовали за эту участницу"}),
        }

    # Записываем голос
    cur.execute(
        f"INSERT INTO {schema}.votes (contestant_id, voter_ip) VALUES (%s, %s)",
        (contestant_id, voter_ip),
    )
    cur.execute(
        f"UPDATE {schema}.contestants SET votes = votes + 1 WHERE id = %s RETURNING votes",
        (contestant_id,),
    )
    new_votes = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()

    return {
        "statusCode": 200,
        "headers": cors_headers,
        "body": json.dumps({"success": True, "votes": new_votes}),
    }
