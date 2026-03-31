"""
Возвращает список участниц конкурса МИСС И МИССИС интернет Забайкальский край.
"""
import json
import os
import psycopg2


def handler(event: dict, context) -> dict:
    cors_headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors_headers, "body": ""}

    schema = os.environ["MAIN_DB_SCHEMA"]
    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    cur = conn.cursor()

    cur.execute(f"""
        SELECT id, full_name, age, city, occupation, about,
               photo1_url, photo2_url, photo3_url, nomination, votes
        FROM {schema}.contestants
        ORDER BY votes DESC, id ASC
    """)

    rows = cur.fetchall()
    cur.close()
    conn.close()

    contestants = []
    for row in rows:
        contestants.append({
            "id": row[0],
            "full_name": row[1],
            "age": row[2],
            "city": row[3],
            "occupation": row[4],
            "about": row[5],
            "photo1_url": row[6],
            "photo2_url": row[7],
            "photo3_url": row[8],
            "nomination": row[9],
            "votes": row[10],
        })

    return {
        "statusCode": 200,
        "headers": cors_headers,
        "body": json.dumps({"contestants": contestants}),
    }
