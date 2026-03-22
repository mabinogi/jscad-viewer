import { Box, IconButton } from "@chakra-ui/react";
import { Cone, Circle, CircleDot } from "lucide-react";

export type View = 'top' | 'bottom' | 'left' | 'right' | 'front' | 'back';

type ProjectionButtonProps = {
  switchFunction: (view: View) => void;
  view: View;
}

const IconMap: Record<View, React.ReactNode> = {
  top: <CircleDot />,
  bottom: <Circle />,
  left: <Cone style={{ transform: 'rotate(-90deg)' }} />,
  right: <Cone style={{ transform: 'rotate(90deg)' }} />,
  front: <Cone style={{ transform: 'rotate(0deg)' }} />,
  back: <Cone style={{ transform: 'rotate(180deg)' }} />,
};

export const ProjectionButton = ({ switchFunction, view }: ProjectionButtonProps) =>
  <IconButton aria-label={`Switch to ${view} view`} title={view} onClick={() => switchFunction(view)}>
    {IconMap[view]}
  </IconButton>

export const Blank = () => <Box userSelect="none" />;