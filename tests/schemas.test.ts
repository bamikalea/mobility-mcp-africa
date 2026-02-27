import { describe, it, expect } from "vitest";
import {
  FareEstimateSchema,
  RideOptionSchema,
  SearchResultSchema,
  DriverSchema,
  BookingConfirmationSchema,
  RideStatusSchema,
  CancellationResultSchema,
  GeocodeResultSchema,
  RideTypeInfoSchema,
  CityRideTypesSchema,
  FareEstimateResultSchema,
  PricingInfoSchema,
  UpdateRideResultSchema,
  StopSchema,
  AddStopResultSchema,
  TripShareInfoSchema,
} from "../src/schemas.js";

describe("FareEstimateSchema", () => {
  it("accepts valid fare data", () => {
    const result = FareEstimateSchema.parse({
      amount: 4500,
      currency: "NGN",
      surge_multiplier: 1.0,
    });
    expect(result.amount).toBe(4500);
    expect(result.currency).toBe("NGN");
  });

  it("applies defaults for currency and surge", () => {
    const result = FareEstimateSchema.parse({ amount: 3000 });
    expect(result.currency).toBe("NGN");
    expect(result.surge_multiplier).toBe(1.0);
  });

  it("rejects missing amount", () => {
    expect(() => FareEstimateSchema.parse({ currency: "NGN" })).toThrow();
  });
});

describe("RideStatusSchema", () => {
  it("accepts valid ride status", () => {
    const result = RideStatusSchema.parse({
      ride_id: "MOCK-20260227-A1B2",
      ride_status: "en_route_to_pickup",
      driver: {
        current_location: { latitude: 6.59, longitude: 3.33 },
        eta_to_pickup_minutes: 5,
      },
      updated_at: "2026-02-27T10:32:00Z",
    });
    expect(result.ride_status).toBe("en_route_to_pickup");
  });

  it("rejects invalid ride status enum", () => {
    expect(() =>
      RideStatusSchema.parse({
        ride_id: "X",
        ride_status: "flying",
        updated_at: "2026-02-27T10:32:00Z",
      })
    ).toThrow();
  });

  it("allows optional driver field", () => {
    const result = RideStatusSchema.parse({
      ride_id: "X",
      ride_status: "searching",
      updated_at: "2026-02-27T10:32:00Z",
    });
    expect(result.driver).toBeUndefined();
  });
});

describe("DriverSchema", () => {
  it("accepts valid driver data", () => {
    const result = DriverSchema.parse({
      id: "DRV-1001",
      name: "Emeka Okafor",
      phone: "+2348012345678",
      rating: 4.8,
      total_trips: 2340,
      vehicle: {
        make: "Toyota",
        model: "Corolla",
        year: 2020,
        color: "Silver",
        plate_number: "LAG-234-XY",
      },
    });
    expect(result.name).toBe("Emeka Okafor");
    expect(result.vehicle.plate_number).toBe("LAG-234-XY");
  });

  it("rejects missing vehicle", () => {
    expect(() =>
      DriverSchema.parse({
        id: "DRV-1",
        name: "Test",
        phone: "+234",
        rating: 4.0,
        total_trips: 100,
      })
    ).toThrow();
  });
});

describe("CancellationResultSchema", () => {
  it("accepts valid cancellation", () => {
    const result = CancellationResultSchema.parse({
      ride_id: "MOCK-123",
      ride_status: "cancelled",
      cancellation_fee: { amount: 0, currency: "NGN" },
      cancelled_at: "2026-02-27T10:31:00Z",
    });
    expect(result.ride_status).toBe("cancelled");
    expect(result.cancellation_fee.amount).toBe(0);
  });

  it("rejects non-cancelled status", () => {
    expect(() =>
      CancellationResultSchema.parse({
        ride_id: "X",
        ride_status: "completed",
        cancellation_fee: { amount: 0 },
        cancelled_at: "2026-02-27T10:31:00Z",
      })
    ).toThrow();
  });
});

describe("GeocodeResultSchema", () => {
  it("accepts valid geocode results", () => {
    const result = GeocodeResultSchema.parse({
      results: [
        {
          name: "Eko Hotels",
          address: "Victoria Island, Lagos",
          latitude: 6.431,
          longitude: 3.4156,
          confidence: 0.95,
        },
      ],
    });
    expect(result.results).toHaveLength(1);
    expect(result.results[0]!.confidence).toBe(0.95);
  });

  it("accepts empty results", () => {
    const result = GeocodeResultSchema.parse({ results: [] });
    expect(result.results).toHaveLength(0);
  });
});

describe("SearchResultSchema", () => {
  it("accepts valid search result", () => {
    const result = SearchResultSchema.parse({
      rides: [
        {
          ride_option_id: "economy-123",
          provider: "mock",
          ride_type: "economy",
          vehicle_description: "Toyota Corolla",
          estimated_fare: { amount: 4500, currency: "NGN", surge_multiplier: 1.0 },
          eta_minutes: 8,
          estimated_duration_minutes: 35,
          estimated_distance_km: 18.5,
          max_passengers: 4,
          features: ["air_conditioning"],
        },
      ],
      pickup: { latitude: 6.5777, longitude: 3.3213 },
      dropoff: { latitude: 6.4281, longitude: 3.4219 },
      provider_name: "mock",
      timestamp: "2026-02-27T10:30:00Z",
    });
    expect(result.rides).toHaveLength(1);
    expect(result.provider_name).toBe("mock");
  });
});

describe("RideTypeInfoSchema", () => {
  it("accepts valid ride type", () => {
    const result = RideTypeInfoSchema.parse({
      type: "economy",
      description: "Affordable everyday rides",
      max_passengers: 4,
      base_fare_ngn: 500,
      per_km_ngn: 150,
      per_min_ngn: 25,
    });
    expect(result.type).toBe("economy");
  });
});

describe("PricingInfoSchema", () => {
  it("accepts valid pricing info", () => {
    const result = PricingInfoSchema.parse({
      currency: "NGN",
      pricing_model: "Base fare + per km + per min",
      base_fares: { economy: 500, comfort: 800 },
      per_km_rates: { economy: 150, comfort: 220 },
      per_min_rates: { economy: 25, comfort: 35 },
      surge_pricing: {
        description: "Surge pricing during peak hours",
        max_multiplier: 2.0,
      },
      cancellation_policy: {
        free_cancellation_window_seconds: 120,
        cancellation_fee_ngn: 500,
      },
    });
    expect(result.currency).toBe("NGN");
  });
});

describe("UpdateRideResultSchema", () => {
  it("accepts valid update result with new fare", () => {
    const result = UpdateRideResultSchema.parse({
      ride_id: "MOCK-20260227-AB12",
      updated_fields: ["dropoff"],
      new_dropoff: { latitude: 6.4474, longitude: 3.4737, address: "Lekki Phase 1" },
      new_fare: { amount: 5200, currency: "NGN", surge_multiplier: 1.0 },
      new_estimated_duration_minutes: 45,
      updated_at: "2026-02-27T12:00:00Z",
    });
    expect(result.updated_fields).toContain("dropoff");
  });

  it("accepts update result without fare change (notes only)", () => {
    const result = UpdateRideResultSchema.parse({
      ride_id: "MOCK-20260227-AB12",
      updated_fields: ["notes"],
      updated_at: "2026-02-27T12:00:00Z",
    });
    expect(result.new_fare).toBeUndefined();
  });
});

describe("StopSchema", () => {
  it("accepts valid stop", () => {
    const result = StopSchema.parse({
      stop_id: "STOP-1-ABCD",
      latitude: 6.4474,
      longitude: 3.4737,
      address: "Lekki Phase 1",
      order: 1,
    });
    expect(result.stop_id).toBe("STOP-1-ABCD");
  });
});

describe("AddStopResultSchema", () => {
  it("accepts valid add stop result", () => {
    const result = AddStopResultSchema.parse({
      ride_id: "MOCK-20260227-AB12",
      stop: { stop_id: "STOP-1-XY", latitude: 6.5, longitude: 3.4, order: 1 },
      updated_fare: { amount: 6000, currency: "NGN", surge_multiplier: 1.0 },
      updated_estimated_duration_minutes: 55,
      total_stops: 1,
      updated_at: "2026-02-27T12:00:00Z",
    });
    expect(result.total_stops).toBe(1);
  });
});

describe("TripShareInfoSchema", () => {
  it("accepts valid trip share info", () => {
    const result = TripShareInfoSchema.parse({
      ride_id: "MOCK-20260227-AB12",
      ride_status: "trip_in_progress",
      driver: {
        name: "Emeka Okafor",
        phone: "+2348012345678",
        vehicle: {
          make: "Toyota",
          model: "Corolla",
          year: 2020,
          color: "Silver",
          plate_number: "LAG-234-XY",
        },
      },
      pickup: { latitude: 6.5777, longitude: 3.3213, address: "Airport" },
      dropoff: { latitude: 6.4281, longitude: 3.4219, address: "Victoria Island" },
      share_message: "I'm on a ride with Emeka Okafor.",
      created_at: "2026-02-27T12:00:00Z",
    });
    expect(result.driver.name).toBe("Emeka Okafor");
  });
});
