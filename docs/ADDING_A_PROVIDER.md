# Adding a New Ride-Hailing Provider

This guide explains how to add a new ride-hailing provider to mobility-mcp-africa.

## Overview

The MCP server uses a provider abstraction — the `RideHailingProvider` interface in `src/providers/base.ts`. Any ride-hailing company can integrate by implementing this interface and mapping their REST API to the standard methods.

## Step-by-Step

### 1. Create a new provider file

Create `src/providers/yourprovider.ts`:

```typescript
import type {
  RideHailingProvider,
  SearchRidesParams,
  BookRideParams,
  EstimateFareParams,
} from "./base.js";
import type {
  SearchResult,
  BookingConfirmation,
  RideStatus,
  CancellationResult,
  FareEstimateResult,
  CityRideTypes,
  GeocodeResult,
  PricingInfo,
} from "../schemas.js";

export class YourProvider implements RideHailingProvider {
  readonly name = "yourprovider";
  readonly supportedCities = ["lagos", "accra"]; // your cities

  constructor(baseUrl: string, apiKey: string) {
    // Set up your HTTP client
  }

  async searchRides(params: SearchRidesParams): Promise<SearchResult> {
    // Call your API, transform response to SearchResult format
  }

  async bookRide(params: BookRideParams): Promise<BookingConfirmation> {
    // Call your API, transform response to BookingConfirmation format
  }

  async getRideStatus(rideId: string): Promise<RideStatus> {
    // Call your API, transform response to RideStatus format
  }

  async cancelRide(rideId: string, reason: string | null): Promise<CancellationResult> {
    // Call your API, transform response to CancellationResult format
  }

  async estimateFare(params: EstimateFareParams): Promise<FareEstimateResult> {
    // Call your API, transform response to FareEstimateResult format
  }

  async getRideTypes(city: string): Promise<CityRideTypes[]> {
    // Return available ride types per city
  }

  async geocode(query: string, city: string): Promise<GeocodeResult> {
    // Convert place name to coordinates
  }

  async getSupportedCities(): Promise<string[]> {
    return [...this.supportedCities];
  }

  async getPricingInfo(): Promise<PricingInfo> {
    // Return your pricing structure
  }
}
```

### 2. Register in the provider factory

Edit `src/providers/index.ts`:

```typescript
import { YourProvider } from "./yourprovider.js";

export function createProvider(config: Config): RideHailingProvider {
  switch (config.provider) {
    case "mock":
      return new MockProvider();
    case "zeno":
      return new ZenoProvider(config.zeno.baseUrl, config.zeno.apiKey);
    case "yourprovider":
      return new YourProvider(config.yourprovider.baseUrl, config.yourprovider.apiKey);
    default:
      throw new Error(`Unknown provider: ${config.provider}`);
  }
}
```

### 3. Add config support

Edit `src/config.ts` to add your provider's env vars.

### 4. Write tests

Create `tests/yourprovider.test.ts` and verify all methods return data that validates against the Zod schemas in `src/schemas.ts`.

## Required API Endpoints

Your REST API needs to support these operations. See [API_SPEC_FOR_PROVIDERS.md](API_SPEC_FOR_PROVIDERS.md) for the full specification.

| Operation | Purpose |
|-----------|---------|
| Fare estimate | Get fare estimates and ETAs for a route |
| Book ride | Create a ride booking |
| Ride status | Get real-time ride status and driver location |
| Cancel ride | Cancel a booked ride |
| Ride types | List available vehicle/ride types per city |
| Geocode | Convert place names to coordinates |

## Data Format Requirements

All provider methods must return data matching the Zod schemas in `src/schemas.ts`. Key requirements:

- **Currency**: Use ISO 4217 codes (e.g., `NGN`, `GHS`, `KES`)
- **Coordinates**: Decimal degrees (latitude, longitude)
- **Timestamps**: ISO 8601 format
- **Ride statuses**: Must use the standard enum: `searching`, `driver_assigned`, `en_route_to_pickup`, `arrived_at_pickup`, `trip_in_progress`, `completed`, `cancelled`, `no_drivers`
