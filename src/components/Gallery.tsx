const galleryItems = [
  {
    before: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=400&fit=crop",
    after: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=300&h=400&fit=crop",
    style: "街头潮流",
  },
  {
    before: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop",
    after: "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=300&h=400&fit=crop",
    style: "商务正装",
  },
  {
    before: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&h=400&fit=crop",
    after: "https://images.unsplash.com/photo-1518577915332-c2a19f149a75?w=300&h=400&fit=crop",
    style: "优雅礼服",
  },
  {
    before: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=400&fit=crop",
    after: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=300&h=400&fit=crop",
    style: "休闲日常",
  },
];

export function Gallery() {
  return (
    <section id="gallery" className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            精彩<span className="gradient-text">作品展示</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            看看其他用户使用 AI 换装创造的惊艳效果
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {galleryItems.map((item, index) => (
            <div
              key={index}
              className="group relative rounded-2xl overflow-hidden glass-card hover:glow-effect transition-all duration-300"
            >
              <div className="relative aspect-[3/4] overflow-hidden">
                {/* Before image */}
                <img
                  src={item.before}
                  alt="原始照片"
                  className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-0"
                />
                {/* After image */}
                <img
                  src={item.after}
                  alt="换装后"
                  className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 opacity-0 group-hover:opacity-100"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                {/* Label */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{item.style}</span>
                    <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">
                      悬停查看效果
                    </span>
                  </div>
                </div>
                {/* Before/After indicator */}
                <div className="absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium bg-background/80 backdrop-blur-sm transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                  <span className="group-hover:hidden">原图</span>
                  <span className="hidden group-hover:inline">换装后</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
