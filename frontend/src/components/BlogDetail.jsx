import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Heart,
    MessageCircle,
    Calendar,
    User,
    Edit,
    Trash2,
    Send,
} from "lucide-react";
import axios from "axios";
import Spinner from "./Spinner";
import { BACKEND_URL } from "../../config.js";

const BlogDetail = ({ isAuthenticated, user }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [commentText, setCommentText] = useState("");
    const [submittingComment, setSubmittingComment] = useState(false);
    const [showTooltip, setShowTooltip] = useState({ type: "", show: false });

    useEffect(() => {
        fetchBlog();
    }, [id]);

    const fetchBlog = async () => {
        try {
            const response = await axios.get(`${BACKEND_URL}/api/blogs/${id}`, {
                withCredentials: true,
            });

            const data = response.data;

            if (data.success) {
                setBlog(data.blog);
            } else {
                setError("Blog not found");
            }
        } catch (err) {
            setError("Error fetching blog");
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async () => {
        if (!isAuthenticated) {
            setShowTooltip({ type: "like", show: true });
            setTimeout(() => setShowTooltip({ type: "", show: false }), 2000);
            return;
        }

        try {
            const response = await axios.post(
                `${BACKEND_URL}/api/blogs/${id}/like`,
                {},
                {
                    withCredentials: true,
                }
            );

            const data = response.data;

            if (data.success) {
                setBlog((prev) => ({
                    ...prev,
                    likes: data.isLiked
                        ? [...prev.likes, user.id]
                        : prev.likes.filter((likeId) => likeId !== user.id),
                }));
            }
        } catch (err) {
            console.error("Error liking blog:", err);
        }
    };

    const handleComment = async (e) => {
        e.preventDefault();

        if (!isAuthenticated) {
            setShowTooltip({ type: "comment", show: true });
            setTimeout(() => setShowTooltip({ type: "", show: false }), 2000);
            return;
        }

        if (!commentText.trim()) return;

        setSubmittingComment(true);
        try {
            const response = await axios.post(
                `${BACKEND_URL}/api/blogs/${id}/comment`,
                { content: commentText },
                {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            const data = response.data;

            if (data.success) {
                setBlog((prev) => ({
                    ...prev,
                    comments: [...prev.comments, data.comment],
                }));
                setCommentText("");
            }
        } catch (err) {
            console.error("Error adding comment:", err);
        } finally {
            setSubmittingComment(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm("Are you sure you want to delete this comment?"))
            return;

        try {
            const response = await axios.delete(
                `${BACKEND_URL}/api/blogs/${id}/comment/${commentId}`,
                {
                    withCredentials: true,
                }
            );

            const data = response.data;

            if (data.success) {
                setBlog((prev) => ({
                    ...prev,
                    comments: prev.comments.filter(
                        (comment) => comment._id !== commentId
                    ),
                }));
            }
        } catch (err) {
            console.error("Error deleting comment:", err);
        }
    };

    const handleDeleteBlog = async () => {
        if (!window.confirm("Are you sure you want to delete this blog?"))
            return;

        try {
            const response = await axios.delete(
                `${BACKEND_URL}/api/blogs/${id}`,
                {
                    withCredentials: true,
                }
            );

            const data = response.data;

            if (data.success) {
                navigate("/blogs");
            }
        } catch (err) {
            console.error("Error deleting blog:", err);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (loading) return <Spinner />;
    if (error) return <div className="text-red-500 text-center">{error}</div>;
    if (!blog) return <div className="text-center">Blog not found</div>;

    const isAuthor = isAuthenticated && user?.id === blog.author._id;
    const isLiked = isAuthenticated && blog.likes.includes(user?.id);

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-md p-8">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-4">
                            {blog.title}
                        </h1>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-2">
                                <User className="h-4 w-4" />
                                <span>{blog.author?.name || "Anonymous"}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4" />
                                <span>{formatDate(blog.createdAt)}</span>
                            </div>
                        </div>
                    </div>

                    {isAuthor && (
                        <div className="flex space-x-2">
                            <button
                                onClick={() =>
                                    navigate(`/edit-blog/${blog._id}`)
                                }
                                className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit blog"
                            >
                                <Edit className="h-5 w-5" />
                            </button>
                            <button
                                onClick={handleDeleteBlog}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete blog"
                            >
                                <Trash2 className="h-5 w-5" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="prose max-w-none mb-8">
                    <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {blog.content}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-6 py-4 border-t border-gray-200">
                    <div className="relative">
                        <button
                            onClick={handleLike}
                            className={`flex items-center space-x-2 transition-colors ${
                                isAuthenticated
                                    ? isLiked
                                        ? "text-red-500 hover:text-red-600"
                                        : "text-gray-500 hover:text-red-500"
                                    : "text-gray-300 cursor-not-allowed"
                            }`}
                            onMouseEnter={() =>
                                !isAuthenticated &&
                                setShowTooltip({ type: "like", show: true })
                            }
                            onMouseLeave={() =>
                                setShowTooltip({ type: "", show: false })
                            }
                        >
                            <Heart
                                className={`h-5 w-5 ${
                                    isLiked ? "fill-current" : ""
                                }`}
                            />
                            <span>{blog.likes.length}</span>
                        </button>

                        {showTooltip.type === "like" && showTooltip.show && (
                            <div className="absolute -top-10 left-0 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                                Login to like
                            </div>
                        )}
                    </div>

                    <div className="flex items-center space-x-2 text-gray-500">
                        <MessageCircle className="h-5 w-5" />
                        <span>{blog.comments.length}</span>
                    </div>
                </div>

                {/* Comments Section */}
                <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4">
                        Comments ({blog.comments.length})
                    </h3>

                    {/* Comment Form */}
                    <form onSubmit={handleComment} className="mb-6">
                        <div className="relative">
                            <textarea
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder={
                                    isAuthenticated
                                        ? "Add a comment..."
                                        : "Login to comment"
                                }
                                className={`w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    !isAuthenticated
                                        ? "bg-gray-50 text-gray-400 cursor-not-allowed"
                                        : ""
                                }`}
                                rows="3"
                                disabled={!isAuthenticated}
                                onFocus={() =>
                                    !isAuthenticated &&
                                    setShowTooltip({
                                        type: "comment",
                                        show: true,
                                    })
                                }
                                onBlur={() =>
                                    setShowTooltip({ type: "", show: false })
                                }
                            />

                            {showTooltip.type === "comment" &&
                                showTooltip.show && (
                                    <div className="absolute -top-10 left-0 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                                        Login to comment
                                    </div>
                                )}
                        </div>

                        {isAuthenticated && (
                            <button
                                type="submit"
                                disabled={
                                    submittingComment || !commentText.trim()
                                }
                                className="mt-2 flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <Send className="h-4 w-4" />
                                <span>
                                    {submittingComment
                                        ? "Posting..."
                                        : "Post Comment"}
                                </span>
                            </button>
                        )}
                    </form>

                    {/* Comments List */}
                    <div className="space-y-4">
                        {blog.comments.map((comment) => (
                            <div
                                key={comment._id}
                                className="bg-gray-50 rounded-lg p-4"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <User className="h-4 w-4 text-gray-500" />
                                        <span className="font-medium text-sm">
                                            {comment.user?.name || "Anonymous"}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {formatDate(
                                                comment.createdAt || new Date()
                                            )}
                                        </span>
                                    </div>

                                    {isAuthenticated &&
                                        user?.id === comment.user._id && (
                                            <button
                                                onClick={() =>
                                                    handleDeleteComment(
                                                        comment._id
                                                    )
                                                }
                                                className="text-red-500 hover:text-red-700 p-1 rounded"
                                                title="Delete comment"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        )}
                                </div>
                                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                                    {comment.content}
                                </p>
                            </div>
                        ))}

                        {blog.comments.length === 0 && (
                            <div className="text-center text-gray-500 py-8">
                                No comments yet. Be the first to comment!
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogDetail;
