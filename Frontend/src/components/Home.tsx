import React from "react";
import TeaMakerBG from "../../public/tea-maker-background.png";
import CoffeeMakerBG from "../../public/coffee-maker-background.png";
import TeaMakerMachine from "../../public/brewtal-machine.webp";
import CoffeeMakerMachine from "../../public/Brewtal-Coffee-Maker.webp";
import HeroBanner from "../../public/Hero-banner.webp";

const Home: React.FC = () => {
  return (
    <div className="container-fluid">
      <div>
        <h1 className="fs-1 text-center mb-4">
          Authentic Tea & Coffee Machines for Bengaluru Offices
        </h1>
      </div>
      <div className="row">
        <img
          className="img-fluid"
          style={{ paddingRight: 0, paddingLeft: 0 }}
          src={HeroBanner}
          alt="BREWTAL"
        />
      </div>
      <div
        className="row py-md-5 py-sm-3"
        style={{ backgroundImage: `url(${TeaMakerBG})` }}
      >
        <div className="col-md-5 text-end mt-5">
          <img
            className="img-fluid mb-4"
            src={TeaMakerMachine}
            alt="BREWTAL"
            style={{ maxWidth: "80%" }}
          />
        </div>
        <div className="col-md-6 mb-5 text-white mt-md-5 gap-3 d-flex flex-column">
          <h1 className="fs-1 fw-bolder">Brewtal Tea Maker</h1>
          <h2 className="fs-2">
            Get fresh, home-style tea with customisable masalas, strength and
            milk-tea ratio.
          </h2>
          <p className="">
            We believe that tea lovers have been given the shortest end of the
            stick at the workplace. For far too long, we’ve been subjected to a
            shortcut version of tea. It’s usually a toss up between bland tea
            bag tea or terribly brewed machine tea. In a nation that famously
            runs on tea, we still need to leave the office or order in to drink
            decent-tasting tea.
          </p>
          <p>
            Enter Brewtal. We’ve invented, and patented, a tea vending machine
            that crafts home-style, flavourful tea for Indian offices. It’s made
            by boiling. It’s got the masalas. It’s kadak af. You get to pick
            your preferred tea-milk ratio. It’s the tea, tea lovers deserve.
          </p>
          <div className="">
            <button
              className="btn btn-lg btn-outline-dark rounded-5 border-white w-50"
              style={{
                backgroundColor: "#343a40", // Dark background initially
                color: "#ffffff", // White text initially
                transition: "background-color 0.3s, color 0.3s",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "#ffffff"; // White background on hover
                e.currentTarget.style.color = "#343a40"; // Dark text on hover
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "#343a40"; // Revert to dark background
                e.currentTarget.style.color = "#ffffff"; // Revert to white text
              }}
            >
              Tea Demo
            </button>
          </div>
        </div>
      </div>
      <div
        className="row py-md-5 py-sm-3"
        style={{ backgroundImage: `url(${CoffeeMakerBG})` }}
      >
        <div className="col-md-5 text-end mt-4">
          <img
            className="img-fluid mb-4"
            src={CoffeeMakerMachine}
            alt="BREWTAL"
            style={{ maxWidth: "80%" }}
          />
        </div>
        <div className="col-md-6 text-white my-5 gap-3 d-flex flex-column">
          <h1 className="fs-1 fw-bolder">Brewtal Coffee Maker</h1>
          <h2 className="fs-2">
            Authentic, fresh & frothy filter coffee (not instant) made with
            premium coffee powder.
          </h2>
          <p className="">
            No more bland lattes. Switch to our strong, aromatic filter coffee
            crafted to turn your workday around.
          </p>

          <div className="">
            <button
              className="btn btn-lg btn-outline-dark rounded-5 border-white w-50"
              style={{
                backgroundColor: "#343a40", // Dark background initially
                color: "#ffffff", // White text initially
                transition: "background-color 0.3s, color 0.3s",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "#ffffff"; // White background on hover
                e.currentTarget.style.color = "#343a40"; // Dark text on hover
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "#343a40"; // Revert to dark background
                e.currentTarget.style.color = "#ffffff"; // Revert to white text
              }}
            >
              Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
