import Blog from "../models/blogModel.js";
import { User } from "../models/userModel.js";

// Get all blogs
const getAllBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find()
            .populate("author", "name email")
            .populate("comments.user", "name")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            blogs,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching blogs",
            error: error.message,
        });
    }
};

// Get single blog by ID
const getBlogById = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id)
            .populate("author", "name email")
            .populate("comments.user", "name");

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found",
            });
        }

        res.status(200).json({
            success: true,
            blog,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching blog",
            error: error.message,
        });
    }
};

// Create new blog
const createBlog = async (req, res) => {
    try {
        const { title, content } = req.body;

        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: "Title and content are required",
            });
        }

        const blog = new Blog({
            title,
            content,
            author: req.user.id,
        });

        await blog.save();

        const populatedBlog = await Blog.findById(blog._id).populate(
            "author",
            "name email"
        );

        res.status(201).json({
            success: true,
            message: "Blog created successfully",
            blog: populatedBlog,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error creating blog",
            error: error.message,
        });
    }
};

// Update blog
const updateBlog = async (req, res) => {
    try {
        const { title, content } = req.body;

        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found",
            });
        }

        // Check if user is the author
        if (blog.author.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to update this blog",
            });
        }

        blog.title = title || blog.title;
        blog.content = content || blog.content;

        await blog.save();

        const updatedBlog = await Blog.findById(blog._id).populate(
            "author",
            "name email"
        );

        res.status(200).json({
            success: true,
            message: "Blog updated successfully",
            blog: updatedBlog,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating blog",
            error: error.message,
        });
    }
};

// Delete blog
const deleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found",
            });
        }

        // Check if user is the author
        if (blog.author.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to delete this blog",
            });
        }

        await Blog.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "Blog deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting blog",
            error: error.message,
        });
    }
};

// Like/Unlike blog
const toggleLike = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found",
            });
        }

        const userId = req.user.id;
        const isLiked = blog.likes.includes(userId);

        if (isLiked) {
            // Remove like
            blog.likes = blog.likes.filter((id) => id.toString() !== userId);
        } else {
            // Add like
            blog.likes.push(userId);
        }

        await blog.save();

        res.status(200).json({
            success: true,
            message: isLiked ? "Blog unliked" : "Blog liked",
            likes: blog.likes.length,
            isLiked: !isLiked,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error toggling like",
            error: error.message,
        });
    }
};

// Add comment
const addComment = async (req, res) => {
    try {
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({
                success: false,
                message: "Comment content is required",
            });
        }

        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found",
            });
        }

        const comment = {
            user: req.user.id,
            content,
        };

        blog.comments.push(comment);
        await blog.save();

        const updatedBlog = await Blog.findById(blog._id).populate(
            "comments.user",
            "name"
        );

        res.status(201).json({
            success: true,
            message: "Comment added successfully",
            comment: updatedBlog.comments[updatedBlog.comments.length - 1],
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error adding comment",
            error: error.message,
        });
    }
};

// Delete comment
const deleteComment = async (req, res) => {
    try {
        const { blogId, commentId } = req.params;

        const blog = await Blog.findById(blogId);

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found",
            });
        }

        const comment = blog.comments.id(commentId);

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: "Comment not found",
            });
        }

        // Check if user is the comment author
        if (comment.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to delete this comment",
            });
        }

        blog.comments.pull(commentId);
        await blog.save();

        res.status(200).json({
            success: true,
            message: "Comment deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting comment",
            error: error.message,
        });
    }
};

export {
    getAllBlogs,
    getBlogById,
    createBlog,
    updateBlog,
    deleteBlog,
    toggleLike,
    addComment,
    deleteComment,
};
