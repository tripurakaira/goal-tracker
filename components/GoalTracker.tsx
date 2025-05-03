'use client';

import React, { useState, ChangeEvent, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

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
  createdAt: string;
  updatedAt: string;
  achievements: Achievement[];
}

interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  date: string;
  description?: string;
}

interface Comment {
  id: string;
  user: string;
  text: string;
  date: string;
  avatar: string;
  likes: number;
  replies: Reply[];
}

interface Reply {
  id: string;
  user: string;
  text: string;
  date: string;
  avatar: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
}

interface ProgressDataPoint {
  name: string;
  progress: number;
}

interface FormData {
  title: string;
  description: string;
  target: number;
  deadline: string;
  category: string;
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
    createdAt: '2024-01-01',
    updatedAt: '2024-02-20',
    milestones: [
      { id: '1', title: 'Initial Planning', completed: true, date: '2024-01-15', description: 'Complete project planning and requirements gathering' },
      { id: '2', title: 'Development Phase', completed: true, date: '2024-02-28', description: 'Implement core features and functionality' },
      { id: '3', title: 'Testing', completed: false, date: '2024-03-30', description: 'Perform comprehensive testing and bug fixes' },
    ],
    comments: [
      {
        id: '1',
        user: 'John Doe',
        text: 'Great progress so far! Keep up the good work.',
        date: '2024-02-20',
        avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
        likes: 5,
        replies: [
          {
            id: '1',
            user: 'Jane Smith',
            text: 'Agreed! The planning phase was particularly well executed.',
            date: '2024-02-21',
            avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
          },
        ],
      },
    ],
    achievements: [
      {
        id: '1',
        title: 'Planning Master',
        description: 'Completed project planning phase ahead of schedule',
        icon: '🎯',
        unlockedAt: '2024-01-15',
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
    createdAt: '2024-01-01',
    updatedAt: '2024-02-20',
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
        likes: 0,
        replies: [],
      },
    ],
    achievements: [],
  },
];

const progressData: ProgressDataPoint[] = [
  { name: 'Jan', progress: 20 },
  { name: 'Feb', progress: 45 },
  { name: 'Mar', progress: 60 },
  { name: 'Apr', progress: 75 },
  { name: 'May', progress: 90 },
];

const categories = ['Work', 'Learning', 'Personal', 'Health', 'Finance'];

export default function GoalTracker() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'progress' | 'deadline' | 'createdAt'>('progress');
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    target: 100,
    deadline: '',
    category: 'Work',
  });
  const [showAchievements, setShowAchievements] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedGoals = localStorage.getItem('goals');
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    } else {
      setGoals(mockGoals);
      localStorage.setItem('goals', JSON.stringify(mockGoals));
    }
    setIsLoading(false);
  }, []);

  // Save goals to localStorage whenever they change
  useEffect(() => {
    if (goals.length > 0) {
      localStorage.setItem('goals', JSON.stringify(goals));
    }
  }, [goals]);

  const handleAddComment = (goalId: string) => {
    if (!newComment.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    const comment: Comment = {
      id: Date.now().toString(),
      user: 'Current User',
      text: newComment,
      date: new Date().toISOString().split('T')[0],
      avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
      likes: 0,
      replies: [],
    };

    setGoals(goals.map((goal: Goal) => 
      goal.id === goalId 
        ? { ...goal, comments: [...goal.comments, comment] }
        : goal
    ));
    setNewComment('');
    toast.success('Comment added successfully');
  };

  const toggleMilestone = (goalId: string, milestoneId: string) => {
    setGoals(goals.map((goal: Goal) =>
      goal.id === goalId
        ? {
            ...goal,
            milestones: goal.milestones.map((milestone: Milestone) =>
              milestone.id === milestoneId
                ? { ...milestone, completed: !milestone.completed }
                : milestone
            ),
            progress: calculateProgress(goal.milestones.map(m => 
              m.id === milestoneId ? { ...m, completed: !m.completed } : m
            )),
            updatedAt: new Date().toISOString().split('T')[0],
          }
        : goal
    ));
    toast.success('Milestone updated');
  };

  const calculateProgress = (milestones: Milestone[]): number => {
    const completed = milestones.filter(m => m.completed).length;
    return Math.round((completed / milestones.length) * 100);
  };

  const handleCreateGoal = () => {
    if (!formData.title || !formData.description || !formData.deadline) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newGoal: Goal = {
      id: Date.now().toString(),
      ...formData,
      progress: 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      milestones: [],
      comments: [],
      achievements: [],
    };

    setGoals([...goals, newGoal]);
    setShowCreateModal(false);
    setFormData({
      title: '',
      description: '',
      target: 100,
      deadline: '',
      category: 'Work',
    });
    toast.success('Goal created successfully');
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(selectedGoal?.milestones || []);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setGoals(goals.map(goal =>
      goal.id === selectedGoal?.id
        ? { ...goal, milestones: items }
        : goal
    ));
  };

  const filteredAndSortedGoals = goals
    .filter((goal: Goal) => {
      const matchesSearch = goal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          goal.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeTab === 'all' || goal.category.toLowerCase() === activeTab.toLowerCase();
      return matchesSearch && matchesCategory;
    })
    .sort((a: Goal, b: Goal) => {
      switch (sortBy) {
        case 'progress':
          return b.progress - a.progress;
        case 'deadline':
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        case 'createdAt':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-indigo-600">GoalTracker</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search goals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="progress">Sort by Progress</option>
                <option value="deadline">Sort by Deadline</option>
                <option value="createdAt">Sort by Date Created</option>
              </select>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Create Goal
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
                <Line 
                  type="monotone" 
                  dataKey="progress" 
                  stroke="#4F46E5" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex space-x-4 mb-6 overflow-x-auto pb-2">
          {['all', ...categories].map((tab: string) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
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
          {filteredAndSortedGoals.map((goal: Goal) => (
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
                    <motion.div
                      className="bg-indigo-600 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${goal.progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>

                {/* Milestones */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Milestones</h4>
                  <div className="space-y-2">
                    {goal.milestones.map((milestone: Milestone) => (
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
                    {goal.comments.slice(0, 2).map((comment: Comment) => (
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

                {/* Achievements */}
                {goal.achievements.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Achievements</h4>
                    <div className="flex space-x-2">
                      {goal.achievements.map((achievement) => (
                        <div
                          key={achievement.id}
                          className="flex items-center space-x-1 bg-yellow-50 px-2 py-1 rounded-full"
                          title={achievement.description}
                        >
                          <span>{achievement.icon}</span>
                          <span className="text-xs text-yellow-800">{achievement.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedGoal(goal);
                      setShowModal(true);
                    }}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => setShowAchievements(true)}
                    className="px-4 py-2 bg-yellow-500 text-white text-sm font-medium rounded-md hover:bg-yellow-600 transition-colors"
                  >
                    🏆
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Create Goal Modal */}
      <AnimatePresence>
        {showCreateModal && (
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
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full"
            >
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">Create New Goal</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Target</label>
                    <input
                      type="number"
                      value={formData.target}
                      onChange={(e) => setFormData({ ...formData, target: Number(e.target.value) })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Deadline</label>
                    <input
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateGoal}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Create Goal
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Goal Details Modal */}
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
                      <motion.div
                        className="bg-indigo-600 h-3 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${selectedGoal.progress}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Target: {selectedGoal.target}% | Deadline: {selectedGoal.deadline}
                    </p>
                  </div>

                  {/* Milestones Section */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Milestones</h3>
                    <DragDropContext onDragEnd={handleDragEnd}>
                      <Droppable droppableId="milestones">
                        {(provided) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="space-y-3"
                          >
                            {selectedGoal.milestones.map((milestone: Milestone, index: number) => (
                              <Draggable
                                key={milestone.id}
                                draggableId={milestone.id}
                                index={index}
                              >
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                  >
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
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                  </div>

                  {/* Comments Section */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Comments</h3>
                    <div className="space-y-4">
                      {selectedGoal.comments.map((comment: Comment) => (
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
                            <div className="mt-2 flex items-center space-x-4">
                              <button className="text-xs text-gray-500 hover:text-indigo-600">
                                Like ({comment.likes})
                              </button>
                              <button className="text-xs text-gray-500 hover:text-indigo-600">
                                Reply
                              </button>
                            </div>
                            {comment.replies.length > 0 && (
                              <div className="mt-2 ml-4 space-y-2">
                                {comment.replies.map((reply) => (
                                  <div key={reply.id} className="flex space-x-2">
                                    <img
                                      src={reply.avatar}
                                      alt={reply.user}
                                      className="w-6 h-6 rounded-full"
                                    />
                                    <div>
                                      <p className="text-xs font-medium text-gray-900">{reply.user}</p>
                                      <p className="text-xs text-gray-600">{reply.text}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add Comment */}
                    <div className="mt-4">
                      <ReactQuill
                        value={newComment}
                        onChange={setNewComment}
                        placeholder="Add a comment..."
                        className="h-32 mb-4"
                      />
                      <button
                        onClick={() => handleAddComment(selectedGoal.id)}
                        className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors"
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