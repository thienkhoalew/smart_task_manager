'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import TaskBoard from '@/components/TaskBoard';
import SmartScheduler from '@/components/SmartScheduler';
import TaskModal from '@/components/TaskModal';
import LoginModal from '@/components/LoginModal';
import { Task } from '@/lib/db';

export default function Home() {
  const [showLoginModal, setShowLoginModal] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Load tasks on mount
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/tasks');
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };


  const handleLogin = () => {
    setShowLoginModal(false);
  };
 
  const handleLogout = () => {
    setShowLoginModal(true);
  };
 
  const handleCreateOrUpdateTask = async (data: any) => {
    try {
      if (editingTask) {
        // Edit Task
        const response = await fetch(`/api/tasks/${editingTask.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
 
        if (response.ok) {
          const updated = await response.json();
          setTasks(tasks.map(t => t.id === updated.id ? updated : t));
        }
      } else {
        // Create Task
        const response = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
 
        if (response.ok) {
          const created = await response.json();
          setTasks([created, ...tasks]);
        }
      }
    } catch (error) {
      console.error('Failed to submit task:', error);
    } finally {
      setIsModalOpen(false);
      setEditingTask(null);
    }
  };
 
  const handleDeleteTask = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa công việc này không?')) return;
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      });
 
      if (response.ok) {
        setTasks(tasks.filter(t => t.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };
 
  const handleUpdateTaskStatus = async (id: string, status: 'todo' | 'in_progress' | 'done') => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
 
      if (response.ok) {
        const updated = await response.json();
        setTasks(tasks.map(t => t.id === updated.id ? updated : t));
      }
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };
 
  // Callback to update state when cards update subtasks internally
  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
  };
 
  // Calculate statistics for the Navbar
  const getStats = () => {
    return {
      total: tasks.length,
      todo: tasks.filter(t => t.status === 'todo').length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      done: tasks.filter(t => t.status === 'done').length,
    };
  };
 
  const handleOpenEditModal = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };
 
  const handleOpenCreateModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };
 
  return (
    <main className="main-wrapper">
      {showLoginModal && <LoginModal onLogin={handleLogin} />}
 
      <Navbar onLogout={handleLogout} />
 
      <div className="content-container">
        <header className="page-header">
          <div className="header-title">
            <div>
              <h2>Bảng Quản Lý Công Việc</h2>
            </div>
          </div>

          <div className="header-actions">

            <button onClick={handleOpenCreateModal} className="add-task-main-btn glow-btn">
              Thêm công việc
            </button>
          </div>
        </header>

        {/* Dashboard Grid layout */}
        <div className="dashboard-grid">
          {isLoading && tasks.length === 0 ? (
            <div className="loading-state">
              <div className="spinner" />
              <span>Đang tải danh sách công việc...</span>
            </div>
          ) : (
            <>
              <div className="board-section">
                <TaskBoard
                  tasks={tasks}
                  onAddTask={handleOpenCreateModal}
                  onEditTask={handleOpenEditModal}
                  onDeleteTask={handleDeleteTask}
                  onUpdateTask={handleUpdateTask}
                  onUpdateTaskStatus={handleUpdateTaskStatus}
                />
              </div>

              <div className="scheduler-section">
                <SmartScheduler tasks={tasks} />
              </div>
            </>
          )}
        </div>
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingTask(null); }}
        onSubmit={handleCreateOrUpdateTask}
        task={editingTask}
      />


    </main>
  );
}
