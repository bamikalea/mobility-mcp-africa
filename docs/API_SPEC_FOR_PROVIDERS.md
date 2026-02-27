# API Specification for Ride-Hailing Providers

This document specifies the REST API endpoints a ride-hailing provider needs to build for MCP integration. By implementing these endpoints, your service becomes accessible to any AI travel agent (ChatGPT, Claude, Gemini, etc.).

## Technical Requirements

- **Protocol**: RESTful HTTP/HTTPS
- **Data Format**: JSON
- **Authentication**: API key in header (`Authorization: Bearer <api_key>`)
- **HTTPS**: Required for production

## Required Endpoints

### 1. GET /rides/estimate

Get fare estimates and available ride types for a route.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| pickup_lat | float | Yes | Pickup latitude |
| pickup_lng | float | Yes | Pickup longitude |
| dropoff_lat | float | Yes | Dropoff latitude |
| dropoff_lng | float | Yes | Dropoff longitude |
| ride_type | string | No | Filter: "economy", "comfort", "premium". Default: all |
| passenger_count | int | No | Number of passengers. Default: 1 |

**Response:**

```json
{
  "status": "success",
  "data": {
    "rides": [
      {
        "ride_type": "economy",
        "vehicle_description": "Toyota Corolla or similar",
        "estimated_fare": {
          "amount": 4500,
          "currency": "NGN",
          "min_amount": 4000,
          "max_amount": 5200
        },
        "surge": {
          "is_active": false,
          "multiplier": 1.0
        },
        "eta_minutes": 8,
        "estimated_duration_minutes": 35,
        "estimated_distance_km": 18.5,
        "max_passengers": 4,
        "features": ["air_conditioning", "card_payment"]
      }
    ],
    "pickup_address": "Resolved pickup address",
    "dropoff_address": "Resolved dropoff address",
    "generated_at": "2026-02-27T10:30:00Z"
  }
}
```

### 2. POST /rides/book

Create a ride booking.

**Request Body:**

```json
{
  "pickup_lat": 6.5777,
  "pickup_lng": 3.3213,
  "dropoff_lat": 6.4281,
  "dropoff_lng": 3.4219,
  "ride_type": "economy",
  "passenger": {
    "name": "Passenger Name",
    "phone": "+2348012345678"
  },
  "payment_method": "cash",
  "notes": "Optional driver instructions",
  "scheduled_time": null
}
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "ride_id": "UNIQUE-RIDE-ID",
    "status": "driver_assigned",
    "driver": {
      "id": "DRV-ID",
      "name": "Driver Name",
      "phone": "+234...",
      "rating": 4.7,
      "total_trips": 2340,
      "vehicle": {
        "make": "Toyota",
        "model": "Corolla",
        "year": 2020,
        "color": "Silver",
        "plate_number": "LAG-234-XY"
      }
    },
    "fare": {
      "amount": 4500,
      "currency": "NGN"
    },
    "eta_minutes": 8,
    "pickup_address": "Resolved address",
    "dropoff_address": "Resolved address",
    "created_at": "2026-02-27T10:30:00Z"
  }
}
```

### 3. GET /rides/{ride_id}/status

Get real-time ride status.

**Response:**

```json
{
  "status": "success",
  "data": {
    "ride_id": "RIDE-ID",
    "ride_status": "en_route_to_pickup",
    "driver": {
      "current_location": {
        "latitude": 6.59,
        "longitude": 3.33
      },
      "eta_to_pickup_minutes": 5
    },
    "updated_at": "2026-02-27T10:32:00Z"
  }
}
```

**Ride status values:**

| Status | Description |
|--------|-------------|
| `searching` | Looking for a driver |
| `driver_assigned` | Driver matched |
| `en_route_to_pickup` | Driver heading to pickup |
| `arrived_at_pickup` | Driver arrived at pickup |
| `trip_in_progress` | Passenger picked up, en route |
| `completed` | Trip finished |
| `cancelled` | Trip cancelled |
| `no_drivers` | No drivers available |

### 4. POST /rides/{ride_id}/cancel

Cancel a ride.

**Request:** `{ "reason": "plans_changed" }`

**Response:**

```json
{
  "status": "success",
  "data": {
    "ride_id": "RIDE-ID",
    "ride_status": "cancelled",
    "cancellation_fee": { "amount": 0, "currency": "NGN" },
    "cancelled_at": "2026-02-27T10:31:00Z"
  }
}
```

### 5. GET /ride-types

Get available ride types per city.

**Query:** `city=lagos` (optional)

### 6. GET /geocode

Convert place names to coordinates.

**Query:** `query=Eko Hotel&city=lagos`

## Error Format

```json
{
  "status": "error",
  "error": {
    "code": "NO_DRIVERS_AVAILABLE",
    "message": "Human-readable error message"
  }
}
```

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_COORDINATES` | 400 | Coordinates outside service area |
| `NO_DRIVERS_AVAILABLE` | 404 | No drivers in the area |
| `RIDE_NOT_FOUND` | 404 | Ride ID doesn't exist |
| `RIDE_ALREADY_CANCELLED` | 409 | Already cancelled |
| `PAYMENT_FAILED` | 402 | Payment failed |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `UNAUTHORIZED` | 401 | Invalid API key |

## Authentication

API key sent in the `Authorization` header:

```
Authorization: Bearer your_api_key_here
```

Separate keys for sandbox and production environments.
