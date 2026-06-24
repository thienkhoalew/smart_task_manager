import { NextResponse } from 'next/server';
import { initTables, queryDb, Task, Subtask } from '@/lib/db';

export async function GET() {
  try {
    await initTables();

    const tasksResult = await queryDb('SELECT * FROM tasks ORDER BY created_at DESC');
    const subtasksResult = await queryDb('SELECT * FROM subtasks ORDER BY created_at ASC');

    const tasks = tasksResult.rows as Task[];
    const subtasks = subtasksResult.rows as Subtask[];

    return NextResponse.json(tasks.map(task => ({
      ...task,
      subtasks: subtasks.filter(sub => sub.task_id === task.id),
    })));
  } catch (error: any) {
    console.error('Failed to fetch tasks:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await initTables();

    const body = await request.json();
    const { title, description, priority, deadline, status, subtasks } = body;

    if (!title || priority === undefined || !deadline) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const insertTaskResult = await queryDb(
      `INSERT INTO tasks (title, description, priority, deadline, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [title, description, Number(priority), deadline, status || 'todo']
    );

    const newTask = insertTaskResult.rows[0] as Task;
    newTask.subtasks = [];

    if (Array.isArray(subtasks)) {
      for (const subtaskTitle of subtasks) {
        const subtaskResult = await queryDb(
          `INSERT INTO subtasks (task_id, title, is_completed)
           VALUES ($1, $2, false)
           RETURNING *`,
          [newTask.id, subtaskTitle]
        );
        newTask.subtasks.push(subtaskResult.rows[0] as Subtask);
      }
    }

    return NextResponse.json(newTask, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create task:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
