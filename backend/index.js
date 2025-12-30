import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "./middleware/authMiddleware.js";
import { PORT, mongoDBURL } from "./config.js";
import { createServer } from 'http';
import { errorHandler } from './utils/errorHandler.js';

// Import routes
import questionsRoute from "./routes/questionsRoute.js";
import authRoute from "./routes/authRoute.js";
import blogRoutes from "./routes/blogRoute.js";
import doubtRoutes from "./routes/doubtRoute.js";
import discussionRoutes from "./routes/discussionRoute.js";
import aiRoute from "./routes/aiRoute.js";
import compilerRoute, { initWebSocket } from "./routes/compilerRoute.js";
import userRoutes from './routes/userRoute.js';
import problemRoutes from './routes/problemRoutes.js';

const app = express();
const server = createServer(app);

// Initialize WebSocket server
initWebSocket(server);

// Middleware for parsing request body
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS middleware
const corsOptions = {
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cache-Control', 'Pragma', 'Expires'],
    exposedHeaders: ['set-cookie'],
    optionsSuccessStatus: 200
};

// Apply CORS before other middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Session middleware (must be before passport middleware)
app.set('trust proxy', 1); // Trust first proxy if behind one (like nginx)

// Create a new session store with a different collection name
const sessionStore = MongoStore.create({
    mongoUrl: mongoDBURL,
    collectionName: 'new_sessions',
    ttl: 7 * 24 * 60 * 60, // 7 days in seconds
    autoRemove: 'interval',
    autoRemoveInterval: 10, // Check every 10 minutes
    crypto: {
        secret: process.env.SESSION_SECRET
    },
    touchAfter: 24 * 3600,
    stringify: false,
    serialize: (session) => {
        const obj = {
            _id: session.id,
            expires: session.cookie.expires,
            session: JSON.stringify(session)
        };
        return obj;
    },
    unserialize: (obj) => {
        try {
            return JSON.parse(obj.session);
        } catch (error) {
            console.error('Session deserialization error:', error);
            return null;
        }
    }
});

// Configure session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        domain: process.env.NODE_ENV === 'production' ? '.yourdomain.com' : undefined
    },
    name: 'new_session_id',
    rolling: true,
    unset: 'destroy',
    proxy: true
}));

// Initialize Passport and restore authentication state from session
app.use(passport.initialize());
app.use(passport.session());

// Add middleware to handle session errors
autoRemoveExpiredSessions();

// Function to auto-remove expired sessions
function autoRemoveExpiredSessions() {
    setInterval(async () => {
        try {
            const result = await sessionStore.clearExpired();
            console.log(`Cleared ${result} expired sessions`);
        } catch (error) {
            console.error('Error clearing expired sessions:', error);
        }
    }, 3600000); // Check every hour
}

// Add headers to ensure CORS works with credentials
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (['http://localhost:5173', 'http://127.0.0.1:5173'].includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    next();
});

// API Routes
app.use("/api/auth", authRoute);
app.use("/api/users", userRoutes);
app.use("/api/questions", questionsRoute);
app.use("/api/blogs", blogRoutes);
app.use("/api/doubts", doubtRoutes);
app.use("/api/discussions", discussionRoutes);
app.use("/api/ai", aiRoute);
app.use("/api/compiler", compilerRoute);
app.use("/api/problems", problemRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
});

// 404 handler
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Cannot ${req.method} ${req.originalUrl}`
    });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
mongoose
    .connect(mongoDBURL)
    .then(() => {
        console.log("Connected to MongoDB");
        
        // Function to print all registered routes
        const printRoutes = (router, prefix = '') => {
            router.stack.forEach((middleware) => {
                if (middleware.route) { // Routes registered directly on the app
                    const methods = Object.keys(middleware.route.methods)
                        .filter(method => middleware.route.methods[method])
                        .map(method => method.toUpperCase())
                        .join(',');
                    console.log(`${methods.padEnd(8)} ${prefix}${middleware.route.path}`);
                } else if (middleware.name === 'router') { // Router middleware
                    const path = middleware.regexp.toString()
                        .replace('/^', '')  // Remove leading ^
                        .replace('\\/?(?=\\/|$)', '')  // Remove trailing \/ and ?
                        .replace(/\/(?:[^\/]*)$/, '')  // Remove the last path part
                        .replace(/\\\//g, '/');  // Convert escaped slashes to normal slashes
                    printRoutes(middleware.handle, path);
                }
            });
        };

        // Clear existing sessions when MongoDB connects
        mongoose.connection.once('open', async () => {
            try {
                await sessionStore.clear();
                console.log('Successfully cleared all existing sessions');
            } catch (error) {
                console.error('Error clearing sessions:', error);
            }
        });

        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log("\nRegistered routes:");
            printRoutes(app._router);
            console.log("\nReady to accept connections!");
        });
    })
    .catch((err) => {
        console.error("Failed to connect to MongoDB", err);
        process.exit(1);
    });

// Handle server errors
server.on('error', (error) => {
    console.error('Server error:', error);
});

// Handle server close
server.on('close', () => {
    console.log('Server closed');
});