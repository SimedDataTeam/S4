import { type NextRequest } from "next/server";
import { env } from "~/env";
import { authHeaderSnowstorm } from "~/utils/snowstorm";

// Prefix length of the API path, accounting for '/snowstorm'
const pathPrefixLength = 10;

// Define possible paths for different API endpoints
const paths = {
  eclStringToModel: "/util/ecl-string-to-model",
  eclModelToString: "/util/ecl-model-to-string",
  concepts: "/MAIN/concepts",
  attributes: "/mrcm/MAIN/domain-attributes",
} as const;

// Main handler function for handling different API requests
const handler = async (request: NextRequest) => {
  const method = request.method; // Get the HTTP method (GET, POST, etc.)
  const pathname = new URL(request.url).pathname.slice(pathPrefixLength); // Extract the path after the prefix

  // Handle POST requests for converting ECL strings to models
  if (pathname === paths.eclStringToModel && method === "POST") {
    const response = await fetch(env.SNOWSTORM_SERVER + pathname, {
      method,
      body: await request.text(),
      headers: authHeaderSnowstorm,
    }).then((res) => res.text());
    return Response.json(JSON.parse(response));
  }

  // Handle POST requests for converting ECL models to strings
  if (pathname === paths.eclModelToString && method === "POST") {
    const response = await fetch(env.SNOWSTORM_SERVER + pathname, {
      method,
      body: JSON.stringify(await request.json()),
      headers: authHeaderSnowstorm,
    }).then((res) => res.text());
    return Response.json(JSON.parse(response));
  }

  // Handle GET requests for domain attributes with language-specific headers
  if (pathname.includes(paths.attributes) && method === "GET") {
    const headers = request.headers;
    const acceptLanguage = headers.get("Accept-Language");
    if (!acceptLanguage) {
      return new Response("Accept-Language header is required", {
        status: 400,
      });
    }

    const response = await fetch(
      env.SNOWSTORM_SERVER + pathname + request.nextUrl.search,
      {
        method,
        headers: {
          "Accept-Language": acceptLanguage,
          ...authHeaderSnowstorm,
        },
      },
    ).then((res) => res.text());
    return Response.json(JSON.parse(response));
  }

  // Handle GET requests for concepts with language-specific headers
  if (pathname.includes(paths.concepts) && method === "GET") {
    const headers = request.headers;
    const acceptLanguage = headers.get("Accept-Language");
    if (!acceptLanguage) {
      return new Response("Accept-Language header is required", {
        status: 400,
      });
    }

    const response = await fetch(
      env.SNOWSTORM_SERVER + pathname + request.nextUrl.search,
      {
        method,
        headers: {
          "Accept-Language": acceptLanguage,
          ...authHeaderSnowstorm,
        },
      },
    ).then((res) => res.text());
    return Response.json(JSON.parse(response));
  }

  // If no matching route is found, return a 404 Not Found response
  return new Response("Not Found", { status: 404 });
};

// Export the handler for both GET and POST methods
export { handler as GET, handler as POST };
