import { z } from 'zod';

export const cellSchema = z.object({
  position: z.number().int().min(0).max(400),
  content: z.string().max(255),
  is_free: z.boolean().default(false)
});

export const cardCreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  event_name: z.string().max(100).nullable().optional(),
  theme_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color').default('#00E5FF'),
  grid_size: z.number().int().min(3).max(20).default(5),
  free_space: z.boolean().default(false),
  is_public: z.boolean().default(false),
  allow_community: z.boolean().default(false),
  expires_at: z.string().datetime().nullable().optional(),
  cells: z.array(cellSchema).min(9, 'Grid requires at least 9 prediction squares')
});

export const cardUpdateSchema = cardCreateSchema.partial();

export const cardSettingsUpdateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  event_name: z.string().max(100).nullable().optional(),
  theme_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color').default('#00E5FF'),
  grid_size: z.number().int().min(3).max(20).default(5),
  free_space: z.boolean().default(false),
  is_public: z.boolean().default(false),
  allow_community: z.boolean().default(false),
  expires_at: z.string().datetime().nullable().optional()
});

export const markCellsSchema = z.object({
  markedPositions: z.array(z.number().int().min(0).max(400))
});

