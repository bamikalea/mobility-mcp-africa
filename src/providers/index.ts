import type { Config } from "../config.js";
import type { RideHailingProvider } from "./base.js";
import { MockProvider } from "./mock.js";
import { LiveProvider } from "./live.js";

export function createProvider(config: Config): RideHailingProvider {
  switch (config.provider) {
    case "mock":
      return new MockProvider();
    case "live":
      return new LiveProvider(config.live.baseUrl, config.live.apiKey);
    default:
      throw new Error(
        `Unknown provider: ${config.provider}. Use "mock" or "live".`
      );
  }
}

export type { RideHailingProvider } from "./base.js";
