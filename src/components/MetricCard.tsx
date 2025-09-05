import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  change: string;
  changeLabel?: string;
}

const MetricCard = ({ title, value, change, changeLabel = "from last week" }: MetricCardProps) => {
  return (
    <Card className="border-none shadow-sm bg-gray-50/60 hover:bg-gray-100/60 transition-colors cursor-pointer">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div>
              <p className="font-medium text-gray-600 mb-1 text-[12px] max-w-[100px]">{title}</p>
              <p className="text-3xl font-bold text-gray-900">{value}</p>
            </div>
          </div>
          <div className="text-right">
            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 mb-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              {change}
            </Badge>
            <p className="text-gray-500 text-[10px]">{changeLabel}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MetricCard;