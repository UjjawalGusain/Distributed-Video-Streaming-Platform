export default function Loading() {
  return (
    <div className="flex items-center justify-center h-screen space-x-2">
      <div className="h-3 w-3 bg-primary rounded-full animate-bounce" />
      <div className="h-3 w-3 bg-primary rounded-full animate-[bounce_0.3s_0.15s_infinite]" />
      <div className="h-3 w-3 bg-primary rounded-full animate-[bounce_0.3s_0.3s_infinite]" />
    </div>
  );
}
