const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    console.log("AUTH HEADER:", authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("DECODED:", decoded);

    req.user = {
      userId: decoded.userId, // ✅ FIXED
    };

    console.log("USER SET:", req.user);

    next();
  } catch (err) {
    console.log("AUTH ERROR:", err.message);
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = protect;