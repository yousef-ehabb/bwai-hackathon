import { Badge } from '@/components/ui/badge';
import { Role } from '@/lib/types';
import { cn } from '@/lib/utils';

const roleStyles: Record<Role, string> = {
  citizen: 'bg-yellow-500/10 text-[#b09000] border-[#b09000]/20 hover:bg-yellow-500/10',
  technician: 'bg-[#494fdf]/10 text-[#494fdf] border-[#494fdf]/20 hover:bg-[#494fdf]/10',
  manager: 'bg-[#00a87e]/10 text-[#00a87e] border-[#00a87e]/20 hover:bg-[#00a87e]/10',
  governor: 'bg-[#e61e49]/10 text-[#e61e49] border-[#e61e49]/20 hover:bg-[#e61e49]/10',
};

export default function RoleBadge({ role, className }: { role: Role, className?: string }) {
  return (
    <Badge 
      variant="outline" 
      className={cn("rounded-full px-3 py-0.5 font-body text-[10px] font-bold tracking-widest uppercase", roleStyles[role], className)}
    >
      {role}
    </Badge>
  );
}
