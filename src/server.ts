import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { Config } from "./config.js";
import { createProvider } from "./providers/index.js";

export async function createServer(config: Config): Promise<McpServer> {
  const provider = createProvider(config);

  const server = new McpServer({
    name: "mobility-mcp-africa",
    version: "1.0.0",
  });

  // --- Tools ---

  server.tool(
    "search_rides",
    "Search for available rides between two locations. Returns fare estimates, ETAs, and available vehicle types.",
    {
      pickup_latitude: z.number().describe("Pickup location latitude"),
      pickup_longitude: z.number().describe("Pickup location longitude"),
      dropoff_latitude: z.number().describe("Dropoff location latitude"),
      dropoff_longitude: z.number().describe("Dropoff location longitude"),
      ride_type: z
        .enum(["economy", "comfort", "premium", "motorcycle", "tricycle", "any"])
        .default("any")
        .describe("Type of ride"),
      passenger_count: z
        .number()
        .default(1)
        .describe("Number of passengers"),
      scheduled_time: z
        .string()
        .nullable()
        .default(null)
        .describe("ISO 8601 datetime for scheduled rides. null = ride now"),
    },
    async (params) => {
      try {
        const result = await provider.searchRides(params);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ error: true, message }),
            },
          ],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "get_ride_types",
    "Get available ride types and their descriptions for a given city.",
    {
      city: z
        .string()
        .describe("City slug, e.g. 'lagos', 'abuja', 'accra'"),
    },
    async (params) => {
      try {
        const result = await provider.getRideTypes(params.city);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ error: true, message }),
            },
          ],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "book_ride",
    "Book a ride. Returns booking confirmation with ride ID, driver details, and ETA.",
    {
      pickup_latitude: z.number().describe("Pickup location latitude"),
      pickup_longitude: z.number().describe("Pickup location longitude"),
      dropoff_latitude: z.number().describe("Dropoff location latitude"),
      dropoff_longitude: z.number().describe("Dropoff location longitude"),
      ride_type: z
        .enum(["economy", "comfort", "premium", "motorcycle", "tricycle"])
        .describe("Type of ride to book"),
      passenger_name: z
        .string()
        .describe("Full name of the passenger"),
      passenger_phone: z
        .string()
        .describe("Phone number with country code, e.g. +2348012345678"),
      payment_method: z
        .enum(["cash", "card", "wallet"])
        .default("cash")
        .describe("Payment method"),
      notes: z
        .string()
        .nullable()
        .default(null)
        .describe("Instructions for driver"),
    },
    async (params) => {
      try {
        const result = await provider.bookRide(params);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ error: true, message }),
            },
          ],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "get_ride_status",
    "Get real-time status of a booked ride. Returns driver location, ETA, and current status.",
    {
      ride_id: z.string().describe("The ride booking ID"),
    },
    async (params) => {
      try {
        const result = await provider.getRideStatus(params.ride_id);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ error: true, message }),
            },
          ],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "cancel_ride",
    "Cancel a booked ride. Returns cancellation confirmation and any applicable fees.",
    {
      ride_id: z.string().describe("The ride booking ID"),
      reason: z
        .string()
        .nullable()
        .default(null)
        .describe("Reason for cancellation"),
    },
    async (params) => {
      try {
        const result = await provider.cancelRide(
          params.ride_id,
          params.reason
        );
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ error: true, message }),
            },
          ],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "estimate_fare",
    "Get a fare estimate without booking. Returns price range, distance, and estimated duration.",
    {
      pickup_latitude: z.number().describe("Pickup location latitude"),
      pickup_longitude: z.number().describe("Pickup location longitude"),
      dropoff_latitude: z.number().describe("Dropoff location latitude"),
      dropoff_longitude: z.number().describe("Dropoff location longitude"),
      ride_type: z
        .enum(["economy", "comfort", "premium", "motorcycle", "tricycle"])
        .default("economy")
        .describe("Type of ride"),
    },
    async (params) => {
      try {
        const result = await provider.estimateFare(params);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ error: true, message }),
            },
          ],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "geocode_location",
    "Convert a place name or address to coordinates. Useful when user gives location names like 'Eko Hotel' instead of coordinates.",
    {
      query: z
        .string()
        .describe(
          "Place name or address, e.g. 'Murtala Muhammed Airport Lagos'"
        ),
      city: z
        .string()
        .default("lagos")
        .describe("City context for better results"),
    },
    async (params) => {
      try {
        const result = await provider.geocode(params.query, params.city);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ error: true, message }),
            },
          ],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "update_ride",
    "Update an active ride. Can change destination or update driver notes. Returns updated fare if destination changed.",
    {
      ride_id: z.string().describe("The ride booking ID"),
      new_dropoff_latitude: z
        .number()
        .optional()
        .describe("New dropoff latitude"),
      new_dropoff_longitude: z
        .number()
        .optional()
        .describe("New dropoff longitude"),
      notes: z
        .string()
        .nullable()
        .optional()
        .describe("Updated instructions for driver"),
    },
    async (params) => {
      try {
        const result = await provider.updateRide(params);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ error: true, message }),
            },
          ],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "add_stop",
    "Add an intermediate stop to an active ride. Returns updated fare and total estimated duration.",
    {
      ride_id: z.string().describe("The ride booking ID"),
      stop_latitude: z.number().describe("Stop location latitude"),
      stop_longitude: z.number().describe("Stop location longitude"),
      stop_order: z
        .number()
        .optional()
        .describe("Position in the stop sequence. Defaults to next available."),
    },
    async (params) => {
      try {
        const result = await provider.addStop(params);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ error: true, message }),
            },
          ],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "share_trip",
    "Generate a trip details message that can be shared with friends/family for safety. Includes driver name, vehicle details, plate number, and route.",
    {
      ride_id: z.string().describe("The ride booking ID"),
    },
    async (params) => {
      try {
        const result = await provider.shareTripInfo(params.ride_id);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ error: true, message }),
            },
          ],
          isError: true,
        };
      }
    }
  );

  // --- Resources ---

  server.resource(
    "supported-cities",
    "ridehailing://cities",
    async () => ({
      contents: [
        {
          uri: "ridehailing://cities",
          text: JSON.stringify(await provider.getSupportedCities()),
          mimeType: "application/json",
        },
      ],
    })
  );

  server.resource(
    "pricing-info",
    "ridehailing://pricing-info",
    async () => ({
      contents: [
        {
          uri: "ridehailing://pricing-info",
          text: JSON.stringify(await provider.getPricingInfo(), null, 2),
          mimeType: "application/json",
        },
      ],
    })
  );

  return server;
}
