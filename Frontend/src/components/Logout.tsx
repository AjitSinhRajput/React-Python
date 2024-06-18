import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import { LogOutRedux } from "../redux/authSlice"; // Assume this action is available for logout

interface LogoutProps {
  setKey: (key: string) => void;
}

const Logout: React.FC<LogoutProps> = ({ setKey }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user_name, isLogedin } = useSelector((state: any) => state.auth);
  const handleLogout = () => {
    dispatch(LogOutRedux());
    setKey("Login");
    // Update the auth state
    // navigate("/login"); // Redirect to login page after logout
  };
  return (
    <div className="row text-center justify-content-center">
      <div className="col-sm-10 col-md-8 col-lg-6 text-center ">
        {/* <h1 className="my-4">Logout</h1> */}
        <h2 className="my-4">User Name: {user_name}</h2>
        <p>Are sure you want to logout ?</p>
        <button className="btn btn-danger" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Logout;
