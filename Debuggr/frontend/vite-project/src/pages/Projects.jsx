import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import Sidebar from "../components/Sidebar";
import AdminHeader from "../components/AdminHeader";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [user, setUser] = useState(null);
  const [visibleKeys, setVisibleKeys] = useState({});

  /* load user */
  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) setUser(JSON.parse(saved));
  }, []);

  /* fetch */
  const fetchProjects = async () => {
    const res = await fetch("http://localhost:5000/api/projects/my-projects", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    const data = await res.json();
    if (res.ok) setProjects(data);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  /* sockets */
  useEffect(() => {
  const socket = io("http://localhost:5000");

  socket.on("projectCreated", (newProject) => {
    setProjects(prev => [newProject, ...prev]);
  });

  socket.on("projectUpdated", (updatedProject) => {
    setProjects(prev =>
      prev.map(p =>
        p._id === updatedProject._id ? updatedProject : p
      )
    );
  });

  socket.on("projectJoined", fetchProjects);

  socket.on("projectDeleted", (id) => {
    setProjects(prev => prev.filter(p => p._id !== id));
  });

  return () => socket.disconnect();
}, []);

  return (
    <div style={rootLayout}>
      <Sidebar />

      <div style={mainArea}>
        <AdminHeader user={user} />

        <div style={contentWrapper}>
          <h2 style={sectionTitle}>All Projects </h2>

          {projects.length > 0 ? (
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={th}>Title</th>
                  <th style={th}>Description</th>
                  <th style={th}>Status</th>
                  <th style={th}>Team Lead</th>
                  <th style={th}>Members</th>
                  <th style={th}>Key</th>
                </tr>
              </thead>

              <tbody>
                {projects.map((p) => {
                  const currentUserId = user?.id || user?.userId;

                  const isTeamLead =
                    p.teamLead?._id === currentUserId;

                  const membersList = [
                    p.teamLead?.username,
                    ...(p.members?.map((m) => m.userId?.username) || []),
                  ];

                  return (
                    <tr key={p._id}>
                      
                      {/* Title */}
                      <td style={td}>{p.title}</td>

                      {/* Description */}
                      <td style={td}>
                        {p.description || (
                          <span style={{ color: "#9ca3af" }}>
                            No description
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td style={td}>
                        <span style={getStatusPill(p.status)}>
                          {p.status}
                        </span>
                      </td>

                      {/* Team Lead */}
                      <td style={td}>{p.teamLead?.username}</td>

                      {/* Members */}
                      <td style={td}>
                        <div>
                          {membersList.join(", ")}
                        </div>
                        <div style={memberCount}>
                          {membersList.length} members
                        </div>
                      </td>

                      {/* Key */}
                      <td style={td}>
                        {isTeamLead ? (
                          <span
                            style={keyHidden}
                            onClick={() =>
                              setVisibleKeys((prev) => ({
                                ...prev,
                                [p._id]: !prev[p._id],
                              }))
                            }
                          >
                            {visibleKeys[p._id]
                              ? p.projectKey
                              : "••••••"}
                          </span>
                        ) : (
                          <span style={{ color: "#9ca3af" }}>
                            Hidden
                          </span>
                        )}
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p>No projects found</p>
          )}
        </div>
      </div>
    </div>
  );
};

/* styles same as dash for consistency in ui*/

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

const sectionTitle = {
  color: "#22c55e",
  fontSize: "20px",
  marginBottom: "20px",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  tableLayout: "fixed",
  color: "#000000",
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

const memberCount = {
  fontSize: "12px",
  color: "#6b7280",
  marginTop: "4px",
};

const getStatusPill = (status) => {
  const map = {
    ongoing: { background: "#dcfce7", color: "#15803d" },
    paused: { background: "#fef9c3", color: "#a16207" },
    completed: { background: "#e0f2fe", color: "#0369a1" },
  };

  return {
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "500",
    ...map[status],
  };
};

export default Projects;