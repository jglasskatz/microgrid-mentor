import { SystemPower } from "@/lib/power-utils";
import { Card } from "@/components/ui/card";
import { Battery, Sun, PowerSquare, ArrowRightLeft } from "lucide-react";

interface PowerSummaryPanelProps {
  systemPower: SystemPower;
}

export default function PowerSummaryPanel({ systemPower }: PowerSummaryPanelProps) {
  const { totalGeneration, totalConsumption, storageCapacity, netPower } = systemPower;
  const isPositiveBalance = netPower >= 0;

  return (
    <div className="absolute top-4 left-4 z-10">
      <Card className="p-4 flex gap-4">
        <div className="flex items-center gap-2">
          <Sun className="h-4 w-4 text-green-500" />
          <div>
            <div className="text-sm font-medium">Generation</div>
            <div className="text-lg font-semibold">{totalGeneration.toFixed(0)}W</div>
          </div>
        </div>

        <div className="w-px bg-border" />

        <div className="flex items-center gap-2">
          <PowerSquare className="h-4 w-4 text-red-500" />
          <div>
            <div className="text-sm font-medium">Consumption</div>
            <div className="text-lg font-semibold">{totalConsumption.toFixed(0)}W</div>
          </div>
        </div>

        <div className="w-px bg-border" />

        <div className="flex items-center gap-2">
          <Battery className="h-4 w-4 text-blue-500" />
          <div>
            <div className="text-sm font-medium">Storage</div>
            <div className="text-lg font-semibold">{storageCapacity.toFixed(0)}Wh</div>
          </div>
        </div>

        <div className="w-px bg-border" />

        <div className="flex items-center gap-2">
          <ArrowRightLeft className={`h-4 w-4 ${isPositiveBalance ? 'text-green-500' : 'text-red-500'}`} />
          <div>
            <div className="text-sm font-medium">Net Power</div>
            <div className={`text-lg font-semibold ${isPositiveBalance ? 'text-green-600' : 'text-red-600'}`}>
              {netPower.toFixed(0)}W
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
