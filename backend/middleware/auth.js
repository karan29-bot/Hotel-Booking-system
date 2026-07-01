
require("dotenv").config();
const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {

  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({
      error: "Access denied. No token provided."
    });
  }

  try {

    const verified = jwt.verify(
      token,
      process.env.JWT_SECERT
    );

    req.user = verified;

    next();

  } catch (err) {

    return res.status(400).json({
      error: "Invalid token"
    });

  }

};

module.exports = verifyToken;