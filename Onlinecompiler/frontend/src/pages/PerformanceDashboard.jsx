import React, { useState, useEffect } from 'react';
import { 
    PieChart, 
    Pie, 
    ResponsiveContainer, 
    Cell, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend
} from 'recharts';
import axios from 'axios';
import { 
    Trophy, 
    Clock, 
    Activity, 
    CheckCircle, 
    XCircle, 
    TrendingUp, 
    Code2,
    BarChart2 as BarChartIcon,
    PieChart as PieChartIcon,
    Award,
    Calendar,
    Code as CodeIcon
} from 'lucide-react';
import { BACKEND_URL } from '../../config';
import Spinner from '../components/Spinner';

// Debug function to log with timestamp
const debugLog = (...args) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}]`, ...args);
};

const PerformanceDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        totalSolved: 0,
        successRate: 0,
        avgRuntime: 0,
        totalSubmissions: 0,
        submissionTrend: [],
        languageDistribution: [],
        difficultyDistribution: [],
        difficultyStats: { easy: {}, medium: {}, hard: {}},
        recentActivity: []
    });
    const [timeRange, setTimeRange] = useState('all');

    useEffect(() => {
        const fetchPerformanceData = async () => {
            console.log('[PerformanceDashboard] Fetching performance data...');
            setLoading(true);
            
            try {
                const response = await axios.get(
                    `${BACKEND_URL}/api/users/performance`,
                    { 
                        params: { timeRange },
                        withCredentials: true,
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        }
                    }
                );

                console.log('[PerformanceDashboard] Data received:', response.data);
                
                if (response.data && response.data.success) {
                    setStats(prev => ({
                        ...prev,
                        ...response.data.data
                    }));
                    setError(null);
                } else {
                    throw new Error('Invalid response format');
                }
            } catch (err) {
                console.error('[PerformanceDashboard] Error:', {
                    message: err.message,
                    response: err.response?.data,
                    status: err.response?.status
                });
                setError(err.response?.data?.message || 'Failed to load performance data');
            } finally {
                setLoading(false);
            }
        };

        fetchPerformanceData();
    }, [timeRange]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading performance data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md">
                    <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Dashboard</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Performance Dashboard</h1>
                        <p className="mt-2 text-sm text-gray-600">Track your coding progress and statistics</p>
                    </div>
                    <div className="mt-4 md:mt-0">
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        >
                            <option value="week">Last 7 days</option>
                            <option value="month">Last 30 days</option>
                            <option value="all">All time</option>
                        </select>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 gap-5 mt-6 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard 
                        title="Problems Solved" 
                        value={stats.totalSolved} 
                        icon={<Trophy className="h-6 w-6 text-blue-500" />}
                    />
                    <StatCard 
                        title="Success Rate" 
                        value={`${stats.successRate}%`} 
                        icon={<CheckCircle className="h-6 w-6 text-green-500" />}
                    />
                    <StatCard 
                        title="Avg. Runtime" 
                        value={`${stats.avgRuntime}ms`} 
                        icon={<Clock className="h-6 w-6 text-yellow-500" />}
                    />
                    <StatCard 
                        title="Total Submissions" 
                        value={stats.totalSubmissions} 
                        icon={<Activity className="h-6 w-6 text-purple-500" />}
                    />
                </div>

                {/* Charts and Activity Grid */}
                <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Difficulty Distribution */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Difficulty Distribution</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats.difficultyDistribution}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {stats.difficultyDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={[
                                                '#10B981', // green for easy
                                                '#F59E0B', // yellow for medium
                                                '#EF4444'  // red for hard
                                            ][index % 3] || '#8884d8'} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white p-6 rounded-lg shadow lg:col-span-2">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                        <div className="space-y-4">
                            {stats.recentActivity.length > 0 ? (
                                stats.recentActivity.map((activity, index) => (
                                    <div key={index} className="flex items-start pb-4 border-b border-gray-200 last:border-0 last:pb-0">
                                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                            <Code2 className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">
                                                {activity.problemTitle}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {activity.language} • {activity.status}
                                            </div>
                                            <div className="mt-1 text-xs text-gray-500">
                                                {new Date(activity.timestamp).toLocaleString()}
                                            </div>
                                        </div>
                                        <div className="ml-auto text-sm font-medium">
                                            {activity.runtime}ms
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-center py-4">No recent activity found</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon }) => (
    <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
            <div className="flex items-center">
                <div className="flex-shrink-0">
                    {icon}
                </div>
                <div className="ml-5 w-0 flex-1">
                    <dt className="text-sm font-medium text-gray-500 truncate">
                        {title}
                    </dt>
                    <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                            {value}
                        </div>
                    </dd>
                </div>
            </div>
        </div>
    </div>
);

export default PerformanceDashboard;
