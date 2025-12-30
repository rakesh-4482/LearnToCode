import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    AlertTriangle,
    Lock,
    User,
    Mail,
    Trash2,
    X,
    Check,
} from "lucide-react";
import { BACKEND_URL } from "../../config";

const DeleteAccount = () => {
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmText, setConfirmText] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [confirmError, setConfirmError] = useState("");
    const navigate = useNavigate();

    // Form validation
    const validatePassword = (value) => {
        if (!value) {
            setPasswordError("Password is required");
            return false;
        }
        if (value.length < 6) {
            setPasswordError("Password must be at least 6 characters");
            return false;
        }
        setPasswordError("");
        return true;
    };

    const validateConfirmText = (value) => {
        if (!value) {
            setConfirmError("Please type DELETE to confirm");
            return false;
        }
        if (value !== "DELETE") {
            setConfirmError("Please type DELETE exactly");
            return false;
        }
        setConfirmError("");
        return true;
    };

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setPassword(value);
        if (passwordError) validatePassword(value);
    };

    const handleConfirmTextChange = (e) => {
        const value = e.target.value;
        setConfirmText(value);
        if (confirmError) validateConfirmText(value);
    };

    const handleDeleteAccount = async (e) => {
        e.preventDefault();
        setError("");

        // Validate form
        const isPasswordValid = validatePassword(password);
        const isConfirmValid = validateConfirmText(confirmText);

        if (!isPasswordValid || !isConfirmValid) {
            return;
        }

        setLoading(true);

        try {
            const response = await axios.delete(
                `${BACKEND_URL}/api/auth/delete-account`,
                {
                    data: { password },
                    withCredentials: true,
                }
            );

            if (response.data) {
                // Account deleted successfully
                navigate("/login", {
                    state: { message: "Account deleted successfully" },
                });
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete account");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setShowConfirmation(false);
        setPassword("");
        setConfirmText("");
        setError("");
        setPasswordError("");
        setConfirmError("");
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Delete Account
                    </h1>
                    <p className="text-gray-600">
                        Permanently remove your account and all associated data
                    </p>
                </div>

                {!showConfirmation ? (
                    /* Warning Section */
                    <div className="bg-white rounded-lg shadow-sm border border-red-200">
                        <div className="p-6">
                            <div className="flex items-center mb-4">
                                <AlertTriangle className="h-6 w-6 text-red-500 mr-2" />
                                <h2 className="text-xl font-semibold text-red-900">
                                    Warning
                                </h2>
                            </div>

                            <div className="space-y-4 mb-6">
                                <p className="text-gray-700">
                                    Deleting your account will permanently
                                    remove:
                                </p>

                                <ul className="space-y-2 text-gray-600">
                                    <li className="flex items-start">
                                        <User className="h-4 w-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                                        <span>
                                            Your profile and personal
                                            information
                                        </span>
                                    </li>
                                    <li className="flex items-start">
                                        <Mail className="h-4 w-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                                        <span>
                                            All your submissions and coding
                                            history
                                        </span>
                                    </li>
                                    <li className="flex items-start">
                                        <Check className="h-4 w-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                                        <span>
                                            Your progress and achievements
                                        </span>
                                    </li>
                                    <li className="flex items-start">
                                        <Trash2 className="h-4 w-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                                        <span>
                                            Comments and discussions you've
                                            participated in
                                        </span>
                                    </li>
                                </ul>

                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <p className="text-red-800 font-medium">
                                        This action cannot be undone. Once
                                        deleted, your account and all associated
                                        data will be permanently removed from
                                        our servers.
                                    </p>
                                </div>
                            </div>

                            <div className="flex space-x-4">
                                <button
                                    onClick={() => setShowConfirmation(true)}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                                >
                                    I Understand, Delete My Account
                                </button>
                                <button
                                    onClick={() => navigate("/profile")}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Confirmation Form */
                    <div className="bg-white rounded-lg shadow-sm border border-red-200">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-red-900">
                                    Confirm Account Deletion
                                </h2>
                                <button
                                    onClick={handleCancel}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {error && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-red-800 text-sm">
                                        {error}
                                    </p>
                                </div>
                            )}

                            <form
                                onSubmit={handleDeleteAccount}
                                className="space-y-4"
                            >
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Type{" "}
                                        <span className="font-bold text-red-600">
                                            DELETE
                                        </span>{" "}
                                        to confirm
                                    </label>
                                    <input
                                        type="text"
                                        value={confirmText}
                                        onChange={handleConfirmTextChange}
                                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                                            confirmError
                                                ? "border-red-300"
                                                : "border-gray-300"
                                        }`}
                                        placeholder="Type DELETE"
                                        required
                                    />
                                    {confirmError && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {confirmError}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Enter your password to confirm
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={handlePasswordChange}
                                            className={`w-full pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                                                passwordError
                                                    ? "border-red-300"
                                                    : "border-gray-300"
                                            }`}
                                            placeholder="Enter your password"
                                            required
                                        />
                                    </div>
                                    {passwordError && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {passwordError}
                                        </p>
                                    )}
                                </div>

                                <div className="flex space-x-4 pt-4">
                                    <button
                                        type="submit"
                                        disabled={
                                            loading || !password || !confirmText
                                        }
                                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {loading ? (
                                            <div className="flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Deleting Account...
                                            </div>
                                        ) : (
                                            "Delete Account Permanently"
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        disabled={loading}
                                        className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeleteAccount;
