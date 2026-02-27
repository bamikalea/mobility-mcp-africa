import "dotenv/config";

export interface Config {
  provider: "mock" | "live";
  live: {
    apiKey: string;
    baseUrl: string;
  };
}

export function loadConfig(): Config {
  const provider = (process.env.PROVIDER || "mock") as Config["provider"];

  if (provider !== "mock" && provider !== "live") {
    throw new Error(
      `Invalid PROVIDER "${provider}". Must be "mock" or "live".`
    );
  }

  const config: Config = {
    provider,
    live: {
      apiKey: process.env.RIDEHAILING_API_KEY || "",
      baseUrl: process.env.RIDEHAILING_BASE_URL || "",
    },
  };

  if (config.provider === "live" && !config.live.apiKey) {
    throw new Error(
      "RIDEHAILING_API_KEY environment variable is required when PROVIDER=live"
    );
  }

  return config;
}
