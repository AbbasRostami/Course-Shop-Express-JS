import cookieParser from "cookie-parser";
import cors, { CorsOptions } from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import authRoutes from "./modules/auth/auth.routes.js";
import cartRoutes from "./modules/cart/cart.routes.js";
import categoryRoutes from "./modules/category/category.routes.js";
import commentRoutes from "./modules/comment/comment.routes.js";
import courseRoutes from "./modules/course/course.routes.js";
import discountRoutes from "./modules/discount/discount.routes.js";
import enrollmentRoutes from "./modules/enrollment/enrollment.routes.js";
import favoriteRoutes from "./modules/favorite/favorite.routes.js";
import healthRoutes from "./modules/health/health.routes.js";
import orderRoutes from "./modules/order/order.routes.js";
import overviewRoutes from "./modules/overview/overview.routes.js";
import postRoutes from "./modules/post/post.routes.js";
import searchRoutes from "./modules/search/search.routes.js";
import teacherRoutes from "./modules/teacher/teacher.routes.js";
import uploadRoutes from "./modules/upload/upload.routes.js";
import userRoutes from "./modules/user/user.routes.js";
import walletRoutes from "./modules/wallet/wallet.routes.js";

const app = express();

// [CONFIG] Trust reverse proxy
app.set("trust proxy", 1);

// [MW] HTTP request logger
const morganFormat = process.env.NODE_ENV === "production" ? "combined" : "dev";
app.use(morgan(morganFormat));

// [MW] Security headers
app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
);

// [CONFIG] Allowed CORS origins
const allowedOrigins = [
  process.env.BACKEND_URL,
  process.env.FRONTEND_URL,
  ...(process.env.CORS_ORIGINS?.split(",") ?? []),
].filter(Boolean) as string[];

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: [
    "X-Total-Count",
    "X-RateLimit-Limit",
    "X-RateLimit-Remaining",
  ],
};

// [MW] CORS
app.use(cors(corsOptions));

// [MW] Cookie, JSON, URL parsers
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// [MW] Static files
app.use(express.static("public"));

// [RATE] Global API rate limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "fail",
    data: {
      message:
        "تعداد درخواست‌های شما بیش از حد مجاز است. لطفاً بعداً تلاش کنید.",
    },
  },
});
app.use("/api", globalLimiter);

// [SWAGGER] API documentation UI
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    swaggerOptions: {
      filter: true,
      displayRequestDuration: true,
      persistAuthorization: true,
      docExpansion: "none",
    },
  }),
);

// [ROUTE] Health check
app.use("/health", healthRoutes);

// [ROUTE] API modules
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/discounts", discountRoutes);
app.use("/api/overview", overviewRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/teachers", teacherRoutes);

// [TEST] Manual 500 error for Telegram alert testing
if (process.env.ENABLE_TEST_ROUTES === "true") {
  app.get("/test-500", (_req, _res, next) => {
    next(new Error("Manual test 500 error for Telegram notification"));
  });
}

// [ROUTE] Expose raw swagger JSON
app.get("/swagger.json", (_req, res) => {
  res.json(swaggerSpec);
});

// [ERROR] 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: "fail",
    data: {
      message: `مسیر ${req.originalUrl} یافت نشد`,
    },
  });
});

// [ERROR] Global error handler
app.use(errorHandler);

export default app;