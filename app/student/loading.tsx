export default function StudentLoading() {
  return (
    <div className="p-4 md:p-6">
      <div className="mx-auto max-w-5xl space-y-6 animate-pulse">
        <div className="h-8 w-48 rounded bg-slate-200" />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="h-36 rounded-xl bg-slate-200" />
          <div className="h-36 rounded-xl bg-slate-200" />
          <div className="h-36 rounded-xl bg-slate-200" />
        </div>

        <div className="h-64 rounded-2xl bg-slate-200" />
      </div>
    </div>
  )
}
