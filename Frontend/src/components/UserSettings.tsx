import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Card, Input } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { FaUserCircle } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useApi from "../redux/hooks/useApi";
import { LoginAuth, LogOutRedux } from "../redux/authSlice";
import { useDispatch, useSelector } from "react-redux";
import Login from "./Login";
import Logout from "./Logout";
import Register from "./Register";
// Define validation schema using Yup without custom error messages

const UserSettings: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user_name, isLogedin } = useSelector((state: any) => state.auth);

  const tabList = isLogedin
    ? [
        {
          key: "Login",
          tab: "Logout",
        },
      ]
    : [
        {
          key: "Login",
          tab: <span className="fs-6">Login</span>,
        },

        {
          key: "Register",
          tab: <span className="fs-6">Register</span>,
        },
      ];
  const SetLogutKey = (key: string) => {
    setActiveTabKey1(key);
  };

  const contentList: Record<string, React.ReactNode> = {
    Login: <Login setKey={(key) => SetLogutKey(key)} />,
    Register: <Register setKey={(key) => SetLogutKey(key)} />,
  };
  const [activeTabKey1, setActiveTabKey1] = useState<string>("Login");
  const onTab1Change = (key: string) => {
    setActiveTabKey1(key);
  };

  return (
    <div className="">
      <div className="container">
        <div className="row justify-content-center mt-5">
          <Card
            style={{ maxWidth: "40em", height: "auto" }}
            title={
              <div className="text-center">
                <FaUserCircle style={{ height: "5em", width: "auto" }} />
                <h1 className="mt-2">
                  {isLogedin ? (
                    <span className="fs-3 fw-bold">User Settings</span>
                  ) : (
                    <span className="fs-3 fw-bold">Register / Login</span>
                  )}
                </h1>
              </div>
            }
            tabList={tabList}
            tabProps={{ centered: true }}
            activeTabKey={activeTabKey1}
            onTabChange={onTab1Change}
            defaultActiveTabKey={"Login"}
          >
            {contentList[activeTabKey1]}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserSettings;
