import { env } from "~/env";
import { createTRPCRouter, publicProcedure } from "../trpc";

// Create and export a TRPC router with a single procedure
export default createTRPCRouter({
  // Define a public procedure to get the Snowstorm server URL from environment variables
  getSnowstormServer: publicProcedure.query(() => env.SNOWSTORM_SERVER),
});
