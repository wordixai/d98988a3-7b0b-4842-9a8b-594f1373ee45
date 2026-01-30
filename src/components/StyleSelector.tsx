import { cn } from "@/lib/utils";

interface Style {
  id: string;
  name: string;
  image: string;
  description: string;
}

const styles: Style[] = [
  {
    id: "business",
    name: "商务正装",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop",
    description: "专业干练的职场形象",
  },
  {
    id: "casual",
    name: "休闲日常",
    image: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=300&h=400&fit=crop",
    description: "舒适随性的日常穿搭",
  },
  {
    id: "street",
    name: "街头潮流",
    image: "https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=300&h=400&fit=crop",
    description: "时尚前卫的街头风格",
  },
  {
    id: "elegant",
    name: "优雅礼服",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=300&h=400&fit=crop",
    description: "高贵典雅的正式场合",
  },
  {
    id: "sporty",
    name: "运动风尚",
    image: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=300&h=400&fit=crop",
    description: "活力四射的运动造型",
  },
  {
    id: "vintage",
    name: "复古经典",
    image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=300&h=400&fit=crop",
    description: "怀旧风情的经典穿搭",
  },
];

interface StyleSelectorProps {
  selectedStyle: string | null;
  onSelectStyle: (styleId: string) => void;
}

export function StyleSelector({ selectedStyle, onSelectStyle }: StyleSelectorProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">选择服装风格</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {styles.map((style) => (
          <button
            key={style.id}
            onClick={() => onSelectStyle(style.id)}
            className={cn(
              "group relative rounded-xl overflow-hidden transition-all duration-300",
              selectedStyle === style.id
                ? "ring-2 ring-primary glow-effect"
                : "hover:ring-2 hover:ring-primary/50"
            )}
          >
            <div className="aspect-[3/4] relative">
              <img
                src={style.image}
                alt={style.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="font-semibold text-sm">{style.name}</p>
                <p className="text-xs text-muted-foreground">{style.description}</p>
              </div>
              {selectedStyle === style.id && (
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <svg className="w-4 h-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
