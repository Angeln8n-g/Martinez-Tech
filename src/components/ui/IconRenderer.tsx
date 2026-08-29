import React from 'react';
import {
  Camera,
  Network,
  Car,
  Lock,
  Fingerprint,
  Clock,
  Bell,
  PhoneCall,
  Shield,
  CheckCircle2,
  Wrench,
  Cpu,
  Layers,
  HelpCircle,
  LucideIcon
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  Camera,
  Network,
  Car,
  Lock,
  Fingerprint,
  Clock,
  Bell,
  PhoneCall,
  Shield,
  CheckCircle2,
  Wrench,
  Cpu,
  Layers
};

interface IconRendererProps {
  name: string;
  className?: string;
  size?: number;
}

export const IconRenderer: React.FC<IconRendererProps> = ({ name, className = 'w-5 h-5', size }) => {
  const Component = iconMap[name] || HelpCircle;
  return <Component className={className} size={size} />;
};
