export default function EmptyPreview({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <div className="h-full min-h-[50vh] flex items-center justify-center flex-col gap-2 px-5">
      <h1 className="font-bold">{title}</h1>
      <span className="text-sm text-center">{message}</span>
    </div>
  );
}
