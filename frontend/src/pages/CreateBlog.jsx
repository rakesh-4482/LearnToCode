import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Save, ArrowLeft } from "lucide-react";
import { BACKEND_URL } from "../../config.js";
import axios from "axios";

const CreateBlog = ({ isAuthenticated }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: "",
        content: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Redirect if not authenticated
    React.useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login");
        }
    }, [isAuthenticated, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title.trim() || !formData.content.trim()) {
            setError("Both title and content are required");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await axios.post(
                `${BACKEND_URL}/api/blogs`,
                formData,
                {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            const data = response.data;

            if (data.success) {
                navigate(`/blog/${data.blog._id}`);
            } else {
                setError(data.message || "Failed to create blog");
            }
        } catch (err) {
            setError("Error creating blog");
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthenticated) {
        return null; // Will redirect in useEffect
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-md p-8">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">
                        Create New Blog
                    </h1>
                    <button
                        onClick={() => navigate("/blogs")}
                        className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        <span>Back to Blogs</span>
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label
                            htmlFor="title"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Title *
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Enter blog title"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="content"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Content *
                        </label>
                        <textarea
                            id="content"
                            name="content"
                            value={formData.content}
                            onChange={handleChange}
                            placeholder="Write your blog content here..."
                            rows="15"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                            required
                        />
                    </div>

                    <div className="flex items-center justify-end space-x-4">
                        <button
                            type="button"
                            onClick={() => navigate("/blogs")}
                            className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center space-x-2 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Save className="h-5 w-5" />
                            <span>
                                {loading ? "Creating..." : "Create Blog"}
                            </span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateBlog;
