import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const data = [
  { name: "Mains", value: 40, profit: 400000, color: "#8B5CF6" },
  { name: "Sides", value: 25, profit: 250000, color: "#06B6D4" },
  { name: "Desserts", value: 20, profit: 200000, color: "#10B981" },
  { name: "Beverages", value: 15, profit: 150000, color: "#F59E0B" },
];

const totalProfit = data.reduce((sum, item) => sum + item.profit, 0);

const ProfitByMenuCategory = () => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="border-none shadow-sm bg-white">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold text-gray-900">
          Profit by Menu Category
        </CardTitle>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(totalProfit)}
            </p>
            <p className="text-sm text-gray-500">Total Profit</p>
          </div>
          <Select defaultValue="this-year">
            <SelectTrigger className="w-32 h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this-year">This Year</SelectItem>
              <SelectItem value="last-year">Last Year</SelectItem>
              <SelectItem value="this-month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Donut Chart */}
          <div className="flex justify-center">
            <ResponsiveContainer width={250} height={250}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Text Breakdown */}
          <div className="space-y-4">
            {data.map((category) => (
              <div key={category.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: category.color }}
                  />
                  <div>
                    <span className="font-medium text-gray-900">{category.name}</span>
                    <span className="text-gray-500 ml-2">({category.value}%)</span>
                  </div>
                </div>
                <span className="font-medium text-gray-700">
                  {formatCurrency(category.profit)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfitByMenuCategory;