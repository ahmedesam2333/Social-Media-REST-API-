import type { Express, Request, Response } from "express";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import authController from "./modules/auth/auth.controller";
import { globalErrorHandling } from "./utils/response/error.response";

const bootstrap = (): void => {
  const app: Express = express();
  const port: number = Number(process.env.PORT) || 5000;
  const limiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 200,
    message: {
      error: "Too many requests from this IP, please try again after an hour",
    },
  });

  app.use(cors(), express.json(), helmet(), limiter);

  //app-routing
  app.get("/", (req: Request, res: Response) => {
    return res.json({
      message: `Welcome to ${process.env.APPLICATION_NAME} ❤️`,
    });
  });

  //Routes
  app.use("/auth", authController);

  //Invalid Routing
  app.all("{/*dummy}", (req: Request, res: Response) => {
    return res.status(404).json({
      message: "Invalid App Routing please check the method and url ❌",
    });
  });

  //global error handling middleware
  app.use(globalErrorHandling);

  app.listen(port, (): void => {
    console.log(`Server is running on port ${port} 🚀`);
  });
};

export default bootstrap;
