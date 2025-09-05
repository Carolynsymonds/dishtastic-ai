import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import InventoryHeatmap from "@/components/InventoryHeatmap";

interface InventoryMovement {
  id: string;
  name: string;
  category: string;
  usage: number;
  unit: string;
  trend: 'up' | 'down';
  changePercent: number;
}

const mockMovementData: InventoryMovement[] = [
  {
    id: "1",
    name: "Chicken Breast",
    category: "Protein",
    usage: 85,
    unit: "lbs/week",
    trend: 'up',
    changePercent: 15
  },
  {
    id: "2",
    name: "Ground Beef",
    category: "Protein", 
    usage: 78,
    unit: "lbs/week",
    trend: 'up',
    changePercent: 12
  },
  {
    id: "3",
    name: "Tomatoes",
    category: "Vegetables",
    usage: 65,
    unit: "lbs/week",
    trend: 'up',
    changePercent: 8
  },
  {
    id: "4",
    name: "Salmon Fillet",
    category: "Protein",
    usage: 42,
    unit: "lbs/week",
    trend: 'down',
    changePercent: -5
  },
  {
    id: "5",
    name: "Extra Virgin Olive Oil",
    category: "Pantry",
    usage: 18,
    unit: "liters/week",
    trend: 'down',
    changePercent: -3
  },
  {
    id: "6",
    name: "Fresh Basil",
    category: "Herbs",
    usage: 15,
    unit: "oz/week",
    trend: 'down',
    changePercent: -20
  },
  {
    id: "7",
    name: "Oregano",
    category: "Herbs",
    usage: 8,
    unit: "oz/week",
    trend: 'down',
    changePercent: -10
  },
  {
    id: "8",
    name: "Bay Leaves",
    category: "Herbs",
    usage: 5,
    unit: "oz/week",
    trend: 'down',
    changePercent: -15
  }
];

export default function InventoryAnalytics() {
  const [timeRange, setTimeRange] = useState<string>("weekly");
  const [categoryFilter, setCategoryFilter] = useState<string>("All categories");

  const categories = ["All categories", ...Array.from(new Set(mockMovementData.map(item => item.category)))];
  
  const filteredData = categoryFilter === "All categories" 
    ? mockMovementData 
    : mockMovementData.filter(item => item.category === categoryFilter);

  // Sort by usage and get top 5 and bottom 5
  const sortedByUsage = [...filteredData].sort((a, b) => b.usage - a.usage);
  const topMovers = sortedByUsage.slice(0, 5);
  const lowMovers = sortedByUsage.slice(-5).reverse();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            to="/app/inventory" 
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Inventory
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Inventory Analytics</h1>
            <p className="text-muted-foreground">Analyze usage patterns and movement trends</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Top/Low Movers Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Movers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Top 5 Moving Items
            </CardTitle>
            <CardDescription>
              Fastest moving ingredients in the selected time range
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topMovers.map((item, index) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-muted-foreground">{item.category}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{item.usage} {item.unit}</div>
                    <div className="flex items-center gap-1 text-sm">
                      <TrendingUp className="h-3 w-3 text-green-600" />
                      <span className="text-green-600">+{item.changePercent}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Low Movers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              Top 5 Slow Moving Items
            </CardTitle>
            <CardDescription>
              Slowest moving ingredients in the selected time range
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowMovers.map((item, index) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-800 text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-muted-foreground">{item.category}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{item.usage} {item.unit}</div>
                    <div className="flex items-center gap-1 text-sm">
                      <TrendingDown className="h-3 w-3 text-red-600" />
                      <span className="text-red-600">{item.changePercent}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Heatmaps & Time Series Section */}
      <InventoryHeatmap />
    </div>
  );
}