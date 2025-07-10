const { verify } = require("argon2");
const Joi = require("joi");
const { default: mongoose } = require("mongoose");
const httpStatus = require("http-status");
const JWT = require("jsonwebtoken");
const config = require("./config");

/**
 * Express compatible user login controller
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
const expressLoginUserController = async (req, res, next) => {
  try {
    const schema = Joi.object({
      email: Joi.string().email().required().label("Email"),
      password: Joi.string().required().label("Password"),
    });

    const inputs = await schema.validateAsync(req.body, {
      abortEarly: false,
      errors: {
        wrap: {
          label: "",
        },
      },
    });

    const usersCollection = mongoose.connection.collection("users");

    const user = await usersCollection.findOne({
      email: inputs.email,
    });

    if (!user || !(await verify(user.password, inputs.password))) {
      return res.status(401).json({
        message: "Wrong email or password.",
      });
    }

    const tokenString = await JWT.sign(
      { email: user.email, id: user._id },
      config.AUTH_JWT_SECRET,
      {
        expiresIn: "30d",
      }
    );

    // sanitize user data
    const { password, ...userDetails } = user;

    res.cookie("token", tokenString, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });

    return res.json({
      data: {
        user: userDetails,
        token: tokenString,
      },
    });
  } catch (error) {
    if (error instanceof Joi.ValidationError) {
      const errors = {};

      error.details.forEach(
        (detail) => (errors[detail.path[0]] = detail.message)
      );

      return res
        .status(422)
        .json({ message: "Given data was invalid.", errors });
    }

    console.error(error);
    res.status(500).json({ message: httpStatus.status[500] });
  }
};

/**
 * Express compatible user login controller
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
const expressLogoutUserController = async (req, res, next) => {
  res.clearCookie("token").sendStatus(200);
};

module.exports = { expressLoginUserController, expressLogoutUserController };
