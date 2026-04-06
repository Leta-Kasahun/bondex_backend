// import express from "express";

// const app = express();
// const PORT = 7000;

// const GOOGLE_CLIENT_ID = "191610692656-048p9oe6637sldr33r79bi12md65sf1m.apps.googleusercontent.com";
// const GOOGLE_REDIRECT_URI = "http://localhost:7000/api/auth/callback";

// // Home
// app.get("/", (_req, res) => {
//   res.send(`
//     <h2>Google OAuth Test</h2>
//     <a href="/auth/google">👉 Login with Google</a>
//   `);
// });

// // Step 1: Redirect to Google
// app.get("/auth/google", (_req, res) => {
//   const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${GOOGLE_REDIRECT_URI}&response_type=code&scope=openid%20email%20profile`;

//   res.redirect(url);
// });

// // Step 2: Callback (TEST ONLY)
// app.get("/api/auth/callback", (req, res) => {
//   const code = req.query.code;

//   res.send(`
//     <h2>✅ SUCCESS</h2>
//     <p>Google redirected back correctly!</p>
//     <p><strong>Authorization Code:</strong></p>
//     <code>${code}</code>
//   `);
// });

// app.listen(PORT, () => {
//   console.log(`Server running at http://localhost:${PORT}`);
// });

import express from "express";
// import dotenv from "dotenv";
// import nodemailer from "nodemailer";

// dotenv.config();

// const app = express();
// const PORT = 7000;

// // Simple test route
// app.get("/test-email", async (_req, res) => {
//   try {
//     const transporter = nodemailer.createTransport({
//       host: process.env.SMTP_HOST,
//       port: Number(process.env.SMTP_PORT),
//       auth: {
//         user: process.env.SMTP_USER,
//         pass: process.env.SMTP_PASS,
//       },
//     });

//     await transporter.sendMail({
//       from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
//       to: "letakasahun2@gmail.com", // 👉 change this
//       subject: "Bondex Test Email",
//       text: "🎉 This is a test email from Bondex backend!",
//     });

//     res.send("✅ Email sent successfully");
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("❌ Email failed");
//   }
// });

// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });

// import dotenv from 'dotenv';
// import { GoogleGenerativeAI } from '@google/generative-ai';

// dotenv.config();

// // Use gemini-2.5-flash (latest)
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
// const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

// async function testGemini() {
//   try {
//     const result = await model.generateContent('Say hello to Bondex CRM');
//     console.log('✅ SUCCESS!');
//     console.log('Response:', result.response.text());
//   } catch (error) {
//     console.log('❌ FAILED!');
//     console.log('Error:', error);
//   }
// }

// testGemini();

// import dotenv from 'dotenv';
// dotenv.config();

// const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// async function testTelegram() {
//   try {
//     // Test 1: Get bot info
//     const botInfo = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`);
//     const botData = await botInfo.json();
    
//     if (botData.ok) {
//       console.log('✅ TELEGRAM CONNECTED!');
//       console.log(`Bot Name: ${botData.result.first_name}`);
//       console.log(`Bot Username: @${botData.result.username}`);
//     } else {
//       console.log('❌ Failed to connect');
//     }
//   } catch (error) {
//     console.log('❌ ERROR:', error);
//   }
// }// test-clean.ts - This has NO external imports
// Run this to see what's really happening
import { Request,Response } from "express";
import { env } from "./config/env.config";
import app from "./config/app.config";
import { errorMiddleware } from "./middlewares/error.middleware";

app.get("/",(req:Request,res:Response)=>res.status(200).json({success:true,message:"Boom TypeScript Express API is Running"}));

app.use(errorMiddleware);

app.listen(env.PORT,()=>console.log(`server is lestning to port http://localhost:${env.PORT}`))