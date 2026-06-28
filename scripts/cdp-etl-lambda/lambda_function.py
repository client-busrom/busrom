import json
import os
import urllib.request
import urllib.error
from datetime import datetime, timedelta, timezone
import boto3

SECRET_ARN = os.environ.get('ETL_API_KEY_SECRET_ARN', 'arn:aws:secretsmanager:us-east-1:660753258365:secret:busrom/production/CDP_ETL_API_KEY')
CDP_ENDPOINT = os.environ.get('CDP_ENDPOINT', 'https://cdp.busromhouse.com/api/analytics/summary')
TIMEZONE = os.environ.get('ETL_TIMEZONE', 'Asia/Shanghai')


def get_etl_api_key():
    client = boto3.client('secretsmanager', region_name='us-east-1')
    response = client.get_secret_value(SecretId=SECRET_ARN)
    return response['SecretString']


def get_target_date():
    # Run for "yesterday" in the configured timezone so the day's data is complete
    tz = timezone.utc
    if TIMEZONE != 'UTC':
        from zoneinfo import ZoneInfo
        tz = ZoneInfo(TIMEZONE)
    now = datetime.now(tz)
    yesterday = now - timedelta(days=1)
    return yesterday.strftime('%Y-%m-%d')


def lambda_handler(event, context):
    date = event.get('date') if isinstance(event, dict) else None
    if not date:
        date = get_target_date()

    api_key = get_etl_api_key()
    url = f"{CDP_ENDPOINT}?action=run-etl&date={date}"

    req = urllib.request.Request(
        url,
        method='POST',
        headers={
            'x-etl-api-key': api_key,
            'Content-Type': 'application/json',
        },
        data=b'{}',
    )

    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            body = resp.read().decode('utf-8')
            status = resp.status
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8')
        status = e.code
        raise RuntimeError(f"ETL request failed: HTTP {status} {body}")

    result = json.loads(body)
    print(json.dumps({"date": date, "status": status, "result": result}))
    return {
        "statusCode": status,
        "body": json.dumps({"date": date, "result": result}),
    }
