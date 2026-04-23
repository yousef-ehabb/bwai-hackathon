import { AlertCircle, ArrowRight } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface MgrSLAAlertProps {
  count: number;
}

export function MgrSLAAlert({ count }: MgrSLAAlertProps) {
  const router = useRouter();
  if (count === 0) return null;

  return (
    <Alert className="bg-danger/10 border-danger/20 text-danger rounded-[24px] p-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-start gap-4">
        <div className="bg-danger text-white p-2 rounded-full">
           <AlertCircle className="h-6 w-6" />
        </div>
        <div>
          <AlertTitle className="text-xl font-display font-medium tracking-tight mb-1">
            Service Level Breach Detected
          </AlertTitle>
          <AlertDescription className="text-danger/80">
            There are {count} high-priority reports that have been unassigned for over 4 hours. Immediate triage required.
          </AlertDescription>
        </div>
      </div>
      <Button className="bg-danger border-danger text-white rounded-full hover:opacity-90" onClick={() => router.push('/manager/reports?filter=SLA')}>
         View Breaches <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </Alert>
  );
}
