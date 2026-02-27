import axios, { type AxiosInstance } from "axios";
import type {
  RideHailingProvider,
  SearchRidesParams,
  BookRideParams,
  EstimateFareParams,
  UpdateRideParams,
  AddStopParams,
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
  UpdateRideResult,
  AddStopResult,
  TripShareInfo,
} from "../schemas.js";

export class LiveProvider implements RideHailingProvider {
  readonly name = "live";
  readonly supportedCities = ["lagos", "abuja"];

  private client: AxiosInstance;

  constructor(baseUrl: string, apiKey: string) {
    this.client = axios.create({
      baseURL: baseUrl,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      timeout: 15000,
    });
  }

  async searchRides(params: SearchRidesParams): Promise<SearchResult> {
    const response = await this.client.get("/rides/estimate", {
      params: {
        pickup_lat: params.pickup_latitude,
        pickup_lng: params.pickup_longitude,
        dropoff_lat: params.dropoff_latitude,
        dropoff_lng: params.dropoff_longitude,
        ride_type: params.ride_type === "any" ? undefined : params.ride_type,
        passenger_count: params.passenger_count,
      },
    });

    const data = response.data.data;

    return {
      rides: data.rides.map(
        (ride: Record<string, unknown>, index: number) => {
          const rideAny = ride as Record<string, any>;
          return {
            ride_option_id: `live-${rideAny.ride_type}-${index}`,
            provider: "live",
            ride_type: rideAny.ride_type,
            vehicle_description: rideAny.vehicle_description,
            estimated_fare: {
              amount: rideAny.estimated_fare.amount,
              currency: rideAny.estimated_fare.currency,
              min_amount: rideAny.estimated_fare.min_amount,
              max_amount: rideAny.estimated_fare.max_amount,
              surge_multiplier: rideAny.surge?.multiplier ?? 1.0,
            },
            eta_minutes: rideAny.eta_minutes,
            estimated_duration_minutes: rideAny.estimated_duration_minutes,
            estimated_distance_km: rideAny.estimated_distance_km,
            max_passengers: rideAny.max_passengers,
            features: rideAny.features ?? [],
          };
        }
      ),
      pickup: {
        latitude: params.pickup_latitude,
        longitude: params.pickup_longitude,
        address: data.pickup_address,
      },
      dropoff: {
        latitude: params.dropoff_latitude,
        longitude: params.dropoff_longitude,
        address: data.dropoff_address,
      },
      provider_name: "live",
      timestamp: data.generated_at ?? new Date().toISOString(),
    };
  }

  async bookRide(params: BookRideParams): Promise<BookingConfirmation> {
    const response = await this.client.post("/rides/book", {
      pickup_lat: params.pickup_latitude,
      pickup_lng: params.pickup_longitude,
      dropoff_lat: params.dropoff_latitude,
      dropoff_lng: params.dropoff_longitude,
      ride_type: params.ride_type,
      passenger: {
        name: params.passenger_name,
        phone: params.passenger_phone,
      },
      payment_method: params.payment_method,
      notes: params.notes,
    });

    const data = response.data.data;

    return {
      ride_id: data.ride_id,
      status: data.status,
      driver: {
        id: data.driver.id,
        name: data.driver.name,
        phone: data.driver.phone,
        rating: data.driver.rating,
        total_trips: data.driver.total_trips,
        vehicle: {
          make: data.driver.vehicle.make,
          model: data.driver.vehicle.model,
          year: data.driver.vehicle.year,
          color: data.driver.vehicle.color,
          plate_number: data.driver.vehicle.plate_number,
        },
      },
      fare: {
        amount: data.fare.amount,
        currency: data.fare.currency,
        surge_multiplier: data.fare.surge_multiplier ?? 1.0,
      },
      eta_minutes: data.eta_minutes,
      pickup_address: data.pickup_address,
      dropoff_address: data.dropoff_address,
      created_at: data.created_at,
    };
  }

  async getRideStatus(rideId: string): Promise<RideStatus> {
    const response = await this.client.get(`/rides/${rideId}/status`);
    const data = response.data.data;

    return {
      ride_id: data.ride_id,
      ride_status: data.ride_status,
      driver: data.driver
        ? {
            current_location: {
              latitude: data.driver.current_location.latitude,
              longitude: data.driver.current_location.longitude,
            },
            eta_to_pickup_minutes: data.driver.eta_to_pickup_minutes,
            eta_to_dropoff_minutes: data.driver.eta_to_dropoff_minutes,
          }
        : undefined,
      updated_at: data.updated_at,
    };
  }

  async cancelRide(
    rideId: string,
    reason: string | null
  ): Promise<CancellationResult> {
    const response = await this.client.post(`/rides/${rideId}/cancel`, {
      reason: reason ?? "user_cancelled",
    });
    const data = response.data.data;

    return {
      ride_id: data.ride_id,
      ride_status: "cancelled",
      cancellation_fee: {
        amount: data.cancellation_fee?.amount ?? 0,
        currency: data.cancellation_fee?.currency ?? "NGN",
      },
      cancelled_at: data.cancelled_at,
    };
  }

  async estimateFare(params: EstimateFareParams): Promise<FareEstimateResult> {
    // Reuse the search endpoint but only extract fare data
    const searchResult = await this.searchRides({
      ...params,
      passenger_count: 1,
      scheduled_time: null,
    });

    const matchingRide = searchResult.rides.find(
      (r) => r.ride_type === params.ride_type
    );

    if (!matchingRide) {
      throw new Error(
        `Ride type "${params.ride_type}" not available for this route`
      );
    }

    return {
      ride_type: params.ride_type,
      estimated_fare: matchingRide.estimated_fare,
      estimated_distance_km: matchingRide.estimated_distance_km,
      estimated_duration_minutes: matchingRide.estimated_duration_minutes,
    };
  }

  async getRideTypes(city: string): Promise<CityRideTypes[]> {
    const response = await this.client.get("/ride-types", {
      params: { city: city || undefined },
    });
    const data = response.data.data;

    return data.cities.map(
      (c: Record<string, unknown>) => {
        const cityAny = c as Record<string, any>;
        return {
          city: cityAny.city,
          ride_types: cityAny.ride_types.map(
            (rt: Record<string, unknown>) => {
              const rtAny = rt as Record<string, any>;
              return {
                type: rtAny.type,
                description: rtAny.description,
                max_passengers: rtAny.max_passengers,
                base_fare_ngn: rtAny.base_fare_ngn,
                per_km_ngn: rtAny.per_km_ngn,
                per_min_ngn: rtAny.per_min_ngn,
              };
            }
          ),
        };
      }
    );
  }

  async geocode(query: string, city: string): Promise<GeocodeResult> {
    const response = await this.client.get("/geocode", {
      params: { query, city },
    });
    const data = response.data.data;

    return {
      results: data.results.map(
        (r: Record<string, unknown>) => {
          const rAny = r as Record<string, any>;
          return {
            name: rAny.name,
            address: rAny.address,
            latitude: rAny.latitude,
            longitude: rAny.longitude,
            confidence: rAny.confidence,
          };
        }
      ),
    };
  }

  async getSupportedCities(): Promise<string[]> {
    return [...this.supportedCities];
  }

  async getPricingInfo(): Promise<PricingInfo> {
    // Return a general pricing structure
    return {
      currency: "NGN",
      pricing_model:
        "Base fare + per-kilometer rate + per-minute rate. Surge pricing may apply during peak hours.",
      base_fares: {
        economy: 500,
        comfort: 800,
        premium: 1200,
      },
      per_km_rates: {
        economy: 150,
        comfort: 220,
        premium: 350,
      },
      per_min_rates: {
        economy: 25,
        comfort: 35,
        premium: 50,
      },
      surge_pricing: {
        description:
          "Surge pricing activates during peak demand periods. Fares may increase by up to 2x the normal rate.",
        max_multiplier: 2.0,
      },
      cancellation_policy: {
        free_cancellation_window_seconds: 120,
        cancellation_fee_ngn: 500,
      },
    };
  }

  async updateRide(params: UpdateRideParams): Promise<UpdateRideResult> {
    const response = await this.client.patch(`/rides/${params.ride_id}`, {
      dropoff_lat: params.new_dropoff_latitude,
      dropoff_lng: params.new_dropoff_longitude,
      notes: params.notes,
    });
    const data = response.data.data;
    return {
      ride_id: data.ride_id,
      updated_fields: data.updated_fields,
      new_dropoff: data.new_dropoff,
      new_fare: data.new_fare,
      new_estimated_duration_minutes: data.new_estimated_duration_minutes,
      updated_at: data.updated_at,
    };
  }

  async addStop(params: AddStopParams): Promise<AddStopResult> {
    const response = await this.client.post(
      `/rides/${params.ride_id}/stops`,
      {
        latitude: params.stop_latitude,
        longitude: params.stop_longitude,
        order: params.stop_order,
      }
    );
    const data = response.data.data;
    return {
      ride_id: data.ride_id,
      stop: data.stop,
      updated_fare: data.updated_fare,
      updated_estimated_duration_minutes: data.updated_estimated_duration_minutes,
      total_stops: data.total_stops,
      updated_at: data.updated_at,
    };
  }

  async shareTripInfo(rideId: string): Promise<TripShareInfo> {
    const response = await this.client.get(`/rides/${rideId}/share`);
    const data = response.data.data;
    return {
      ride_id: data.ride_id,
      ride_status: data.ride_status,
      driver: data.driver,
      pickup: data.pickup,
      dropoff: data.dropoff,
      estimated_arrival: data.estimated_arrival,
      share_message: data.share_message,
      created_at: data.created_at,
    };
  }
}
