import { Field, NumberInput } from "@chakra-ui/react";

type NumberParameterProps = {
  name: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  caption: string;
  onChange: (name: string, value: number) => void;
};

export const NumberParameter = ({ name, value, min, max, step, caption, onChange }: NumberParameterProps) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(event.target.value);
    onChange(name, newValue);
  };

  return (
    <Field.Root flexDirection="row" alignItems="center" justifyContent="space-between">
      <Field.Label>{caption}</Field.Label>
      <NumberInput.Root size="xs" min={min} max={max} step={step} value={`${value}`} onChange={handleChange}>
        <NumberInput.Control />
        <NumberInput.Input />
      </NumberInput.Root>
    </Field.Root>
  );
};