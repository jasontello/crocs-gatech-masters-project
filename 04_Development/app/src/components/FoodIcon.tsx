import {
  Apple,
  Beef,
  CookingPot,
  CupSoda,
  Egg,
  Milk,
  Package,
  Salad,
  Sandwich,
  type LucideIcon,
} from "lucide-react";

interface FoodIconProps {
  name: string;
  small?: boolean;
}

interface FoodIconMatch {
  icon: LucideIcon;
  tone: string;
  image?: string;
}

const getFoodIcon = (name: string): FoodIconMatch => {
  const normalizedName = name.toLowerCase();

  if (/chicken|meat|beef|poultry|turkey|pork|steak/.test(normalizedName)) {
    return {
      icon: Beef,
      tone: "meat",
      image: normalizedName.includes("chicken") ? `${import.meta.env.BASE_URL}assets/editorial/chicken-thighs.webp` : undefined,
    };
  }
  if (/milk|cream|half-and-half/.test(normalizedName)) {
    return { icon: Milk, tone: "milk", image: `${import.meta.env.BASE_URL}assets/editorial/whole-milk.webp` };
  }
  if (/yogurt|yoghurt|kefir/.test(normalizedName)) {
    return { icon: CupSoda, tone: "yogurt" };
  }
  if (/egg/.test(normalizedName)) {
    return { icon: Egg, tone: "egg" };
  }
  if (/pasta|soup|leftover|prepared|tuna/.test(normalizedName)) {
    return { icon: CookingPot, tone: "prepared" };
  }
  if (/sandwich|wrap|bread/.test(normalizedName)) {
    return { icon: Sandwich, tone: "prepared" };
  }
  if (/spinach|salad|lettuce|kale|greens|vegetable/.test(normalizedName)) {
    return { icon: Salad, tone: "produce" };
  }
  if (/apple|fruit|berry|berries|orange/.test(normalizedName)) {
    return { icon: Apple, tone: "produce" };
  }

  return { icon: Package, tone: "other" };
};

export function FoodIcon({ name, small = false }: FoodIconProps) {
  const { icon: Icon, tone, image } = getFoodIcon(name);

  return (
    <span
      className={`product-thumb food-icon food-icon-${tone}${small ? " product-thumb-small" : ""}`}
      aria-hidden="true"
    >
      {image ? <img src={image} alt="" /> : <Icon strokeWidth={1.9} />}
    </span>
  );
}
