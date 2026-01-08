import React from 'react';
import Navbar from "../Components/Navbar";
import Hero from "../Components/hero";
import Features from "../Components/Features";
import HowItWorks from "../Components/How it works";
import Developers from "../Components/Developers";

const App = () => {

  return (
    <main className="overflow-x-hidden antialiased text-neutral-800">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Developers />
    </main>
  )
}

export default App;
