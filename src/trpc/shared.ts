import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";
import superjson from "superjson";

import { type AppRouter } from "~/server/api/root";

export const transformer = superjson;

/**
 * Function to get the base URL of the application.
 * - Returns an empty string if running in the browser.
 * - Returns the Vercel URL if deployed on Vercel.
 * - Defaults to localhost with the appropriate port during development.
 */
function getBaseUrl() {
  if (typeof window !== "undefined") return ""; // Running in the browser
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // Deployed on Vercel
  return `http://localhost:${process.env.PORT ?? 3000}`; // Development environment
}

/**
 * Function to get the full API URL for tRPC.
 * Combines the base URL with the tRPC API endpoint.
 */
export function getUrl() {
  return getBaseUrl() + "/api/trpc";
}

/**
 * Inference helper for inputs.
 *
 * @example type HelloInput = RouterInputs['example']['hello']
 */
export type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Inference helper for outputs.
 *
 * @example type HelloOutput = RouterOutputs['example']['hello']
 */
export type RouterOutputs = inferRouterOutputs<AppRouter>;
