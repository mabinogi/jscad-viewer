import { useRef } from 'react';
import * as design from '../designs/box';
import './viewer.css';
import { useViewer } from './use-viewer';

export const Viewer = () => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const { toPresetView, projectionType, toggleProjection } = useViewer({
    viewerRef,
    design: design.main({ color: [1, 0, 0, 0.5], size: 100 }),
  });

  window.addEventListener('keypress', (ev) => {
    if (ev.key === 't') {
      toPresetView('top');
    } else if (ev.key === 'p') {
      toggleProjection();
    }
  });

  return <div className="viewer">
    <div className="menu">
      <button type="button" onClick={() => toPresetView('top')}>Top View</button>
      <button type="button" onClick={() => toPresetView('bottom')}>Bottom View</button>
      <button type="button" onClick={() => toPresetView('left')}>Left View</button>
      <button type="button" onClick={() => toPresetView('right')}>Right View</button>
      <button type="button" onClick={() => toPresetView('front')}>Front View</button>
      <button type="button" onClick={() => toPresetView('back')}>Back View</button>
    </div>
    <div className="menu"><p>Projection: {projectionType}</p></div>
    <div className="menu">
      <button type="button" onClick={toggleProjection}>Toggle Projection</button>
    </div>
    <div ref={viewerRef} className="target"></div>
  </div>
}