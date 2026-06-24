'use client';

import React from 'react';
import { Task } from '@/lib/db';
import { getSmartSchedule } from '@/lib/scheduler';

interface SmartSchedulerProps {
  tasks: Task[];
}

export default function SmartScheduler({ tasks }: SmartSchedulerProps) {
  const scheduledTasks = getSmartSchedule(tasks);

  const getPriorityBadgeClass = (priority: number) => {
    if (priority <= 3) return 'badge-low';
    if (priority <= 7) return 'badge-medium';
    return 'badge-high';
  };

  const getRankBadgeClass = (index: number) => {
    if (index === 0) return 'rank-first';
    if (index === 1) return 'rank-second';
    return 'rank-normal';
  };

  const getRankText = (index: number) => {
    if (index === 0) return 'Khuyên làm trước';
    if (index === 1) return 'Tiếp theo';
    return `Thứ tự #${index + 1}`;
  };

  return (
    <div className="scheduler-panel glass">
      <div className="scheduler-header">
        <div className="title-area">
          <h2>Smart Scheduling Dashboard</h2>
        </div>
      </div>

      {/* Recommended list */}
      <div className="scheduled-list-container">
        <h3>Danh sách công việc khuyên làm:</h3>
        
        {scheduledTasks.length > 0 ? (
          <div className="scheduled-list">
            {scheduledTasks.map((task, index) => (
              <div key={task.id} className="scheduled-card">
                <div className="scheduled-card-header">
                  <span className={`rank-badge ${getRankBadgeClass(index)}`}>
                    {getRankText(index)}
                  </span>
                  <div className="score-badge">
                    <span>Điểm: </span>
                    <strong>{task.schedulingScore}</strong>
                  </div>
                </div>

                <div className="scheduled-card-body">
                  <h4 className="task-title">{task.title}</h4>
                  
                  <div className="task-meta-row">
                    <span className={`priority-indicator ${getPriorityBadgeClass(task.priority)}`}>
                      Độ ưu tiên: {task.priority}/10
                    </span>
                    
                    <span className={`time-indicator ${task.remainingDays <= 0 ? 'overdue' : task.remainingDays <= 1 ? 'imminent' : ''}`}>
                      {task.remainingDays < 0 
                        ? `Đã trễ ${Math.abs(task.remainingDays)} ngày` 
                        : task.remainingDays === 0 
                        ? 'Hết hạn hôm nay' 
                        : `Còn lại ${task.remainingDays} ngày`}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-scheduler-state">
            <p>Không có công việc đang thực hiện nào cần sắp xếp!</p>
            <span>Hãy thêm công việc ở cột "Cần làm" để bắt đầu.</span>
          </div>
        )}
      </div>

      <style jsx>{`
        .scheduler-panel {
          border-radius: 16px;
          border: 1px solid var(--border-color);
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          height: 100%;
        }

        .scheduler-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .title-area {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .glow-icon {
          color: var(--primary);
          animation: glow 1.5s ease-in-out infinite alternate;
        }

        @keyframes glow {
          from { filter: drop-shadow(0 0 2px var(--primary)); }
          to { filter: drop-shadow(0 0 8px var(--primary)); }
        }

        .scheduler-header h2 {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
        }

        /* Recommended list */
        .scheduled-list-container {
          display: flex;
          flex-direction: column;
          gap: 14px;
          flex: 1;
        }

        .scheduled-list-container h3 {
          font-size: 15px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .scheduled-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-height: 480px;
          overflow-y: auto;
          padding-right: 4px;
        }

        .scheduled-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          box-shadow: var(--shadow-sm);
          transition: border-color 0.2s;
        }

        .scheduled-card:hover {
          border-color: var(--primary);
        }

        .scheduled-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .rank-badge {
          font-size: 11px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 6px;
        }

        .rank-first {
          background: rgba(239, 68, 68, 0.15);
          color: var(--danger);
          border: 1px solid rgba(239, 68, 68, 0.2);
        }

        .rank-second {
          background: rgba(245, 158, 11, 0.15);
          color: var(--warning);
          border: 1px solid rgba(245, 158, 11, 0.2);
        }

        .rank-normal {
          background: var(--bg-tertiary);
          color: var(--text-secondary);
          border: 1px solid var(--border-color);
        }

        .score-badge {
          font-size: 11px;
          color: var(--text-muted);
        }

        .score-badge strong {
          color: var(--primary);
          font-size: 13px;
        }

        .scheduled-card-body {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .scheduled-card-body h4 {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1.4;
          word-break: break-word;
        }

        .task-meta-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
        }

        .priority-indicator {
          font-weight: 500;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .badge-low {
          background: rgba(16, 185, 129, 0.08);
          color: var(--success);
        }

        .badge-medium {
          background: rgba(245, 158, 11, 0.08);
          color: var(--warning);
        }

        .badge-high {
          background: rgba(239, 68, 68, 0.08);
          color: var(--danger);
        }

        .time-indicator {
          color: var(--text-muted);
          font-weight: 500;
        }

        .time-indicator.imminent {
          color: var(--danger);
          font-weight: 600;
        }

        .time-indicator.overdue {
          color: var(--danger);
          font-weight: 700;
        }

        .empty-scheduler-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 40px 20px;
          color: var(--text-muted);
          gap: 8px;
          border: 2px dashed var(--border-color);
          border-radius: 12px;
          background: var(--bg-secondary);
        }

        .empty-scheduler-state p {
          font-weight: 600;
          color: var(--text-secondary);
        }

        .empty-scheduler-state span {
          font-size: 12px;
        }
      `}</style>
    </div>
  );
}
