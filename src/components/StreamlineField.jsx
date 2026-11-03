import { useMemo } from 'react';
import PlotlyChart from './PlotlyChart';

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function findCell(axis, value) {
  if (!axis || axis.length < 2) return -1;
  if (value < axis[0] || value > axis[axis.length - 1]) return -1;

  let lo = 0;
  let hi = axis.length - 1;
  while (hi - lo > 1) {
    const mid = Math.floor((lo + hi) / 2);
    if (axis[mid] <= value) lo = mid;
    else hi = mid;
  }
  return Math.min(lo, axis.length - 2);
}

function bilinearSample(field, x, y) {
  const ix = findCell(field.x, x);
  const iy = findCell(field.y, y);
  if (ix < 0 || iy < 0) return null;

  const x0 = field.x[ix];
  const x1 = field.x[ix + 1];
  const y0 = field.y[iy];
  const y1 = field.y[iy + 1];

  const tx = clamp((x - x0) / (x1 - x0 || 1), 0, 1);
  const ty = clamp((y - y0) / (y1 - y0 || 1), 0, 1);

  const blend = (grid) => {
    const q00 = grid[ix][iy];
    const q10 = grid[ix + 1][iy];
    const q01 = grid[ix][iy + 1];
    const q11 = grid[ix + 1][iy + 1];

    const a = q00 * (1 - tx) + q10 * tx;
    const b = q01 * (1 - tx) + q11 * tx;
    return a * (1 - ty) + b * ty;
  };

  const u = blend(field.u);
  const v = blend(field.v);
  const speed = Math.hypot(u, v);

  return { u, v, speed };
}

function traceStreamline(field, seed, step, maxSteps = 700) {
  const points = [seed];
  let point = seed;

  for (let i = 0; i < maxSteps; i += 1) {
    const first = bilinearSample(field, point.x, point.y);
    if (!first || first.speed < 1e-8) break;

    const d1x = first.u / first.speed;
    const d1y = first.v / first.speed;

    const mid = {
      x: point.x + d1x * step * 0.5,
      y: point.y + d1y * step * 0.5,
    };

    const second = bilinearSample(field, mid.x, mid.y);
    if (!second || second.speed < 1e-8) break;

    const next = {
      x: point.x + (second.u / second.speed) * step,
      y: point.y + (second.v / second.speed) * step,
    };

    if (
      next.x < field.x[0] ||
      next.x > field.x[field.x.length - 1] ||
      next.y < field.y[0] ||
      next.y > field.y[field.y.length - 1]
    ) {
      break;
    }

    points.push(next);
    point = next;
  }

  return points;
}

function buildStreamlines(field, seedCount) {
  if (!field?.x?.length || !field?.y?.length || !field?.u || !field?.v) return [];

  const dx = Math.abs(field.x[1] - field.x[0]);
  const dy = Math.abs(field.y[1] - field.y[0]);
  const step = Math.max(1e-6, Math.min(dx, dy) * 0.6);
  const xSeed = field.x[0] + dx * 0.5;
  const yMin = field.y[0];
  const yMax = field.y[field.y.length - 1];

  return Array.from({ length: seedCount }, (_, index) => {
    const fraction = seedCount === 1 ? 0.5 : index / (seedCount - 1);
    const seed = {
      x: xSeed,
      y: yMin + (yMax - yMin) * fraction,
    };
    return traceStreamline(field, seed, step);
  }).filter(points => points.length > 1);
}

export default function StreamlineField({
  field,
  obstacleRadius = null,
  seedCount = 17,
  height = 360,
}) {
  const streamlines = useMemo(
    () => buildStreamlines(field, seedCount),
    [field, seedCount],
  );

  const data = useMemo(() => {
    if (!field?.speed) return [];

    const magnitude = {
      z: field.speed,
      x: field.y,
      y: field.x,
      type: 'heatmap',
      colorscale: [
        [0, '#0a0a0f'],
        [0.15, '#1a1a4e'],
        [0.3, '#7c4dff'],
        [0.5, '#00e5ff'],
        [0.7, '#00e676'],
        [0.85, '#ffab00'],
        [1, '#ff1744'],
      ],
      showscale: true,
      colorbar: {
        title: { text: 'm/s', font: { size: 10, color: '#8888aa' } },
        tickfont: { size: 9, color: '#8888aa' },
      },
      hovertemplate: 'Y=%{x:.3f} m<br>X=%{y:.3f} m<br>|V|=%{z:.2f} m/s<extra></extra>',
    };

    const lines = streamlines.map((points, index) => ({
      x: points.map(point => point.y),
      y: points.map(point => point.x),
      type: 'scattergl',
      mode: 'lines',
      line: {
        color: index % 2 === 0 ? '#e6ffff' : '#9ff7ff',
        width: 1.4,
      },
      hoverinfo: 'skip',
      showlegend: false,
    }));

    return [magnitude, ...lines];
  }, [field, streamlines]);

  const layout = useMemo(() => ({
    xaxis: {
      title: 'Y (m)',
      scaleanchor: 'y',
      constrain: 'domain',
    },
    yaxis: {
      title: 'X (m)',
      autorange: true,
    },
    height,
    shapes: obstacleRadius
      ? [{
          type: 'circle',
          xref: 'x',
          yref: 'y',
          x0: -obstacleRadius,
          x1: obstacleRadius,
          y0: -obstacleRadius,
          y1: obstacleRadius,
          line: { color: '#ffffff', width: 1.5 },
          fillcolor: 'rgba(10,10,15,0.88)',
          layer: 'above',
        }]
      : [],
  }), [height, obstacleRadius]);

  return (
    <PlotlyChart
      data={data}
      layout={layout}
      style={{ height: `${height}px` }}
    />
  );
}
