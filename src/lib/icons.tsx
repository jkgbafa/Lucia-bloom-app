// Shared string-keyed icon renderer. Explicit imports keep the rest of
// lucide-react out of the bundle (import * as Icons defeats tree-shaking).
import {
  Activity, AlertCircle, AlertTriangle, ArrowDown, ArrowUp, ArrowUpRight, Award,
  Battery, BatteryCharging, BatteryFull, BatteryLow, BatteryMedium, Brain,
  Calendar, Check, CheckCircle, CheckCircle2, Circle, Cloud, CloudLightning,
  CloudRain, Coffee, Droplet, Droplets, Dumbbell, EyeOff, Feather, Flame,
  Flower2, Footprints, Heart, Leaf, Lightbulb, MessageCircle, Minus, MinusCircle,
  Moon, MoreHorizontal, PenTool, PlaySquare, Repeat, ShieldAlert, ShieldCheck,
  Smile, Sparkles, Star, Sun, Target, Thermometer, User, Users, Waves, Wind,
  X, XCircle, XOctagon, Zap,
  type LucideProps,
} from 'lucide-react';

const ICONS: Record<string, React.ComponentType<LucideProps>> = {
  Activity, AlertCircle, AlertTriangle, ArrowDown, ArrowUp, ArrowUpRight, Award,
  Battery, BatteryCharging, BatteryFull, BatteryLow, BatteryMedium, Brain,
  Calendar, Check, CheckCircle, CheckCircle2, Circle, Cloud, CloudLightning,
  CloudRain, Coffee, Droplet, Droplets, Dumbbell, EyeOff, Feather, Flame,
  Flower2, Footprints, Heart, Leaf, Lightbulb, MessageCircle, Minus, MinusCircle,
  Moon, MoreHorizontal, PenTool, PlaySquare, Repeat, ShieldAlert, ShieldCheck,
  Smile, Sparkles, Star, Sun, Target, Thermometer, User, Users, Waves, Wind,
  X, XCircle, XOctagon, Zap,
};

export const renderIcon = (name: string, props: LucideProps = {}) => {
  const IconComponent = ICONS[name];
  if (!IconComponent) return null;
  return <IconComponent {...props} />;
};
