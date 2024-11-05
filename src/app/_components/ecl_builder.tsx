/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use client";

import React, { useState, useRef, type ElementRef, type FC } from "react";
import { cn } from "~/utils/cn";
import { z } from "zod";
import { type RouterInputs } from "~/trpc/shared";

// Define possible ECL operators and their corresponding symbols
type EclOperator =
  | "descendantorselfof"
  | "descendantof"
  | "childof"
  | "ancestorof"
  | "ancestororselfof"
  | "parentof"
  | "memberOf";

const eclOperatorMapping: Record<EclOperator, string> = {
  descendantof: "<",
  descendantorselfof: "<<",
  childof: "<!",
  ancestorof: ">",
  ancestororselfof: ">>",
  parentof: ">!",
  memberOf: "^",
};

// ECLBuilder component allows building and running ECL queries
export const ECLBuilder: FC<{
  onSet: (value: string) => void; // Callback to set the final ECL string
  makeQuery: (input: RouterInputs["sphndict"]["makeQuery"]) => void; // Mutation function to execute the query
  dictionaryYear: string; // The year of the dictionary in use
}> = ({ onSet, makeQuery, dictionaryYear }) => {
  const [getModal, setModal] = useState<boolean>(false); // Modal state (pop up window)
  const [key, setKey] = useState<number>(1); // Unique key for re-rendering the ECL builder component
  const eclBuilderRef = useRef<ElementRef<"div">>(null); // Reference to the ECL builder component

  // Function to open the modal
  const openModal = () => {
    setModal(true);
  };

  // Function to close the modal
  const closeModal = () => {
    setModal(false);
  };

  // Parse refinement attribute into a valid ECL string
  const parseRefinement = (attribute: any) => {
    const firstAttribute = attribute.attributeName;
    const firstAttributeFinal = `${
      eclOperatorMapping[firstAttribute.operator as EclOperator] || ""
    } ${firstAttribute.conceptId}`;
    const comparisonOperator = attribute.expressionComparisonOperator;
    const value = `${
      eclOperatorMapping[attribute.value.operator as EclOperator] || ""
    } ${attribute.value.conceptId}`;
    const final_refinement =
      firstAttributeFinal + " " + comparisonOperator + " " + value;
    return final_refinement;
  };

  // Parse the full ECL string from the input structure
  const parseEclJSON = (eclObject: any): string | undefined => {
    // If it is an AND of several ECL queries:
    if (
      eclObject.conjunctionExpressionConstraints &&
      Array.isArray(eclObject.conjunctionExpressionConstraints)
    ) {
      const eclQueries = eclObject.conjunctionExpressionConstraints.map(
        (ECL: any) => parseEclJSON(ECL),
      );
      // Join all the individual ECL queries
      const finalEclQuery = eclQueries.join(", ");
      return z.string().parse(finalEclQuery);
    }

    //If it is an OR of several ECL queries:
    if (
      eclObject.disjunctionExpressionConstraints &&
      Array.isArray(eclObject.disjunctionExpressionConstraints)
    ) {
      const eclQueries = eclObject.disjunctionExpressionConstraints.map(
        (ECL: any) => parseEclJSON(ECL),
      );
      // Join all the individual ECL queries
      const finalEclQuery = eclQueries.join(" or ");
      return z.string().parse(finalEclQuery);
    }

    //If it is a minus of several ECL queries:
    if (eclObject.exclusionExpressionConstraints) {
      const first_part: string | undefined = parseEclJSON(
        eclObject.exclusionExpressionConstraints.first,
      );
      const second_part: string | undefined = parseEclJSON(
        eclObject.exclusionExpressionConstraints.second,
      );
      // Join all the individual ECL queries
      if (first_part && second_part) {
        const finalEclQuery: string | undefined =
          "(\n" + first_part + "\n) MINUS (\n" + second_part + "\n)";
        return z.string().parse(finalEclQuery);
      } else {
        return;
      }
    }

    // Handle simple ECL case
    if (
      eclObject.conceptId &&
      (eclObject.operator || eclObject.operator == "")
    ) {
      const eclQuery = `${
        eclOperatorMapping[eclObject.operator as EclOperator] || ""
      } ${eclObject.conceptId}`;
      return z.string().parse(eclQuery);
    }

    // Handle ECL with refinements/attributess
    if (eclObject.eclRefinement && eclObject.subexpressionConstraint) {
      const mainConcept = eclObject.subexpressionConstraint;
      const mainConceptFinal = `${
        eclOperatorMapping[mainConcept.operator as EclOperator] || ""
      } ${mainConcept.conceptId} :`;
      const attributeSet =
        eclObject.eclRefinement.subRefinement.eclAttributeSet;
      const attribute = attributeSet.subAttributeSet.attribute;

      // process all refinements
      const allRefinements = [];
      const first_refinement = parseRefinement(attribute);
      allRefinements.push(first_refinement);
      // if there are more than one refinement
      if (attributeSet.conjunctionAttributeSet) {
        const refinements_array = attributeSet.conjunctionAttributeSet;
        refinements_array.forEach((elem: any) => {
          allRefinements.push(parseRefinement(elem.attribute));
        });
      }

      // Combine main concept and refinements into final ECL string
      const refinements_final = allRefinements.join(", ");
      const final_ecl = mainConceptFinal + " " + refinements_final;
      return z.string().parse(final_ecl);
    }
  };

  const parseEclString = () => {
    const htmlEcl = eclBuilderRef.current;
    if (!htmlEcl) return;

    const value = htmlEcl.shadowRoot?.querySelector("textarea")?.value;
    if (!value) return;

    const eclObject = JSON.parse(value);
    return parseEclJSON(eclObject);
  };

  return (
    <div className="flex items-center justify-center">
      {/* Button to open the ECL Builder modal */}
      <button
        onClick={openModal}
        className="text-md block rounded-lg px-5 py-2.5 text-center font-medium text-[#37589f] hover:bg-[#9ca6bb51] focus:outline-none focus:ring-4 focus:ring-blue-300"
        type="button"
      >
        ECL Builder
      </button>

      {/* Modal container */}
      <div
        className={cn(
          "absolute left-1/4 top-4 hidden rounded-lg bg-white shadow-2xl",
          getModal && "block",
        )}
      >
        <snomed-ecl-builder
          key={key.toString()}
          apiurl="/snowstorm"
          branch="MAIN"
          showoutput="true"
          ref={eclBuilderRef}
        />

        {/* Modal buttons */}
        <div className="flex items-center justify-center">
          {/* Button to clear the form and close the modal */}
          <button
            type="button"
            className=" mb-3 mr-4 rounded-lg border px-5 py-2.5 text-center text-sm font-medium text-black hover:bg-[#e8e8e8] focus:outline-none focus:ring-4 focus:ring-blue-300"
            onClick={() => {
              setKey(Math.random());
              closeModal();
            }}
          >
            <div className="flex items-center justify-center">
              <span className="ml-2">Clear and Close</span>
            </div>
          </button>

          {/* Button to simply close the modal */}
          <button
            onClick={closeModal}
            type="button"
            className=" mb-3 mr-4 rounded-lg border px-5 py-2.5 text-center text-sm font-medium text-black hover:bg-[#e8e8e8] focus:outline-none focus:ring-4 focus:ring-blue-300"
          >
            Close ECL Builder
          </button>

          {/* Button to run the query with the constructed ECL */}
          <button
            type="button"
            className="mb-3 rounded-lg bg-[#3A5286] px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-[#253556] focus:outline-none focus:ring-4 focus:ring-blue-300"
            onClick={() => {
              const ecl = parseEclString();
              if (!ecl) return;
              onSet(ecl);
              makeQuery({ query: ecl, year: dictionaryYear });
              closeModal();
            }}
          >
            <div className="flex items-center justify-center">
              <span className="ml-2">Run</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
