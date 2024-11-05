"use client";

import React from "react";
import Typed from "react-typed";
import Link from "next/link";
export const Welcome = () => {
  return (
    <div className="text-white">
      <div className="mx-auto mt-[-96px] flex h-screen w-full max-w-[800px] flex-col justify-center text-center">
        {/* Introductory text */}
        <p className="p-2 font-bold text-[#658bc9] sm:text-sm md:text-xl">
          Smart SNOMED Search for SPHN{" "}
        </p>

        {/* Main heading */}
        <h1 className="text-3xl font-bold sm:text-5xl md:py-6 md:text-6xl">
          ECL to SPHN{" "}
        </h1>

        {/* Subheading with typing effect */}
        <div className="flex items-center justify-center">
          <p className="py-4 text-xl font-bold sm:text-2xl md:text-3xl">
            Fast, flexible SPHN concepts search for{" "}
          </p>
          <Typed
            className="pl-2 text-xl font-bold sm:text-2xl md:pl-4 md:text-3xl"
            strings={["Heart rate", "Medication", "Disease"]}
            typeSpeed={120}
            backSpeed={140}
            loop
          />
        </div>

        {/* Description text */}
        <p className="text-sm font-bold text-gray-500 md:text-xl ">
          Research SPHN datasets by translating ECL queries from SNOMED-CT.
        </p>

        {/* Button linking to the translation page */}
        <Link href="/translate" className="btn">
          Get Started
        </Link>
      </div>
    </div>
  );
};
