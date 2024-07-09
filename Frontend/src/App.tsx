import React, { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useSelector } from "react-redux";
import CustomHeader from "./components/Header";
import Footer from "./components/Footer";
import NotFound from "./components/NotFound";
import { Spin } from "antd";

// Lazy load components
const Home = lazy(() => import("./components/Home"));
const About = lazy(() => import("./components/About"));
const ListPage = lazy(() => import("./components/ListPage"));
const ActivateLink = lazy(() => import("./components/ActivateLink"));
const UserSettings = lazy(() => import("./components/UserSettings"));

const App: React.FC = () => {
  const current_state = useSelector((state: any) => state.auth);
  const isLogedin = current_state?.isLogedin;

  return (
    <BrowserRouter>
      <div className="d-flex flex-column min-vh-100">
        <CustomHeader />
        <div className="flex-grow-1">
          <div className="mt-5 pt-5 text-white">
            <Suspense fallback={<Spin fullscreen size="large" />}>
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
            </Suspense>
          </div>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;
