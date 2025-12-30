import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

const AskByteSmith = () => {
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'ai',
            content: "Hi! I'm ByteSmith AI. I can help you with coding problems, explain algorithms, debug code, generate test cases, and provide learning recommendations. What would you like to know?",
            timestamp: new Date()
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedService, setSelectedService] = useState('general');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return;

        const userMessage = {
            id: Date.now(),
            type: 'user',
            content: inputMessage,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);

        try {
            const response = await axios.post('/api/ai/chat', {
                message: inputMessage,
                service: selectedService
            });

            const aiMessage = {
                id: Date.now() + 1,
                type: 'ai',
                content: response.data.response,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error('Error getting AI response:', error);
            const errorMessage = {
                id: Date.now() + 1,
                type: 'ai',
                content: "Sorry, I'm having trouble processing your request right now. Please try again later.",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuickAction = async (actionType, message) => {
        const userMessage = {
            id: Date.now(),
            type: 'user',
            content: message,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
            const response = await axios.post('/api/ai/chat', {
                message: message,
                service: 'general'
            });

            const aiMessage = {
                id: Date.now() + 1,
                type: 'ai',
                content: response.data.response,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error('Error getting AI response:', error);
            const errorMessage = {
                id: Date.now() + 1,
                type: 'ai',
                content: "Sorry, I'm having trouble processing your request right now. Please try again later.",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const quickActions = [
        {
            label: "Interview Tips",
            message: "Give me tips for coding interviews and common algorithm questions I should practice."
        },
        {
            label: "Debug Help",
            message: "I have a bug in my code. Can you help me debug it step by step?"
        },
        {
            label: "Learning Path",
            message: "I'm a beginner. What's the best learning path to become proficient in programming?"
        },
        {
            label: "Algorithm Explain",
            message: "Explain common algorithms like binary search, sorting, and dynamic programming with examples."
        },
        {
            label: "Best Practices",
            message: "What are the coding best practices and clean code principles I should follow?"
        },
        {
            label: "Problem Solving",
            message: "How do I approach solving coding problems systematically? Give me a framework."
        }
    ];

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const clearChat = () => {
        setMessages([
            {
                id: 1,
                type: 'ai',
                content: "Hi! I'm ByteSmith AI. I can help you with coding problems, explain algorithms, debug code, generate test cases, and provide learning recommendations. What would you like to know?",
                timestamp: new Date()
            }
        ]);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50 py-12">
            <div className="max-w-4xl mx-auto px-4">
                <div className="text-center mb-10">
                    <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-2">Ask ByteSmith</h1>
                    <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                        Stuck on a problem? Get instant, AI-powered help and explanations.
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-large border border-neutral-100 overflow-hidden">
                    {/* Quick Actions */}
                    <div className="bg-gray-50 p-4 border-b border-neutral-200">
                        <div className="flex flex-wrap gap-2">
                            {quickActions.map((action, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleQuickAction(action.label, action.message)}
                                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors bg-white text-neutral-600 hover:bg-neutral-100`}
                                >
                                    {action.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Chat Messages */}
                    <div className="h-96 overflow-y-auto p-4 space-y-4">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                        message.type === 'user'
                                            ? 'bg-primary-600 text-white'
                                            : 'bg-gray-100 text-neutral-800'
                                    }`}
                                >
                                    <div className="whitespace-pre-wrap">{message.content}</div>
                                    <div className={`text-xs mt-1 ${
                                        message.type === 'user' ? 'text-primary-100' : 'text-neutral-500'
                                    }`}>
                                        {message.timestamp.toLocaleTimeString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-gray-100 text-neutral-800 px-4 py-2 rounded-lg">
                                    <div className="flex items-center space-x-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                                        <span>ByteSmith is thinking...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="border-t border-neutral-200 p-4">
                        <div className="flex gap-2">
                            <textarea
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ask me anything about coding..."
                                className="flex-1 p-3 border border-neutral-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                rows="2"
                                disabled={isLoading}
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!inputMessage.trim() || isLoading}
                                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Send
                            </button>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                            <div className="text-xs text-neutral-500">
                                Press Enter to send, Shift+Enter for new line
                            </div>
                            <button
                                onClick={clearChat}
                                className="text-xs text-neutral-500 hover:text-neutral-700 transition-colors"
                            >
                                Clear Chat
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AskByteSmith;