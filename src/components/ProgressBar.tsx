interface ProgressBarProps {
  value: number;
  max: number;
  color: 'emerald' | 'blue';
}

export default function ProgressBar({ value, max, color }: ProgressBarProps) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const over = value > max;

  const barColor =
    over
      ? 'bg-red-400'
      : color === 'emerald'
      ? 'bg-emerald-400'
      : 'bg-blue-400';

  return (
    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-300 ${barColor}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
