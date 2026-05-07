import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <main style={styles.main}>
        <p style={styles.intro}>A Real-Time Collaborative Bug Tracking System</p>

        <h1 style={styles.title}> Debuggr.<br />
          <span style={styles.titleGreen}>Bug Tracking Made Simple.</span>
        </h1>

        <div style={styles.buttonContainer}>
          <button
            style={styles.loginButton}
            onClick={() => navigate("/Login")}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = "#000000";
              e.currentTarget.style.transform = "translateY(-5px)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = "#22c55e";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            Login →
          </button>

          <button
            style={styles.registerButton}
            onClick={() => navigate("/Register")}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = "#22c55e";
              e.currentTarget.style.color = "#22c55e";
              e.currentTarget.style.transform = "translateY(-5px)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = "#000000";
              e.currentTarget.style.color = "#000000";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            Register
          </button>
        </div>
      </main>
    </div>
  );
};

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    background: "#ffffff",
    color: "#fff",
    fontFamily: " 'Inter', sans-serif",
    position: "relative",
    overflow: "hidden",
  },


  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    padding: "0 24px",
    position: "relative",
    zIndex: 1,
  },

  intro: {
    fontSize: "0.8rem",
    letterSpacing: "0.25em",
    color: "#51814e",
    textTransform: "uppercase",
    marginBottom: "20px",
    fontWeight: "600",
  },

  title: {
    fontSize: "clamp(3rem, 10vw, 6rem)",
    fontWeight: "900",
    lineHeight: 1.1,
    marginBottom: "20px",
    fontFamily: "'Inter', sans-serif",
    color: "#000000",
  },

  titleGreen: {
    fontSize: "0.5em",
    fontWeight: "300",
    color: "#22c55e",
  },

  buttonContainer: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
  },

  loginButton: {
    padding: "11px 28px",
    fontSize: "0.9rem",
    letterSpacing: "0.08em",
    fontFamily: "'Inter', sans-serif",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    backgroundColor: "#22c55e",
    color: "#ffffff",
    fontWeight: "bold",
    transition: "all 0.15s ease",
  },

  registerButton: {
    padding: "11px 28px",
    fontSize: "0.9rem",
    letterSpacing: "0.08em",
    fontFamily: "'Inter', sans-serif",
    borderRadius: "8px",
    border: "1px solid #333",
    cursor: "pointer",
    backgroundColor: "transparent",
    color: "#000000",
    fontWeight: "bold",
    transition: "all 0.15s ease",
  },
};

export default Landing;