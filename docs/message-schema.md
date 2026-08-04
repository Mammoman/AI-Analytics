# MetricsSnapshot Message Schema

This document is the single source of truth for the `MetricsSnapshot` JSON payload
exchanged between the backend and frontend. The backend defines this shape via the
dataclasses in `backend/app/schema.py` (see `MetricsSnapshot.to_dict()`), and the
frontend mirrors it with a TypeScript `MetricsSnapshot` interface. Any change to this
shape must be made in both places, and this document updated to match.

All JSON keys use **camelCase**, regardless of the snake_case Python field names used
internally.

## Top-level shape

```json
{
  "timestamp": "2026-08-04T00:00:00Z",
  "kpis": { ... },
  "accuracyTrend": [ ... ],
  "modelUsage": [ ... ],
  "sourceLatencies": [ ... ],
  "recentAlerts": [ ... ],
  "topModels": [ ... ]
}
```

| Field | Type | Description |
|---|---|---|
| `timestamp` | `string` (ISO 8601) | UTC timestamp for when this snapshot was generated, e.g. `"2026-08-04T00:00:00Z"`. |
| `kpis` | `Kpis` object | Headline key performance indicators for the dashboard. |
| `accuracyTrend` | `TrendPoint[]` | Time series of actual vs. predicted accuracy, used to draw the trend chart. |
| `modelUsage` | `ModelUsage[]` | Breakdown of traffic share per model. |
| `sourceLatencies` | `SourceLatency[]` | Per-source latency readings, in milliseconds. |
| `recentAlerts` | `Alert[]` | Recent system/operational alerts, most relevant first. |
| `topModels` | `TopModel[]` | Leaderboard of top-performing models. |

## `Kpis`

| Key | Type | Units | Description |
|---|---|---|---|
| `totalPredictions` | `integer` | count | Total number of predictions served. |
| `modelAccuracy` | `float` | percent (0-100) | Aggregate model accuracy across active models. |
| `dataPoints` | `integer` | count | Total number of data points processed. |
| `activeModels` | `integer` | count | Number of models currently active/serving traffic. |

## `TrendPoint` (element of `accuracyTrend`)

| Key | Type | Units | Description |
|---|---|---|---|
| `t` | `string` | time label, e.g. `"00:00"` | Time label for this point on the trend chart. |
| `actual` | `float` | percent (0-100) | Actual observed accuracy at time `t`. |
| `predicted` | `float` | percent (0-100) | Predicted/forecast accuracy at time `t`. |

## `ModelUsage` (element of `modelUsage`)

| Key | Type | Units | Description |
|---|---|---|---|
| `name` | `string` | — | Model name, e.g. `"Model A"`. |
| `percent` | `float` | percent (0-100) | Share of overall usage attributed to this model. |

## `SourceLatency` (element of `sourceLatencies`)

| Key | Type | Units | Description |
|---|---|---|---|
| `name` | `string` | — | Name of the data/traffic source, e.g. `"Mon"`. |
| `ms` | `integer` | milliseconds | Observed latency for this source. |

## `Alert` (element of `recentAlerts`)

| Key | Type | Units | Description |
|---|---|---|---|
| `level` | `string` | enum: `"Critical"` \| `"Warning"` \| `"Info"` | Severity level of the alert. |
| `message` | `string` | — | Human-readable alert message. |
| `source` | `string` | — | Origin/identifier of the alert source, e.g. `"ALSA-4"`. |
| `value` | `string` | — | Associated value/label for the alert (often mirrors `level`). |

## `TopModel` (element of `topModels`)

| Key | Type | Units | Description |
|---|---|---|---|
| `name` | `string` | — | Model name. |
| `score` | `float` | percent (0-100) | Current performance score. |
| `delta` | `float` | percentage points | Change in score since the previous measurement (can be negative). |
