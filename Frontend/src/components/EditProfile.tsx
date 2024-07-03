import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Input, Button } from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  LockOutlined,
  LoadingOutlined,
  EditOutlined,
  EyeTwoTone,
  EyeInvisibleOutlined,
} from "@ant-design/icons";
import useApi from "../redux/hooks/useApi";

interface ProfileProps {
  setKey: (key: string) => void;
}

interface UserDetails {
  user_name: string;
  email: string;
  phone: string;
}

const editProfileSchema = yup.object().shape({
  user_name: yup
    .string()
    .required("Username is required.")
    .min(4, "Username should have at least 4 characters."),
  phone: yup
    .string()
    .required("Phone number is required.")
    .matches(/^[0-9]*$/, "Phone number should contain only digits.")
    .min(10, "Phone should have at least 10 characters."),
});

const changePasswordSchema = yup.object().shape({
  password: yup
    .string()
    .required("Password is required...")
    .min(6, "Password should have at least 6 characters."),
  confirm_password: yup
    .string()
    .required("Confirm Password is required.")
    .oneOf([yup.ref("password")], "Passwords must match"),
});

const EditProfile: React.FC<ProfileProps> = ({ setKey }) => {
  const dispatch = useDispatch();
  const { user_name, email, isLogedin } = useSelector(
    (state: any) => state.auth
  );

  const [userDetails, setUserDetails] = useState<UserDetails>({
    user_name: "",
    email: "",
    phone: "",
  });

  const [editMode, setEditMode] = useState(false);
  const [changePasswordMode, setChangePasswordMode] = useState(false);

  const {
    handleSubmit: handleEditProfileSubmit,
    control: editProfileControl,
    reset: resetEditProfile,
    formState: { errors: editProfileErrors },
  } = useForm({
    resolver: yupResolver(editProfileSchema),
    defaultValues: {
      user_name: "",
      phone: "",
    },
  });

  const {
    handleSubmit: handleChangePasswordSubmit,
    control: changePasswordControl,
    reset: resetChangePassword,
    formState: { errors: changePasswordErrors },
  } = useForm({
    resolver: yupResolver(changePasswordSchema),
    defaultValues: {
      password: "",
      confirm_password: "",
    },
  });

  useEffect(() => {
    callFetchGet("get", "/view-user");
  }, []);

  const onSuccessGet = (response: any) => {
    resetEditProfile({
      user_name: response.data.user_name,
      phone: response.data.phone,
    });
    setUserDetails({
      user_name: response.data.user_name,
      email: response.data.user_email,
      phone: response.data.phone,
    });
  };

  const onFailureGet = (error: any) => {
    toast.error(error.response.data.detail);
  };

  const { isloading: isloadingGet, callFetch: callFetchGet } = useApi({
    onSuccess: onSuccessGet,
    onFailure: onFailureGet,
    header: "application/json",
  });

  const onSuccessEdit = (response: any) => {
    toast.success(response?.data?.message);
    resetEditProfile();
    setEditMode(false);
    callFetchGet("get", "/view-user");
  };

  const onFailureEdit = (error: any) => {
    toast.error(error.response.data.detail);
  };

  const { isloading: isloadingEdit, callFetch: callFetchEdit } = useApi({
    onSuccess: onSuccessEdit,
    onFailure: onFailureEdit,
    header: "application/json",
  });

  const onSuccessChangePassword = (response: any) => {
    toast.success(response?.data?.message);
    resetChangePassword();
    setChangePasswordMode(false);
    callFetchGet("get", "/view-user");
  };

  const onFailureChangePassword = (error: any) => {
    if (
      error?.response?.data?.detail[0].msg ==
      "Value error, Password cannot be empty"
    ) {
      toast.error("Password cannot be empty!");
      return;
    }
    toast.error(error.response.data.detail);
  };

  const {
    isloading: isloadingChangePassword,
    callFetch: callFetchChangePassword,
  } = useApi({
    onSuccess: onSuccessChangePassword,
    onFailure: onFailureChangePassword,
    header: "application/json",
  });

  const handleEditProfile = (data: any) => {
    callFetchEdit("patch", "/edit-user", data);
  };

  const handleChangePassword = (data: any) => {
    callFetchChangePassword("patch", "/change-pwd", {
      new_password: data.password,
    });
  };

  return (
    <div className="row justify-content-center ">
      <div className="col-sm-10 col-md-8 col-lg-8">
        {!editMode && !changePasswordMode ? (
          <div className="d-flex justify-content-center flex-column gap-3 bg-light p-4 rounded shadow">
            <div className="row ">
              <div className="col-12">
                <h5>Name: {userDetails.user_name}</h5>
              </div>
              <div className="col-12">
                <h5>Email: {userDetails.email}</h5>
              </div>
              <div className="col-12">
                <h5>Phone: {userDetails.phone}</h5>
              </div>
            </div>
            <div className="d-flex gap-2 justify-content-center">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setEditMode(true)}
              >
                <EditOutlined className="me-1" />
                <span className="fs-6">Edit Profile</span>
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setChangePasswordMode(true)}
              >
                <EditOutlined className="me-1" />
                <span className="fs-6">Change Password</span>
              </button>
            </div>
          </div>
        ) : editMode ? (
          <form onSubmit={handleEditProfileSubmit(handleEditProfile)}>
            <div className="form-group py-2">
              <Controller
                name="user_name"
                control={editProfileControl}
                render={({ field }) => (
                  <>
                    <Input
                      {...field}
                      prefix={<UserOutlined className="site-form-item-icon" />}
                      placeholder="Username"
                      size="large"
                    />
                    {editProfileErrors.user_name && (
                      <span className="text-danger">
                        {editProfileErrors.user_name.message}
                      </span>
                    )}
                  </>
                )}
              />
            </div>
            <div className="form-group py-2">
              <Controller
                name="phone"
                control={editProfileControl}
                render={({ field }) => (
                  <>
                    <Input
                      {...field}
                      prefix={<PhoneOutlined className="site-form-item-icon" />}
                      placeholder="Phone"
                      size="large"
                    />
                    {editProfileErrors.phone && (
                      <span className="text-danger">
                        {editProfileErrors.phone.message}
                      </span>
                    )}
                  </>
                )}
              />
            </div>
            <div className="text-center d-flex gap-2 justify-content-center mt-3">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isloadingEdit}
              >
                {isloadingEdit ? (
                  <>
                    <LoadingOutlined spin style={{ marginRight: "10px" }} />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() => {
                  resetEditProfile();
                  setEditMode(false);
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleChangePasswordSubmit(handleChangePassword)}>
            <div className="form-group py-2">
              <Controller
                name="password"
                control={changePasswordControl}
                render={({ field }) => (
                  <>
                    <Input.Password
                      {...field}
                      prefix={<LockOutlined className="site-form-item-icon" />}
                      placeholder="New Password"
                      size="large"
                      iconRender={(visible) =>
                        visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                      }
                    />
                    {changePasswordErrors.password && (
                      <span className="text-danger">
                        {changePasswordErrors.password.message}
                      </span>
                    )}
                  </>
                )}
              />
            </div>
            <div className="form-group py-2">
              <Controller
                name="confirm_password"
                control={changePasswordControl}
                render={({ field }) => (
                  <>
                    <Input.Password
                      {...field}
                      prefix={<LockOutlined className="site-form-item-icon" />}
                      placeholder="Confirm Password"
                      size="large"
                      iconRender={(visible) =>
                        visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                      }
                    />
                    {changePasswordErrors.confirm_password && (
                      <span className="text-danger">
                        {changePasswordErrors.confirm_password.message}
                      </span>
                    )}
                  </>
                )}
              />
            </div>
            <div className="text-center d-flex gap-2 justify-content-center mt-3">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isloadingChangePassword}
              >
                {isloadingChangePassword ? (
                  <>
                    <LoadingOutlined spin style={{ marginRight: "10px" }} />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() => {
                  resetChangePassword();
                  setChangePasswordMode(false);
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditProfile;
