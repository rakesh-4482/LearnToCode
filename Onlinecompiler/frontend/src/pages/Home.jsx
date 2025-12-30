import React from "react";
import { Link } from "react-router-dom";
import { 
  Code, 
  Zap, 
  Users, 
  Trophy, 
  BookOpen, 
  MessageCircle, 
  Play, 
  ArrowRight,
  CheckCircle,
  Star,
  Target,
  Brain,
  Rocket,
  Award,
  Code2,
  Lightbulb,
  TrendingUp
} from "lucide-react";

const Home = () => {
  const features = [
    {
      icon: <Code className="h-8 w-8" />,
      title: "Multi-Language Compiler",
      description: "Write and execute code in JavaScript, Python, Java, C++, and C with real-time output and interactive input support."
    },
    {
      icon: <Brain className="h-8 w-8" />,
      title: "AI-Powered Learning",
      description: "Get intelligent hints, error explanations, and personalized recommendations to accelerate your learning journey."
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: "Curated Problems",
      description: "Practice with our carefully selected coding challenges covering arrays, algorithms, data structures, and more."
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Community Discussions",
      description: "Connect with fellow coders, share solutions, ask questions, and learn from the community."
    },
    {
      icon: <Trophy className="h-8 w-8" />,
      title: "Progress Tracking",
      description: "Monitor your coding journey with detailed statistics, achievements, and skill progression."
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Real-Time Execution",
      description: "Experience seamless code execution with WebSocket-powered interactive terminals and instant feedback."
    }
  ];

  const testimonials = [
    {
      name: "Vatsal Singh",
      role: "Software Engineer",
      content: "ByteSmith transformed my coding practice. The AI hints are incredibly helpful, and the community is amazing!",
      rating: 5
    },
    {
      name: "Krishnam",
      role: "CS Student",
      content: "The AI-powered code assistance is incredible! It explains complex algorithms in simple terms and helps me understand my mistakes with detailed feedback.",
      rating: 5
    },
    {
      name: "Shivangi",
      role: "Tech Lead",
      content: "Perfect platform for interview prep. The curated problems cover all the important concepts beautifully.",
      rating: 5
    }
  ];

  const stats = [
    { 
      label: "Coding Problems", 
      value: "150+", 
      icon: <Code2 className="h-6 w-6" />,
      description: "Handpicked problems to build your skills"
    },
    { 
      label: "Languages", 
      value: "5", 
      icon: <Code className="h-6 w-6" />,
      description: "JavaScript, Python, Java, C++, C"
    },
    { 
      label: "Learning Paths", 
      value: "3+", 
      icon: <TrendingUp className="h-6 w-6" />,
      description: "Structured learning journeys"
    },
    { 
      label: "AI Assistance", 
      value: "24/7", 
      icon: <Lightbulb className="h-6 w-6" />,
      description: "Get help when you need it"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <div className="flex justify-center items-center mb-8">
              <div className="bg-white bg-opacity-20 rounded-full p-4 backdrop-blur-sm">
                <Rocket className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Master Coding with
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                ByteSmith
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-indigo-100 mb-8 max-w-4xl mx-auto leading-relaxed">
              An intelligent coding learning platform that combines AI-powered guidance, 
              real-time compilation, and community collaboration to accelerate your programming journey.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Link
                to="/problems"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 rounded-full font-semibold text-lg hover:from-yellow-300 hover:to-orange-300 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <Play className="mr-2 h-5 w-5" />
                Start Coding Now
              </Link>
              <Link
                to="/compiler"
                className="inline-flex items-center px-8 py-4 bg-white bg-opacity-20 text-white rounded-full font-semibold text-lg hover:bg-opacity-30 transition-all duration-300 backdrop-blur-sm border border-white border-opacity-30"
              >
                Try Compiler
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-slate-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-center items-center mb-3">
                  <div className="bg-indigo-100 text-indigo-600 rounded-full p-3">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</div>
                <div className="text-slate-700 font-medium mb-1">{stat.label}</div>
                <div className="text-sm text-slate-500">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Everything You Need to Excel
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              ByteSmith provides a comprehensive learning environment with cutting-edge tools 
              and features designed to make you a better programmer.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-slate-50 rounded-xl p-8 hover:shadow-lg transition-shadow duration-300">
                <div className="text-indigo-600 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Your Learning Journey
            </h2>
            <p className="text-xl text-slate-600">
              Simple steps to master programming with ByteSmith
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-indigo-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Choose a Problem</h3>
              <p className="text-slate-600">
                Browse our curated collection of 50 coding problems across different difficulty levels and topics.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-indigo-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Code & Learn</h3>
              <p className="text-slate-600">
                Use our split-screen interface to read problems and write solutions simultaneously with AI assistance.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-indigo-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Track Progress</h3>
              <p className="text-slate-600">
                Monitor your improvement, earn achievements, and connect with the community for discussions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Loved by Developers
            </h2>
            <p className="text-xl text-slate-600">
              See what our community has to say about ByteSmith
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-slate-50 rounded-xl p-8">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-slate-700 mb-6 italic">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-slate-900">{testimonial.name}</div>
                  <div className="text-slate-600 text-sm">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <Award className="h-16 w-16 mx-auto mb-6 text-yellow-400" />
          </div>
          <h2 className="text-4xl font-bold mb-6">
            Ready to Level Up Your Coding Skills?
          </h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Join thousands of developers who are already mastering programming with ByteSmith. 
            Start your journey today and become the coder you've always wanted to be.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link
              to="/problems"
              className="inline-flex items-center px-8 py-4 bg-white text-indigo-600 rounded-full font-semibold text-lg hover:bg-gray-100 transition-colors duration-300 shadow-lg"
            >
              <Target className="mr-2 h-5 w-5" />
              Explore Problems
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center px-8 py-4 bg-transparent border-2 border-white text-white rounded-full font-semibold text-lg hover:bg-white hover:text-indigo-600 transition-all duration-300"
            >
              Create Account
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
