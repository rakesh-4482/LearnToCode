import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import Spinner from "../components/Spinner";
import { BACKEND_URL } from "../../config";
import Discussion from "../components/discussion/Discussion";
import { ArrowLeft, Lightbulb, MessageCircle, CheckCircle } from "lucide-react";

const ShowQuestion = () => {
    const [question, setQuestion] = useState({});
    const [loading, setLoading] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [activeTab, setActiveTab] = useState("hints");
    const [user, setUser] = useState(null);
    const { id } = useParams();

    const checkAuthStatus = async () => {
        try {
            const response = await axios.get(`${BACKEND_URL}/api/auth/status`, {
                withCredentials: true,
            });

            if (response.status === 200 && response.data.authenticated) {
                setIsLoggedIn(true);
                setUser(response.data.user);
            } else {
                setIsLoggedIn(false);
                setUser(null);
            }
        } catch (error) {
            console.error("Error checking auth status:", error);
            setIsLoggedIn(false);
            setUser(null);
        }
    };

    useEffect(() => {
        setLoading(true);
        checkAuthStatus();

        axios
            .get(`${BACKEND_URL}/api/questions/${id}`, {
                withCredentials: true,
            })
            .then((response) => {
                setQuestion(response.data);
                setLoading(false);
            })
            .catch((error) => {
                console.log(error);
                setLoading(false);
            });
    }, [id]);

    // Define tabs - only hints, discussion, and solutions
    const tabs = [
        { id: "hints", label: "Hints", icon: <Lightbulb className="w-4 h-4" /> },
        { id: "discussion", label: "Discussion", icon: <MessageCircle className="w-4 h-4" /> },
        { id: "solutions", label: "Solutions", icon: <CheckCircle className="w-4 h-4" /> },
    ];

    // Tab content function
    const getTabContent = (tabId) => {
        switch (tabId) {
            case "hints":
                return (
                    <div className="p-6">
                        <div className="max-w-4xl mx-auto">
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                                <div className="flex items-center mb-4">
                                    <Lightbulb className="w-6 h-6 text-yellow-600 mr-2" />
                                    <h2 className="text-xl font-semibold text-yellow-800">Problem Hints</h2>
                                </div>
                                <div className="space-y-4 text-yellow-700">
                                    <p>💡 <strong>Hint 1:</strong> Think about the most efficient approach for this problem type.</p>
                                    <p>💡 <strong>Hint 2:</strong> Consider the time and space complexity requirements.</p>
                                    <p>💡 <strong>Hint 3:</strong> Look at the constraints to guide your solution approach.</p>
                                    <div className="mt-6 p-4 bg-yellow-100 rounded border border-yellow-300">
                                        <p className="text-sm text-yellow-600">
                                            <strong>Pro Tip:</strong> Try to solve the problem yourself before looking at the solutions. 
                                            Hints are here to guide you when you're stuck!
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case "discussion":
                return (
                    <div className="p-6">
                        <div className="max-w-4xl mx-auto">
                            <Discussion questionId={id} currentUser={user} />
                        </div>
                    </div>
                );
            case "solutions":
                return (
                    <div className="p-6">
                        <div className="max-w-4xl mx-auto">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                                <div className="flex items-center mb-4">
                                    <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
                                    <h2 className="text-xl font-semibold text-green-800">Solutions</h2>
                                </div>
                                <div className="space-y-6 text-green-700">
                                    <div className="bg-white border border-green-200 rounded-lg p-4">
                                        <h3 className="font-semibold mb-2 text-green-800">Approach 1: Optimal Solution</h3>
                                        <p className="mb-3">This approach provides the most efficient solution with optimal time complexity.</p>
                                        <div className="bg-gray-50 p-4 rounded border font-mono text-sm">
                                            <p>// Solution code will be available here</p>
                                            <p>// Time Complexity: O(n)</p>
                                            <p>// Space Complexity: O(1)</p>
                                        </div>
                                    </div>
                                    <div className="bg-white border border-green-200 rounded-lg p-4">
                                        <h3 className="font-semibold mb-2 text-green-800">Approach 2: Alternative Solution</h3>
                                        <p className="mb-3">An alternative approach that might be easier to understand.</p>
                                        <div className="bg-gray-50 p-4 rounded border font-mono text-sm">
                                            <p>// Alternative solution code</p>
                                            <p>// Time Complexity: O(n log n)</p>
                                            <p>// Space Complexity: O(n)</p>
                                        </div>
                                    </div>
                                    <div className="mt-6 p-4 bg-green-100 rounded border border-green-300">
                                        <p className="text-sm text-green-600">
                                            <strong>Note:</strong> Try to implement the solution yourself first. 
                                            These solutions are provided for learning and verification purposes.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            default:
                return <div className="p-6 text-center text-gray-500">Select a tab to view content</div>;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Spinner />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Link
                                to="/"
                                className="inline-flex items-center text-slate-600 hover:text-slate-900 transition-colors"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Problems
                            </Link>
                            <div className="h-6 w-px bg-slate-300"></div>
                            <h1 className="text-xl font-semibold text-slate-900">
                                {question.title} - Hints & Solutions
                            </h1>
                        </div>
                        <Link
                            to={`/problem/${question.slug}`}
                            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            Solve Problem
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            {isLoggedIn ? (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                        {/* Tab Navigation */}
                        <div className="flex border-b border-gray-200 bg-gray-50">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center px-6 py-4 text-sm font-medium transition-colors ${
                                        activeTab === tab.id
                                            ? "border-b-2 border-indigo-500 text-indigo-600 bg-white"
                                            : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                                    }`}
                                >
                                    {tab.icon}
                                    <span className="ml-2">{tab.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="min-h-[500px]">
                            {getTabContent(activeTab)}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Login Required</h2>
                        <p className="text-gray-600 mb-6">
                            Please log in to access hints, discussions, and solutions for this problem.
                        </p>
                        <Link
                            to="/login"
                            className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            Login to Continue
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShowQuestion;
