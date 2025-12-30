import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Sun, Moon, User, Menu, X, Home, Code, Trophy, MessageCircle, HelpCircle, BookOpen, LogOut, Settings, Terminal, BarChart2 } from "lucide-react";
import bytesmithLogo from "../assets/bytesmith-logo.svg";
import { BACKEND_URL } from "../../config.js";

const NAV_ITEMS = [
    { name: "Home", path: "/", icon: Home, exact: true },
    { name: "Problems", path: "/problems", icon: BookOpen },
    { name: "Compiler", path: "/compiler", icon: Terminal },
    { name: "Leaderboard", path: "/leaderboard", icon: Trophy },
    { name: "Ask", path: "/ask", icon: MessageCircle },
];

const Navbar = () => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    // Check authentication status on component mount
    useEffect(() => {
        checkAuthStatus();
    }, [location.pathname]);

    const checkAuthStatus = async () => {
        try {
            const response = await fetch(`${BACKEND_URL}/api/auth/status`, {
                credentials: "include",
            });
            const data = await response.json();
            if (response.ok && data.authenticated) {
                setIsAuthenticated(true);
                setUser(data.user);
            } else {
                setIsAuthenticated(false);
                setUser(null);
            }
        } catch (error) {
            setIsAuthenticated(false);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    // Dark mode: load preference and toggle
    useEffect(() => {
        const darkPref = localStorage.getItem("bytesmith-dark-mode");
        if (darkPref === "true") {
            setIsDarkMode(true);
            document.documentElement.classList.add("dark");
        } else {
            setIsDarkMode(false);
            document.documentElement.classList.remove("dark");
        }
    }, []);
    const toggleDarkMode = () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        localStorage.setItem("bytesmith-dark-mode", newMode);
        if (newMode) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownOpen && !event.target.closest(".user-dropdown")) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, [dropdownOpen]);

    const handleLogout = async () => {
        try {
            await fetch(`${BACKEND_URL}/api/auth/logout`, {
                method: "POST",
                credentials: "include",
            });
            setIsAuthenticated(false);
            setUser(null);
            setDropdownOpen(false);
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    if (loading) {
        return (
            <nav className="bg-white border-b border-neutral-200 shadow-soft">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="animate-pulse bg-neutral-200 h-8 w-32 rounded"></div>
                        <div className="animate-pulse bg-neutral-200 h-8 w-24 rounded"></div>
                    </div>
                </div>
            </nav>
        );
    }

    // --- Unique Navbar Layout ---
    return (
        <header className="sticky top-0 z-50">
            {/* Top bar: logo, user, dark mode */}
            <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 shadow-soft">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-14">
                    <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                        <img src={bytesmithLogo} alt="ByteSmith Logo" className="h-8 w-auto" />
                    </Link>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={toggleDarkMode}
                            className="p-2 text-neutral-600 dark:text-neutral-300 hover:text-primary-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-all duration-200"
                            aria-label="Toggle dark mode"
                        >
                            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>
                        {isAuthenticated ? (
                            <div className="relative user-dropdown">
                                <button
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="flex items-center space-x-2 p-2 text-neutral-600 dark:text-neutral-300 hover:text-primary-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-all duration-200"
                                >
                                    <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                        {user?.username?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <span className="hidden sm:block text-sm font-medium">{user?.username}</span>
                                </button>
                                {dropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-neutral-900 rounded-xl shadow-large border border-neutral-200 dark:border-neutral-800 py-2 z-50">
                                        <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-800">
                                            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{user?.username}</p>
                                            <p className="text-xs text-neutral-500 dark:text-neutral-400">{user?.email}</p>
                                        </div>
                                        <div className="py-1">
                                            <Link
                                                to="/profile"
                                                className="flex items-center px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                                                onClick={() => setDropdownOpen(false)}
                                            >
                                                <User className="w-4 h-4 mr-3" />
                                                Profile
                                            </Link>
                                            <Link
                                                to="/settings"
                                                className="flex items-center px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                                                onClick={() => setDropdownOpen(false)}
                                            >
                                                <Settings className="w-4 h-4 mr-3" />
                                                Settings
                                            </Link>
                                        </div>
                                        <div className="border-t border-neutral-100 dark:border-neutral-800 pt-1">
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900 transition-colors"
                                            >
                                                <LogOut className="w-4 h-4 mr-3" />
                                                Sign out
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <Link to="/login" className="btn-ghost text-sm">Sign in</Link>
                                <Link to="/register" className="btn-primary text-sm">Get Started</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* Horizontal nav bar */}
            <nav className="bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-row items-center justify-between h-12 overflow-x-auto">
                        {NAV_ITEMS.map((item) => {
                            const Icon = item.icon;
                            const isActive = item.exact 
                                ? location.pathname === item.path
                                : location.pathname.startsWith(item.path) && 
                                  (item.path !== "/" || location.pathname === "/") &&
                                  (item.path === "/" || location.pathname !== "/");
                            return (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    className={`flex-1 flex items-center justify-center gap-2 px-2 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                                        isActive
                                            ? "bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200 shadow-soft"
                                            : "text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-primary-600 dark:hover:text-primary-300"
                                    }`}
                                >
                                    {item.name === 'Compiler' ? (
                                        <div className="p-0.5 rounded bg-white">
                                            <Terminal className="w-4 h-4" />
                                        </div>
                                    ) : (
                                        <Icon className="w-4 h-4" />
                                    )}
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Navbar;
