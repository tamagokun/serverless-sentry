import { StackFrame } from "../types";

type Props = {
  stack: StackFrame[];
};

export default function StackTrace({ stack }: Props) {
  return (
    <div className="divide-y divide-gray-200">
      {stack.map((frame, i) => (
        <div key={i} className="p-1">
          <div className="font-mono text-sm text-gray-400">
            <span className="text-gray-800">{frame.filename}</span> in{" "}
            <span className="text-gray-800">{frame.function}</span> at{" "}
            <span className="text-gray-800">line {frame.lineno}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
