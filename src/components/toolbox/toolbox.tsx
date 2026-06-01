import { useState } from "react";
import { Box, IconButton, Text } from "@chakra-ui/react";
import { SquareChevronDown, SquareChevronUp } from "lucide-react";

export type ToolboxProps = {
  title: string;
  children?: React.ReactNode;
}

export const Toolbox = ({ title, children }: ToolboxProps) => {
  const [open, setOpen] = useState(true);

  const toggleOpen = () => setOpen(!open);

  return (<Box
    borderRadius="md"
    backgroundColor="bg.panel"
    borderStyle="solid"
    borderColor="bg.muted"
    width="fit-content"
    shadow="md"
    overflow="hidden"
    padding={0}
  >
    <Box display="flex" flexDirection="row" alignItems="center"
      justifyContent="space-between"
      paddingLeft={2}
      gap={1}
    >
      <Text flex="1" fontSize="xs" userSelect="none" onDoubleClick={toggleOpen} >{title}</Text>
      <IconButton size="2xs" variant="ghost" alignSelf="flex-end" onClick={toggleOpen}>
        {open ? <SquareChevronUp /> : <SquareChevronDown />}
      </IconButton>
    </Box>
    {open && 
    <Box display="flex" flexDirection="column" padding={2} gap={2}>
      {children}
    </Box>}
  </Box>)
}