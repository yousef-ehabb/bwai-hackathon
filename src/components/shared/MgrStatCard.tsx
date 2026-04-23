import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MgrStatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color?: 'primary' | 'yellow' | 'blue' | 'green' | 'red';
  trend?: string;
}

export function MgrStatCard({ label, value, icon, color = 'primary', trend }: MgrStatCardProps) {
  const textStyles: Record<string, string> = {
    primary: 'text-primary',
    yellow: 'text-[#ec7e00]',
    blue: 'text-[#494fdf]',
    green: 'text-[#00a87e]',
    red: 'text-[#e23b4a]',
  };

  const bgStyles: Record<string, string> = {
    primary: 'bg-primary/10',
    yellow: 'bg-[#ec7e00]/10',
    blue: 'bg-[#494fdf]/10',
    green: 'bg-[#00a87e]/10',
    red: 'bg-[#e23b4a]/10',
  };

  return (
    <Card className="bg-surface border-none rounded-[28px] overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={cn("p-3 rounded-2xl", bgStyles[color])}>
            {icon}
          </div>
          {trend && (
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-white/50 px-2 py-1 rounded-full border border-border">
              {trend}
            </span >
          )}
        </div>
        <div>
          <p className="text-[12px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{label}</p>
          <p className={cn('text-4xl font-display font-medium tracking-tighter', textStyles[color])}>
             {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
