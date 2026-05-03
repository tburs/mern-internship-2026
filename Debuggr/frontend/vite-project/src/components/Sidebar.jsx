import { Link, useLocation } from "react-router-dom";

const Sidebar = ({ onCreateProject }) => {   // ✅ FIX
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div style={sidebar}>
      
      {/* Logo */}
      <div style={logo}>🐛 Debuggr</div>

      {/* Navigation */}
      <nav style={{ marginBottom: "40px" }}>
        <NavItem to="/dashboard" label="Dashboard" active={isActive("/dashboard")} />
        <NavItem to="/projects" label="Projects" active={isActive("/projects")} />
        <NavItem to="/bugs" label="Bugs" active={isActive("/bugs")} />
      </nav>

      {/* Actions */}
      <div>
        <ActionButton
          label="Create Project"
          onClick={onCreateProject}   // ✅ FIX
        />
        <ActionButton label="Join Project" />
        <ActionButton label="Log Bug" />
      </div>

    </div>
  );
};

/* 🔹 Components */

const NavItem = ({ to, label, active }) => (
  <Link
    to={to}
    style={{
      ...navItem,
      background: active ? "#ecfdf5" : "transparent",
      color: active ? "#16a34a" : "#111827",
      fontWeight: active ? "600" : "500",
    }}
  >
    {label}
  </Link>
);

const ActionButton = ({ label, onClick }) => (   // ✅ FIX
  <div style={actionBtn} onClick={onClick}>
    {label}
  </div>
);

/* 🔹 Styles */

const sidebar = {
  width: "250px",
  background: "#ffffff",
  borderRight: "1px solid #e5e7eb",
  padding: "25px 20px",
};

const logo = {
  fontSize: "22px",
  fontWeight: "600",
  marginBottom: "40px",
};

const navItem = {
  display: "block",
  padding: "12px 14px",
  borderRadius: "8px",
  textDecoration: "none",
  marginBottom: "8px",
  transition: "all 0.2s",
};

const actionBtn = {
  padding: "12px 14px",
  marginBottom: "10px",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "14px",
  color: "white",
  background: "#22c55e",
};

export default Sidebar;