import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import dictionnary_2024 from "~/data/sct_to_sphn_2024.json";
import dictionnary_2023 from "~/data/sct_to_sphn_2023.json";
import valuesets_2024 from "~/data/valueset_SPHN_2024.json";
import valuesets_2023 from "~/data/valueset_SPHN_2023.json";
import { env } from "~/env";
import { authHeaderSnowstorm } from "~/utils/snowstorm";

// Constants for pagination
const OFFSET = 0;
const LIMIT = 10000;

type ConceptEntry = {
  sphnConcepts: string[];
};

interface ValueSetEntry {
  SCT: string;
  SPHN_concepts: string[];
  valueset_type?: string | undefined;
}

// Schema for parsing the Snowstorm API response
const snowStormResponseParser = z.object({
  items: z.object({ conceptId: z.string(), idAndFsnTerm: z.string() }).array(),
  total: z.number(),
  searchAfter: z.string().optional(),
});

// Function to flatten and deduplicate SPHN concepts
const flattenAndDeduplicateConcepts = (entries: ConceptEntry[]): string[] => {
  const result = Array.from(
    new Set(entries.flatMap((entry) => entry.sphnConcepts)),
  );
  return result;
};

// Function to process and map value sets
const processValueSetMap = (valuesets: ValueSetEntry[]) => {
  const valueSetMap = new Map<
    string,
    { sphnConcepts: string[]; valueSetType: string | undefined }
  >();
  valuesets.forEach((entry) => {
    const sctCodes = entry.SCT.split(";");
    sctCodes.forEach((sctCode) => {
      sctCode = sctCode.replace(/[\u200B-\u200D\uFEFF]/g, "");
      const trimmedSctCode = sctCode.trim().split(" |")[0]?.trim(); // Keep only numerical code
      // set entry in the map
      trimmedSctCode &&
        valueSetMap.set(trimmedSctCode, {
          sphnConcepts: entry.SPHN_concepts,
          valueSetType: entry.valueset_type,
        });
    });
  });
  return valueSetMap;
};

export default createTRPCRouter({
  // Procedure to make a query to the Snowstorm API and process results
  makeQuery: publicProcedure
    .input(z.object({ query: z.string(), year: z.string() }))
    .mutation(async ({ input }) => {
      // Choose the dictionary based on the selected year
      const dictionnary =
        input.year === "2023" ? dictionnary_2023 : dictionnary_2024;

      // Map the dictionary data for quick lookups
      const dictionaryMap = new Map(
        dictionnary.map((entry) => [
          entry.SCT.split(" |")[0],
          entry.SPHN_Concepts,
        ]),
      );

      // Process the corresponding value set map
      const valueSet = input.year === "2023" ? valuesets_2023 : valuesets_2024;
      const valueSetMap = processValueSetMap(valueSet);
      // Construct the Snowstorm API request URL
      const requestUrl = `${
        env.SNOWSTORM_SERVER
      }/MAIN/concepts?ecl=${encodeURIComponent(
        input.query,
      )}&offset=${OFFSET}&limit=${LIMIT}`;
      try {
        // Fetch results from Snowstorm API
        const snowstorm_result = await fetch(requestUrl, {
          headers: {
            "Accept-Language": "en-US,en;q=0.9",
            ...authHeaderSnowstorm,
          },
        })
          .then((response) => response.json())
          .then((jsonResponse) => snowStormResponseParser.parse(jsonResponse));

        const total = snowstorm_result.total;

        let snomed_list = snowstorm_result.items.map(
          (item) => item.idAndFsnTerm,
        );
        let parsed = snowstorm_result.items;

        // Handle pagination if more results are available
        let searchAfter = snowstorm_result.searchAfter
          ? snowstorm_result.searchAfter
          : undefined;

        while (parsed.length < total && searchAfter) {
          const searchAfterToken = encodeURIComponent(searchAfter);
          const nextResultsURL = `${
            env.SNOWSTORM_SERVER
          }/MAIN/concepts?ecl=${encodeURIComponent(
            input.query,
          )}&offset=0&limit=${LIMIT}&searchAfter=${searchAfterToken}`;
          const nextPageResult = await fetch(nextResultsURL, {
            headers: {
              "Accept-Language": "en-US,en;q=0.9",
              ...authHeaderSnowstorm,
            },
          })
            .then((response) => response.json())
            .then((jsonResponse) =>
              snowStormResponseParser.parse(jsonResponse),
            );

          parsed = parsed.concat(nextPageResult.items);
          snomed_list = snomed_list.concat(
            nextPageResult.items.map((item) => item.idAndFsnTerm),
          );
          searchAfter = nextPageResult.searchAfter;
        }

        // Map SNOMED concepts to SPHN concepts
        const resultsConcepts: ConceptEntry[] = [];
        parsed.forEach(({ conceptId }) => {
          const sphnConcepts = dictionaryMap.get(conceptId);
          if (
            sphnConcepts &&
            Array.isArray(sphnConcepts) &&
            sphnConcepts.every((item) => typeof item === "string")
          ) {
            resultsConcepts.push({
              sphnConcepts,
            });
          }
        });
        // Map SNOMED concepts to value sets
        const resultsValuesets: ConceptEntry[] = [];
        parsed.forEach(({ conceptId }) => {
          const entry = valueSetMap.get(conceptId);
          if (entry) {
            resultsValuesets.push({ sphnConcepts: entry.sphnConcepts });
          }
        });
        // Query for ancestors and add corresponding value sets
        const regex = /\d+ \|[^|]+\|/;

        let matchResult = input.query.match(regex);
        if (!matchResult) {
          const regex2 = /\d+\|\w+\|/;
          matchResult = input.query.match(regex2);
        }
        const originalSnomedConcept = matchResult ? matchResult[0] : null;
        const getAncestorsQuery = ">> " + originalSnomedConcept;
        const getAncestorsURL = `${
          env.SNOWSTORM_SERVER
        }/MAIN/concepts?ecl=${encodeURIComponent(
          getAncestorsQuery,
        )}&offset=${OFFSET}&limit=${LIMIT}`;
        const ancestors = await fetch(getAncestorsURL, {
          headers: {
            "Accept-Language": "en-US,en;q=0.9",
            ...authHeaderSnowstorm,
          },
        })
          .then((response) => response.json())
          .then((jsonResponse) => {
            return snowStormResponseParser.parse(jsonResponse);
          })
          .then((parsedResponse) => parsedResponse.items);

        // Add ancestor value sets to results
        ancestors.forEach(({ conceptId }) => {
          const entry = valueSetMap.get(conceptId);
          if (entry && entry.valueSetType != "fixed") {
            resultsValuesets.push({ sphnConcepts: entry.sphnConcepts });
          }
        });

        // Flatten and deduplicate results
        const flat_results_concepts =
          flattenAndDeduplicateConcepts(resultsConcepts);
        const flat_results_valuesets =
          flattenAndDeduplicateConcepts(resultsValuesets);

        // Return combined results based on available data
        if (flat_results_concepts.length && flat_results_valuesets.length) {
          return [
            flat_results_concepts,
            flat_results_valuesets,
            total,
            snomed_list,
          ];
        }
        if (flat_results_concepts.length) {
          return ["Concepts", flat_results_concepts, total, snomed_list];
        }
        if (flat_results_valuesets.length) {
          return ["Value Sets", flat_results_valuesets, total, snomed_list];
        }
        return false;
      } catch (error) {
        console.error("Procedure error:", error);
        throw error; // Re-throw the error so tRPC can handle it.
      }
    }),

  // Procedure to retrieve the dictionary for the specified year
  mapping: publicProcedure
    .input(z.object({ year: z.string() }))
    .query(async ({ input }) => {
      return input.year === "2023" ? dictionnary_2023 : dictionnary_2024;
    }),
});
