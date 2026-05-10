import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AdminHeader = ({ user }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm("Logout from Debuggr?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  const initials = user?.username
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} style={container}>
      
      {/* Profile */}
      <div onClick={() => setShowDropdown(!showDropdown)} style={profile}>
        <div style={avatar}>{initials || "U"}</div>
        <span>{user?.username || "User"}</span>
      </div>

      {/* Dropdown */}
      <div
        style={{
          ...dropdown,
          opacity: showDropdown ? 1 : 0,
          transform: showDropdown ? "translateY(0)" : "translateY(-8px)",
          pointerEvents: showDropdown ? "auto" : "none",
        }}
      >
        <div style={userInfo}>
          <div style={bigAvatar}>{initials || "U"}</div>
          <div>
            <div style={{ fontWeight: "600" }}>{user?.username}</div>
            <div style={{ fontSize: "13px", color: "#6b7280" }}>
              {user?.email}
            </div>
          </div>
        </div>

        <div style={divider} />

        <button onClick={handleLogout} style={logoutBtn}>
          Log out
        </button>
      </div>
    </div>
  );
};

/* styles*/

const container = {
  display: "flex",
  justifyContent: "flex-end",
  marginBottom: "20px",
};

const profile = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "8px 14px",
  borderRadius: "20px",
  border: "1px solid #e5e7eb",
  cursor: "pointer",
  background: "#ffffff",
};

const avatar = {
  width: "30px",
  height: "30px",
  borderRadius: "50%",
  background: "#22c55e",
  color: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "600",
};

const dropdown = {
  position: "absolute",
  top: "55px",
  right: 0,
  width: "260px",
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "12px",
  padding: "16px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  transition: "all 0.2s ease",
};

const userInfo = {
  display: "flex",
  gap: "10px",
  alignItems: "center",
};

const bigAvatar = {
  width: "40px",
  height: "40px",
  borderRadius: "50%",
  background: "#22c55e",
  color: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "600",
};

const divider = {
  margin: "12px 0",
  borderTop: "1px solid #e5e7eb",
};

const logoutBtn = {
  width: "100%",
  padding: "10px",
  borderRadius: "8px",
  border: "none",
  background: "#22c55e",
  color: "black",
  cursor: "pointer",
  fontWeight: "500",
};

export default AdminHeader;