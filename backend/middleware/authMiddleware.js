import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { User } from "../models/userModel.js";

// Configure passport local strategy
passport.use(
    new LocalStrategy(
        {
            usernameField: "email",
            passwordField: "password",
        },
        async (email, password, done) => {
            try {
                const user = await User.findOne({ email });

                if (!user) {
                    return done(null, false, {
                        message: "Invalid credentials",
                    });
                }

                const isMatch = await user.comparePassword(password);

                if (!isMatch) {
                    return done(null, false, {
                        message: "Invalid credentials",
                    });
                }

                return done(null, user);
            } catch (error) {
                return done(error);
            }
        }
    )
);

// Serialize user for the session
passport.serializeUser((user, done) => {
    done(null, user._id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id).select("-password");
        done(null, user);
    } catch (error) {
        done(error);
    }
});

// Middleware to check if user is authenticated
export const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    return res
        .status(401)
        .json({ message: "Please log in to access this resource" });
};

// Middleware to check if user is a teacher
export const isTeacher = (req, res, next) => {
    if (req.isAuthenticated() && req.user.isTeacher) {
        return next();
    }
    return res
        .status(403)
        .json({ message: "Access denied. Teacher privileges required." });
};

// Optional authentication middleware
export const optionalAuth = (req, res, next) => {
    // Always proceed, req.user will be available if authenticated
    next();
};

export default passport;
