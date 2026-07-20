const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env"), override: true });
const jwt = require("jsonwebtoken");

const jwtSecretDebug = () => ({
  exists: Boolean(process.env.JWT_SECRET),
  length: process.env.JWT_SECRET?.length || 0,
  preview: process.env.JWT_SECRET
    ? `${process.env.JWT_SECRET.slice(0, 2)}...${process.env.JWT_SECRET.slice(-2)}`
    : null,
});

const verifyToken = (req, res, next) => {
  const authHeader = req.header("Authorization");

  console.log("[verifyToken] Authorization header debug:", {
    exists: Boolean(authHeader),
    startsWithBearer: authHeader?.startsWith("Bearer "),
    parts: authHeader?.split(" ").length || 0,
  });

  if (!authHeader) {
    return res.status(401).json({
      error: "Access denied. No token provided."
    });
  }

  const [scheme, token] = authHeader.split(" ");

  console.log("[verifyToken] token debug:", {
    scheme,
    tokenExists: Boolean(token),
    tokenParts: token?.split(".").length || 0,
    tokenPreview: token ? `${token.slice(0, 16)}...${token.slice(-16)}` : null,
    jwtSecret: jwtSecretDebug(),
  });

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({
      error: "Malformed authorization header"
    });
  }

  try {
    const verified = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = verified;

    next();
  } catch (err) {
    console.error("[verifyToken] jwt.verify failed:", {
      name: err.name,
      message: err.message,
    });

    return res.status(401).json({
      error: "Invalid token"
    });
  }
};

module.exports = verifyToken;
