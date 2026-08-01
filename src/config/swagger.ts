import { authSwagger } from "../modules/auth/auth.swagger.js";
import { cartSwagger } from "../modules/cart/cart.swagger.js";
import { categorySwagger } from "../modules/category/category.swagger.js";
import { commentSwagger } from "../modules/comment/comment.swagger.js";
import { courseSwagger } from "../modules/course/course.swagger.js";
import { discountSwagger } from "../modules/discount/discount.swagger.js";
import { enrollmentSwagger } from "../modules/enrollment/enrollment.swagger.js";
import { favoriteSwagger } from "../modules/favorite/favorite.swagger.js";
import { healthSwagger } from "../modules/health/health.swagger.js";
import { orderSwagger } from "../modules/order/order.swagger.js";
import { overviewSwagger } from "../modules/overview/overview.swagger.js";
import { postSwagger } from "../modules/post/post.swagger.js";
import { reactionSwagger } from "../modules/reaction/reaction.swagger.js";
import { searchSwagger } from "../modules/search/search.swagger.js";
import { teacherSwagger } from "../modules/teacher/teacher.swagger.js";
import { uploadSwagger } from "../modules/upload/upload.swagger.js";
import { userSwagger } from "../modules/user/user.swagger.js";
import { walletSwagger } from "../modules/wallet/wallet.swagger.js";

// [CONFIG] Swagger spec
export const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "Course Shop API Documentation",
    version: "1.0.0",
    description: `### 🚀 Global API Documentation & Frontend Integration Guide
    
Welcome to the core API docs. This system powers a full-stack educational and wallet platform.

#### 🔑 Authentication Policy for Front-End Developers:
This API supports a dual-authentication mechanism designed to maximize flexibility:
1. **Cookie-Based (Recommended for Web/Next.js & React.js):** \`accessToken\` and \`refreshToken\` are automatically appended to secure, \`HttpOnly\` cookies during login/verification.

2. **Bearer Token (Recommended for Mobile/SPA):** The \`accessToken\` is also explicitly returned in the JSON response payload. You can pass it via the standard \`Authorization: Bearer <token>\` header.

*Note: Protected routes will prioritize checking incoming cookies, fallback to the Bearer header if absent.*`,
  },

  // [CONFIG] API servers
  servers: [
    {
      url: "http://localhost:3000",
      description: "Local Development Server",
    },
    {
      url: process.env.BACKEND_URL!,
      description: "Prodection Server",
    },
  ],

  // [AUTH] Swagger auth schemes
  components: {
    securitySchemes: {
      CookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "accessToken",
        description:
          "Enables automatic session handling via secure HttpOnly cookies.",
      },
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description:
          "Pass your accessToken here if you are not using cookie-based state.",
      },
    },
    schemas: {},
  },

  // [ROUTE] Merge module paths
  paths: {
    ...healthSwagger.paths,
    ...authSwagger.paths,
    ...userSwagger.paths,
    ...categorySwagger.paths,
    ...teacherSwagger.paths,
    ...courseSwagger.paths,
    ...walletSwagger.paths,
    ...enrollmentSwagger.paths,
    ...commentSwagger.paths,
    ...reactionSwagger.paths,
    ...favoriteSwagger.paths,
    ...postSwagger.paths,
    ...searchSwagger.paths,
    ...cartSwagger.paths,
    ...orderSwagger.paths,
    ...discountSwagger.paths,
    ...overviewSwagger.paths,
    ...uploadSwagger.paths,
  },
};
