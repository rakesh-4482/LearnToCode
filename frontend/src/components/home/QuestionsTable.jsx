import { Link } from "react-router-dom";
import { BsInfoCircle } from "react-icons/bs";
import { useState } from "react";
import { BiShow } from "react-icons/bi";
import QuestionModal from "./QuestionModal";

// Import shared utility function
import getDifficultyClasses from "../../utils/getDifficultyClasses";

const QuestionsTable = ({ questions }) => {
    const [selectedQuestion, setSelectedQuestion] = useState(null);

    return (
        <>
            <table className="w-full text-sm">
                {/* Table Headings */}
                <thead>
                    <tr className="bg-gray-100 text-gray-700">
                        <th className="border border-slate-300 py-2">No</th>
                        <th className="border border-slate-300 py-2">Title</th>
                        <th className="border border-slate-300 py-2">
                            Difficulty
                        </th>
                        <th className="border border-slate-300 py-2 max-md:hidden">
                            Topics
                        </th>
                        <th className="border border-slate-300 py-2">
                            Actions
                        </th>
                    </tr>
                </thead>

                {/* Table Body */}
                <tbody>
                    {questions.map((question, index) => (
                        <tr key={question._id} className="even:bg-gray-50">
                            {/* Serial Number */}
                            <td className="border border-slate-200 text-center px-2 py-2">
                                {index + 1}
                            </td>

                            {/* Title */}
                            <td className="border border-slate-200 text-center px-2 py-2">
                                <Link 
                                    to={`/problem/${question.slug}`}
                                    className="text-indigo-600 hover:text-indigo-800 hover:underline font-medium transition-colors"
                                >
                                    {question.title}
                                </Link>
                            </td>

                            {/* Difficulty as pill */}
                            <td className="border border-slate-200 text-center px-2 py-2">
                                <span
                                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize ${getDifficultyClasses(
                                        question.difficulty
                                    )}`}
                                >
                                    {question.difficulty}
                                </span>
                            </td>

                            {/* Topics as pills */}
                            <td className="border border-slate-200 text-center px-2 py-2 max-md:hidden">
                                <div className="flex flex-wrap justify-center gap-1">
                                    {question.topics &&
                                    question.topics.length > 0 ? (
                                        question.topics.map((topic, idx) => (
                                            <span
                                                key={idx}
                                                className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium"
                                            >
                                                {topic}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-gray-400 italic text-xs">
                                            None
                                        </span>
                                    )}
                                </div>
                            </td>

                            {/* Action Icons */}
                            <td className="border border-slate-200 text-center px-2 py-2">
                                <div className="flex justify-center gap-x-3">
                                    <BiShow
                                        className="text-xl text-blue-800 hover:text-black cursor-pointer"
                                        onClick={() =>
                                            setSelectedQuestion(question)
                                        }
                                        title="Quick View"
                                    />
                                    <Link
                                        to={`/questions/hints/${question._id}`}
                                    >
                                        <BsInfoCircle
                                            className="text-xl text-green-800 hover:text-black"
                                            title="Hints"
                                        />
                                    </Link>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Modal Preview */}
            {selectedQuestion && (
                <QuestionModal
                    question={selectedQuestion}
                    onClose={() => setSelectedQuestion(null)}
                />
            )}
        </>
    );
};

export default QuestionsTable;
