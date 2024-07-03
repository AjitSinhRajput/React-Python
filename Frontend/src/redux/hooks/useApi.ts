import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import { useState } from "react";
import { toast } from "react-toastify";

export const API = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL,
  headers: {
    "Content-Type": "application/json",
    // 'Content-Type': 'multipart/form-data',
  },
});

API.interceptors.request.use(
  (config) => {
    const authToken = localStorage.getItem("auth_token") ?? "";
    if (authToken) {
      config.headers.Authorization = `${authToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
API.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError | any) => {
    try {
      const { response } = error;
      if (
        response?.status == 401 &&
        (response?.data?.detail == "Invalid Token" ||
          response?.data?.detail == "Token has expired")
      ) {
        localStorage.removeItem("auth_token");
        window.location.reload();
      }
    } catch (e) {
      console.error(e);
    }
    throw error;
  }
);

export interface ApiProps {
  onSuccess?: (response: AxiosResponse | any) => void;
  onFailure?: (error: AxiosError | any) => void | undefined;
  isloading?: boolean;
  header?: "application/json" | "multipart/form-data";
  callFetch?: (
    method: "get" | "post" | "put" | "delete" | "patch",
    url: string,
    requestData?: any
  ) => void;
}

const useApi = ({ onSuccess, onFailure, header }: ApiProps) => {
  const [isloading, setIsLoading] = useState<boolean>(false);
  const api: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_APP_API_URL,
    headers: {
      "Content-Type": `${header ?? "application/json"}`,
    },
    // timeout: 600000
  });

  api.interceptors.request.use(
    (config) => {
      const authToken = localStorage.getItem("auth_token");
      config.headers.Authorization = `${authToken ?? null}`;
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
  api.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    (error: AxiosError | any) => {
      const currentUrl = window.location.pathname;
      try {
        const { response } = error;
        console.log("error: useApi ", error);
        // toast.error(error?.message);
        if (
          response?.status == 401 &&
          (response?.data?.detail == "Invalid Token" ||
            response?.data?.detail == "Token has expired")
        ) {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user_rights");
          if (currentUrl == "/activelink" || currentUrl == "/reset-password") {
          } else {
            window.location.reload();
          }
        }
      } catch (e) {
        console.error(e);
      }
      throw error;
    }
  );

  const callApi = async (
    method: "get" | "post" | "put" | "delete" | "patch",
    url: string,
    requestData: any = null
  ) => {
    setIsLoading(true);
    try {
      const response = await api[method](url, requestData);
      if (response) {
        onSuccess && onSuccess(response);
      }
    } catch (error) {
      onFailure && onFailure(error);
    } finally {
      setIsLoading(false);
    }
  };
  return {
    isloading,
    callFetch: (
      method: "get" | "post" | "put" | "delete" | "patch",
      url: string,
      requestData?: any
    ) => callApi(method, url, requestData),
  };
};

export default useApi;
