"use client";

import React, { useEffect, useState } from "react";
import { AiOutlineClose, AiOutlineMenu } from "react-icons/ai";

export const Navbar = () => {
  const [nav, setNav] = useState<boolean>(false); // State to control the visibility of the mobile navigation menu
  const [show, setShow] = useState<boolean>(true); // State to control the visibility of the entire navbar based on scroll position

  // Toggle the mobile navigation menu
  const handleNav = () => {
    setNav(!nav);
  };

  // Control the visibility of the navbar based on scroll position
  const controlNav = () => {
    if (window.scrollY > 100) {
      setShow(false); // Hide navbar when scrolled down
    } else {
      setShow(true); // Show navbar when at the top of the page
    }
  };

  // Set up an event listener to track scrolling
  useEffect(() => {
    window.addEventListener("scroll", controlNav);
    return () => {
      window.removeEventListener("scroll", controlNav); // Clean up the event listener on component unmount
    };
  }, []);

  return (
    <div
      className={
        "mx-auto flex h-24 max-w-[1240px] items-center justify-between px-4 text-white duration-500 ease-in-out " +
        (show ? "opacity-100" : "pointer-events-none opacity-0")
      }
    >
      {/* Brand logo or title */}
      <h1 className="w-full text-3xl font-bold text-[#658bc9]">S4</h1>

      {/* Desktop navigation menu */}
      <ul className="hidden md:flex">
        <li className="p-4">
          <a href="/translate">Search</a>
        </li>
        <li className="p-4">
          <a href="https://sphn.ch/" target="_blank">
            SPHN
          </a>
        </li>
      </ul>

      {/* Mobile navigation toggle button */}
      <div onClick={handleNav} className="block md:hidden">
        {!nav ? <AiOutlineClose size={20} /> : <AiOutlineMenu size={20} />}
      </div>

      {/* Mobile navigation menu */}
      <div
        className={
          !nav
            ? "fixed left-0 top-0 block h-full w-[60%] border-r border-r-gray-900 bg-[#000300] duration-500 ease-in-out md:hidden"
            : "fixed left-[-100%]"
        }
      >
        <h1 className="m-4 w-full text-3xl font-bold text-[#658bc9]">S4</h1>
        <ul className="  p-4 uppercase">
          <li className="border-b border-gray-600 p-4">Home</li>
          <li className="border-b border-gray-600 p-4">About</li>
          <li className="border-b border-gray-600 p-4">Contact</li>
        </ul>
      </div>
    </div>
  );
};
