import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Lightbulb, ChevronDown, ChevronUp, RotateCcw, Send } from 'lucide-react';
import api from '../utils/api';
import Spinner from '../components/Spinner';

const HintsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [hintLevel, setHintLevel] = useState(1);
    const [hint, setHint] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userCode, setUserCode] = useState('');
    const [problem, setProblem] = useState(null);

    useEffect(() => {
        const fetchProblemAndHint = async () => {
            try {
                setLoading(true);
                
                // Fetch problem details
                const problemRes = await api.get(`/api/questions/${id}`);
                setProblem(problemRes.data);
                
                // Fetch initial hint
                await fetchHint(1);
                
            } catch (err) {
                console.error('Error:', err);
                setError('Failed to load problem or hints. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProblemAndHint();
        }
    }, [id]);

    const fetchHint = async (level) => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await api.post('/api/ai/generate-hint', {
                questionId: id,
                hintLevel: level,
                userCode: userCode
            });
            
            setHint(response.data.hint);
            setHintLevel(level);
            
        } catch (err) {
            console.error('Error fetching hint:', err);
            setError(err.response?.data?.message || 'Failed to fetch hint. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleNextHint = () => {
        if (hintLevel < 3) {
            fetchHint(hintLevel + 1);
        }
    };

    const handlePreviousHint = () => {
        if (hintLevel > 1) {
            fetchHint(hintLevel - 1);
        }
    };

    if (loading && !hint) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Spinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center p-6 max-w-md mx-auto">
                    <div className="text-red-500 mb-4">
                        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold mb-2">Error Loading Hints</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center">
                        <button
                            onClick={() => navigate(-1)}
                            className="mr-4 p-1 rounded-full hover:bg-slate-100"
                        >
                            <ArrowLeft className="h-5 w-5 text-gray-600" />
                        </button>
                        <h1 className="text-xl font-semibold text-gray-900">
                            Hints for {problem?.title || 'this problem'}
                        </h1>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Problem Info */}
                {problem && (
                    <div className="mb-8 p-6 bg-white rounded-lg shadow-sm border border-slate-200">
                        <h2 className="text-lg font-semibold mb-2">Problem: {problem.title}</h2>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                problem.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                                problem.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                            }`}>
                                {problem.difficulty?.charAt(0).toUpperCase() + problem.difficulty?.slice(1)}
                            </span>
                            <span>•</span>
                            <span>Topics: {problem.topics?.join(', ')}</span>
                        </div>
                    </div>
                )}

                {/* Your Code */}
                <div className="mb-8">
                    <label htmlFor="userCode" className="block text-sm font-medium text-gray-700 mb-2">
                        Your Code (Optional)
                    </label>
                    <div className="mt-1">
                        <textarea
                            id="userCode"
                            rows={8}
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md p-3 font-mono text-sm"
                            placeholder="Paste your code here for more contextual hints..."
                            value={userCode}
                            onChange={(e) => setUserCode(e.target.value)}
                        />
                    </div>
                </div>

                {/* Hint Navigation */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold flex items-center">
                        <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
                        Hint Level {hintLevel}/3
                    </h2>
                    <div className="flex space-x-2">
                        <button
                            onClick={handlePreviousHint}
                            disabled={hintLevel <= 1}
                            className={`px-3 py-1 rounded-md text-sm font-medium ${
                                hintLevel <= 1 
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                            }`}
                        >
                            Previous
                        </button>
                        <button
                            onClick={handleNextHint}
                            disabled={hintLevel >= 3}
                            className={`px-3 py-1 rounded-md text-sm font-medium ${
                                hintLevel >= 3 
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                            }`}
                        >
                            Next
                        </button>
                        <button
                            onClick={() => fetchHint(hintLevel)}
                            className="p-1 text-gray-500 hover:text-gray-700"
                            title="Refresh hint"
                        >
                            <RotateCcw className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Hint Content */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-8">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        </div>
                    ) : (
                        <div className="prose max-w-none">
                            <div className="whitespace-pre-wrap">{hint}</div>
                        </div>
                    )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <ArrowLeft className="-ml-1 mr-2 h-4 w-4" />
                        Back to Problem
                    </button>
                    {hintLevel >= 3 && (
                        <button
                            onClick={() => {
                                // Navigate to the problem page with the code tab active
                                navigate(`/problem/${problem?.slug}`);
                            }}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Try Solving Now
                            <svg className="ml-2 -mr-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HintsPage;
