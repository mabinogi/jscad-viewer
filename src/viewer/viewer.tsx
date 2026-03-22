import { useRef } from 'react';
import { BoxIcon, Cone } from 'lucide-react';
import { Box, Button, Float, IconButton, SimpleGrid } from '@chakra-ui/react';
import { useViewer } from './use-viewer';
import * as design from '../designs/box';
import { Blank, ProjectionButton } from './projection-button';
import { CameraControls } from './camera-controls';

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

  return <Box
    position="relative"
    width="100vw"
    height="100vh"
    display="flex"
    flexDirection="column"
    overflow="hidden"
    bgColor="bg"
    padding={2}
    >
    <CameraControls switchProjection={toPresetView} toggleProjection={toggleProjection} projectionType={projectionType} />
    <Box
      position="absolute"
      top={0}
      left={0}
      width="100%"
      height="100%"
      ref={viewerRef}>
    </Box>
  </Box>
}