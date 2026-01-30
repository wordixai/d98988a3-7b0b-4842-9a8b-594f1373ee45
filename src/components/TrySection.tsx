import { useState } from "react";
import { Wand2, Download, Loader2, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { ImageUploader } from "./ImageUploader";
import { StyleSelector } from "./StyleSelector";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export function TrySection() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!uploadedImage || !selectedStyle) return;

    setIsGenerating(true);
    setGeneratedImage(null);
    setError(null);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('virtual-tryon', {
        body: {
          image: uploadedImage,
          style: selectedStyle
        }
      });

      if (invokeError) {
        throw invokeError;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.image) {
        setGeneratedImage(data.image);
        toast.success("换装成功！");
      } else {
        throw new Error("未能生成换装效果");
      }
    } catch (err: any) {
      console.error("Virtual try-on error:", err);
      const errorMessage = err.message || "换装失败，请重试";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedImage) return;

    try {
      // Handle base64 images
      if (generatedImage.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = generatedImage;
        link.download = `ai-tryon-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("图片已下载");
      } else {
        // Handle URL images
        window.open(generatedImage, "_blank");
      }
    } catch (err) {
      toast.error("下载失败，请重试");
    }
  };

  const canGenerate = uploadedImage && selectedStyle && !isGenerating;

  return (
    <section id="try" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-hero opacity-50" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            立即<span className="gradient-text">体验</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            上传你的照片，选择喜欢的风格，让 AI 为你创造全新形象
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Step 1: Upload */}
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-sm font-bold">
                  1
                </span>
                <span className="font-semibold">上传照片</span>
              </div>
              <ImageUploader image={uploadedImage} onImageChange={setUploadedImage} />
            </div>

            {/* Step 2: Select Style */}
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-sm font-bold">
                  2
                </span>
                <span className="font-semibold">选择风格</span>
              </div>
              <StyleSelector
                selectedStyle={selectedStyle}
                onSelectStyle={setSelectedStyle}
              />
            </div>

            {/* Step 3: Generate */}
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-sm font-bold">
                  3
                </span>
                <span className="font-semibold">生成结果</span>
              </div>

              <div className="space-y-4">
                <Button
                  onClick={handleGenerate}
                  disabled={!canGenerate}
                  className="w-full bg-gradient-primary hover:opacity-90 transition-opacity glow-effect disabled:opacity-50 disabled:cursor-not-allowed"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      AI 生成中...
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-5 w-5" />
                      开始换装
                    </>
                  )}
                </Button>

                {/* Result Display */}
                <div className="aspect-[3/4] rounded-xl overflow-hidden bg-muted/30 flex items-center justify-center">
                  {isGenerating ? (
                    <div className="flex flex-col items-center gap-4 p-6">
                      <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                      <p className="text-muted-foreground text-center">
                        AI 正在为你换装...
                        <br />
                        <span className="text-sm">这可能需要 10-30 秒</span>
                      </p>
                    </div>
                  ) : error ? (
                    <div className="flex flex-col items-center gap-4 p-6 text-center">
                      <AlertCircle className="w-12 h-12 text-destructive" />
                      <p className="text-muted-foreground">{error}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setError(null)}
                      >
                        重试
                      </Button>
                    </div>
                  ) : generatedImage ? (
                    <img
                      src={generatedImage}
                      alt="AI 生成结果"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-8">
                      <Wand2 className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        上传照片并选择风格后
                        <br />
                        点击"开始换装"查看效果
                      </p>
                    </div>
                  )}
                </div>

                {generatedImage && (
                  <Button
                    onClick={handleDownload}
                    variant="outline"
                    className="w-full border-border/50 hover:bg-card/50"
                    size="lg"
                  >
                    <Download className="mr-2 h-5 w-5" />
                    下载图片
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
