import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../../config.js";

const EditProfile = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        name: "",
        bio: "",
        avatar: "",
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await axios.get(
                `${BACKEND_URL}/api/auth/profile`,
                {
                    withCredentials: true,
                }
            );
            const user = response.data.user;
            setFormData({
                username: user.username || "",
                email: user.email || "",
                name: user.name || "",
                bio: user.bio || "",
                avatar: user.avatar || "",
            });
        } catch (error) {
            setErrors({
                submit: "Failed to load profile",
            });
        } finally {
            setInitialLoading(false);
        }
    };

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

        // Name validation
        if (!formData.name.trim()) {
            newErrors.name = "Name is required";
        }

        // Bio validation
        if (formData.bio.length > 500) {
            newErrors.bio = "Bio must be less than 500 characters";
        }

        // Avatar validation (if provided)
        if (formData.avatar && !isValidUrl(formData.avatar)) {
            newErrors.avatar = "Please enter a valid URL";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const isValidUrl = (url) => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
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
            const response = await axios.put(
                `${BACKEND_URL}/api/auth/profile`,
                formData,
                {
                    withCredentials: true,
                }
            );
            if (response.data.success) {
                navigate("/profile", {
                    state: { message: "Profile updated successfully!" },
                });
            }
        } catch (error) {
            setErrors({
                submit:
                    error.response?.data?.message ||
                    "Failed to update profile. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                    <div className="px-6 py-4 bg-indigo-600">
                        <h1 className="text-2xl font-bold text-white">
                            Edit Profile
                        </h1>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6">
                        <div className="space-y-6">
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
                                    className={`mt-1 block w-full px-3 py-2 border ${
                                        errors.username
                                            ? "border-red-300"
                                            : "border-gray-300"
                                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
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
                                    className={`mt-1 block w-full px-3 py-2 border ${
                                        errors.email
                                            ? "border-red-300"
                                            : "border-gray-300"
                                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
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
                                    className={`mt-1 block w-full px-3 py-2 border ${
                                        errors.name
                                            ? "border-red-300"
                                            : "border-gray-300"
                                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
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
                                    htmlFor="bio"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Bio
                                </label>
                                <textarea
                                    id="bio"
                                    name="bio"
                                    rows={4}
                                    value={formData.bio}
                                    onChange={handleChange}
                                    className={`mt-1 block w-full px-3 py-2 border ${
                                        errors.bio
                                            ? "border-red-300"
                                            : "border-gray-300"
                                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                                    placeholder="Tell us about yourself"
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

                            <div>
                                <label
                                    htmlFor="avatar"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Avatar URL (Optional)
                                </label>
                                <input
                                    id="avatar"
                                    name="avatar"
                                    type="url"
                                    value={formData.avatar}
                                    onChange={handleChange}
                                    className={`mt-1 block w-full px-3 py-2 border ${
                                        errors.avatar
                                            ? "border-red-300"
                                            : "border-gray-300"
                                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                                    placeholder="https://example.com/avatar.jpg"
                                />
                                {errors.avatar && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.avatar}
                                    </p>
                                )}
                            </div>
                        </div>

                        {errors.submit && (
                            <div className="mt-4 text-red-600 text-sm text-center">
                                {errors.submit}
                            </div>
                        )}

                        <div className="mt-6 flex justify-between">
                            <Link
                                to="/profile"
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditProfile;
