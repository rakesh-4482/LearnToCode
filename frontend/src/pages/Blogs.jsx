import React from "react";
import BlogList from "../components/BlogList";

const Blogs = ({ isAuthenticated, user }) => {
    return (
        <div className="min-h-screen bg-gray-50">
            <BlogList isAuthenticated={isAuthenticated} user={user} />
        </div>
    );
};

export default Blogs;
