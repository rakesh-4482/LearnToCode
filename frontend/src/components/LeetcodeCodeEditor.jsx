import React, { useState, useCallback, useRef } from "react";

const LeetcodeCodeEditor = ({ question = {} }) => {
    const [language, setLanguage] = useState("cpp");
    const [code, setCode] = useState(`function twoSum(nums, target) {
    // Write your solution here
    
}`);
    const [activeBottomTab, setActiveBottomTab] = useState("testcases");
    const [activeTestCase, setActiveTestCase] = useState(0);
    const [bottomPanelHeight, setBottomPanelHeight] = useState(30); // percentage
    const [isDragging, setIsDragging] = useState(false);
    const [testResults, setTestResults] = useState([]);
    const [isRunning, setIsRunning] = useState(false);

    const containerRef = useRef(null);

    const languages = [
        { value: "js", label: "JavaScript" },
        { value: "python", label: "Python" },
        { value: "java", label: "Java" },
        { value: "cpp", label: "C++" },
        { value: "c", label: "C" },
    ];

    // Use backend data for test cases
    const testCases = React.useMemo(() => {
        const cases = [];

        // Add public test cases from backend
        if (question.publicTestCases?.length > 0) {
            question.publicTestCases.forEach((testCase, index) => {
                cases.push({
                    id: `public-${index}`,
                    type: "public",
                    input: testCase.input,
                    expected: testCase.output,
                    description: `Visible Test Case ${index + 1}`,
                });
            });
        }

        return cases;
    }, [question]);

    const handleMouseDown = (e) => {
        setIsDragging(true);
        e.preventDefault();
    };

    const handleMouseMove = useCallback(
        (e) => {
            if (!isDragging || !containerRef.current) return;

            const containerRect = containerRef.current.getBoundingClientRect();
            const newHeight =
                ((containerRect.bottom - e.clientY) / containerRect.height) *
                100;
            const constrainedHeight = Math.min(Math.max(newHeight, 20), 60);
            setBottomPanelHeight(constrainedHeight);
        },
        [isDragging]
    );

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    React.useEffect(() => {
        if (isDragging) {
            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", handleMouseUp);
            return () => {
                document.removeEventListener("mousemove", handleMouseMove);
                document.removeEventListener("mouseup", handleMouseUp);
            };
        }
    }, [isDragging, handleMouseMove, handleMouseUp]);

    const handleRun = async () => {
        if (!code.trim()) return;
        
        setIsRunning(true);
        setTestResults([]);
        
        try {
            // Simulate API call to run code against test cases
            const results = [];
            
            for (const testCase of testCases) {
                // Simulate API call for each test case
                await new Promise(resolve => setTimeout(resolve, 500));
                
                results.push({
                    id: testCase.id,
                    passed: Math.random() > 0.5,
                    output: `Output for test case ${testCase.id}`,
                    error: null
                });
                
                setTestResults([...results]);
            }
            
            // Show test results tab
            setActiveBottomTab("testcases");
        } catch (error) {
            console.error("Error running code:", error);
        } finally {
            setIsRunning(false);
        }
    };

    const renderTestCases = () => {
        if (testResults.length === 0) {
            return (
                <div className="flex items-center justify-center h-full text-gray-500">
                    Run the code to see test results
                </div>
            );
        }

        return (
            <div className="space-y-4">
                {testResults.map((result, index) => (
                    <div
                        key={result.id}
                        className={`p-3 rounded ${
                            result.passed
                                ? "bg-green-100 border border-green-200"
                                : "bg-red-100 border border-red-200"
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="font-medium">
                                Test Case {index + 1}
                            </span>
                            <span
                                className={`px-2 py-1 text-xs font-semibold rounded ${
                                    result.passed
                                        ? "bg-green-200 text-green-800"
                                        : "bg-red-200 text-red-800"
                                }`}
                            >
                                {result.passed ? "Passed" : "Failed"}
                            </span>
                        </div>
                        {result.error && (
                            <div className="mt-2 p-2 bg-red-50 rounded text-red-700 text-sm">
                                {result.error}
                            </div>
                        )}
                        <div className="mt-2 text-sm text-gray-700">
                            <div>Output: {result.output}</div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div
            ref={containerRef}
            className="flex flex-col h-full bg-white border border-gray-200 rounded-lg overflow-hidden"
        >
            {/* Language selector and run buttons */}
            <div className="flex items-center justify-between p-2 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center space-x-2">
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="text-sm border border-gray-300 rounded px-2 py-1 bg-white"
                    >
                        {languages.map((lang) => (
                            <option key={lang.value} value={lang.value}>
                                {lang.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={handleRun}
                        disabled={isRunning}
                        className={`px-4 py-1 text-sm font-medium rounded ${
                            isRunning
                                ? "bg-blue-300 cursor-not-allowed"
                                : "bg-blue-500 hover:bg-blue-600 text-white"
                        }`}
                    >
                        {isRunning ? "Running..." : "Run"}
                    </button>
                </div>
            </div>

            {/* Code editor */}
            <div className="flex-1 overflow-auto">
                <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full h-full p-4 font-mono text-sm focus:outline-none resize-none"
                    spellCheck="false"
                />
            </div>

            {/* Resizable panel */}
            <div
                className="relative border-t border-gray-200"
                style={{ height: `${bottomPanelHeight}%` }}
            >
                <div
                    className="absolute top-0 left-0 right-0 h-1 bg-gray-100 hover:bg-blue-200 cursor-ns-resize"
                    onMouseDown={handleMouseDown}
                />

                {/* Tabs */}
                <div className="flex border-b border-gray-200">
                    <button
                        onClick={() => setActiveBottomTab("testcases")}
                        className={`px-4 py-2 text-sm font-medium ${
                            activeBottomTab === "testcases"
                                ? "text-blue-600 border-b-2 border-blue-600"
                                : "text-gray-500 hover:text-gray-700"
                        }`}
                    >
                        Test Cases
                    </button>
                    <button
                        onClick={() => setActiveBottomTab("console")}
                        className={`px-4 py-2 text-sm font-medium ${
                            activeBottomTab === "console"
                                ? "text-blue-600 border-b-2 border-blue-600"
                                : "text-gray-500 hover:text-gray-700"
                        }`}
                    >
                        Console
                    </button>
                </div>

                {/* Tab content */}
                <div className="p-4 h-[calc(100%-40px)] overflow-auto">
                    {activeBottomTab === "testcases" ? (
                        renderTestCases()
                    ) : (
                        <div className="h-full text-sm text-gray-500">
                            Console output will appear here
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LeetcodeCodeEditor;
