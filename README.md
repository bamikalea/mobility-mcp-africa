# mobility-mcp-africa

Africa's first open-standard MCP server for ride-hailing. Enables AI agents (Claude, GPT, Gemini) to search, book, and manage rides via the [Model Context Protocol](https://modelcontextprotocol.io).

## Why This Exists

The travel industry is shifting to AI agent-based booking. Google, Booking.com, and Expedia are building agents that book travel on behalf of users. These agents need standardized APIs to connect to — and MCP is that standard.

**No ride-hailing provider in Africa currently has an MCP-compatible API.** This project changes that by providing:

1. A **generic provider interface** that any ride-hailing company can implement
2. A **working MCP server** with tools for searching, booking, tracking, and cancelling rides
3. A **mock provider** with realistic Nigerian data for development and demos
4. A **Zeno provider** as the first real integration

## Architecture

```
AI Agent (Claude, GPT, Gemini, etc.)
        |
        | MCP Protocol (stdio)
        v
+---------------------------+
| mobility-mcp-africa       |
| (MCP Server)              |
|                           |
| 10 Tools + 2 Resources    |
|                           |
|  Provider Abstraction     |
|  ├── MockProvider (dev)   |
|  ├── ZenoProvider (live)  |
|  └── YourProvider (add!)  |
+---------------------------+
        |
        | REST API
        v
  Ride-Hailing Provider API
```

## Quick Start

### Install

```bash
git clone https://github.com/your-org/mobility-mcp-africa.git
cd mobility-mcp-africa
npm install
```

### Run with Mock Provider

```bash
# No API keys needed — uses realistic Lagos mock data
PROVIDER=mock npx tsx src/index.ts
```

### Test with MCP Inspector

```bash
npx @modelcontextprotocol/inspector npx tsx src/index.ts
```

This opens a web UI where you can test all tools interactively.

### Use with Claude Desktop

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "mobility-africa": {
      "command": "npx",
      "args": ["tsx", "/path/to/mobility-mcp-africa/src/index.ts"],
      "env": {
        "PROVIDER": "mock"
      }
    }
  }
}
```

Restart Claude Desktop. You can now ask: *"Find me a ride from the airport to Victoria Island in Lagos"*.

## Available Tools

| Tool | Description |
|------|-------------|
| `search_rides` | Search for available rides between two locations. Returns fare estimates, ETAs, and vehicle types. |
| `get_ride_types` | Get available ride types (economy, comfort, premium, motorcycle, tricycle) for a city. |
| `book_ride` | Book a ride. Returns confirmation with ride ID, driver details, and ETA. |
| `get_ride_status` | Get real-time status of a booked ride (driver location, ETA, current status). |
| `cancel_ride` | Cancel a booked ride. Returns cancellation confirmation and any fees. |
| `estimate_fare` | Get a fare estimate without booking. Returns price range, distance, and duration. |
| `geocode_location` | Convert a place name (e.g., "Eko Hotel") to coordinates. |
| `update_ride` | Update an active ride — change destination or update driver notes. Returns updated fare if destination changed. |
| `add_stop` | Add an intermediate stop to an active ride. Returns updated fare and total estimated duration. |
| `share_trip` | Generate a trip details message for sharing with friends/family for safety. Includes driver, vehicle, plate, and route. |

## Available Resources

| Resource | URI | Description |
|----------|-----|-------------|
| Supported Cities | `ridehailing://cities` | List of cities where service is available |
| Pricing Info | `ridehailing://pricing-info` | Pricing structure, surge rules, cancellation policy |

## Configuration

| Env Variable | Default | Description |
|-------------|---------|-------------|
| `PROVIDER` | `mock` | Provider to use: `mock` or `zeno` |
| `ZENO_API_KEY` | — | API key for Zeno (required when PROVIDER=zeno) |
| `ZENO_BASE_URL` | `https://api.zeno.ng/v1` | Zeno API base URL |

## Adding a New Provider

Any ride-hailing company can integrate by implementing the `RideHailingProvider` interface. See [docs/ADDING_A_PROVIDER.md](docs/ADDING_A_PROVIDER.md) for a step-by-step guide.

## Testing

```bash
# Run all tests (65 tests)
npm test

# Run tests in watch mode
npm run test:watch

# Build TypeScript
npm run build
```

## Supported Ride Types

| Type | Description | Max Passengers |
|------|-------------|----------------|
| economy | Affordable everyday rides | 4 |
| comfort | Spacious and comfortable | 4 |
| premium | Luxury vehicles with top-rated drivers | 4 |
| motorcycle | Fast two-wheel rides (okada) | 1 |
| tricycle | Three-wheel keke rides | 3 |

## Supported Cities

- Lagos, Nigeria
- Abuja, Nigeria
- More coming soon

## Related Projects

- [TripAgentic](../tripagentic/) — The WhatsApp-first AI agent that uses this MCP server to book rides, with proactive status updates, voice notes, and multi-LLM support.

## Contributing

See [CONTRIBUTING.md](.github/CONTRIBUTING.md) for guidelines.

## License

[MIT](LICENSE)
