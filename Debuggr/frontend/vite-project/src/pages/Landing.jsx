import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Debuggr</h1>
      <p style={styles.subtitle}> Bug tracking made simple.</p>

      <div style={styles.buttonContainer}>
        <button style={styles.primaryButton} onClick={() => navigate("/Login")}> Login
        </button>

        <button style={styles.secondaryButton} onClick={() => navigate("/Register")}> Register
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "#0f172a",
    color: "white",
    textAlign: "center",
  },
  title: {
    fontSize: "4rem",
    marginBottom: "10px",
    letterSpacing: "2px",
  },
  subtitle: {
    fontSize: "1.2rem",
    color: "#94a3b8",
    marginBottom: "30px",
  },
  buttonContainer: {
    display: "flex",
    gap: "15px",
  },
  primaryButton: {
    padding: "10px 20px",
    fontSize: "1rem",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    backgroundColor: "#3b82f6",
    color: "white",
  },
  secondaryButton: {
    padding: "10px 20px",
    fontSize: "1rem",
    borderRadius: "8px",
    border: "1px solid #3b82f6",
    cursor: "pointer",
    backgroundColor: "transparent",
    color: "#3b82f6",
  },
};

export default Landing;