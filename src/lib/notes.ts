import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from '../i18n/content';

export type Note = CollectionEntry<'notas'>;

export const notesBase = (lang: Lang) => (lang === 'es' ? '/notas/' : '/en/notes/');
export const notePath = (note: Note) => `${notesBase(note.data.lang)}${note.data.slug}/`;

export async function getNotes(lang: Lang) {
  const all = await getCollection('notas', (n) => n.data.lang === lang);
  return all.sort((a, b) => b.data.date.getTime() - a.data.date.getTime() || a.data.title.localeCompare(b.data.title));
}

// La misma nota en el otro idioma (para el botón ES/EN y el hreflang)
export async function translationOf(note: Note) {
  const other = note.data.lang === 'es' ? 'en' : 'es';
  const all = await getCollection('notas', (n) => n.data.lang === other && n.data.key === note.data.key);
  return all[0];
}

// ~220 palabras por minuto, sin contar el código
export function readingMinutes(note: Note) {
  const text = (note.body ?? '').replace(/```[\s\S]*?```/g, '');
  return Math.max(1, Math.round(text.split(/\s+/).filter(Boolean).length / 220));
}

export const formatDate = (date: Date, lang: Lang) =>
  date.toLocaleDateString(lang === 'es' ? 'es-AR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
