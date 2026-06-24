'use client';

import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  DragStartEvent,
  DragEndEvent,
  closestCorners,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Task } from '@/lib/db';
import TaskColumn from './TaskColumn';
import TaskCard from './TaskCard';

interface TaskBoardProps {
  tasks: Task[];
  onAddTask: () => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onUpdateTask: (task: Task) => void;
  onUpdateTaskStatus: (id: string, status: 'todo' | 'in_progress' | 'done') => void;
}

export default function TaskBoard({
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onUpdateTask,
  onUpdateTaskStatus,
}: TaskBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const todoTasks = tasks.filter(t => t.status === 'todo');
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
  const doneTasks = tasks.filter(t => t.status === 'done');

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find(t => t.id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const isValidTransition = (from: 'todo' | 'in_progress' | 'done', to: 'todo' | 'in_progress' | 'done') => {
    if (from === 'todo') return to === 'in_progress';
    if (from === 'in_progress') return to === 'done';
    if (from === 'done') return to === 'todo' || to === 'in_progress';
    return false;
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const activeTaskItem = tasks.find(t => t.id === activeId);
    if (!activeTaskItem) return;

    const isOverAColumn = overId === 'todo' || overId === 'in_progress' || overId === 'done';
    
    if (isOverAColumn) {
      const targetStatus = overId as 'todo' | 'in_progress' | 'done';
      if (activeTaskItem.status !== targetStatus) {
        if (isValidTransition(activeTaskItem.status, targetStatus)) {
          onUpdateTaskStatus(String(activeId), targetStatus);
        }
      }
    } else {
      const overTaskItem = tasks.find(t => t.id === overId);
      if (overTaskItem && activeTaskItem.status !== overTaskItem.status) {
        if (isValidTransition(activeTaskItem.status, overTaskItem.status)) {
          onUpdateTaskStatus(String(activeId), overTaskItem.status);
        }
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="board-grid">
        <TaskColumn
          id="todo"
          title="Cần làm"
          tasks={todoTasks}
          onAddTask={onAddTask}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
          onUpdateTask={onUpdateTask}
        />
        
        <TaskColumn
          id="in_progress"
          title="Đang thực hiện"
          tasks={inProgressTasks}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
          onUpdateTask={onUpdateTask}
        />
        
        <TaskColumn
          id="done"
          title="Đã hoàn thành"
          tasks={doneTasks}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
          onUpdateTask={onUpdateTask}
        />
      </div>

      <DragOverlay dropAnimation={{
        duration: 200,
        easing: 'cubic-bezier(0.18, 0.89, 0.32, 1.28)',
      }}>
        {activeTask ? (
          <div className="dragging-overlay-wrapper">
            <TaskCard
              task={activeTask}
              onEdit={() => {}}
              onDelete={() => {}}
              onUpdateTask={() => {}}
            />
          </div>
        ) : null}
      </DragOverlay>

      <style jsx>{`
        .board-grid {
          display: flex;
          gap: 24px;
          flex-wrap: wrap;
          align-items: flex-start;
          width: 100%;
        }

        .dragging-overlay-wrapper {
          transform: rotate(2deg);
          box-shadow: var(--shadow-lg);
          border-radius: 12px;
          cursor: grabbing;
        }

        @media (max-width: 992px) {
          .board-grid {
            flex-direction: column;
            gap: 20px;
          }
        }
      `}</style>
    </DndContext>
  );
}
