import React from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

const DoubtCard = ({ doubt, currentUser }) => {
    const getStatusColor = (isResolved) => {
        return isResolved
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800";
    };

    const getVisibilityColor = (isPublic) => {
        return isPublic
            ? "bg-blue-100 text-blue-800"
            : "bg-gray-100 text-gray-800";
    };

    const displayName = doubt.isAnonymous
        ? "Anonymous"
        : doubt.student.username;
    const isOwnDoubt = currentUser && doubt.student._id === currentUser._id;

    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-4 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                    <Link
                        to={`/doubts/${doubt._id}`}
                        className="text-xl font-semibold text-gray-800 hover:text-blue-600 transition-colors"
                    >
                        {doubt.title}
                    </Link>
                    <p className="text-gray-600 text-sm mt-1">
                        by {displayName} •{" "}
                        {formatDistanceToNow(new Date(doubt.createdAt), {
                            addSuffix: true,
                        })}
                    </p>
                </div>

                <div className="flex gap-2 ml-4">
                    <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            doubt.isResolved
                        )}`}
                    >
                        {doubt.isResolved ? "Resolved" : "Open"}
                    </span>
                    <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getVisibilityColor(
                            doubt.isPublic
                        )}`}
                    >
                        {doubt.isPublic ? "Public" : "Private"}
                    </span>
                </div>
            </div>

            <p className="text-gray-700 mb-4 line-clamp-3">
                {doubt.content.length > 150
                    ? `${doubt.content.substring(0, 150)}...`
                    : doubt.content}
            </p>

            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{doubt.responses.length} responses</span>
                    {doubt.student.isTeacher && (
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                            Teacher
                        </span>
                    )}
                </div>

                <div className="flex gap-2">
                    <Link
                        to={`/doubts/${doubt._id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                        View Details
                    </Link>
                    {isOwnDoubt && (
                        <Link
                            to={`/doubts/edit/${doubt._id}`}
                            className="text-green-600 hover:text-green-800 text-sm font-medium ml-2"
                        >
                            Edit
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DoubtCard;
