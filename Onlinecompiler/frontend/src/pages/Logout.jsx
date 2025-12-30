import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, User, AlertCircle } from "lucide-react";
import { BACKEND_URL } from "../../config.js";

const Logout = () => {
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogout = async () => {
        setLoading(true);
        setError("");

        try {
            const response = await fetch(`${BACKEND_URL}/api/auth/logout`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            });

            const data = await response.json();

            if (response.ok) {
                // Logout successful
                navigate("/", {
                    state: { message: "Logged out successfully" },
                });
            } else {
                setError(data.message || "Failed to logout");
            }
        } catch (err) {
            setError("Network error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setShowConfirmation(false);
        setError("");
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="text-center mb-6">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                            <LogOut className="h-6 w-6 text-red-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">
                            Confirm Logout
                        </h2>
                        <p className="text-gray-600">
                            Are you sure you want to logout from your account?
                        </p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
                            <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                            <p className="text-red-800 text-sm">{error}</p>
                        </div>
                    )}

                    <div className="space-y-3">
                        <button
                            onClick={handleLogout}
                            disabled={loading}
                            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Logging out...
                                </div>
                            ) : (
                                "Yes, Logout"
                            )}
                        </button>

                        <button
                            onClick={() => navigate(-1)}
                            disabled={loading}
                            className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Cancel
                        </button>
                    </div>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-500">
                            You can login again anytime with your credentials
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Logout;
