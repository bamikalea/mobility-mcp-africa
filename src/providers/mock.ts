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
  Driver,
  RideOption,
  UpdateRideResult,
  AddStopResult,
  TripShareInfo,
} from "../schemas.js";

// --- Mock data ---

interface Location {
  latitude: number;
  longitude: number;
  address: string;
}

const LAGOS_LOCATIONS: Record<string, Location> = {
  ikeja: { latitude: 6.6018, longitude: 3.3515, address: "Ikeja, Lagos" },
  victoria_island: {
    latitude: 6.4281,
    longitude: 3.4219,
    address: "Victoria Island, Lagos",
  },
  lekki: {
    latitude: 6.4474,
    longitude: 3.4737,
    address: "Lekki Phase 1, Lagos",
  },
  airport: {
    latitude: 6.5777,
    longitude: 3.3213,
    address: "Murtala Muhammed International Airport, Ikeja, Lagos",
  },
  ajah: { latitude: 6.4698, longitude: 3.5852, address: "Ajah, Lagos" },
  surulere: {
    latitude: 6.5059,
    longitude: 3.3509,
    address: "Surulere, Lagos",
  },
  yaba: { latitude: 6.5158, longitude: 3.375, address: "Yaba, Lagos" },
  ikoyi: { latitude: 6.449, longitude: 3.43, address: "Ikoyi, Lagos" },
};

const ABUJA_LOCATIONS: Record<string, Location> = {
  wuse: { latitude: 9.0579, longitude: 7.4951, address: "Wuse 2, Abuja" },
  garki: { latitude: 9.0388, longitude: 7.4942, address: "Garki, Abuja" },
  maitama: {
    latitude: 9.082,
    longitude: 7.495,
    address: "Maitama, Abuja",
  },
  airport: {
    latitude: 9.0069,
    longitude: 7.2631,
    address: "Nnamdi Azikiwe International Airport, Abuja",
  },
};

const MOCK_DRIVERS: Driver[] = [
  {
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
  },
  {
    id: "DRV-1002",
    name: "Adebayo Johnson",
    phone: "+2348023456789",
    rating: 4.6,
    total_trips: 1890,
    vehicle: {
      make: "Honda",
      model: "Accord",
      year: 2019,
      color: "Black",
      plate_number: "LAG-567-AB",
    },
  },
  {
    id: "DRV-1003",
    name: "Chioma Eze",
    phone: "+2348034567890",
    rating: 4.9,
    total_trips: 3100,
    vehicle: {
      make: "Toyota",
      model: "Camry",
      year: 2021,
      color: "White",
      plate_number: "LAG-890-CD",
    },
  },
  {
    id: "DRV-1004",
    name: "Ibrahim Musa",
    phone: "+2348045678901",
    rating: 4.5,
    total_trips: 1560,
    vehicle: {
      make: "Hyundai",
      model: "Accent",
      year: 2020,
      color: "Grey",
      plate_number: "ABJ-123-EF",
    },
  },
  {
    id: "DRV-1005",
    name: "Funke Adeyemi",
    phone: "+2348056789012",
    rating: 4.7,
    total_trips: 2780,
    vehicle: {
      make: "Toyota",
      model: "Yaris",
      year: 2022,
      color: "Blue",
      plate_number: "LAG-456-GH",
    },
  },
];

interface RideTypeConfig {
  description: string;
  max_passengers: number;
  base_fare_ngn: number;
  per_km_ngn: number;
  per_min_ngn: number;
  vehicle_description: string;
  features: string[];
}

const RIDE_TYPES: Record<string, RideTypeConfig> = {
  economy: {
    description: "Affordable everyday rides",
    max_passengers: 4,
    base_fare_ngn: 500,
    per_km_ngn: 150,
    per_min_ngn: 25,
    vehicle_description: "Toyota Corolla, Hyundai Accent or similar",
    features: ["air_conditioning", "card_payment"],
  },
  comfort: {
    description: "Spacious and comfortable",
    max_passengers: 4,
    base_fare_ngn: 800,
    per_km_ngn: 220,
    per_min_ngn: 35,
    vehicle_description: "Toyota Camry, Honda Accord or similar",
    features: ["air_conditioning", "card_payment", "phone_charger"],
  },
  premium: {
    description: "Luxury vehicles with top-rated drivers",
    max_passengers: 4,
    base_fare_ngn: 1200,
    per_km_ngn: 350,
    per_min_ngn: 50,
    vehicle_description: "Mercedes C-Class, BMW 3 Series or similar",
    features: [
      "air_conditioning",
      "card_payment",
      "phone_charger",
      "wifi",
      "water",
    ],
  },
  motorcycle: {
    description: "Fast two-wheel rides, beat the traffic",
    max_passengers: 1,
    base_fare_ngn: 300,
    per_km_ngn: 100,
    per_min_ngn: 15,
    vehicle_description: "Motorcycle (Okada)",
    features: ["helmet_provided"],
  },
  tricycle: {
    description: "Three-wheel keke rides for short trips",
    max_passengers: 3,
    base_fare_ngn: 200,
    per_km_ngn: 80,
    per_min_ngn: 10,
    vehicle_description: "Tricycle (Keke)",
    features: [],
  },
};

interface GeoEntry {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

const GEOCODE_DB: Record<string, GeoEntry[]> = {
  lagos: [
    {
      name: "Eko Hotels & Suites",
      address:
        "Plot 1415, Adetokunbo Ademola Street, Victoria Island, Lagos",
      latitude: 6.431,
      longitude: 3.4156,
    },
    {
      name: "Murtala Muhammed International Airport",
      address: "Ikeja, Lagos",
      latitude: 6.5777,
      longitude: 3.3213,
    },
    {
      name: "Landmark Beach",
      address: "Water Corporation Drive, Victoria Island, Lagos",
      latitude: 6.4225,
      longitude: 3.4139,
    },
    {
      name: "Computer Village Ikeja",
      address: "Awolowo Way, Ikeja, Lagos",
      latitude: 6.6135,
      longitude: 3.3485,
    },
    {
      name: "Lekki Conservation Centre",
      address: "Km 19, Lekki-Epe Expressway, Lekki, Lagos",
      latitude: 6.4394,
      longitude: 3.5355,
    },
    {
      name: "National Theatre",
      address: "Iganmu, Surulere, Lagos",
      latitude: 6.4605,
      longitude: 3.3888,
    },
    {
      name: "The Palms Shopping Mall",
      address: "1 Bisway Street, Lekki Phase 1, Lagos",
      latitude: 6.4356,
      longitude: 3.4603,
    },
    {
      name: "Third Mainland Bridge",
      address: "Lagos Mainland to Island, Lagos",
      latitude: 6.487,
      longitude: 3.3954,
    },
    {
      name: "Ikeja City Mall",
      address: "Obafemi Awolowo Way, Ikeja, Lagos",
      latitude: 6.6128,
      longitude: 3.3478,
    },
    {
      name: "Victoria Island",
      address: "Victoria Island, Lagos",
      latitude: 6.4281,
      longitude: 3.4219,
    },
    {
      name: "Lekki Phase 1",
      address: "Lekki Phase 1, Lagos",
      latitude: 6.4474,
      longitude: 3.4737,
    },
    {
      name: "Ikeja",
      address: "Ikeja, Lagos",
      latitude: 6.6018,
      longitude: 3.3515,
    },
    {
      name: "Surulere",
      address: "Surulere, Lagos",
      latitude: 6.5059,
      longitude: 3.3509,
    },
    {
      name: "Yaba",
      address: "Yaba, Lagos",
      latitude: 6.5158,
      longitude: 3.375,
    },
    {
      name: "Ajah",
      address: "Ajah, Lagos",
      latitude: 6.4698,
      longitude: 3.5852,
    },
    {
      name: "Ikoyi",
      address: "Ikoyi, Lagos",
      latitude: 6.449,
      longitude: 3.43,
    },
  ],
  abuja: [
    {
      name: "Nnamdi Azikiwe International Airport",
      address: "Airport Road, Abuja",
      latitude: 9.0069,
      longitude: 7.2631,
    },
    {
      name: "Transcorp Hilton Abuja",
      address: "1 Aguiyi Ironsi Street, Maitama, Abuja",
      latitude: 9.0757,
      longitude: 7.4898,
    },
    {
      name: "Jabi Lake Mall",
      address: "Plot 1260, Jabi District, Abuja",
      latitude: 9.0467,
      longitude: 7.4228,
    },
    {
      name: "Wuse Market",
      address: "Wuse Zone 5, Abuja",
      latitude: 9.0579,
      longitude: 7.4751,
    },
    {
      name: "Wuse 2",
      address: "Wuse 2, Abuja",
      latitude: 9.0579,
      longitude: 7.4951,
    },
    {
      name: "Garki",
      address: "Garki, Abuja",
      latitude: 9.0388,
      longitude: 7.4942,
    },
    {
      name: "Maitama",
      address: "Maitama, Abuja",
      latitude: 9.082,
      longitude: 7.495,
    },
  ],
};

// --- Utility functions ---

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function estimateDuration(distanceKm: number): number {
  // Average Lagos speed ~25 km/h accounting for traffic
  return Math.round((distanceKm / 25) * 60);
}

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function generateRideId(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `MOCK-${date}-${rand}`;
}

function findNearestAddress(
  lat: number,
  lon: number
): string | undefined {
  const allLocations = [
    ...Object.values(LAGOS_LOCATIONS),
    ...Object.values(ABUJA_LOCATIONS),
  ];

  let nearest: Location | undefined;
  let minDist = Infinity;

  for (const loc of allLocations) {
    const dist = calculateDistance(lat, lon, loc.latitude, loc.longitude);
    if (dist < minDist) {
      minDist = dist;
      nearest = loc;
    }
  }

  return nearest?.address;
}

function calculateFare(
  distanceKm: number,
  durationMin: number,
  rideType: string,
  surgeMult: number
): { amount: number; min_amount: number; max_amount: number } {
  const config = RIDE_TYPES[rideType];
  if (!config) {
    return { amount: 3000, min_amount: 2500, max_amount: 3500 };
  }

  const baseFare =
    config.base_fare_ngn +
    distanceKm * config.per_km_ngn +
    durationMin * config.per_min_ngn;

  const amount = Math.round(baseFare * surgeMult);
  const min_amount = Math.round(amount * 0.85);
  const max_amount = Math.round(amount * 1.15);

  return { amount, min_amount, max_amount };
}

// --- Mock ride state tracking ---

interface MockStop {
  stop_id: string;
  latitude: number;
  longitude: number;
  address?: string;
  order: number;
}

interface MockRideState {
  ride_id: string;
  status: string;
  driver: Driver;
  pickup: { latitude: number; longitude: number };
  dropoff: { latitude: number; longitude: number };
  stops: MockStop[];
  notes: string | null;
  ride_type: string;
  created_at: string;
}

// --- Provider implementation ---

export class MockProvider implements RideHailingProvider {
  readonly name = "mock";
  readonly supportedCities = ["lagos", "abuja"];

  private rides = new Map<string, MockRideState>();

  async searchRides(params: SearchRidesParams): Promise<SearchResult> {
    const straightDistance = calculateDistance(
      params.pickup_latitude,
      params.pickup_longitude,
      params.dropoff_latitude,
      params.dropoff_longitude
    );
    const roadDistance = straightDistance * 1.3;
    const duration = estimateDuration(roadDistance);
    const surgeMult = Math.random() < 0.2 ? 1.2 + Math.random() * 0.3 : 1.0;

    const typesToShow =
      params.ride_type === "any"
        ? Object.keys(RIDE_TYPES)
        : [params.ride_type];

    const rides: RideOption[] = typesToShow
      .filter((t) => RIDE_TYPES[t])
      .map((rideType) => {
        const config = RIDE_TYPES[rideType]!;
        const fare = calculateFare(roadDistance, duration, rideType, surgeMult);
        const eta = Math.floor(3 + Math.random() * 12);

        return {
          ride_option_id: `${rideType}-${Date.now()}`,
          provider: "mock",
          ride_type: rideType,
          vehicle_description: config.vehicle_description,
          estimated_fare: {
            amount: fare.amount,
            currency: "NGN",
            min_amount: fare.min_amount,
            max_amount: fare.max_amount,
            surge_multiplier: Math.round(surgeMult * 100) / 100,
          },
          eta_minutes: eta,
          estimated_duration_minutes: duration,
          estimated_distance_km: Math.round(roadDistance * 10) / 10,
          max_passengers: config.max_passengers,
          features: config.features,
        };
      });

    return {
      rides,
      pickup: {
        latitude: params.pickup_latitude,
        longitude: params.pickup_longitude,
        address: findNearestAddress(
          params.pickup_latitude,
          params.pickup_longitude
        ),
      },
      dropoff: {
        latitude: params.dropoff_latitude,
        longitude: params.dropoff_longitude,
        address: findNearestAddress(
          params.dropoff_latitude,
          params.dropoff_longitude
        ),
      },
      provider_name: "mock",
      timestamp: new Date().toISOString(),
    };
  }

  async bookRide(params: BookRideParams): Promise<BookingConfirmation> {
    const driver = randomElement(MOCK_DRIVERS);
    const rideId = generateRideId();
    const eta = Math.floor(3 + Math.random() * 12);

    const straightDistance = calculateDistance(
      params.pickup_latitude,
      params.pickup_longitude,
      params.dropoff_latitude,
      params.dropoff_longitude
    );
    const roadDistance = straightDistance * 1.3;
    const duration = estimateDuration(roadDistance);
    const fare = calculateFare(roadDistance, duration, params.ride_type, 1.0);

    this.rides.set(rideId, {
      ride_id: rideId,
      status: "driver_assigned",
      driver,
      pickup: {
        latitude: params.pickup_latitude,
        longitude: params.pickup_longitude,
      },
      dropoff: {
        latitude: params.dropoff_latitude,
        longitude: params.dropoff_longitude,
      },
      stops: [],
      notes: params.notes,
      ride_type: params.ride_type,
      created_at: new Date().toISOString(),
    });

    return {
      ride_id: rideId,
      status: "driver_assigned",
      driver,
      fare: {
        amount: fare.amount,
        currency: "NGN",
        surge_multiplier: 1.0,
      },
      eta_minutes: eta,
      pickup_address: findNearestAddress(
        params.pickup_latitude,
        params.pickup_longitude
      ),
      dropoff_address: findNearestAddress(
        params.dropoff_latitude,
        params.dropoff_longitude
      ),
      created_at: new Date().toISOString(),
    };
  }

  async getRideStatus(rideId: string): Promise<RideStatus> {
    const ride = this.rides.get(rideId);

    if (!ride) {
      throw new Error(`Ride not found: ${rideId}`);
    }

    // Progress the status each time it's called
    const statusFlow = [
      "searching",
      "driver_assigned",
      "en_route_to_pickup",
      "arrived_at_pickup",
      "trip_in_progress",
      "completed",
    ] as const;

    const currentIndex = statusFlow.indexOf(
      ride.status as (typeof statusFlow)[number]
    );
    if (currentIndex >= 0 && currentIndex < statusFlow.length - 1) {
      ride.status = statusFlow[currentIndex + 1]!;
    }

    // Simulate driver location between pickup and dropoff
    const progress = Math.min(currentIndex / (statusFlow.length - 1), 1);
    const currentLat =
      ride.pickup.latitude +
      (ride.dropoff.latitude - ride.pickup.latitude) * progress;
    const currentLon =
      ride.pickup.longitude +
      (ride.dropoff.longitude - ride.pickup.longitude) * progress;

    return {
      ride_id: rideId,
      ride_status: ride.status as RideStatus["ride_status"],
      driver: {
        current_location: {
          latitude: Math.round(currentLat * 10000) / 10000,
          longitude: Math.round(currentLon * 10000) / 10000,
        },
        eta_to_pickup_minutes:
          ride.status === "en_route_to_pickup"
            ? Math.floor(2 + Math.random() * 8)
            : undefined,
        eta_to_dropoff_minutes:
          ride.status === "trip_in_progress"
            ? Math.floor(5 + Math.random() * 25)
            : undefined,
      },
      updated_at: new Date().toISOString(),
    };
  }

  async cancelRide(
    rideId: string,
    _reason: string | null
  ): Promise<CancellationResult> {
    const ride = this.rides.get(rideId);

    if (!ride) {
      throw new Error(`Ride not found: ${rideId}`);
    }

    const hasFee = ride.status === "trip_in_progress";
    ride.status = "cancelled";

    return {
      ride_id: rideId,
      ride_status: "cancelled",
      cancellation_fee: {
        amount: hasFee ? 500 : 0,
        currency: "NGN",
      },
      cancelled_at: new Date().toISOString(),
    };
  }

  async estimateFare(params: EstimateFareParams): Promise<FareEstimateResult> {
    const straightDistance = calculateDistance(
      params.pickup_latitude,
      params.pickup_longitude,
      params.dropoff_latitude,
      params.dropoff_longitude
    );
    const roadDistance = straightDistance * 1.3;
    const duration = estimateDuration(roadDistance);
    const fare = calculateFare(roadDistance, duration, params.ride_type, 1.0);

    return {
      ride_type: params.ride_type,
      estimated_fare: {
        amount: fare.amount,
        currency: "NGN",
        min_amount: fare.min_amount,
        max_amount: fare.max_amount,
        surge_multiplier: 1.0,
      },
      estimated_distance_km: Math.round(roadDistance * 10) / 10,
      estimated_duration_minutes: duration,
    };
  }

  async getRideTypes(city: string): Promise<CityRideTypes[]> {
    const cities =
      city === "" ? this.supportedCities : [city.toLowerCase()];

    return cities
      .filter((c) => this.supportedCities.includes(c))
      .map((c) => ({
        city: c,
        ride_types: Object.entries(RIDE_TYPES).map(([type, config]) => ({
          type,
          description: config.description,
          max_passengers: config.max_passengers,
          base_fare_ngn: config.base_fare_ngn,
          per_km_ngn: config.per_km_ngn,
          per_min_ngn: config.per_min_ngn,
        })),
      }));
  }

  async geocode(query: string, city: string): Promise<GeocodeResult> {
    const normalizedCity = city.toLowerCase();
    const normalizedQuery = query.toLowerCase();
    const entries = GEOCODE_DB[normalizedCity] ?? [];

    const results = entries
      .filter(
        (entry) =>
          entry.name.toLowerCase().includes(normalizedQuery) ||
          entry.address.toLowerCase().includes(normalizedQuery) ||
          normalizedQuery.includes(entry.name.toLowerCase())
      )
      .map((entry) => {
        // Higher confidence for exact-ish matches
        const nameMatch = entry.name
          .toLowerCase()
          .includes(normalizedQuery);
        const confidence = nameMatch ? 0.95 : 0.75;
        return { ...entry, confidence };
      })
      .slice(0, 5);

    return { results };
  }

  async getSupportedCities(): Promise<string[]> {
    return [...this.supportedCities];
  }

  async getPricingInfo(): Promise<PricingInfo> {
    return {
      currency: "NGN",
      pricing_model:
        "Base fare + per-kilometer rate + per-minute rate. Surge pricing may apply during peak hours.",
      base_fares: Object.fromEntries(
        Object.entries(RIDE_TYPES).map(([k, v]) => [k, v.base_fare_ngn])
      ),
      per_km_rates: Object.fromEntries(
        Object.entries(RIDE_TYPES).map(([k, v]) => [k, v.per_km_ngn])
      ),
      per_min_rates: Object.fromEntries(
        Object.entries(RIDE_TYPES).map(([k, v]) => [k, v.per_min_ngn])
      ),
      surge_pricing: {
        description:
          "Surge pricing activates during peak demand periods (rush hour, rain, holidays). Fares may increase by up to 2x the normal rate.",
        max_multiplier: 2.0,
      },
      cancellation_policy: {
        free_cancellation_window_seconds: 120,
        cancellation_fee_ngn: 500,
      },
    };
  }

  async updateRide(params: UpdateRideParams): Promise<UpdateRideResult> {
    const ride = this.rides.get(params.ride_id);
    if (!ride) {
      throw new Error(`Ride not found: ${params.ride_id}`);
    }
    if (ride.status === "completed" || ride.status === "cancelled") {
      throw new Error(`Cannot update ride in "${ride.status}" status`);
    }

    const updatedFields: string[] = [];
    let newFare: UpdateRideResult["new_fare"];
    let newDuration: number | undefined;

    if (
      params.new_dropoff_latitude !== undefined &&
      params.new_dropoff_longitude !== undefined
    ) {
      ride.dropoff = {
        latitude: params.new_dropoff_latitude,
        longitude: params.new_dropoff_longitude,
      };
      updatedFields.push("dropoff");

      // Recalculate total distance including any stops
      const waypoints = [
        ride.pickup,
        ...ride.stops.map((s) => ({ latitude: s.latitude, longitude: s.longitude })),
        ride.dropoff,
      ];
      let totalDistance = 0;
      for (let i = 0; i < waypoints.length - 1; i++) {
        totalDistance += calculateDistance(
          waypoints[i]!.latitude, waypoints[i]!.longitude,
          waypoints[i + 1]!.latitude, waypoints[i + 1]!.longitude
        );
      }
      totalDistance *= 1.3;
      newDuration = estimateDuration(totalDistance);
      const fare = calculateFare(totalDistance, newDuration, ride.ride_type, 1.0);
      newFare = {
        amount: fare.amount,
        currency: "NGN",
        min_amount: fare.min_amount,
        max_amount: fare.max_amount,
        surge_multiplier: 1.0,
      };
    }

    if (params.notes !== undefined) {
      ride.notes = params.notes;
      updatedFields.push("notes");
    }

    return {
      ride_id: params.ride_id,
      updated_fields: updatedFields,
      new_dropoff:
        params.new_dropoff_latitude !== undefined
          ? {
              latitude: ride.dropoff.latitude,
              longitude: ride.dropoff.longitude,
              address: findNearestAddress(ride.dropoff.latitude, ride.dropoff.longitude),
            }
          : undefined,
      new_fare: newFare,
      new_estimated_duration_minutes: newDuration,
      updated_at: new Date().toISOString(),
    };
  }

  async addStop(params: AddStopParams): Promise<AddStopResult> {
    const ride = this.rides.get(params.ride_id);
    if (!ride) {
      throw new Error(`Ride not found: ${params.ride_id}`);
    }
    if (ride.status === "completed" || ride.status === "cancelled") {
      throw new Error(`Cannot add stop to ride in "${ride.status}" status`);
    }

    const stopId = `STOP-${ride.stops.length + 1}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const order = params.stop_order ?? ride.stops.length + 1;

    const stop: MockStop = {
      stop_id: stopId,
      latitude: params.stop_latitude,
      longitude: params.stop_longitude,
      address: findNearestAddress(params.stop_latitude, params.stop_longitude),
      order,
    };

    ride.stops.push(stop);
    ride.stops.sort((a, b) => a.order - b.order);

    // Recalculate total distance with all waypoints
    const waypoints = [
      ride.pickup,
      ...ride.stops.map((s) => ({ latitude: s.latitude, longitude: s.longitude })),
      ride.dropoff,
    ];
    let totalDistance = 0;
    for (let i = 0; i < waypoints.length - 1; i++) {
      totalDistance += calculateDistance(
        waypoints[i]!.latitude, waypoints[i]!.longitude,
        waypoints[i + 1]!.latitude, waypoints[i + 1]!.longitude
      );
    }
    totalDistance *= 1.3;
    const duration = estimateDuration(totalDistance);
    const fare = calculateFare(totalDistance, duration, ride.ride_type, 1.0);

    return {
      ride_id: params.ride_id,
      stop,
      updated_fare: {
        amount: fare.amount,
        currency: "NGN",
        min_amount: fare.min_amount,
        max_amount: fare.max_amount,
        surge_multiplier: 1.0,
      },
      updated_estimated_duration_minutes: duration,
      total_stops: ride.stops.length,
      updated_at: new Date().toISOString(),
    };
  }

  async shareTripInfo(rideId: string): Promise<TripShareInfo> {
    const ride = this.rides.get(rideId);
    if (!ride) {
      throw new Error(`Ride not found: ${rideId}`);
    }

    const pickupAddr =
      findNearestAddress(ride.pickup.latitude, ride.pickup.longitude) ?? "Unknown";
    const dropoffAddr =
      findNearestAddress(ride.dropoff.latitude, ride.dropoff.longitude) ?? "Unknown";

    const shareMessage = [
      `I'm on a ride with ${ride.driver.name}.`,
      `Vehicle: ${ride.driver.vehicle.color} ${ride.driver.vehicle.make} ${ride.driver.vehicle.model}`,
      `Plate: ${ride.driver.vehicle.plate_number}`,
      `From: ${pickupAddr}`,
      `To: ${dropoffAddr}`,
      `Driver phone: ${ride.driver.phone}`,
      `Ride ID: ${rideId}`,
      `Status: ${ride.status}`,
    ].join("\n");

    return {
      ride_id: rideId,
      ride_status: ride.status,
      driver: {
        name: ride.driver.name,
        phone: ride.driver.phone,
        vehicle: ride.driver.vehicle,
      },
      pickup: { ...ride.pickup, address: pickupAddr },
      dropoff: { ...ride.dropoff, address: dropoffAddr },
      share_message: shareMessage,
      created_at: new Date().toISOString(),
    };
  }
}
