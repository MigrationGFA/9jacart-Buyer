

export default function SectionHeader({
  title,
  text,
}: {
  title?: string;
  text: string;
}) {
  return (
    <div className="">
      <div className="flex items-center mb-6">
        <div className="w-4 h-10 rounded bg-primary mr-2 flex-shrink-0"></div>
        <div>
          {title && <p className="text-primary font-semibold">{title}</p>}
          <h2 className="text-4xl font-bold text-gray-800">{text}</h2>
        </div>
      </div>
    </div>
  );
}
