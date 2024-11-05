import { env } from "~/env"; // Importing environment variables

// Define the authorization header for Snowstorm API requests.
// If both login and password are provided in the environment variables, a Basic Auth header is created.
// Otherwise, an empty object is returned.
export const authHeaderSnowstorm:
  | { Authorization: string }
  | Record<string, never> =
  env.SNOWSTORM_LOGIN && env.SNOWSTORM_PASSWORD
    ? {
        Authorization: `Basic ${Buffer.from(
          `${env.SNOWSTORM_LOGIN}:${env.SNOWSTORM_PASSWORD}`,
        ).toString("base64")}`,
      }
    : {};
