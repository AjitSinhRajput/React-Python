import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
// import "./App.css";
// import "bootstrap/dist/css/bootstrap.min.css";
import CustomHeader from "./components/Header";
import About from "./components/About";
import Home from "./components/Home";

import Logout from "./components/Logout";
import Register from "./components/Register";
import ListPage from "./components/ListPage";
import ActivateLink from "./components/ActivateLink";
import { useSelector } from "react-redux";
import NotFound from "./components/NotFound";
import UserSettings from "./components/UserSettings";
import Footer from "./components/Footer";

const App: React.FC = () => {
  const current_state = useSelector((state: any) => state.auth);
  const isLogedin = current_state?.isLogedin;
  return (
    <BrowserRouter>
      <div className="d-flex flex-column min-vh-100">
        <CustomHeader />
        <div className="flex-grow-1">
          <div className="container-fluid px-4 mb-5 mt-4 text-white">
            <Routes>
              <Route path="/" element={<Home />} />
              {isLogedin ? (
                <Route
                  path="/list"
                  element={
                    isLogedin ? <ListPage /> : <Navigate to="/not-found" />
                  }
                />
              ) : (
                ""
              )}
              <Route path="/about" element={<About />} />
              <Route path="/settings" element={<UserSettings />} />
              <Route path="/activelink" element={<ActivateLink />} />
              <Route path="/not-found" element={<NotFound />} />
              <Route path="*" element={<NotFound />} />{" "}
              {/* Catch-all route for unmatched paths */}
            </Routes>
          </div>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;
