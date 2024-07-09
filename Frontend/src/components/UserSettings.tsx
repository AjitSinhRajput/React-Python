import React, { useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import { useSelector } from "react-redux";
import Login from "./Login";
import Register from "./Register";
import EditProfile from "./EditProfile";
import ForgotPassword from "./ForgotPassword";

const UserSettings: React.FC = () => {
  const { isLogedin } = useSelector((state: any) => state.auth);

  const tabList = isLogedin
    ? [
        {
          key: "Login",
          tab: <span className="fs-6">Logout</span>,
        },
        {
          key: "EditProfile",
          tab: <span className="fs-6">Edit Profile</span>,
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
        {
          key: "ForgotPassword",
          tab: <span className="fs-6">Forgot Password</span>,
        },
      ];

  const [activeTabKey1, setActiveTabKey1] = useState<string>("Login");
  const onTab1Change = (key: string) => {
    setActiveTabKey1(key);
  };

  const contentList: Record<string, React.ReactNode> = {
    Login: <Login setKey={(key) => setActiveTabKey1(key)} />,
    Register: <Register setKey={(key) => setActiveTabKey1(key)} />,
    EditProfile: <EditProfile setKey={(key) => setActiveTabKey1(key)} />,
    ForgotPassword: <ForgotPassword setKey={(key) => setActiveTabKey1(key)} />,
  };

  return (
    <div className="container-fluid my-4">
      <div className="d-flex justify-content-center">
        <div className="card" style={{ maxWidth: "40em", width: "100%" }}>
          <div className=" card-header text-center pt-5">
            <FaUserCircle style={{ height: "5em", width: "auto" }} />
            <h1 className="mt-2">
              {isLogedin ? (
                <span className="fs-3 fw-bold">User Settings</span>
              ) : (
                <span className="fs-3 fw-bold">Register / Login</span>
              )}
            </h1>
          </div>
          <div className="card-body">
            <ul className="nav  justify-content-center mb-3" role="tablist">
              {tabList.map((tab) => (
                <li className="nav-item" key={tab.key}>
                  <a
                    className={`nav-link text-dark fw-bold ${
                      activeTabKey1 === tab.key ? "" : ""
                    }`}
                    onClick={() => onTab1Change(tab.key)}
                    role="tab"
                    style={{
                      borderBottom:
                        activeTabKey1 === tab.key
                          ? "2px solid #EB5926"
                          : "none",
                      cursor: "pointer",
                    }}
                  >
                    {tab.tab}
                  </a>
                </li>
              ))}
            </ul>
            <div className="tab-content ">
              <div className="tab-pane active" role="tabpanel">
                {contentList[activeTabKey1]}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSettings;
