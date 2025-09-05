import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, CheckCircle, XCircle, TrendingUp, TrendingDown, Package, ShoppingCart, Truck, FileText } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { NotificationCenter } from "@/components/NotificationCenter";

// Import ingredient images
import cherryTomatoes from "@/assets/cherry-tomatoes.jpg";
import eggs from "@/assets/eggs.jpg";
import mozzarella from "@/assets/mozzarella.jpg";
import flour from "@/assets/flour.jpg";

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minThreshold: number;
  maxCapacity: number;
  unit: string;
  lastUpdated: string;
  weeklyUsage: number;
  dailyUsage: number;
  status: 'adequate' | 'low' | 'out';
}

const mockInventoryData: InventoryItem[] = [
  {
    id: "1",
    name: "Chicken Breast",
    category: "Protein",
    currentStock: 45,
    minThreshold: 20,
    maxCapacity: 100,
    unit: "lbs",
    lastUpdated: "2024-01-25 14:30",
    weeklyUsage: 85,
    dailyUsage: 12,
    status: 'adequate'
  },
  {
    id: "2",
    name: "Salmon Fillet",
    category: "Protein",
    currentStock: 8,
    minThreshold: 15,
    maxCapacity: 50,
    unit: "lbs",
    lastUpdated: "2024-01-25 14:25",
    weeklyUsage: 42,
    dailyUsage: 6,
    status: 'low'
  },
  {
    id: "3",
    name: "Fresh Basil",
    category: "Herbs",
    currentStock: 0,
    minThreshold: 5,
    maxCapacity: 20,
    unit: "oz",
    lastUpdated: "2024-01-25 12:00",
    weeklyUsage: 15,
    dailyUsage: 2,
    status: 'out'
  },
  {
    id: "4",
    name: "Extra Virgin Olive Oil",
    category: "Pantry",
    currentStock: 32,
    minThreshold: 10,
    maxCapacity: 50,
    unit: "liters",
    lastUpdated: "2024-01-25 14:35",
    weeklyUsage: 18,
    dailyUsage: 2.5,
    status: 'adequate'
  },
  {
    id: "5",
    name: "Tomatoes",
    category: "Vegetables",
    currentStock: 12,
    minThreshold: 25,
    maxCapacity: 80,
    unit: "lbs",
    lastUpdated: "2024-01-25 13:45",
    weeklyUsage: 65,
    dailyUsage: 9,
    status: 'low'
  },
  {
    id: "6",
    name: "Ground Beef",
    category: "Protein",
    currentStock: 78,
    minThreshold: 30,
    maxCapacity: 120,
    unit: "lbs",
    lastUpdated: "2024-01-25 14:20",
    weeklyUsage: 95,
    dailyUsage: 14,
    status: 'adequate'
  }
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'adequate':
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'low':
      return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    case 'out':
      return <XCircle className="h-4 w-4 text-red-600" />;
    default:
      return null;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'adequate':
      return 'bg-green-600';
    case 'low':
      return 'bg-yellow-600';
    case 'out':
      return 'bg-red-600';
    default:
      return 'bg-gray-400';
  }
};

const getStockPercentage = (current: number, max: number) => {
  return Math.min((current / max) * 100, 100);
};

export default function Inventory() {
  const [categoryFilter, setCategoryFilter] = useState<string>("All categories");
  const [timeFrame, setTimeFrame] = useState<string>("daily");

  const categories = ["All categories", ...Array.from(new Set(mockInventoryData.map(item => item.category)))];
  
  const filteredData = categoryFilter === "All categories" 
    ? mockInventoryData 
    : mockInventoryData.filter(item => item.category === categoryFilter);

  const lowStockItems = mockInventoryData.filter(item => item.status === 'low' || item.status === 'out');

  const totalItems = mockInventoryData.length;
  const adequateStock = mockInventoryData.filter(item => item.status === 'adequate').length;
  const lowStock = mockInventoryData.filter(item => item.status === 'low').length;
  const outOfStock = mockInventoryData.filter(item => item.status === 'out').length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-muted-foreground">Monitor stock levels and track usage patterns</p>
        </div>
        <div className="flex items-center gap-4">
          <NotificationCenter lowStockItems={lowStockItems} />
          <Select value={timeFrame} onValueChange={setTimeFrame}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>


      {/* Product Overview Summary Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>
              Real-time status breakdown and availability summary
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="flex items-center justify-between flex-1">
              {/* Left Side: Metric Breakdown */}
              <div className="space-y-4 flex-1">
                <div className="flex items-center space-x-3">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <span className="text-sm font-medium">Out of Stock</span>
                  <span className="text-sm text-muted-foreground">({outOfStock})</span>
                </div>
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <span className="text-sm font-medium">Low Stock</span>
                  <span className="text-sm text-muted-foreground">({lowStock})</span>
                </div>
              </div>
              
              {/* Right Side: Donut Chart */}
              <div className="flex-1 max-w-xs">
                <div className="relative">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Available', value: Math.round(((adequateStock + lowStock) / totalItems) * 100) },
                          { name: 'Unavailable', value: Math.round((outOfStock / totalItems) * 100) }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        startAngle={90}
                        endAngle={450}
                        dataKey="value"
                      >
                        <Cell fill="hsl(142, 76%, 36%)" />
                        <Cell fill="hsl(0, 84%, 60%)" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {Math.round(((adequateStock + lowStock) / totalItems) * 100)}%
                      </div>
                      <div className="text-xs text-muted-foreground">Available</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 space-y-2">
              <button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium transition-colors">
                View Full Inventory
              </button>
              <Link 
                to="/app/inventory/analytics" 
                className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-md px-4 py-2 text-sm font-medium transition-colors inline-block text-center"
              >
                View Analytics
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle>Purchase Orders Overview</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="space-y-4 flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">🧾</span>
                  <span className="text-sm text-muted-foreground">Total POs:</span>
                </div>
                <div className="text-lg font-bold">18</div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">📦</span>
                  <span className="text-sm text-muted-foreground">Orders Received:</span>
                </div>
                <div className="text-lg font-bold">12</div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">🚚</span>
                  <span className="text-sm text-muted-foreground">In Transit:</span>
                </div>
                <div className="text-lg font-bold">4</div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">💰</span>
                  <span className="text-sm text-muted-foreground">Total Spent:</span>
                </div>
                <div className="text-lg font-bold">$2,974.80</div>
              </div>
            </div>
            
            <div className="mt-6">
              <button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium transition-colors">
                View Full History
              </button>
            </div>
          </CardContent>
        </Card>
      </div>


      {/* Filters */}
      <div className="flex items-center gap-4">
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

      {/* Live Stock Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Live Stock Overview</CardTitle>
          <CardDescription>
            Real-time display of current inventory levels by ingredient/item
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ingredient</TableHead>
                <TableHead>In Hand</TableHead>
                <TableHead>Minimum</TableHead>
                <TableHead>To Receive</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>
                  <span className="font-medium">Tomatoes</span>
                </TableCell>
                <TableCell>
                  <span className="font-medium">25</span>
                </TableCell>
                <TableCell>
                  <span className="text-muted-foreground">15</span>
                </TableCell>
                <TableCell>
                  <span className="font-medium">10</span>
                </TableCell>
                <TableCell>
                  <span className="font-medium">kg</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600">In Stock</span>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <span className="font-medium">Eggs</span>
                </TableCell>
                <TableCell>
                  <span className="font-medium">120</span>
                </TableCell>
                <TableCell>
                  <span className="text-muted-foreground">100</span>
                </TableCell>
                <TableCell>
                  <span className="font-medium">30</span>
                </TableCell>
                <TableCell>
                  <span className="font-medium">pcs</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600">In Stock</span>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <span className="font-medium">Milk</span>
                </TableCell>
                <TableCell>
                  <span className="font-medium">15</span>
                </TableCell>
                <TableCell>
                  <span className="text-muted-foreground">20</span>
                </TableCell>
                <TableCell>
                  <span className="font-medium">5</span>
                </TableCell>
                <TableCell>
                  <span className="font-medium">L</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm text-yellow-600">Low Stock</span>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

    </div>
  );
}