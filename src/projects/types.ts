import type { Lang } from '../i18n/content';

// Una página por proyecto. La geometría del diagrama es común a los dos idiomas; los textos
// (incluidos los de nodos, conexiones y pasos del recorrido) van por idioma, referidos por id.

export interface DiagramNode {
  id: string;
  label: string; // nombre de la pieza (no se traduce: "React Native", "Redis"…)
  short?: string; // nombre más corto para el diagrama del celular
  icon?: string; // nombre en simple-icons (siRedis…); sin ícono se dibuja un monograma
  at: [number, number]; // centro en el diagrama ancho (viewBox 960 × alto)
  m?: [number, number]; // centro en el diagrama angosto del celular (viewBox 360 × alto); sin m, no se dibuja ahí
  core?: boolean; // pieza destacada (lo que construí o lideré)
}

export interface DiagramEdge {
  id: string;
  from: string;
  to: string;
  dashed?: boolean; // conexión secundaria o asíncrona
  wideOnly?: boolean; // solo en el diagrama ancho (en el celular se cruzaría con otros nodos)
}

export interface Diagram {
  height: number;
  mobileHeight: number;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  // Recorrido animado: cada paso enciende una o más conexiones ("-id" = en sentido inverso)
  flow: string[][];
}

export interface ProjectText {
  slug: string;
  meta: { title: string; description: string };
  kicker: string;
  title: string;
  lead: string;
  facts: { k: string; v: string }[];
  sections: { h: string; p: string[] }[];
  diagram: {
    title: string;
    text: string;
    sub: Record<string, string>; // subtítulo de cada nodo, por id
    edges: Record<string, string>; // etiqueta de cada conexión, por id
    flow: string[]; // texto de cada paso del recorrido
  };
  stack: { group: string; items: { name: string; icon?: string; role: string }[] }[];
  built?: { h: string; items: string[] };
  lessons: { h: string; items: { t: string; d: string }[] };
  links?: { label: string; href: string }[];
  related?: { kicker: string; title: string; href: string }; // nota técnica con la historia completa
}

export interface Project {
  key: string;
  diagram: Diagram;
  text: Record<Lang, ProjectText>;
}
