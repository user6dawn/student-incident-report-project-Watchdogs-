export default function AdminLoading() {
  return (
    <div className="p-4 md:p-6">
      <div className="mx-auto max-w-6xl space-y-6 animate-pulse">
        <div className="h-8 w-56 rounded bg-slate-200" />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="h-28 rounded-xl bg-slate-200" />
          <div className="h-28 rounded-xl bg-slate-200" />
          <div className="h-28 rounded-xl bg-slate-200" />
          <div className="h-28 rounded-xl bg-slate-200" />
        </div>

        <div className="h-72 rounded-2xl bg-slate-200" />
      </div>
    </div>
  )
}
