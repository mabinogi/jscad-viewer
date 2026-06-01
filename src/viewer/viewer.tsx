import { useEffect, useRef, useState } from 'react';
import { Box,} from '@chakra-ui/react';
import { useViewer } from './use-viewer';
import { designs } from '../designs';
import { CameraControls } from './camera-controls';
import { NativeSelectField, NativeSelectRoot } from '@/components/ui/native-select';

export const Viewer = () => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [design, setDesign] = useState<keyof typeof designs>('sphere');
  const { toPresetView, projectionType, toggleProjection } = useViewer({
    viewerRef,
    design: designs[design].main({ color: [1, 0, 0, 0.5], size: 100 }),
  });

  console.log('rendering viewer with design:', design);
  const handleKeyPress = (ev: KeyboardEvent) => {
    if (ev.key === 't') {
      toPresetView('top');
    } else if (ev.key === 'p') {
      toggleProjection();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [toPresetView, toggleProjection]);

  return <Box
    position="relative"
    width="100vw"
    height="100vh"
    display="flex"
    overflow="hidden"
    padding={2}
  >
    <Box width="100%" display="flex" flexDirection="column" gap={2} zIndex={1} pointerEvents="none">
      <Box display="flex" flexDirection="row" justifyContent="space-between" gap={2}>
        <Box pointerEvents="all">
          <NativeSelectRoot
            bg="bg.panel"
            borderRadius="md"
            size="xs"

          >
            <NativeSelectField
              value={design}
              items={Object.keys(designs).map((key) => ({ label: key, value: key }))}
              onChange={(ev) => setDesign(ev.target.value as keyof typeof designs)}
            />
          </NativeSelectRoot>
        </Box>
        <Box pointerEvents="all">
          <CameraControls switchProjection={toPresetView} toggleProjection={toggleProjection} projectionType={projectionType} />
        </Box>
      </Box>
    </Box>
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