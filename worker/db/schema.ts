import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core'

export const plans = sqliteTable('plans', {
  id: text('id').primaryKey(),
  editToken: text('edit_token').notNull(),
  name: text('name').notNull(),
  numDays: integer('num_days').notNull(),
  startRange: text('start_range').notNull(),
  endRange: text('end_range').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
})

export const planResponses = sqliteTable('plan_responses', {
  id: text('id').primaryKey(),
  planId: text('plan_id').notNull().references(() => plans.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  availableDates: text('available_dates').notNull(), // JSON array of ISO date strings
  editToken: text('edit_token').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, (table) => [
  index('plan_responses_plan_id_idx').on(table.planId),
])

