export function LoadingSpinner() {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 py-16"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div
        className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"
        aria-hidden="true"
      />
      <p className="text-sm text-slate-600">Loading tasks…</p>
    </div>
  )
}
