import React, { useState, useEffect, useRef } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { javascript } from "@codemirror/lang-javascript";
import { cpp } from "@codemirror/lang-cpp";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import axios from "axios";
import { BACKEND_URL } from "../../config";

const LANGUAGES = [
    { label: "C++", value: "cpp", mode: cpp, defaultCode: `#include <iostream>\nusing namespace std;\nint main() {\n    cout << "Hello, ByteSmith!" << endl;\n    return 0;\n}` },
    { label: "C", value: "c", mode: cpp, defaultCode: `#include <stdio.h>\nint main() {\n    printf(\"Hello, ByteSmith!\\n\");\n    return 0;\n}` },
    { label: "Python", value: "python", mode: python, defaultCode: `print("Hello, ByteSmith!")` },
    { label: "Java", value: "java", mode: java, defaultCode: `public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello, ByteSmith!\");\n    }\n}` },
    { label: "JavaScript", value: "js", mode: javascript, defaultCode: `console.log("Hello, ByteSmith!");` },
];

// Use the same host as BACKEND_URL but with ws:// protocol
const WS_URL = BACKEND_URL.replace(/^http/, 'ws').replace(/:\d+/, '') + ':5001/ws';

const Compiler = () => {
    const [language, setLanguage] = useState(LANGUAGES[0].value);
    const [code, setCode] = useState(LANGUAGES[0].defaultCode);
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [isRunning, setIsRunning] = useState(false);
    const [isWaitingForInput, setIsWaitingForInput] = useState(false);
    const [inputBuffer, setInputBuffer] = useState('');
    const [hasError, setHasError] = useState(false);
    const [isAnalyzingError, setIsAnalyzingError] = useState(false);
    const [errorAnalysis, setErrorAnalysis] = useState(null);
    const [showErrorAnalysis, setShowErrorAnalysis] = useState(false);
    const [terminalInput, setTerminalInput] = useState('');
    const [isTerminalFocused, setIsTerminalFocused] = useState(false);
    const wsRef = useRef(null);
    const terminalRef = useRef(null);

    // Function to detect if output contains errors
    const detectError = (outputText) => {
        const errorKeywords = [
            'error:', 'Error:', 'ERROR:',
            'exception:', 'Exception:', 'EXCEPTION:',
            'failed', 'Failed', 'FAILED',
            'undefined reference', 'undefined symbol',
            'compilation terminated', 'compilation failed',
            'syntax error', 'SyntaxError',
            'runtime error', 'RuntimeError',
            'segmentation fault', 'Segmentation fault',
            'cannot find symbol', 'undeclared identifier',
            'expected', 'unexpected',
            'Traceback', 'traceback'
        ];
        
        return errorKeywords.some(keyword => outputText.includes(keyword));
    };

    // Function to filter output and remove compilation logs
    const filterOutput = (outputText) => {
        if (!outputText) return '';
        
        // Filter out compilation and execution logs, only show actual program output and errors
        const linesToFilter = [
            'Code written to',
            'Compiling...',
            'Running...',
            'Process exited with code',
            'Execution completed'
        ];
        
        const lines = outputText.split('\n');
        const filteredLines = lines.filter(line => {
            // Keep error lines and actual program output
            if (detectError(line)) return true;
            
            // Filter out system messages
            return !linesToFilter.some(filterText => line.includes(filterText));
        });
        
        return filteredLines.join('\n');
    };

    // Function to analyze error with AI
    const analyzeError = async () => {
        setIsAnalyzingError(true);
        try {
            const response = await axios.post(`${BACKEND_URL}/api/ai/chat`, {
                message: `Please analyze this code error and provide a solution:

**Language:** ${language}

**Code:**
\`\`\`${language}
${code}
\`\`\`

**Error Output:**
\`\`\`
${output}
\`\`\`

Please provide:
1. What the error means
2. Why it occurred
3. How to fix it
4. The corrected code (if applicable)

Format your response clearly with sections.`,
                service: 'general'  // Use 'general' service instead of 'error_explanation'
            });

            if (response.data && response.data.response) {
                setErrorAnalysis(response.data.response);
                setShowErrorAnalysis(true);
            } else {
                throw new Error('Invalid response format');
            }
        } catch (error) {
            console.error('Error analyzing code:', error);
            console.error('Response:', error.response?.data);
            
            let errorMessage = 'Sorry, I couldn\'t analyze the error right now. Please try again later.';
            
            if (error.response?.status === 401) {
                errorMessage = 'Authentication error. Please make sure you\'re logged in.';
            } else if (error.response?.status === 500) {
                errorMessage = 'Server error. The AI service might be temporarily unavailable.';
            } else if (error.response?.data?.message) {
                errorMessage = `Error: ${error.response.data.message}`;
            }
            
            setErrorAnalysis(errorMessage);
            setShowErrorAnalysis(true);
        } finally {
            setIsAnalyzingError(false);
        }
    };

    // Function to extract corrected code from AI response
    const extractCorrectedCode = (aiResponse) => {
        try {
            // Look for code blocks in the AI response
            const codeBlockRegex = /```(?:cpp|c|python|java|javascript|js)?\n([\s\S]*?)```/gi;
            const matches = aiResponse.match(codeBlockRegex);
            
            if (matches && matches.length > 0) {
                // Get the last code block (usually the corrected version)
                const lastCodeBlock = matches[matches.length - 1];
                // Remove the ``` markers and language identifier
                const cleanCode = lastCodeBlock.replace(/```(?:cpp|c|python|java|javascript|js)?\n?/gi, '').replace(/```/g, '').trim();
                return cleanCode;
            }
            
            // If no code blocks found, return the original code
            return code;
        } catch (error) {
            console.error('Error extracting corrected code:', error);
            return code;
        }
    };

    // Update error detection when output changes
    useEffect(() => {
        if (output) {
            setHasError(detectError(output));
        } else {
            setHasError(false);
        }
    }, [output]);

    const handleLanguageChange = (e) => {
        const lang = LANGUAGES.find((l) => l.value === e.target.value);
        setLanguage(lang.value);
        setCode(lang.defaultCode);
    };

    const getCodeMirrorMode = () => {
        const lang = LANGUAGES.find((l) => l.value === language);
        return lang && lang.mode ? [lang.mode()] : [];
    };

    const sendInput = () => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                type: 'input',
                input: inputBuffer + '\n'  // Add newline to simulate Enter key
            }));
            setOutput(prev => prev + inputBuffer + '\n');
            setInputBuffer('');
            setIsWaitingForInput(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && isWaitingForInput) {
            e.preventDefault();
            sendInput();
        }
    };

    const runCode = async () => {
        if (!code.trim()) {
            setOutput('Error: Please enter some code to run\n');
            return;
        }

        setOutput('');
        setIsRunning(true);
        setIsWaitingForInput(false);
        setHasError(false);

        try {
            const ws = new WebSocket(WS_URL);
            wsRef.current = ws;

            ws.onopen = () => {
                console.log('WebSocket connection opened');
                // Send run message with proper type
                ws.send(JSON.stringify({
                    type: 'run',
                    code,
                    language,
                    input: input || ''
                }));
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    
                    if (data.type === 'output') {
                        const filteredOutput = filterOutput(data.data);
                        if (filteredOutput) {
                            setOutput(prev => prev + filteredOutput);
                        }
                    } else if (data.type === 'error') {
                        setOutput(prev => prev + `Error: ${data.error}\n`);
                        setHasError(true);
                        setIsRunning(false);
                    } else if (data.type === 'end') {
                        setIsRunning(false);
                        setIsWaitingForInput(false);
                    } else if (data.type === 'input_required') {
                        setIsWaitingForInput(true);
                    }
                } catch (err) {
                    console.error('Error processing WebSocket message:', err);
                }
            };

            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                setOutput(prev => prev + '\nError: Could not connect to the compiler service. Please try again.\n');
                setIsRunning(false);
                setIsWaitingForInput(false);
            };

            ws.onclose = (event) => {
                console.log('WebSocket connection closed:', event.code, event.reason);
                if (event.code !== 1000 && event.code !== 1005) {  // 1000 is a normal closure, 1005 is no status
                    setOutput(prev => prev + '\nConnection to compiler service was closed.\n');
                }
                setIsRunning(false);
                setIsWaitingForInput(false);
            };

        } catch (error) {
            console.error('Error initializing WebSocket:', error);
            setOutput('Error: Could not connect to the compiler service. Please try again.\n');
            setIsRunning(false);
            setIsWaitingForInput(false);
        }
    };

    // Function to stop code execution
    const stopExecution = () => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                type: 'stop'
            }));
            wsRef.current.close();
        }
        setIsRunning(false);
        setIsWaitingForInput(false);
        setOutput(prev => prev + '\n[Execution stopped by user]\n');
    };

    // Handle terminal input
    const handleTerminalKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (terminalInput.trim() && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                // Send input to the running program
                wsRef.current.send(JSON.stringify({
                    type: 'input',
                    input: terminalInput + '\n'
                }));
                
                // Add input to output display
                setOutput(prev => prev + terminalInput + '\n');
                setTerminalInput('');
                setIsWaitingForInput(false);
            }
        }
    };

    // Handle terminal click to focus
    const handleTerminalClick = () => {
        if (isRunning) {
            setIsTerminalFocused(true);
            if (terminalRef.current) {
                terminalRef.current.focus();
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-12">
            <div className="max-w-4xl mx-auto px-4">
                <div className="text-center mb-10">
                    <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-2">ByteSmith Playground</h1>
                    <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                        Write, run, and debug code in multiple languages. Experience the power of instant feedback and AI-powered explanations.
                    </p>
                </div>
                <div className="bg-white rounded-2xl shadow-large border border-neutral-100 p-6 md:p-10 flex flex-col gap-6">
                    {/* Language Selection and Code Editor */}
                    <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <label className="font-medium text-neutral-700">Language</label>
                                <select
                                    className="input-field"
                                    value={language}
                                    onChange={handleLanguageChange}
                                    disabled={isRunning}
                                >
                                    {LANGUAGES.map((lang) => (
                                        <option key={lang.value} value={lang.value}>{lang.label}</option>
                                    ))}
                                </select>
                            </div>
                            {/* Run Code Button moved to top */}
                            <div className="flex gap-2">
                                <button
                                    className={`px-6 py-2 rounded-lg font-medium ${
                                        isRunning
                                            ? 'bg-gray-500 cursor-not-allowed text-white'
                                            : 'bg-green-600 hover:bg-green-700 text-white'
                                    }`}
                                    onClick={runCode}
                                    disabled={isRunning}
                                >
                                    {isRunning ? 'Running...' : 'Run Code'}
                                </button>
                                <button
                                    className={`px-6 py-2 rounded-lg font-medium ${
                                        isRunning
                                            ? 'bg-red-600 hover:bg-red-700 text-white'
                                            : 'bg-gray-500 cursor-not-allowed text-white'
                                    }`}
                                    onClick={stopExecution}
                                    disabled={!isRunning}
                                >
                                    Stop
                                </button>
                            </div>
                        </div>
                        
                        {/* Code Editor - Now Full Width */}
                        <div className="w-full">
                            <CodeMirror
                                value={code}
                                height="400px"
                                theme={vscodeDark}
                                extensions={getCodeMirrorMode()}
                                onChange={(val) => setCode(val)}
                                className="rounded-lg border border-neutral-200"
                                readOnly={isRunning}
                            />
                        </div>
                    </div>

                    {/* Output Section */}
                    <div>
                        {/* Output Header with Buttons */}
                        <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2">
                                <label className="font-medium text-neutral-700">Output</label>
                                <div className="text-sm text-neutral-500">
                                    {output ? `${output.split('\n').length} lines` : ''}
                                </div>
                                {hasError && (
                                    <button
                                        onClick={analyzeError}
                                        disabled={isAnalyzingError}
                                        className={`px-3 py-1 text-xs rounded-full ${
                                            isAnalyzingError
                                                ? 'bg-gray-500 cursor-not-allowed'
                                                : 'bg-red-600 hover:bg-red-700'
                                        } text-white flex items-center gap-1`}
                                    >
                                        {isAnalyzingError ? (
                                            <>
                                                <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                                </svg>
                                                Analyzing...
                                            </>
                                        ) : (
                                            <>
                                                Solve Issue
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                            
                            {/* Action Buttons moved to top */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setOutput('')}
                                    className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
                                >
                                    Clear Output
                                </button>
                                {/* Test clipboard button */}
                                <button
                                    onClick={() => {
                                        const testText = "Hello, this is a clipboard test!";
                                        const textArea = document.createElement('textarea');
                                        textArea.value = testText;
                                        document.body.appendChild(textArea);
                                        textArea.select();
                                        const success = document.execCommand('copy');
                                        document.body.removeChild(textArea);
                                        console.log('Test copy success:', success);
                                        alert(`Test copy ${success ? 'SUCCESS' : 'FAILED'}. Try pasting somewhere to verify.`);
                                    }}
                                    className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
                                >
                                    Test Copy
                                </button>
                            </div>
                        </div>
                        
                        {/* Output Terminal */}
                        <div className="bg-gray-900 text-white p-4 rounded-lg h-96 overflow-auto mb-4 relative">
                            <pre className="whitespace-pre-wrap font-mono text-sm">{output}</pre>
                            {isRunning && (
                                <div className="absolute bottom-0 left-0 w-full p-2 bg-gray-800">
                                    <input
                                        type="text"
                                        value={terminalInput}
                                        onChange={(e) => setTerminalInput(e.target.value)}
                                        onKeyDown={handleTerminalKeyDown}
                                        onClick={handleTerminalClick}
                                        placeholder="Enter input..."
                                        className="flex-1 p-2 border rounded bg-gray-900 text-white"
                                        autoFocus={isTerminalFocused}
                                        ref={terminalRef}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Error Analysis Modal */}
            {showErrorAnalysis && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="text-lg font-semibold text-gray-800">Error Analysis & Solution</h3>
                            <button
                                onClick={() => setShowErrorAnalysis(false)}
                                className="text-gray-500 hover:text-gray-700 text-xl"
                            >
                                ×
                            </button>
                        </div>
                        <div className="p-4 overflow-auto max-h-[60vh]">
                            <div className="prose max-w-none">
                                <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded border text-gray-800">
                                    {errorAnalysis}
                                </pre>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">
                            <button
                                onClick={() => setShowErrorAnalysis(false)}
                                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                            >
                                Close
                            </button>
                            <button
                                onClick={async () => {
                                    try {
                                        console.log('Attempting to copy code:', errorAnalysis);
                                        console.log('Code length:', errorAnalysis.length);
                                        
                                        // Create a temporary textarea element
                                        const textArea = document.createElement('textarea');
                                        textArea.value = extractCorrectedCode(errorAnalysis);
                                        
                                        // Make sure the textarea is visible and focusable
                                        textArea.style.position = 'absolute';
                                        textArea.style.left = '0px';
                                        textArea.style.top = '0px';
                                        textArea.style.opacity = '0';
                                        textArea.style.pointerEvents = 'none';
                                        
                                        document.body.appendChild(textArea);
                                        
                                        // Focus and select the text
                                        textArea.focus();
                                        textArea.select();
                                        textArea.setSelectionRange(0, textArea.value.length);
                                        
                                        // Try to copy
                                        const successful = document.execCommand('copy');
                                        console.log('Copy command successful:', successful);
                                        
                                        // Clean up
                                        document.body.removeChild(textArea);
                                        
                                        if (successful) {
                                            // Test if it was actually copied by reading clipboard
                                            if (navigator.clipboard && navigator.clipboard.readText) {
                                                try {
                                                    const clipboardText = await navigator.clipboard.readText();
                                                    console.log('Clipboard content:', clipboardText);
                                                    const correctedCode = extractCorrectedCode(errorAnalysis);
                                                    if (clipboardText === correctedCode) {
                                                        // Show options: copy to clipboard OR paste directly to editor
                                                        const choice = confirm('Corrected code copied to clipboard!\n\nClick OK to also paste it directly into the code editor, or Cancel to just keep it in clipboard.');
                                                        if (choice) {
                                                            setCode(correctedCode); // This will update the CodeMirror editor directly
                                                            setShowErrorAnalysis(false); // Close the modal
                                                            alert('Corrected code pasted into editor!');
                                                        }
                                                    } else {
                                                        alert('Code may not have copied correctly. Please try selecting and copying manually.');
                                                    }
                                                } catch (readErr) {
                                                    console.log('Cannot read clipboard, but copy command was successful');
                                                    const correctedCode = extractCorrectedCode(errorAnalysis);
                                                    // Show options: copy to clipboard OR paste directly to editor
                                                    const choice = confirm('Corrected code copied to clipboard!\n\nClick OK to also paste it directly into the code editor, or Cancel to just keep it in clipboard.');
                                                    if (choice) {
                                                        setCode(correctedCode); // This will update the CodeMirror editor directly
                                                        setShowErrorAnalysis(false); // Close the modal
                                                        alert('Corrected code pasted into editor!');
                                                    }
                                                }
                                            } else {
                                                const correctedCode = extractCorrectedCode(errorAnalysis);
                                                // Show options: copy to clipboard OR paste directly to editor
                                                const choice = confirm('Corrected code copied to clipboard!\n\nClick OK to also paste it directly into the code editor, or Cancel to just keep it in clipboard.');
                                                if (choice) {
                                                    setCode(correctedCode); // This will update the CodeMirror editor directly
                                                    setShowErrorAnalysis(false); // Close the modal
                                                    alert('Corrected code pasted into editor!');
                                                }
                                            }
                                        } else {
                                            throw new Error('Copy command failed');
                                        }
                                        
                                    } catch (err) {
                                        console.error('Copy failed:', err);
                                        
                                        // Show the code in a modal for manual copying
                                        const copyModal = document.createElement('div');
                                        copyModal.style.cssText = `
                                            position: fixed;
                                            top: 0;
                                            left: 0;
                                            width: 100%;
                                            height: 100%;
                                            background: rgba(0,0,0,0.8);
                                            display: flex;
                                            align-items: center;
                                            justify-content: center;
                                            z-index: 10000;
                                        `;
                                        
                                        copyModal.innerHTML = `
                                            <div style="background: white; padding: 20px; border-radius: 8px; max-width: 80%; max-height: 80%; overflow: auto;">
                                                <h3 style="margin-top: 0;">Copy Code Manually</h3>
                                                <p>Please select all the code below and copy it (Ctrl+C / Cmd+C):</p>
                                                <textarea readonly style="width: 100%; height: 300px; font-family: monospace; font-size: 14px; padding: 10px; border: 1px solid #ccc;">${extractCorrectedCode(errorAnalysis)}</textarea>
                                                <div style="margin-top: 10px; text-align: right;">
                                                    <button onclick="this.parentElement.parentElement.parentElement.remove()" style="padding: 8px 16px; background: #666; color: white; border: none; border-radius: 4px; cursor: pointer;">Close</button>
                                                </div>
                                            </div>
                                        `;
                                        
                                        document.body.appendChild(copyModal);
                                    }
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Copy Code
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Compiler;