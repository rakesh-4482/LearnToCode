// frontend/src/components/discussion/CreateDiscussion.jsx
import { useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "../../../config.js";
import {
    Heart,
    MessageCircle,
    Calendar,
    User,
    Edit,
    Trash2,
    Send,
} from "lucide-react";

const CreateDiscussion = ({
    questionId,
    parentComment = null,
    onDiscussionCreated,
    placeholder = "Share your thoughts about this problem...",
    // buttonText = `Post Discussion`, // replaced by <Send className="h-5 w-5" />
}) => {
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!content.trim()) {
            setError("Please enter some content");
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await axios.post(
                `${BACKEND_URL}/api/discussions`,
                {
                    questionId,
                    content: content.trim(),
                    parentComment,
                },
                { withCredentials: true }
            );

            onDiscussionCreated(response.data.discussion);
            setContent("");
        } catch (err) {
            if (err.response?.status === 401) {
                setError("You must be logged in to post a discussion");
            } else {
                setError("Failed to create discussion. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mb-6">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder={placeholder}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows="4"
                        maxLength={1000}
                    />
                    <div className="flex justify-between items-center mt-2">
                        <span className="text-sm text-gray-500">
                            {content.length}/1000 characters
                        </span>
                        {error && (
                            <span className="text-sm text-red-600">
                                {error}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={loading || !content.trim()}
                        className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? "Posting..." : <Send className="h-5 w-5" /> }
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateDiscussion;
