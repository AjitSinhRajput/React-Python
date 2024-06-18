import React from "react";

const Footer = () => {
  return (
    <footer className="bg-dark text-white text-center pt-3">
      <div className="container">
        <div className="row">
          <div className="col-md-6">
            <p>&copy; 2024 Brewtal. All Rights Reserved.</p>
          </div>
          <div className="col-md-6">
            <p>
              <span>Contact us : </span>
              <a href="mailto:info@yourcompany.com">brewtal@info.com</a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
