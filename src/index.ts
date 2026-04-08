
import { Request,Response } from "express";
import { env } from "./config/env.config";
import app from "./config/app.config";
import { errorMiddleware } from "./middlewares/error.middleware";
import userAuthRouter from "./modules/auth/users/user.route";
import adminLoginRouter from "./modules/auth/admin/login/admin.login.route";
import verifyAdminOtpRouter from "./modules/auth/admin/login/verifyadminOTP.route";
import adminLogoutRouter from "./modules/auth/admin/login/admin.logout.route";
import businessRouter from "./modules/business/business.route";
import leadRouter from "./modules/leads/lead.route";
import dealRouter from "./modules/deals/deal.route";
import notificationRouter from "./modules/notifications/notification.route";
import aiRouter from "./modules/ai/ai.route";
import userRouter from "./modules/users/user.route";
import adminRouter from "./modules/admin/admin.route";
import telegramRouter from "./modules/telegram/telegram.route";
import { startStaleHighPriorityLeadMonitor } from "./modules/notifications/notification.service";

app.get("/",(req:Request,res:Response)=>res.status(200).json({success:true,message:"Boom TypeScript Express API is Running"}));
app.use("/api/auth/user", userAuthRouter);
app.use("/api/admin/auth/login", adminLoginRouter);
app.use("/api/admin/auth/verify-otp", verifyAdminOtpRouter);
app.use("/api/admin/auth/logout", adminLogoutRouter);
app.use("/api/businesses", businessRouter);
app.use("/api/leads", leadRouter);
app.use("/api/deals", dealRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/ai", aiRouter);
app.use("/api/users", userRouter);
app.use("/api/admin", adminRouter);
app.use("/api/telegram", telegramRouter);

startStaleHighPriorityLeadMonitor();

app.use(errorMiddleware);

app.listen(env.PORT,()=>console.log(`server is lestning to port http://localhost:${env.PORT}`))