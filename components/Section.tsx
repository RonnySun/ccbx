export default function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4 pb-3 border-b border-gray-100">
        {title}
      </h2>
      {children}
    </div>
  );
}
