import { toNodeHandler } from "better-auth/node";
import express, { Application } from "express";
import { auth } from "./lib/auth";
import cors from 'cors';
 

const app: Application = express();

app.use(cors({
    origin: process.env.APP_URL || "http://localhost:3000",  
    credentials: true
}))

app.use(express.json());

app.all("/api/auth/*splat", toNodeHandler(auth));

 

app.get("/", (req, res) => {
    res.send("Hello, World!");
});
// app.use(notFound)
// app.use(errorHandler)

export default app;