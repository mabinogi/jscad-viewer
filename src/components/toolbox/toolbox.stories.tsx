import type { Meta, StoryObj } from '@storybook/react';
import { Toolbox } from "./toolbox";
import { Box } from '@chakra-ui/react';

const meta = {
  title: 'Toolbox',
  component: Toolbox,
  decorators: [
    (Story) => <Box display="flex" flexDirection="column" justifyContent="flex-start" ><Story /></Box>
  ],
} satisfies Meta<typeof Toolbox>;

export default meta;
type Story = StoryObj<typeof Toolbox>;

export const Default: Story = {
  args: {
    title: "Toolbox",
    children: <Box>Toolbox</Box>
  },
};