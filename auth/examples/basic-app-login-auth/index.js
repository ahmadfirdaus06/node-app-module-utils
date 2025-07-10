const express = require("express");
const Joi = require("joi");
const { hash } = require("argon2");
const { default: mongoose } = require("mongoose");
const {
  expressLoginUserController,
  expressLogoutUserController,
} = require("../../controllers");
const { expressUserAuthMiddleware } = require("../../middlewares");
const httpStatus = require("http-status");
const cookieParser = require("cookie-parser");
const config = require("../../config");
const routes = require("../../routes");

(async () => {
  await mongoose.connect(config.MONGODB_URI);
  initApp();
})();

const initApp = () => {
  const app = express();

  app
    .use(express.json())
    .use(express.urlencoded({ extended: false }))
    .use(cookieParser());

  app.disable("x-powered-by");

  app.use((req, res, next) => {
    if (!req.headers["content-type"]) {
      req.headers["content-type"] = "application/json";
    }
    next();
  });

  app.post("/signup", async (req, res, next) => {
    try {
      const schema = Joi.object({
        email: Joi.string().email().required().label("Email"),
        name: Joi.string().required().label("Name"),
        passwordConfirmation: Joi.string()
          .required()
          .valid(Joi.ref("password"))
          .label("Password confirmation")
          .messages({
            "any.only": "{{#label}} does not match password",
          }),
        password: Joi.string().required().min(8).label("Password"),
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

      const existing = await usersCollection.countDocuments({
        email: inputs.email,
      });

      if (existing > 0)
        return res.status(400).json({ message: "Email already existed." });

      const { password, password_confirmation, ...userData } = inputs;

      const hashedPassword = await hash(password);

      await usersCollection.insertOne({
        ...userData,
        password: hashedPassword,
      });

      const user = await usersCollection.findOne({
        email: inputs.email,
      });

      const { password: _, ...filtered } = user;

      return res.json({ data: filtered });
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
  });

  routes(app);

  const server = app.listen(3000, () => {
    console.log(`App is running http://localhost:${server.address().port}`);
  });
};
