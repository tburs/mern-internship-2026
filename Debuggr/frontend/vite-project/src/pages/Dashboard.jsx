import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import AdminHeader from "../components/AdminHeader";


const todayString = () => {
  return new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/* ─── Modal ────────────────────────────────────────────── */
const Modal = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;
  return (
    <div style={overlay}>
      <div style={modal}>
        <div style={modalHeader}>
          <h2 style={modalTitle}>{title}</h2>
          <button onClick={onClose} style={closeBtn}>✕</button>
        </div>
        <div style={modalDivider} />
        {children}
      </div>
    </div>
  );
};

/* ─── Field row (label + value, two-column style) ──────── */
const FieldRow = ({ label, children }) => (
  <div style={fieldRow}>
    <span style={fieldLabel}>{label}</span>
    <div style={fieldValue}>{children}</div>
  </div>
);

/* ─── Dashboard ────────────────────────────────────────── */
const Dashboard = () => {
  const [user, setUser]       = useState(null);
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState({});

  /* form state */
  const [title, setTitle]           = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("ongoing");
  const [createdOn]                 = useState(todayString);

  const [stats, setStats] = useState({
    totalBugs: 0,
    solvedBugs: 0,
    totalProjects: 0,
  });

  /* load user */
  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) setUser(JSON.parse(saved));
  }, []);

  /* fetch projects */
  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = () => {
    fetch("http://localhost:5000/api/projects/my-projects", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then(r => r.json())
      .then(data => {
        setProjects(data);
        setStats(prev => ({ ...prev, totalProjects: data.length }));
      });
  };

  /* create project */
  const handleCreateProject = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:5000/api/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ title, description, status }),
    });

    const data = await res.json();
    if (res.ok) {
      setProjects(prev => [data.project, ...prev]);
      setStats(prev => ({ ...prev, totalProjects: prev.totalProjects + 1 }));
      setShowModal(false);
      setTitle("");
      setDescription("");
      setStatus("ongoing");
    } else {
      alert(data.message);
    }
  };

  const openModal = () => {
    setShowModal(true);
  };
  
  const closeModal = () => {
    setShowModal(false);
    setTitle("");
    setDescription("");
    setStatus("ongoing");
  };

  /* ── render ── */
  return (
    <div style={rootLayout}>
      <Sidebar onCreateProject={openModal} />

      <div style={mainArea}>
        <AdminHeader user={user} />

        <div style={contentWrapper}>

          {/* Greeting */}
          <header style={{ marginBottom: "30px" }}>
            <h1 style={titleStyle}>
              Hello,{" "}
              <span style={{ color: "#22c55e" }}>
                {user?.username || "User"}
              </span>{" "}
              👋
            </h1>
            <p style={subtitleStyle}>
              Here's what's happening across your projects today.
            </p>
          </header>

          {/* Stats */}
          <div style={statsContainer}>
            <StatBox title="Total Bugs"    value={stats.totalBugs} />
            <StatBox title="Solved Bugs"   value={stats.solvedBugs} />
            <StatBox title="Projects"      value={stats.totalProjects} />
          </div>

          {/* Projects */}
          <section style={{ marginBottom: "40px" }}>
            <div style={sectionHeader}>
              <h2 style={sectionTitle}>My Projects</h2>
              <Link to="/projects" style={linkStyle}>See all →</Link>
            </div>

            {projects.length > 0 ? (
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={th}>Title</th>
                    <th style={th}>Status</th>
                    <th style={th}>Key</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((p) => (
                    <tr key={p._id}>
                      <td style={td}>
                        <div style={{ fontWeight: "500" }}>{p.title}</div>
                        <div style={roleBadge}>
                          {p.teamLead?._id === user?.id ||
                           p.teamLead?._id === user?.userId
                            ? "Team Lead"
                            : "Member"}
                        </div>
                      </td>
                      <td style={td}>
                        <span style={getStatusPill(p.status)}>
                          {p.status}
                        </span>
                      </td>
                      <td style={td}>
                        <span
                          style={keyHidden}
                          onClick={() =>
                            setVisibleKeys(prev => ({
                              ...prev,
                              [p._id]: !prev[p._id],
                            }))
                          }
                        >
                          {visibleKeys[p._id] ? p.projectKey : "••••••"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <Empty
                text="No projects yet 🗂️"
                sub="Create a project to get started"
              />
            )}
          </section>

          {/* Recent Bugs */}
          <section>
            <div style={sectionHeader}>
              <h2 style={sectionTitle}>Recent Bugs</h2>
            </div>
            <Empty
              text="No bugs reported 🐞"
              sub="You're all clear… for now 😏"
            />
          </section>
        </div>
      </div>

      {/* ── Modal ── */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title="Create Project"
      >
        <form onSubmit={handleCreateProject}>

          {/* Title — full-width input at top like the reference */}
          <input
            placeholder="Project title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            style={titleInput}
            required
          />

          <div style={modalDivider} />

          {/* Two-column detail rows */}
          <FieldRow label="Role">
            <span style={rolePill}>Team Lead</span>
          </FieldRow>

          <FieldRow label="Status">
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              style={selectStyle}
            >
              <option value="ongoing">🟢 Ongoing</option>
              <option value="paused">🟡 Paused</option>
              <option value="completed">✅ Completed</option>
            </select>
          </FieldRow>

          <FieldRow label="Created on">
            <span style={metaText}>{createdOn}</span>
          </FieldRow>


          <FieldRow label="Description">
            <textarea
              placeholder="What is this project about?"
              value={description}
              onChange={e => setDescription(e.target.value)}
              style={textareaStyle}
              rows={3}
            />
          </FieldRow>

          <div style={modalDivider} />

          {/* Actions */}
          <div style={modalFooter}>
            <button type="button" onClick={closeModal} style={cancelBtn}>
              Cancel
            </button>
            <button type="submit" style={createBtn}>
              Create Project
            </button>
          </div>

        </form>
      </Modal>
    </div>
  );
};

/* ─── Sub-components ───────────────────────────────────── */
const StatBox = ({ title, value }) => (
  <div style={cardStyle}>
    <p style={{ color: "#6b7280", marginBottom: "6px" }}>{title}</p>
    <h2 style={{ color: "#22c55e", fontSize: "28px" }}>{value}</h2>
  </div>
);

const Empty = ({ text, sub }) => (
  <div style={{ textAlign: "center", padding: "40px", color: "#9ca3af" }}>
    <p style={{ fontSize: "16px", marginBottom: "6px" }}>{text}</p>
    <p style={{ fontSize: "13px" }}>{sub}</p>
  </div>
);

/* ─── Status pill helper ───────────────────────────────── */
const getStatusPill = (status) => {
  const map = {
    active:    { background: "#dcfce7", color: "#15803d" },
    "on hold": { background: "#fef9c3", color: "#a16207" },
    completed: { background: "#e0f2fe", color: "#0369a1" },
    ongoing:   { background: "#dcfce7", color: "#15803d" },
  };
  const colors = map[status?.toLowerCase()] || { background: "#f3f4f6", color: "#374151" };
  return {
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "500",
    ...colors,
  };
};

/* ─── Styles (unchanged) ───────────────────────────────── */
const rootLayout = {
  display: "flex",
  minHeight: "100vh",
  background: "#fff",
};

const mainArea = {
  flex: 1,
  padding: "30px",
};

const contentWrapper = {
  maxWidth: "1100px",
  margin: "0 auto",
};

const titleStyle = {
  fontSize: "26px",
  fontWeight: "600",
  color: "#111827",
};

const subtitleStyle = { color: "#6b7280" };

const sectionHeader = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "16px",
};

const sectionTitle = { color: "#22c55e", fontSize: "20px" };
const linkStyle    = { color: "#22c55e", textDecoration: "none" };

const statsContainer = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: "16px",
  marginBottom: "30px",
};

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: "10px",
  padding: "18px",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  tableLayout: "fixed",
};

const roleBadge = {
  display: "inline-block",
  marginTop: "6px",
  padding: "3px 10px",
  fontSize: "12px",
  borderRadius: "20px",
  background: "#dbeafe",
  color: "#2563eb",
};

const th = {
  textAlign: "left",
  padding: "12px 16px",
  borderBottom: "1px solid #e5e7eb",
  color: "#111827",
  fontWeight: "600",
};

const td = {
  textAlign: "left",
  padding: "12px 16px",
  borderBottom: "1px solid #e5e7eb",
  color: "#111827",
};

const keyHidden = {
  cursor: "pointer",
  letterSpacing: "2px",
  color: "#6b7280",
  fontFamily: "monospace",
  fontSize: "13px",
};

/* ── Modal styles ── */
const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.35)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modal = {
  background: "#fff",
  borderRadius: "14px",
  width: "480px",
  maxWidth: "95vw",
  padding: "28px 28px 20px",
  boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
};

const modalHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "16px",
};

const modalTitle = {
  fontSize: "22px",
  fontWeight: "700",
  color: "#111827",
};

const closeBtn = {
  background: "none",
  border: "none",
  cursor: "pointer",
  fontSize: "16px",
  color: "#6b7280",
  padding: "4px",
  lineHeight: 1,
};

const modalDivider = {
  borderTop: "1px solid #f3f4f6",
  margin: "12px 0",
};

/* full-width title input like the reference */
const titleInput = {
  width: "100%",
  border: "none",
  borderBottom: "2px solid #22c55e",
  outline: "none",
  fontSize: "16px",
  padding: "6px 2px",
  marginBottom: "8px",
  color: "#111827",
  background: "transparent",
};

/* two-column field row */
const fieldRow = {
  display: "grid",
  gridTemplateColumns: "120px 1fr",
  alignItems: "center",
  padding: "9px 0",
  borderBottom: "1px solid #f3f4f6",
  gap: "12px",
};

const fieldLabel = {
  fontSize: "13px",
  color: "#6b7280",
};

const fieldValue = {
  fontSize: "13px",
  color: "#111827",
};

const metaText = {
  fontSize: "13px",
  color: "#374151",
};

const rolePill = {
  display: "inline-block",
  padding: "3px 10px",
  borderRadius: "20px",
  fontSize: "12px",
  fontWeight: "500",
  background: "#dbeafe",
  color: "#2563eb",
};

const keyPill = {
  display: "inline-block",
  padding: "3px 10px",
  borderRadius: "6px",
  fontSize: "12px",
  fontFamily: "monospace",
  fontWeight: "600",
  background: "#f3f4f6",
  color: "#374151",
  letterSpacing: "1px",
};

const selectStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: "6px",
  padding: "4px 10px",
  fontSize: "13px",
  color: "#374151",
  background: "#fff",
  cursor: "pointer",
  outline: "none",
};

const textareaStyle = {
  width: "100%",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  padding: "10px 12px",
  fontSize: "13px",
  color: "#111827",
  background: "#ffffff",
  resize: "none",
  outline: "none",
  fontFamily: "inherit",
};

const modalFooter = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "10px",
  marginTop: "16px",
};

const cancelBtn = {
  padding: "9px 20px",
  borderRadius: "8px",
  border: "1px solid #e5e7eb",
  background: "#fff",
  color: "#374151",
  fontSize: "14px",
  cursor: "pointer",
  fontWeight: "500",
};

const createBtn = {
  padding: "9px 20px",
  borderRadius: "8px",
  border: "none",
  background: "#22c55e",
  color: "#fff",
  fontSize: "14px",
  cursor: "pointer",
  fontWeight: "600",
};

export default Dashboard;