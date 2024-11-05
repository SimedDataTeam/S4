import misc from "~/server/api/routers/misc";
import sphndict from "~/server/api/routers/sphndict";
import { createTRPCRouter } from "~/server/api/trpc";

export const appRouter = createTRPCRouter({ misc, sphndict });

export type AppRouter = typeof appRouter;
