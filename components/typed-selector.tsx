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
      <label className="block font-bold" htmlFor={id}>
        {title}
      </label>
      <select
        id={id}
        className="bg-gray-50 outline-violet-800 border border-gray-300 rounded block w-full p-1 disabled:text-gray-400"
        value={value}
        onChange={(evt) => set(evt.target.value as T)}
      >
        {options}
      </select>
    </div>
  );
}
