import { describe, it, expect, beforeEach } from "vitest";
import { MockProvider } from "../src/providers/mock.js";
import {
  SearchResultSchema,
  BookingConfirmationSchema,
  RideStatusSchema,
  CancellationResultSchema,
  FareEstimateResultSchema,
  CityRideTypesSchema,
  GeocodeResultSchema,
  PricingInfoSchema,
  UpdateRideResultSchema,
  AddStopResultSchema,
  TripShareInfoSchema,
} from "../src/schemas.js";

describe("MockProvider", () => {
  let provider: MockProvider;

  beforeEach(() => {
    provider = new MockProvider();
  });

  describe("searchRides", () => {
    it("returns rides for airport to VI route", async () => {
      const result = await provider.searchRides({
        pickup_latitude: 6.5777,
        pickup_longitude: 3.3213,
        dropoff_latitude: 6.4281,
        dropoff_longitude: 3.4219,
        ride_type: "any",
        passenger_count: 1,
        scheduled_time: null,
      });

      // Validate against schema
      SearchResultSchema.parse(result);

      expect(result.rides.length).toBeGreaterThan(0);
      expect(result.provider_name).toBe("mock");
      expect(result.pickup.latitude).toBe(6.5777);
      expect(result.dropoff.latitude).toBe(6.4281);
    });

    it("returns all ride types when type is 'any'", async () => {
      const result = await provider.searchRides({
        pickup_latitude: 6.6018,
        pickup_longitude: 3.3515,
        dropoff_latitude: 6.4474,
        dropoff_longitude: 3.4737,
        ride_type: "any",
        passenger_count: 1,
        scheduled_time: null,
      });

      expect(result.rides.length).toBe(5); // economy, comfort, premium, motorcycle, tricycle
    });

    it("filters to specific ride type", async () => {
      const result = await provider.searchRides({
        pickup_latitude: 6.6018,
        pickup_longitude: 3.3515,
        dropoff_latitude: 6.4474,
        dropoff_longitude: 3.4737,
        ride_type: "economy",
        passenger_count: 1,
        scheduled_time: null,
      });

      expect(result.rides.length).toBe(1);
      expect(result.rides[0]!.ride_type).toBe("economy");
    });

    it("produces reasonable fares for airport to VI (economy)", async () => {
      const result = await provider.searchRides({
        pickup_latitude: 6.5777,
        pickup_longitude: 3.3213,
        dropoff_latitude: 6.4281,
        dropoff_longitude: 3.4219,
        ride_type: "economy",
        passenger_count: 1,
        scheduled_time: null,
      });

      const fare = result.rides[0]!.estimated_fare.amount;
      // Airport to VI is ~20km, economy fare should be roughly 2000-8000 NGN
      expect(fare).toBeGreaterThan(2000);
      expect(fare).toBeLessThan(10000);
    });

    it("includes address information", async () => {
      const result = await provider.searchRides({
        pickup_latitude: 6.5777,
        pickup_longitude: 3.3213,
        dropoff_latitude: 6.4281,
        dropoff_longitude: 3.4219,
        ride_type: "economy",
        passenger_count: 1,
        scheduled_time: null,
      });

      expect(result.pickup.address).toBeDefined();
      expect(result.dropoff.address).toBeDefined();
    });
  });

  describe("bookRide", () => {
    it("returns a valid booking confirmation", async () => {
      const result = await provider.bookRide({
        pickup_latitude: 6.5777,
        pickup_longitude: 3.3213,
        dropoff_latitude: 6.4281,
        dropoff_longitude: 3.4219,
        ride_type: "economy",
        passenger_name: "Adebayo Ogunlesi",
        passenger_phone: "+2348012345678",
        payment_method: "cash",
        notes: null,
      });

      BookingConfirmationSchema.parse(result);

      expect(result.ride_id).toMatch(/^MOCK-/);
      expect(result.status).toBe("driver_assigned");
      expect(result.driver.name).toBeTruthy();
      expect(result.driver.vehicle.plate_number).toBeTruthy();
      expect(result.fare.currency).toBe("NGN");
    });
  });

  describe("getRideStatus", () => {
    it("returns status for a booked ride", async () => {
      const booking = await provider.bookRide({
        pickup_latitude: 6.5777,
        pickup_longitude: 3.3213,
        dropoff_latitude: 6.4281,
        dropoff_longitude: 3.4219,
        ride_type: "economy",
        passenger_name: "Test User",
        passenger_phone: "+2348000000000",
        payment_method: "cash",
        notes: null,
      });

      const status = await provider.getRideStatus(booking.ride_id);

      RideStatusSchema.parse(status);

      expect(status.ride_id).toBe(booking.ride_id);
      expect(status.driver).toBeDefined();
    });

    it("progresses status on each call", async () => {
      const booking = await provider.bookRide({
        pickup_latitude: 6.5777,
        pickup_longitude: 3.3213,
        dropoff_latitude: 6.4281,
        dropoff_longitude: 3.4219,
        ride_type: "comfort",
        passenger_name: "Test User",
        passenger_phone: "+2348000000000",
        payment_method: "card",
        notes: null,
      });

      // First call: should advance from driver_assigned to en_route_to_pickup
      const status1 = await provider.getRideStatus(booking.ride_id);
      expect(status1.ride_status).toBe("en_route_to_pickup");

      // Second call: should advance to arrived_at_pickup
      const status2 = await provider.getRideStatus(booking.ride_id);
      expect(status2.ride_status).toBe("arrived_at_pickup");
    });

    it("throws for unknown ride ID", async () => {
      await expect(
        provider.getRideStatus("NONEXISTENT-ID")
      ).rejects.toThrow("Ride not found");
    });
  });

  describe("cancelRide", () => {
    it("cancels a ride with no fee before trip starts", async () => {
      const booking = await provider.bookRide({
        pickup_latitude: 6.6018,
        pickup_longitude: 3.3515,
        dropoff_latitude: 6.4474,
        dropoff_longitude: 3.4737,
        ride_type: "economy",
        passenger_name: "Test User",
        passenger_phone: "+2348000000000",
        payment_method: "cash",
        notes: null,
      });

      const result = await provider.cancelRide(booking.ride_id, "changed_plans");

      CancellationResultSchema.parse(result);

      expect(result.ride_status).toBe("cancelled");
      expect(result.cancellation_fee.amount).toBe(0);
    });

    it("throws for unknown ride ID", async () => {
      await expect(
        provider.cancelRide("NONEXISTENT", null)
      ).rejects.toThrow("Ride not found");
    });
  });

  describe("estimateFare", () => {
    it("returns a fare estimate", async () => {
      const result = await provider.estimateFare({
        pickup_latitude: 6.5777,
        pickup_longitude: 3.3213,
        dropoff_latitude: 6.4281,
        dropoff_longitude: 3.4219,
        ride_type: "economy",
      });

      FareEstimateResultSchema.parse(result);

      expect(result.ride_type).toBe("economy");
      expect(result.estimated_fare.currency).toBe("NGN");
      expect(result.estimated_distance_km).toBeGreaterThan(0);
      expect(result.estimated_duration_minutes).toBeGreaterThan(0);
    });
  });

  describe("getRideTypes", () => {
    it("returns ride types for Lagos", async () => {
      const result = await provider.getRideTypes("lagos");

      expect(result).toHaveLength(1);
      CityRideTypesSchema.parse(result[0]);

      expect(result[0]!.city).toBe("lagos");
      expect(result[0]!.ride_types.length).toBe(5);

      const types = result[0]!.ride_types.map((rt) => rt.type);
      expect(types).toContain("economy");
      expect(types).toContain("motorcycle");
      expect(types).toContain("tricycle");
    });

    it("returns empty for unsupported city", async () => {
      const result = await provider.getRideTypes("accra");
      expect(result).toHaveLength(0);
    });
  });

  describe("geocode", () => {
    it("finds Eko Hotel", async () => {
      const result = await provider.geocode("eko hotel", "lagos");

      GeocodeResultSchema.parse(result);

      expect(result.results.length).toBeGreaterThan(0);
      expect(result.results[0]!.name).toContain("Eko");
      expect(result.results[0]!.confidence).toBeGreaterThanOrEqual(0.75);
    });

    it("finds Murtala Muhammed Airport", async () => {
      const result = await provider.geocode("murtala muhammed", "lagos");
      expect(result.results.length).toBeGreaterThan(0);
    });

    it("returns empty for nonexistent place", async () => {
      const result = await provider.geocode(
        "xyznonexistentplace123",
        "lagos"
      );
      expect(result.results).toHaveLength(0);
    });

    it("searches Abuja locations", async () => {
      const result = await provider.geocode("transcorp hilton", "abuja");
      expect(result.results.length).toBeGreaterThan(0);
      expect(result.results[0]!.name).toContain("Transcorp");
    });
  });

  describe("getSupportedCities", () => {
    it("returns lagos and abuja", async () => {
      const cities = await provider.getSupportedCities();
      expect(cities).toContain("lagos");
      expect(cities).toContain("abuja");
    });
  });

  describe("getPricingInfo", () => {
    it("returns valid pricing info", async () => {
      const info = await provider.getPricingInfo();

      PricingInfoSchema.parse(info);

      expect(info.currency).toBe("NGN");
      expect(info.base_fares["economy"]).toBeDefined();
      expect(info.surge_pricing.max_multiplier).toBeGreaterThan(1);
    });
  });

  describe("updateRide", () => {
    it("updates destination and recalculates fare", async () => {
      const booking = await provider.bookRide({
        pickup_latitude: 6.5777,
        pickup_longitude: 3.3213,
        dropoff_latitude: 6.4281,
        dropoff_longitude: 3.4219,
        ride_type: "economy",
        passenger_name: "Test",
        passenger_phone: "+234800",
        payment_method: "cash",
        notes: null,
      });

      const result = await provider.updateRide({
        ride_id: booking.ride_id,
        new_dropoff_latitude: 6.4474,
        new_dropoff_longitude: 3.4737,
      });

      UpdateRideResultSchema.parse(result);
      expect(result.updated_fields).toContain("dropoff");
      expect(result.new_fare).toBeDefined();
      expect(result.new_fare!.currency).toBe("NGN");
      expect(result.new_estimated_duration_minutes).toBeGreaterThan(0);
    });

    it("updates notes", async () => {
      const booking = await provider.bookRide({
        pickup_latitude: 6.5777,
        pickup_longitude: 3.3213,
        dropoff_latitude: 6.4281,
        dropoff_longitude: 3.4219,
        ride_type: "economy",
        passenger_name: "Test",
        passenger_phone: "+234800",
        payment_method: "cash",
        notes: null,
      });

      const result = await provider.updateRide({
        ride_id: booking.ride_id,
        notes: "Please wait at the gate",
      });

      expect(result.updated_fields).toContain("notes");
      expect(result.new_fare).toBeUndefined();
    });

    it("throws for nonexistent ride", async () => {
      await expect(
        provider.updateRide({ ride_id: "FAKE", notes: "test" })
      ).rejects.toThrow("Ride not found");
    });

    it("throws for completed ride", async () => {
      const booking = await provider.bookRide({
        pickup_latitude: 6.5777,
        pickup_longitude: 3.3213,
        dropoff_latitude: 6.4281,
        dropoff_longitude: 3.4219,
        ride_type: "economy",
        passenger_name: "Test",
        passenger_phone: "+234800",
        payment_method: "cash",
        notes: null,
      });

      // Progress ride to completed
      await provider.getRideStatus(booking.ride_id); // en_route_to_pickup
      await provider.getRideStatus(booking.ride_id); // arrived_at_pickup
      await provider.getRideStatus(booking.ride_id); // trip_in_progress
      await provider.getRideStatus(booking.ride_id); // completed

      await expect(
        provider.updateRide({ ride_id: booking.ride_id, notes: "too late" })
      ).rejects.toThrow('Cannot update ride in "completed" status');
    });
  });

  describe("addStop", () => {
    it("adds a stop and returns updated fare", async () => {
      const booking = await provider.bookRide({
        pickup_latitude: 6.5777,
        pickup_longitude: 3.3213,
        dropoff_latitude: 6.4281,
        dropoff_longitude: 3.4219,
        ride_type: "comfort",
        passenger_name: "Test",
        passenger_phone: "+234800",
        payment_method: "cash",
        notes: null,
      });

      const result = await provider.addStop({
        ride_id: booking.ride_id,
        stop_latitude: 6.4474,
        stop_longitude: 3.4737,
      });

      AddStopResultSchema.parse(result);
      expect(result.stop.stop_id).toMatch(/^STOP-/);
      expect(result.total_stops).toBe(1);
      expect(result.updated_fare.currency).toBe("NGN");
      expect(result.updated_estimated_duration_minutes).toBeGreaterThan(0);
    });

    it("supports multiple stops", async () => {
      const booking = await provider.bookRide({
        pickup_latitude: 6.5777,
        pickup_longitude: 3.3213,
        dropoff_latitude: 6.4281,
        dropoff_longitude: 3.4219,
        ride_type: "economy",
        passenger_name: "Test",
        passenger_phone: "+234800",
        payment_method: "cash",
        notes: null,
      });

      await provider.addStop({
        ride_id: booking.ride_id,
        stop_latitude: 6.4474,
        stop_longitude: 3.4737,
      });

      const result2 = await provider.addStop({
        ride_id: booking.ride_id,
        stop_latitude: 6.5059,
        stop_longitude: 3.3509,
      });

      expect(result2.total_stops).toBe(2);
    });

    it("throws for nonexistent ride", async () => {
      await expect(
        provider.addStop({
          ride_id: "FAKE",
          stop_latitude: 6.5,
          stop_longitude: 3.4,
        })
      ).rejects.toThrow("Ride not found");
    });

    it("throws for cancelled ride", async () => {
      const booking = await provider.bookRide({
        pickup_latitude: 6.5777,
        pickup_longitude: 3.3213,
        dropoff_latitude: 6.4281,
        dropoff_longitude: 3.4219,
        ride_type: "economy",
        passenger_name: "Test",
        passenger_phone: "+234800",
        payment_method: "cash",
        notes: null,
      });

      await provider.cancelRide(booking.ride_id, null);

      await expect(
        provider.addStop({
          ride_id: booking.ride_id,
          stop_latitude: 6.5,
          stop_longitude: 3.4,
        })
      ).rejects.toThrow('Cannot add stop to ride in "cancelled" status');
    });
  });

  describe("shareTripInfo", () => {
    it("returns formatted trip details", async () => {
      const booking = await provider.bookRide({
        pickup_latitude: 6.5777,
        pickup_longitude: 3.3213,
        dropoff_latitude: 6.4281,
        dropoff_longitude: 3.4219,
        ride_type: "economy",
        passenger_name: "Test",
        passenger_phone: "+234800",
        payment_method: "cash",
        notes: null,
      });

      const result = await provider.shareTripInfo(booking.ride_id);

      TripShareInfoSchema.parse(result);
      expect(result.share_message).toContain("Vehicle:");
      expect(result.share_message).toContain("Plate:");
      expect(result.share_message).toContain("Ride ID:");
      expect(result.driver.name).toBeDefined();
      expect(result.driver.vehicle.plate_number).toBeDefined();
    });

    it("throws for nonexistent ride", async () => {
      await expect(provider.shareTripInfo("FAKE")).rejects.toThrow(
        "Ride not found"
      );
    });
  });
});
