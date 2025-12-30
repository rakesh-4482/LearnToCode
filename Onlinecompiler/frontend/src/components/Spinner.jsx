import React from "react";

const Spinner = ({ size = "default", className = "" }) => {
    const sizeClasses = {
        small: "w-4 h-4",
        default: "w-8 h-8",
        large: "w-12 h-12"
    };

    return (
        <div className={`flex items-center justify-center ${className}`}>
            <div className={`spinner ${sizeClasses[size] || sizeClasses.default}`}></div>
        </div>
    );
};

export default Spinner;
