import { describe, it, expect, beforeEach } from "vitest";
import { createServer } from "../src/server.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import type { Config } from "../src/config.js";

const MOCK_CONFIG: Config = {
  provider: "mock",
  live: { apiKey: "", baseUrl: "" },
};

describe("MCP Server", () => {
  let client: Client;

  beforeEach(async () => {
    const server = await createServer(MOCK_CONFIG);
    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair();

    await server.connect(serverTransport);

    client = new Client({ name: "test-client", version: "1.0.0" });
    await client.connect(clientTransport);
  });

  describe("tool listing", () => {
    it("lists all 10 tools", async () => {
      const { tools } = await client.listTools();
      const names = tools.map((t) => t.name);

      expect(names).toContain("search_rides");
      expect(names).toContain("get_ride_types");
      expect(names).toContain("book_ride");
      expect(names).toContain("get_ride_status");
      expect(names).toContain("cancel_ride");
      expect(names).toContain("estimate_fare");
      expect(names).toContain("geocode_location");
      expect(names).toContain("update_ride");
      expect(names).toContain("add_stop");
      expect(names).toContain("share_trip");
      expect(tools).toHaveLength(10);
    });
  });

  describe("resource listing", () => {
    it("lists both resources", async () => {
      const { resources } = await client.listResources();
      const uris = resources.map((r) => r.uri);

      expect(uris).toContain("ridehailing://cities");
      expect(uris).toContain("ridehailing://pricing-info");
      expect(resources).toHaveLength(2);
    });
  });

  describe("search_rides tool", () => {
    it("returns ride options for a route", async () => {
      const result = await client.callTool({
        name: "search_rides",
        arguments: {
          pickup_latitude: 6.5777,
          pickup_longitude: 3.3213,
          dropoff_latitude: 6.4281,
          dropoff_longitude: 3.4219,
        },
      });

      expect(result.isError).toBeFalsy();
      const content = result.content as Array<{ type: string; text: string }>;
      const data = JSON.parse(content[0]!.text);
      expect(data.rides.length).toBeGreaterThan(0);
      expect(data.provider_name).toBe("mock");
    });
  });

  describe("geocode_location tool", () => {
    it("geocodes Eko Hotel", async () => {
      const result = await client.callTool({
        name: "geocode_location",
        arguments: {
          query: "eko hotel",
          city: "lagos",
        },
      });

      expect(result.isError).toBeFalsy();
      const content = result.content as Array<{ type: string; text: string }>;
      const data = JSON.parse(content[0]!.text);
      expect(data.results.length).toBeGreaterThan(0);
    });
  });

  describe("book_ride tool", () => {
    it("books a ride and returns confirmation", async () => {
      const result = await client.callTool({
        name: "book_ride",
        arguments: {
          pickup_latitude: 6.5777,
          pickup_longitude: 3.3213,
          dropoff_latitude: 6.4281,
          dropoff_longitude: 3.4219,
          ride_type: "economy",
          passenger_name: "Test User",
          passenger_phone: "+2348012345678",
          payment_method: "cash",
        },
      });

      expect(result.isError).toBeFalsy();
      const content = result.content as Array<{ type: string; text: string }>;
      const data = JSON.parse(content[0]!.text);
      expect(data.ride_id).toMatch(/^MOCK-/);
      expect(data.status).toBe("driver_assigned");
      expect(data.driver).toBeDefined();
    });
  });

  describe("get_ride_status tool", () => {
    it("returns error for nonexistent ride", async () => {
      const result = await client.callTool({
        name: "get_ride_status",
        arguments: { ride_id: "NONEXISTENT" },
      });

      expect(result.isError).toBe(true);
      const content = result.content as Array<{ type: string; text: string }>;
      const data = JSON.parse(content[0]!.text);
      expect(data.error).toBe(true);
    });
  });

  describe("estimate_fare tool", () => {
    it("returns fare estimate", async () => {
      const result = await client.callTool({
        name: "estimate_fare",
        arguments: {
          pickup_latitude: 6.6018,
          pickup_longitude: 3.3515,
          dropoff_latitude: 6.4474,
          dropoff_longitude: 3.4737,
          ride_type: "comfort",
        },
      });

      expect(result.isError).toBeFalsy();
      const content = result.content as Array<{ type: string; text: string }>;
      const data = JSON.parse(content[0]!.text);
      expect(data.ride_type).toBe("comfort");
      expect(data.estimated_fare.currency).toBe("NGN");
    });
  });

  describe("get_ride_types tool", () => {
    it("returns ride types for Lagos", async () => {
      const result = await client.callTool({
        name: "get_ride_types",
        arguments: { city: "lagos" },
      });

      expect(result.isError).toBeFalsy();
      const content = result.content as Array<{ type: string; text: string }>;
      const data = JSON.parse(content[0]!.text);
      expect(data).toHaveLength(1);
      expect(data[0].city).toBe("lagos");
    });
  });

  describe("resources", () => {
    it("reads supported cities", async () => {
      const result = await client.readResource({
        uri: "ridehailing://cities",
      });

      const text = (result.contents[0] as { text: string }).text;
      const cities = JSON.parse(text);
      expect(cities).toContain("lagos");
      expect(cities).toContain("abuja");
    });

    it("reads pricing info", async () => {
      const result = await client.readResource({
        uri: "ridehailing://pricing-info",
      });

      const text = (result.contents[0] as { text: string }).text;
      const pricing = JSON.parse(text);
      expect(pricing.currency).toBe("NGN");
    });
  });

  describe("update_ride tool", () => {
    it("updates ride destination and returns new fare", async () => {
      // First book a ride
      const bookResult = await client.callTool({
        name: "book_ride",
        arguments: {
          pickup_latitude: 6.5777,
          pickup_longitude: 3.3213,
          dropoff_latitude: 6.4281,
          dropoff_longitude: 3.4219,
          ride_type: "economy",
          passenger_name: "Test User",
          passenger_phone: "+2348012345678",
        },
      });
      const bookData = JSON.parse(
        (bookResult.content as Array<{ text: string }>)[0]!.text
      );

      // Update destination
      const result = await client.callTool({
        name: "update_ride",
        arguments: {
          ride_id: bookData.ride_id,
          new_dropoff_latitude: 6.4474,
          new_dropoff_longitude: 3.4737,
        },
      });

      expect(result.isError).toBeFalsy();
      const data = JSON.parse(
        (result.content as Array<{ text: string }>)[0]!.text
      );
      expect(data.updated_fields).toContain("dropoff");
      expect(data.new_fare).toBeDefined();
      expect(data.new_fare.currency).toBe("NGN");
    });

    it("returns error for nonexistent ride", async () => {
      const result = await client.callTool({
        name: "update_ride",
        arguments: { ride_id: "FAKE-123", notes: "test" },
      });
      expect(result.isError).toBe(true);
    });
  });

  describe("add_stop tool", () => {
    it("adds a stop and returns updated fare", async () => {
      const bookResult = await client.callTool({
        name: "book_ride",
        arguments: {
          pickup_latitude: 6.5777,
          pickup_longitude: 3.3213,
          dropoff_latitude: 6.4281,
          dropoff_longitude: 3.4219,
          ride_type: "comfort",
          passenger_name: "Test User",
          passenger_phone: "+2348012345678",
        },
      });
      const bookData = JSON.parse(
        (bookResult.content as Array<{ text: string }>)[0]!.text
      );

      const result = await client.callTool({
        name: "add_stop",
        arguments: {
          ride_id: bookData.ride_id,
          stop_latitude: 6.4474,
          stop_longitude: 3.4737,
        },
      });

      expect(result.isError).toBeFalsy();
      const data = JSON.parse(
        (result.content as Array<{ text: string }>)[0]!.text
      );
      expect(data.stop.stop_id).toMatch(/^STOP-/);
      expect(data.total_stops).toBe(1);
      expect(data.updated_fare.currency).toBe("NGN");
    });
  });

  describe("share_trip tool", () => {
    it("generates trip sharing info", async () => {
      const bookResult = await client.callTool({
        name: "book_ride",
        arguments: {
          pickup_latitude: 6.5777,
          pickup_longitude: 3.3213,
          dropoff_latitude: 6.4281,
          dropoff_longitude: 3.4219,
          ride_type: "economy",
          passenger_name: "Test User",
          passenger_phone: "+2348012345678",
        },
      });
      const bookData = JSON.parse(
        (bookResult.content as Array<{ text: string }>)[0]!.text
      );

      const result = await client.callTool({
        name: "share_trip",
        arguments: { ride_id: bookData.ride_id },
      });

      expect(result.isError).toBeFalsy();
      const data = JSON.parse(
        (result.content as Array<{ text: string }>)[0]!.text
      );
      expect(data.share_message).toContain("Vehicle:");
      expect(data.share_message).toContain("Plate:");
      expect(data.driver.name).toBeDefined();
      expect(data.driver.vehicle).toBeDefined();
    });

    it("returns error for nonexistent ride", async () => {
      const result = await client.callTool({
        name: "share_trip",
        arguments: { ride_id: "FAKE-123" },
      });
      expect(result.isError).toBe(true);
    });
  });
});
