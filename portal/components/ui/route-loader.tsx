interface RouteLoaderProps {
  fullScreen?: boolean;
  label?: string;
}

export default function RouteLoader({
  fullScreen = true,
  label = 'Loading page',
}: RouteLoaderProps) {
  return (
    <div
      className={`flex items-center justify-center ${
        fullScreen ? 'min-h-screen' : 'min-h-[60vh]'
      }`}
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex flex-col items-center gap-4 rounded-2xl bg-white/80 px-6 py-5 shadow-sm ring-1 ring-zinc-200">
        <div className="relative h-10 w-10">
          <span className="absolute inset-0 animate-spin rounded-full border-4 border-zinc-200 border-t-emerald-500" />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500 [animation-delay:-0.24s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500 [animation-delay:-0.12s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500" />
        </div>
        <p className="text-sm font-medium text-zinc-600">{label}</p>
      </div>
    </div>
  );
}
