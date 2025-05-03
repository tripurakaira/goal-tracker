'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Goal {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

export default function GoalTracker() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoal, setNewGoal] = useState('');

  useEffect(() => {
    const savedGoals = localStorage.getItem('goals');
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('goals', JSON.stringify(goals));
  }, [goals]);

  const addGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.trim()) {
      toast.error('Please enter a goal!');
      return;
    }
    const goal: Goal = {
      id: Date.now().toString(),
      text: newGoal.trim(),
      completed: false,
      createdAt: new Date(),
    };
    setGoals([...goals, goal]);
    setNewGoal('');
    toast.success('Goal added successfully!');
  };

  const toggleGoal = (id: string) => {
    setGoals(
      goals.map((goal) =>
        goal.id === id ? { ...goal, completed: !goal.completed } : goal
      )
    );
  };

  const deleteGoal = (id: string) => {
    setGoals(goals.filter((goal) => goal.id !== id));
    toast.info('Goal deleted!');
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    const items = Array.from(goals);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setGoals(items);
  };

  const completedGoals = goals.filter((goal) => goal.completed).length;
  const progress = goals.length ? (completedGoals / goals.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 p-8">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Goal Tracker</h1>
          
          <div className="mb-6">
            <div className="h-4 bg-gray-200 rounded-full">
              <motion.div
                className="h-4 bg-green-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Progress: {completedGoals} of {goals.length} goals completed
            </p>
          </div>

          <form onSubmit={addGoal} className="mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                placeholder="Add a new goal..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Add
              </motion.button>
            </div>
          </form>

          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="goals">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  <AnimatePresence>
                    {goals.map((goal, index) => (
                      <Draggable
                        key={goal.id}
                        draggableId={goal.id}
                        index={index}
                      >
                        {(provided) => (
                          <motion.div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="mb-3"
                          >
                            <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg">
                              <input
                                type="checkbox"
                                checked={goal.completed}
                                onChange={() => toggleGoal(goal.id)}
                                className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                              />
                              <span
                                className={`flex-1 ${
                                  goal.completed ? 'line-through text-gray-500' : 'text-gray-800'
                                }`}
                              >
                                {goal.text}
                              </span>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => deleteGoal(goal.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                Delete
                              </motion.button>
                            </div>
                          </motion.div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </AnimatePresence>
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </motion.div>
      </div>
      <ToastContainer position="bottom-right" />
    </div>
  );
}
