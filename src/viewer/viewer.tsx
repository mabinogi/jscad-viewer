import { useEffect, useRef, useState } from 'react';
import {
  prepareRender,
  drawCommands,
  cameras,
  controls,
  entitiesFromSolids,
} from '@jscad/regl-renderer';
import * as design from '../designs/box';
import './viewer.css';


type ViewState = {
  camera: typeof cameras.perspective.defaults;
  controls: typeof controls.orbit.defaults;
};

export const Viewer = () => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(false);
  const updateViewRef = useRef(true);
  const [uiState, setUiState] = useState({
    gridOn: true,
    axisOn: true,
  })

  const entities = entitiesFromSolids({}, design.main({ color: [1, 0, 0, 0.5], size: 100 }));

  const getDefaultState = (defaults: ViewState) => {
    const savedState: Partial<ViewState> = localStorage.getItem('savedState') ? JSON.parse(localStorage.getItem('savedState') || '{}') : {};

    return {
      camera: savedState.camera || { ...defaults.camera },
      controls: savedState.controls || { ...defaults.controls },
    }
  }

  useEffect(() => {
    if (!viewerRef.current || mountedRef.current) return;
    mountedRef.current = true;

    const perspectiveCamera = cameras.perspective;
    const orbitControls = controls.orbit;

    const width = viewerRef.current.clientWidth;
    const height = viewerRef.current.clientHeight;

    const state = getDefaultState({
      camera: perspectiveCamera.defaults,
      controls: orbitControls.defaults,
    });

    const saveState = () => {
      localStorage.setItem('savedState', JSON.stringify(state));
    }

    perspectiveCamera.setProjection(state.camera, state.camera, { width, height });
    perspectiveCamera.update(state.camera, state.camera);

    // prepare the renderer
    const renderer = prepareRender({
      glOptions: {
        container: viewerRef.current,
      }
    });

    const gridOptions = () => ({
      visuals: {
        drawCmd: 'drawGrid',
        show: uiState.gridOn,
      },
      size: [500, 500],
      ticks: [100, 10],
      color: [0, 0, 1, 0.5],
      subColor: [0, 0, 1, 0.25],
    });

    const axisOptions = () => ({
      visuals: {
        drawCmd: 'drawAxis',
        show: uiState.axisOn,
      },
      size: 150,
      // alwaysVisible: false,
      // xColor: [0, 0, 1, 1],
      // yColor: [1, 0, 1, 1],
      // zColor: [0, 0, 0, 1],
    });


    const renderOptions = () => ({
      camera: state.camera,
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
        axisOptions(),
        gridOptions(),
        ...entities,
      ]
    } as const);

    // convert HTML events (mouse movement) to viewer changes
    let lastX = 0;
    let lastY = 0;

    const rotateSpeed = 0.002;
    const panSpeed = 1;
    const zoomSpeed = 0.08;


    let savedPosition: {
      rotateDelta?: [number, number],
      panDelta?: [number, number],
      zoomDelta?: number,
    } = {};

    if (localStorage.getItem('savedPosition')) {
      savedPosition = JSON.parse(localStorage.getItem('savedPosition') || '{}');
    }

    let rotateDelta = savedPosition.rotateDelta || [0, 0];
    let panDelta = savedPosition.panDelta || [0, 0];
    let zoomDelta = savedPosition.zoomDelta || 0;
    let pointerDown = false;

    const doRotatePanZoom = () => {
      if (rotateDelta[0] || rotateDelta[1]) {
        const updated = orbitControls.rotate(
          {
            controls: state.controls,
            camera: state.camera,
            speed: rotateSpeed
          },
          rotateDelta,
        );
        state.controls = { ...state.controls, ...updated.controls };
        updateViewRef.current = true;
        rotateDelta = [0, 0];
      }

      if (panDelta[0] || panDelta[1]) {
        const updated = orbitControls.pan(
          {
            controls: state.controls,
            camera: state.camera,
            speed: panSpeed,
          },
          panDelta,
        );
        state.controls = { ...state.controls, ...updated.controls };
        panDelta = [0, 0];
        state.camera.position = updated.camera.position;
        state.camera.target = updated.camera.target;
        updateViewRef.current = true;
      }

      if (zoomDelta) {
        const updated = orbitControls.zoom(
          {
            controls: state.controls,
            camera: state.camera,
            speed: zoomSpeed,
          },
          zoomDelta,
        );
        state.controls = { ...state.controls, ...updated.controls };
        zoomDelta = 0;
        updateViewRef.current = true;
      }
    }
    const updateAndRender = () => {
      doRotatePanZoom();
      if (updateViewRef.current) {
        const updates = orbitControls.update(
          {
            controls: state.controls,
            camera: state.camera,
          },
        );
        state.controls = { ...state.controls, ...updates.controls };
        updateViewRef.current = state.controls.changed; // for elasticity in rotate / zoom

        state.camera.position = updates.camera.position;
        perspectiveCamera.update(state.camera);

        renderer(renderOptions());
        saveState();
      }
      window.requestAnimationFrame(updateAndRender);
    }
    window.requestAnimationFrame(updateAndRender);

    const moveHandler = (ev: PointerEvent) => {
      if (!pointerDown) return;

      const dx = lastX - ev.pageX;
      const dy = ev.pageY - lastY;

      const shiftKey = (ev.shiftKey === true);

      if (shiftKey) {
        panDelta[0] += dx;
        panDelta[1] += dy;
      } else {
        rotateDelta[0] -= dx;
        rotateDelta[1] -= dy;
      }

      lastX = ev.pageX;
      lastY = ev.pageY;

      ev.preventDefault();
    }
    const downHandler = (ev: PointerEvent) => {
      pointerDown = true;
      lastX = ev.pageX;
      lastY = ev.pageY;
      viewerRef.current?.setPointerCapture(ev.pointerId);
    }

    const upHandler = (ev: PointerEvent) => {
      pointerDown = false;
      viewerRef.current?.releasePointerCapture(ev.pointerId);
    }

    const wheelHandler = (ev: WheelEvent) => {
      zoomDelta += ev.deltaY;
      ev.preventDefault();
    }

    viewerRef.current.onpointermove = moveHandler;
    viewerRef.current.onpointerdown = downHandler;
    viewerRef.current.onpointerup = upHandler;
    viewerRef.current.onwheel = wheelHandler;
    window.addEventListener('resize', () => {
      if (!viewerRef.current) return;
      const width = viewerRef.current.clientWidth;
      const height = viewerRef.current.clientHeight;
      perspectiveCamera.setProjection(state.camera, state.camera, { width, height });
      updateAndRender();
    });
  }, []);

  return <div ref={viewerRef} className="viewer" id="viewer"></div>
}