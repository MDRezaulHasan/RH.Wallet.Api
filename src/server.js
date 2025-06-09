import express from 'express';
import dotenv from 'dotenv';
import { initDB } from './config/db.js';
import rateLimiter from './middleware/rateLimiter.js';
import transactionsRoute from './routes/transactionsRoute.js';
import job from './config/cron.js'; // Import the job if needed
import { stat } from 'fs';

dotenv.config();

const PORT = process.env.PORT || 5001;

const app = express();


if(process.env.NODE_ENV === 'production') {
  job.start(); // Start the cron job if in production environment
}

app.get("/api/health",(req,res)=>{
res.status(200).json({status: "OK", message: "API is running smoothly!"});
})
// Middlewares
app.use(rateLimiter); // Apply rate limiting middleware
app.use(express.json()); // Middleware to parse JSON bodies
app.use("/api/transactions", transactionsRoute); // Use transactions route




initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});