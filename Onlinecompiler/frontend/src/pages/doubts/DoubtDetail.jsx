import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  FiMessageSquare, 
  FiThumbsUp, 
  FiCheck, 
  FiEdit2, 
  FiTrash2,
  FiArrowLeft,
  FiAlertCircle,
  FiUser,
  FiClock
} from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import { formatDistanceToNow } from 'date-fns';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Helper Components
const VoteControls = ({ onUpvote, onDownvote, votes, isSolution, onMarkAsSolution, showSolutionButton = false }) => (
  <div className="flex flex-col items-center mr-4">
    <button
      onClick={onUpvote}
      className="text-gray-400 hover:text-blue-500 focus:outline-none"
      title="Upvote"
    >
      <FiThumbsUp className="h-5 w-5" />
    </button>
    <span className="text-sm font-medium my-1">{votes || 0}</span>
    <button
      onClick={onDownvote}
      className="text-gray-400 hover:text-red-500 focus:outline-none"
      title="Downvote"
    >
      <FiThumbsUp className="h-5 w-5 transform rotate-180" />
    </button>
    {showSolutionButton && (
      <button
        onClick={onMarkAsSolution}
        className={`mt-2 p-1 rounded-full ${
          isSolution ? 'text-green-500 bg-green-50' : 'text-gray-400 hover:bg-gray-100'
        }`}
        title={isSolution ? 'Marked as solution' : 'Mark as solution'}
      >
        <FiCheck className="h-5 w-5" />
      </button>
    )}
  </div>
);

const UserInfo = ({ user, isAnonymous = false, date, showEdited = false, editDate }) => {
  // Safely parse the date, defaulting to current date if invalid
  const safeDate = date ? new Date(date) : new Date();
  const safeEditDate = editDate ? new Date(editDate) : null;
  
  // Check if dates are valid, if not use current date
  const displayDate = isNaN(safeDate.getTime()) ? new Date() : safeDate;
  const displayEditDate = safeEditDate && !isNaN(safeEditDate.getTime()) ? safeEditDate : null;

  // If user is not provided or isAnonymous is true, show anonymous
  const shouldShowAnonymous = isAnonymous || !user;
  
  // Ensure user object has required fields
  const safeUser = user || {};
  const displayName = safeUser.username || safeUser.name || 'User';
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <div className="flex items-center text-sm text-gray-500">
      {shouldShowAnonymous ? (
        <div className="flex items-center">
          <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 mr-2">
            <FiUser className="h-3 w-3" />
          </div>
          <span>Anonymous</span>
        </div>
      ) : (
        <div className="flex items-center">
          <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-medium mr-2">
            {userInitial}
          </div>
          <Link 
            to={`/profile/${safeUser._id || ''}`}
            className="hover:text-blue-600 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {displayName}
          </Link>
        </div>
      )}
      <span className="mx-2">•</span>
      <div className="flex items-center">
        <FiClock className="h-3 w-3 mr-1" />
        <span title={displayDate.toLocaleString()}>
          {formatDistanceToNow(displayDate, { addSuffix: true })}
        </span>
      </div>
      {showEdited && displayEditDate && (
        <>
          <span className="mx-2">•</span>
          <span className="text-xs text-gray-400" title={`Edited ${formatDistanceToNow(displayEditDate, { addSuffix: true })}`}>
            (edited)
          </span>
        </>
      )}
    </div>
  );
};

const MarkdownContent = ({ content }) => (
  <div className="prose prose-blue max-w-none">
    <ReactMarkdown
      rehypePlugins={[rehypeRaw, rehypeSanitize]}
      remarkPlugins={[remarkGfm]}
      components={{
        a: ({ node, ...props }) => (
          <a 
            {...props} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          />
        ),
        code: ({ node, inline, className, children, ...props }) => {
          const match = /language-(\w+)/.exec(className || '');
          return !inline ? (
            <pre className="bg-gray-50 p-4 rounded-md overflow-x-auto">
              <code className={className} {...props}>
                {children}
              </code>
            </pre>
          ) : (
            <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">
              {children}
            </code>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  </div>
);

const DoubtDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [doubt, setDoubt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAnswerForm, setShowAnswerForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingAnswerId, setEditingAnswerId] = useState(null);

  // Fetch doubt details
  const fetchDoubt = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.get(`/api/doubts/${id}`, {
        withCredentials: true,
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      if (response.data.success) {
        setDoubt(response.data.doubt);
      } else {
        setError(response.data.message || 'Failed to load question');
      }
    } catch (err) {
      console.error('Error fetching doubt:', err);
      
      // Handle specific error cases
      if (err.response) {
        if (err.response.status === 401) {
          // Not authenticated - redirect to login
          navigate('/login', { 
            state: { 
              from: location.pathname,
              message: 'Please sign in to view this question' 
            } 
          });
          return;
        } else if (err.response.status === 403) {
          // Not authorized
          setError('You do not have permission to view this question.');
        } else if (err.response.status === 404) {
          // Not found
          setError('Question not found or has been removed.');
        } else {
          // Other server errors
          setError(err.response.data?.message || 'Failed to load question. Please try again.');
        }
      } else if (err.request) {
        // Network error
        setError('Network error. Please check your connection and try again.');
      } else {
        // Other errors
        setError('An unexpected error occurred. Please try again.');
      }
      
      // Clear any existing doubt data on error
      setDoubt(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoubt();
  }, [id]);

  const isOwner = currentUser && doubt?.student?._id === currentUser._id;
  const isAnswerOwner = (answerUserId) => currentUser?._id === answerUserId;
  const isTeacher = currentUser?.isTeacher;

  // Handle answer submission
  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!answer.trim()) return;

    try {
      setIsSubmitting(true);
      
      if (editingAnswerId) {
        // Update existing answer
        await axios.put(
          `/api/doubts/${id}/answers/${editingAnswerId}`,
          { content: answer },
          { withCredentials: true }
        );
        toast.success('Answer updated successfully');
      } else {
        // Add new answer
        await axios.post(
          `/api/doubts/${id}/answers`,
          { content: answer, isAnonymous: false },
          { withCredentials: true }
        );
        toast.success('Answer submitted successfully');
      }
      
      // Refresh doubt data
      await fetchDoubt();
      setAnswer('');
      setShowAnswerForm(false);
      setEditingAnswerId(null);
    } catch (error) {
      console.error('Error submitting answer:', error);
      toast.error(error.response?.data?.message || 'Failed to submit answer');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle answer deletion
  const handleDeleteAnswer = async (answerId) => {
    if (!window.confirm('Are you sure you want to delete this answer?')) return;
    
    try {
      await axios.delete(
        `/api/doubts/${id}/answers/${answerId}`,
        { withCredentials: true }
      );
      toast.success('Answer deleted successfully');
      await fetchDoubt();
    } catch (error) {
      console.error('Error deleting answer:', error);
      toast.error('Failed to delete answer');
    }
  };

  // Handle voting
  const handleVote = async (answerId, voteType) => {
    if (!currentUser) {
      toast.info('Please login to vote');
      return;
    }
    
    try {
      await axios.post(
        `/api/doubts/${id}/vote`,
        { answerId, voteType },
        { withCredentials: true }
      );
      await fetchDoubt();
    } catch (error) {
      console.error('Error voting:', error);
      toast.error(error.response?.data?.message || 'Failed to record vote');
    }
  };

  // Mark answer as solution
  const handleMarkAsSolution = async (answerId) => {
    try {
      await axios.patch(
        `/api/doubts/${id}/answers/${answerId}/solution`,
        {},
        { withCredentials: true }
      );
      await fetchDoubt();
      toast.success('Marked as solution');
    } catch (error) {
      console.error('Error marking solution:', error);
      toast.error(error.response?.data?.message || 'Failed to mark as solution');
    }
  };

  // Start editing an answer
  const startEditingAnswer = (answer) => {
    setAnswer(answer.content);
    setEditingAnswerId(answer._id);
    setShowAnswerForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cancel editing
  const cancelEditing = () => {
    setAnswer('');
    setEditingAnswerId(null);
    setShowAnswerForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            to="/doubts"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <FiArrowLeft className="mr-1" /> Back to Questions
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <FiAlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Question Section */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
              <div className="px-4 py-5 sm:px-6">
                <div className="flex items-start justify-between">
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">
                    {doubt.title}
                  </h1>
                  {doubt.isResolved && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      <FiCheck className="mr-1" /> Resolved
                    </span>
                  )}
                </div>
                
                <div className="flex items-start mt-2">
                  <VoteControls
                    onUpvote={() => handleVote(null, 'up')}
                    onDownvote={() => handleVote(null, 'down')}
                    votes={doubt.votes}
                    showSolutionButton={false}
                  />
                  <div className="flex-1">
                    <MarkdownContent content={doubt.content} />
                    <div className="mt-4 flex flex-wrap gap-2">
                      {doubt.tags?.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                      <UserInfo 
                        user={doubt.student} 
                        isAnonymous={doubt.isAnonymous} 
                        date={doubt.createdAt}
                        showEdited={doubt.updatedAt > doubt.createdAt}
                        editDate={doubt.updatedAt}
                      />
                      {(isOwner || isTeacher) && !doubt.isResolved && (
                        <button
                          onClick={() => {
                            setDoubt({...doubt, isResolved: true});
                            // Call API to mark as resolved
                            axios.patch(
                              `/api/doubts/${id}/resolve`,
                              { isResolved: true },
                              { withCredentials: true }
                            );
                          }}
                          className="text-sm text-green-600 hover:text-green-800"
                        >
                          Mark as Resolved
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Answers Section */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {doubt.answers?.length || 'No'} Answers
                </h2>
                {!doubt.isResolved && (
                  <button
                    onClick={() => {
                      setShowAnswerForm(true);
                      setEditingAnswerId(null);
                      setAnswer('');
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <FiMessageSquare className="mr-2" /> Post Your Answer
                  </button>
                )}
              </div>

              {/* Answer Form */}
              {showAnswerForm && (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {editingAnswerId ? 'Edit Your Answer' : 'Your Answer'}
                  </h3>
                  <form onSubmit={handleSubmitAnswer}>
                    <div className="mb-4">
                      <textarea
                        rows={8}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md p-3"
                        placeholder="Write your answer here..."
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={cancelEditing}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        {isSubmitting ? 'Submitting...' : 'Post Answer'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Answers List */}
              {doubt.answers?.length > 0 ? (
                <div className="space-y-6">
                  {doubt.answers.map((ans) => (
                    <div 
                      key={ans._id} 
                      className={`bg-white shadow overflow-hidden sm:rounded-lg border-l-4 ${ans.isSolution ? 'border-green-500' : 'border-transparent'}`}
                    >
                      <div className="p-4 sm:p-6">
                        <div className="flex">
                          <VoteControls
                            onUpvote={() => handleVote(ans._id, 'up')}
                            onDownvote={() => handleVote(ans._id, 'down')}
                            votes={ans.votes}
                            isSolution={ans.isSolution}
                            onMarkAsSolution={() => handleMarkAsSolution(ans._id)}
                            showSolutionButton={(isOwner || isTeacher) && !doubt.isResolved}
                          />
                          <div className="flex-1">
                            <MarkdownContent content={ans.content} />
                            <div className="mt-4 flex justify-between items-center">
                              <UserInfo 
                                user={ans.user} 
                                isAnonymous={ans.isAnonymous} 
                                date={ans.createdAt}
                                showEdited={ans.updatedAt > ans.createdAt}
                                editDate={ans.updatedAt}
                              />
                              
                              {(isAnswerOwner(ans.user?._id) || isOwner || isTeacher) && (
                                <div className="flex space-x-3">
                                  {isAnswerOwner(ans.user?._id) && !doubt.isResolved && (
                                    <>
                                      <button
                                        onClick={() => startEditingAnswer(ans)}
                                        className="text-sm text-blue-600 hover:text-blue-800"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        onClick={() => {
                                          if (window.confirm('Are you sure you want to delete this answer?')) {
                                            handleDeleteAnswer(ans._id);
                                          }
                                        }}
                                        className="text-sm text-red-600 hover:text-red-800"
                                      >
                                        Delete
                                      </button>
                                    </>
                                  )}
                                  {ans.isSolution && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      <FiCheck className="mr-1" /> Solution
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white shadow overflow-hidden sm:rounded-lg">
                  <FiMessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No answers yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Be the first to answer this question!
                  </p>
                  {!doubt.isResolved && (
                    <div className="mt-6">
                      <button
                        type="button"
                        onClick={() => setShowAnswerForm(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <FiMessageSquare className="-ml-1 mr-2 h-5 w-5" />
                        Post an Answer
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DoubtDetail;
