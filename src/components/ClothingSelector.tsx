import { useState } from "react";
import { Upload, X } from "lucide-react";

interface ClothingSelectorProps {
  selectedClothing: string | null;
  onSelectClothing: (image: string | null) => void;
}

// 预设服装图片
const presetClothes = [
  {
    id: "suit",
    name: "商务西装",
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=300&h=400&fit=crop"
  },
  {
    id: "casual",
    name: "休闲T恤",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=400&fit=crop"
  },
  {
    id: "dress",
    name: "优雅连衣裙",
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300&h=400&fit=crop"
  },
  {
    id: "hoodie",
    name: "街头卫衣",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=300&h=400&fit=crop"
  },
  {
    id: "sportswear",
    name: "运动套装",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&h=400&fit=crop"
  },
  {
    id: "vintage",
    name: "复古风衣",
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=300&h=400&fit=crop"
  },
];

export function ClothingSelector({ selectedClothing, onSelectClothing }: ClothingSelectorProps) {
  const [customClothing, setCustomClothing] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("图片大小不能超过 10MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setCustomClothing(result);
        onSelectClothing(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectPreset = (imageUrl: string) => {
    setCustomClothing(null);
    onSelectClothing(imageUrl);
  };

  const handleClearCustom = () => {
    setCustomClothing(null);
    onSelectClothing(null);
  };

  return (
    <div className="space-y-4">
      {/* 自定义上传 */}
      <div className="mb-4">
        <p className="text-sm text-muted-foreground mb-2">上传服装图片</p>
        {customClothing ? (
          <div className="relative aspect-[3/4] rounded-lg overflow-hidden border-2 border-primary">
            <img
              src={customClothing}
              alt="自定义服装"
              className="w-full h-full object-cover"
            />
            <button
              onClick={handleClearCustom}
              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-background/80 flex items-center justify-center hover:bg-background transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center aspect-[3/4] rounded-lg border-2 border-dashed border-border/50 hover:border-primary/50 transition-colors cursor-pointer bg-muted/20">
            <Upload className="w-8 h-8 text-muted-foreground mb-2" />
            <span className="text-sm text-muted-foreground">点击上传</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* 预设服装 */}
      <div>
        <p className="text-sm text-muted-foreground mb-2">或选择预设服装</p>
        <div className="grid grid-cols-3 gap-2">
          {presetClothes.map((cloth) => (
            <button
              key={cloth.id}
              onClick={() => handleSelectPreset(cloth.image)}
              className={`relative aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all ${
                selectedClothing === cloth.image && !customClothing
                  ? "border-primary ring-2 ring-primary/30"
                  : "border-transparent hover:border-border/50"
              }`}
            >
              <img
                src={cloth.image}
                alt={cloth.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 to-transparent p-1">
                <span className="text-[10px] font-medium">{cloth.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
