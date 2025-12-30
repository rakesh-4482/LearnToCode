import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { FiTag, FiX, FiAlertCircle, FiPlus } from 'react-icons/fi';
import axios from 'axios';
import { API_URL } from '../../../config';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AskQuestion = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [popularTags, setPopularTags] = useState([]);
  const [errors, setErrors] = useState({});
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Fetch popular tags
  useEffect(() => {
    const fetchPopularTags = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/doubts/tags/popular`);
        setPopularTags(response.data.tags);
      } catch (error) {
        console.error('Error fetching popular tags:', error);
        toast.error('Failed to load popular tags');
      }
    };

    fetchPopularTags();
  }, []);

  // Check if user has given consent
  useEffect(() => {
    const checkConsent = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/users/consent`, { 
          withCredentials: true 
        });
        setConsentGiven(response.data.hasConsent);
      } catch (error) {
        console.error('Error checking consent:', error);
        setConsentGiven(false);
      }
    };

    if (currentUser) {
      checkConsent();
    }
  }, [currentUser]);

  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };

  const handleTagInputKeyDown = (e) => {
    if (['Enter', 'Tab', ','].includes(e.key)) {
      e.preventDefault();
      
      const value = tagInput.trim();
      
      if (value && !tags.includes(value)) {
        if (tags.length < 5) {
          setTags([...tags, value.toLowerCase()]);
          setTagInput('');
        } else {
          toast.warning('You can add up to 5 tags');
        }
      }
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagClick = (tag) => {
    if (!tags.includes(tag)) {
      if (tags.length < 5) {
        setTags([...tags, tag]);
      } else {
        toast.warning('You can add up to 5 tags');
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.length < 15) {
      newErrors.title = 'Title must be at least 15 characters';
    }
    
    if (!content.trim()) {
      newErrors.content = 'Question content is required';
    } else if (content.length < 30) {
      newErrors.content = 'Question must be at least 30 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (!consentGiven) {
      setShowConsentModal(true);
      return;
    }
    
    await submitQuestion();
  };
  
  const handleConsent = async (consent) => {
    try {
      await axios.post(
        `${API_URL}/api/users/consent`, 
        { consent },
        { withCredentials: true }
      );
      
      setConsentGiven(consent);
      setShowConsentModal(false);
      
      if (consent) {
        await submitQuestion();
      } else {
        toast.info('Your question was not posted. Consent is required to post questions.');
      }
    } catch (error) {
      console.error('Error updating consent:', error);
      toast.error('Failed to update consent preferences');
    }
  };
  
  const submitQuestion = async () => {
    try {
      setIsSubmitting(true);
      
      const questionData = {
        title,
        content,
        tags,
        isAnonymous: isAnonymous || !consentGiven
      };
      
      const response = await axios.post(
        `${API_URL}/api/doubts`, 
        questionData,
        { withCredentials: true }
      );
      
      toast.success('Question posted successfully!');
      navigate(`/doubts/${response.data.doubt._id}`);
    } catch (error) {
      console.error('Error posting question:', error);
      toast.error(
        error.response?.data?.message || 'Failed to post question. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Ask a Question</h1>
          <p className="mt-2 text-sm text-gray-600">
            Ask a question to the community and get help from other developers
          </p>
        </div>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <form onSubmit={handleSubmit} className="p-6">
            <div className="mb-6">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title
                <span className="text-red-500">*</span>
                <span className="text-xs text-gray-500 ml-1">
                  Be specific and imagine you're asking a question to another person
                </span>
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`mt-1 block w-full rounded-md shadow-sm ${
                  errors.title ? 'border-red-300' : 'border-gray-300'
                } focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                placeholder="e.g., How to implement a binary search tree in JavaScript?"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <FiAlertCircle className="mr-1" /> {errors.title}
                </p>
              )}
            </div>
            
            <div className="mb-6">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                Body
                <span className="text-red-500">*</span>
                <span className="text-xs text-gray-500 ml-1">
                  Include all the information someone would need to answer your question
                </span>
              </label>
              <textarea
                id="content"
                rows={12}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className={`mt-1 block w-full rounded-md shadow-sm ${
                  errors.content ? 'border-red-300' : 'border-gray-300'
                } focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                placeholder="```\n// Include code if relevant\n```"
              />
              {errors.content && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <FiAlertCircle className="mr-1" /> {errors.content}
                </p>
              )}
              <div className="mt-1 text-xs text-gray-500">
                Use Markdown to format your question. You can use ``` for code blocks.
              </div>
            </div>
            
            <div className="mb-6">
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                Tags
                <span className="text-xs text-gray-500 ml-1">
                  Add up to 5 tags to describe what your question is about
                </span>
              </label>
              <div className="mt-1 flex flex-wrap gap-2 items-center p-2 border border-gray-300 rounded-md">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:outline-none"
                    >
                      <FiX className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={tagInput}
                  onChange={handleTagInputChange}
                  onKeyDown={handleTagInputKeyDown}
                  className="flex-1 border-0 p-0 focus:ring-0 sm:text-sm"
                  placeholder="Add tags..."
                  disabled={tags.length >= 5}
                />
              </div>
              <div className="mt-1 text-xs text-gray-500">
                {5 - tags.length} tags remaining. Press Enter or Tab to add a tag.
              </div>
              
              {popularTags.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500 mb-1">Popular tags:</p>
                  <div className="flex flex-wrap gap-1">
                    {popularTags.slice(0, 10).map((tag) => (
                      <button
                        key={tag.name}
                        type="button"
                        onClick={() => handleTagClick(tag.name)}
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          tags.includes(tag.name)
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                        disabled={tags.length >= 5 && !tags.includes(tag.name)}
                      >
                        {tag.name} ({tag.count})
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="anonymous"
                  name="anonymous"
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="anonymous" className="ml-2 block text-sm text-gray-700">
                  Post as anonymous
                </label>
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Posting...' : 'Post Question'}
                </button>
              </div>
            </div>
          </form>
        </div>
        
        {/* Consent Modal */}
        {showConsentModal && (
          <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              
              <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                <div>
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100">
                    <FiAlertCircle className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-5">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Profile Visibility Consent
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        By posting this question, your profile information (username) will be visible to other users. 
                        You can choose to post anonymously, but this will still be associated with your account.
                      </p>
                      <p className="mt-2 text-sm text-gray-500">
                        Do you consent to make your profile visible to other users?
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
                    onClick={() => handleConsent(true)}
                  >
                    Yes, I consent
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                    onClick={() => handleConsent(false)}
                  >
                    No, post anonymously
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AskQuestion;
