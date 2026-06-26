#!/usr/bin/env python3
"""
Busrom CDP - Initialize Superset database, datasets, charts and dashboard.

This script is idempotent and designed to run inside the Superset container:

    docker exec -it busrom-superset /app/.venv/bin/python \
        /app/docker/superset/scripts/init_cdp_dashboards.py

It uses the Superset REST API with the local break-glass admin account.
"""

from __future__ import annotations

import json
import os
import sys
import uuid
from typing import Any

import requests

# -----------------------------------------------------------------------------
# Configuration
# -----------------------------------------------------------------------------
BASE_URL = os.environ.get("SUPERSET_BASE_URL", "http://localhost:8088")
ADMIN_USER = os.environ.get("SUPERSET_ADMIN_USER", "admin")
ADMIN_PASS = os.environ.get("SUPERSET_ADMIN_PASSWORD", "admin123")

CDP_DB_NAME = "busrom_cdp"
CDP_SQLALCHEMY_URI = (
    "postgresql+psycopg2://busrom:busrom_dev_password@postgres:5432/busrom_cdp"
)

DATASET_TABLES = ["traffic_summary", "traffic_raw", "visitor_paths", "path_insights"]
VIRTUAL_DATASETS = {
    "cdp_browser_breakdown": (
        "SELECT date, key AS browser, value::int AS count "
        "FROM traffic_summary CROSS JOIN jsonb_each_text(browser_breakdown) "
        "WHERE page_path = 'all' AND channel = 'all'"
    ),
    "cdp_country_breakdown": (
        "SELECT date, key AS country, value::int AS count "
        "FROM traffic_summary CROSS JOIN jsonb_each_text(country_breakdown) "
        "WHERE page_path = 'all' AND channel = 'all'"
    ),
    "cdp_visitor_path_pages": (
        "SELECT date, jsonb_array_elements_text(path_sequence) AS path, COUNT(*) AS path_count "
        "FROM visitor_paths GROUP BY date, path"
    ),
    "cdp_entry_pages": (
        "SELECT date, insight_key, value FROM path_insights WHERE insight_type = 'entry_pages'"
    ),
    "cdp_exit_pages": (
        "SELECT date, insight_key, value FROM path_insights WHERE insight_type = 'exit_pages'"
    ),
}
DASHBOARD_TITLE = "Busrom CDP Overview"
DASHBOARD_SLUG = "busrom-cdp-overview"
GAMMA_ROLE_NAME = "Gamma"


# -----------------------------------------------------------------------------
# Helpers
# -----------------------------------------------------------------------------
def metric_simple(column_name: str, aggregate: str) -> dict[str, Any]:
    label = f"{aggregate}({column_name})"
    return {
        "expressionType": "SIMPLE",
        "column": {"column_name": column_name},
        "aggregate": aggregate,
        "label": label,
    }


def build_query_context(
    *,
    datasource_id: int,
    form_data: dict[str, Any],
    groupby: list[str] | None = None,
    metrics: list[dict[str, Any]] | None = None,
    x_axis: str | None = None,
    granularity: str | None = None,
    row_limit: int = 10000,
    order_desc: bool = True,
    orderby: list[list[Any]] | None = None,
    adhoc_filters: list[dict[str, Any]] | None = None,
) -> dict[str, Any]:
    # Modern ECharts timeseries charts pivot on x_axis; include it in columns
    # so the stored query_context matches what the backend generates.
    columns = (x_axis is not None and [x_axis] or []) + (groupby or [])
    query: dict[str, Any] = {
        "metrics": metrics or [],
        "groupby": groupby or [],
        "row_limit": row_limit,
        "order_desc": order_desc,
        "columns": columns,
        "orderby": orderby or [],
        "adhoc_filters": adhoc_filters or [],
    }
    if x_axis:
        query["x_axis"] = x_axis
    if granularity:
        query["granularity"] = granularity
    if adhoc_filters:
        form_data = {**form_data, "adhoc_filters": adhoc_filters}
    return {
        "datasource": {"id": datasource_id, "type": "table"},
        "queries": [query],
        "form_data": form_data,
    }


def deterministic_uuid(name: str) -> str:
    return str(uuid.uuid5(uuid.NAMESPACE_DNS, f"busrom.cdp.{name}"))


# -----------------------------------------------------------------------------
# Superset API client
# -----------------------------------------------------------------------------
class SupersetClient:
    def __init__(self, base_url: str, username: str, password: str) -> None:
        self.base_url = base_url.rstrip("/")
        self.session = requests.Session()
        self.session.headers["Content-Type"] = "application/json"
        self.token: str | None = None
        self.csrf: str | None = None
        self._login(username, password)

    def _login(self, username: str, password: str) -> None:
        resp = self.session.post(
            f"{self.base_url}/api/v1/security/login",
            json={
                "username": username,
                "password": password,
                "provider": "db",
                "refresh": True,
            },
        )
        resp.raise_for_status()
        self.token = resp.json()["access_token"]
        self.session.headers["Authorization"] = f"Bearer {self.token}"

        csrf_resp = self.session.get(f"{self.base_url}/api/v1/security/csrf_token/")
        csrf_resp.raise_for_status()
        self.csrf = csrf_resp.json()["result"]
        self.session.headers["X-CSRFToken"] = self.csrf

    def get(self, path: str, **kwargs) -> requests.Response:
        return self.session.get(f"{self.base_url}{path}", **kwargs)

    def post(self, path: str, **kwargs) -> requests.Response:
        return self.session.post(f"{self.base_url}{path}", **kwargs)

    def put(self, path: str, **kwargs) -> requests.Response:
        return self.session.put(f"{self.base_url}{path}", **kwargs)

    def get_or_none(self, path: str) -> dict[str, Any] | None:
        resp = self.get(path)
        if resp.status_code == 404:
            return None
        resp.raise_for_status()
        return resp.json().get("result")

    def find_database(self, name: str) -> dict[str, Any] | None:
        resp = self.get("/api/v1/database/", params={"q": json.dumps({"filters": [{"col": "database_name", "opr": "eq", "value": name}]})})
        if resp.status_code != 200:
            return None
        result = resp.json().get("result", [])
        return result[0] if result else None

    def find_dataset(self, table_name: str) -> dict[str, Any] | None:
        # The REST API filter on table_name is not always available; fetch the list.
        resp = self.get("/api/v1/dataset/", params={"q": json.dumps({"page_size": 500})})
        resp.raise_for_status()
        for ds in resp.json().get("result", []):
            if ds.get("table_name") == table_name:
                return ds
        return None

    def find_chart_by_name(self, name: str) -> dict[str, Any] | None:
        resp = self.get("/api/v1/chart/", params={"q": json.dumps({"page_size": 500})})
        resp.raise_for_status()
        for chart in resp.json().get("result", []):
            if chart.get("slice_name") == name:
                return chart
        return None

    def find_dashboard_by_title(self, title: str) -> dict[str, Any] | None:
        resp = self.get("/api/v1/dashboard/", params={"q": json.dumps({"page_size": 500})})
        resp.raise_for_status()
        for dash in resp.json().get("result", []):
            if dash.get("dashboard_title") == title:
                return dash
        return None

    def find_role_by_name(self, name: str) -> dict[str, Any] | None:
        resp = self.get("/api/v1/security/roles/", params={"q": json.dumps({"page_size": 500})})
        resp.raise_for_status()
        for role in resp.json().get("result", []):
            if role.get("name") == name:
                return role
        return None


# -----------------------------------------------------------------------------
# Object creation / update
# -----------------------------------------------------------------------------
def ensure_database(client: SupersetClient) -> int:
    existing = client.find_database(CDP_DB_NAME)
    if existing:
        print(f"[DB] Database '{CDP_DB_NAME}' already exists (id={existing['id']})")
        return existing["id"]

    payload = {
        "database_name": CDP_DB_NAME,
        "sqlalchemy_uri": CDP_SQLALCHEMY_URI,
        "expose_in_sqllab": True,
        "allow_file_upload": True,
        "configuration_method": "sqlalchemy_form",
    }
    resp = client.post("/api/v1/database/", json=payload)
    if not resp.ok:
        print(f"[DB] Failed to create database: {resp.text}", file=sys.stderr)
        sys.exit(1)
    db_id = resp.json()["id"]
    print(f"[DB] Created database '{CDP_DB_NAME}' (id={db_id})")

    # Make sure dataset-level permissions are created.
    sync_resp = client.post(f"/api/v1/database/{db_id}/sync_permissions/")
    if sync_resp.ok:
        print(f"[DB] Synced permissions for database {db_id}")
    return db_id


def ensure_datasets(client: SupersetClient, db_id: int) -> dict[str, int]:
    datasets: dict[str, int] = {}

    # Physical table datasets
    for table_name in DATASET_TABLES:
        existing = client.find_dataset(table_name)
        if existing:
            print(f"[Dataset] '{table_name}' already exists (id={existing['id']})")
            datasets[table_name] = existing["id"]
            continue

        payload = {
            "database": db_id,
            "schema": "public",
            "table_name": table_name,
        }
        resp = client.post("/api/v1/dataset/", json=payload)
        if not resp.ok:
            print(f"[Dataset] Failed to create '{table_name}': {resp.text}", file=sys.stderr)
            sys.exit(1)
        ds_id = resp.json()["id"]
        datasets[table_name] = ds_id
        print(f"[Dataset] Created '{table_name}' (id={ds_id})")

    # Virtual datasets (SQL) for JSONB arrays and nested breakdowns
    for table_name, sql in VIRTUAL_DATASETS.items():
        existing = client.find_dataset(table_name)
        if existing:
            print(f"[Dataset] '{table_name}' already exists (id={existing['id']})")
            datasets[table_name] = existing["id"]
            continue

        payload = {
            "database": db_id,
            "schema": "public",
            "table_name": table_name,
            "sql": sql,
        }
        resp = client.post("/api/v1/dataset/", json=payload)
        if not resp.ok:
            print(f"[Dataset] Failed to create '{table_name}': {resp.text}", file=sys.stderr)
            sys.exit(1)
        ds_id = resp.json()["id"]
        datasets[table_name] = ds_id
        print(f"[Dataset] Created virtual dataset '{table_name}' (id={ds_id})")

    return datasets


def _map_pg_type(udt_name: str, max_len: int | None, data_type: str) -> str:
    """Map a Postgres user-defined type to a Superset column type string."""
    udt = udt_name.lower()
    if udt in ("int2", "int4", "int8"):
        return "INTEGER"
    if udt in ("float4", "float8"):
        return "REAL"
    if udt in ("json", "jsonb"):
        return "JSONB"
    if udt == "bool":
        return "BOOLEAN"
    if udt == "timestamptz":
        return "TIMESTAMP WITH TIME ZONE"
    if udt == "timestamp":
        return "TIMESTAMP WITHOUT TIME ZONE"
    if udt == "varchar":
        return f"VARCHAR({max_len})" if max_len else "VARCHAR"
    if udt == "text":
        return "TEXT"
    if udt == "numeric":
        return "NUMERIC"
    return data_type.upper()


def sync_dataset_columns(client: SupersetClient, dataset_id: int, table_name: str) -> None:
    """Reconcile a physical dataset's column list with the live Postgres schema.

    This is required when the CDP backend adds new columns to existing tables;
    Superset caches the original column list and will report "Columns missing
    in dataset" until the cache is refreshed.
    """
    import psycopg2

    conn = psycopg2.connect(
        host="postgres",
        database=CDP_DB_NAME,
        user="busrom",
        password="busrom_dev_password",
    )
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT column_name, data_type, udt_name, character_maximum_length
                FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = %s
                ORDER BY ordinal_position
                """,
                (table_name,),
            )
            db_columns = {row[0]: row for row in cur.fetchall()}
    finally:
        conn.close()

    ds = client.get_or_none(f"/api/v1/dataset/{dataset_id}")
    if not ds:
        print(f"[Dataset] Cannot sync columns for '{table_name}': not found", file=sys.stderr)
        return

    existing_by_name = {c["column_name"]: c for c in ds.get("columns", [])}
    column_fields = {
        "id", "column_name", "type", "advanced_data_type", "verbose_name",
        "description", "expression", "filterable", "groupby", "is_active",
        "is_dttm", "python_date_format", "extra", "uuid",
    }

    new_columns: list[dict[str, Any]] = []
    for col_name, (_name, data_type, udt_name, max_len) in db_columns.items():
        if col_name in existing_by_name:
            existing = existing_by_name[col_name]
            clean = {k: v for k, v in existing.items() if k in column_fields}
            new_columns.append(clean)
        else:
            new_columns.append({
                "column_name": col_name,
                "type": _map_pg_type(udt_name, max_len, data_type),
                "is_active": True,
                "filterable": True,
                "groupby": True,
                "is_dttm": False,
            })

    owners = [o["id"] for o in ds.get("owners", []) if isinstance(o, dict) and "id" in o]
    payload = {
        "columns": new_columns,
        "metrics": [],
        "owners": owners,
    }
    resp = client.put(f"/api/v1/dataset/{dataset_id}", json=payload)
    if not resp.ok:
        print(f"[Dataset] Failed to sync columns for '{table_name}': {resp.text}", file=sys.stderr)
        return
    print(f"[Dataset] Synced columns for '{table_name}' ({len(new_columns)} columns)")


def ensure_chart(
    client: SupersetClient,
    *,
    name: str,
    dataset_id: int,
    viz_type: str,
    params: dict[str, Any],
    query_context: dict[str, Any],
    dashboards: list[int] | None = None,
) -> dict[str, Any]:
    payload = {
        "slice_name": name,
        "datasource_id": dataset_id,
        "datasource_type": "table",
        "viz_type": viz_type,
        "params": json.dumps(params, ensure_ascii=False),
        "query_context": json.dumps(query_context, ensure_ascii=False),
        "uuid": deterministic_uuid(name),
    }
    if dashboards:
        payload["dashboards"] = dashboards

    existing = client.find_chart_by_name(name)
    if existing:
        chart_id = existing["id"]
        resp = client.put(f"/api/v1/chart/{chart_id}", json=payload)
        if not resp.ok:
            print(f"[Chart] Failed to update '{name}': {resp.text}", file=sys.stderr)
            sys.exit(1)
        print(f"[Chart] Updated '{name}' (id={chart_id})")
        return resp.json()["result"]

    resp = client.post("/api/v1/chart/", json=payload)
    if not resp.ok:
        print(f"[Chart] Failed to create '{name}': {resp.text}", file=sys.stderr)
        sys.exit(1)
    result = resp.json()["result"]
    print(f"[Chart] Created '{name}' (id={result.get('id')})")
    return result


def build_dashboard_position_json(charts: list[dict[str, Any]], columns: int = 3) -> dict[str, Any]:
    position: dict[str, Any] = {
        "DASHBOARD_VERSION_KEY": "v2",
        "ROOT_ID": {"type": "ROOT", "id": "ROOT_ID", "children": ["GRID_ID"]},
        "GRID_ID": {
            "type": "GRID",
            "id": "GRID_ID",
            "children": [],
            "parents": ["ROOT_ID"],
        },
        "HEADER_ID": {"type": "HEADER", "id": "HEADER_ID", "meta": {"text": DASHBOARD_TITLE}},
    }

    width = 12 // columns
    row_index = 0
    i = 0
    while i < len(charts):
        group = charts[i : i + columns]
        row_id = f"ROW-{row_index}"
        row_children: list[str] = []
        position[row_id] = {
            "type": "ROW",
            "id": row_id,
            "children": row_children,
            "parents": ["ROOT_ID", "GRID_ID"],
            "meta": {"background": "BACKGROUND_TRANSPARENT"},
        }
        position["GRID_ID"]["children"].append(row_id)

        for chart in group:
            chart_component_id = f"CHART-{chart['uuid']}"
            row_children.append(chart_component_id)
            position[chart_component_id] = {
                "type": "CHART",
                "id": chart_component_id,
                "parents": ["ROOT_ID", "GRID_ID", row_id],
                "meta": {
                    "chartId": chart["id"],
                    "uuid": chart["uuid"],
                    "sliceName": chart["slice_name"],
                    "width": width,
                    "height": 50,
                },
            }
        i += columns
        row_index += 1

    return position


def ensure_dashboard(
    client: SupersetClient,
    charts: list[dict[str, Any]],
    gamma_role_id: int,
    owner_id: int,
) -> int:
    position = build_dashboard_position_json(charts, columns=3)
    chart_uuids = [c["uuid"] for c in charts]
    json_metadata = {
        "chart_configuration": {
            chart_uuid: {
                "id": chart_uuid,
                "crossFilters": {"chartsInScope": [], "scope": "global"},
            }
            for chart_uuid in chart_uuids
        },
        "global_chart_configuration": {
            "scope": {"rootPath": ["ROOT_ID"], "excluded": []},
            "chartsInScope": chart_uuids,
        },
        "default_filters": "{}",
    }

    payload = {
        "dashboard_title": DASHBOARD_TITLE,
        "slug": DASHBOARD_SLUG,
        "published": True,
        "roles": [gamma_role_id],
        "owners": [owner_id],
        "position_json": json.dumps(position, ensure_ascii=False),
        "json_metadata": json.dumps(json_metadata, ensure_ascii=False),
    }

    existing = client.find_dashboard_by_title(DASHBOARD_TITLE)
    if existing:
        dash_id = existing["id"]
        resp = client.put(f"/api/v1/dashboard/{dash_id}", json=payload)
        if not resp.ok:
            print(f"[Dashboard] Failed to update dashboard: {resp.text}", file=sys.stderr)
            sys.exit(1)
        print(f"[Dashboard] Updated '{DASHBOARD_TITLE}' (id={dash_id})")
        return dash_id

    resp = client.post("/api/v1/dashboard/", json=payload)
    if not resp.ok:
        print(f"[Dashboard] Failed to create dashboard: {resp.text}", file=sys.stderr)
        sys.exit(1)
    dash_id = resp.json()["id"]
    print(f"[Dashboard] Created '{DASHBOARD_TITLE}' (id={dash_id})")
    return dash_id


def grant_dataset_access_to_gamma(client: SupersetClient, gamma_role_id: int) -> None:
    """Grant Gamma role datasource_access on all CDP datasets."""
    import psycopg2

    # Parse the DB URI used by Superset metadata (same as CDP DB in local env).
    # We connect directly to Postgres to look up the dynamic permission view IDs.
    conn = psycopg2.connect(
        host="postgres",
        database=CDP_DB_NAME,
        user="busrom",
        password="busrom_dev_password",
    )
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT pv.id
                FROM ab_permission_view pv
                JOIN ab_permission p ON p.id = pv.permission_id
                JOIN ab_view_menu vm ON vm.id = pv.view_menu_id
                WHERE p.name = 'datasource_access'
                  AND vm.name LIKE '[%].[%](id:%)'
                  AND vm.name LIKE '%%busrom_cdp%%'
                """
            )
            pv_ids = {row[0] for row in cur.fetchall()}
    finally:
        conn.close()

    if not pv_ids:
        print("[Permissions] No CDP datasource_access permissions found; skipping.")
        return

    # Current permissions assigned to Gamma.
    resp = client.get(f"/api/v1/security/roles/{gamma_role_id}/permissions/")
    resp.raise_for_status()
    current_ids = {item["id"] for item in resp.json().get("result", [])}

    missing = list(pv_ids - current_ids)
    if not missing:
        print("[Permissions] Gamma already has access to all CDP datasets.")
        return

    add_resp = client.post(
        f"/api/v1/security/roles/{gamma_role_id}/permissions",
        json={"permission_view_menu_ids": missing},
    )
    if not add_resp.ok:
        print(f"[Permissions] Failed to grant access: {add_resp.text}", file=sys.stderr)
        sys.exit(1)
    print(f"[Permissions] Granted Gamma access to {len(missing)} CDP dataset permission(s).")


# -----------------------------------------------------------------------------
# Main
# -----------------------------------------------------------------------------
def main() -> None:
    client = SupersetClient(BASE_URL, ADMIN_USER, ADMIN_PASS)

    # Resolve Gamma role and admin user.
    gamma = client.find_role_by_name(GAMMA_ROLE_NAME)
    if not gamma:
        print(f"[Error] Role '{GAMMA_ROLE_NAME}' not found", file=sys.stderr)
        sys.exit(1)
    gamma_role_id = gamma["id"]

    me = client.get("/api/v1/me/").json().get("result", {})
    owner_id = me.get("id", 1)

    # 1. Database
    db_id = ensure_database(client)

    # 2. Datasets
    datasets = ensure_datasets(client, db_id)
    ds_summary = datasets["traffic_summary"]
    ds_raw = datasets["traffic_raw"]
    ds_path_insights = datasets["path_insights"]
    ds_browser_breakdown = datasets["cdp_browser_breakdown"]
    ds_country_breakdown = datasets["cdp_country_breakdown"]
    ds_visitor_path_pages = datasets["cdp_visitor_path_pages"]
    ds_entry_pages = datasets["cdp_entry_pages"]
    ds_exit_pages = datasets["cdp_exit_pages"]

    # 2a. Refresh physical dataset columns so new backend columns are usable.
    for table_name in DATASET_TABLES:
        sync_dataset_columns(client, datasets[table_name], table_name)

    # 3. Charts
    # Use the ECharts-based viz_type keys registered by Superset 6.x.
    pv_metric = metric_simple("pv", "SUM")
    uv_metric = metric_simple("uv", "SUM")
    sessions_metric = metric_simple("sessions", "SUM")
    bounce_metric = metric_simple("bounce_rate", "AVG")
    avg_duration_metric = metric_simple("avg_duration", "AVG")
    form_submissions_metric = metric_simple("form_submissions", "SUM")
    form_conversion_rate_metric = metric_simple("form_conversion_rate", "AVG")
    leads_metric = metric_simple("leads", "SUM")
    id_metric = metric_simple("id", "COUNT")
    value_metric = metric_simple("value", "SUM")
    count_metric = metric_simple("count", "SUM")
    path_count_metric = metric_simple("path_count", "SUM")
    leads_change_day_metric = metric_simple("leads_change_day", "AVG")
    leads_change_week_metric = metric_simple("leads_change_week", "AVG")
    leads_change_month_metric = metric_simple("leads_change_month", "AVG")

    chart_defs: list[dict[str, Any]] = [
        # ------------------------------------------------------------------
        # Traffic overview (trends)
        # ------------------------------------------------------------------
        {
            "name": "PV 趋势",
            "dataset_id": ds_summary,
            "viz_type": "echarts_timeseries_line",
            "params": {
                "datasource": f"{ds_summary}__table",
                "viz_type": "echarts_timeseries_line",
                "x_axis": "date",
                "time_grain_sqla": "P1D",
                "metrics": [pv_metric],
                "groupby": [],
                "adhoc_filters": [],
                "row_limit": 10000,
                "order_desc": True,
            },
            "query_context": build_query_context(
                datasource_id=ds_summary,
                form_data={
                    "datasource": f"{ds_summary}__table",
                    "viz_type": "echarts_timeseries_line",
                    "x_axis": "date",
                    "time_grain_sqla": "P1D",
                    "metrics": [pv_metric],
                    "groupby": [],
                    "adhoc_filters": [],
                    "row_limit": 10000,
                },
                x_axis="date",
                groupby=[],
                metrics=[pv_metric],
                granularity="P1D",
            ),
        },
        {
            "name": "UV 趋势",
            "dataset_id": ds_summary,
            "viz_type": "echarts_timeseries_line",
            "params": {
                "datasource": f"{ds_summary}__table",
                "viz_type": "echarts_timeseries_line",
                "x_axis": "date",
                "time_grain_sqla": "P1D",
                "metrics": [uv_metric],
                "groupby": [],
                "adhoc_filters": [],
                "row_limit": 10000,
                "order_desc": True,
            },
            "query_context": build_query_context(
                datasource_id=ds_summary,
                form_data={
                    "datasource": f"{ds_summary}__table",
                    "viz_type": "echarts_timeseries_line",
                    "x_axis": "date",
                    "time_grain_sqla": "P1D",
                    "metrics": [uv_metric],
                    "groupby": [],
                    "adhoc_filters": [],
                    "row_limit": 10000,
                },
                x_axis="date",
                groupby=[],
                metrics=[uv_metric],
                granularity="P1D",
            ),
        },
        {
            "name": "PV / Sessions 趋势",
            "dataset_id": ds_summary,
            "viz_type": "echarts_timeseries_line",
            "params": {
                "datasource": f"{ds_summary}__table",
                "viz_type": "echarts_timeseries_line",
                "x_axis": "date",
                "time_grain_sqla": "P1D",
                "metrics": [pv_metric, sessions_metric],
                "groupby": [],
                "adhoc_filters": [],
                "row_limit": 10000,
                "order_desc": True,
            },
            "query_context": build_query_context(
                datasource_id=ds_summary,
                form_data={
                    "datasource": f"{ds_summary}__table",
                    "viz_type": "echarts_timeseries_line",
                    "x_axis": "date",
                    "time_grain_sqla": "P1D",
                    "metrics": [pv_metric, sessions_metric],
                    "groupby": [],
                    "adhoc_filters": [],
                    "row_limit": 10000,
                },
                x_axis="date",
                groupby=[],
                metrics=[pv_metric, sessions_metric],
                granularity="P1D",
            ),
        },
        {
            "name": "平均访问时长趋势",
            "dataset_id": ds_summary,
            "viz_type": "echarts_timeseries_line",
            "params": {
                "datasource": f"{ds_summary}__table",
                "viz_type": "echarts_timeseries_line",
                "x_axis": "date",
                "time_grain_sqla": "P1D",
                "metrics": [avg_duration_metric],
                "groupby": [],
                "adhoc_filters": [],
                "row_limit": 10000,
                "order_desc": True,
            },
            "query_context": build_query_context(
                datasource_id=ds_summary,
                form_data={
                    "datasource": f"{ds_summary}__table",
                    "viz_type": "echarts_timeseries_line",
                    "x_axis": "date",
                    "time_grain_sqla": "P1D",
                    "metrics": [avg_duration_metric],
                    "groupby": [],
                    "adhoc_filters": [],
                    "row_limit": 10000,
                },
                x_axis="date",
                groupby=[],
                metrics=[avg_duration_metric],
                granularity="P1D",
            ),
        },
        {
            "name": "跳出率趋势",
            "dataset_id": ds_summary,
            "viz_type": "echarts_timeseries_line",
            "params": {
                "datasource": f"{ds_summary}__table",
                "viz_type": "echarts_timeseries_line",
                "x_axis": "date",
                "time_grain_sqla": "P1D",
                "metrics": [bounce_metric],
                "groupby": [],
                "adhoc_filters": [],
                "row_limit": 10000,
            },
            "query_context": build_query_context(
                datasource_id=ds_summary,
                form_data={
                    "datasource": f"{ds_summary}__table",
                    "viz_type": "echarts_timeseries_line",
                    "x_axis": "date",
                    "time_grain_sqla": "P1D",
                    "metrics": [bounce_metric],
                    "groupby": [],
                    "adhoc_filters": [],
                    "row_limit": 10000,
                },
                x_axis="date",
                groupby=[],
                metrics=[bounce_metric],
                granularity="P1D",
            ),
        },
        # ------------------------------------------------------------------
        # Conversion & leads
        # ------------------------------------------------------------------
        {
            "name": "表单提交次数",
            "dataset_id": ds_summary,
            "viz_type": "echarts_timeseries_bar",
            "params": {
                "datasource": f"{ds_summary}__table",
                "viz_type": "echarts_timeseries_bar",
                "x_axis": "date",
                "time_grain_sqla": "P1D",
                "metrics": [form_submissions_metric],
                "groupby": [],
                "adhoc_filters": [],
                "row_limit": 10000,
                "order_desc": True,
            },
            "query_context": build_query_context(
                datasource_id=ds_summary,
                form_data={
                    "datasource": f"{ds_summary}__table",
                    "viz_type": "echarts_timeseries_bar",
                    "x_axis": "date",
                    "time_grain_sqla": "P1D",
                    "metrics": [form_submissions_metric],
                    "groupby": [],
                    "adhoc_filters": [],
                    "row_limit": 10000,
                },
                x_axis="date",
                groupby=[],
                metrics=[form_submissions_metric],
                granularity="P1D",
            ),
        },
        {
            "name": "表单转化率",
            "dataset_id": ds_summary,
            "viz_type": "echarts_timeseries_line",
            "params": {
                "datasource": f"{ds_summary}__table",
                "viz_type": "echarts_timeseries_line",
                "x_axis": "date",
                "time_grain_sqla": "P1D",
                "metrics": [form_conversion_rate_metric],
                "groupby": [],
                "adhoc_filters": [],
                "row_limit": 10000,
            },
            "query_context": build_query_context(
                datasource_id=ds_summary,
                form_data={
                    "datasource": f"{ds_summary}__table",
                    "viz_type": "echarts_timeseries_line",
                    "x_axis": "date",
                    "time_grain_sqla": "P1D",
                    "metrics": [form_conversion_rate_metric],
                    "groupby": [],
                    "adhoc_filters": [],
                    "row_limit": 10000,
                },
                x_axis="date",
                groupby=[],
                metrics=[form_conversion_rate_metric],
                granularity="P1D",
            ),
        },
        {
            "name": "线索数 (Leads)",
            "dataset_id": ds_summary,
            "viz_type": "echarts_timeseries_bar",
            "params": {
                "datasource": f"{ds_summary}__table",
                "viz_type": "echarts_timeseries_bar",
                "x_axis": "date",
                "time_grain_sqla": "P1D",
                "metrics": [leads_metric],
                "groupby": [],
                "adhoc_filters": [],
                "row_limit": 10000,
                "order_desc": True,
            },
            "query_context": build_query_context(
                datasource_id=ds_summary,
                form_data={
                    "datasource": f"{ds_summary}__table",
                    "viz_type": "echarts_timeseries_bar",
                    "x_axis": "date",
                    "time_grain_sqla": "P1D",
                    "metrics": [leads_metric],
                    "groupby": [],
                    "adhoc_filters": [],
                    "row_limit": 10000,
                },
                x_axis="date",
                groupby=[],
                metrics=[leads_metric],
                granularity="P1D",
            ),
        },
        {
            "name": "Leads 日环比",
            "dataset_id": ds_summary,
            "viz_type": "big_number_total",
            "params": {
                "datasource": f"{ds_summary}__table",
                "viz_type": "big_number_total",
                "metric": leads_change_day_metric,
                "metrics": [leads_change_day_metric],
                "adhoc_filters": [],
                "subheader": "Leads 日环比 (%)",
                "row_limit": 10000,
            },
            "query_context": build_query_context(
                datasource_id=ds_summary,
                form_data={
                    "datasource": f"{ds_summary}__table",
                    "viz_type": "big_number_total",
                    "metric": leads_change_day_metric,
                    "metrics": [leads_change_day_metric],
                    "adhoc_filters": [],
                    "subheader": "Leads 日环比 (%)",
                    "row_limit": 10000,
                },
                metrics=[leads_change_day_metric],
                row_limit=10000,
            ),
        },
        {
            "name": "Leads 周环比",
            "dataset_id": ds_summary,
            "viz_type": "big_number_total",
            "params": {
                "datasource": f"{ds_summary}__table",
                "viz_type": "big_number_total",
                "metric": leads_change_week_metric,
                "metrics": [leads_change_week_metric],
                "adhoc_filters": [],
                "subheader": "Leads 周环比 (%)",
                "row_limit": 10000,
            },
            "query_context": build_query_context(
                datasource_id=ds_summary,
                form_data={
                    "datasource": f"{ds_summary}__table",
                    "viz_type": "big_number_total",
                    "metric": leads_change_week_metric,
                    "metrics": [leads_change_week_metric],
                    "adhoc_filters": [],
                    "subheader": "Leads 周环比 (%)",
                    "row_limit": 10000,
                },
                metrics=[leads_change_week_metric],
                row_limit=10000,
            ),
        },
        {
            "name": "Leads 月环比",
            "dataset_id": ds_summary,
            "viz_type": "big_number_total",
            "params": {
                "datasource": f"{ds_summary}__table",
                "viz_type": "big_number_total",
                "metric": leads_change_month_metric,
                "metrics": [leads_change_month_metric],
                "adhoc_filters": [],
                "subheader": "Leads 月环比 (%)",
                "row_limit": 10000,
            },
            "query_context": build_query_context(
                datasource_id=ds_summary,
                form_data={
                    "datasource": f"{ds_summary}__table",
                    "viz_type": "big_number_total",
                    "metric": leads_change_month_metric,
                    "metrics": [leads_change_month_metric],
                    "adhoc_filters": [],
                    "subheader": "Leads 月环比 (%)",
                    "row_limit": 10000,
                },
                metrics=[leads_change_month_metric],
                row_limit=10000,
            ),
        },
        # ------------------------------------------------------------------
        # Breakdowns by channel, page, path
        # ------------------------------------------------------------------
        {
            "name": "渠道分布",
            "dataset_id": ds_summary,
            "viz_type": "pie",
            "params": {
                "datasource": f"{ds_summary}__table",
                "viz_type": "pie",
                "groupby": ["channel"],
                "metric": sessions_metric,
                "metrics": [sessions_metric],
                "adhoc_filters": [],
                "row_limit": 100,
            },
            "query_context": build_query_context(
                datasource_id=ds_summary,
                form_data={
                    "datasource": f"{ds_summary}__table",
                    "viz_type": "pie",
                    "groupby": ["channel"],
                    "metric": sessions_metric,
                    "metrics": [sessions_metric],
                    "adhoc_filters": [],
                    "row_limit": 100,
                },
                groupby=["channel"],
                metrics=[sessions_metric],
                row_limit=100,
            ),
        },
        {
            "name": "渠道跳出率",
            "dataset_id": ds_summary,
            "viz_type": "echarts_timeseries_bar",
            "params": {
                "datasource": f"{ds_summary}__table",
                "viz_type": "echarts_timeseries_bar",
                "x_axis": "channel",
                "metrics": [bounce_metric],
                "groupby": [],
                "adhoc_filters": [],
                "row_limit": 100,
                "order_desc": True,
            },
            "query_context": build_query_context(
                datasource_id=ds_summary,
                form_data={
                    "datasource": f"{ds_summary}__table",
                    "viz_type": "echarts_timeseries_bar",
                    "x_axis": "channel",
                    "metrics": [bounce_metric],
                    "groupby": [],
                    "adhoc_filters": [],
                    "row_limit": 100,
                    "order_desc": True,
                },
                x_axis="channel",
                groupby=[],
                metrics=[bounce_metric],
                row_limit=100,
                orderby=[[bounce_metric, False]],
            ),
        },
        {
            "name": "Top Pages",
            "dataset_id": ds_summary,
            "viz_type": "echarts_timeseries_bar",
            "params": {
                "datasource": f"{ds_summary}__table",
                "viz_type": "echarts_timeseries_bar",
                "x_axis": "page_path",
                "metrics": [pv_metric],
                "groupby": [],
                "adhoc_filters": [],
                "row_limit": 10,
                "order_desc": True,
            },
            "query_context": build_query_context(
                datasource_id=ds_summary,
                form_data={
                    "datasource": f"{ds_summary}__table",
                    "viz_type": "echarts_timeseries_bar",
                    "x_axis": "page_path",
                    "metrics": [pv_metric],
                    "groupby": [],
                    "adhoc_filters": [],
                    "row_limit": 10,
                    "order_desc": True,
                },
                x_axis="page_path",
                groupby=[],
                metrics=[pv_metric],
                row_limit=10,
                orderby=[[pv_metric, False]],
            ),
        },
        {
            "name": "入口页 Top 10",
            "dataset_id": ds_entry_pages,
            "viz_type": "echarts_timeseries_bar",
            "params": {
                "datasource": f"{ds_entry_pages}__table",
                "viz_type": "echarts_timeseries_bar",
                "x_axis": "insight_key",
                "metrics": [value_metric],
                "groupby": [],
                "adhoc_filters": [],
                "row_limit": 10,
                "order_desc": True,
            },
            "query_context": build_query_context(
                datasource_id=ds_entry_pages,
                form_data={
                    "datasource": f"{ds_entry_pages}__table",
                    "viz_type": "echarts_timeseries_bar",
                    "x_axis": "insight_key",
                    "metrics": [value_metric],
                    "groupby": [],
                    "adhoc_filters": [],
                    "row_limit": 10,
                    "order_desc": True,
                },
                x_axis="insight_key",
                groupby=[],
                metrics=[value_metric],
                row_limit=10,
                orderby=[[value_metric, False]],
            ),
        },
        {
            "name": "退出页 Top 10",
            "dataset_id": ds_exit_pages,
            "viz_type": "echarts_timeseries_bar",
            "params": {
                "datasource": f"{ds_exit_pages}__table",
                "viz_type": "echarts_timeseries_bar",
                "x_axis": "insight_key",
                "metrics": [value_metric],
                "groupby": [],
                "adhoc_filters": [],
                "row_limit": 10,
                "order_desc": True,
            },
            "query_context": build_query_context(
                datasource_id=ds_exit_pages,
                form_data={
                    "datasource": f"{ds_exit_pages}__table",
                    "viz_type": "echarts_timeseries_bar",
                    "x_axis": "insight_key",
                    "metrics": [value_metric],
                    "groupby": [],
                    "adhoc_filters": [],
                    "row_limit": 10,
                    "order_desc": True,
                },
                x_axis="insight_key",
                groupby=[],
                metrics=[value_metric],
                row_limit=10,
                orderby=[[value_metric, False]],
            ),
        },
        {
            "name": "热门访问路径",
            "dataset_id": ds_visitor_path_pages,
            "viz_type": "echarts_timeseries_bar",
            "params": {
                "datasource": f"{ds_visitor_path_pages}__table",
                "viz_type": "echarts_timeseries_bar",
                "x_axis": "path",
                "metrics": [path_count_metric],
                "groupby": [],
                "adhoc_filters": [],
                "row_limit": 10,
                "order_desc": True,
            },
            "query_context": build_query_context(
                datasource_id=ds_visitor_path_pages,
                form_data={
                    "datasource": f"{ds_visitor_path_pages}__table",
                    "viz_type": "echarts_timeseries_bar",
                    "x_axis": "path",
                    "metrics": [path_count_metric],
                    "groupby": [],
                    "adhoc_filters": [],
                    "row_limit": 10,
                    "order_desc": True,
                },
                x_axis="path",
                groupby=[],
                metrics=[path_count_metric],
                row_limit=10,
                orderby=[[path_count_metric, False]],
            ),
        },
        # ------------------------------------------------------------------
        # Device / browser / country
        # ------------------------------------------------------------------
        {
            "name": "设备分布",
            "dataset_id": ds_raw,
            "viz_type": "pie",
            "params": {
                "datasource": f"{ds_raw}__table",
                "viz_type": "pie",
                "groupby": ["device_type"],
                "metric": id_metric,
                "metrics": [id_metric],
                "adhoc_filters": [],
                "row_limit": 100,
            },
            "query_context": build_query_context(
                datasource_id=ds_raw,
                form_data={
                    "datasource": f"{ds_raw}__table",
                    "viz_type": "pie",
                    "groupby": ["device_type"],
                    "metric": id_metric,
                    "metrics": [id_metric],
                    "adhoc_filters": [],
                    "row_limit": 100,
                },
                groupby=["device_type"],
                metrics=[id_metric],
                row_limit=100,
            ),
        },
        {
            "name": "浏览器分布",
            "dataset_id": ds_browser_breakdown,
            "viz_type": "echarts_pie",
            "params": {
                "datasource": f"{ds_browser_breakdown}__table",
                "viz_type": "echarts_pie",
                "groupby": ["browser"],
                "metric": count_metric,
                "metrics": [count_metric],
                "adhoc_filters": [],
                "row_limit": 100,
            },
            "query_context": build_query_context(
                datasource_id=ds_browser_breakdown,
                form_data={
                    "datasource": f"{ds_browser_breakdown}__table",
                    "viz_type": "echarts_pie",
                    "groupby": ["browser"],
                    "metric": count_metric,
                    "metrics": [count_metric],
                    "adhoc_filters": [],
                    "row_limit": 100,
                },
                groupby=["browser"],
                metrics=[count_metric],
                row_limit=100,
            ),
        },
        {
            "name": "国家分布",
            "dataset_id": ds_country_breakdown,
            "viz_type": "table",
            "params": {
                "datasource": f"{ds_country_breakdown}__table",
                "viz_type": "table",
                "groupby": ["country"],
                "metrics": [count_metric],
                "adhoc_filters": [],
                "row_limit": 100,
                "order_desc": True,
            },
            "query_context": build_query_context(
                datasource_id=ds_country_breakdown,
                form_data={
                    "datasource": f"{ds_country_breakdown}__table",
                    "viz_type": "table",
                    "groupby": ["country"],
                    "metrics": [count_metric],
                    "adhoc_filters": [],
                    "row_limit": 100,
                    "order_desc": True,
                },
                groupby=["country"],
                metrics=[count_metric],
                row_limit=100,
                orderby=[[count_metric, False]],
            ),
        },
    ]

    charts: list[dict[str, Any]] = []
    for chart_def in chart_defs:
        chart = ensure_chart(client, **chart_def)
        # ensure_chart returns the result dict which does not always include id/uuid.
        # Fetch fresh to get a complete record for the dashboard layout.
        fresh = client.find_chart_by_name(chart_def["name"])
        if not fresh:
            print(f"[Error] Could not retrieve chart '{chart_def['name']}'", file=sys.stderr)
            sys.exit(1)
        charts.append(fresh)

    # 4. Dashboard
    dash_id = ensure_dashboard(client, charts, gamma_role_id, owner_id)

    # 4a. Link every chart to the dashboard.  Superset uses this many-to-many
    # association to load chart definitions when rendering a dashboard; without
    # it each tile shows "There is no chart definition associated with this
    # component..." even though the chart records exist.
    for chart in charts:
        link_resp = client.put(
            f"/api/v1/chart/{chart['id']}",
            json={"dashboards": [dash_id]},
        )
        if not link_resp.ok:
            print(
                f"[Dashboard] Failed to link chart '{chart['slice_name']}': "
                f"{link_resp.text}",
                file=sys.stderr,
            )
            sys.exit(1)
        print(
            f"[Dashboard] Linked chart '{chart['slice_name']}' (id={chart['id']}) "
            f"to dashboard {dash_id}"
        )

    # 5. Permissions
    grant_dataset_access_to_gamma(client, gamma_role_id)

    print("\n✅ Busrom CDP dashboards initialized successfully.")
    print(f"   Dashboard URL: {BASE_URL}/superset/dashboard/{DASHBOARD_SLUG}/")
    print(f"   Dashboard ID:  {dash_id}")


if __name__ == "__main__":
    main()
