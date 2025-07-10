const { Router } = require("express");
const {
  expressLoginUserController,
  expressLogoutUserController,
} = require("./controllers");
const { expressUserAuthMiddleware } = require("./middlewares");

/**
 * basic auth routes
 * @param {import("express").Application} app
 */
module.exports = (app) => {
  const authRouter = Router();

  authRouter.post("/login", expressLoginUserController);

  authRouter.post(
    "/logout",
    expressUserAuthMiddleware,
    expressLogoutUserController
  );

  authRouter.get("/user", expressUserAuthMiddleware, (req, res, next) => {
    const { password, ...userDetails } = req.currentUser;
    return res.json({ data: userDetails });
  });

  app.use("/auth", authRouter);
};
