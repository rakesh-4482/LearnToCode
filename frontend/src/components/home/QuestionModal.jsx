import { AiOutlineClose } from "react-icons/ai";
import { PiBookOpenTextLight } from "react-icons/pi";
import { BiUserCircle } from "react-icons/bi";
import getDifficultyClasses from "../../utils/getDifficultyClasses";

const QuestionModal = ({ question, onClose }) => {
    return (
        // Modal overlay
        <div
            className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center px-4"
            onClick={onClose}
        >
            {/* Modal box */}
            <div
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-2xl bg-white rounded-2xl p-6 shadow-2xl relative overflow-y-auto max-h-[90vh]"
            >
                {/* Close icon */}
                <AiOutlineClose
                    className="absolute top-4 right-4 text-2xl text-red-600 cursor-pointer"
                    onClick={onClose}
                />

                {/* Title */}
                <h1 className="text-2xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <PiBookOpenTextLight className="text-red-400" />
                    {question.title}
                </h1>

                {/* Difficulty pill and topics pills */}
                <div className="mb-4 flex flex-wrap items-center gap-3">
                    {/* Difficulty Pill */}
                    <span
                        className={`inline-block px-4 py-1 rounded-full text-sm font-semibold capitalize ${getDifficultyClasses(
                            question.difficulty
                        )}`}
                    >
                        {question.difficulty} level
                    </span>

                    {/* Topics Pills */}
                    {question.topics?.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2">
                            {question.topics.map((topic, idx) => (
                                <span
                                    key={idx}
                                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium"
                                >
                                    {topic}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Problem Statement */}
                <div>
                    <h2 className="text-lg font-semibold text-gray-700 mb-1">
                        Problem Statement
                    </h2>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 whitespace-pre-line text-gray-800 font-mono text-sm leading-relaxed">
                        {question.problemStatement}
                    </div>
                </div>

                {/* Examples */}
                {question.examples?.length > 0 && (
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold text-gray-700 mb-1 mt-2">
                            Examples
                        </h2>
                        <div className="space-y-4">
                            {question.examples.map((ex, i) => (
                                <div
                                    key={i}
                                    className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-800 font-mono"
                                >
                                    <p>
                                        <strong>Input:</strong> {ex.input}
                                    </p>
                                    <p>
                                        <strong>Output:</strong> {ex.output}
                                    </p>
                                    {ex.explanation && (
                                        <p>
                                            <strong>Explanation:</strong>{" "}
                                            {ex.explanation}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuestionModal;
