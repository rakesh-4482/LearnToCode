import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { BACKEND_URL } from "../../../config.js";
import DoubtCard from "./DoubtCard.jsx";
import Spinner from "../Spinner.jsx";

const DoubtList = ({ currentUser }) => {
    const [doubts, setDoubts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("all"); // all, resolved, unresolved, my-doubts

    useEffect(() => {
        fetchDoubts();
    }, [filter]);

    const fetchDoubts = async () => {
        try {
            setLoading(true);
            const endpoint =
                filter === "my-doubts"
                    ? "/api/doubts/my-doubts"
                    : "/api/doubts";

            const response = await axios.get(`${BACKEND_URL}${endpoint}`, {
                withCredentials: true,
            });

            const data = response.data;
            let filteredDoubts = data.doubts;

            // Apply client-side filters
            if (filter === "resolved") {
                filteredDoubts = filteredDoubts.filter(
                    (doubt) => doubt.isResolved
                );
            } else if (filter === "unresolved") {
                filteredDoubts = filteredDoubts.filter(
                    (doubt) => !doubt.isResolved
                );
            }

            setDoubts(filteredDoubts);
            setError("");
        } catch (error) {
            setError("Failed to fetch doubts");
            console.error("Error fetching doubts:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
    };

    if (loading) {
        return <Spinner />;
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Doubts</h1>
                <Link
                    to="/doubts/create"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    Ask a Question
                </Link>
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2 mb-6 flex-wrap">
                <button
                    onClick={() => handleFilterChange("all")}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                        filter === "all"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                >
                    All Doubts
                </button>
                <button
                    onClick={() => handleFilterChange("unresolved")}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                        filter === "unresolved"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                >
                    Open
                </button>
                <button
                    onClick={() => handleFilterChange("resolved")}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                        filter === "resolved"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                >
                    Resolved
                </button>
                <button
                    onClick={() => handleFilterChange("my-doubts")}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                        filter === "my-doubts"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                >
                    My Doubts
                </button>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                    {error}
                </div>
            )}

            {doubts.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">
                        {filter === "my-doubts"
                            ? "You haven't asked any questions yet."
                            : "No doubts found."}
                    </p>
                    <Link
                        to="/doubts/create"
                        className="text-blue-600 hover:text-blue-800 mt-2 inline-block"
                    >
                        Ask your first question
                    </Link>
                </div>
            ) : (
                <div>
                    {doubts.map((doubt) => (
                        <DoubtCard
                            key={doubt._id}
                            doubt={doubt}
                            currentUser={currentUser}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default DoubtList;
