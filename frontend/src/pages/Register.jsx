import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../../config.js"; // Adjust the path based on your file structure

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        name: "",
        bio: "",
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const validateForm = () => {
        const newErrors = {};

        // Username validation
        if (!formData.username.trim()) {
            newErrors.username = "Username is required";
        } else if (formData.username.length < 3) {
            newErrors.username = "Username must be at least 3 characters";
        } else if (formData.username.length > 20) {
            newErrors.username = "Username must be less than 20 characters";
        } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
            newErrors.username =
                "Username can only contain letters, numbers, and underscores";
        }

        // Email validation
        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (
            !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)
        ) {
            newErrors.email = "Please enter a valid email";
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        // Confirm password validation
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = "Please confirm your password";
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        // Name validation
        if (!formData.name.trim()) {
            newErrors.name = "Name is required";
        }

        // Bio validation
        if (formData.bio.length > 500) {
            newErrors.bio = "Bio must be less than 500 characters";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        console.log(`Field: ${name}, Value: ${value}`); // Add this line
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        try {
            const { confirmPassword, ...submitData } = formData;
            const response = await axios.post(
                `${BACKEND_URL}/api/auth/register`,
                submitData,
                { withCredentials: true } // Add this line - important for session cookies
            );

            if (response.data.success) {
                // No need to Store the token in localStorage (we are using sessions and cookies not local storage)

                // Redirect to home page instead of login
                navigate("/", {
                    state: {
                        message: "Registration successful! Welcome!",
                    },
                });
            }
        } catch (error) {
            setErrors({
                submit:
                    error.response?.data?.message ||
                    "Registration failed. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Create your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Or{" "}
                        <Link
                            to="/login"
                            className="font-medium text-indigo-600 hover:text-indigo-500"
                        >
                            sign in to your existing account
                        </Link>
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label
                                htmlFor="username"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Username
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                value={formData.username}
                                onChange={handleChange}
                                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                                    errors.username
                                        ? "border-red-300"
                                        : "border-gray-300"
                                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                                placeholder="Enter your username"
                            />
                            {errors.username && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.username}
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                                    errors.email
                                        ? "border-red-300"
                                        : "border-gray-300"
                                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                                placeholder="Enter your email"
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="name"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Full Name
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                value={formData.name}
                                onChange={handleChange}
                                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                                    errors.name
                                        ? "border-red-300"
                                        : "border-gray-300"
                                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                                placeholder="Enter your full name"
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                                    errors.password
                                        ? "border-red-300"
                                        : "border-gray-300"
                                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                                placeholder="Enter your password"
                            />
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="confirmPassword"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                                    errors.confirmPassword
                                        ? "border-red-300"
                                        : "border-gray-300"
                                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                                placeholder="Confirm your password"
                            />
                            {errors.confirmPassword && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.confirmPassword}
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="bio"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Bio (Optional)
                            </label>
                            <textarea
                                id="bio"
                                name="bio"
                                rows={3}
                                value={formData.bio}
                                onChange={handleChange}
                                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                                    errors.bio
                                        ? "border-red-300"
                                        : "border-gray-300"
                                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                                placeholder="Tell us about yourself (optional)"
                            />
                            <p className="mt-1 text-sm text-gray-500">
                                {formData.bio.length}/500 characters
                            </p>
                            {errors.bio && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.bio}
                                </p>
                            )}
                        </div>
                    </div>

                    {errors.submit && (
                        <div className="text-red-600 text-sm text-center">
                            {errors.submit}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Creating Account..." : "Create Account"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
