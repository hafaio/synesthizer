import { useId } from "react";

export default function NumericSelector({
  title,
  value,
  set,
  min,
  max,
  step,
  disabled,
}: {
  title: string;
  value: number | null;
  set: (val: number | null) => void;
  min?: number | string | undefined;
  max?: number | string | undefined;
  step?: number | string | undefined;
  disabled?: boolean;
}): React.ReactElement {
  const id = useId();
  return (
    <div>
      <label className="block font-bold" htmlFor={id}>
        {title}
      </label>
      <input
        type="number"
        id={id}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        value={value ?? ""}
        onChange={(evt) => {
          const parsed = parseFloat(evt.target.value);
          if (!Number.isNaN(parsed)) {
            set(parsed);
          } else {
            set(null);
          }
        }}
        className="p-1 outline-violet-800 bg-gray-50 border border-gray-300 rounded w-full block disabled:text-gray-400"
      />
    </div>
  );
}
