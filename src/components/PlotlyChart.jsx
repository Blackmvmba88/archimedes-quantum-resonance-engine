// ─────────────────────────────────────────────────────────────────────────────
// PlotlyChart.jsx — Optimizado con React.memo
//
// PROBLEMA (antes):
//   export default function PlotlyChart({ ... }) { ... }
//   → Cada vez que el componente padre se re-renderiza (ej. al mover un slider),
//     React re-renderiza PlotlyChart aunque sus props `data` y `layout` no hayan
//     cambiado. Esto invoca Plotly.react() innecesariamente, que es costoso.
//
// SOLUCIÓN (después):
//   export default React.memo(function PlotlyChart({ ... }) { ... })
//   → React compara las props del render anterior con las nuevas usando
//     Object.is() (comparación por referencia). Si son idénticas, React
//     OMITE el re-render por completo. El efecto es visible al mover sliders
//     que no afectan a este gráfico específico.
//
// NOTA IMPORTANTE: React.memo solo funciona correctamente cuando las props
//   son estables entre renders. Por eso, los objetos `data` y `layout` que
//   se pasan a este componente DEBEN estar envueltos en `useMemo` en el padre.
//   Si se pasan como literales inline `data={[{...}]}`, se crea una nueva
//   referencia en cada render y React.memo no puede detectar la igualdad.
// ─────────────────────────────────────────────────────────────────────────────
import React, { useRef, useEffect, useMemo } from 'react';
import Plotly from 'plotly.js-dist';

// El tema oscuro se define FUERA del componente y como constante del módulo.
// Esto garantiza que el objeto `darkLayout` tenga siempre la misma referencia
// en memoria y no se recree en cada render.
const darkLayout = {
  paper_bgcolor: '#12121f',
  plot_bgcolor:  '#0a0a0f',
  font:   { family: 'JetBrains Mono, monospace', color: '#8888aa', size: 10 },
  margin: { t: 30, r: 20, b: 40, l: 50 },
  xaxis:  { gridcolor: '#1e1e3a', zerolinecolor: '#1e1e3a', tickfont: { size: 9 } },
  yaxis:  { gridcolor: '#1e1e3a', zerolinecolor: '#1e1e3a', tickfont: { size: 9 } },
  coloraxis: {
    colorscale: [
      [0,    '#0a0a0f'],
      [0.25, '#7c4dff'],
      [0.5,  '#00e5ff'],
      [0.75, '#00e676'],
      [1,    '#ffab00'],
    ],
  },
};

// La configuración por defecto también es estable (constante de módulo).
const defaultConfig = { responsive: true, displayModeBar: false };

// ─── React.memo ───────────────────────────────────────────────────────────────
// Envolver la función del componente con React.memo convierte a PlotlyChart en
// un "componente puro": solo se re-renderiza si alguna de sus props cambia.
// React hace la comparación automáticamente antes de ejecutar el cuerpo del
// componente. Si todas las props son iguales (misma referencia), el render
// se cancela y se devuelve el resultado del render anterior del DOM.
const PlotlyChart = React.memo(function PlotlyChart({
  data,
  layout = {},
  config = {},
  style  = {},
}) {
  const ref = useRef(null);

  // useMemo dentro del componente para construir el layout fusionado.
  // Esto evita recrear el objeto en cada render si `layout` no cambió.
  const mergedLayout = useMemo(() => ({
    ...darkLayout,
    ...layout,
    xaxis:        { ...darkLayout.xaxis,  ...(layout.xaxis  || {}) },
    yaxis:        { ...darkLayout.yaxis,  ...(layout.yaxis  || {}) },
    paper_bgcolor: layout.paper_bgcolor || darkLayout.paper_bgcolor,
    plot_bgcolor:  layout.plot_bgcolor  || darkLayout.plot_bgcolor,
    font:          { ...darkLayout.font,   ...(layout.font   || {}) },
    margin:        { ...darkLayout.margin, ...(layout.margin || {}) },
  }), [layout]); // Solo se recalcula si `layout` cambia de referencia.

  const mergedConfig = useMemo(() => ({
    ...defaultConfig,
    ...config,
  }), [config]);

  // useEffect llama a Plotly.react() solo cuando `data`, `mergedLayout`
  // o `mergedConfig` cambian. Gracias a React.memo + useMemo en el padre,
  // esto ocurre únicamente cuando los datos físicos realmente cambian.
  useEffect(() => {
    if (!ref.current) return;
    Plotly.react(ref.current, data, mergedLayout, mergedConfig);
  }, [data, mergedLayout, mergedConfig]);

  return <div ref={ref} style={{ width: '100%', height: '300px', ...style }} />;
});

// Asignar displayName para facilitar la depuración en React DevTools.
// Con React.memo, el nombre del componente se muestra como "Memo(PlotlyChart)"
// en lugar de "Anonymous", lo que facilita identificarlo en el árbol de componentes.
PlotlyChart.displayName = 'PlotlyChart';

export default PlotlyChart;
