import React, { useState, useEffect } from "react";
import { BACKEND_URL } from "../../config.js";
import {
    Trophy,
    Medal,
    Award,
    User,
    TrendingUp,
    Code,
    Target,
} from "lucide-react";

const Leaderboard = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchLeaderboard();
    }, [currentPage]);

    const fetchLeaderboard = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `${BACKEND_URL}/api/auth/leaderboard?page=${currentPage}&limit=20`,
                {
                    credentials: "include",
                }
            );
            const data = await response.json();
            if (response.ok) {
                setLeaderboard(data.leaderboard || data);
                setTotalPages(data.totalPages || 1);
            } else {
                setError(data.message || "Failed to fetch leaderboard");
            }
        } catch (err) {
            setError("Network error occurred");
        } finally {
            setLoading(false);
        }
    };

    const getRankIcon = (rank) => {
        switch (rank) {
            case 1:
                return <Trophy className="w-6 h-6 text-yellow-500" />;
            case 2:
                return <Medal className="w-6 h-6 text-gray-400" />;
            case 3:
                return <Award className="w-6 h-6 text-amber-600" />;
            default:
            // do nothing in default
            // return (
            //     <span className="w-6 h-6 flex items-center justify-center text-gray-600 font-bold">
            //         #{rank}
            //     </span>
            // );
        }
    };

    const getRankBadge = (rank) => {
        if (rank <= 3) {
            const colors = [
                "bg-yellow-100 text-yellow-800",
                "bg-gray-100 text-gray-800",
                "bg-amber-100 text-amber-800",
            ];
            return colors[rank - 1];
        }
        return "bg-gray-50 text-gray-700";
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-4">
                <div className="max-w-6xl mx-auto">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
                        {[...Array(10)].map((_, i) => (
                            <div
                                key={i}
                                className="bg-white rounded-lg p-4 mb-4 shadow-sm"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                                    <div className="flex-1">
                                        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                    </div>
                                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 p-4">
                <div className="max-w-6xl mx-auto">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                        <p className="text-red-800">{error}</p>
                        <button
                            onClick={fetchLeaderboard}
                            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 pt-12">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Coding Leaderboard
                    </h1>
                    <p className="text-gray-600">
                        Top performers in our coding community
                    </p>
                </div>

                {/* Leaderboard */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Rank
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        User
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Rating
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Problems Solved
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Submissions
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Success Rate
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {leaderboard.map((user, index) => {
                                    const rank =
                                        (currentPage - 1) * 20 + index + 1;
                                    const successRate =
                                        user.submissionsCount > 0
                                            ? (
                                                  ((user.solvedProblems
                                                      ?.length || 0) /
                                                      user.submissionsCount) *
                                                  100
                                              ).toFixed(1)
                                            : "0";

                                    return (
                                        <tr
                                            key={user._id}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRankBadge(
                                                        rank
                                                    )}`}
                                                >
                                                    {getRankIcon(rank)}
                                                    <span className="ml-1">
                                                        #{rank}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        {user.avatar ? (
                                                            <img
                                                                className="h-10 w-10 rounded-full"
                                                                src={
                                                                    user.avatar
                                                                }
                                                                alt={user.username}
                                                            />
                                                        ) : (
                                                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                                <User className="h-5 w-5 text-gray-500" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            @{user.username}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {user.solvedProblems
                                                                ?.length || 0}{" "}
                                                            problems solved
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <TrendingUp className="h-4 w-4 text-blue-500 mr-1" />
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {user.rating || 0}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <Target className="h-4 w-4 text-green-500 mr-1" />
                                                    <span className="text-sm text-gray-900">
                                                        {user.solvedProblems
                                                            ?.length || 0}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <Code className="h-4 w-4 text-purple-500 mr-1" />
                                                    <span className="text-sm text-gray-900">
                                                        {user.submissionsCount ||
                                                            0}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        parseFloat(
                                                            successRate
                                                        ) >= 80
                                                            ? "bg-green-100 text-green-800"
                                                            : parseFloat(
                                                                  successRate
                                                              ) >= 50
                                                            ? "bg-yellow-100 text-yellow-800"
                                                            : "bg-red-100 text-red-800"
                                                    }`}
                                                >
                                                    {successRate}%
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-6 flex justify-center space-x-2">
                        <button
                            onClick={() =>
                                setCurrentPage((prev) => Math.max(prev - 1, 1))
                            }
                            disabled={currentPage === 1}
                            className={`px-3 py-2 rounded-md text-sm font-medium ${
                                currentPage === 1
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                            }`}
                        >
                            Previous
                        </button>

                        {[...Array(Math.min(5, totalPages))].map((_, i) => {
                            const pageNum = Math.max(
                                1,
                                Math.min(
                                    currentPage - 2 + i,
                                    totalPages - 4 + i
                                )
                            );
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                                        currentPage === pageNum
                                            ? "bg-blue-600 text-white"
                                            : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                                    }`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}

                        <button
                            onClick={() =>
                                setCurrentPage((prev) =>
                                    Math.min(prev + 1, totalPages)
                                )
                            }
                            disabled={currentPage === totalPages}
                            className={`px-3 py-2 rounded-md text-sm font-medium ${
                                currentPage === totalPages
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                            }`}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Leaderboard;
