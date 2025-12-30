// AI Helper Component - Provides AI-powered assistance throughout the platform
import React, { useState } from 'react';
import axios from 'axios';
import { Brain, Lightbulb, AlertCircle, Loader2, Sparkles } from 'lucide-react';

const AIHelper = ({ questionId, userCode, language, onTestCasesGenerated }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [hint, setHint] = useState('');
    const [errorExplanation, setErrorExplanation] = useState(null);
    const [showHint, setShowHint] = useState(false);
    const [hintLevel, setHintLevel] = useState(1);

    const API_BASE = 'http://localhost:5000/api';

    // Generate AI test cases
    const generateTestCases = async () => {
        if (!questionId) {
            setError('Question ID is required to generate test cases');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await axios.post(`${API_BASE}/ai/generate-test-cases`, {
                questionId,
                numTestCases: 5
            });

            if (response.data.success) {
                onTestCasesGenerated?.(response.data.data.testCases);
                alert(`Generated ${response.data.data.testCases.length} test cases successfully!`);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to generate test cases');
        } finally {
            setLoading(false);
        }
    };

    // Get AI hint
    const getHint = async () => {
        if (!questionId) {
            setError('Question ID is required to get hints');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await axios.post(`${API_BASE}/ai/generate-hint`, {
                questionId,
                userCode,
                hintLevel
            });

            if (response.data.success) {
                setHint(response.data.data.hint);
                setShowHint(true);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to get hint');
        } finally {
            setLoading(false);
        }
    };

    // Explain error using AI
    const explainError = async (errorMessage) => {
        if (!userCode || !errorMessage || !language) {
            setError('Code, error message, and language are required');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await axios.post(`${API_BASE}/ai/explain-error`, {
                code: userCode,
                error: errorMessage,
                language
            });

            if (response.data.success) {
                setErrorExplanation(response.data.data);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to explain error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
                <Brain className="w-6 h-6 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-800">AI Assistant</h3>
                <Sparkles className="w-4 h-4 text-yellow-500" />
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-500" />
                        <span className="text-red-700 text-sm">{error}</span>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {/* Test Case Generation */}
                <div className="border border-gray-200 rounded-md p-4">
                    <h4 className="font-medium text-gray-700 mb-2">Generate Test Cases</h4>
                    <p className="text-sm text-gray-600 mb-3">
                        Let AI create diverse test cases for this problem
                    </p>
                    <button
                        onClick={generateTestCases}
                        disabled={loading || !questionId}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                        Generate Test Cases
                    </button>
                </div>

                {/* Hint System */}
                <div className="border border-gray-200 rounded-md p-4">
                    <h4 className="font-medium text-gray-700 mb-2">Get Hint</h4>
                    <p className="text-sm text-gray-600 mb-3">
                        Stuck? Get an AI-powered hint to guide you
                    </p>
                    
                    <div className="flex items-center gap-2 mb-3">
                        <label className="text-sm text-gray-600">Hint Level:</label>
                        <select
                            value={hintLevel}
                            onChange={(e) => setHintLevel(parseInt(e.target.value))}
                            className="border border-gray-300 rounded px-2 py-1 text-sm"
                        >
                            <option value={1}>Subtle (Level 1)</option>
                            <option value={2}>Moderate (Level 2)</option>
                            <option value={3}>Detailed (Level 3)</option>
                        </select>
                    </div>

                    <button
                        onClick={getHint}
                        disabled={loading || !questionId}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lightbulb className="w-4 h-4" />}
                        Get Hint
                    </button>

                    {showHint && hint && (
                        <div className="mt-3 bg-green-50 border border-green-200 rounded-md p-3">
                            <div className="flex items-start gap-2">
                                <Lightbulb className="w-4 h-4 text-green-600 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-green-800">Hint (Level {hintLevel})</p>
                                    <p className="text-sm text-green-700 mt-1">{hint}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Error Explanation */}
                {errorExplanation && (
                    <div className="border border-orange-200 rounded-md p-4 bg-orange-50">
                        <h4 className="font-medium text-orange-800 mb-2 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            Error Explanation
                        </h4>
                        
                        <div className="space-y-3 text-sm">
                            <div>
                                <span className="font-medium text-orange-700">Error Type: </span>
                                <span className="text-orange-600">{errorExplanation.errorType}</span>
                            </div>
                            
                            <div>
                                <span className="font-medium text-orange-700">What went wrong: </span>
                                <p className="text-orange-600 mt-1">{errorExplanation.explanation}</p>
                            </div>
                            
                            <div>
                                <span className="font-medium text-orange-700">Cause: </span>
                                <p className="text-orange-600 mt-1">{errorExplanation.cause}</p>
                            </div>
                            
                            <div>
                                <span className="font-medium text-orange-700">Solution: </span>
                                <p className="text-orange-600 mt-1">{errorExplanation.solution}</p>
                            </div>
                            
                            {errorExplanation.tips && (
                                <div>
                                    <span className="font-medium text-orange-700">Tips: </span>
                                    <p className="text-orange-600 mt-1">{errorExplanation.tips}</p>
                                </div>
                            )}
                            
                            {errorExplanation.correctedCode && (
                                <div>
                                    <span className="font-medium text-orange-700">Corrected Code: </span>
                                    <pre className="bg-gray-100 p-2 rounded mt-1 text-xs overflow-x-auto">
                                        <code>{errorExplanation.correctedCode}</code>
                                    </pre>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Expose error explanation function for external use */}
            <div className="hidden">
                <button ref={(btn) => {
                    if (btn) {
                        btn.explainError = explainError;
                    }
                }} />
            </div>
        </div>
    );
};

export default AIHelper;
