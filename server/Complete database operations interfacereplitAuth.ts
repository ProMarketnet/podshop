import { Express } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { db } from "./storage.js";
import { users, sessions } from "@shared/schema.js";
import { eq } from "drizzle-orm";
import { neonConfig, Pool } from "@neondatabase/serverless";
import ws from "ws";
import { Client, generators, Issuer } from "openid-client";

const PgSession = connectPgSimple(session);

// Configure Neon for session storage
neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export interface AuthenticatedRequest extends Express.Request {
  user?: {
    id: string;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
    profileImageUrl: string | null;
    role: string | null;
  };
}

export async function setupAuth(app: Express) {
  // Session configuration
  app.use(
    session({
      store: new PgSession({
        pool: pool,
        tableName: "sessions",
        createTableIfMissing: false,
      }),
      secret: process.env.SESSION_SECRET || "fallback-secret-key",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      },
    })
  );

  // Setup OpenID Connect
  const issuer = await Issuer.discover("https://auth.replit.com");
  const client = new issuer.Client({
    client_id: process.env.REPL_ID || "",
    client_secret: "",
    redirect_uris: [`${getBaseUrl()}/api/auth/callback`],
    response_types: ["code"],
  });

  // Auth routes
  app.get("/api/auth/login", (req, res) => {
    const state = generators.state();
    const nonce = generators.nonce();
    
    (req.session as any).state = state;
    (req.session as any).nonce = nonce;

    const authUrl = client.authorizationUrl({
      scope: "openid profile",
      state,
      nonce,
    });

    res.redirect(authUrl);
  });

  app.get("/api/auth/callback", async (req, res) => {
    try {
      const params = client.callbackParams(req);
      const tokenSet = await client.callback(
        `${getBaseUrl()}/api/auth/callback`,
        params,
        {
          state: (req.session as any).state,
          nonce: (req.session as any).nonce,
        }
      );

      const userinfo = await client.userinfo(tokenSet);
      
      // Upsert user
      const userData = {
        id: userinfo.sub,
        email: userinfo.email || null,
        firstName: userinfo.given_name || null,
        lastName: userinfo.family_name || null,
        profileImageUrl: userinfo.picture || null,
      };

      await db
        .insert(users)
        .values(userData)
        .onConflictDoUpdate({
          target: users.id,
          set: {
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            profileImageUrl: userData.profileImageUrl,
            updatedAt: new Date(),
          },
        });

      (req.session as any).userId = userinfo.sub;
      res.redirect("/");
    } catch (error) {
      console.error("Auth callback error:", error);
      res.redirect("/");
    }
  });

  app.get("/api/auth/user", async (req, res) => {
    const userId = (req.session as any)?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
        columns: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          profileImageUrl: true,
          role: true,
        },
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(user);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Admin promotion endpoint
  app.post("/api/auth/become-admin", async (req, res) => {
    const userId = (req.session as any)?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      await db
        .update(users)
        .set({ role: "admin", updatedAt: new Date() })
        .where(eq(users.id, userId));

      res.json({ message: "Admin role granted" });
    } catch (error) {
      console.error("Become admin error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
}

export function requireAuth(req: AuthenticatedRequest, res: Express.Response, next: Express.NextFunction) {
  const userId = (req.session as any)?.userId;
  
  if (!userId) {
    return res.status(401).json({ message: "Authentication required" });
  }

  // Set user on request (will be populated by middleware if needed)
  req.user = { id: userId } as any;
  next();
}

export function requireAdmin(req: AuthenticatedRequest, res: Express.Response, next: Express.NextFunction) {
  requireAuth(req, res, async () => {
    if (!req.user) {
      return res.status(401).
