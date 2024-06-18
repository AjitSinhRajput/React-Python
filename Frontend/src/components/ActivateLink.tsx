import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Input, Spin } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import useApi from "../redux/hooks/useApi";
import { LoadingOutlined } from "@ant-design/icons";
import { LoginAuth } from "../redux/authSlice";
import { useDispatch } from "react-redux";

interface ActivateLinkProps {
  OTP: string;
}

const OTPRules =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

const activateLinkSchema = yup.object().shape({
  // OTP: yup
  //   .string()
  //   .required("Password is required...")
  //   .matches(
  //     OTPRules,
  //     "Password must contain at least 8 characters, one letter, one number and one special character"
  //   ),
  OTP: yup.string().required("OTP is required..."),
});

const ActivateLink: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");

  const {
    handleSubmit,
    control,
    setValue,
    setFocus,
    register,
    formState: { errors },
  } = useForm<ActivateLinkProps>({
    resolver: yupResolver(activateLinkSchema),
    defaultValues: {
      OTP: "",
    },
  });

  const onFailure = (error: any) => {
    setErrorMessage(error?.response?.data?.detail);
    toast.error(error?.response?.data?.detail);
  };

  const onSuccess = (response: any) => {
    // toast.success(response?.data?.message);
    setUserEmail(response?.data?.user_email);
    console.log(response);
  };

  const { isloading, callFetch } = useApi({
    onSuccess,
    onFailure,
    header: "application/json",
  });

  const onFailureVerify = (error: any) => {
    setErrorMessage(error?.response?.data?.detail);
    toast.error(error?.response?.data?.detail);
    setValue("OTP", "");
    setFocus("OTP");
  };

  const onSuccessVerify = async (response: any) => {
    if (response?.data.status === 1) {
      await localStorage.setItem("auth_token", response?.data?.access_token);
      toast.success("Account activated successfully");
      const result = await dispatch(LoginAuth());
      navigate("/");
    } else {
      toast.error("Something went wrong");
    }
  };

  useEffect(() => {
    setFocus("OTP");
    const token = searchParams.get("token");
    callFetch("post", `/verify-email-token?token=${token}`);
  }, []);

  const { isloading: isLoadingVerify, callFetch: callFetchVerify } = useApi({
    onSuccess: onSuccessVerify,
    onFailure: onFailureVerify,
    header: "application/json",
  });

  const onSubmit = (data: ActivateLinkProps) => {
    const verify_otp = {
      user_email: userEmail,
      otp: data?.OTP,
    };
    callFetchVerify("post", "/verify-otp", verify_otp);
  };

  return (
    <div
      className="container d-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh" }}
    >
      <div className="col-12 col-md-8 col-lg-6">
        {isloading ? (
          <div className="text-center">
            <Spin size="large" />
          </div>
        ) : (
          <div className="form-container">
            <div className="text-center my-5">
              <h1 className="fw-bolder mb-3">Activate Account</h1>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="form-group mb-3">
                <Controller
                  name="OTP"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <>
                      <Input.Password
                        {...register("OTP")}
                        value={value}
                        onChange={onChange}
                        prefix={<LockOutlined />}
                        placeholder="OTP"
                        size="large"
                      />
                      {errors.OTP && (
                        <div className="text-danger">{errors.OTP.message}</div>
                      )}
                    </>
                  )}
                />
              </div>

              <div className="text-center">
                <button
                  type="submit"
                  className="btn btn-primary w-50"
                  disabled={isLoadingVerify}
                >
                  {isLoadingVerify ? (
                    <>
                      <LoadingOutlined spin style={{ marginRight: "10px" }} />
                      Activate Account
                    </>
                  ) : (
                    "Activate Account"
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivateLink;
