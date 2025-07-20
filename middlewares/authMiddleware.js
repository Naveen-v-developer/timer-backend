const jwt = require("jsonwebtoken");

// Middleware to protect routes and extract user from JWT token
const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check for Bearer token in Authorization header
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verify token and extract user data
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to request
    req.user = { _id: decoded._id };

    next(); // Proceed to the next middleware/controller
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};

module.exports = protect;
