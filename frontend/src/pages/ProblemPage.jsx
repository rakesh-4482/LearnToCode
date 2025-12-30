import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    ArrowLeft, 
    Play, 
    Code, 
    CheckCircle, 
    XCircle, 
    Clock, 
    Target, 
    BookOpen, 
    GripVertical, 
    RotateCcw, 
    ChevronDown, 
    ChevronUp, 
    Loader2 
} from 'lucide-react';
import { BACKEND_URL } from '../../config';
import Spinner from '../components/Spinner';

const ProblemPage = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [problem, setProblem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('problem'); // Only keep problem tab
    
    // Split pane state
    const [leftWidth, setLeftWidth] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef(null);
    
    // Code editor state
    const [code, setCode] = useState('// Write your solution here\n');
    const [input, setInput] = useState('');  
    const [language, setLanguage] = useState('javascript');
    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showOutput, setShowOutput] = useState(true);
    const [testResults, setTestResults] = useState(null);
    const [testCaseStatus, setTestCaseStatus] = useState({});
    
    const [ws, setWs] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [socketId, setSocketId] = useState('');
    const outputEndRef = useRef(null);
    const shouldStopRef = useRef(false);
    const wsRef = useRef(null);

    useEffect(() => {
        // Only create WebSocket in browser environment
        if (typeof window !== 'undefined') {
            const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
            const wsUrl = `${protocol}${window.location.hostname}:5001/ws`;
            const socket = new WebSocket(wsUrl);

            socket.onopen = () => {
                console.log('WebSocket Connected');
                setIsConnected(true);
                setWs(socket);
                wsRef.current = socket; // Set the ref for use in runCode
            };

            socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    
                    if (data.type === 'output') {
                        const testCaseId = data.testCaseId || 0;
                        setTestCaseStatus(prev => {
                            // Add null check for data.data
                            const outputData = data?.data || '';
                            const trimmedOutput = typeof outputData === 'string' ? outputData.trim() : String(outputData);
                            
                            return {
                                ...prev,
                                [testCaseId]: {
                                    ...(prev[testCaseId] || {}),
                                    output: trimmedOutput
                                }
                            };
                        });
                    } else if (data.type === 'end') {
                        const testCaseId = data.testCaseId || 0;
                        setTestCaseStatus(prev => {
                            const currentOutput = (prev[testCaseId]?.output || '').toString().trim();
                            // Add null check for expected output
                            const expected = (prev[testCaseId]?.expected || '').toString().trim();
                            const isPassed = currentOutput === expected;
                            
                            return {
                                ...prev,
                                [testCaseId]: {
                                    ...(prev[testCaseId] || {}),
                                    status: isPassed ? 'passed' : 'failed',
                                    message: isPassed ? 'Test case passed!' : `Expected: ${expected}`,
                                    output: currentOutput
                                }
                            };
                        });
                    }
                } catch (error) {
                    console.error('Error processing WebSocket message:', error);
                }
            };

            socket.onclose = () => {
                console.log('WebSocket Disconnected');
                setIsConnected(false);
                setWs(null);
            };

            socket.onerror = (error) => {
                console.error('WebSocket Error:', error);
                setOutput(prev => prev + '\n❌ Connection error. Please refresh the page.');
                setIsConnected(false);
            };

            return () => {
                if (socket) {
                    socket.close();
                }
            };
        }
    }, []);

    useEffect(() => {
        if (outputEndRef.current) {
            outputEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [output]);

    useEffect(() => {
        const fetchProblem = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get(`${BACKEND_URL}/api/questions/slug/${slug}`, {
                    withCredentials: true
                });
                
                if (response.data) {
                    console.log('Problem data received:', response.data);
                    console.log('Test cases:', response.data.testCases);
                    console.log('Example test cases:', response.data.exampleTestCases);
                    
                    setProblem(response.data);
                    // Set default code template based on problem
                    const template = getCodeTemplate(language, response.data);
                    setCode(template);
                } else {
                    setError('Problem not found');
                    navigate('/problems');
                }
            } catch (err) {
                console.error('Error fetching problem:', err);
                setError('Failed to load problem. Please try again.');
                navigate('/problems');
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchProblem();
        }
    }, [slug, navigate]);

    const getCodeTemplate = (lang, problemData) => {
        const templates = {
            javascript: `// ${problemData?.title || 'Problem'}\n// Difficulty: ${problemData?.difficulty || 'Unknown'}\n\nfunction solution() {\n    // Write your solution here\n    \n}\n\n// Test your solution\nconsole.log(solution());`,
            python: `# ${problemData?.title || 'Problem'}\n# Difficulty: ${problemData?.difficulty || 'Unknown'}\n\ndef solution():\n    # Write your solution here\n    pass\n\n# Test your solution\nprint(solution())`,
            java: `// ${problemData?.title || 'Problem'}\n// Difficulty: ${problemData?.difficulty || 'Unknown'}\n\npublic class Solution {\n    public static void main(String[] args) {\n        // Write your solution here\n        \n    }\n}`,
            cpp: `// ${problemData?.title || 'Problem'}\n// Difficulty: ${problemData?.difficulty || 'Unknown'}\n\n#include <iostream>\n#include <vector>\n#include <sstream>\n#include <string>\nusing namespace std;\n\nint singleNumber(vector<int>& nums) {\n    int result = 0;\n    for (int num : nums) {\n        result ^= num;  // XOR all numbers\n    }\n    return result;\n}\n\nint main() {\n    vector<int> nums;\n    string line;\n    \n    // Read the entire first line (count)\n    getline(cin, line);\n    int n = stoi(line);\n    \n    // Read the second line (numbers)\n    getline(cin, line);\n    stringstream ss(line);\n    int num;\n    while (ss >> num) {\n        nums.push_back(num);\n    }\n    \n    // If we didn't get enough numbers, read more lines\n    while (nums.size() < n && getline(cin, line)) {\n        stringstream ss2(line);\n        while (ss2 >> num) {\n            nums.push_back(num);\n            if (nums.size() >= n) break;\n        }\n    }\n    \n    int result = singleNumber(nums);\n    cout << result << endl;\n    \n    return 0;\n}`,
            c: `// ${problemData?.title || 'Problem'}\n// Difficulty: ${problemData?.difficulty || 'Unknown'}\n\n#include <stdio.h>\n\nint main() {\n    // Write your solution here\n    \n    return 0;\n}`
        };
        return templates[lang] || templates.javascript;
    };

    const handleMouseDown = (e) => {
        setIsDragging(true);
        e.preventDefault();
    };

    const handleMouseMove = (e) => {
        if (!isDragging || !containerRef.current) return;
        
        const containerRect = containerRef.current.getBoundingClientRect();
        const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
        
        // Constrain between 20% and 80%
        const constrainedWidth = Math.min(Math.max(newLeftWidth, 20), 80);
        setLeftWidth(constrainedWidth);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
    }, [isDragging]);

    const stopExecution = () => {
        shouldStopRef.current = true;
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.close();
        }
        setIsRunning(false);
    };

    const runCode = async () => {
        if (isRunning) return; // Prevent multiple runs
        
        setIsRunning(true);
        shouldStopRef.current = false;
        setOutput('Running public test cases...\n');
        
        // Initialize test case statuses with proper expected outputs
        const initialStatus = {};
        (problem.publicTestCases || []).forEach((testCase, index) => {
            initialStatus[index] = {
                status: 'pending',
                message: 'Pending',
                output: '',
                expected: testCase.output?.toString().trim() || 'Not specified',
                input: testCase.input?.toString().trim() || ''
            };
        });
        setTestCaseStatus(initialStatus);

        try {
            const testCases = problem.publicTestCases || [];
            console.log(`Running ${testCases.length} test cases`);

            // Wait for WebSocket connection
            if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
                await new Promise((resolve, reject) => {
                    const timeout = setTimeout(() => {
                        reject(new Error('WebSocket connection timeout'));
                    }, 3000);

                    const checkConnection = () => {
                        if (wsRef.current?.readyState === WebSocket.OPEN) {
                            clearTimeout(timeout);
                            resolve();
                        } else if (wsRef.current?.readyState === WebSocket.CLOSED) {
                            clearTimeout(timeout);
                            reject(new Error('WebSocket connection closed'));
                        } else {
                            setTimeout(checkConnection, 100);
                        }
                    };
                    
                    checkConnection();
                });
            }

            // Create a message handler that will be used for all test cases
            const messageHandlers = [];
            
            try {
                // Process test cases one by one
                for (let i = 0; i < testCases.length; i++) {
                    if (shouldStopRef.current) {
                        setOutput(prev => prev + '\n❌ Execution stopped by user\n');
                        break;
                    }

                    const testCase = testCases[i] || {};
                    const testCaseInput = (testCase.input || '').toString().trim();
                    const expectedOutput = (testCase.output || '').toString().trim();

                    // Update test case status to running
                    setTestCaseStatus(prev => ({
                        ...prev,
                        [i]: {
                            ...prev[i],
                            status: 'running',
                            message: 'Running...',
                            output: '',
                            expected: expectedOutput,
                            input: testCaseInput
                        }
                    }));
                    
                    console.log(`Running test case ${i + 1}:`);
                    console.log(`Input: "${testCaseInput}"`);
                    console.log(`Expected: "${expectedOutput}"`);
                    
                    if (!testCaseInput) {
                        console.warn(`Skipping test case ${i + 1} - no input provided`);
                        setTestCaseStatus(prev => ({
                            ...prev,
                            [i]: {
                                ...prev[i],
                                status: 'skipped',
                                message: 'Skipped: No input provided',
                                output: ''
                            }
                        }));
                        continue;
                    }

                    // Create a new message handler for this test case
                    const messageHandler = (event) => {
                        try {
                            const data = JSON.parse(event.data);
                            
                            // Only process messages for this test case
                            if (data.testCaseId !== i.toString() && data.testCaseId !== undefined) {
                                return;
                            }
                            
                            if (data.type === 'output') {
                                setTestCaseStatus(prev => {
                                    // Add null check for data.data
                                    const outputData = data?.data || '';
                                    const trimmedOutput = typeof outputData === 'string' ? outputData.trim() : String(outputData);
                                    
                                    return {
                                        ...prev,
                                        [i]: {
                                            ...prev[i],
                                            output: trimmedOutput
                                        }
                                    };
                                });
                            } else if (data.type === 'end') {
                                setTestCaseStatus(prev => {
                                    const currentOutput = (prev[i]?.output || '').toString().trim();
                                    // Add null check for expected output
                                    const expected = prev[i]?.expected || '';
                                    const isPassed = currentOutput === expected;
                                    
                                    return {
                                        ...prev,
                                        [i]: {
                                            ...prev[i],
                                            status: isPassed ? 'passed' : 'failed',
                                            message: isPassed ? 'Test case passed!' : `Expected: ${expected}`,
                                            output: currentOutput
                                        }
                                    };
                                });
                                
                                // Remove this handler when done
                                wsRef.current?.removeEventListener('message', messageHandler);
                                resolveTestCase();
                            }
                        } catch (error) {
                            console.error('Error processing WebSocket message:', error);
                        }
                    };
                    
                    // Store the handler for cleanup
                    messageHandlers.push(messageHandler);
                    
                    // Add the event listener
                    wsRef.current?.addEventListener('message', messageHandler);
                    
                    // Create a promise that resolves when this test case is done
                    let resolveTestCase;
                    const testCasePromise = new Promise(resolve => {
                        resolveTestCase = resolve;
                    });
                    
                    // Before sending the test case, clear any previous output
                    setTestCaseStatus(prev => ({
                        ...prev,
                        [i]: {
                            ...prev[i],
                            output: '',
                            status: 'running',
                            message: 'Running...'
                        }
                    }));
                    
                    // Send the test case to the WebSocket
                    if (wsRef.current?.readyState === WebSocket.OPEN) {
                        wsRef.current.send(JSON.stringify({
                            type: 'run',
                            problemId: problem._id,
                            code: code.trim(),
                            language: language.toLowerCase(),
                            input: testCaseInput,
                            testCaseId: i.toString(),
                            clearPrevious: true  // Signal to backend to clear any previous output
                        }));
                    } else {
                        throw new Error('WebSocket connection is not open');
                    }
                    
                    // Wait for this test case to complete with a timeout
                    await Promise.race([
                        testCasePromise,
                        new Promise((_, reject) => 
                            setTimeout(() => reject(new Error('Test case timeout')), 10000)
                        )
                    ]);
                    
                    // Small delay between test cases
                    await new Promise(resolve => setTimeout(resolve, 200));
                }
            } finally {
                // Clean up all message handlers
                messageHandlers.forEach(handler => {
                    wsRef.current?.removeEventListener('message', handler);
                });
            }
        } catch (error) {
            if (!shouldStopRef.current) {
                console.error('Error in runCode:', error);
                setOutput(prev => prev + '\n❌ Error: ' + (error.message || 'Failed to run test cases'));
            }
        } finally {
            setIsRunning(false);
            shouldStopRef.current = false;
        }
    };

    const submitCode = async () => {
        if (!isConnected || !problem || !ws) {
            setOutput('Error: Not connected to the server. Please refresh the page.');
            return;
        }

        setIsSubmitting(true);
        setOutput('Submitting code... Running all test cases...\n');
        setTestResults(null);

        try {
            ws.send(JSON.stringify({
                type: 'run',
                problemId: problem._id,
                code,
                language: language.toLowerCase(),
                runAllTestCases: true
            }));
        } catch (error) {
            console.error('Error sending WebSocket message:', error);
            setOutput(prev => prev + '\n❌ Error: Failed to submit code');
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (e) => {
        setInput(e.target.value);
        // If there's an active process, send input immediately
        if (ws && isRunning) {
            ws.send(JSON.stringify({
                type: 'input',
                input: e.target.value
            }));
        }
    };

    const resetCode = () => {
        const template = getCodeTemplate(language, problem);
        setCode(template);
        setOutput('');
        setInput('');
        
        // Stop any running process
        if (ws && isRunning) {
            ws.send(JSON.stringify({ type: 'stop' }));
            setIsRunning(false);
        }
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty?.toLowerCase()) {
            case 'easy': return 'bg-green-100 text-green-800 border-green-200';
            case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'hard': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (tab === 'submissions') {
            navigate(`/problem/${slug}/submissions`);
        } else if (tab === 'hints') {
            navigate(`/problem/${slug}/hints`);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Spinner />
            </div>
        );
    }

    if (error || !problem) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Problem Not Found</h2>
                    <p className="text-gray-600 mb-6">The problem you're looking for doesn't exist.</p>
                    <Link
                        to="/"
                        className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Problems
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Header */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <Link
                            to="/problems"
                            className="inline-flex items-center text-slate-600 hover:text-slate-900"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Problems
                        </Link>
                        <h1 className="text-xl font-bold text-slate-900">
                            {problem?.title || 'Problem'}
                        </h1>
                        <div className="w-24"></div> {/* Spacer for alignment */}
                    </div>
                    
                    {/* Tabs */}
                    <nav className="flex space-x-8 border-b border-slate-200">
                        <button
                            onClick={() => handleTabChange('problem')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'problem'
                                    ? 'border-indigo-500 text-indigo-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                            }`}
                        >
                            Problem
                        </button>
                    </nav>
                </div>
            </div>

            {/* Split Pane Container */}
            <div 
                ref={containerRef}
                className="flex-1 flex overflow-hidden"
                style={{ height: 'calc(100vh - 73px)' }}
            >
                {/* Left Pane - Problem Content */}
                <div 
                    className="bg-white border-r border-slate-200 overflow-y-auto"
                    style={{ width: `${leftWidth}%` }}
                >
                    <div className="p-6">
                        {/* Problem Header */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <h1 className="text-2xl font-bold text-slate-900">{problem.title}</h1>
                            </div>
                            
                            {/* Topics */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                {problem.topics?.map((topic, index) => (
                                    <span
                                        key={index}
                                        className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-sm"
                                    >
                                        {topic}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Problem Statement */}
                        <div className="prose max-w-none">
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center">
                                    <BookOpen className="mr-2 h-5 w-5" />
                                    Problem Description
                                </h3>
                                <div className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                                    {problem.problemStatement}
                                </div>
                            </div>

                            {/* Examples */}
                            {problem.examples && problem.examples.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-slate-900 mb-3">Examples</h3>
                                    {problem.examples.map((example, index) => (
                                        <div key={index} className="mb-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                                            <div className="mb-2">
                                                <span className="font-medium text-slate-900">Example {index + 1}:</span>
                                            </div>
                                            <div className="space-y-2 text-sm">
                                                <div>
                                                    <span className="font-medium text-slate-700">Input:</span>
                                                    <code className="ml-2 px-2 py-1 bg-slate-200 rounded text-slate-800">
                                                        {example.input}
                                                    </code>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-slate-700">Output:</span>
                                                    <code className="ml-2 px-2 py-1 bg-slate-200 rounded text-slate-800">
                                                        {example.output}
                                                    </code>
                                                </div>
                                                {example.explanation && (
                                                    <div>
                                                        <span className="font-medium text-slate-700">Explanation:</span>
                                                        <span className="ml-2 text-slate-600">{example.explanation}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Public Test Cases */}
                            {problem.publicTestCases && problem.publicTestCases.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-slate-900 mb-3">Public Test Cases</h3>
                                    <div className="space-y-3">
                                        {problem.publicTestCases.map((testCase, index) => (
                                            <div key={index} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                                                <div className="mb-2">
                                                    <span className="font-medium text-slate-900">Test Case {index + 1}:</span>
                                                </div>
                                                <div className="space-y-2 text-sm font-mono">
                                                    <div>
                                                        <span className="font-medium text-slate-700">Input:</span>
                                                        <code className="ml-2 px-2 py-1 bg-slate-200 rounded text-slate-800">
                                                            {testCase.input}
                                                        </code>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-slate-700">Expected Output:</span>
                                                        <code className="ml-2 px-2 py-1 bg-slate-200 rounded text-slate-800">
                                                            {testCase.output}
                                                        </code>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Problem Statistics */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-slate-900 mb-3">Problem Statistics</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                        <div className="text-sm text-slate-600">Difficulty</div>
                                        <div className={`text-lg font-semibold capitalize ${
                                            problem.difficulty === 'easy' ? 'text-green-600' :
                                            problem.difficulty === 'medium' ? 'text-yellow-600' : 'text-red-600'
                                        }`}>
                                            {problem.difficulty}
                                        </div>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                        <div className="text-sm text-slate-600">Topics</div>
                                        <div className="text-lg font-semibold text-slate-900">
                                            {problem.topics?.length || 0}
                                        </div>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                        <div className="text-sm text-slate-600">Test Cases</div>
                                        <div className="text-lg font-semibold text-slate-900">
                                            {problem.publicTestCases?.length || 0}
                                        </div>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                        <div className="text-sm text-slate-600">Author</div>
                                        <div className="text-lg font-semibold text-slate-900 truncate">
                                            {problem.author}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-slate-900 mb-3">Quick Actions</h3>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => setCode(getCodeTemplate(language, problem))}
                                        className="inline-flex items-center px-3 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm"
                                    >
                                        <RotateCcw className="mr-1 h-4 w-4" />
                                        Reset Code
                                    </button>
                                </div>
                            </div>

                            {/* Footer Metadata */}
                            {(problem.createdAt || problem.updatedAt) && (
                                <div className="pt-6 border-t border-slate-200">
                                    <div className="text-sm text-slate-500 space-y-1">
                                        {problem.createdAt && (
                                            <p>
                                                <span className="font-medium text-slate-600">Created:</span>{' '}
                                                {new Date(problem.createdAt).toLocaleDateString()}
                                            </p>
                                        )}
                                        {problem.updatedAt && (
                                            <p>
                                                <span className="font-medium text-slate-600">Updated:</span>{' '}
                                                {new Date(problem.updatedAt).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Drag Handle */}
                <div 
                    className="w-1 bg-slate-200 hover:bg-slate-300 cursor-col-resize flex items-center justify-center group transition-colors"
                    onMouseDown={handleMouseDown}
                >
                    <GripVertical className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
                </div>

                {/* Right Pane - Code Editor */}
                <div 
                    className="bg-slate-50 flex flex-col"
                    style={{ width: `${100 - leftWidth}%` }}
                >
                    {/* Editor Header */}
                    <div className="bg-white border-b border-slate-200 px-4 py-3 flex-shrink-0">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <select
                                    value={language}
                                    onChange={(e) => {
                                        setLanguage(e.target.value);
                                        setCode(getCodeTemplate(e.target.value, problem));
                                    }}
                                    className="border border-slate-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    disabled={isRunning}
                                >
                                    <option value="javascript">JavaScript</option>
                                    <option value="python">Python</option>
                                    <option value="java">Java</option>
                                    <option value="cpp">C++</option>
                                    <option value="c">C</option>
                                </select>
                            </div>
                            <div className="flex items-center space-x-2">
                                {isRunning ? (
                                    <button
                                        onClick={stopExecution}
                                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                                        disabled={!isRunning}
                                    >
                                        Stop
                                    </button>
                                ) : (
                                    <button
                                        onClick={runCode}
                                        disabled={isRunning}
                                        className={`px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm`}
                                    >
                                        Run
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Code Editor */}
                    <div className="flex-1 flex flex-col">
                        <textarea
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="flex-1 w-full p-4 font-mono text-sm border-none outline-none resize-none bg-white"
                            placeholder="Write your code here..."
                            style={{ minHeight: '300px' }}
                        />
                    </div>

                    {/* Input/Output Section */}
                    <div className="border-t border-slate-200 bg-white">
                        <div className="p-4">
                            <div className="mb-3">
                                <label className="block text-sm font-medium text-slate-700 mb-2">Input:</label>
                                <textarea
                                    value={input}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-slate-300 rounded-md text-sm font-mono"
                                    rows="2"
                                    placeholder="Enter input for your program..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Output:</label>
                                <div className="w-full p-2 border border-slate-300 rounded-md bg-slate-50 text-sm font-mono min-h-[60px] whitespace-pre-wrap">
                                    {output}
                                    <div ref={outputEndRef} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Test Case Results */}
                    <div className="mt-4 space-y-2">
                        <h3 className="font-medium">Test Cases:</h3>
                        <div className="space-y-2">
                            {problem?.publicTestCases?.map((testCase, index) => {
                                const status = testCaseStatus[index]?.status || 'pending';
                                const message = testCaseStatus[index]?.message || 'Pending';
                                const output = testCaseStatus[index]?.output?.toString().trim() || '';
                                const expected = testCaseStatus[index]?.expected?.toString().trim() || 'Not specified';
                                const input = testCaseStatus[index]?.input?.toString().trim() || '';
                                
                                return (
                                    <div key={index} className={`p-3 rounded border ${
                                        status === 'passed' ? 'bg-green-50 border-green-200' :
                                        status === 'failed' ? 'bg-red-50 border-red-200' :
                                        status === 'error' ? 'bg-yellow-50 border-yellow-200' :
                                        status === 'running' ? 'bg-blue-50 border-blue-200' :
                                        'bg-gray-50 border-gray-200'
                                    }`}>
                                        <div className="font-medium mb-1">Test Case {index + 1}:</div>
                                        <div className="text-sm space-y-1 mb-2">
                                            <div className="font-mono bg-gray-100 p-2 rounded">
                                                <div className="mb-1">
                                                    <span className="font-semibold">Input:</span>
                                                    <div className="ml-2 whitespace-pre-wrap">{input.replace(/\n/g, '⏎\n')}</div>
                                                </div>
                                                <div className="mb-1">
                                                    <span className="font-semibold">Expected Output:</span>
                                                    <div className="ml-2 text-green-700 font-mono">{expected}</div>
                                                </div>
                                                {status !== 'pending' && (
                                                    <div>
                                                        <span className="font-semibold">Your Output:</span>
                                                        <div className={`ml-2 font-mono ${
                                                            status === 'passed' ? 'text-green-700' : 'text-red-700'
                                                        }`}>
                                                            {output || 'No output'}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2 text-sm">
                                            {status === 'passed' && <CheckCircle className="w-4 h-4 text-green-500" />}
                                            {status === 'failed' && <XCircle className="w-4 h-4 text-red-500" />}
                                            {status === 'error' && <XCircle className="w-4 h-4 text-yellow-500" />}
                                            {status === 'running' && <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />}
                                            {status === 'pending' && <Clock className="w-4 h-4 text-gray-400" />}
                                            <span className={status === 'passed' ? 'text-green-700' : 
                                                status === 'failed' ? 'text-red-700' : 
                                                status === 'error' ? 'text-yellow-700' : 
                                                'text-gray-700'}>
                                                {message}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProblemPage;