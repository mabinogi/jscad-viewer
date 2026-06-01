import type { Meta, StoryObj } from '@storybook/react'
import { Parameters } from './parameters'

const meta = {
  title: 'Components/Parameters',
  component: Parameters,
} satisfies Meta<typeof Parameters>

export default meta

type Story = StoryObj<typeof Parameters>

export const Default: Story = {
  args: {
    parameterDefinitions: [
      {
        name: 'color',
        type: 'color',
        initial: [255, 0, 0, 255],
        caption: 'Color'
      },
      {
        name: 'size',
        type: 'number',
        initial: 100,
        caption: 'Size'
      }
    ],
    onChange: (name: string, value: unknown) => console.log(`Parameter ${name} changed to`, value)
  }
};