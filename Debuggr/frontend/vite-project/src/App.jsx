import { BrowserRouter, Routes, Route } from "react-router-dom";
{/* main application component that handles client side routing using react router*/}

{/* public routes:  accessible without authentication*/}
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";

{/* protected routes: require authentication*/}
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Bugs from "./pages/Bugs";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* protected routes*/}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/bugs" element={<Bugs />} />

        {/* catching unmatched routes*/}
        <Route path="*" element={<h1>404 - Page Not Found</h1>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;