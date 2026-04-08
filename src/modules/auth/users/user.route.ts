import { Router } from "express";
import { authenticateUser } from "../../../middlewares/auth.middleware";
import { authorizeUserOnly } from "../../../middlewares/authorize.middleware";
import loginRouter from "./login/login.route";
import registerRouter from "./register/register.route";
import { logoutUserController } from "./login/login.controller";

const userAuthRouter = Router();

userAuthRouter.use("/register", registerRouter);
userAuthRouter.use("/login", loginRouter);
userAuthRouter.post("/logout", authenticateUser, authorizeUserOnly, logoutUserController);

export default userAuthRouter;
