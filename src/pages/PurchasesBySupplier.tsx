import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import { Calendar, Download, Filter } from "lucide-react";

const PurchasesBySupplier = () => {
  const [selectedDateRange, setSelectedDateRange] = useState("Last week");
  const [selectedSupplier, setSelectedSupplier] = useState("Bakery Best");
  const [selectedBuyer, setSelectedBuyer] = useState("All buyers");

  // Mock data for the donut chart summary
  const supplierData = {
    name: "Bakery Best",
    percentage: 22,
    amount: 8348,
    totalPurchases: 38008
  };

  // Mock data for bar chart (simplified for this example)
  const barChartData = [
    { supplier: "Bakery Best", amount: 8348 },
    { supplier: "Fresh Produce Co", amount: 12500 },
    { supplier: "Meat Masters", amount: 9800 },
    { supplier: "Seafood Supply", amount: 7200 },
    { supplier: "Others", amount: 2160 }
  ];

  // Mock transaction data
  const transactions = [
    {
      number: "INV-2024-001",
      buyerName: "Sofia (GM)",
      effectiveDate: "2024-01-15",
      totalExclTax: 1250.00,
      totalInclTax: 1375.00,
      paymentDueDate: "2024-02-15",
      balance: 0.00,
      status: "paid"
    },
    {
      number: "INV-2024-002",
      buyerName: "Marco (Chef)",
      effectiveDate: "2024-01-18",
      totalExclTax: 890.50,
      totalInclTax: 979.55,
      paymentDueDate: "2024-02-18",
      balance: 979.55,
      status: "pending"
    },
    {
      number: "INV-2024-003",
      buyerName: "Sofia (GM)",
      effectiveDate: "2024-01-20",
      totalExclTax: 2100.00,
      totalInclTax: 2310.00,
      paymentDueDate: "2024-02-20",
      balance: 2310.00,
      status: "overdue"
    },
    {
      number: "INV-2024-004",
      buyerName: "Marco (Chef)",
      effectiveDate: "2024-01-22",
      totalExclTax: 675.25,
      totalInclTax: 742.78,
      paymentDueDate: "2024-02-22",
      balance: 0.00,
      status: "paid"
    },
    {
      number: "INV-2024-005",
      buyerName: "Sofia (GM)",
      effectiveDate: "2024-01-25",
      totalExclTax: 1425.75,
      totalInclTax: 1568.33,
      paymentDueDate: "2024-02-25",
      balance: 1568.33,
      status: "pending"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "overdue": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const maxBarHeight = Math.max(...barChartData.map(item => item.amount));

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background pt-20">
        <div className="container mx-auto px-4 py-8">
          {/* Page Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold font-grotesk text-foreground">
                Purchases by Supplier
              </h1>
              <p className="text-muted-foreground mt-2">
                Track and analyze your supplier purchase data and outstanding payments.
              </p>
            </div>
            <div className="flex gap-3">
              <Button size="sm" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button size="sm" variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Advanced Filters
              </Button>
            </div>
          </div>

          {/* Filter Bar */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Date Range
                  </label>
                  <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
                    <SelectTrigger>
                      <Calendar className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Last week">Last week</SelectItem>
                      <SelectItem value="Last month">Last month</SelectItem>
                      <SelectItem value="Last quarter">Last quarter</SelectItem>
                      <SelectItem value="Last year">Last year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex-1">
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Supplier
                  </label>
                  <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bakery Best">Bakery Best</SelectItem>
                      <SelectItem value="Fresh Produce Co">Fresh Produce Co</SelectItem>
                      <SelectItem value="Meat Masters">Meat Masters</SelectItem>
                      <SelectItem value="Seafood Supply">Seafood Supply</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex-1">
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Buyer
                  </label>
                  <Select value={selectedBuyer} onValueChange={setSelectedBuyer}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All buyers">All buyers</SelectItem>
                      <SelectItem value="Sofia (GM)">Sofia (GM)</SelectItem>
                      <SelectItem value="Marco (Chef)">Marco (Chef)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary Visuals */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Donut Chart Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Supplier Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center mb-6">
                  {/* Improved donut chart */}
                  <div className="relative w-40 h-40">
                    {/* Background circle */}
                    <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 160 160">
                      {/* Background ring */}
                      <circle
                        cx="80"
                        cy="80"
                        r="60"
                        stroke="hsl(var(--muted))"
                        strokeWidth="20"
                        fill="transparent"
                      />
                      {/* Filled portion */}
                      <circle
                        cx="80"
                        cy="80"
                        r="60"
                        stroke="hsl(var(--primary))"
                        strokeWidth="20"
                        fill="transparent"
                        strokeDasharray={`${supplierData.percentage * 3.77} 377`}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>
                    {/* Center content */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary">{supplierData.percentage}%</div>
                        <div className="text-xs text-muted-foreground">of total spend</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Legend */}
                <div className="flex justify-center gap-6 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                    <span className="text-xs text-muted-foreground">{supplierData.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-muted"></div>
                    <span className="text-xs text-muted-foreground">Other Suppliers</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Supplier:</span>
                    <span className="text-sm font-medium">{supplierData.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Amount:</span>
                    <span className="text-sm font-bold text-primary">{formatCurrency(supplierData.amount)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Purchases:</span>
                    <span className="text-sm font-medium">{formatCurrency(supplierData.totalPurchases)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Other Suppliers:</span>
                    <span className="text-sm font-medium">{formatCurrency(supplierData.totalPurchases - supplierData.amount)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Purchases by Supplier</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative h-80">
                  {/* Chart Container */}
                  <div className="h-full flex flex-col">
                    {/* Y-Axis Values */}
                    <div className="flex-1 relative">
                      <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-muted-foreground">
                        <span>{formatCurrency(maxBarHeight)}</span>
                        <span>{formatCurrency(maxBarHeight * 0.75)}</span>
                        <span>{formatCurrency(maxBarHeight * 0.5)}</span>
                        <span>{formatCurrency(maxBarHeight * 0.25)}</span>
                        <span>$0</span>
                      </div>
                      
                      {/* Grid Lines */}
                      <div className="ml-16 h-full relative">
                        <div className="absolute inset-0 flex flex-col justify-between">
                          {[0, 1, 2, 3, 4].map((i) => (
                            <div key={i} className="border-t border-muted/30 w-full" />
                          ))}
                        </div>
                        
                        {/* Bars */}
                        <div className="h-full flex items-end justify-between gap-4 px-4 relative z-10">
                          {barChartData.map((item, index) => {
                            // Color gradient from light green to dark green
                            const intensity = (index + 1) / barChartData.length;
                            const greenShade = Math.floor(120 + (intensity * 60)); // HSL green hue with varying lightness
                            const backgroundColor = `hsl(${greenShade}, 60%, ${70 - (intensity * 30)}%)`;
                            
                            return (
                              <div key={index} className="flex flex-col items-center flex-1 h-full max-w-16">
                                <div className="flex-1 flex items-end w-full relative group">
                                  <div 
                                    className="w-full rounded-t-md transition-all duration-500 min-h-[4px] shadow-sm hover:shadow-md cursor-pointer relative"
                                    style={{ 
                                      height: `${(item.amount / maxBarHeight) * 100}%`,
                                      backgroundColor: backgroundColor
                                    }}
                                  >
                                    {/* Tooltip on hover */}
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                                      {item.supplier}: {formatCurrency(item.amount)}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Data Table */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Number</TableHead>
                      <TableHead>Buyer Name</TableHead>
                      <TableHead>Effective Date</TableHead>
                      <TableHead className="text-right">Total (Excl. Tax)</TableHead>
                      <TableHead className="text-right">Total (Incl. Tax)</TableHead>
                      <TableHead>Payment Due Date</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.number}>
                        <TableCell className="font-medium">{transaction.number}</TableCell>
                        <TableCell>{transaction.buyerName}</TableCell>
                        <TableCell>{transaction.effectiveDate}</TableCell>
                        <TableCell className="text-right">{formatCurrency(transaction.totalExclTax)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(transaction.totalInclTax)}</TableCell>
                        <TableCell>{transaction.paymentDueDate}</TableCell>
                        <TableCell className="text-right">
                          {transaction.balance > 0 ? (
                            <span className="font-medium text-red-600">
                              {formatCurrency(transaction.balance)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(transaction.status)}>
                            {transaction.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default PurchasesBySupplier;