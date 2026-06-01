export type RGBAColor = [number, number, number, number];
export type RGBColor = [number, number, number];
export type ColorInput = RGBAColor | RGBColor;

export type GroupParameter = {
  name: string;
  type: 'group';
  caption: string;
}

export type ColorParameter = {
  name: string;
  type: 'color';
  initial: ColorInput;
  caption: string;
};

export type NumberParameter = {
  name: string;
  type: 'number';
  initial: number;
  min?: number;
  max?: number;
  step?: number;
  caption: string;
};

export type ParameterDefinition = ColorParameter | NumberParameter | GroupParameter;

export type ParameterGroup = {
  name: string;
  caption: string;
  parameters: ParameterDefinition[];
}

