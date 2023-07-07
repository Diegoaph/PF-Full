import React, { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../../redux/slices/authSlice";
import { useNavigate } from "react-router-dom";
import Admin from "../../components/Deshboard/Admin/Admin";
import User from "../../components/Deshboard/User/User";

const MyAccount = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.loginStatus.user);
  const [userData, setUserData] = useState(null);

  const decryptData = (encodedText, secretKey) => {
    const decodedText = atob(encodedText);
    return decodedText;
  };

  const encryptData = (text, secretKey) => {
    const encodedText = btoa(text);
    return encodedText;
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const decryptedUser = decryptData(storedUser, "secretKey");
      dispatch(setUser(decryptedUser));
    }
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get("/users", {
          params: {
            email: user,
          },
        });
        const filteredUser = response.data.find(
          (userData) => userData.user_email === user
        );
        setUserData(filteredUser);
      } catch (error) {
        console.error("Error al obtener los datos del usuario:", error);
      }
    };

    if (user) {
      fetchUserData();
    }
  }, [user]);

  const logout = () => {
    localStorage.removeItem("user");
    dispatch(setUser(null));
  };

  const handleLogout = () => {
    const encryptedUser = encryptData(user, "secretKey");
    localStorage.setItem("user", encryptedUser);
    logout();
    navigate("/home");
  };

  return (
    <div>
      {userData && userData.user_type.includes("admin") ? (
        <Admin userData={userData} />
      ) : null}
      {userData && userData.user_type.includes("user") ? (
        <User userData={userData} />
      ) : null}
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default MyAccount;
