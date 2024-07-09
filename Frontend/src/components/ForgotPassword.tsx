import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Input } from "antd";
import { MailOutlined, LoadingOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";

import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import useApi from "../redux/hooks/useApi";

interface ForgotPasswordProps {
  setKey: (key: string) => void;
}

const emailSchema = yup.object().shape({
  user_email: yup
    .string()
    .required("Email is required.")
    .email("Invalid email format"),
});

const otpPasswordSchema = yup.object().shape({
  otp: yup.string().required("OTP is required"),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password should have at least 6 characters"),
  confirm_password: yup
    .string()
    .required("Confirm Password is required")
    .oneOf([yup.ref("password")], "Passwords must match"),
});

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ setKey }) => {
  const {
    handleSubmit: handleSubmitEmail,
    control: controlEmail,
    reset: resetEmail,
    setValue,
    formState: { errors: emailErrors },
  } = useForm({
    mode: "onBlur",
    resolver: yupResolver(emailSchema),
    defaultValues: {
      user_email: "",
    },
  });

  const {
    handleSubmit: handleSubmitOTP,
    control: controlOTP,
    reset: resetOTP,
    formState: { errors: otpErrors },
  } = useForm({
    mode: "onBlur",
    resolver: yupResolver(otpPasswordSchema),
    defaultValues: {
      otp: "",
      password: "",
      confirm_password: "",
    },
  });

  const [showOtpPasswordFields, setShowOtpPasswordFields] = useState(false);
  const [isEmailSubmitting, setIsEmailSubmitting] = useState(false);
  const [isOtpSubmitting, setIsOtpSubmitting] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");

  const onSuccessEmail = (response: any) => {
    toast.success("OTP sent successfully to your email!");
    resetEmail(); // Reset email form after successful submission
    setUserEmail(response?.data?.user_email);

    setIsEmailSubmitting(true); // Set flag to indicate email submission success
    setShowOtpPasswordFields(true); // Show OTP and password fields
  };

  const onFailureEmail = (error: any) => {
    toast.error(error?.response?.data?.detail);
  };

  const { isloading: isloadingEmail, callFetch: callFetchEmail } = useApi({
    onSuccess: onSuccessEmail,
    onFailure: onFailureEmail,
    header: "application/json",
  });

  const onSuccessVerifyOTP = (response: any) => {
    setIsOtpSubmitting(true);
    setKey("Login");
    toast.success("Password Reset successfully!");
    // Optionally, you can perform further actions after OTP verification
  };

  const onFailureVerifyOTP = (error: any) => {
    toast.error(error?.response?.data?.detail);
  };

  const { isloading: isloadingOTP, callFetch: callFetchOTP } = useApi({
    onSuccess: onSuccessVerifyOTP,
    onFailure: onFailureVerifyOTP,
    header: "application/json",
  });

  const onSubmitEmailForm = (data: any) => {
    callFetchEmail("post", "/forgot-password-email", {
      email: data.user_email,
    });
  };

  const onSubmitOTPForm = (data: any) => {
    if (userEmail) {
      callFetchOTP("post", "/reset-pwd", {
        email: userEmail,
        new_password: data.password,
        otp: data.otp,
      });
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-sm-10 col-md-8 col-lg-8">
        {userEmail ? (
          <>
            <h6 className="fs-6">
              Your OTP has been sent to your email{" "}
              <span className="fw-bold">{userEmail}</span>.
            </h6>
          </>
        ) : (
          <form onSubmit={handleSubmitEmail(onSubmitEmailForm)}>
            <div className="form-group py-2">
              <Controller
                name="user_email"
                control={controlEmail}
                render={({ field: { onChange, value } }) => (
                  <>
                    <Input
                      value={value}
                      onChange={onChange}
                      disabled={isloadingEmail || isEmailSubmitting}
                      prefix={<MailOutlined className="site-form-item-icon" />}
                      placeholder="Enter your email"
                      size="large"
                    />
                    {emailErrors.user_email && (
                      <span className="text-danger">
                        {emailErrors.user_email.message}
                      </span>
                    )}
                  </>
                )}
              />
            </div>
            <div className="form-group text-center">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isloadingEmail || isEmailSubmitting}
              >
                {isloadingEmail ? (
                  <>
                    <LoadingOutlined style={{ marginRight: "10px" }} />
                    Sending OTP...
                  </>
                ) : (
                  "Get OTP"
                )}
              </button>
            </div>
          </form>
        )}

        {showOtpPasswordFields && (
          <form onSubmit={handleSubmitOTP(onSubmitOTPForm)}>
            <div className="form-group py-2">
              <Controller
                name="otp"
                control={controlOTP}
                render={({ field: { onChange, value } }) => (
                  <>
                    <Input
                      value={value}
                      onChange={onChange}
                      prefix={<MailOutlined className="site-form-item-icon" />}
                      placeholder="Enter OTP"
                      size="large"
                    />
                    {otpErrors.otp && (
                      <span className="text-danger">
                        {otpErrors.otp.message}
                      </span>
                    )}
                  </>
                )}
              />
            </div>
            <div className="form-group py-2">
              <Controller
                name="password"
                control={controlOTP}
                render={({ field: { onChange, value } }) => (
                  <>
                    <Input.Password
                      value={value}
                      onChange={onChange}
                      prefix={<MailOutlined className="site-form-item-icon" />}
                      placeholder="Enter New Password"
                      size="large"
                    />
                    {otpErrors.password && (
                      <span className="text-danger">
                        {otpErrors.password.message}
                      </span>
                    )}
                  </>
                )}
              />
            </div>
            <div className="form-group py-2">
              <Controller
                name="confirm_password"
                control={controlOTP}
                render={({ field: { onChange, value } }) => (
                  <>
                    <Input.Password
                      value={value}
                      onChange={onChange}
                      prefix={<MailOutlined className="site-form-item-icon" />}
                      placeholder="Confirm New Password"
                      size="large"
                    />
                    {otpErrors.confirm_password && (
                      <span className="text-danger">
                        {otpErrors.confirm_password.message}
                      </span>
                    )}
                  </>
                )}
              />
            </div>
            <div className="form-group text-center">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isloadingOTP || isOtpSubmitting}
              >
                {isloadingOTP ? (
                  <>
                    <LoadingOutlined style={{ marginRight: "10px" }} />
                    Submit
                  </>
                ) : (
                  "Submit"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
