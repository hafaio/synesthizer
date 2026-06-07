import { useId } from "react";

export default function TypedSelector<T extends string>({
  title,
  value,
  values,
  set,
}: {
  title: string;
  value: T;
  values: [T, string][];
  set: (val: T) => void;
}): React.ReactElement {
  const id = useId();
  const options = values.map(([val, name]) => (
    <option key={val} value={val}>
      {name}
    </option>
  ));
  return (
    <div>
      <label className="block text-sm font-semibold" htmlFor={id}>
        {title}
      </label>
      <select
        id={id}
        className="mt-0.5 block w-full rounded border border-gray-300 bg-gray-50 p-1.5 outline-violet-600 focus:outline-2 disabled:text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:disabled:text-gray-500"
        value={value}
        onChange={(evt) => set(evt.target.value as T)}
      >
        {options}
      </select>
    </div>
  );
}
