import React, { ReactNode, Suspense, useEffect } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./App.css";
// import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "react-toastify/dist/ReactToastify.css";
import { Provider, useDispatch, useSelector } from "react-redux";

import { ToastContainer } from "react-toastify";
import { LoginAuth } from "./redux/authSlice.ts";
import { useNavigate } from "react-router-dom";
import { RootState, store } from "./redux/store.tsx";
import { Spin } from "antd";

interface AppInitializerProps {
  children: ReactNode;
}

const AppInitializer: React.FC<AppInitializerProps> = ({ children }) => {
  const dispatch = useDispatch();
  // const navigate = useNavigate();
  const currentUrl = window.location?.pathname + window.location?.search;
  const { Loading } = useSelector((state: RootState) => state.auth);
  useEffect(() => {
    const LocalStorageToken = localStorage.getItem("auth_token");
    const Checkauthentication = async () => {
      const result = await dispatch(LoginAuth());
      if (result.payload?.data?.status) {
        if (currentUrl) {
          // navigate(currentUrl);
          // console.log(result);
        }
      }
    };
    if (LocalStorageToken) {
      Checkauthentication();
    }
  }, []);
  return (
    <>
      <ToastContainer />
      {Loading ? (
        <Spin fullscreen size="large" />
      ) : (
        <Suspense fallback={<Spin fullscreen size="large" />}>
          {children}
        </Suspense>
      )}
    </>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <AppInitializer>
      <App />
    </AppInitializer>
  </Provider>
);
