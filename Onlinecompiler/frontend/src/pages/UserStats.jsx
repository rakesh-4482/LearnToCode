import React, { useState, useEffect } from "react";
import axios from "axios";
import { BACKEND_URL } from "../../config.js";

const UserStats = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await axios.get(`${BACKEND_URL}/api/auth/stats`, {
                withCredentials: true,
            });
            setStats(response.data.stats);
        } catch (error) {
            setError("Failed to load statistics");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-red-600 text-center">
                    <p className="text-xl">{error}</p>
                    <button
                        onClick={fetchStats}
                        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Your Statistics
                    </h1>
                    <p className="mt-2 text-gray-600">
                        Track your progress and achievements
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                                <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">
                                    Total Solved
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {stats?.totalSolved || 0}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-green-100 text-green-600">
                                <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13 10V3L4 14h7v7l9-11h-7z"
                                    />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">
                                    Easy Problems
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {stats?.easy || 0}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                                <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                                    />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">
                                    Medium Problems
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {stats?.medium || 0}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-red-100 text-red-600">
                                <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                                    />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">
                                    Hard Problems
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {stats?.hard || 0}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Performance Overview
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-600">
                                    Total Submissions
                                </span>
                                <span className="text-sm font-bold text-gray-900">
                                    {stats?.totalSubmissions || 0}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-600">
                                    Success Rate
                                </span>
                                <span className="text-sm font-bold text-gray-900">
                                    {stats?.totalSubmissions > 0
                                        ? Math.round(
                                              (stats?.totalSolved /
                                                  stats?.totalSubmissions) *
                                                  100
                                          )
                                        : 0}
                                    %
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-600">
                                    Current Rating
                                </span>
                                <span className="text-sm font-bold text-purple-600">
                                    {stats?.rating || 0}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-600">
                                    Current Streak
                                </span>
                                <span className="text-sm font-bold text-orange-600">
                                    {stats?.streak || 0}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Problem Distribution
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center">
                                <div className="w-16 text-sm text-gray-600">
                                    Easy
                                </div>
                                <div className="flex-1 bg-gray-200 rounded-full h-2 mx-3">
                                    <div
                                        className="bg-green-500 h-2 rounded-full"
                                        style={{
                                            width: `${
                                                stats?.totalSolved > 0
                                                    ? (stats?.easy /
                                                          stats?.totalSolved) *
                                                      100
                                                    : 0
                                            }%`,
                                        }}
                                    ></div>
                                </div>
                                <div className="w-8 text-sm text-gray-900">
                                    {stats?.easy || 0}
                                </div>
                            </div>
                            <div className="flex items-center">
                                <div className="w-16 text-sm text-gray-600">
                                    Medium
                                </div>
                                <div className="flex-1 bg-gray-200 rounded-full h-2 mx-3">
                                    <div
                                        className="bg-yellow-500 h-2 rounded-full"
                                        style={{
                                            width: `${
                                                stats?.totalSolved > 0
                                                    ? (stats?.medium /
                                                          stats?.totalSolved) *
                                                      100
                                                    : 0
                                            }%`,
                                        }}
                                    ></div>
                                </div>
                                <div className="w-8 text-sm text-gray-900">
                                    {stats?.medium || 0}
                                </div>
                            </div>
                            <div className="flex items-center">
                                <div className="w-16 text-sm text-gray-600">
                                    Hard
                                </div>
                                <div className="flex-1 bg-gray-200 rounded-full h-2 mx-3">
                                    <div
                                        className="bg-red-500 h-2 rounded-full"
                                        style={{
                                            width: `${
                                                stats?.totalSolved > 0
                                                    ? (stats?.hard /
                                                          stats?.totalSolved) *
                                                      100
                                                    : 0
                                            }%`,
                                        }}
                                    ></div>
                                </div>
                                <div className="w-8 text-sm text-gray-900">
                                    {stats?.hard || 0}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {stats?.recentActivity && (
                    <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Recent Activity
                        </h3>
                        <div className="space-y-3">
                            {stats.recentActivity.map((activity, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div
                                            className={`w-3 h-3 rounded-full ${
                                                activity.status === "solved"
                                                    ? "bg-green-500"
                                                    : "bg-red-500"
                                            }`}
                                        ></div>
                                        <span className="text-sm font-medium text-gray-900">
                                            {activity.problemTitle}
                                        </span>
                                        <span
                                            className={`text-xs px-2 py-1 rounded-full ${
                                                activity.difficulty === "easy"
                                                    ? "bg-green-100 text-green-800"
                                                    : activity.difficulty ===
                                                      "medium"
                                                    ? "bg-yellow-100 text-yellow-800"
                                                    : "bg-red-100 text-red-800"
                                            }`}
                                        >
                                            {activity.difficulty}
                                        </span>
                                    </div>
                                    <span className="text-xs text-gray-500">
                                        {new Date(
                                            activity.date
                                        ).toLocaleDateString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserStats;
