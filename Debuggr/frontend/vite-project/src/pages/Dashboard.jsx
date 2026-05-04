import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import AdminHeader from "../components/AdminHeader";
import {io} from "socket.io-client";

const todayString = () => {
  return new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/* Modal */
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

/* Fieldrow (label + value, two-column style */
const FieldRow = ({ label, children }) => (
  <div style={fieldRow}>
    <span style={fieldLabel}>{label}</span>
    <div style={fieldValue}>{children}</div>
  </div>
);

/* Dashboard */
const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState({});

  const [editingStatus, setEditingStatus] = useState(null);
  const [editingPriority, setEditingPriority] = useState(null);
const [editingBugStatus, setEditingBugStatus] = useState(null);
const [editingAssign, setEditingAssign] = useState(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinKey, setJoinKey] = useState("");

  /* form state */
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("ongoing");
  const [createdOn] = useState(todayString);

  const [showBugModal, setShowBugModal] = useState(false);
  const [bugs, setBugs] = useState([]);
  const [bugTitle, setBugTitle] = useState("");
  const [bugDescription, setBugDescription] = useState("");
  const [bugProject, setBugProject] = useState("");
  const [bugPriority, setBugPriority] = useState("medium");
  const [bugStatus, setBugStatus] = useState("open");
  const [assignedTo, setAssignedTo] = useState("");

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
  useEffect(() => {
    fetchProjects();
    fetchBugs();
    fetchStats();
  }, []);

//socket connection
useEffect(() => {
  const socket = io("http://localhost:5000");

  socket.on("bugCreated", () => {
    console.log("⚡ bug created");
    fetchBugs();
    fetchStats();
  });

  socket.on("bugUpdated", () => {
    console.log("⚡ bug updated");
    fetchBugs();
    fetchStats();
  });

  socket.on("bugDeleted", () => {
    console.log("⚡ bug deleted");
    fetchBugs();
    fetchStats();
  });

  socket.on("projectCreated", () => {
    console.log("⚡ project created");
    fetchProjects();
    fetchStats();
  });

  socket.on("projectUpdated", () => {
    console.log("⚡ project updated");
    fetchProjects();
  });

  socket.on("projectJoined", () => {
    console.log("⚡ project joined");
    fetchProjects();
    fetchStats();
  });

  return () => socket.disconnect();
}, []);


  const fetchProjects = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/projects/my-projects", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setProjects(data);
        setStats(prev => ({ ...prev, totalProjects: data.length }));
      } else {
        console.error("Error fetching projects:", data.message);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  //fetching bugs
  const fetchBugs = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/dashboard/recent-bugs", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setBugs(data);
      } else {
        console.error("Error fetching bugs:", data.message);
      }
    } catch (err) {
      console.error("Fetch bugs error:", err);
    }
  };

  const fetchStats = async () => {
    const res = await fetch("http://localhost:5000/api/dashboard/stats", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    const data = await res.json();
    setStats(data);
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

  //join project 
  const handleJoinProject = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/projects/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ projectKey: joinKey }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Joined project successfully 😤🔥");
        setShowJoinModal(false);
        setJoinKey("");
        fetchProjects();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  //bug logging handler
  const handleCreateBug = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/bugs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          title: bugTitle,
          description: bugDescription,
          projectId: bugProject,
          priority: bugPriority,
          status: bugStatus,
          ...(assignedTo && { assignedTo }),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        await fetchBugs();

        setShowBugModal(false);

        // reset fields
        setBugTitle("");
        setBugDescription("");
        setBugProject("");
        setBugPriority("medium");
        setBugStatus("open");
        setAssignedTo("");
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

const handleDeleteBug = async (bug) => {
  const currentUserId = user?.id || user?.userId;

  const isAllowed =
    bug.reportedBy?._id === currentUserId ||
    bug.projectId?.teamLead?._id === currentUserId; // 🔥 FIXED

  if (!isAllowed) {
    alert("Only the team lead or bug creator can delete this bug 🚫");
    return;
  }

  const confirmDelete = window.confirm(
    "Are you sure you want to delete this bug?"
  );

  if (!confirmDelete) return;

  await fetch(`http://localhost:5000/api/bugs/${bug._id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  fetchBugs();
};

// 🔴 Update priority
const handlePriorityChange = async (bugId, newPriority) => {
  await fetch(`http://localhost:5000/api/bugs/${bugId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ priority: newPriority }),
  });

  fetchBugs();
};

// 🔵 Update status
const handleBugStatusChange = async (bugId, newStatus) => {
  await fetch(`http://localhost:5000/api/bugs/${bugId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ status: newStatus }),
  });

  fetchBugs();
};

// 🟢 Assign user
const handleAssignChange = async (bugId, userId) => {
  await fetch(`http://localhost:5000/api/bugs/${bugId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ assignedTo: userId }),
  });

  fetchBugs();
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

  //status change handler
  const handleStatusChange = async (projectId, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/api/projects/${projectId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (res.ok) {
        setProjects((prev) =>
          prev.map((p) =>
            p._id === projectId ? { ...p, status: newStatus } : p
          )
        );
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  //render
  return (
    <div style={rootLayout}>
      <Sidebar
        onCreateProject={openModal}
        onJoinProject={() => setShowJoinModal(true)}
        onLogBug={() => setShowBugModal(true)}
      />

      <div style={mainArea}>
        <AdminHeader user={user} />

        <div style={contentWrapper}>
          {/* user specific greeting*/}
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
            <StatBox title="Total Bugs" value={stats.totalBugs} />
            <StatBox title="Solved Bugs" value={stats.solvedBugs} />
            <StatBox title="Projects" value={stats.totalProjects} />
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

        {/* Show Key column only if user is team lead in ANY project */}
        {projects.some(
          (p) =>
            p.teamLead?._id === user?.id ||
            p.teamLead?._id === user?.userId
        ) && <th style={th}>Key</th>}

        <th style={th}>Members</th>
      </tr>
    </thead>

    <tbody>
      {projects.map((p) => {
        const isTeamLead = p.teamLead?._id === user?.id ||p.teamLead?._id === user?.userId;

        const memberCount =
          (p.members?.length || 0) + (p.teamLead ? 1 : 0);

        return (
          <tr key={p._id}>
            {/* Title */}
            <td style={td}>
              <div style={{ fontWeight: "500" }}>{p.title}</div>
              <div style={roleBadge}>
                {isTeamLead ? "Team Lead" : "Member"}
              </div>
            </td>

            {/* Status */}
            <td style={td}>
              {isTeamLead ? (
                editingStatus === p._id ? (
                  <select
                    value={p.status}
                    onChange={(e) =>
                      handleStatusChange(p._id, e.target.value)
                    }
                    onBlur={() => setEditingStatus(null)}
                    style={selectStyle}
                    autoFocus
                  >
                    <option value="ongoing">🟢 Ongoing</option>
                    <option value="paused">🟡 Paused</option>
                    <option value="completed">✅ Completed</option>
                  </select>
                ) : (
                  <span
                    style={{
                      ...getStatusPill(p.status),
                      cursor: "pointer",
                    }}
                    onClick={() => setEditingStatus(p._id)}
                  >
                    {p.status}
                  </span>
                )
              ) : (
                <span style={getStatusPill(p.status)}>
                  {p.status}
                </span>
              )}
            </td>

            {/* Key (ONLY for team lead) */}
            {isTeamLead && (
              <td style={td}>
                <span
                  style={keyHidden}
                  onClick={() =>
                    setVisibleKeys((prev) => ({
                      ...prev,
                      [p._id]: !prev[p._id],
                    }))
                  }
                >
                  {visibleKeys[p._id] ? p.projectKey : "••••••"}
                </span>
              </td>
            )}

            {/* Members */}
            <td style={td}>
              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: "20px",
                  background: "#f3f4f6",
                  fontSize: "12px",
                  fontWeight: "500",
                }}
              >
                {memberCount} members
              </span>
            </td>
          </tr>
        );
      })}
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

  {bugs && bugs.length > 0 ? (
    <table style={tableStyle}>
      <thead>
  <tr>
    <th style={th}>Title</th>
    <th style={th}>Project</th>
    <th style={th}>Priority</th>
    <th style={th}>Status</th>
    <th style={th}>Assigned To</th>
    <th style={th}>Actions</th>
  </tr>
</thead>

   <tbody>
  {bugs.map((b) => {
    const currentUserId = user?.id || user?.userId;

    const isReporter = b.reportedBy?._id === currentUserId;
    const isTeamLead = b.projectId?.teamLead?._id === currentUserId;
    const isAssigned = b.assignedTo?._id === currentUserId;
   

    return (
      <tr key={b._id}>
        {/* Title */}
        <td style={td}>{b.title}</td>

        {/* Project */}
        <td style={td}>{b.projectId?.title}</td>

        {/* 🔴 PRIORITY (Reporter + Team Lead only) */}
       <td style={td}>
  {(isReporter || isTeamLead) ? (
    editingPriority === b._id ? (
      <select
        value={b.priority}
        onChange={(e) => {
          handlePriorityChange(b._id, e.target.value);
        }}
        onBlur={() => setEditingPriority(null)}
        style={selectStyle}
        autoFocus
      >
        <option value="low">🟢 Low</option>
        <option value="medium">🟡 Medium</option>
        <option value="high">🔴 High</option>
      </select>
    ) : (
      <span
        style={{ ...getPriorityStyle(b.priority), cursor: "pointer" }}
        onClick={() => setEditingPriority(b._id)}
      >
        {b.priority}
      </span>
    )
  ) : (
    <span style={getPriorityStyle(b.priority)}>
      {b.priority}
    </span>
  )}
</td>

        {/* 🔵 STATUS (ONLY assigned person) */}
        <td style={td}>
  {(isAssigned || (!b.assignedTo && (isReporter || isTeamLead))) ? (
    editingBugStatus === b._id ? (
      <select
        value={b.status}
        onChange={(e) => {
          handleBugStatusChange(b._id, e.target.value);
        }}
        onBlur={() => setEditingBugStatus(null)}
        style={selectStyle}
        autoFocus
      >
        <option value="open">Open</option>
        <option value="in-progress">In Progress</option>
        <option value="closed">Closed</option>
      </select>
    ) : (
      <span
        style={{ ...getBugStatusStyle(b.status), cursor: "pointer" }}
        onClick={() => setEditingBugStatus(b._id)}
      >
        {b.status}
      </span>
    )
  ) : (
    <span style={getBugStatusStyle(b.status)}>
      {b.status}
    </span>
  )}
</td>

        {/* 🟢 ASSIGNED TO (Reporter + Team Lead only) */}
        <td style={td}>
  {(isReporter || isTeamLead) ? (
    editingAssign === b._id ? (
      <select
        value={b.assignedTo?._id || ""}
        onChange={(e) => {
          handleAssignChange(b._id, e.target.value);
        }}
        onBlur={() => setEditingAssign(null)}
        style={selectStyle}
        autoFocus
      >
        <option value="">Unassigned</option>

        {/* Team Lead */}
        {b.projectId?.teamLead && (
          <option value={b.projectId.teamLead._id}>
            {b.projectId.teamLead.username} (Lead)
          </option>
        )}

        {/* Members */}
        {b.projectId?.members?.map((m) => (
          <option key={m.userId._id} value={m.userId._id}>
            {m.userId.username}
          </option>
        ))}
      </select>
    ) : (
      <span
        style={{
          padding: "4px 10px",
          borderRadius: "6px",
          border: "1px solid #e5e7eb",
          cursor: "pointer",
          fontSize: "13px",
        }}
        onClick={() => setEditingAssign(b._id)}
      >
        {b.assignedTo?.username || "Unassigned"}
      </span>
    )
  ) : (
    <span
      style={{
        padding: "4px 10px",
        borderRadius: "6px",
        border: "1px solid #e5e7eb",
        fontSize: "13px",
        opacity: 0.8,
        cursor: "not-allowed",
      }}
    >
      {b.assignedTo?.username || "Unassigned"}
    </span>
  )}
</td>

        {/* Delete */}
        <td style={td}>
          <button
            onClick={() => handleDeleteBug(b)}
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              color: "#ef4444",
              fontSize: "20px",
            }}
          >
            🗑️
          </button>
        </td>
      </tr>
    );
  })}
</tbody>
    </table>
  ) : (
    <Empty
      text="No bugs reported 🐞"
      sub="You're all clear for now!"
    />
  )}
</section>

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

          {/* Join Project Modal */}
          <Modal
            isOpen={showJoinModal}
            onClose={() => setShowJoinModal(false)}
            title="Join Project"
          >
            <form onSubmit={handleJoinProject}>
              <input
                placeholder="Enter project key (XXXXXX)"
                value={joinKey}
                onChange={(e) => setJoinKey(e.target.value.toUpperCase())}
                style={titleInput}
                required
              />

              <div style={modalDivider} />

              <div style={modalFooter}>
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  style={cancelBtn}
                >
                  Cancel
                </button>

                <button type="submit" style={createBtn}>
                  Join Project
                </button>
              </div>
            </form>
          </Modal>

          {/* Log Bug Modal */}
          <Modal
            isOpen={showBugModal}
            onClose={() => setShowBugModal(false)}
            title="Log Bug"
          >
            <form onSubmit={handleCreateBug}>
              <input
                placeholder="Bug title"
                value={bugTitle}
                onChange={(e) => setBugTitle(e.target.value)}
                style={titleInput}
                required
              />

              <div style={modalDivider} />

              <FieldRow label="Project">
                <select
                  value={bugProject}
                  onChange={(e) => setBugProject(e.target.value)}
                  style={selectStyle}
                  required
                >
                  <option value="">Select project</option>
                  {projects.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </FieldRow>

              <FieldRow label="Priority">
                <select
                  value={bugPriority}
                  onChange={(e) => setBugPriority(e.target.value)}
                  style={selectStyle}
                >
                  <option value="low">🟢 Low</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="high">🔴 High</option>
                </select>
              </FieldRow>

              <FieldRow label="Status">
                <select
                  value={bugStatus}
                  onChange={(e) => setBugStatus(e.target.value)}
                  style={selectStyle}
                >
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="closed">Closed</option>
                </select>
              </FieldRow>

              <FieldRow label="Reported by">
                <span style={metaText}>{user?.username}</span>
              </FieldRow>

              <FieldRow label="Reported on">
                <span style={metaText}>{todayString()}</span>
              </FieldRow>

              <FieldRow label="Description">
                <textarea
                  value={bugDescription}
                  onChange={(e) => setBugDescription(e.target.value)}
                  style={textareaStyle}
                  rows={3}
                />
              </FieldRow>

              <FieldRow label="Assign To">
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  style={selectStyle}
                >
                  <option value="">Unassigned</option>
                  {(() => {
                    const project = projects.find((p) => p._id === bugProject);

                    if (!project) return null;

                    const uniqueMembers = project.members?.filter(
    (m, index, self) =>
      index === self.findIndex((x) => x.userId._id === m.userId._id)
  );

                    return (
                      <>
                        {/* team lead */}
                        {project.teamLead && (
                          <option value={project.teamLead._id}>
                            {project.teamLead.username} (Lead)
                          </option>
                        )}

                        {/* members */}
                        {project.members?.map((m) => (
                          <option key={m.userId?._id} value={m.userId?._id}>
                            {m.userId?.username || "Unknown"}
                          </option>
                        ))}
                      </>
                    );
                  })()}
                </select>
              </FieldRow>

              <div style={modalDivider} />

              <div style={modalFooter}>
                <button
                  type="button"
                  onClick={() => setShowBugModal(false)}
                  style={cancelBtn}
                >
                  Cancel
                </button>

                <button type="submit" style={createBtn}>
                  Log Bug
                </button>
              </div>
            </form>
          </Modal>
        </div>
      </div>
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
    active: { background: "#dcfce7", color: "#15803d" },
    "on hold": { background: "#fef9c3", color: "#a16207" },
    completed: { background: "#e0f2fe", color: "#0369a1" },
    ongoing: { background: "#dcfce7", color: "#15803d" },
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

const pill = {
  padding: "6px 12px",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: "500",
  display: "inline-block",
};

const getPriorityStyle = (priority) => {
  switch (priority) {
    case "high":
      return { ...pill, background: "#fee2e2", color: "#dc2626" };
    case "medium":
      return { ...pill, background: "#fef3c7", color: "#d97706" };
    case "low":
      return { ...pill, background: "#dcfce7", color: "#16a34a" };
    default:
      return pill;
  }
};

const getBugStatusStyle = (status) => {
  switch (status) {
    case "open":
      return { ...pill, background: "#dbeafe", color: "#2563eb" };
    case "in-progress":
      return { ...pill, background: "#fef3c7", color: "#d97706" };
    case "closed":
      return { ...pill, background: "#dcfce7", color: "#16a34a" };
    default:
      return pill;
  }
};

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
const linkStyle = { color: "#22c55e", textDecoration: "none" };

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
  color: "#000000",
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
  textAlign: "center",
  padding: "12px 16px",
  borderBottom: "1px solid #22c55e",
  color: "#000000",
  fontWeight: "600",
  fontSize: "18px",
};

const td = {
  textAlign: "center",
  padding: "12px 16px",
  borderBottom: "1px solid #c8e6d3",
  color: "#000000",
  fontSize: "14px",
  
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