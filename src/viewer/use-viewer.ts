import { useEffect, useMemo, useRef, useState } from "react";
import {
  prepareRender,
  drawCommands,
  cameras,
  controls,
  entitiesFromSolids,
} from '@jscad/regl-renderer';
import type { Geom3 } from "@jscad/modeling/src/geometries/types";
import type { cameraState } from "@jscad/regl-renderer/types/cameras/perspectiveCamera";

const perspectiveCamera = cameras.perspective;
const orbitControls = controls.orbit;

const fromOrthographicToPerspective = (orthographicCamera: typeof cameraState) => {
  const { near, far, fov } = orthographicCamera
  // recompute projection matrix to use perspective camera projection matrix
  const { viewport } = orthographicCamera;
  console.log('Viewport', viewport);
  const projection = cameras.perspective.setProjection(orthographicCamera, orthographicCamera, { width: viewport[2], height: viewport[3] })
  const { projectionType } = cameras.perspective.cameraState
  return Object.assign({}, orthographicCamera, projection, { projectionType }, { near, far, fov })
}

export type StaticView = 'top' | 'bottom' | 'left' | 'right' | 'front' | 'back';


type ViewState = {
  camera: typeof cameras.perspective.defaults;
  controls: typeof controls.orbit.defaults;
};

const getDefaultState = (defaults: ViewState) => {
  const savedState: Partial<ViewState> = localStorage.getItem('savedState') ? JSON.parse(localStorage.getItem('savedState') || '{}') : {};

  return {
    camera: savedState.camera || { ...defaults.camera },
    controls: savedState.controls || { ...defaults.controls },
  }
}

type ViewerControls = {
  toPresetView: (view: StaticView) => void;
  toggleProjection: () => void;
}

export const useViewer = ({
  viewerRef,
  design
}: {
  viewerRef: React.RefObject<HTMLElement | null>;
  design: Geom3 | Geom3[];
}) => {
  const updateViewRef = useRef(true);
  const mountedRef = useRef(false);
  const [uiState, setUiState] = useState({
    gridOn: true,
    axisOn: true,
  })
  const [projectionType, setProjectionType] = useState<'perspective' | 'orthographic'>('perspective');
  const [viewerControls, setViewerControls] = useState<ViewerControls>({
    toPresetView: () => { },
    toggleProjection: () => { },
  });

  const entities = useMemo(() =>
    entitiesFromSolids({}, ...(Array.isArray(design) ? design : [design])),
    [design]);

  useEffect(() => {
    console.info('In use effect')
    if (!viewerRef.current || mountedRef.current) {
      console.info('Viewer ref not set or viewer already mounted');
      return;
    }
    console.info('Mounting viewer');
    mountedRef.current = true;

    const width = viewerRef.current.clientWidth;;
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
        console.info('Updating view', state.camera, state.controls);
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
        console.info("Viewer ref", viewerRef.current);
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
``
    const toPresetView = (view: StaticView) => {
      console.info('Moving to view', view);
      Object.assign(state.camera, cameras.camera.toPresetView(view, state));
      updateViewRef.current = true;
    }

    const toggleProjection = () => {
        console.info('Toggling projection');
        if (state.camera.projectionType === 'perspective') {
          Object.assign(state.camera, cameras.camera.fromPerspectiveToOrthographic(state.camera));
          setProjectionType('orthographic');
        } else {
          Object.assign(state.camera, fromOrthographicToPerspective(state.camera));
          setProjectionType('perspective');
        }
        console.info('Projection type', state.camera.projectionType);
        updateViewRef.current = true;
      };

    setViewerControls({
      toPresetView,
      toggleProjection,
    });

    window.addEventListener('resize', () => {
      if (!viewerRef.current) {
        console.info('No viewer ref on resize');
        return;
      }
      const width = viewerRef.current.clientWidth;
      const height = viewerRef.current.clientHeight;
      if (state.camera.projectionType === 'perspective') {
        perspectiveCamera.setProjection(state.camera, state.camera, { width, height });
      } else {
        cameras.orthographic.setProjection(state.camera, state.camera);
      }
      console.info('Resizing to', width, height);
      updateViewRef.current = true;
    });
  }, []);

  return {
    ...viewerControls,
    projectionType,
  }
}