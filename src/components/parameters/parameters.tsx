import type { ParameterDefinition } from "@/parameters/parameter-types";
import { Box } from "@chakra-ui/react";

export type ParametersProps = {
  parameterDefinitions: ParameterDefinition[];
  onChange: (name: string, value: unknown) => void;
};

export const Parameters = ({ parameterDefinitions, onChange }: ParametersProps) =>
  <Box    display="flex"
          flexDirection="column"
          gap={4}
          padding={4}
          borderWidth={1}
          borderRadius="md"
          borderColor="gray.200"
  >
    <h2>Parameters</h2>
  </Box>;