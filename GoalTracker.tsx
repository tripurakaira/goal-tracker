'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Types
interface Goal {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  deadline: string;
  category: string;
  milestones: Milestone[];
  comments: Comment[];
}

interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  date: string;
}

interface Comment {
  id: string;
  user: string;
  text: string;
  date: string;
  avatar: string;
}

// Mock Data
const mockGoals: Goal[] = [
  {
    id: '1',
    title: 'Complete Project X',
    description: 'Finish the development and deployment of Project X',
    progress: 75,
    target: 100,
    deadline: '2024-04-30',
    category: 'Work',
    milestones: [
      { id: '1', title: 'Initial Planning', completed: true, date: '2024-01-15' },
      { id: '2', title: 'Development Phase', completed: true, date: '2024-02-28' },
      { id: '3', title: 'Testing', completed: false, date: '2024-03-30' },
    ],
    comments: [
      {
        id: '1',
        user: 'John Doe',
        text: 'Great progress so far!',
        date: '2024-02-20',
        avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
      },
    ],
  },
  {
    id: '2',
    title: 'Learn TypeScript',
    description: 'Master TypeScript and build 3 projects',
    progress: 60,
    target: 100,
    deadline: '2024-05-15',
    category: 'Learning',
    milestones: [
      { id: '1', title: 'Basic Concepts', completed: true, date: '2024-01-30' },
      { id: '2', title: 'Advanced Types', completed: true, date: '2024-02-15' },
      { id: '3', title: 'Project Implementation', completed: false, date: '2024-04-15' },
    ],
    comments: [
      {
        id: '1',
        user: 'Jane Smith',
        text: 'Keep up the good work!',
        date: '2024-02-25',
        avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
      },
    ],
  },
];

const progressData = [
  { name: 'Jan', progress: 20 },
  { name: 'Feb', progress: 45 },
  { name: 'Mar', progress: 60 },
  { name: 'Apr', progress: 75 },
  { name: 'May', progress: 90 },
];

export default function GoalTracker() {
  const [goals, setGoals] = useState<Goal[]>(mockGoals);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const handleAddComment = (goalId: string) => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      user: 'Current User',
      text: newComment,
      date: new Date().toISOString().split('T')[0],
      avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
    };

    setGoals(goals.map(goal => 
      goal.id === goalId 
        ? { ...goal, comments: [...goal.comments, comment] }
        : goal
    ));
    setNewComment('');
  };

  const toggleMilestone = (goalId: string, milestoneId: string) => {
    setGoals(goals.map(goal =>
      goal.id === goalId
        ? {
            ...goal,
            milestones: goal.milestones.map(milestone =>
              milestone.id === milestoneId
                ? { ...milestone, completed: !milestone.completed }
                : milestone
            ),
          }
        : goal
    ));
  };

  const filteredGoals = activeTab === 'all' 
    ? goals 
    : goals.filter(goal => goal.category.toLowerCase() === activeTab.toLowerCase());

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-indigo-600">GoalTracker</h1>
            </div>
            <div className="flex space-x-4">
              <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600">
                Dashboard
              </button>
              <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600">
                Reports
              </button>
              <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600">
                Settings
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Overview */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Progress Overview</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="progress" stroke="#4F46E5" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex space-x-4 mb-6">
          {['all', 'work', 'learning', 'personal'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                activeTab === tab
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Goals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGoals.map((goal) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{goal.title}</h3>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800">
                    {goal.category}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-4">{goal.description}</p>
                
                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Progress</span>
                    <span className="text-gray-900 font-medium">{goal.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>

                {/* Milestones */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Milestones</h4>
                  <div className="space-y-2">
                    {goal.milestones.map((milestone) => (
                      <div key={milestone.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={milestone.completed}
                          onChange={() => toggleMilestone(goal.id, milestone.id)}
                          className="h-4 w-4 text-indigo-600 rounded border-gray-300"
                        />
                        <span className={`ml-2 text-sm ${milestone.completed ? 'text-gray-400 line-through' : 'text-gray-600'}`}>
                          {milestone.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Comments Preview */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Recent Comments</h4>
                  <div className="space-y-2">
                    {goal.comments.slice(0, 2).map((comment) => (
                      <div key={comment.id} className="flex items-start space-x-2">
                        <img
                          src={comment.avatar}
                          alt={comment.user}
                          className="w-6 h-6 rounded-full"
                        />
                        <div>
                          <p className="text-xs font-medium text-gray-900">{comment.user}</p>
                          <p className="text-xs text-gray-600">{comment.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedGoal(goal);
                    setShowModal(true);
                  }}
                  className="w-full mt-4 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors"
                >
                  View Details
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Modal */}
      <AnimatePresence>
        {showModal && selectedGoal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">{selectedGoal.title}</h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Progress Section */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Progress</h3>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-indigo-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${selectedGoal.progress}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Target: {selectedGoal.target}% | Deadline: {selectedGoal.deadline}
                    </p>
                  </div>

                  {/* Milestones Section */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Milestones</h3>
                    <div className="space-y-3">
                      {selectedGoal.milestones.map((milestone) => (
                        <div key={milestone.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={milestone.completed}
                              onChange={() => toggleMilestone(selectedGoal.id, milestone.id)}
                              className="h-4 w-4 text-indigo-600 rounded border-gray-300"
                            />
                            <span className={`ml-2 ${milestone.completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                              {milestone.title}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">{milestone.date}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Comments Section */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Comments</h3>
                    <div className="space-y-4">
                      {selectedGoal.comments.map((comment) => (
                        <div key={comment.id} className="flex space-x-3">
                          <img
                            src={comment.avatar}
                            alt={comment.user}
                            className="w-8 h-8 rounded-full"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium text-gray-900">{comment.user}</h4>
                              <span className="text-xs text-gray-500">{comment.date}</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{comment.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add Comment */}
                    <div className="mt-4">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        rows={3}
                      />
                      <button
                        onClick={() => handleAddComment(selectedGoal.id)}
                        className="mt-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors"
                      >
                        Post Comment
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              © 2024 GoalTracker. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-gray-500">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
