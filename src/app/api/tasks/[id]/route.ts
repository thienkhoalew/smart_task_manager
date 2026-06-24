import { NextResponse } from 'next/server';
import { initTables, queryDb, Task } from '@/lib/db';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await initTables();

    const id = params.id;
    const body = await request.json();
    const { title, description, priority, deadline, status } = body;

    const checkResult = await queryDb('SELECT * FROM tasks WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const existingTask = checkResult.rows[0];
    const updatedTitle = title !== undefined ? title : existingTask.title;
    const updatedDesc = description !== undefined ? description : existingTask.description;
    const updatedPriority = priority !== undefined ? Number(priority) : existingTask.priority;
    const updatedDeadline = deadline !== undefined ? deadline : existingTask.deadline;
    const updatedStatus = status !== undefined ? status : existingTask.status;

    const updateResult = await queryDb(
      `UPDATE tasks
       SET title = $1, description = $2, priority = $3, deadline = $4, status = $5, updated_at = NOW()
       WHERE id = $6
       RETURNING *`,
      [updatedTitle, updatedDesc, updatedPriority, updatedDeadline, updatedStatus, id]
    );

    const updatedTask = updateResult.rows[0] as Task;

    await queryDb(
      'UPDATE subtasks SET is_completed = $1 WHERE task_id = $2',
      [updatedStatus === 'done', id]
    );

    const subtasksResult = await queryDb('SELECT * FROM subtasks WHERE task_id = $1 ORDER BY created_at ASC', [id]);
    updatedTask.subtasks = subtasksResult.rows;

    return NextResponse.json(updatedTask);
  } catch (error: any) {
    console.error('Failed to update task:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await initTables();

    const id = params.id;
    const deleteResult = await queryDb('DELETE FROM tasks WHERE id = $1 RETURNING id', [id]);

    if (deleteResult.rows.length === 0) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: `Task ${id} deleted` });
  } catch (error: any) {
    console.error('Failed to delete task:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
