export default function RootLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200/70 bg-white/95 shadow-xl backdrop-blur-sm p-6">
        <div className="space-y-4 animate-pulse">
          <div className="h-6 w-40 rounded bg-slate-200" />
          <div className="h-4 w-64 rounded bg-slate-200" />
          <div className="space-y-3 pt-2">
            <div className="h-11 w-full rounded bg-slate-200" />
            <div className="h-11 w-full rounded bg-slate-200" />
            <div className="h-11 w-full rounded bg-slate-200" />
          </div>
        </div>
      </div>
    </div>
  )
}
