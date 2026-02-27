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

export interface SearchRidesParams {
  pickup_latitude: number;
  pickup_longitude: number;
  dropoff_latitude: number;
  dropoff_longitude: number;
  ride_type: string;
  passenger_count: number;
  scheduled_time: string | null;
}

export interface BookRideParams {
  pickup_latitude: number;
  pickup_longitude: number;
  dropoff_latitude: number;
  dropoff_longitude: number;
  ride_type: string;
  passenger_name: string;
  passenger_phone: string;
  payment_method: string;
  notes: string | null;
}

export interface EstimateFareParams {
  pickup_latitude: number;
  pickup_longitude: number;
  dropoff_latitude: number;
  dropoff_longitude: number;
  ride_type: string;
}

export interface UpdateRideParams {
  ride_id: string;
  new_dropoff_latitude?: number;
  new_dropoff_longitude?: number;
  notes?: string | null;
}

export interface AddStopParams {
  ride_id: string;
  stop_latitude: number;
  stop_longitude: number;
  stop_order?: number;
}

/**
 * Abstract interface for ride-hailing providers.
 *
 * Any ride-hailing company in Africa can implement this interface
 * to make their service accessible to AI agents via MCP.
 *
 * To add a new provider:
 * 1. Create a new file in src/providers/ (e.g., bolt.ts)
 * 2. Implement the RideHailingProvider interface
 * 3. Register it in src/providers/index.ts
 */
export interface RideHailingProvider {
  readonly name: string;
  readonly supportedCities: string[];

  /** Search for available rides between two locations. */
  searchRides(params: SearchRidesParams): Promise<SearchResult>;

  /** Book a ride. Returns booking confirmation with driver details and ETA. */
  bookRide(params: BookRideParams): Promise<BookingConfirmation>;

  /** Get real-time status of a booked ride. */
  getRideStatus(rideId: string): Promise<RideStatus>;

  /** Cancel a booked ride. Returns cancellation confirmation and any applicable fees. */
  cancelRide(
    rideId: string,
    reason: string | null
  ): Promise<CancellationResult>;

  /** Get a fare estimate without booking. */
  estimateFare(params: EstimateFareParams): Promise<FareEstimateResult>;

  /** Get available ride types for a given city. */
  getRideTypes(city: string): Promise<CityRideTypes[]>;

  /** Convert a place name or address to coordinates. */
  geocode(query: string, city: string): Promise<GeocodeResult>;

  /** Get list of all supported cities. */
  getSupportedCities(): Promise<string[]>;

  /** Get general pricing structure and policies. */
  getPricingInfo(): Promise<PricingInfo>;

  /** Update an active ride's destination or notes. */
  updateRide(params: UpdateRideParams): Promise<UpdateRideResult>;

  /** Add an intermediate stop to an active ride. */
  addStop(params: AddStopParams): Promise<AddStopResult>;

  /** Generate trip sharing info for safety purposes. */
  shareTripInfo(rideId: string): Promise<TripShareInfo>;
}
