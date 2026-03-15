import { useEffect, useRef } from 'react';
 import {
    prepareRender,
    drawCommands,
    cameras,
    controls,
    entitiesFromSolids,
  } from '@jscad/regl-renderer';
import * as design from '../designs/box';
import './viewer.css';

export const Viewer = () => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(false);
  const updateRef = useRef(false);

  const entities = entitiesFromSolids({}, design.main({ color: [1, 0, 0], size: 100 }));

  useEffect(() => {
    console.log('Viewer mounted');
    if (!viewerRef.current || mountedRef.current) return;
    mountedRef.current = true;
    console.log('Viewer ref:', viewerRef.current);

    const width = window.innerWidth;
    const height = window.innerHeight;

    const perspectiveCamera = cameras.perspective;
    const camera = Object.assign({}, perspectiveCamera.defaults);

    perspectiveCamera.setProjection(camera, camera, { width, height });
    perspectiveCamera.update(camera, camera);


    const options = {
      glOptions: {
        container: viewerRef.current!,
      },
      camera,
      drawCommands: {
        drawAxis: drawCommands.drawAxis,
        drawGrid: drawCommands.drawGrid,
        drawLines: drawCommands.drawLines,
        drawMesh: drawCommands.drawMesh,
      },
        rendering: {
          background: [0, 0, 0, 1],
          lightDirection: [0.0, 0.0, 1.0],
          lightPosition: [100.0, 100.0, 100.0],
          ambientLightAmount: 0.5,
          diffuseLightAmount: 0.0,
          specularLightAmount: 0.0,
          materialShininess: 1.0,
        },      
      entities: [
        { // grid data
          // the choice of what draw command to use is also data based
          visuals: {
            drawCmd: 'drawGrid',
            show: true
          },
          size: [500, 500],
          ticks: [25, 5],
          color: [0, 0, 1, 1],
          subColor: [0, 0, 1, 0.5]
        },
        {
          visuals: {
            drawCmd: 'drawAxis',
            show: true
          },
          size: 300,
          // alwaysVisible: true,
          // xColor: [0, 0, 1, 1],
          // yColor: [1, 0, 1, 1],
          // zColor: [0, 0, 0, 1]
        },
        ...entities
      ]
    } as const;

    // prepare
    const render = prepareRender(options);

    // do the actual render : it is a simple function
    render(options);

    const updateAndRender = () => {
      perspectiveCamera.update(camera, camera);

      render(options);
      // window.requestAnimationFrame(updateAndRender);
    }
    window.requestAnimationFrame(updateAndRender);

    window.addEventListener('resize', () => {
      if (!viewerRef.current) return;
      const width = window.innerWidth;
      const height = window.innerHeight;
      perspectiveCamera.setProjection(camera, camera, { width, height });
      updateAndRender();
    });
  }, []);

  return <div ref={viewerRef} className="viewer" id="viewer"></div>
}