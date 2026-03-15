import * as jscad from '@jscad/modeling';
import { cssColors } from '@jscad/modeling/src/colors';

const { cuboid } = jscad.primitives;
const { colorize } = jscad.colors;

export const getParameterDefinitions = () => ([
  {
    name: 'color',
    type: 'color',
    initial: cssColors.red,
    caption: 'Color'
  },
  {
    name: 'size',
    type: 'float',
    initial: 100,
    caption: 'Size'
  }
])

export const main = (params: { color: [number, number, number], size: number }) => {
  return colorize(params.color, cuboid({ size: [params.size, params.size, params.size] }));
}