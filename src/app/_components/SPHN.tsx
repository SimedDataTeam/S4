/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";
import SPHNLogo from "./assets/SPHN-Logo-Square.png"; // Importing the SPHN logo image

export const SPHN = () => {
  return (
    <div className="h-screen w-full bg-white px-4 py-16">
      <div className="mx-auto grid max-w-[1240px] md:grid-cols-2 ">
        {/* SPHN logo */}
        <img className="mx-auto w-[500px]" src={SPHNLogo.src} alt="/" />

        {/* Text content about SPHN */}
        <div className="ml-8 flex flex-col justify-center">
          <p className="font-bold text-[#658bc9]">SPHN</p>
          <h1 className="py-2 text-2xl font-bold sm:text-3xl md:text-4xl">
            Swiss Personalized Health Network
          </h1>
          <p>
            The Swiss Personalized Health Network (SPHN) is a national
            initiative aimed at advancing personalized and precision medicine in
            Switzerland. It focuses on improving health data interoperability
            and fostering healthcare innovation, while ensuring data security.
            By analyzing diverse health data, SPHN supports research for more
            precise treatments, enhancing patient care across the nation.
          </p>

          {/* Link to the SPHN website */}
          <a
            className="btn mx-auto text-center md:mx-0"
            target="_blank"
            rel="noopener noreferrer"
            href="https://sphn.ch/"
          >
            More info
          </a>
        </div>
      </div>
    </div>
  );
};
