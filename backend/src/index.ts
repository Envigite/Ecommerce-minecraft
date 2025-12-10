import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import productRoutes from "./routes/productRoutes";
import { authenticateJWT } from "./middlewares/authMiddleware";
import { authorizeRole } from "./middlewares/roleMiddleware";
import cartRoutes from "./routes/cartRoutes";
import auditRoutes from "./routes/auditRoutes";

const app = express();
const PORT = process.env.PORT ?? 3000;

// Middlewares globales
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://ecommerce-minecraft.vercel.app",
    "https://www.fashiontpark.store",
    "https://fashiontpark.store"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.disable("x-powered-by");
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "img-src": ["'self'", "data:", "https:"],
      },
    },
  })
);

// API
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/users", authenticateJWT, authorizeRole(["admin"]), userRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/audit", authenticateJWT, authorizeRole(["admin"]), auditRoutes);

// 404
app.use((_, res) => {
  res.status(404).send("Página no encontrada");
});

// Servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

