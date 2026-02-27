import { z } from "zod";

// --- Shared primitives ---

export const CoordinatesSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
});

export const FareEstimateSchema = z.object({
  amount: z.number(),
  currency: z.string().default("NGN"),
  min_amount: z.number().optional(),
  max_amount: z.number().optional(),
  surge_multiplier: z.number().default(1.0),
});

// --- Ride search ---

export const RideOptionSchema = z.object({
  ride_option_id: z.string(),
  provider: z.string(),
  ride_type: z.string(),
  vehicle_description: z.string(),
  estimated_fare: FareEstimateSchema,
  eta_minutes: z.number(),
  estimated_duration_minutes: z.number(),
  estimated_distance_km: z.number(),
  max_passengers: z.number(),
  features: z.array(z.string()),
});

export const SearchResultSchema = z.object({
  rides: z.array(RideOptionSchema),
  pickup: z.object({
    latitude: z.number(),
    longitude: z.number(),
    address: z.string().optional(),
  }),
  dropoff: z.object({
    latitude: z.number(),
    longitude: z.number(),
    address: z.string().optional(),
  }),
  provider_name: z.string(),
  timestamp: z.string(),
});

// --- Driver & vehicle ---

export const VehicleSchema = z.object({
  make: z.string(),
  model: z.string(),
  year: z.number(),
  color: z.string(),
  plate_number: z.string(),
});

export const DriverSchema = z.object({
  id: z.string(),
  name: z.string(),
  phone: z.string(),
  rating: z.number(),
  total_trips: z.number(),
  vehicle: VehicleSchema,
});

// --- Booking ---

export const BookingConfirmationSchema = z.object({
  ride_id: z.string(),
  status: z.string(),
  driver: DriverSchema,
  fare: FareEstimateSchema,
  eta_minutes: z.number(),
  pickup_address: z.string().optional(),
  dropoff_address: z.string().optional(),
  created_at: z.string(),
});

// --- Ride status ---

export const RIDE_STATUSES = [
  "searching",
  "driver_assigned",
  "en_route_to_pickup",
  "arrived_at_pickup",
  "trip_in_progress",
  "completed",
  "cancelled",
  "no_drivers",
] as const;

export const RideStatusSchema = z.object({
  ride_id: z.string(),
  ride_status: z.enum(RIDE_STATUSES),
  driver: z
    .object({
      current_location: CoordinatesSchema,
      eta_to_pickup_minutes: z.number().optional(),
      eta_to_dropoff_minutes: z.number().optional(),
    })
    .optional(),
  updated_at: z.string(),
});

// --- Cancellation ---

export const CancellationResultSchema = z.object({
  ride_id: z.string(),
  ride_status: z.literal("cancelled"),
  cancellation_fee: z.object({
    amount: z.number(),
    currency: z.string().default("NGN"),
  }),
  cancelled_at: z.string(),
});

// --- Geocoding ---

export const GeocodeResultSchema = z.object({
  results: z.array(
    z.object({
      name: z.string(),
      address: z.string(),
      latitude: z.number(),
      longitude: z.number(),
      confidence: z.number(),
    })
  ),
});

// --- Ride types ---

export const RideTypeInfoSchema = z.object({
  type: z.string(),
  description: z.string(),
  max_passengers: z.number(),
  base_fare_ngn: z.number(),
  per_km_ngn: z.number(),
  per_min_ngn: z.number(),
});

export const CityRideTypesSchema = z.object({
  city: z.string(),
  ride_types: z.array(RideTypeInfoSchema),
});

// --- Fare estimate (standalone) ---

export const FareEstimateResultSchema = z.object({
  ride_type: z.string(),
  estimated_fare: FareEstimateSchema,
  estimated_distance_km: z.number(),
  estimated_duration_minutes: z.number(),
});

// --- Pricing info (resource) ---

export const PricingInfoSchema = z.object({
  currency: z.string(),
  pricing_model: z.string(),
  base_fares: z.record(z.string(), z.number()),
  per_km_rates: z.record(z.string(), z.number()),
  per_min_rates: z.record(z.string(), z.number()),
  surge_pricing: z.object({
    description: z.string(),
    max_multiplier: z.number(),
  }),
  cancellation_policy: z.object({
    free_cancellation_window_seconds: z.number(),
    cancellation_fee_ngn: z.number(),
  }),
});

// --- Ride update ---

export const UpdateRideResultSchema = z.object({
  ride_id: z.string(),
  updated_fields: z.array(z.string()),
  new_dropoff: z
    .object({
      latitude: z.number(),
      longitude: z.number(),
      address: z.string().optional(),
    })
    .optional(),
  new_fare: FareEstimateSchema.optional(),
  new_estimated_duration_minutes: z.number().optional(),
  updated_at: z.string(),
});

// --- Add stop ---

export const StopSchema = z.object({
  stop_id: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  address: z.string().optional(),
  order: z.number(),
});

export const AddStopResultSchema = z.object({
  ride_id: z.string(),
  stop: StopSchema,
  updated_fare: FareEstimateSchema,
  updated_estimated_duration_minutes: z.number(),
  total_stops: z.number(),
  updated_at: z.string(),
});

// --- Trip sharing ---

export const TripShareInfoSchema = z.object({
  ride_id: z.string(),
  ride_status: z.string(),
  driver: z.object({
    name: z.string(),
    phone: z.string(),
    vehicle: VehicleSchema,
  }),
  pickup: z.object({
    latitude: z.number(),
    longitude: z.number(),
    address: z.string().optional(),
  }),
  dropoff: z.object({
    latitude: z.number(),
    longitude: z.number(),
    address: z.string().optional(),
  }),
  estimated_arrival: z.string().optional(),
  share_message: z.string(),
  created_at: z.string(),
});

// --- Inferred TypeScript types ---

export type Coordinates = z.infer<typeof CoordinatesSchema>;
export type FareEstimate = z.infer<typeof FareEstimateSchema>;
export type RideOption = z.infer<typeof RideOptionSchema>;
export type SearchResult = z.infer<typeof SearchResultSchema>;
export type Vehicle = z.infer<typeof VehicleSchema>;
export type Driver = z.infer<typeof DriverSchema>;
export type BookingConfirmation = z.infer<typeof BookingConfirmationSchema>;
export type RideStatus = z.infer<typeof RideStatusSchema>;
export type CancellationResult = z.infer<typeof CancellationResultSchema>;
export type GeocodeResult = z.infer<typeof GeocodeResultSchema>;
export type RideTypeInfo = z.infer<typeof RideTypeInfoSchema>;
export type CityRideTypes = z.infer<typeof CityRideTypesSchema>;
export type FareEstimateResult = z.infer<typeof FareEstimateResultSchema>;
export type PricingInfo = z.infer<typeof PricingInfoSchema>;
export type UpdateRideResult = z.infer<typeof UpdateRideResultSchema>;
export type Stop = z.infer<typeof StopSchema>;
export type AddStopResult = z.infer<typeof AddStopResultSchema>;
export type TripShareInfo = z.infer<typeof TripShareInfoSchema>;
