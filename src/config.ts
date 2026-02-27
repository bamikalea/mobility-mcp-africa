import "dotenv/config";

export interface Config {
  provider: "mock" | "zeno";
  zeno: {
    apiKey: string;
    baseUrl: string;
  };
}

export function loadConfig(): Config {
  const provider = (process.env.PROVIDER || "mock") as Config["provider"];

  if (provider !== "mock" && provider !== "zeno") {
    throw new Error(
      `Invalid PROVIDER "${provider}". Must be "mock" or "zeno".`
    );
  }

  const config: Config = {
    provider,
    zeno: {
      apiKey: process.env.ZENO_API_KEY || "",
      baseUrl: process.env.ZENO_BASE_URL || "https://api.zeno.ng/v1",
    },
  };

  if (config.provider === "zeno" && !config.zeno.apiKey) {
    throw new Error(
      "ZENO_API_KEY environment variable is required when PROVIDER=zeno"
    );
  }

  return config;
}
