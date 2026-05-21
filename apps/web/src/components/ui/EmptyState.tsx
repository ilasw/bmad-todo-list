export function EmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
      <p className="text-lg font-medium text-slate-800">No tasks yet</p>
      <p className="mt-2 text-sm text-slate-600">
        Add your first task using the form above.
      </p>
    </div>
  )
}
