import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Notas técnicas: un archivo por idioma. `key` empareja la nota en español con su traducción.
const notas = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/notas' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    lang: z.enum(['es', 'en']),
    key: z.string(),
    slug: z.string(),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { notas };
