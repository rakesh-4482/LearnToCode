import React from "react";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";

const DoubtResponse = ({ response }) => {
    return (
        <div className="bg-gray-50 rounded-lg p-4 mb-4 border-l-4 border-blue-500">
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-800">
                        {response.user.username}
                    </span>
                    {response.user.isTeacher && (
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                            Teacher
                        </span>
                    )}
                </div>
                <span className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(response.createdAt), {
                        addSuffix: true,
                    })}
                </span>
            </div>
            <p className="text-gray-700 whitespace-pre-wrap">
                {response.content}
            </p>
        </div>
    );
};

export default DoubtResponse;
