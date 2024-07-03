import React from "react";
import { FaLinkedin, FaTwitter, FaInstagram } from "react-icons/fa"; // Import icons
import { BsTwitterX } from "react-icons/bs";

const Footer = () => {
  return (
    <footer className="bg-dark text-white text-center py-3">
      <div className="container">
        <div className="row justify-content-between align-items-center">
          <div className="col-md-4 d-flex flex-column align-items-center mb-3">
            <img
              src="../../public/Brewtal-Logo-White.png" // Replace with the path to your logo
              alt="BREWTAL"
              className="rounded"
              style={{ maxWidth: "150px", maxHeight: "60px", width: "auto" }} // Adjust logo size
            />
          </div>
          <div
            className="col-md-4 d-flex flex-column align-items-center mb-3"
            style={{ maxHeight: "10vh" }}
          >
            <p>&copy; 2024 Brewtal. All Rights Reserved.</p>
            <p>
              +91-9606421202{" "}
              <a href="mailto:amit@getbrewtal.com" className="text-white">
                amit@getbrewtal.com
              </a>
            </p>
          </div>
          <div className="col-md-4 d-flex flex-column align-items-center mb-3">
            <p>
              <span>Contact us: </span>
              <a href="mailto:brewtal@info.com" className="text-white">
                brewtal@info.com
              </a>
            </p>
            <div className="d-flex gap-3">
              <span className="btn btn-outline-light rounded-circle">
                <a href="https://www.linkedin.com" className="">
                  <FaLinkedin />
                </a>
              </span>
              <span className="btn btn-outline-light rounded-circle">
                <a href="https://twitter.com" className="">
                  <BsTwitterX />
                </a>
              </span>
              <span className="btn btn-outline-light rounded-circle">
                <a href="https://www.instagram.com" className="">
                  <FaInstagram />
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
