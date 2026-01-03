import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import { Request, Response, NextFunction } from "express";

import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import productRoutes from "./routes/productRoutes";
import { authenticateJWT } from "./middlewares/authMiddleware";
import { authorizeRole } from "./middlewares/roleMiddleware";
import cartRoutes from "./routes/cartRoutes";
import auditRoutes from "./routes/auditRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import chatRoutes from "./routes/chatRoutes";
import addressRoutes from "./routes/addressRoutes";
import cardRoutes from "./routes/cardRoutes";
import orderRoutes from "./routes/orderRoutes";
import contactRoutes from "./routes/contactRoutes";
import passport from "passport";
import "./config/passport";

const app = express();
const PORT = process.env.PORT ?? 3001;

app.set("trust proxy", 1);

// Ver peticiones en consola
app.use(morgan("dev"));

// Máximo 100 peticiones por IP cada 15 min
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5000, 
  message: "Demasiadas peticiones desde esta IP, intenta de nuevo más tarde."
});
app.use(limiter);

//Configuración CORS Dinámica
const allowedOrigins = [
    "http://localhost:3000",
    "https://ecommerce-minecraft.vercel.app",
    "https://www.fashiontpark.store",
    "https://fashiontpark.store"
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("No permitido por CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// Middlewares estándar
app.use(express.json());
app.use(cookieParser());
app.disable("x-powered-by");

// Evitar cache
app.use((req, res, next) => {
  res.header("Cache-Control", "no-cache, no-store, must-revalidate");
  res.header("Pragma", "no-cache");
  res.header("Expires", "0");
  next();
});

// Seguridad extra
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "img-src": ["'self'", "data:", "https:"],
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);

app.use(passport.initialize());

// Rutas
app.get("/", (_, res) => res.send("API Funcionando correctamente v1.1"));
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/users", authenticateJWT, authorizeRole(["admin"]), userRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/audit", authenticateJWT, authorizeRole(["admin"]), auditRoutes);
app.use("/api/contact", contactRoutes);

// Rutas FastAPI
app.use("/api/chat", chatRoutes);

// Mercado Pago
app.use("/api/payments", paymentRoutes);

// Direcciones
app.use("/api/addresses", addressRoutes);
app.use("/api/cards", cardRoutes);
app.use("/api/orders", orderRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

app.use((
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("Error del servidor:", err.stack);

  res.status(500).json({
    error: "Error interno del servidor",
    message: process.env.NODE_ENV === "development"
      ? err.message
      : undefined,
  });
})

// Servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
});

