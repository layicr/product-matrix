// 首页加载骨架屏：数据库查询期间展示，避免白屏。
// Home loading skeleton: shown during DB query to avoid blank screen.
export default function HomeLoading() {
  return (
    <main className="min-h-screen">
      {/* Navbar skeleton */}
      <div className="flex items-center justify-between px-6 md:px-10 py-4">
        <div className="h-8 w-32 bg-ink/10 rounded animate-pulse" />
        <div className="h-8 w-20 bg-ink/10 rounded animate-pulse" />
      </div>

      {/* Hero skeleton */}
      <div className="text-center px-6 py-12">
        <div className="h-16 md:h-20 w-3/4 max-w-lg mx-auto bg-ink/10 rounded animate-pulse mb-6" />
        <div className="h-6 w-1/2 max-w-sm mx-auto bg-ink/10 rounded animate-pulse mb-8" />
        <div className="flex justify-center gap-10">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 w-16 bg-ink/10 rounded animate-pulse" />
          ))}
        </div>
      </div>

      {/* Search + Filter skeleton */}
      <div className="max-w-5xl mx-auto px-6 md:px-10">
        <div className="h-12 w-full bg-ink/10 rounded animate-pulse mb-4" />
        <div className="flex gap-2 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-9 w-20 bg-ink/10 rounded animate-pulse" />
          ))}
        </div>

        {/* Card grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-64 bg-ink/5 rounded-lg border-2 border-black/5 animate-pulse"
            />
          ))}
        </div>
      </div>
    </main>
  );
}
