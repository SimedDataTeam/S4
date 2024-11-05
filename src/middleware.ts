import { type NextRequest, NextResponse } from "next/server";
import { env } from "~/env";

export const middleware = (req: NextRequest) => {
  const { BASIC_AUTH } = env;
  if (!BASIC_AUTH) {
    return NextResponse.next();
  }

  const basicAuth = req.headers.get("authorization");
  if (basicAuth && atob(basicAuth.slice(6)) === BASIC_AUTH) {
    return NextResponse.next();
  }

  return NextResponse.json(
    { error: "Unauthorized" },
    {
      status: 401,
      headers: {
        "WWW-Authenticate": `Basic realm="User Visible Realm"`,
      },
    },
  );
};
