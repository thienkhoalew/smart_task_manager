'use client';

import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task, Subtask } from '@/lib/db';
import { Calendar, Trash2, Edit3, CheckSquare, Square, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onUpdateTask: (task: Task) => void;
}

export default function TaskCard({ task, onEdit, onDelete, onUpdateTask }: TaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  
  // Drag and drop setup using @dnd-kit/sortable
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 10 : 1,
  };

  // Toggle completion of a subtask
  const handleToggleSubtask = async (sub: Subtask) => {
    try {
      const response = await fetch('/api/tasks/subtasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: sub.id,
          is_completed: !sub.is_completed,
        }),
      });

      if (response.ok) {
        const updatedSub = await response.json();
        const updatedSubtasks = (task.subtasks || []).map(s => 
          s.id === updatedSub.id ? updatedSub : s
        );
        const allDone = updatedSubtasks.length > 0 && updatedSubtasks.every(s => s.is_completed);
        const targetStatus = allDone ? 'done' : task.status;
        onUpdateTask({
          ...task,
          status: targetStatus,
          subtasks: updatedSubtasks,
        });
      }
    } catch (error) {
      console.error('Failed to toggle subtask:', error);
    }
  };

  // Add subtask inline
  const handleAddSubtaskInline = async (title: string) => {
    try {
      const response = await fetch('/api/tasks/subtasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task_id: task.id,
          title,
        }),
      });

      if (response.ok) {
        const newSub = await response.json();
        onUpdateTask({
          ...task,
          subtasks: [...(task.subtasks || []), newSub],
        });
      }
    } catch (error) {
      console.error('Failed to add subtask inline:', error);
    }
  };

  // Call AI API to break down the task
  const handleAiBreakdown = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAiLoading(true);
    setAiError('');
    try {
      const response = await fetch('/api/ai/breakdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: task.title,
          description: task.description,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Không thể dùng AI để chia subtask');
      }

      const suggestedTitles = data.subtasks as string[];
      
      // Add suggested subtasks to DB
      const createdSubtasks: Subtask[] = [];
      for (const title of suggestedTitles) {
        const subResp = await fetch('/api/tasks/subtasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            task_id: task.id,
            title,
          }),
        });
        if (subResp.ok) {
          const newSub = await subResp.json();
          createdSubtasks.push(newSub);
        }
      }

      onUpdateTask({
        ...task,
        subtasks: [...(task.subtasks || []), ...createdSubtasks],
      });
      setIsExpanded(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể dùng AI để chia subtask';
      setAiError(message);
      console.error('Failed to load AI breakdown:', error);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Calculate remaining time and styling class
  const getDeadlineText = (deadlineStr: string) => {
    const deadline = new Date(deadlineStr);
    const now = new Date();
    const diffMs = deadline.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / (60000 * 60));
    const diffDays = Math.floor(diffMs / (60000 * 60 * 24));

    if (diffMs < 0) {
      const absMins = Math.abs(diffMins);
      if (absMins < 60) return { text: `Quá hạn ${absMins} phút`, class: 'deadline-overdue' };
      const absHours = Math.floor(absMins / 60);
      if (absHours < 24) return { text: `Quá hạn ${absHours} giờ`, class: 'deadline-overdue' };
      return { text: `Quá hạn ${Math.floor(absHours / 24)} ngày`, class: 'deadline-overdue' };
    }

    if (diffDays > 0) {
      const remainingHours = diffHours % 24;
      const text = remainingHours > 0 
        ? `Còn ${diffDays} ngày ${remainingHours}g` 
        : `Còn ${diffDays} ngày`;
      return { 
        text, 
        class: diffDays <= 1 ? 'deadline-imminent' : diffDays <= 3 ? 'deadline-soon' : 'deadline-normal' 
      };
    }
    
    if (diffHours > 0) {
      const remainingMins = diffMins % 60;
      const text = remainingMins > 0 
        ? `Còn ${diffHours} giờ ${remainingMins}p` 
        : `Còn ${diffHours} giờ`;
      return { text, class: 'deadline-imminent' };
    }

    return { text: `Còn ${diffMins} phút!`, class: 'deadline-urgent' };
  };

  const deadlineInfo = getDeadlineText(task.deadline);
  
  const totalSubtasks = task.subtasks?.length || 0;
  const completedSubtasks = task.subtasks?.filter(s => s.is_completed).length || 0;
  const progressPercent = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  const getPriorityClass = (priority: number) => {
    if (priority <= 3) return 'badge-low';
    if (priority <= 7) return 'badge-medium';
    return 'badge-high';
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="task-card"
    >
      <div 
        className="card-drag-area" 
        {...attributes} 
        {...listeners}
        title="Kéo thả để di chuyển trạng thái"
      />

      <div className="card-content">
        <div className="card-header">
          <span className={`priority-badge ${getPriorityClass(task.priority)}`}>
            P{task.priority}
          </span>
          <div className="card-actions">
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit(task); }} 
              className="action-btn"
              title="Chỉnh sửa"
            >
              <Edit3 size={14} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(task.id); }} 
              className="action-btn hover-danger"
              title="Xóa"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        <h3 className="task-title">{task.title}</h3>
        
        {task.description && (
          <p className="task-desc">{task.description}</p>
        )}

        {task.status !== 'done' && (
          <div className="card-info">
            <div className={`deadline-badge ${deadlineInfo.class}`}>
              <Calendar size={12} />
              <span>{deadlineInfo.text}</span>
            </div>
          </div>
        )}

        <div className="subtasks-section">
          {totalSubtasks > 0 ? (
            <div className="progress-container" onClick={() => setIsExpanded(!isExpanded)}>
              <div className="progress-label">
                <span>Tiến độ ({completedSubtasks}/{totalSubtasks})</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
              </div>
              <button className="expand-subtasks-btn" aria-label="Toggle Subtasks">
                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>
          ) : (
            <button 
              onClick={handleAiBreakdown} 
              className="ai-suggest-btn glow-btn"
              disabled={isAiLoading}
            >
              {isAiLoading ? (
                <>
                  <Loader2 size={12} className="spin" />
                  <span>AI đang phân tích...</span>
                </>
              ) : (
                <>
                  <span>AI gợi ý phân rã công việc</span>
                </>
              )}
            </button>
          )}

          {aiError && <p className="ai-error">{aiError}</p>}

          {isExpanded && totalSubtasks > 0 && (
            <div className="subtask-checklist">
              {task.subtasks?.map(sub => (
                <div 
                  key={sub.id} 
                  className={`subtask-checkbox-item ${sub.is_completed ? 'completed' : ''}`}
                  onClick={() => handleToggleSubtask(sub)}
                >
                  {sub.is_completed ? (
                    <CheckSquare size={14} className="checkbox-icon checked" />
                  ) : (
                    <Square size={14} className="checkbox-icon" />
                  )}
                  <span>{sub.title}</span>
                </div>
              ))}
              <div className="inline-add-subtask">
                <input
                  type="text"
                  placeholder="Thêm bước mới..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const val = (e.target as HTMLInputElement).value.trim();
                      if (val) {
                        handleAddSubtaskInline(val);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .task-card {
          background: var(--bg-secondary);
          border-radius: 12px;
          border: 1px solid var(--border-color);
          box-shadow: var(--shadow-sm);
          position: relative;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transition: border-color var(--transition-speed) ease, box-shadow var(--transition-speed) ease;
        }

        .task-card:hover {
          border-color: var(--primary);
          box-shadow: var(--shadow-md);
        }

        .card-drag-area {
          height: 10px;
          background: var(--border-color);
          cursor: grab;
          opacity: 0.3;
          transition: opacity 0.2s;
        }

        .task-card:hover .card-drag-area {
          opacity: 0.8;
          background: linear-gradient(90deg, var(--primary) 0%, var(--primary-hover) 100%);
        }

        .card-content {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .priority-badge {
          font-size: 10px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 6px;
        }

        .badge-low {
          background: rgba(16, 185, 129, 0.1);
          color: var(--success);
        }

        .badge-medium {
          background: rgba(245, 158, 11, 0.1);
          color: var(--warning);
        }

        .badge-high {
          background: rgba(239, 68, 68, 0.1);
          color: var(--danger);
        }

        .card-actions {
          display: flex;
          gap: 4px;
        }

        .action-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .action-btn:hover {
          background: var(--bg-tertiary);
          color: var(--text-primary);
        }

        .action-btn.hover-danger:hover {
          color: var(--danger);
          background: rgba(239, 68, 68, 0.1);
        }

        .task-title {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1.4;
          word-break: break-word;
        }

        .task-desc {
          font-size: 13px;
          color: var(--text-secondary);
          word-break: break-word;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .card-info {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .deadline-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 500;
          padding: 4px 8px;
          border-radius: 6px;
          border: 1px solid transparent;
        }

        .deadline-normal {
          background: var(--bg-tertiary);
          color: var(--text-secondary);
        }

        .deadline-soon {
          background: rgba(245, 158, 11, 0.05);
          color: var(--warning);
          border-color: rgba(245, 158, 11, 0.1);
        }

        .deadline-imminent {
          background: rgba(239, 68, 68, 0.05);
          color: var(--danger);
          border-color: rgba(239, 68, 68, 0.15);
        }

        .deadline-urgent {
          background: var(--danger);
          color: white;
          animation: pulse 1s infinite alternate;
        }

        .deadline-overdue {
          background: rgba(239, 68, 68, 0.15);
          color: var(--danger);
          border: 1px solid var(--danger);
          font-weight: 700;
        }

        @keyframes pulse {
          from { opacity: 0.85; }
          to { opacity: 1; }
        }

        /* Subtask styles */
        .subtasks-section {
          border-top: 1px dashed var(--border-color);
          padding-top: 12px;
          margin-top: 4px;
        }

        .progress-container {
          display: flex;
          flex-direction: column;
          gap: 6px;
          cursor: pointer;
          position: relative;
          padding-right: 20px;
        }

        .progress-label {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .progress-bar-bg {
          width: 100%;
          height: 6px;
          background: var(--bg-tertiary);
          border-radius: 3px;
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          background: var(--success);
          border-radius: 3px;
          transition: width 0.3s ease;
        }

        .expand-subtasks-btn {
          position: absolute;
          right: 0;
          bottom: 2px;
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
        }

        .ai-suggest-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          width: 100%;
          padding: 8px 12px;
          background: var(--primary-glow);
          color: var(--primary);
          border: 1px solid rgba(99, 102, 241, 0.2);
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }

        .ai-suggest-btn:hover {
          background: var(--primary);
          color: white;
        }

        .ai-error {
          margin-top: 8px;
          color: var(--danger);
          font-size: 12px;
          font-weight: 600;
        }

        .subtask-checklist {
          margin-top: 10px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding-left: 4px;
        }

        .subtask-checkbox-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          cursor: pointer;
          color: var(--text-secondary);
          user-select: none;
          padding: 4px 6px;
          border-radius: 4px;
        }

        .subtask-checkbox-item:hover {
          background: var(--bg-tertiary);
          color: var(--text-primary);
        }

        .subtask-checkbox-item.completed {
          color: var(--text-muted);
          text-decoration: line-through;
        }

        .checkbox-icon {
          flex-shrink: 0;
          color: var(--text-muted);
        }

        .checkbox-icon.checked {
          color: var(--success);
        }

        .inline-add-subtask input {
          width: 100%;
          padding: 6px 8px;
          border-radius: 6px;
          border: 1px solid var(--border-color);
          background: var(--bg-primary);
          color: var(--text-primary);
          font-family: var(--font-family);
          font-size: 11px;
        }

        .inline-add-subtask input:focus {
          outline: none;
          border-color: var(--primary);
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
