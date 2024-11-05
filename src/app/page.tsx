"use client";

import { Navbar } from "~/app/_components/nav_bar";
import { Welcome } from "~/app/_components/welcome";
import { SPHN } from "~/app/_components/SPHN";
import { Query } from "~/app/_components/query";

const Home = () => {
  return (
    <main>
      <div>
        {/* Render the Navbar at the top */}
        <Navbar />

        {/* Render the Welcome section */}
        <Welcome />

        {/* Render the SPHN information section */}
        <SPHN />

        {/* Render the Query section */}
        <Query />
      </div>
    </main>
  );
};

export default Home; // Export the Home component as the default export
