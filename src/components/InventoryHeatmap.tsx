import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface HeatmapData {
  item: string;
  day: string;
  usage: number;
  week: number;
}

const mockHeatmapData: HeatmapData[] = [
  // Week 1
  { item: "Chicken Breast", day: "Mon", usage: 85, week: 1 },
  { item: "Chicken Breast", day: "Tue", usage: 92, week: 1 },
  { item: "Chicken Breast", day: "Wed", usage: 78, week: 1 },
  { item: "Chicken Breast", day: "Thu", usage: 95, week: 1 },
  { item: "Chicken Breast", day: "Fri", usage: 88, week: 1 },
  { item: "Chicken Breast", day: "Sat", usage: 76, week: 1 },
  { item: "Chicken Breast", day: "Sun", usage: 82, week: 1 },
  
  { item: "Ground Beef", day: "Mon", usage: 65, week: 1 },
  { item: "Ground Beef", day: "Tue", usage: 72, week: 1 },
  { item: "Ground Beef", day: "Wed", usage: 68, week: 1 },
  { item: "Ground Beef", day: "Thu", usage: 75, week: 1 },
  { item: "Ground Beef", day: "Fri", usage: 80, week: 1 },
  { item: "Ground Beef", day: "Sat", usage: 85, week: 1 },
  { item: "Ground Beef", day: "Sun", usage: 78, week: 1 },
  
  { item: "Tomatoes", day: "Mon", usage: 45, week: 1 },
  { item: "Tomatoes", day: "Tue", usage: 52, week: 1 },
  { item: "Tomatoes", day: "Wed", usage: 48, week: 1 },
  { item: "Tomatoes", day: "Thu", usage: 55, week: 1 },
  { item: "Tomatoes", day: "Fri", usage: 62, week: 1 },
  { item: "Tomatoes", day: "Sat", usage: 58, week: 1 },
  { item: "Tomatoes", day: "Sun", usage: 50, week: 1 },
  
  { item: "Salmon Fillet", day: "Mon", usage: 35, week: 1 },
  { item: "Salmon Fillet", day: "Tue", usage: 42, week: 1 },
  { item: "Salmon Fillet", day: "Wed", usage: 38, week: 1 },
  { item: "Salmon Fillet", day: "Thu", usage: 45, week: 1 },
  { item: "Salmon Fillet", day: "Fri", usage: 48, week: 1 },
  { item: "Salmon Fillet", day: "Sat", usage: 52, week: 1 },
  { item: "Salmon Fillet", day: "Sun", usage: 40, week: 1 },
  
  { item: "Fresh Basil", day: "Mon", usage: 15, week: 1 },
  { item: "Fresh Basil", day: "Tue", usage: 18, week: 1 },
  { item: "Fresh Basil", day: "Wed", usage: 22, week: 1 },
  { item: "Fresh Basil", day: "Thu", usage: 25, week: 1 },
  { item: "Fresh Basil", day: "Fri", usage: 28, week: 1 },
  { item: "Fresh Basil", day: "Sat", usage: 32, week: 1 },
  { item: "Fresh Basil", day: "Sun", usage: 20, week: 1 },
];

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const items = ["Chicken Breast", "Ground Beef", "Tomatoes", "Salmon Fillet", "Fresh Basil"];

const getIntensityColor = (usage: number) => {
  if (usage >= 80) return "hsl(var(--primary))";
  if (usage >= 60) return "hsl(var(--primary) / 0.8)";
  if (usage >= 40) return "hsl(var(--primary) / 0.6)";
  if (usage >= 20) return "hsl(var(--primary) / 0.4)";
  return "hsl(var(--primary) / 0.2)";
};

export default function InventoryHeatmap() {
  const [selectedItem, setSelectedItem] = useState<string>("All items");
  
  const filteredData = selectedItem === "All items" 
    ? mockHeatmapData 
    : mockHeatmapData.filter(data => data.item === selectedItem);

  const maxUsage = Math.max(...mockHeatmapData.map(d => d.usage));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Usage Heatmap & Time Series</CardTitle>
            <CardDescription>
              Visual representation of item usage patterns throughout the week
            </CardDescription>
          </div>
          <Select value={selectedItem} onValueChange={setSelectedItem}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All items">All items</SelectItem>
              {items.map(item => (
                <SelectItem key={item} value={item}>{item}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Heatmap Grid */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">Weekly Usage Patterns</h4>
            <div className="grid gap-2">
              {/* Header with days */}
              <div className="grid grid-cols-8 gap-2 text-xs font-medium text-muted-foreground">
                <div></div>
                {days.map(day => (
                  <div key={day} className="text-center">{day}</div>
                ))}
              </div>
              
              {/* Heatmap rows */}
              {(selectedItem === "All items" ? items : [selectedItem]).map(item => {
                const itemData = filteredData.filter(d => d.item === item);
                return (
                  <div key={item} className="grid grid-cols-8 gap-2 items-center">
                    <div className="text-xs font-medium text-right pr-2 truncate">{item}</div>
                    {days.map(day => {
                      const dayData = itemData.find(d => d.day === day);
                      const usage = dayData?.usage || 0;
                      return (
                        <div
                          key={`${item}-${day}`}
                          className="aspect-square rounded-sm border border-border flex items-center justify-center text-xs font-medium relative group cursor-pointer"
                          style={{ backgroundColor: getIntensityColor(usage) }}
                        >
                          <span className="text-white drop-shadow-sm">
                            {usage > 0 ? usage : ""}
                          </span>
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-popover border border-border rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            {item}: {usage} units on {day}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4">
            <span className="text-xs font-medium text-muted-foreground">Usage Intensity:</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Low</span>
              <div className="flex gap-1">
                {[0.2, 0.4, 0.6, 0.8, 1].map((opacity, index) => (
                  <div
                    key={index}
                    className="w-3 h-3 rounded-sm border border-border"
                    style={{ backgroundColor: `hsl(var(--primary) / ${opacity})` }}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">High</span>
            </div>
          </div>

          {/* Peak Usage Times */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Peak Usage Analysis</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(selectedItem === "All items" ? items : [selectedItem]).map(item => {
                const itemData = filteredData.filter(d => d.item === item);
                const peakDay = itemData.reduce((prev, current) => 
                  prev.usage > current.usage ? prev : current
                );
                
                return (
                  <div key={item} className="p-3 rounded-lg border bg-card">
                    <div className="font-medium text-sm">{item}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Peak: {peakDay.day} ({peakDay.usage} units)
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Avg: {Math.round(itemData.reduce((sum, d) => sum + d.usage, 0) / itemData.length)} units/day
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}