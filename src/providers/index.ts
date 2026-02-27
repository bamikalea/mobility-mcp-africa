import type { Config } from "../config.js";
import type { RideHailingProvider } from "./base.js";
import { MockProvider } from "./mock.js";
import { ZenoProvider } from "./zeno.js";

export function createProvider(config: Config): RideHailingProvider {
  switch (config.provider) {
    case "mock":
      return new MockProvider();
    case "zeno":
      return new ZenoProvider(config.zeno.baseUrl, config.zeno.apiKey);
    default:
      throw new Error(
        `Unknown provider: ${config.provider}. Use "mock" or "zeno".`
      );
  }
}

export type { RideHailingProvider } from "./base.js";
