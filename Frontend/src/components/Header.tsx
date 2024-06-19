import React from "react";
import { Link } from "react-router-dom";
import {
  HomeOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import Logo from "../../public/Logo.png";
import { useSelector } from "react-redux";
import { MdOutlineSettings } from "react-icons/md";
import { GrClose, GrContact } from "react-icons/gr";
// Import the CSS file
import { SlMenu } from "react-icons/sl";
import { IoClose } from "react-icons/io5";

const CustomHeader = () => {
  const [collapsed, setCollapsed] = React.useState(true);

  const current_state = useSelector((state: any) => state.auth);
  const isLogedin = current_state.isLogedin;

  const toggleMenu = () => {
    setCollapsed(!collapsed);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light navbar-custom fs-5 fw-bold">
      <div className="container-fluid">
        <Link
          className="navbar-brand"
          to="/"
          onClick={() => (collapsed ? null : setCollapsed(true))}
        >
          <img
            className="rounded"
            style={{ height: "8vh", width: "auto" }}
            src={Logo}
            alt="Logo"
          />
        </Link>
        <button
          className="btn btn-light d-block d-lg-none fs-5"
          onClick={toggleMenu}
        >
          {collapsed ? <SlMenu /> : <GrClose />}
        </button>
        <div className={`collapse navbar-collapse ${collapsed ? "" : "show"}`}>
          <ul className="navbar-nav mb-2 mb-lg-0 d-flex w-100 d-flex gap-lg-3">
            <li className="nav-item">
              <Link className="nav-link" to="/" onClick={toggleMenu}>
                <div className="d-flex gap-1 align-items-baseline">
                  <span>Home</span>
                  <HomeOutlined className="fs-5" />
                </div>
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/about" onClick={toggleMenu}>
                <div className="d-flex gap-1 align-items-center">
                  <span>About Us</span>
                  <GrContact className="fs-5" />
                </div>
              </Link>
            </li>
            {isLogedin ? (
              <li className="nav-item">
                <Link className="nav-link" to="/list" onClick={toggleMenu}>
                  List
                </Link>
              </li>
            ) : (
              ""
            )}
            <li className="nav-item ms-lg-auto">
              <Link className="nav-link" to="/settings" onClick={toggleMenu}>
                {isLogedin ? (
                  <div className="d-flex gap-1 align-items-center">
                    <MdOutlineSettings className="fs-5" />
                    <span>Settings</span>
                  </div>
                ) : (
                  "Register / Login"
                )}
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default CustomHeader;
