import React, { useEffect, useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "../../config.js";
import Spinner from "../components/Spinner";
import QuestionsTable from "../components/home/QuestionsTable";
import QuestionsCard from "../components/home/QuestionsCard";
import { Search, Filter, Grid, List, Code, Target, Trophy, Users } from "lucide-react";

const Problems = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);
  const [difficulty, setDifficulty] = useState("all");
  const [topic, setTopic] = useState("all");
  const [error, setError] = useState(null);

  const fetchProblems = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${BACKEND_URL}/api/questions`, {
        params: { 
          page, 
          limit, 
          search: searchQuery,
          difficulty: difficulty !== 'all' ? difficulty : undefined,
          topic: topic !== 'all' ? topic : undefined
        },
        withCredentials: true,
      });
      setQuestions(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error('Error fetching problems:', err);
      setError('Failed to load problems. Please try again later.');
      setQuestions([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, [page, searchQuery, difficulty, topic]);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'hard': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDifficultyChange = (newDifficulty) => {
    setDifficulty(newDifficulty);
    setPage(1);
  };

  const handleTopicChange = (newTopic) => {
    setTopic(newTopic);
    setPage(1);
  };

  const topics = [
    "all", "Array", "String", "Hash Table", "Math", "Dynamic Programming", 
    "Binary Search", "Two Pointers", "Tree", "Binary Search Tree", 
    "Linked List", "Backtracking", "Graph", "Stack", "Divide and Conquer"
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="flex justify-center items-center mb-6">
              <Code className="h-12 w-12 mr-4" />
              <h1 className="text-4xl md:text-5xl font-bold">Coding Problems</h1>
            </div>
            <p className="text-xl md:text-2xl text-indigo-100 mb-8 max-w-3xl mx-auto">
              Master your programming skills with our curated collection of 50 high-quality coding challenges
            </p>
            <div className="flex justify-center items-center space-x-8 text-indigo-100">
              <div className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                <span>50 Problems</span>
              </div>
              <div className="flex items-center">
                <Trophy className="h-5 w-5 mr-2" />
                <span>3 Difficulty Levels</span>
              </div>
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                <span>Multiple Topics</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Problems Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900">Practice Problems</h2>
            <p className="mt-2 text-lg text-slate-600">Challenge yourself with carefully selected programming problems</p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-2">
            <button
              onClick={() => setView("table")}
              className={`p-2 rounded-lg transition-colors ${
                view === "table"
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-300"
              }`}
              title="Table View"
            >
              <List className="h-5 w-5" />
            </button>
            <button
              onClick={() => setView("card")}
              className={`p-2 rounded-lg transition-colors ${
                view === "card"
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-300"
              }`}
              title="Card View"
            >
              <Grid className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search problems..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </form>

            {/* Difficulty Filter */}
            <select
              value={difficulty}
              onChange={(e) => handleDifficultyChange(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>

            {/* Topic Filter */}
            <select
              value={topic}
              onChange={(e) => handleTopicChange(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {topics.map((t) => (
                <option key={t} value={t}>
                  {t === "all" ? "All Topics" : t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Problems Display */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Spinner />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-slate-400 mb-4">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">{error}</h3>
            <p className="text-slate-600">Try adjusting your search criteria</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-slate-400 mb-4">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No problems found</h3>
            <p className="text-slate-600">Try adjusting your search criteria</p>
          </div>
        ) : (
          <>
            {view === "table" ? (
              <QuestionsTable questions={questions} />
            ) : (
              <QuestionsCard questions={questions} />
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-8">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="px-3 py-2 text-sm font-medium text-slate-500 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNumber = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                  if (pageNumber > totalPages) return null;
                  
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        page === pageNumber
                          ? "bg-indigo-600 text-white"
                          : "text-slate-500 bg-white border border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="px-3 py-2 text-sm font-medium text-slate-500 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Problems;
