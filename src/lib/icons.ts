import * as icons from 'simple-icons';

type SimpleIcon = { path: string; hex: string };
const lookup = icons as unknown as Record<string, SimpleIcon | undefined>;

const luminance = (hex: string) => {
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/** Ícono de simple-icons por nombre (siReact…). Las marcas casi negras (Express, Next.js…) se
 *  pintan con el color del texto para no desaparecer sobre el fondo oscuro. */
export function brandIcon(name: string | undefined, label: string) {
  const icon = name ? lookup[name] : undefined;
  const hex = icon?.hex ?? 'ff7a1a';
  return {
    path: icon?.path,
    color: luminance(hex) < 0.12 ? 'var(--fg)' : `#${hex}`,
    initials: label.replace(/[^A-Z0-9]/g, '').slice(0, 2) || label.slice(0, 2).toUpperCase(),
  };
}
