interface Props {
  title: string;
  data: string | number;
  tone?: "default" | "success" | "danger" | "warning";
}

const tones = {
  default: "text-gray-900",
  success: "text-emerald-600",
  danger: "text-red-600",
  warning: "text-amber-600",
};

export default function ReportCard({ title, data, tone = "default" }: Props) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {title}
      </p>
      <p className={`mt-1 text-2xl font-semibold tabular-nums ${tones[tone]}`}>
        {data}
      </p>
    </div>
  );
}
