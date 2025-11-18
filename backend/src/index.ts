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

const app = express();
const PORT = process.env.PORT ?? 3000;

// Middlewares globales
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.disable("x-powered-by");
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "img-src": ["'self'", "data:", "https:"], // Permitir imágenes externas
      },
    },
  })
);

// API
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/users", authenticateJWT, authorizeRole(["admin"]), userRoutes);
app.use("/api/cart", cartRoutes);

// 404
app.use((_, res) => {
  res.status(404).send("Página no encontrada ñe");
});

// Servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

