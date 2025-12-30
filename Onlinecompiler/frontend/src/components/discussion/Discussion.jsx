// frontend/src/components/discussion/Discussion.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import DiscussionItem from "./DiscussionItem";
import CreateDiscussion from "./CreateDiscussion";
import { BACKEND_URL } from "../../../config.js";

const Discussion = ({ questionId, currentUser }) => {
    const [discussions, setDiscussions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [totalDiscussions, setTotalDiscussions] = useState(0);

    useEffect(() => {
        fetchDiscussions();
    }, [questionId, page]);

    const fetchDiscussions = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `${BACKEND_URL}/api/discussions/question/${questionId}?page=${page}&limit=10`,
                {
                    withCredentials: true,
                }
            );

            const { discussions: newDiscussions, pagination } = response.data;

            if (page === 1) {
                setDiscussions(newDiscussions);
            } else {
                setDiscussions((prev) => [...prev, ...newDiscussions]);
            }

            setHasMore(pagination.hasMore);
            setTotalDiscussions(pagination.totalDiscussions);
        } catch (err) {
            setError("Failed to load discussions");
        } finally {
            setLoading(false);
        }
    };

    const handleNewDiscussion = (newDiscussion) => {
        setDiscussions((prev) => [newDiscussion, ...prev]);
        setTotalDiscussions((prev) => prev + 1);
    };

    const handleUpdateDiscussion = (updatedDiscussion) => {
        setDiscussions((prev) =>
            prev.map((discussion) =>
                discussion._id === updatedDiscussion._id
                    ? updatedDiscussion
                    : discussion
            )
        );
    };

    const handleDeleteDiscussion = (deletedDiscussionId) => {
        setDiscussions((prev) =>
            prev.filter((discussion) => discussion._id !== deletedDiscussionId)
        );
        setTotalDiscussions((prev) => prev - 1);
    };

    const handleReplyAdded = (parentDiscussionId, newReply) => {
        setDiscussions((prev) =>
            prev.map((discussion) =>
                discussion._id === parentDiscussionId
                    ? {
                          ...discussion,
                          replies: [...(discussion.replies || []), newReply],
                      }
                    : discussion
            )
        );
    };

    const handleReplyDeleted = (parentDiscussionId, deletedReplyId) => {
        setDiscussions((prev) =>
            prev.map((discussion) =>
                discussion._id === parentDiscussionId
                    ? {
                          ...discussion,
                          replies: discussion.replies.filter(
                              (reply) => reply._id !== deletedReplyId
                          ),
                      }
                    : discussion
            )
        );
    };

    const loadMoreDiscussions = () => {
        if (hasMore && !loading) {
            setPage((prev) => prev + 1);
        }
    };

    if (error) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                    Discussion ({totalDiscussions})
                </h3>
            </div>

            {/* Create new discussion */}
            <CreateDiscussion
                questionId={questionId}
                onDiscussionCreated={handleNewDiscussion}
            />

            {/* Discussions list */}
            <div className="space-y-4">
                {discussions.map((discussion) => (
                    <DiscussionItem
                        key={discussion._id}
                        discussion={discussion}
                        currentUser={currentUser}
                        onUpdate={handleUpdateDiscussion}
                        onDelete={handleDeleteDiscussion}
                        onReplyAdded={handleReplyAdded}
                        onReplyDeleted={handleReplyDeleted}
                    />
                ))}
            </div>

            {/* Load more button */}
            {hasMore && (
                <div className="mt-6 text-center">
                    <button
                        onClick={loadMoreDiscussions}
                        disabled={loading}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                    >
                        {loading ? "Loading..." : "Load More"}
                    </button>
                </div>
            )}

            {!loading && discussions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    No discussions yet. Be the first to start a discussion!
                </div>
            )}
        </div>
    );
};

export default Discussion;
