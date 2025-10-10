"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DollarSign,
  TrendingUp,
  Wallet,
  Download,
  Filter,
  Plus,
  Calendar,
  PieChart,
  BarChart3,
  CreditCard,
  Building,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  MoreHorizontal,
  Construction,
  Wrench,
  Bell,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import type { DateRange } from "react-day-picker";

// Mock data for transactions
const MOCK_TRANSACTIONS = [
  {
    id: "TX-1001",
    date: "2025-09-11",
    description: "Payment from Order #1024",
    type: "Income",
    amount: 36000.0,
    status: "Completed",
    category: "Order Payment",
  },
  {
    id: "TX-1002",
    date: "2025-09-08",
    description: "Fabric purchase from 'Silk & Co.'",
    type: "Withdrawal",
    amount: -9640.0,
    status: "Completed",
    category: "Materials",
  },
  {
    id: "TX-1003",
    date: "2025-09-07",
    description: "Payment from Order #1023",
    type: "Income",
    amount: 20000.0,
    status: "Completed",
    category: "Order Payment",
  },
  {
    id: "TX-1004",
    date: "2025-09-06",
    description: "Monthly rent for workshop",
    type: "Withdrawal",
    amount: -40000.0,
    status: "Completed",
    category: "Rent",
  },
  {
    id: "TX-1005",
    date: "2025-09-05",
    description: "Payment from Order #1022",
    type: "Income",
    amount: 6000.0,
    status: "Pending",
    category: "Order Payment",
  },
  {
    id: "TX-1006",
    date: "2025-09-05",
    description: "New sewing machine purchase",
    type: "Withdrawal",
    amount: -28000.0,
    status: "Completed",
    category: "Equipment",
  },
  {
    id: "TX-1007",
    date: "2025-09-04",
    description: "Utility bill payment",
    type: "Withdrawal",
    amount: -6820.0,
    status: "Completed",
    category: "Utilities",
  },
  {
    id: "TX-1008",
    date: "2025-09-03",
    description: "Payment from Order #1021",
    type: "Income",
    amount: 14400.0,
    status: "Completed",
    category: "Order Payment",
  },
];

// Mock data for expense categories
const EXPENSE_CATEGORIES = [
  { name: "Materials", amount: 845.75, percentage: 45, color: "bg-blue-500" },
  { name: "Rent", amount: 500, percentage: 27, color: "bg-green-500" },
  { name: "Equipment", amount: 350, percentage: 19, color: "bg-purple-500" },
  { name: "Utilities", amount: 185.25, percentage: 9, color: "bg-amber-500" },
];

export default function FinancePage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const router = useRouter();
  const [notified, setNotified] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Calculate financial metrics
  const totalIncome = MOCK_TRANSACTIONS
    .filter(t => t.type === "Income")
    .reduce((sum, transaction) => sum + transaction.amount, 0);
    
  const todaysIncome = MOCK_TRANSACTIONS
    .filter(t => t.type === 'Income' && t.date === new Date().toISOString().split('T')[0])
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const totalExpenses = MOCK_TRANSACTIONS
    .filter(t => t.type === "Withdrawal")
    .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);
    
  const netProfit = totalIncome - totalExpenses;

  const withdrawableBalance = Math.max(0, MOCK_TRANSACTIONS
    .filter(t => t.type === 'Income' && t.status === 'Completed')
    .reduce((sum, t) => sum + t.amount, 0) - totalExpenses) * 0.7;
  
  const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

  // Filter transactions based on selected filters
  const filteredTransactions = MOCK_TRANSACTIONS.filter(transaction => {
    const categoryMatch = categoryFilter === "all" || transaction.category === categoryFilter;
    const statusMatch = statusFilter === "all" || transaction.status === statusFilter;
    return categoryMatch && statusMatch;
  });

  return (
    <main className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8 bg-muted/20 relative overflow-hidden">
      {/* Main Content - Dimmed but not blurred so sidebar isn't affected */}
      <div className="opacity-40 pointer-events-none select-none">
        {/* Mobile app-like header */}
        <div className="flex items-center justify-between md:hidden">
          <div>
            <h2 className="text-lg font-semibold">Finance</h2>
            <p className="text-xs text-muted-foreground">Overview</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="p-2">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="p-2">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Desktop header (hidden on mobile) */}
        <div className="hidden md:flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Financial Dashboard</h1>
            <p className="text-muted-foreground">
              Track your income, expenses, and financial performance
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-1">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
            <Button className="gap-1">
              <Plus className="h-4 w-4" />
              Add Transaction
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="p-3 md:p-4">
                <CardHeader className="flex items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                  <div className="p-2 rounded-full bg-green-100 text-green-600">
                    <DollarSign className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl md:text-3xl font-bold">₹{totalIncome.toLocaleString('en-IN')}</div>
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    <ArrowUpRight className="h-3 w-3 mr-1 text-green-600" />
                    <span className="text-green-600">+25% from last month</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="p-3 md:p-4">
                <CardHeader className="flex items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Today's Income</CardTitle>
                  <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                    <DollarSign className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl md:text-3xl font-bold">₹{todaysIncome.toLocaleString('en-IN')}</div>
                   <p className="text-xs text-muted-foreground pt-2">
                      Income received today.
                    </p>
                </CardContent>
              </Card>

              <Card className="p-3 md:p-4">
                <CardHeader className="flex items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Withdrawable</CardTitle>
                  <div className="p-2 rounded-full bg-amber-100 text-amber-600">
                    <Wallet className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl md:text-3xl font-bold">₹{withdrawableBalance.toLocaleString('en-IN')}</div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" className="w-full mt-2">
                        <Wallet className="mr-2 h-4 w-4" />
                        Withdraw
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Withdraw Earnings</DialogTitle>
                        <DialogDescription>
                          Enter the amount you would like to withdraw. Your current available balance is ₹{withdrawableBalance.toLocaleString('en-IN')}.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="amount" className="text-right">
                            Amount
                          </Label>
                          <Input
                            id="amount"
                            defaultValue="₹10,000.00"
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="account" className="text-right">
                            Account
                          </Label>
                          <Select defaultValue="primary">
                            <SelectTrigger className="col-span-3">
                              <SelectValue placeholder="Select account" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="primary">Primary Bank (****4321)</SelectItem>
                              <SelectItem value="savings">Savings Account (****8765)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit">Confirm Withdrawal</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
              <Card className="md:col-span-1 lg:col-span-4">
                <CardHeader>
                  <CardTitle>Order Transactions</CardTitle>
                  <CardDescription>
                    Recent transactions from order payments.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Desktop table */}
                  <div className="hidden md:block">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {MOCK_TRANSACTIONS.filter((t) => t.category === "Order Payment")
                          .slice(0, 5)
                          .map((transaction) => (
                            <TableRow key={transaction.id}>
                              <TableCell className="font-medium">
                                {transaction.description.split("#")[1]}
                              </TableCell>
                              <TableCell>
                                {format(new Date(transaction.date), 'MMM d, yyyy')}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={transaction.status === "Completed" ? "success" : "secondary"}
                                >
                                  {transaction.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">₹{transaction.amount.toFixed(2)}</TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile stacked transaction cards */}
                  <div className="md:hidden space-y-3">
                    {MOCK_TRANSACTIONS.filter((t) => t.category === "Order Payment").slice(0, 5).map((transaction) => (
                      <div key={transaction.id} className="bg-card rounded-lg p-3 shadow-sm">
                        <div className="flex items-start justify-between">
                          <div className="min-w-0">
                            <div className="font-medium truncate">{transaction.description}</div>
                            <div className="text-sm text-muted-foreground truncate">{format(new Date(transaction.date), 'MMM d, yyyy')}</div>
                          </div>
                          <div className="text-right ml-3">
                            <div className={`font-semibold ${transaction.type === 'Income' ? 'text-green-600' : 'text-red-600'}`}>
                              {transaction.type === 'Income' ? '+' : '-'}₹{Math.abs(transaction.amount).toLocaleString('en-IN')}
                            </div>
                            <Badge variant={transaction.status === 'Completed' ? 'success' : 'secondary'} className="mt-2">{transaction.status}</Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-1 lg:col-span-3">
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>Your latest financial activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {MOCK_TRANSACTIONS.slice(0, 5).map((transaction, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`p-2 rounded-full mr-3 ${
                            transaction.type === "Income" 
                              ? "bg-green-100 text-green-600" 
                              : "bg-red-100 text-red-600"
                          }`}>
                            {transaction.type === "Income" 
                              ? <ArrowUpRight className="h-4 w-4" /> 
                              : <ArrowDownRight className="h-4 w-4" />
                            }
                          </div>
                          <div>
                            <p className="text-sm font-medium">{transaction.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(transaction.date), 'MMM d, yyyy')} · {transaction.category}
                            </p>
                          </div>
                        </div>
                        <div className={`text-sm font-medium ${
                          transaction.type === "Income" ? "text-green-600" : "text-red-600"
                        }`}>
                          {transaction.type === "Income" ? "+" : "-"}₹
                          {Math.abs(transaction.amount).toLocaleString('en-IN')}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <a href="#transactions">View All Transactions</a>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <CardTitle>Transaction History</CardTitle>
                    <CardDescription>All your income and expenses in one place</CardDescription>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                    <DateRangePicker 
                      value={dateRange} 
                      onChange={setDateRange}
                      className="w-full sm:w-[250px]"
                    />
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-full sm:w-[150px]">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="Order Payment">Order Payment</SelectItem>
                        <SelectItem value="Materials">Materials</SelectItem>
                        <SelectItem value="Rent">Rent</SelectItem>
                        <SelectItem value="Equipment">Equipment</SelectItem>
                        <SelectItem value="Utilities">Utilities</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full sm:w-[150px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {format(new Date(transaction.date), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{transaction.description}</div>
                          <div className="text-sm text-muted-foreground">{transaction.id}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{transaction.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              transaction.status === "Completed"
                                ? "success"
                                : "secondary"
                            }
                          >
                            {transaction.status}
                          </Badge>
                        </TableCell>
                        <TableCell
                          className={`text-right font-medium ${
                            transaction.type === "Income"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {transaction.type === "Income" ? "+" : "-"}₹
                          {Math.abs(transaction.amount).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter>
                <div className="flex items-center justify-between w-full">
                  <div className="text-sm text-muted-foreground">
                    Showing <strong>{filteredTransactions.length}</strong> of{" "}
                    <strong>{MOCK_TRANSACTIONS.length}</strong> transactions
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Previous
                    </Button>
                    <Button variant="outline" size="sm">
                      Next
                    </Button>
                  </div>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Financial Reports</CardTitle>
                <CardDescription>Generate and download financial reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Card className="cursor-pointer hover:border-primary">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                          <PieChart className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Income Statement</h3>
                          <p className="text-sm text-muted-foreground">View revenue and expenses</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="cursor-pointer hover:border-primary">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-green-100 text-green-600">
                          <BarChart3 className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Cash Flow Report</h3>
                          <p className="text-sm text-muted-foreground">Track money movement</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="cursor-pointer hover:border-primary">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-amber-100 text-amber-600">
                          <Calendar className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Tax Report</h3>
                          <p className="text-sm text-muted-foreground">Prepare for tax season</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
              <CardFooter>
                <div className="flex flex-col sm:flex-row gap-2 w-full">
                  <Select defaultValue="30">
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">Last 7 days</SelectItem>
                      <SelectItem value="30">Last 30 days</SelectItem>
                      <SelectItem value="90">Last 90 days</SelectItem>
                      <SelectItem value="365">Last year</SelectItem>
                      <SelectItem value="custom">Custom range</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select defaultValue="pdf">
                    <SelectTrigger className="w-full sm:w-[140px]">
                      <SelectValue placeholder="Format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button className="w-full sm:w-auto">
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Mobile sticky summary */}
        <div className="md:hidden fixed left-0 right-0 bottom-4 px-4">
          <div className="bg-card/95 backdrop-blur-sm border rounded-full p-3 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <div>
                <div className="text-xs text-muted-foreground">Balance</div>
                <div className="font-semibold">₹{netProfit.toLocaleString('en-IN')}</div>
              </div>
              <div className="hidden sm:block border-l h-6 ml-2 pl-3">
                <div className="text-xs text-muted-foreground">Withdrawable</div>
                <div className="font-semibold">₹{withdrawableBalance.toLocaleString('en-IN')}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" className="h-9">Withdraw</Button>
              <Button variant="ghost" size="sm" className="h-9">Details</Button>
            </div>
          </div>
        </div>
      </div>

  {/* Under Development Overlay - Fixed and Centered */}
  <div className="fixed inset-0 flex items-center justify-center z-50 bg-background/30 p-4">
        <div className="w-full max-w-md max-h-[90vh] overflow-y-auto">
          <Card className="shadow-2xl border-2 border-primary/20 bg-background/95 backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
                  <div className="relative p-6 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full">
                    <Wallet className="h-12 w-12 md:h-16 md:w-16 text-primary animate-bounce" />
                  </div>
                </div>
              </div>
              <CardTitle className="text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Page Under Development
              </CardTitle>
              <CardDescription className="text-sm md:text-base mt-3">
                We're building a comprehensive financial management system for your business
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg border border-border/50">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-md mt-0.5 flex-shrink-0">
                    <Wrench className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm mb-1">Coming Soon</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0"></div>
                        <span>Automated income tracking</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0"></div>
                        <span>Expense categorization</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0"></div>
                        <span>Instant withdrawals</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0"></div>
                        <span>Financial reports & analytics</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0"></div>
                        <span>Tax preparation tools</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 flex-shrink-0" />
                <span>Expected launch: <strong className="text-foreground">Coming Soon</strong></span>
              </div>

              <Separator />

              <div className="flex items-center justify-center gap-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
                <Bell className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-sm font-medium text-primary text-center">
                  Get notified when this feature goes live
                </span>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button
                className={`w-full gap-2 shadow-lg transform-gpu transition-all duration-300 ${notified ? 'bg-green-600 text-white' : ''}`}
                size="lg"
                onClick={() => setNotified(true)}
                disabled={notified}
              >
                {notified ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <Bell className="h-4 w-4" />
                )}
                <span className="ml-2">{notified ? '✔ Notified' : 'Notify Me When Ready'}</span>
              </Button>

              <Button variant="ghost" className="w-full" size="sm" onClick={() => router.push('/orders')}>
                Return to Orders
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </main>
  );
}
