import { useState } from "react";
import { Link } from "react-router-dom";
import { PiBookOpenTextLight } from "react-icons/pi";
import { BiShow } from "react-icons/bi";
import { AiOutlineEdit } from "react-icons/ai";
import { BsInfoCircle } from "react-icons/bs";
import { MdOutlineDelete } from "react-icons/md";
import QuestionModal from "./QuestionModal";
import getDifficultyClasses from "../../utils/getDifficultyClasses";

const QuestionSingleCard = ({ question }) => {
    const [showModal, setShowModal] = useState(false);

    return (
        <div className="border border-gray-300 rounded-xl p-3 shadow-sm hover:shadow-lg transition-shadow duration-300 bg-white relative">
            {/* Title */}
            <div className="flex items-center gap-2 mb-2">
                <PiBookOpenTextLight className="text-red-400 text-xl" />
                <Link 
                    to={`/problem/${question.slug}`}
                    className="text-lg font-semibold text-gray-900 hover:text-indigo-600 transition-colors"
                >
                    {question.title}
                </Link>
            </div>

            {/* Difficulty + Topics */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
                <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${getDifficultyClasses(
                        question.difficulty
                    )}`}
                >
                    {question.difficulty}
                </span>
                {question.topics?.map((topic, idx) => (
                    <span
                        key={idx}
                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium"
                    >
                        {topic}
                    </span>
                ))}
            </div>

            {/* Action icons */}
            <div className="flex justify-end gap-2 mt-2">
                <BiShow
                    className="text-xl text-blue-800 hover:text-black cursor-pointer"
                    onClick={() => setShowModal(true)}
                    title="Quick View"
                />

                <Link to={`/questions/details/${question._id}`}>
                    <BsInfoCircle
                        className="text-xl text-green-800 hover:text-black"
                        title="Details"
                    />
                </Link>

                <Link to={`/questions/edit/${question._id}`}>
                    <AiOutlineEdit
                        className="text-xl text-yellow-600 hover:text-black"
                        title="Edit"
                    />
                </Link>

                <Link to={`/questions/delete/${question._id}`}>
                    <MdOutlineDelete
                        className="text-xl text-red-600 hover:text-black"
                        title="Delete"
                    />
                </Link>
            </div>

            {/* Modal for quick view */}
            {showModal && (
                <QuestionModal
                    question={question}
                    onClose={() => setShowModal(false)}
                />
            )}
        </div>
    );
};

export default QuestionSingleCard;
