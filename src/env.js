import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]),
    SNOWSTORM_SERVER: z.string(),
    SNOWSTORM_LOGIN: z.string().optional(),
    SNOWSTORM_PASSWORD: z.string().optional(),
    BASIC_AUTH: z.string().optional(),
  },
  client: {},
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    SNOWSTORM_SERVER: process.env.SNOWSTORM_SERVER,
    SNOWSTORM_LOGIN: process.env.SNOWSTORM_LOGIN,
    SNOWSTORM_PASSWORD: process.env.SNOWSTORM_PASSWORD,
    BASIC_AUTH: process.env.BASIC_AUTH,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
