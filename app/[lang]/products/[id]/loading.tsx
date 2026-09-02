// 产品详情页加载骨架屏 / Product detail loading skeleton.
export default function ProductDetailLoading() {
  return (
    <main className="min-h-screen notebook-bg">
      <div className="flex items-center justify-between px-6 md:px-10 py-4">
        <div className="h-8 w-32 bg-ink/10 rounded animate-pulse" />
        <div className="h-8 w-20 bg-ink/10 rounded animate-pulse" />
      </div>
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="h-10 w-40 bg-ink/10 rounded animate-pulse mb-8" />
        <div className="h-80 bg-ink/5 rounded-lg border-2 border-black/5 animate-pulse mb-8" />
        <div className="h-96 bg-ink/5 rounded-lg border-2 border-black/5 animate-pulse" />
      </div>
    </main>
  );
}
