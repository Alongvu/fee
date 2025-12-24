// src/Components/Navbar/Navbar.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

import navlogo from "../../assets/nav-logo.svg";
import navProfile from "../../assets/profile_icon.png";
import searchicon from "../../assets/search_icon.svg";

const Navbar = () => {
  const [showSearch, setShowSearch] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const menuRef = useRef(null);

  const isAuthenticated = !!localStorage.getItem("auth-token");

  const handleLogout = () => {
    localStorage.removeItem("auth-token");
    localStorage.removeItem("user-email");
    setShowUserMenu(false);
    navigate("/login");
  };

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="navbar">

      <Link to="/">
        <img src={navlogo} alt="Logo" className="nav-logo" />
      </Link>

      <div className="nav-right">

        {showSearch && (
          <div className="search-box">
            <input type="text" placeholder="Tìm kiếm..." />
          </div>
        )}

        <img
          src={searchicon}
          alt="search"
          className="search_icon"
          onClick={() => setShowSearch(!showSearch)}
        />

        {/* PROFILE */}
        <div className="profile-wrapper" ref={menuRef}>
          <img
            src={navProfile}
            alt="Profile"
            className="nav-profile"
            onClick={() => {
              if (isAuthenticated) setShowUserMenu(!showUserMenu);
            }}
          />

          {isAuthenticated && showUserMenu && (
            <div className="user-dropdown-menu">
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Navbar;
