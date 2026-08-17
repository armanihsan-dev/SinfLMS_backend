// src/db/schema/quizzes.schema.ts
import { pgTable, uuid, varchar, text, integer, boolean, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { lessons } from './lessons.schema.js';
import { users } from './users.schema.js';


export const quizzes = pgTable('quizzes', {
  id: uuid('id').primaryKey().defaultRandom(),
  lessonId: uuid('lesson_id').references(() => lessons.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  timeLimit: integer('time_limit').default(0),
  passingScore: integer('passing_score').default(70),
  attemptsAllowed: integer('attempts_allowed').default(1),
  shuffleQuestions: boolean('shuffle_questions').default(false),
  showAnswers: boolean('show_answers').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  lessonIdx: index('idx_quizzes_lesson').on(table.lessonId),
}));


export const questions = pgTable('questions', {
  id: uuid('id').primaryKey().defaultRandom(),
  quizId: uuid('quiz_id').notNull().references(() => quizzes.id, { onDelete: 'cascade' }),
  questionType: varchar('question_type', { length: 30 }).notNull(),
  questionText: text('question_text').notNull(),
  options: jsonb('options').notNull(),
  correctAnswer: jsonb('correct_answer'),
  explanation: text('explanation'),
  points: integer('points').default(1),
  orderPosition: integer('order_position').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  quizIdx: index('idx_questions_quiz').on(table.quizId),
}));


export const quizAttempts = pgTable('quiz_attempts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  quizId: uuid('quiz_id').notNull().references(() => quizzes.id, { onDelete: 'cascade' }),
  startedAt: timestamp('started_at', { withTimezone: true }).defaultNow(),
  submittedAt: timestamp('submitted_at', { withTimezone: true }),
  score: integer('score').default(0),
  maxScore: integer('max_score').default(0),
  isPassed: boolean('is_passed').default(false),
  answers: jsonb('answers').default({}),
  timeTaken: integer('time_taken').default(0),
}, (table) => ({
  userIdx: index('idx_quiz_attempts_user').on(table.userId),
  quizIdx: index('idx_quiz_attempts_quiz').on(table.quizId),
}));

export type Quiz = typeof quizzes.$inferSelect;
export type NewQuiz = typeof quizzes.$inferInsert;
export type Question = typeof questions.$inferSelect;
export type NewQuestion = typeof questions.$inferInsert;
export type QuizAttempt = typeof quizAttempts.$inferSelect;
export type NewQuizAttempt = typeof quizAttempts.$inferInsert;