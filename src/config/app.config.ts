import express,{Application} from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./env.config";
const app:Application=express();
app.use(express.json());
app.use(cookieParser())
app.use(express.urlencoded({extended:true}));
app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
}))

export default app;