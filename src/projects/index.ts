import type { Lang } from '../i18n/content';
import type { Project } from './types';
import { entaxi } from './entaxi';
import { iaGateway } from './ia-gateway';
import { saldobus } from './saldobus';
import { bicicba } from './bicicba';
import { muni } from './muni';
import { cicd } from './cicd';
import { monitoreo } from './monitoreo';
import { gps } from './gps';

// Orden de las páginas (y del "siguiente proyecto" al pie de cada una)
export const projects: Project[] = [entaxi, iaGateway, gps, monitoreo, cicd, saldobus, muni, bicicba];

export const projectsBase = (lang: Lang) => (lang === 'es' ? '/proyectos/' : '/en/projects/');
export const projectPath = (lang: Lang, key: string) => {
  const p = projects.find((x) => x.key === key)!;
  return `${projectsBase(lang)}${p.text[lang].slug}/`;
};
