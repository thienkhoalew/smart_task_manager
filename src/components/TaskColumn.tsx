'use client';

import React from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { Plus } from 'lucide-react';
import { Task } from '@/lib/db';
import TaskCard from './TaskCard';

interface TaskColumnProps {
  id: 'todo' | 'in_progress' | 'done';
  title: string;
  tasks: Task[];
  onAddTask?: () => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onUpdateTask: (task: Task) => void;
}

export default function TaskColumn({
  id,
  title,
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onUpdateTask,
}: TaskColumnProps) {
  const { setNodeRef } = useDroppable({ id });

  const getHeaderColorClass = (colId: string) => {
    if (colId === 'todo') return 'header-todo';
    if (colId === 'in_progress') return 'header-progress';
    return 'header-done';
  };

  return (
    <div className="task-column">
      <div className={`column-header ${getHeaderColorClass(id)}`}>
        <div className="header-left">
          <h2>{title}</h2>
          <span className="task-count">{tasks.length}</span>
        </div>
        {id === 'todo' && onAddTask && (
          <button 
            onClick={onAddTask} 
            className="add-task-btn" 
            title="Thêm công việc mới"
          >
            <Plus size={16} />
          </button>
        )}
      </div>

      {/* Wrapping tasks list in SortableContext */}
      <SortableContext 
        items={tasks.map(t => t.id)} 
        strategy={verticalListSortingStrategy}
      >
        <div ref={setNodeRef} className="column-tasks-container">

          {tasks.length > 0 ? (
            <div className="tasks-list">
              {tasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                  onUpdateTask={onUpdateTask}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span>Chưa có công việc</span>
            </div>
          )}
        </div>
      </SortableContext>

      <style jsx>{`
        .task-column {
          flex: 1;
          min-width: 300px;
          background: var(--bg-tertiary);
          border-radius: 16px;
          border: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          max-height: 80vh;
          overflow: hidden;
        }

        .column-header {
          padding: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 2px solid var(--border-color);
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .col-icon {
          font-size: 16px;
        }

        .column-header h2 {
          font-size: 15px;
          font-weight: 700;
          color: var(--text-primary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .task-count {
          font-size: 11px;
          font-weight: 700;
          background: var(--bg-secondary);
          color: var(--text-secondary);
          padding: 2px 8px;
          border-radius: 12px;
          border: 1px solid var(--border-color);
        }

        /* Header accents */
        .header-todo {
          border-bottom-color: var(--primary);
        }
        
        .header-progress {
          border-bottom-color: var(--warning);
        }
        
        .header-done {
          border-bottom-color: var(--success);
        }

        .add-task-btn {
          background: var(--primary-glow);
          border: 1px solid rgba(99, 102, 241, 0.1);
          color: var(--primary);
          cursor: pointer;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .add-task-btn:hover {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
        }

        .column-tasks-container {
          padding: 16px;
          overflow-y: auto;
          flex: 1;
        }

        .tasks-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .empty-state {
          height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px dashed var(--border-color);
          border-radius: 12px;
          color: var(--text-muted);
          font-size: 13px;
        }

        @media (max-width: 992px) {
          .task-column {
            max-height: 500px;
          }
        }
      `}</style>
    </div>
  );
}
