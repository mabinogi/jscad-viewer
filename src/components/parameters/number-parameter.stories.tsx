import type { Meta, StoryObj } from '@storybook/react';
import { NumberParameter } from './number-parameter';
import { Container } from '@chakra-ui/react';

const meta = {
  title: 'Components/Parameters/NumberParameter',
  component: NumberParameter,
  render: (args) => <Container maxW="sm"><NumberParameter {...args} /></Container>
} satisfies Meta<typeof NumberParameter>;

export default meta;

type Story = StoryObj<typeof NumberParameter>;

export const Default: Story = {
  args: {
    name: 'size',
    value: 100,
    caption: 'Size',
    min: 0,
    max: 200,
    step: 1,
    onChange: (name: string, value: number) => console.log(`Parameter ${name} changed to`, value)
  }
}