import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, MessageCircle, Calendar, User } from "lucide-react";
import Spinner from "./Spinner";
import axios from "axios";
import { BACKEND_URL } from "../../config.js";

const BlogList = ({ isAuthenticated, user }) => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showTooltip, setShowTooltip] = useState({ type: "", blogId: "" });

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        try {
            const response = await axios.get(`${BACKEND_URL}/api/blogs`, {
                withCredentials: true,
            });

            const data = response.data;

            if (data.success) {
                setBlogs(data.blogs);
            } else {
                setError("Failed to fetch blogs");
            }
        } catch (err) {
            setError("Error fetching blogs");
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async (blogId) => {
        if (!isAuthenticated) {
            setShowTooltip({ type: "like", blogId });
            setTimeout(() => setShowTooltip({ type: "", blogId: "" }), 2000);
            return;
        }

        try {
            const response = await axios.post(
                `${BACKEND_URL}/api/blogs/${blogId}/like`,
                {},
                {
                    withCredentials: true,
                }
            );

            const data = response.data;

            if (data.success) {
                setBlogs(
                    blogs.map((blog) =>
                        blog._id === blogId
                            ? {
                                  ...blog,
                                  likes: data.isLiked
                                      ? [...blog.likes, user.id]
                                      : blog.likes.filter(
                                            (id) => id !== user.id
                                        ),
                              }
                            : blog
                    )
                );
            }
        } catch (err) {
            console.error("Error liking blog:", err);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const truncateContent = (content, maxLength = 200) => {
        if (content.length <= maxLength) return content;
        return content.substring(0, maxLength) + "...";
    };

    if (loading) return <Spinner />;
    if (error) return <div className="text-red-500 text-center">{error}</div>;

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">
                    Latest Blogs
                </h1>
                {isAuthenticated && (
                    <Link
                        to="/create-blog"
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        Create Blog
                    </Link>
                )}
            </div>

            {blogs.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                    No blogs available yet.
                </div>
            ) : (
                <div className="space-y-6">
                    {blogs.map((blog) => (
                        <div
                            key={blog._id}
                            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <User className="h-5 w-5 text-gray-500" />
                                    <span className="text-sm text-gray-600">
                                        {blog.author?.name || "Anonymous"}
                                    </span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm text-gray-500">
                                    <Calendar className="h-4 w-4" />
                                    <span>{formatDate(blog.createdAt)}</span>
                                </div>
                            </div>

                            <Link to={`/blog/${blog._id}`} className="block">
                                <h2 className="text-xl font-semibold text-gray-800 mb-3 hover:text-blue-600 transition-colors">
                                    {blog.title}
                                </h2>
                                <p className="text-gray-600 mb-4 line-height-relaxed">
                                    {truncateContent(blog.content)}
                                </p>
                            </Link>

                            <div className="flex items-center space-x-6 pt-4 border-t border-gray-200">
                                <div className="relative">
                                    <button
                                        onClick={() => handleLike(blog._id)}
                                        className={`flex items-center space-x-2 transition-colors ${
                                            isAuthenticated
                                                ? blog.likes.includes(user?.id)
                                                    ? "text-red-500 hover:text-red-600"
                                                    : "text-gray-500 hover:text-red-500"
                                                : "text-gray-300 cursor-not-allowed"
                                        }`}
                                        onMouseEnter={() =>
                                            !isAuthenticated &&
                                            setShowTooltip({
                                                type: "like",
                                                blogId: blog._id,
                                            })
                                        }
                                        onMouseLeave={() =>
                                            setShowTooltip({
                                                type: "",
                                                blogId: "",
                                            })
                                        }
                                    >
                                        <Heart
                                            className={`h-5 w-5 ${
                                                isAuthenticated &&
                                                blog.likes.includes(user?.id)
                                                    ? "fill-current"
                                                    : ""
                                            }`}
                                        />
                                        <span className="text-sm">
                                            {blog.likes.length}
                                        </span>
                                    </button>

                                    {showTooltip.type === "like" &&
                                        showTooltip.blogId === blog._id && (
                                            <div className="absolute -top-10 left-0 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                                                Login to like
                                            </div>
                                        )}
                                </div>

                                <div className="relative">
                                    <Link
                                        to={`/blog/${blog._id}`}
                                        className={`flex items-center space-x-2 transition-colors ${
                                            isAuthenticated
                                                ? "text-gray-500 hover:text-blue-500"
                                                : "text-gray-300"
                                        }`}
                                        onMouseEnter={() =>
                                            !isAuthenticated &&
                                            setShowTooltip({
                                                type: "comment",
                                                blogId: blog._id,
                                            })
                                        }
                                        onMouseLeave={() =>
                                            setShowTooltip({
                                                type: "",
                                                blogId: "",
                                            })
                                        }
                                    >
                                        <MessageCircle className="h-5 w-5" />
                                        <span className="text-sm">
                                            {blog.comments.length}
                                        </span>
                                    </Link>

                                    {showTooltip.type === "comment" &&
                                        showTooltip.blogId === blog._id && (
                                            <div className="absolute -top-10 left-0 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                                                Login to comment
                                            </div>
                                        )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BlogList;
