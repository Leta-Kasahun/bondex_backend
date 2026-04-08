import { Router } from "express";
import { authenticateUser } from "../../middlewares/auth.middleware";
import { authorizeUserOnly } from "../../middlewares/authorize.middleware";
import { validateBody } from "../../middlewares/validate.middleware";
import {
	confirmUserEmailChangeController,
	getUserProfileController,
	getUserStatsController,
	requestUserEmailChangeController,
	updateUserProfileController,
} from "./user.controller";
import {
	validateConfirmEmailChangeInput,
	validateRequestEmailChangeInput,
	validateUpdateUserProfileInput,
} from "./user.validation";

const userRouter = Router();

userRouter.use(authenticateUser, authorizeUserOnly);

userRouter.get("/profile", getUserProfileController);
userRouter.put("/profile", validateBody(validateUpdateUserProfileInput), updateUserProfileController);
userRouter.get("/stats", getUserStatsController);
userRouter.post("/email/request", validateBody(validateRequestEmailChangeInput), requestUserEmailChangeController);
userRouter.put("/email/confirm", validateBody(validateConfirmEmailChangeInput), confirmUserEmailChangeController);

export default userRouter;
