const getRangeColor = (value: number) =>
  value >= 80
    ? "bg-states-error"
    : value >= 70
    ? "bg-yellow-400"
    : "bg-primary";

export default function ProgressBar({ value }: { value: number }) {
  return (
    <div className="bg-black rounded-lg border border-[#333639] h-[13px] overflow-hidden w-full">
      <div
        className={`${getRangeColor(value)} h-full rounded-l-lg`}
        style={{ width: `${value}%` }}
      ></div>
    </div>
  );
}
