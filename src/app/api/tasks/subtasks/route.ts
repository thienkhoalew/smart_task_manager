import { NextResponse } from 'next/server';
import { initTables, queryDb, Subtask } from '@/lib/db';

export async function POST(request: Request) {
  try {
    await initTables();

    const body = await request.json();
    const { task_id, title } = body;

    if (!task_id || !title) {
      return NextResponse.json({ error: 'Missing task_id or title' }, { status: 400 });
    }

    const result = await queryDb(
      'INSERT INTO subtasks (task_id, title, is_completed) VALUES ($1, $2, false) RETURNING *',
      [task_id, title]
    );

    return NextResponse.json(result.rows[0] as Subtask, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create subtask:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await initTables();

    const body = await request.json();
    const { id, is_completed, title } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing subtask id' }, { status: 400 });
    }

    const check = await queryDb('SELECT * FROM subtasks WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return NextResponse.json({ error: 'Subtask not found' }, { status: 404 });
    }

    const existing = check.rows[0];
    const updatedStatus = is_completed !== undefined ? is_completed : existing.is_completed;
    const updatedTitle = title !== undefined ? title : existing.title;

    const result = await queryDb(
      'UPDATE subtasks SET is_completed = $1, title = $2 WHERE id = $3 RETURNING *',
      [updatedStatus, updatedTitle, id]
    );

    const updatedSubtask = result.rows[0] as Subtask;
    const taskId = updatedSubtask.task_id;
    const allSubtasksResult = await queryDb('SELECT is_completed FROM subtasks WHERE task_id = $1', [taskId]);
    const allDone = allSubtasksResult.rows.length > 0 && allSubtasksResult.rows.every(r => r.is_completed);

    if (allDone) {
      await queryDb("UPDATE tasks SET status = 'done', updated_at = NOW() WHERE id = $1", [taskId]);
    }

    return NextResponse.json(updatedSubtask);
  } catch (error: any) {
    console.error('Failed to update subtask:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await initTables();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing subtask id' }, { status: 400 });
    }

    const result = await queryDb('DELETE FROM subtasks WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Subtask not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: `Subtask ${id} deleted` });
  } catch (error: any) {
    console.error('Failed to delete subtask:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
