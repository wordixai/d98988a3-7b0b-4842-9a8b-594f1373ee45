import { ArrowRight, Wand2 } from "lucide-react";
import { Button } from "./ui/button";

export function Hero() {
  const scrollToTry = () => {
    document.getElementById("try")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-hero" />

      {/* Animated orbs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/20 rounded-full blur-[100px] animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: "1s" }} />

      <div className="container mx-auto px-4 pt-24 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8">
            <Wand2 className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">AI 驱动的智能换装技术</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            用 <span className="gradient-text">AI</span> 重新定义
            <br />
            你的穿搭风格
          </h1>

          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            上传一张照片，选择心仪的服装风格，让 AI 为你打造全新形象。
            无需试穿，秒速换装，探索无限可能。
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={scrollToTry}
              size="lg"
              className="bg-gradient-primary hover:opacity-90 transition-opacity glow-effect text-lg px-8 py-6"
            >
              开始体验
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-border/50 hover:bg-card/50 text-lg px-8 py-6"
              onClick={() => document.getElementById("gallery")?.scrollIntoView({ behavior: "smooth" })}
            >
              查看示例
            </Button>
          </div>
        </div>

        {/* Preview images */}
        <div className="mt-20 relative">
          <div className="flex justify-center gap-4 md:gap-8">
            <div className="w-48 h-64 md:w-64 md:h-80 rounded-2xl overflow-hidden glass-card glow-effect animate-float" style={{ animationDelay: "0s" }}>
              <img
                src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400&h=600&fit=crop"
                alt="时尚穿搭示例"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="w-48 h-64 md:w-64 md:h-80 rounded-2xl overflow-hidden glass-card glow-effect animate-float hidden sm:block" style={{ animationDelay: "0.5s" }}>
              <img
                src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=600&fit=crop"
                alt="街头风格示例"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="w-48 h-64 md:w-64 md:h-80 rounded-2xl overflow-hidden glass-card glow-effect animate-float hidden md:block" style={{ animationDelay: "1s" }}>
              <img
                src="https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&h=600&fit=crop"
                alt="优雅风格示例"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
