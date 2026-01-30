import { Upload, Palette, Zap, Download } from "lucide-react";

const features = [
  {
    icon: Upload,
    title: "轻松上传",
    description: "支持拖拽上传或点击选择照片，支持 JPG、PNG 等常见格式",
  },
  {
    icon: Palette,
    title: "多样风格",
    description: "提供商务、休闲、街头、优雅等多种服装风格任你选择",
  },
  {
    icon: Zap,
    title: "AI 秒速生成",
    description: "强大的 AI 模型快速处理，几秒钟即可呈现换装效果",
  },
  {
    icon: Download,
    title: "高清下载",
    description: "生成的图片支持高清下载，随时保存分享你的新造型",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            为什么选择 <span className="gradient-text">AI 换装</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            我们提供最先进的 AI 换装技术，让你足不出户就能尝试各种穿搭风格
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 rounded-2xl glass-card hover:glow-effect transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
