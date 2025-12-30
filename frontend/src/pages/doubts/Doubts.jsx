import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Plus, Search, MessageSquare, User, Filter, X, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const CreateDoubtModal = ({ isOpen, onClose, onDoubtCreated }) => {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    isAnonymous: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      navigate('/login', { 
        state: { 
          from: location.pathname,
          message: 'Please sign in to ask a question'
        } 
      });
      return;
    }
    
    if (!formData.title.trim() || !formData.content.trim()) {
      setError("Title and content are required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.post(
        '/api/doubts',
        {
          ...formData,
          isPublic: true
        }
      );

      onDoubtCreated(response.data.doubt);
      onClose();
    } catch (error) {
      console.error('Error creating doubt:', error);
      setError(
        error.response?.data?.message ||
        error.message ||
        "Failed to create doubt. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Ask a Question</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              disabled={loading}
            >
              <X size={24} />
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <XCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Question Title *
              </label>
              <input
                type="text"
                name="title"
                id="title"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.title}
                onChange={handleChange}
                disabled={loading}
                placeholder="What's your question? Be specific."
              />
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                Details *
              </label>
              <textarea
                name="content"
                id="content"
                rows={6}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.content}
                onChange={handleChange}
                disabled={loading}
                placeholder="Include all the information someone would need to answer your question"
              />
            </div>

            <div className="flex items-center">
              <input
                id="isAnonymous"
                name="isAnonymous"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                checked={formData.isAnonymous}
                onChange={handleChange}
                disabled={loading}
              />
              <label htmlFor="isAnonymous" className="ml-2 block text-sm text-gray-700">
                Post anonymously (your username won't be shown)
              </label>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={loading}
              >
                {loading ? 'Posting...' : 'Post Question'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const Doubts = () => {
  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMyDoubts, setShowMyDoubts] = useState(false);
  const { currentUser, loading: authLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchDoubts = async () => {
      try {
        setLoading(true);
        
        if (showMyDoubts && !isAuthenticated) {
          return;
        }
        
        const endpoint = showMyDoubts 
          ? '/api/doubts/my-doubts'  
          : '/api/doubts';           
          
        const response = await api.get(endpoint, {
          params: {
            search: searchQuery,
            limit: 50,
            page: 1
          }
        });
        
        const doubtsData = Array.isArray(response.data) 
          ? response.data 
          : (response.data.doubts || []);
          
        setDoubts(doubtsData);
      } catch (error) {
        console.error('Error fetching doubts:', error);
        if (error.response?.status === 401 && showMyDoubts) {
          navigate('/login', { 
            state: { 
              from: location.pathname,
              message: 'Please sign in to view your doubts'
            } 
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDoubts();
  }, [searchQuery, showMyDoubts, isAuthenticated, navigate, location]);

  const handleDoubtCreated = (newDoubt) => {
    setDoubts([newDoubt, ...doubts]);
    setShowCreateModal(false);
  };

  const handleAskQuestion = () => {
    if (!isAuthenticated) {
      navigate('/login', { 
        state: { 
          from: location.pathname,
          message: 'Please sign in to ask a question'
        } 
      });
      return;
    }
    setShowCreateModal(true);
  };

  const toggleMyDoubts = () => {
    if (!isAuthenticated) {
      navigate('/login', { 
        state: { 
          from: location.pathname,
          message: 'Please sign in to view your doubts'
        } 
      });
      return;
    }
    setShowMyDoubts(!showMyDoubts);
  };

  if (authLoading || (loading && !showMyDoubts)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {showMyDoubts ? 'My Doubts' : 'Community Doubts'}
          </h1>
          <p className="text-gray-600 mt-2">
            {showMyDoubts 
              ? 'Questions you\'ve asked to the community'
              : 'Get help from the community with your coding questions'}
          </p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <button
            onClick={toggleMyDoubts}
            className={`px-4 py-2 rounded-md flex items-center gap-2 transition-colors ${
              showMyDoubts
                ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <User size={18} />
            {showMyDoubts ? 'View All Doubts' : 'My Doubts'}
          </button>
          <button
            onClick={handleAskQuestion}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
          >
            <Plus size={18} />
            Ask a Question
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-8">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder={showMyDoubts ? "Search my questions..." : "Search all questions..."}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        {doubts.length > 0 ? (
          doubts.map((doubt) => (
            <div key={doubt._id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
              <Link to={`/doubts/${doubt._id}`} className="block">
                <h3 className="text-xl font-semibold text-blue-600 hover:text-blue-800 mb-2">
                  {doubt.title}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {doubt.content}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{doubt.isAnonymous ? 'Anonymous' : (doubt.student?.username || 'Unknown User')}</span>
                  <span>{new Date(doubt.createdAt).toLocaleDateString()}</span>
                </div>
              </Link>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              {showMyDoubts ? 'You haven\'t asked any questions yet' : 'No questions found'}
            </h3>
            <p className="mt-1 text-gray-500">
              {showMyDoubts 
                ? 'Ask your first question to get help from the community!'
                : 'Be the first to ask a question!'}
            </p>
            {!showMyDoubts && (
              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleAskQuestion}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="-ml-1 mr-2 h-5 w-5" />
                  Ask a Question
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <CreateDoubtModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onDoubtCreated={handleDoubtCreated}
      />
    </div>
  );
};

export default Doubts;
