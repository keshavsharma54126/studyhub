import express from "express";
import {Request,Response} from "express"
import authRouter from "./routes/authRouter"
import { sessionRouter } from "./routes/sessionRouter"
import cors from "cors"
import swaggerUi from "swagger-ui-express"
import swaggerJsdoc from "swagger-jsdoc"
import userRouter from "./routes/userRouter";
const app = express();

// 1. First, set up your middleware
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());

// 2. Set up Swagger
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "HTTP backend api",
      version: "1.0.0",
      description: "API documentation for the http backend",
    },
    servers: [
      {
        url: "http://localhost:3007",
        description: "Development server"
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ["./src/routes/*.ts"]
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// 3. Set up Swagger UI BEFORE other routes
app.use(
  "/documentation",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      docExpansion: 'list',
      filter: true,
      showRequestDuration: true,
    },
  })
);

// 4. Then set up your routes
app.get("/", (req: Request, res: Response) => {
  res.send("Hello World");
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/sessions", sessionRouter);
app.use("/api/v1/user", userRouter);

// 5. Finally, start the server
app.listen(3007, () => {
  console.log("Server is running on port 3007");
});