import { Router } from "express";
import { validateBody } from "../../../../middlewares/validate.middleware";
import { validateGoogleLoginInput, validateLoginUserInput } from "../auth.validation";
import { googleLoginController, loginUserController } from "./login.controller";

const loginRouter = Router();

loginRouter.post("/", validateBody(validateLoginUserInput), loginUserController);
loginRouter.post("/google", validateBody(validateGoogleLoginInput), googleLoginController);

export default loginRouter;
