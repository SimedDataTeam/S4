"use client";

import Link from "next/link";
import React from "react";

export const Query = () => {
  return (
    <div className="mx-auto flex h-screen w-full flex-col justify-center px-2 py-16 text-center text-white">
      <div className="mx-auto  max-w-[1240px]">
        <div className="my-4 ">
          {/* Page title */}
          <h1 className="mb-20 text-2xl font-bold sm:text-3xl md:text-4xl">
            Find the SPHN concepts you are looking for
          </h1>

          {/* Link to the translate page */}
          <Link href="/translate" className="btn p-4 text-xl">
            Get started
          </Link>
        </div>
      </div>
    </div>
  );
};
