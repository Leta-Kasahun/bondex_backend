import { Router } from "express";
import { authenticateUser } from "../../../middlewares/auth.middleware";
import { authorizeUserOnly } from "../../../middlewares/authorize.middleware";
import loginRouter from "./login/login.route";
import registerRouter from "./register/register.route";
import { logoutUserController } from "./login/login.controller";
import { getGoogleClientConfigController } from "./google.config.controller";

const userAuthRouter = Router();

userAuthRouter.get("/google/client-config", getGoogleClientConfigController);
userAuthRouter.use("/register", registerRouter);
userAuthRouter.use("/login", loginRouter);
userAuthRouter.post("/logout", authenticateUser, authorizeUserOnly, logoutUserController);

export default userAuthRouter;
