// src/utils/getDifficultyClasses.js

/**
 * Returns Tailwind classes based on question difficulty.
 * @param {string} difficulty - The difficulty level of the question.
 * @returns {string} Tailwind CSS classes for styling.
 */
const getDifficultyClasses = (difficulty) => {
    switch (difficulty) {
        case "noob":
            return "bg-blue-100 text-blue-500";
        case "easy":
            return "bg-green-100 text-green-600";
        case "medium":
            return "bg-orange-100 text-orange-400";
        case "hard":
            return "bg-red-100 text-red-600";
        case "god":
            return "bg-purple-100 text-purple-600";
        default:
            return "bg-gray-100 text-gray-600";
    }
};

export default getDifficultyClasses;
