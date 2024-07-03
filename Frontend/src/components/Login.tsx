import {
  UserOutlined,
  LockOutlined,
  LoadingOutlined,
  PoweroffOutlined,
} from "@ant-design/icons";
import { yupResolver } from "@hookform/resolvers/yup";
import { Input, Spin } from "antd";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { LoginAuth, LogOutRedux } from "../redux/authSlice";
import useApi from "../redux/hooks/useApi";
import * as yup from "yup";

const loginSchema = yup.object().shape({
  user_email: yup.string().required("Email is required..."),
  password: yup
    .string()
    .required("Password is required...")
    .min(6, "Password should have at least 6 characters."),
});

interface LoginProps {
  setKey: (key: string) => void;
}

const Login: React.FC<LoginProps> = ({ setKey }) => {
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
    setFocus,
    setValue,
  } = useForm({
    mode: "all",
    resolver: yupResolver(loginSchema), // Apply Yup resolver
    defaultValues: {
      password: "",
      user_email: "",
    },
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user_name, isLogedin } = useSelector((state: any) => state.auth);

  const onSuccessLogin = async (response: any) => {
    toast.success(response?.data[0]?.message);
    const token = response?.data[0]?.access_token;
    localStorage.setItem("auth_token", token);
    navigate("/");
    await dispatch(LoginAuth());
    reset();
  };

  const onFailureLogin = (error: any) => {
    toast.error(error.response.data.detail);
    if (error.response.data.detail === "Wrong Password!") {
      setValue("password", "");
      setFocus("password");
    }
  };

  const { isloading, callFetch } = useApi({
    onSuccess: onSuccessLogin,
    onFailure: onFailureLogin,
    header: "application/json",
  });

  const onSubmit = (data: any) => {
    callFetch("post", "/login", data);
  };

  const handleLogout = () => {
    dispatch(LogOutRedux());
    setKey("Login");
  };

  return (
    <>
      {!isLogedin ? (
        <div className="row justify-content-center">
          <div className="col-sm-10 col-md-8 col-lg-8">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="form-group py-2">
                <Controller
                  name="user_email"
                  control={control}
                  render={({ field }) => (
                    <>
                      <Input
                        {...field}
                        prefix={
                          <UserOutlined className="site-form-item-icon" />
                        }
                        placeholder="Email"
                        size="large"
                      />
                      {errors.user_email && (
                        <span className="text-danger">
                          {errors.user_email.message as any}
                        </span>
                      )}
                    </>
                  )}
                />
              </div>
              <div className="form-group py-2">
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <>
                      <Input.Password
                        {...field}
                        prefix={
                          <LockOutlined className="site-form-item-icon" />
                        }
                        placeholder="Password"
                        size="large"
                      />
                      {errors.password && (
                        <span className="text-danger">
                          {errors.password.message as any}
                        </span>
                      )}
                    </>
                  )}
                />
              </div>
              <div className="form-group">
                <div className="text-center fs-6">
                  <span>Don't have an account? </span>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => setKey("Register")}
                  >
                    Register
                  </button>
                </div>
              </div>
              <div className="text-center mt-3">
                <button
                  disabled={isloading}
                  type="submit"
                  className="btn w-50 btn-primary"
                >
                  {isloading ? (
                    <>
                      <LoadingOutlined spin style={{ marginRight: "10px" }} />
                      Log in
                    </>
                  ) : (
                    "Log in"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="row justify-content-center">
          <div className="col-sm-10 col-md-8 col-lg-6 text-center bg-light p-4 rounded shadow">
            <h3 className="mb-3">User: {user_name}</h3>
            <p className="mb-3">Are you sure you want to logout?</p>
            <button className="btn btn-danger" onClick={handleLogout}>
              <PoweroffOutlined /> Logout
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Login;
