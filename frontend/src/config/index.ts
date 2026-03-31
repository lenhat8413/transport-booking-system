/**
 * Centralized frontend configuration.
 * All values default to localhost for local development.
 * Override by setting the corresponding env variables in .env.
 */
const config = {
  /** Base URL for REST API calls (no trailing slash) */
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api",

  /** WebSocket server URL — used by socket.io-client */
  wsUrl: process.env.NEXT_PUBLIC_WS_URL ?? "http://localhost:3000",

  /** How many seconds a seat hold lasts (must match backend env.seatHoldTtlMinutes) */
  seatHoldDurationSeconds: 15 * 60,

  /** Fixed seat-selection fee by class in VND */
  seatSelectionFees: {
    economy: 450_000,
    business: 0,
  },

  /** Backward-compatible alias for older seat-map code */
  defaultSeatPrice: 450_000,
} as const;

export default config;
