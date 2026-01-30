import { toNodeHandler } from "better-auth/node";
import express, { Application } from "express";
import { auth } from "./lib/auth";
import cors from 'cors'; 
import { tutorRouter } from "./modules/tutor/profileManagement/tutor.router";
import { availabilityRouter } from "./modules/tutor/availabiltyManagement/management.router";  
import { studentRouter } from "./modules/student/student.router";
import { categoryRouter } from "./modules/tutor/categoryMng/category.router"; 
import { dashboardRouter } from "./modules/tutor/dashboard/dash.router";
import { publicTutorRouter } from "./modules/tutor/public/public.router"; 
import { reviewRouter } from "./modules/tutor/review/review.router";

const app: Application = express();

app.use(cors({
    origin: process.env.APP_URL || "http://localhost:3000",  
    credentials: true
}))

app.use(express.json());

app.all("/api/auth/*splat", toNodeHandler(auth));

// Tutor routes
app.use("/api/tutors", tutorRouter);
app.use("/api/tutors/availability", availabilityRouter);
app.use("/api/tutors/categories", categoryRouter);
app.use("/api/tutors/dashboard", dashboardRouter);
app.use("/api/tutors/reviews", reviewRouter);
app.use("/api/tutors/public", publicTutorRouter);  

// Student routes
app.use("/api/students", studentRouter);

app.get("/", (req, res) => {
    res.send("Hello, World!");
});

// app.use(notFound)
// app.use(errorHandler)

export default app;