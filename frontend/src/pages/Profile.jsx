import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { BACKEND_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import { 
  Code, 
  CheckCircle, 
  XCircle, 
  Zap, 
  Cpu, 
  HardDrive 
} from 'lucide-react';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedProblem, setExpandedProblem] = useState(null);
  const { currentUser, logout } = useAuth();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      
      // 1. First, check if we're authenticated
      console.log('Checking authentication status...');
      
      // 2. Fetch user profile with minimal headers
      console.log('Fetching user profile from:', `${BACKEND_URL}/api/auth/profile`);
      const userResponse = await axios.get(
        `${BACKEND_URL}/api/auth/profile`,
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('User profile response:', userResponse.data);
      
      if (!userResponse.data || !userResponse.data.user) {
        throw new Error('No user data received');
      }
      
      setUser(userResponse.data.user);

      // 3. Fetch solved problems with submissions
      const solvedProblemsUrl = `${BACKEND_URL}/api/users/solved-problems`;
      console.log('Fetching solved problems from:', solvedProblemsUrl);
      
      const solvedResponse = await axios.get(
        solvedProblemsUrl,
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Solved problems response:', solvedResponse.data);
      
      if (solvedResponse.data && solvedResponse.data.success) {
        setSolvedProblems(solvedResponse.data.data || []);
      } else {
        console.warn('Unexpected response format from solved-problems:', solvedResponse.data);
        setError('Could not load solved problems. Please try again later.');
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      
      let errorMessage = 'Failed to load profile data';
      
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
        
        if (error.response.status === 401) {
          errorMessage = 'You need to be logged in to view this page. Please log in and try again.';
          // Redirect to login or show login modal
          // history.push('/login');
        } else if (error.response.status === 404) {
          errorMessage = 'Could not find the requested resource. The endpoint may be incorrect or the server may be misconfigured.';
          console.error('404 Error Details:', error.response.data);
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        console.error('No response received:', error.request);
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        console.error('Error message:', error.message);
        errorMessage = `Request failed: ${error.message}`;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleProblemExpansion = (problemId) => {
    setExpandedProblem(expandedProblem === problemId ? null : problemId);
  };

  const getDifficultyColor = (difficulty) => {
    if (!difficulty) return 'bg-gray-100 text-gray-800';
    
    const difficultyMap = {
      easy: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      hard: 'bg-red-100 text-red-800',
      noob: 'bg-blue-100 text-blue-800',
      god: 'bg-purple-100 text-purple-800',
    };
    
    return difficultyMap[difficulty.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600 text-center">
          <p className="text-xl">{error}</p>
          <button
            onClick={fetchProfile}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-8">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
              <div className="h-24 w-24 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-24 w-24 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold text-indigo-600">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </span>
                )}
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-3xl font-bold text-white">
                  {user?.name}
                </h1>
                <p className="text-indigo-100">@{user?.username}</p>
                <p className="text-indigo-100">{user?.email}</p>
                <div className="mt-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                    <Code className="h-4 w-4 mr-1" />
                    {solvedProblems.length} Problems Solved
                  </span>
                  {user?.isTeacher && (
                    <span className="ml-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                      Teacher
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Profile Actions */}
          <div className="p-4 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-end space-x-3">
              <Link
                to="/profile/edit"
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Edit Profile
              </Link>
              <button
                onClick={logout}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Solved Problems Section */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Solved Problems
            </h2>
          </div>
          
          {solvedProblems.length === 0 ? (
            <div className="p-6 text-center">
              <Code className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">
                No problems solved yet
              </h3>
              <p className="mt-1 text-gray-500">
                Your solved problems will appear here
              </p>
              <div className="mt-6">
                <Link
                  to="/problems"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Zap className="-ml-1 mr-2 h-5 w-5" />
                  Solve Problems
                </Link>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {solvedProblems.map((problem) => (
                <div key={problem._id} className="p-4 hover:bg-gray-50">
                  <div 
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => toggleProblemExpansion(problem._id)}
                  >
                    <div>
                      <h3 className="text-lg font-medium text-indigo-600 hover:text-indigo-800">
                        {problem.title}
                      </h3>
                      <div className="flex items-center mt-1 space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(problem.difficulty)}`}>
                          {problem.difficulty}
                        </span>
                        <span className="text-sm text-gray-500">
                          {problem.submissions?.length || 0} submission{problem.submissions?.length !== 1 ? 's' : ''}
                        </span>
                        {problem.submissions?.[0]?.submittedAt && (
                          <span className="text-sm text-gray-500">
                            Last solved: {new Date(problem.submissions[0].submittedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {problem.topics?.slice(0, 3).map((topic, idx) => (
                          <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="ml-4">
                      <button
                        type="button"
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        {expandedProblem === problem._id ? 'Hide Submissions' : 'View Submissions'}
                      </button>
                    </div>
                  </div>

                  {expandedProblem === problem._id && problem.submissions?.length > 0 && (
                    <div className="mt-4 border-t border-gray-200 pt-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Submissions</h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                When
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Language
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Runtime
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Memory
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Test Cases
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {problem.submissions.map((submission) => (
                              <tr key={submission._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {new Date(submission.submittedAt).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {submission.language}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2 inline-flex text-xs leading-4 font-medium rounded-full ${
                                    submission.status === 'accepted' 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {submission.status === 'accepted' ? (
                                      <CheckCircle className="h-4 w-4 mr-1 inline" />
                                    ) : (
                                      <XCircle className="h-4 w-4 mr-1 inline" />
                                    )}
                                    {submission.status.replace(/_/g, ' ')}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  <div className="flex items-center">
                                    <Cpu className="h-4 w-4 mr-1 text-gray-400" />
                                    {submission.executionTime || 'N/A'} ms
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  <div className="flex items-center">
                                    <HardDrive className="h-4 w-4 mr-1 text-gray-400" />
                                    {submission.memoryUsed ? `${submission.memoryUsed} MB` : 'N/A'}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {submission.testCasesPassed}/{submission.totalTestCases} passed
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
