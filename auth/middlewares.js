const { default: mongoose } = require("mongoose");
const JWT = require("jsonwebtoken");
const httpStatus = require("http-status");
const config = require("./config");

/**
 * Express compatible user authentication middleware
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
const expressUserAuthMiddleware = async (req, res, next) => {
  let jwtTokenString = "";

  /**
   * need to apply cookie-parser in express app
   */
  jwtTokenString = req.cookies ? req.cookies["token"] ?? "" : "";

  if (!jwtTokenString) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res
        .status(401)
        .json({ message: "Missing authorization header. " });
    }

    jwtTokenString = authHeader.split(" ")[1];

    if (!jwtTokenString) {
      return res
        .clearCookie("token")
        .status(401)
        .json({ message: "Missing authorization token in header. " });
    }
  }

  const usersCollection = mongoose.connection.collection("users");

  try {
    const { email, id } = JWT.verify(jwtTokenString, config.AUTH_JWT_SECRET);

    const user = await usersCollection.findOne({
      _id: mongoose.Types.ObjectId.createFromHexString(id),
      email,
    });

    if (!user) {
      return res.clearCookie("token").status(401).json({
        message: httpStatus.status[401],
      });
    }

    req.currentUser = user;

    next();
  } catch (error) {
    if (error instanceof JWT.JsonWebTokenError) {
      return res
        .clearCookie("token")
        .status(401)
        .json({ message: error.message });
    }

    console.error(error);
    return res.status(500).json({ message: httpStatus.status[500] });
  }
};

module.exports = { expressUserAuthMiddleware };
