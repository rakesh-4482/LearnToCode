// frontend/src/components/discussion/DiscussionItem.jsx
import { useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "../../../config.js";
import CreateDiscussion from "./CreateDiscussion";
import {
    Heart,
    MessageCircle,
    Calendar,
    User,
    Edit,
    Trash2,
    Send,
} from "lucide-react";

const DiscussionItem = ({
    discussion,
    currentUser,
    onUpdate,
    onDelete,
    onReplyAdded,
    onReplyDeleted,
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(discussion.content);
    const [isReplying, setIsReplying] = useState(false);
    const [showReplies, setShowReplies] = useState(true);
    const [loading, setLoading] = useState(false);

    const handleLike = async () => {
        try {
            setLoading(true);
            const response = await axios.put(
                `${BACKEND_URL}/api/discussions/${discussion._id}/like`,
                {},
                { withCredentials: true }
            );

            const updatedDiscussion = {
                ...discussion,
                likes: Array(response.data.likes).fill(null),
                dislikes: Array(response.data.dislikes).fill(null),
            };

            onUpdate(updatedDiscussion);
        } catch (error) {
            console.error("Error liking discussion:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDislike = async () => {
        try {
            setLoading(true);
            const response = await axios.put(
                `${BACKEND_URL}/api/discussions/${discussion._id}/dislike`,
                {},
                { withCredentials: true }
            );

            const updatedDiscussion = {
                ...discussion,
                likes: Array(response.data.likes).fill(null),
                dislikes: Array(response.data.dislikes).fill(null),
            };

            onUpdate(updatedDiscussion);
        } catch (error) {
            console.error("Error disliking discussion:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async () => {
        if (!editContent.trim()) return;

        try {
            setLoading(true);
            const response = await axios.put(
                `${BACKEND_URL}/api/discussions/${discussion._id}`,
                { content: editContent },
                { withCredentials: true }
            );

            onUpdate(response.data.discussion);
            setIsEditing(false);
        } catch (error) {
            console.error("Error editing discussion:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (
            !window.confirm("Are you sure you want to delete this discussion?")
        ) {
            return;
        }

        try {
            setLoading(true);
            await axios.delete(
                `${BACKEND_URL}/api/discussions/${discussion._id}`,
                { withCredentials: true }
            );

            onDelete(discussion._id);
        } catch (error) {
            console.error("Error deleting discussion:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleReplyCreated = (newReply) => {
        onReplyAdded(discussion._id, newReply);
        setIsReplying(false);
    };

    const handleReplyDelete = (replyId) => {
        onReplyDeleted(discussion._id, replyId);
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

    return (
        <div className="border border-gray-200 rounded-lg p-4 mb-4">
            {/* Main discussion */}
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {discussion.author.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <span className="font-medium text-gray-900">
                            {discussion.author.username}
                        </span>
                        <span className="text-sm text-gray-500 ml-2">
                            {formatDate(discussion.createdAt)}
                            {discussion.isEdited && (
                                <span className="ml-1 text-xs text-gray-400">
                                    (edited)
                                </span>
                            )}
                        </span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="mb-4">
                {isEditing ? (
                    <div className="space-y-2">
                        <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows="3"
                            placeholder="Edit your discussion..."
                        />
                        <div className="flex space-x-2">
                            <button
                                onClick={handleEdit}
                                disabled={loading || !editContent.trim()}
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                            >
                                {loading ? "Saving..." : "Save"}
                            </button>
                            <button
                                onClick={() => {
                                    setIsEditing(false);
                                    setEditContent(discussion.content);
                                }}
                                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-800 whitespace-pre-wrap">
                        {discussion.content}
                    </p>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={handleLike}
                        disabled={loading}
                        className="flex items-center space-x-1 text-gray-600 hover:text-blue-600"
                    >
                        <span>👍</span>
                        <span>{discussion.likes?.length || 0}</span>
                    </button>
                    <button
                        onClick={handleDislike}
                        disabled={loading}
                        className="flex items-center space-x-1 text-gray-600 hover:text-red-600"
                    >
                        <span>👎</span>
                        <span>{discussion.dislikes?.length || 0}</span>
                    </button>
                    <button
                        onClick={() => setIsReplying(!isReplying)}
                        className="text-blue-600 hover:text-blue-800"
                    >
                        Reply
                    </button>
                </div>

                {currentUser && currentUser.id === discussion.author._id && (
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setIsEditing(true)}
                            className="text-gray-600 hover:text-gray-800"
                        >
                            <Edit className="h-5 w-5" />
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={loading}
                            className="text-red-600 hover:text-red-800"
                        >
                            <Trash2 className="h-5 w-5" />
                        </button>
                    </div>
                )}
            </div>

            {/* Reply form */}
            {isReplying && (
                <div className="mt-4 pl-4 border-l-2 border-gray-200">
                    <CreateDiscussion
                        questionId={discussion.questionId}
                        parentComment={discussion._id}
                        onDiscussionCreated={handleReplyCreated}
                        placeholder="Write a reply..."
                        buttonText="Reply"
                    />
                </div>
            )}

            {/* Replies */}
            {discussion.replies && discussion.replies.length > 0 && (
                <div className="mt-4">
                    <button
                        onClick={() => setShowReplies(!showReplies)}
                        className="text-blue-600 hover:text-blue-800 mb-2"
                    >
                        {showReplies ? "Hide" : "Show"}{" "}
                        {discussion.replies.length} replies
                    </button>

                    {showReplies && (
                        <div className="pl-4 space-y-3 border-l-2 border-gray-200">
                            {discussion.replies.map((reply) => (
                                <div
                                    key={reply._id}
                                    className="border border-gray-100 rounded-lg p-3"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center text-white text-sm">
                                                {reply.author.username
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </div>
                                            <span className="font-medium text-gray-900 text-sm">
                                                {reply.author.username}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {formatDate(reply.createdAt)}
                                            </span>
                                        </div>
                                        {currentUser &&
                                            currentUser.id ===
                                                reply.author._id && (
                                                <button
                                                    onClick={() =>
                                                        handleReplyDelete(
                                                            reply._id
                                                        )
                                                    }
                                                    className="text-red-600 hover:text-red-800 text-sm"
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            )}
                                    </div>
                                    <p className="text-gray-800 text-sm whitespace-pre-wrap">
                                        {reply.content}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DiscussionItem;
