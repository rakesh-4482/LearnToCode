// Importing necessary icons and components
import { Link } from "react-router-dom";
import { PiBookOpenTextLight } from "react-icons/pi";
import { BiUserCircle } from "react-icons/bi";
import { AiOutlineEdit } from "react-icons/ai";
import { BsInfoCircle } from "react-icons/bs";
import { MdOutlineDelete } from "react-icons/md";

// Importing the child component that represents a single question card
import QuestionSingleCard from "./QuestionSingleCard";

/**
 * Component to render a responsive grid of individual question cards
 * @param {Array} questions - List of question objects to display
 */
const QuestionsCard = ({ questions }) => {
    return (
        // Responsive grid:
        // 1 column on small screens,
        // 2 columns on small+,
        // 3 columns on large screens,
        // 4 columns on extra-large screens
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Loop through each question and render a QuestionSingleCard */}
            {questions.map((item) => (
                <QuestionSingleCard key={item._id} question={item} />
            ))}
        </div>
    );
};

export default QuestionsCard;
