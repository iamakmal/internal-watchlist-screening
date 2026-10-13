export function format(value: number) {
  return value.toLocaleString();
}

export function displayList(values: string[]) {
  return values.length > 0 ? values.join(", ") : "Not available";
}

export function formatDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : value;
}

export function dobStatusStyle(status: string) {
  switch (status) {
    case "MATCH":
      return {
        label: "Exact match",
        className: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
      };
    case "PARTIAL_MATCH":
      return {
        label: "Partial match",
        className: "bg-amber-50 text-amber-700 ring-amber-600/20",
      };
    case "NEAR_MATCH":
      return {
        label: "Near match",
        className: "bg-orange-50 text-orange-700 ring-orange-600/20",
      };
    case "NO_MATCH":
      return {
        label: "No match",
        className: "bg-rose-50 text-rose-700 ring-rose-600/20",
      };
    case "NOT_PROVIDED":
      return {
        label: "Not provided",
        className: "bg-slate-100 text-slate-700 ring-slate-500/20",
      };
    case "INVALID_INPUT":
      return {
        label: "Invalid input",
        className: "bg-rose-50 text-rose-700 ring-rose-600/20",
      };
    case "NOT_AVAILABLE":
      return {
        label: "Not available",
        className: "bg-slate-100 text-slate-700 ring-slate-500/20",
      };
    default:
      return {
        label: status || "Not available",
        className: "bg-slate-100 text-slate-700 ring-slate-500/20",
      };
  }
}
