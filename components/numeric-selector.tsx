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
      <label className="block text-sm font-semibold" htmlFor={id}>
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
        className="mt-0.5 block w-full rounded border border-gray-300 bg-gray-50 p-1.5 outline-violet-600 focus:outline-2 disabled:text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:disabled:text-gray-500"
      />
    </div>
  );
}
