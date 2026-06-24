import { Pool } from 'pg';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: number;
  deadline: string;
  status: 'todo' | 'in_progress' | 'done';
  created_at?: string;
  updated_at?: string;
  subtasks?: Subtask[];
}

export interface Subtask {
  id: string;
  task_id: string;
  title: string;
  is_completed: boolean;
  created_at?: string;
}

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error('DATABASE_URL is not configured');
}

const pool = new Pool({
  connectionString: dbUrl,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

export async function queryDb(text: string, params?: any[]) {
  return pool.query(text, params);
}

let isDbInitialized = false;

export async function initTables() {
  if (isDbInitialized) return;

  await queryDb('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";').catch(() => {
    console.log('Skipping CREATE EXTENSION, might already exist or permission denied');
  });

  await queryDb(`
    CREATE TABLE IF NOT EXISTS tasks (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      title TEXT NOT NULL,
      description TEXT,
      priority INTEGER NOT NULL,
      deadline TIMESTAMP WITH TIME ZONE NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'todo',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);

  await queryDb(`
    CREATE TABLE IF NOT EXISTS subtasks (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      is_completed BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);

  isDbInitialized = true;
}
