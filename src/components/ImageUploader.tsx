import { useCallback, useState } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  image: string | null;
  onImageChange: (image: string | null) => void;
}

export function ImageUploader({ image, onImageChange }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          onImageChange(event.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    [onImageChange]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          onImageChange(event.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    [onImageChange]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeImage = () => {
    onImageChange(null);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">上传照片</h3>
      {image ? (
        <div className="relative rounded-xl overflow-hidden aspect-[3/4] max-w-xs mx-auto">
          <img src={image} alt="上传的照片" className="w-full h-full object-cover" />
          <button
            onClick={removeImage}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-destructive transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            "upload-zone aspect-[3/4] max-w-xs mx-auto cursor-pointer",
            isDragging && "border-primary bg-primary/10"
          )}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center gap-4 p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              {isDragging ? (
                <ImageIcon className="w-8 h-8 text-primary" />
              ) : (
                <Upload className="w-8 h-8 text-muted-foreground" />
              )}
            </div>
            <div>
              <p className="font-medium mb-1">
                {isDragging ? "松开鼠标上传" : "拖拽照片到这里"}
              </p>
              <p className="text-sm text-muted-foreground">
                或点击选择文件
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              支持 JPG、PNG 格式，建议使用清晰的正面照片
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
