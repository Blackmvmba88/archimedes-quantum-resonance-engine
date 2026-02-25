import React from 'react';
import Plotly from 'plotly.js-dist';

const darkLayout = {
  paper_bgcolor: '#12121f',
  plot_bgcolor: '#0a0a0f',
  font: { family: 'JetBrains Mono, monospace', color: '#8888aa', size: 10 },
  margin: { t: 30, r: 20, b: 40, l: 50 },
  xaxis: {
    gridcolor: '#1e1e3a',
    zerolinecolor: '#1e1e3a',
    tickfont: { size: 9 },
  },
  yaxis: {
    gridcolor: '#1e1e3a',
    zerolinecolor: '#1e1e3a',
    tickfont: { size: 9 },
  },
  coloraxis: {
    colorscale: [
      [0, '#0a0a0f'],
      [0.25, '#7c4dff'],
      [0.5, '#00e5ff'],
      [0.75, '#00e676'],
      [1, '#ffab00'],
    ],
  },
};

export default function PlotlyChart({ data, layout = {}, config = {}, style = {} }) {
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (!ref.current) return;
    const mergedLayout = {
      ...darkLayout,
      ...layout,
      xaxis: { ...darkLayout.xaxis, ...(layout.xaxis || {}) },
      yaxis: { ...darkLayout.yaxis, ...(layout.yaxis || {}) },
      paper_bgcolor: layout.paper_bgcolor || darkLayout.paper_bgcolor,
      plot_bgcolor: layout.plot_bgcolor || darkLayout.plot_bgcolor,
      font: { ...darkLayout.font, ...(layout.font || {}) },
      margin: { ...darkLayout.margin, ...(layout.margin || {}) },
    };
    const mergedConfig = { responsive: true, displayModeBar: false, ...config };
    Plotly.react(ref.current, data, mergedLayout, mergedConfig);
  }, [data, layout, config]);

  return <div ref={ref} style={{ width: '100%', height: '300px', ...style }} />;
}
