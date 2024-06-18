import React from "react";
import { useForm, Controller } from "react-hook-form";
import { Input, Spin } from "antd";
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import useApi from "../redux/hooks/useApi";

interface RegisterProps {
  setKey: (key: string) => void;
}

const registerSchema = yup.object().shape({
  user_name: yup
    .string()
    .required("Username is required.")
    .min(4, "Username should have at least 4 characters."),
  user_email: yup
    .string()
    .required("Email is required.")
    .email("Invalid email format"),
  phone: yup
    .string()
    .required("Phone number is required.")
    .matches(/^[0-9]*$/, "Phone number should contain only digits.")
    .min(10, "Phone should have at least 10 characters."),
  password: yup
    .string()
    .required("Password is required...")
    .min(6, "Password should have at least 6 characters."),
  confirm_password: yup
    .string()
    .required("Confirm Password is required.")
    .oneOf([yup.ref("password")], "Passwords must match"),
});

const Register: React.FC<RegisterProps> = ({ setKey }) => {
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    mode: "all",
    resolver: yupResolver(registerSchema),
    defaultValues: {
      confirm_password: "",
      password: "",
      phone: "",
      user_email: "",
      user_name: "",
    },
  });
  const navigate = useNavigate();
  const onSuccessInsert = (response: any) => {
    toast.success(response?.data?.message);
    reset();
    navigate(`${response?.data?.activation_link}`);
  };

  const onFailureInsert = (error: any) => {
    toast.error(error.response.data.detail);
  };

  const { isloading, callFetch } = useApi({
    onSuccess: onSuccessInsert,
    onFailure: onFailureInsert,
    header: "application/json",
  });

  const onSubmit = (data: any) => {
    callFetch("post", "/register-user", data);
  };

  return (
    <div className="row justify-content-center">
      <div className="col-sm-10 col-md-8 col-lg-8">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group py-2">
            <Controller
              name="user_name"
              control={control}
              render={({ field: { onChange, value }, fieldState: {} }) => (
                <>
                  <Input
                    value={value}
                    onChange={onChange}
                    prefix={<UserOutlined className="site-form-item-icon" />}
                    placeholder="Username"
                    size="large"
                  />
                  {errors.user_name && (
                    <span className="text-danger">
                      {errors.user_name.message}
                    </span>
                  )}
                </>
              )}
            />
          </div>
          <div className="form-group py-2">
            <Controller
              name="user_email"
              control={control}
              render={({ field: { onChange, value }, fieldState: {} }) => (
                <>
                  <Input
                    value={value}
                    onChange={onChange}
                    prefix={<MailOutlined className="site-form-item-icon" />}
                    placeholder="Email"
                    size="large"
                  />
                  {errors.user_email && (
                    <span className="text-danger">
                      {errors.user_email.message}
                    </span>
                  )}
                </>
              )}
            />
          </div>
          <div className="form-group py-2">
            <Controller
              name="phone"
              control={control}
              render={({ field: { onChange, value }, fieldState: {} }) => (
                <>
                  <Input
                    value={value}
                    onChange={onChange}
                    prefix={<PhoneOutlined className="site-form-item-icon" />}
                    placeholder="Phone"
                    size="large"
                  />
                  {errors.phone && (
                    <span className="text-danger">{errors.phone.message}</span>
                  )}
                </>
              )}
            />
          </div>
          <div className="form-group py-2">
            <Controller
              name="password"
              control={control}
              render={({ field: { onChange, value }, fieldState: {} }) => (
                <>
                  <Input.Password
                    value={value}
                    onChange={onChange}
                    prefix={<LockOutlined className="site-form-item-icon" />}
                    placeholder="Password"
                    size="large"
                  />
                  {errors.password && (
                    <span className="text-danger">
                      {errors.password.message}
                    </span>
                  )}
                </>
              )}
            />
          </div>
          <div className="form-group py-2">
            <Controller
              name="confirm_password"
              control={control}
              render={({ field: { onChange, value }, fieldState: {} }) => (
                <>
                  <Input.Password
                    value={value}
                    onChange={onChange}
                    prefix={<LockOutlined className="site-form-item-icon" />}
                    placeholder="Confirm Password"
                    size="large"
                  />
                  {errors.confirm_password && (
                    <span className="text-danger">
                      {errors.confirm_password.message}
                    </span>
                  )}
                </>
              )}
            />
          </div>
          <div className="form-group text-center">
            <div className="fs-6">
              <span>Already have an account? </span>
              <button
                type="button"
                className="btn btn-sm btn-outline-primary"
                onClick={() => setKey("Login")}
              >
                Login
              </button>
            </div>
          </div>
          <div className=" form-group my-3 text-center">
            <button
              disabled={isloading}
              type="submit"
              className="btn w-50 btn-primary"
            >
              {isloading ? (
                <>
                  <LoadingOutlined spin style={{ marginRight: "10px" }} />
                  Register
                </>
              ) : (
                "Register"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
