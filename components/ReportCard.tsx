interface props {
  title: string;
  data: string;
}

export default function AddFileModal({ title, data }: props) {
  return (
    <div className="w-48 rounded-2xl border border-gray-500 p-4">
      <p className="font-bold text-xl">{title}</p>
      <p className="text-gray-700">{data}</p>
    </div>
  );
}
