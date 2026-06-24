'use client';

import React, { useState, useEffect } from 'react';
import { Task } from '@/lib/db';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  task?: Task | null; 
}

export default function TaskModal({ isOpen, onClose, onSubmit, task }: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState(5); 
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState<'todo' | 'in_progress' | 'done'>('todo');
  
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority);
      
      if (task.deadline) {
        const d = new Date(task.deadline);
        const tzoffset = d.getTimezoneOffset() * 60000;
        const localISOTime = (new Date(d.getTime() - tzoffset)).toISOString().slice(0, 16);
        setDeadline(localISOTime);
      } else {
        setDeadline('');
      }
      setStatus(task.status);
      setSubtasks(task.subtasks?.map(sub => sub.title) || []);
    } else {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(17, 0, 0, 0);
      const tzoffset = tomorrow.getTimezoneOffset() * 60000;
      const defaultDeadlineStr = (new Date(tomorrow.getTime() - tzoffset)).toISOString().slice(0, 16);
      
      setTitle('');
      setDescription('');
      setPriority(5);
      setDeadline(defaultDeadlineStr);
      setStatus('todo');
      setSubtasks([]);
    }
    setNewSubtaskTitle('');
  }, [task, isOpen]);

  if (!isOpen) return null;

  const handleAddSubtask = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    if (newSubtaskTitle.trim()) {
      setSubtasks([...subtasks, newSubtaskTitle.trim()]);
      setNewSubtaskTitle('');
    }
  };

  const handleRemoveSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const handleKeyDownSubtask = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSubtask(e);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !deadline) return;
    
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      priority,
      deadline: new Date(deadline).toISOString(),
      status,
      subtasks
    });
  };

  const getPriorityInfo = (val: number) => {
    if (val <= 3) return { label: 'Thấp', class: 'priority-low' };
    if (val <= 7) return { label: 'Trung bình', class: 'priority-medium' };
    return { label: 'Cao', class: 'priority-high' };
  };

  const priorityInfo = getPriorityInfo(priority);

  return (
    <div className="modal-overlay">
      <div className="modal-content glass">
        <div className="modal-header">
          <h2>{task ? 'Cập Nhật Công Việc' : 'Tạo Công Việc Mới'}</h2>
          <button onClick={onClose} className="close-btn" aria-label="Close Modal">
            Đóng
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label htmlFor="task-title">Tiêu đề công việc *</label>
            <input
              type="text"
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề công việc..."
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="task-desc">Mô tả chi tiết</label>
            <textarea
              id="task-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập mô tả hoặc ghi chú..."
              rows={3}
            />
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label htmlFor="task-deadline">
                Hạn chót (Deadline) *
              </label>
              <input
                type="datetime-local"
                id="task-deadline"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
              />
            </div>

            <div className="form-group flex-1">
              <label htmlFor="task-status">Trạng thái</label>
              <select
                id="task-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                disabled={!task} // Only changeable on edit
              >
                <option value="todo">Cần làm (To Do)</option>
                <option value="in_progress">Đang làm (In Progress)</option>
                <option value="done">Hoàn thành (Done)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <div className="priority-label-container">
              <label htmlFor="task-priority">Độ ưu tiên: <strong>{priority}</strong></label>
              <span className={`priority-badge ${priorityInfo.class}`}>
                {priorityInfo.label}
              </span>
            </div>
            <div className="priority-slider-container">
              <input
                type="range"
                id="task-priority"
                min="1"
                max="10"
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
                className="priority-slider"
              />
              <div className="priority-markers">
                <span>1 (Thấp)</span>
                <span>5</span>
                <span>10 (Cao)</span>
              </div>
            </div>
          </div>

          {/* Subtasks setup (only for new tasks, or shown as checklist) */}
          <div className="form-group">
            <label>
              Danh sách các bước nhỏ (Subtasks)
            </label>
            <div className="subtask-input-group">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={handleKeyDownSubtask}
                placeholder="Nhập bước thực hiện..."
              />
              <button 
                type="button" 
                onClick={handleAddSubtask}
                className="add-subtask-btn"
              >
                Thêm
              </button>
            </div>

            {subtasks.length > 0 && (
              <ul className="subtasks-list">
                {subtasks.map((sub, index) => (
                  <li key={index} className="subtask-item">
                    <span>{sub}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(index)}
                      className="remove-subtask-btn"
                      title="Xóa bước này"
                    >
                      Xóa
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="cancel-btn">
              Hủy bỏ
            </button>
            <button type="submit" className="save-btn glow-btn">
              {task ? 'Cập nhật' : 'Tạo công việc'}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 500;
          backdrop-filter: blur(4px);
          padding: 16px;
        }

        .modal-content {
          width: 100%;
          max-width: 580px;
          max-height: 90vh;
          border-radius: var(--card-radius);
          border: 1px solid var(--border-color);
          box-shadow: var(--shadow-lg);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .modal-header {
          padding: 20px 24px;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .modal-header h2 {
          font-size: 20px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .close-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .close-btn:hover {
          background: var(--bg-tertiary);
          color: var(--text-primary);
        }

        .modal-body {
          padding: 24px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-row {
          display: flex;
          gap: 16px;
        }

        .flex-1 {
          flex: 1;
        }

        label {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
          display: flex;
          align-items: center;
        }

        input[type='text'],
        input[type='datetime-local'],
        select,
        textarea {
          padding: 12px 14px;
          border-radius: var(--button-radius);
          border: 1px solid var(--border-color);
          background: var(--bg-primary);
          color: var(--text-primary);
          font-family: var(--font-family);
          font-size: 14px;
          width: 100%;
        }

        input:focus,
        select:focus,
        textarea:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px var(--primary-glow);
        }

        /* Priority custom styling */
        .priority-label-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .priority-badge {
          font-size: 11px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 12px;
          text-transform: uppercase;
        }

        .priority-low {
          background: rgba(16, 185, 129, 0.1);
          color: var(--success);
          border: 1px solid rgba(16, 185, 129, 0.2);
        }

        .priority-medium {
          background: rgba(245, 158, 11, 0.1);
          color: var(--warning);
          border: 1px solid rgba(245, 158, 11, 0.2);
        }

        .priority-high {
          background: rgba(239, 68, 68, 0.1);
          color: var(--danger);
          border: 1px solid rgba(239, 68, 68, 0.2);
        }

        .priority-slider-container {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .priority-slider {
          -webkit-appearance: none;
          width: 100%;
          height: 6px;
          border-radius: 3px;
          background: var(--border-color);
          outline: none;
        }

        .priority-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: var(--primary);
          cursor: pointer;
          box-shadow: var(--shadow-sm);
        }

        .priority-markers {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: var(--text-muted);
        }

        /* Subtask list styles */
        .subtask-input-group {
          display: flex;
          gap: 8px;
        }

        .add-subtask-btn {
          padding: 0 16px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          border-radius: var(--button-radius);
          cursor: pointer;
          font-weight: 500;
        }

        .add-subtask-btn:hover {
          background: var(--primary-glow);
          border-color: var(--primary);
          color: var(--primary);
        }

        .subtasks-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 6px;
          max-height: 120px;
          overflow-y: auto;
          padding: 4px;
          background: var(--bg-primary);
          border-radius: var(--button-radius);
          border: 1px solid var(--border-color);
        }

        .subtask-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          background: var(--bg-secondary);
          border-radius: 8px;
          font-size: 13px;
        }

        .remove-subtask-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
        }

        .remove-subtask-btn:hover {
          color: var(--danger);
        }

        /* Footer buttons */
        .modal-footer {
          padding-top: 12px;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }

        .cancel-btn {
          padding: 12px 20px;
          background: none;
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          border-radius: var(--button-radius);
          cursor: pointer;
          font-weight: 600;
        }

        .cancel-btn:hover {
          background: var(--bg-tertiary);
          color: var(--text-primary);
        }

        .save-btn {
          padding: 12px 24px;
          background: var(--primary);
          color: white;
          border: none;
          border-radius: var(--button-radius);
          cursor: pointer;
          font-weight: 600;
          box-shadow: 0 4px 10px var(--primary-glow);
        }

        .save-btn:hover {
          background: var(--primary-hover);
        }

        @media (max-width: 580px) {
          .form-row {
            flex-direction: column;
            gap: 20px;
          }
        }
      `}</style>
    </div>
  );
}
