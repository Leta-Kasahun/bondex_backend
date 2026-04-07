import { Router } from "express";
import loginRouter from "./login/login.route";
import registerRouter from "./register/register.route";

const userAuthRouter = Router();

userAuthRouter.use("/register", registerRouter);
userAuthRouter.use("/login", loginRouter);

export default userAuthRouter;
