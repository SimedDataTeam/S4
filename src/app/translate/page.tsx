"use client";

import React, { useState } from "react";
import { api } from "~/trpc/react";
import Image from "next/image";
import HUGLogo from "~/app/_components/assets/hug-logo-white.png";
import CHUVLogo from "~/app/_components/assets/chuv-logo-white.png";
import SPHNLogo from "~/app/_components/assets/sphn-logo-white.png";
import DownloadImg from "~/app/_components/assets/download.png";
import { ECLBuilder } from "../_components/ecl_builder";

const Translate = () => {
  const [getSct, setSct] = useState(""); // State for storing ECL string
  const [dictionaryYear, setDictionaryYear] = useState("2024"); // State for storing selected dictionary year
  const makeQuery = api.sphndict.makeQuery.useMutation(); // Mutation for making API requests
  makeQuery.data;
  // Function to process raw data into a map structure
  const processData = (data: (string | null)[]): Map<string, string[]> => {
    const map = new Map<string, string[]>();
    data.forEach((item) => {
      if (!item) return;
      const [prefix, suffix] = item.split("-");
      if (prefix && suffix) {
        const existing = map.get(prefix) ?? [];
        existing.push(suffix.trim());
        map.set(prefix, existing);
      } else if (prefix) {
        map.set(prefix, []);
      }
    });
    return map;
  };

  // Function to display processed data in the UI
  const display = (result: Map<string, string[]>, type: string) => {
    return (
      <div>
        <p className="text-xl font-bold underline">{type}</p>
        {Array.from(result.entries()).map(([prefix, suffixes], index) => (
          <div key={index}>
            {/* Check if suffixes array is empty and render accordingly */}
            <p className="">{suffixes.length > 0 ? `${prefix}:` : prefix}</p>
            {suffixes.map((suffix, idx) => (
              <p key={idx} style={{ marginLeft: "30px" }}>
                {suffix}
              </p>
            ))}
          </div>
        ))}
      </div>
    );
  };

  // Function to render the query results
  const renderData = () => {
    if (!makeQuery.data) {
      return;
    }
    if (makeQuery.data.length != 4) {
      return <p>Error with the response.</p>;
    }

    // Handling different types of data responses
    if (
      Array.isArray(makeQuery.data[0]) &&
      Array.isArray(makeQuery.data[1]) &&
      typeof makeQuery.data[2] === "number"
    ) {
      const concepts = processData(makeQuery.data[0]);
      const valuesets = processData(makeQuery.data[1]);
      const total = makeQuery.data[2];
      return (
        <div>
          {display(concepts, "Meaning bindings")}
          {display(valuesets, "Value Sets")}
          <p className="text-xl font-bold underline">SNOMED CT Concepts</p>
          <p>{total} results</p>
        </div>
      );
    } else if (
      typeof makeQuery.data[0] === "string" &&
      Array.isArray(makeQuery.data[1]) &&
      typeof makeQuery.data[2] === "number"
    ) {
      const [dataType, data] = makeQuery.data;
      const processedData = processData(data);
      const total = makeQuery.data[2];
      return (
        <div>
          {display(processedData, dataType)}
          <p className="text-xl font-bold underline">SNOMED CT Concepts</p>
          <p>{total} results</p>
        </div>
      );
    }
  };

  // Function to format data for CSV download
  const formatDataForDownloadCSV = (
    dataMap: Map<string, string[]>,
    title: string,
  ): string => {
    let content = "";
    dataMap.forEach((suffixes, prefix) => {
      if (suffixes.length > 0) {
        suffixes.forEach((suffix) => {
          if (title == "Concepts") {
            content += `${prefix};${suffix};;\n`; // Each suffix as a new row
          } else {
            content += `;;${prefix};${suffix}\n`;
          }
        });
      } else {
        if (title == "Concepts") {
          content += `${prefix};;;\n`;
        } else {
          content += `;;;${prefix}\n`;
        }
      }
    });
    return content;
  };

  // Function to download SNOMED data as a CSV file
  const downloadSNOMED = () => {
    if (!makeQuery.data || !Array.isArray(makeQuery.data[3])) return;
    const snomed_list: Array<string> = makeQuery.data[3];
    let content = "data:text/csv;charset=utf-8,";
    content += `SNOMED CT concepts\n`;
    snomed_list.forEach((concept) => {
      content += concept + "\n";
    });
    const encodedUri = encodeURI(content);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "snomed.csv");
    document.body.appendChild(link); // Required for Firefox
    link.click();
    document.body.removeChild(link);
  };

  // Function to download SPHN data as a CSV file
  const downloadData = () => {
    if (!makeQuery.data) return;

    let content = "data:text/csv;charset=utf-8,";
    content += `Concept;Concept attribute;Value Set; Value set attribute\n`;
    if (Array.isArray(makeQuery.data[0]) && Array.isArray(makeQuery.data[1])) {
      const concepts = processData(makeQuery.data[0]);
      const valuesets = processData(makeQuery.data[1]);
      content += formatDataForDownloadCSV(concepts, "Concepts");
      content += formatDataForDownloadCSV(valuesets, "Value Sets");
    } else if (
      typeof makeQuery.data[0] === "string" &&
      Array.isArray(makeQuery.data[1])
    ) {
      const [dataType, data] = makeQuery.data;
      const processedData = processData(data);
      content += formatDataForDownloadCSV(processedData, dataType);
    }
    const encodedUri = encodeURI(content);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "sphn.csv");
    document.body.appendChild(link); // Required for Firefox
    link.click();
    document.body.removeChild(link);
  };

  const imageStyle = {
    color: "white",
  };

  return (
    <div className="mx-auto flex h-screen flex-col justify-between bg-[#F3F4F4] text-center text-black">
      {/* Header of the page */}
      <header>
        <nav className="bg-[#3A5286] px-4 py-2.5 lg:px-6">
          <div className="flex flex-wrap justify-between">
            <a href="/" className="flex items-center">
              <Image src={SPHNLogo} alt="/" width={40} height={5} />
              <span className="self-center whitespace-nowrap pl-3 text-xl font-semibold text-white">
                Smart SNOMED Search for SPHN
              </span>
            </a>
          </div>
        </nav>
      </header>

      {/* Main content of the page */}
      <main className=" container mx-auto px-6 ">
        <div className="flex items-center justify-between">
          <div className="flex  items-center space-x-2  py-1 ">
            {/* ECL Builder component */}
            <ECLBuilder
              onSet={(value) => setSct(value)}
              makeQuery={makeQuery.mutate}
              dictionaryYear={dictionaryYear}
            />
          </div>
        </div>

        {/* Query and results section */}
        <div className="flex max-h-60">
          {/* Query input box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              console.log("QUERY SENT TRANSLATE: ", getSct);
              makeQuery.mutate({ query: getSct, year: dictionaryYear });
            }}
            className="w-5/12"
          >
            <div className="h-full rounded-md">
              <textarea
                className="h-full w-full rounded-md p-6 text-black outline outline-[#adadad]"
                rows={8}
                placeholder="Write your query here"
                value={getSct}
                onChange={(e) => setSct(e.target.value)}
              ></textarea>
            </div>
            <select
              value={dictionaryYear}
              onChange={(e) => setDictionaryYear(e.target.value)}
              className="mr-4 rounded bg-[#F3F4F4] p-3"
            >
              <option value="2024">SPHN 2024</option>
              <option value="2023">SPHN 2023</option>
            </select>
            <button
              type="submit"
              className="btn mx-auto bg-[#3A5286] text-white"
              disabled={makeQuery.isLoading}
            >
              Submit
            </button>
          </form>

          {/* Arrow icon */}
          <div className=" w-2/12  -space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="0.5"
              stroke="currentColor"
              className="h-1/12  text-gray-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"
              />
            </svg>
          </div>

          {/* Results display */}
          <div className="w-5/12 flex-col">
            <div className="box-border h-60 w-full overflow-y-auto text-ellipsis rounded-md bg-[#dedede] py-6 text-black">
              <div>
                {makeQuery.isLoading && (
                  <div
                    className="mt-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-gray-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                    role="status"
                  >
                    <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                      Loading...
                    </span>
                  </div>
                )}
                {makeQuery.data === false && <p>No SPHN concepts found</p>}
                {makeQuery.error && (
                  <div>
                    <h2 className="text-lg font-bold text-[#000000]">Error:</h2>
                    <p>{makeQuery.error.data?.code}</p>
                  </div>
                )}
                <div className="ml-6 text-left">{renderData()}</div>
                {typeof makeQuery.data === undefined && <p>Undefined</p>}
              </div>
            </div>

            {/* Download buttons */}
            <button
              className="mt-4  rounded  px-4  py-2 text-sm text-black hover:bg-gray-200"
              onClick={downloadData}
            >
              <div className="flex">
                SPHN entities
                <Image
                  src={DownloadImg}
                  alt="download icon"
                  width={15}
                  style={imageStyle}
                  className="ml-2"
                ></Image>
              </div>
            </button>
            <button
              className="mt-4  rounded  px-4  py-2 text-sm text-black hover:bg-gray-200"
              onClick={downloadSNOMED}
            >
              <div className="flex">
                SNOMED concepts
                <Image
                  src={DownloadImg}
                  alt="download icon"
                  width={15}
                  style={imageStyle}
                  className="ml-2"
                ></Image>
              </div>
            </button>
          </div>
        </div>
      </main>

      {/* Footer of the page */}
      <footer className=" lg:h-25 bg-[#3A5286]  py-0 text-white sm:px-4 lg:px-6 lg:py-2">
        <div className="flex justify-between">
          {/* Menu */}
          <ul className="flex flex-col items-center justify-center text-sm">
            <li>
              <a href="/">Home</a>
            </li>
          </ul>

          {/* Logos */}
          <div className="flex space-x-4 p-2 ">
            <Image src={CHUVLogo} alt="/" width={50} height={5} />
            <Image src={HUGLogo} alt="/" width={100} height={5} />
            <Image src={SPHNLogo} alt="/" width={40} height={5} />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Translate;
