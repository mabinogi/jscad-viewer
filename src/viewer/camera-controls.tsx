import { IconButton, SimpleGrid } from "@chakra-ui/react";
import { Blank, ProjectionButton, type View } from "./projection-button";
import { BoxIcon } from "lucide-react";
import { Toolbox } from "@/components/toolbox/toolbox";

type CameraControlsProps = {
  switchProjection: (view: View) => void;
  toggleProjection: () => void;
  projectionType: 'orthographic' | 'perspective';
}

export const CameraControls = ({ switchProjection, toggleProjection, projectionType }: CameraControlsProps) =>
  <Toolbox title="Camera Controls">
    <SimpleGrid columns={3} gap={2}>
      <Blank />
      <ProjectionButton switchFunction={switchProjection} view="front" />
      <IconButton onClick={toggleProjection} variant={projectionType == 'orthographic' ? "plain" : "solid"} >
        <BoxIcon />
      </IconButton>
      <ProjectionButton switchFunction={switchProjection} view="left" />
      <ProjectionButton switchFunction={switchProjection} view="top" />
      <ProjectionButton switchFunction={switchProjection} view="right" />
      <Blank />
      <ProjectionButton switchFunction={switchProjection} view="back" />
      <ProjectionButton switchFunction={switchProjection} view="bottom" />
      <Blank />
    </SimpleGrid>
  </Toolbox>