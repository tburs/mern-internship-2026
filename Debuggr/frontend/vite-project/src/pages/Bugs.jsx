import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import Sidebar from "../components/Sidebar";
import AdminHeader from "../components/AdminHeader";

const Bugs = () => {
  const [bugs, setBugs] = useState([]);
  const [user, setUser] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  /* load user */
  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) setUser(JSON.parse(saved));
  }, []);

  /* fetch ALL bugs */
  const fetchBugs = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/bugs", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await res.json();
      if (res.ok) setBugs(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBugs();
  }, []);

  /* socket for bugs */
  useEffect(() => {
    const socket = io("http://localhost:5000");

    socket.on("bugCreated", fetchBugs);
    socket.on("bugUpdated", fetchBugs);
    socket.on("bugDeleted", fetchBugs);

    return () => socket.disconnect();
  }, []);

  /* filtering bugs logic*/
  const filteredBugs = bugs.filter((b) => {
    const matchesSearch = b.title
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || b.status === statusFilter;

    const matchesPriority =
      priorityFilter === "all" || b.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div style={rootLayout}>
      <Sidebar />

      <div style={mainArea}>
        <AdminHeader user={user} />

        <div style={contentWrapper}>
          <h2 style={sectionTitle}>All Bugs 🐞</h2>

          {/* filter bar*/}
          <div style={filterBar}>
            <input
              type="text"
              placeholder="Search bug..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={input}
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={select}
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="closed">Closed</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              style={select}
            >
              <option value="all">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {/* tabular view of the bugs with all the deets*/}
          {filteredBugs.length > 0 ? (
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={th}>Title</th>
                  <th style={th}>Description</th>
                  <th style={th}>Priority</th>
                  <th style={th}>Status</th>
                  <th style={th}>Reported By</th>
                  <th style={th}>Assigned To</th>
                  <th style={th}>Date</th>
                </tr>
              </thead>

              <tbody>
                {filteredBugs.map((b) => (
                  <tr key={b._id}>
                    {/* Title */}
                    <td style={td}>{b.title}</td>

                    {/* Description */}
                    <td style={td}>
                      {b.description || (
                        <span style={{ color: "#9ca3af" }}>
                          No description
                        </span>
                      )}
                    </td>

                    {/* Priority */}
                    <td style={td}>
                      <span style={getPriorityStyle(b.priority)}>
                        {b.priority}
                      </span>
                    </td>

                    {/* Status */}
                    <td style={td}>
                      <span style={getStatusStyle(b.status)}>
                        {b.status}
                      </span>
                    </td>

                    {/* Reporter */}
                    <td style={td}>
                      {b.reportedBy?.username}
                    </td>

                    {/* Assigned */}
                    <td style={td}>
                      {b.assignedTo?.username || (
                        <span style={{ color: "#9ca3af" }}>
                          Unassigned
                        </span>
                      )}
                    </td>

                    {/* Date */}
                    <td style={td}>
                      {new Date(b.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No bugs found</p>
          )}
        </div>
      </div>
    </div>
  );
};

/* same style as dashboard*/

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
  maxWidth: "1200px",
  margin: "0 auto",
};

const sectionTitle = {
  color: "#22c55e",
  fontSize: "20px",
  marginBottom: "20px",
};

const filterBar = {
  display: "flex",
  gap: "10px",
  marginBottom: "30px", 
  alignItems: "center",
};

const input = {
  padding: "10px 14px",
  borderRadius: "8px",
  border: "1px solid #22c55e",
  background: "#fff",
  fontSize: "14px",
  color: "#111827",
};

const select = {
  padding: "10px 14px",
  borderRadius: "8px",
  border: "1px solid #e5e7eb",
  background: "#ffffff",
  color: "#111827",
  fontSize: "14px",
  outline: "none",
  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
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

/* pill styles*/

const getPriorityStyle = (p) => {
  const map = {
    low: { background: "#dcfce7", color: "#15803d" },
    medium: { background: "#fef9c3", color: "#a16207" },
    high: { background: "#fee2e2", color: "#b91c1c" },
  };

  return {
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "500",
    ...map[p],
  };
};

const getStatusStyle = (s) => {
  const map = {
    open: { background: "#dbeafe", color: "#1e40af" },
    "in-progress": { background: "#fef3c7", color: "#92400e" },
    closed: { background: "#dcfce7", color: "#166534" },
  };

  return {
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "500",
    ...map[s],
  };
};

export default Bugs;