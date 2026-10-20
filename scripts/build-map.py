"""Genera los puntos del mapa de Córdoba para el hero a partir de un export de Overpass.

Uso:
    python -I scripts/build-map.py <overpass.json>

Query usada (bbox de Córdoba capital):
    [out:json];(way["highway"~"^(motorway|trunk|primary|secondary|tertiary)$"](-31.50,-64.30,-31.32,-64.08);
    way["waterway"="river"](-31.50,-64.30,-31.32,-64.08););out geom;

Salidas:
    public/data/cordoba-points.bin  Int16 little-endian, pares (x, y) normalizados a [-1, 1] * 32767
    public/data/cordoba-routes.json rutas simplificadas para los vehículos animados

Datos © OpenStreetMap contributors (ODbL).
"""

import json
import math
import random
import struct
import sys
from pathlib import Path

N_POINTS = 16000
N_ROUTES = 36
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'public' / 'data'

LAT0 = -31.41
K = math.cos(math.radians(LAT0))
CENTER = (-64.19, -31.415)
RADIUS = 0.105  # recorte circular en grados de longitud corregida

# Peso relativo de cada tipo de vía: más peso, más densidad de puntos
WEIGHT = {'motorway': 3.0, 'trunk': 2.6, 'primary': 2.2, 'secondary': 1.4, 'tertiary': 0.8, 'river': 2.0}


def project(lon, lat):
    x = (lon - CENTER[0]) * K / RADIUS
    y = (lat - CENTER[1]) / RADIUS
    return x, y


def main(src):
    data = json.loads(Path(src).read_text(encoding='utf-8'))
    lines = []
    for el in data['elements']:
        if el.get('type') != 'way' or 'geometry' not in el:
            continue
        tags = el.get('tags', {})
        kind = 'river' if tags.get('waterway') == 'river' else tags.get('highway', '').replace('_link', '')
        if kind not in WEIGHT:
            continue
        pts = [project(g['lon'], g['lat']) for g in el['geometry']]
        pts = [p for p in pts if p[0] ** 2 + p[1] ** 2 <= 1.0]
        if len(pts) >= 2:
            lines.append((kind, pts, tags.get('name', '')))

    # Longitud ponderada de cada segmento para muestrear de forma pareja
    segs = []
    for kind, pts, _ in lines:
        for a, b in zip(pts, pts[1:]):
            length = math.dist(a, b)
            if length > 0:
                segs.append((a, b, length * WEIGHT[kind]))
    total = sum(s[2] for s in segs)

    rnd = random.Random(7)
    out = []
    cum, acc = [], 0.0
    for s in segs:
        acc += s[2]
        cum.append(acc)
    import bisect

    for _ in range(N_POINTS):
        r = rnd.random() * total
        a, b, _w = segs[bisect.bisect_left(cum, r)]
        t = rnd.random()
        jitter = 0.004
        x = a[0] + (b[0] - a[0]) * t + rnd.gauss(0, jitter)
        y = a[1] + (b[1] - a[1]) * t + rnd.gauss(0, jitter)
        out.append((x, y))

    OUT.mkdir(parents=True, exist_ok=True)
    with open(OUT / 'cordoba-points.bin', 'wb') as f:
        for x, y in out:
            f.write(struct.pack('<hh', round(max(-1, min(1, x)) * 32767), round(max(-1, min(1, y)) * 32767)))

    # Rutas para vehículos: las vías principales más largas, simplificadas
    def length(pts):
        return sum(math.dist(a, b) for a, b in zip(pts, pts[1:]))

    candidates = [(kind, pts) for kind, pts, _ in lines if kind in ('motorway', 'trunk', 'primary', 'secondary')]
    candidates.sort(key=lambda c: length(c[1]), reverse=True)
    routes = []
    for _kind, pts in candidates[:N_ROUTES]:
        step = max(1, len(pts) // 40)
        simple = pts[::step]
        if simple[-1] != pts[-1]:
            simple.append(pts[-1])
        routes.append([[round(x, 4), round(y, 4)] for x, y in simple])
    (OUT / 'cordoba-routes.json').write_text(json.dumps(routes, separators=(',', ':')), encoding='utf-8')

    print(f'{len(lines)} vías, {len(out)} puntos, {len(routes)} rutas')


if __name__ == '__main__':
    main(sys.argv[1])
