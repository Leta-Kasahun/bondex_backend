
import { Request,Response } from "express";
import { env } from "./config/env.config";
import app from "./config/app.config";
import { errorMiddleware } from "./middlewares/error.middleware";
import userAuthRouter from "./modules/auth/users/user.route";

app.get("/",(req:Request,res:Response)=>res.status(200).json({success:true,message:"Boom TypeScript Express API is Running"}));
app.use("/api/auth/user", userAuthRouter);

app.use(errorMiddleware);

app.listen(env.PORT,()=>console.log(`server is lestning to port http://localhost:${env.PORT}`))