// OK

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { toast } from "react-toastify";
import { API } from "./hooks/useApi";

interface InitialStateProps {
  user_name: string;

  user_id: string;

  email: string;
  isLogedin: boolean;
  activationStatus: boolean;
  Loading: boolean;
}
export const LoginAuth: any = createAsyncThunk("login/auth", async () => {
  const response = await API.post("/auth_token");
  return response;
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user_name: "",
    user_id: "",
    email: "",
    isLogedin: false,
    activationStatus: false,
    Loading: false,
  },
  reducers: {
    LogOutRedux: (state: InitialStateProps) => {
      state.user_id = "";
      state.email = "";
      state.user_name = "";
      state.isLogedin = false;
      state.activationStatus = false;
      state.Loading = false;
      localStorage.removeItem("auth_token");
      toast.success("Logout Successfully");
      // window.location.reload();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(LoginAuth.pending, (state: InitialStateProps) => {
        state.Loading = true;
      })
      .addCase(LoginAuth.fulfilled, (state: InitialStateProps, action) => {
        const { user_id, user_email, is_active, user_name } =
          action?.payload?.data?.data;
        state.user_id = user_id ?? "";
        state.email = user_email;
        state.user_name = user_name ?? "";
        state.isLogedin = true;
        state.activationStatus = is_active;
        state.Loading = false;
      })
      .addCase(LoginAuth.rejected, (state: InitialStateProps, action) => {
        state.user_id = "";
        state.email = "";
        state.user_name = "";
        state.isLogedin = false;
        state.activationStatus = false;
        state.Loading = false;
      });
  },
});

export const { LogOutRedux } = authSlice.actions;
export default authSlice.reducer;
