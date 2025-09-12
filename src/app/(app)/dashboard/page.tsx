"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import {
  Scissors,
  Ruler,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  Plus,
  Truck,
  Package,
  ChevronDown,
  ChevronUp,
  MapPin,
  Phone,
  Mail,
  Layers,
  BarChart,
  MoreHorizontal,
  CalendarIcon,
  Menu,
} from "lucide-react";
import { MOCK_ORDERS } from "@/lib/mock-data";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Order = (typeof MOCK_ORDERS)[0];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: "easeOut",
    },
  }),
};

export default function TailorDashboardPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("today");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  useEffect(() => {
    if (date) {
      const selectedDateString = date.toDateString();
      let ordersForDate = MOCK_ORDERS.filter(
        (order) => new Date(order.date).toDateString() === selectedDateString
      );

      // Apply search filter
      if (searchQuery) {
        ordersForDate = ordersForDate.filter(
          (order) =>
            order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.id.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      // Apply status filter
      if (statusFilter !== "all") {
        ordersForDate = ordersForDate.filter(
          (order) => order.status.toLowerCase() === statusFilter.toLowerCase()
        );
      }

      setFilteredOrders(ordersForDate);
    } else {
      setFilteredOrders([]);
    }
  }, [date, searchQuery, statusFilter]);

  const statusVariant = (status: string) => {
    switch (status) {
      case "Completed":
        return "success";
      case "In Progress":
        return "secondary";
      case "Pending":
        return "destructive";
      default:
        return "outline";
    }
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircle className="h-4 w-4 mr-1" />;
      case "In Progress":
        return <Clock className="h-4 w-4 mr-1" />;
      case "Pending":
        return <AlertCircle className="h-4 w-4 mr-1" />;
      default:
        return <AlertCircle className="h-4 w-4 mr-1" />;
    }
  };

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  // Calculate order statistics for the dashboard
  const completedOrders = MOCK_ORDERS.filter(order => order.status === "Completed").length;
  const inProgressOrders = MOCK_ORDERS.filter(order => order.status === "In Progress").length;
  const pendingOrders = MOCK_ORDERS.filter(order => order.status === "Pending").length;

  return (
    <main className="flex flex-1 flex-col gap-4 bg-muted/20">
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Tailor Dashboard</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Manage and track your orders efficiently
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1 sm:hidden">
                <BarChart className="h-4 w-4" />
                Summary
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md">
              <SheetHeader>
                <SheetTitle>Daily Summary</SheetTitle>
                <SheetDescription>
                  For {date ? date.toLocaleDateString() : "selected date"}.
                </SheetDescription>
              </SheetHeader>
              <div className="py-4 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <Card className="p-4">
                    <div className="text-2xl font-bold">{filteredOrders.length}</div>
                    <p className="text-sm text-muted-foreground">Orders Today</p>
                  </Card>
                  <Card className="p-4">
                    <div className="text-2xl font-bold">
                      {filteredOrders.filter(order => order.status !== "Completed").length}
                    </div>
                    <p className="text-sm text-muted-foreground">To be delivered</p>
                  </Card>
                  <Card className="p-4">
                    <div className="text-2xl font-bold text-red-600">
                      {filteredOrders.filter(order => (order as any).priority === "High").length}
                    </div>
                    <p className="text-sm text-muted-foreground">Urgent Orders</p>
                  </Card>
                  <Card className="p-4">
                    <div className="text-2xl font-bold">
                      {Math.round((completedOrders / MOCK_ORDERS.length) * 100)}%
                    </div>
                    <p className="text-sm text-muted-foreground">Completion Rate</p>
                  </Card>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <h3 className="font-medium">Quick Actions</h3>
                  <div className="grid gap-2">
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <Plus className="h-4 w-4" />
                      New Order
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <Truck className="h-4 w-4" />
                      Schedule Delivery
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <Layers className="h-4 w-4" />
                      Material Inventory
                    </Button>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          
          <Popover>
            <PopoverTrigger asChild className="hidden sm:flex">
              <Button variant="outline" className="gap-1">
                <BarChart className="h-4 w-4" />
                Summary / Actions
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Daily Summary</h4>
                  <p className="text-sm text-muted-foreground">
                    For {date ? date.toLocaleDateString() : "selected date"}.
                  </p>
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Orders Today
                    </span>
                    <span className="font-medium">
                      {filteredOrders.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      To be delivered
                    </span>
                    <span className="font-medium">
                      {
                        filteredOrders.filter(
                          (order) => order.status !== "Completed"
                        ).length
                      }
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Urgent Orders
                    </span>
                    <span className="font-medium text-red-600">
                      {
                        filteredOrders.filter(
                          (order) => (order as any).priority === "High"
                        ).length
                      }
                    </span>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Quick Actions</h4>
                </div>
                <div className="grid gap-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    New Order
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                  >
                    <Truck className="h-4 w-4" />
                    Schedule Delivery
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                  >
                    <Layers className="h-4 w-4" />
                    Material Inventory
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          <Button className="gap-1 bg-blue-600 hover:bg-blue-700 h-9 sm:h-10">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Order</span>
          </Button>
        </div>
      </div>

  {/* Stats Cards - Responsive Grid */}
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {[
          {
            title: "Total Orders",
            value: MOCK_ORDERS.length.toString(),
            change: "+5 from yesterday",
            icon: Package,
            color: "bg-blue-100 text-blue-600",
          },
          {
            title: "In Progress",
            value: inProgressOrders.toString(),
            change: `${Math.round((inProgressOrders / MOCK_ORDERS.length) * 100)}% of orders`,
            icon: Scissors,
            color: "bg-amber-100 text-amber-600",
          },
          {
            title: "Pending",
            value: pendingOrders.toString(),
            change: "Needs attention",
            icon: Clock,
            color: "bg-red-100 text-red-600",
          },
          {
            title: "Completed",
            value: completedOrders.toString(),
            change: "+12 this week",
            icon: CheckCircle,
            color: "bg-green-100 text-green-600",
          },
        ].map((item, index) => (
            <motion.div
            key={item.title}
            custom={index}
            variants={cardVariants as any}
            initial="hidden"
            animate="visible"
          >
            <Card className="overflow-hidden border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
                <CardTitle className="text-xs md:text-sm font-medium">
                  {item.title}
                </CardTitle>
                <div className={`p-1.5 rounded-full ${item.color}`}>
                  <item.icon className="h-3 w-3 md:h-4 md:w-4" />
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-lg md:text-2xl font-bold">{item.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {item.change}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <motion.div
        custom={4}
        variants={cardVariants as any}
        initial="hidden"
        animate="visible"
      >
  <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <CardTitle className="text-lg md:text-xl">Order Management</CardTitle>
                <CardDescription className="text-sm">
                  View and manage all customer orders
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search orders..."
                    className="pl-8 w-full sm:w-[180px] md:w-[250px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm" className="sm:hidden">
                        <CalendarIcon className="h-4 w-4" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="h-[80vh]">
                      <SheetHeader>
                        <SheetTitle>Select Date</SheetTitle>
                        <SheetDescription>
                          Choose a date to view orders
                        </SheetDescription>
                      </SheetHeader>
                      <div className="py-4">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          className="rounded-md border p-3"
                        />
                      </div>
                    </SheetContent>
                  </Sheet>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-1">
                        <Filter className="h-4 w-4" />
                        <span className="hidden sm:inline">Status</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                        All Statuses
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setStatusFilter("Completed")}
                      >
                        Completed
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setStatusFilter("In Progress")}
                      >
                        In Progress
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setStatusFilter("Pending")}
                      >
                        Pending
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0 md:p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="px-4 md:px-0">
              <div className="overflow-x-auto pb-2">
                <TabsList className="min-w-max">
                  <TabsTrigger value="today">Today's Orders</TabsTrigger>
                  <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                  <TabsTrigger value="all">All Orders</TabsTrigger>
                </TabsList>
              </div>
            </Tabs>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-0 lg:gap-6 p-4 md:p-0">
              {/* Calendar - Hidden on mobile, shown on desktop */}
              <div className="hidden lg:block lg:col-span-1">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border p-3 shadow-sm"
                />
              </div>

              <div className="lg:col-span-3">
                <div className="rounded-md border shadow-sm overflow-hidden">
                  {/* Mobile Table Header */}
                  <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 bg-muted/50 text-sm font-medium text-muted-foreground border-b">
                    <div className="col-span-3">Order/Customer</div>
                    <div className="col-span-2">Type</div>
                    <div className="col-span-2">Due Date</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-3 text-right">Actions</div>
                  </div>
                  
                  <div className="divide-y">
                    {filteredOrders.length > 0 ? (
                      filteredOrders.map((order) => (
                        <div key={order.id} className="w-full">
                          {/* Mobile Card View */}
                          <div 
                            className="md:hidden p-4 cursor-pointer hover:bg-muted/30"
                            onClick={() => toggleOrderExpansion(order.id)}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium">{order.id}</div>
                                <div className="text-sm text-muted-foreground">{order.customer}</div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant={statusVariant(order.status) as any}
                                  className="capitalize flex items-center text-xs"
                                >
                                  {statusIcon(order.status)}
                                  {order.status}
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                >
                                  {expandedOrder === order.id ? (
                                    <ChevronUp className="h-4 w-4" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                            
                              <div className="mt-2 flex justify-between text-sm">
                              <div>
                                <Badge variant="outline" className="capitalize text-xs">
                                  {order.type}
                                </Badge>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(((order as any).dueDate ?? (order.date))).toLocaleDateString()}
                              </div>
                            </div>
                            
                            {(order as any).priority === "High" && (
                              <div className="mt-2">
                                <Badge variant="destructive" className="text-xs">
                                  Urgent
                                </Badge>
                              </div>
                            )}
                          </div>
                          
                          {/* Desktop Table Row */}
                          <div className="hidden md:table-row">
                            <div className="grid grid-cols-12 gap-4 px-4 py-3">
                                <div className="col-span-3">
                                <div className="font-medium">{order.id}</div>
                                <div className="text-sm text-muted-foreground">{order.customer}</div>
                                <div className="text-xs text-muted-foreground">{(order as any).phone ?? "-"}</div>
                              </div>
                              <div className="col-span-2">
                                <Badge variant="outline" className="capitalize text-xs">
                                  {order.type}
                                </Badge>
                              </div>
                              <div className="col-span-2">
                                <div className="text-sm">
                                  {new Date(((order as any).dueDate ?? (order.date))).toLocaleDateString()}
                                </div>
                                {(order as any).priority === "High" && (
                                  <Badge variant="destructive" className="text-xs mt-1">
                                    Urgent
                                  </Badge>
                                )}
                              </div>
                              <div className="col-span-2">
                                <Badge
                                  variant={statusVariant(order.status) as any}
                                  className="capitalize flex items-center text-xs"
                                >
                                  {statusIcon(order.status)}
                                  {order.status}
                                </Badge>
                              </div>
                              <div className="col-span-3 flex justify-end">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      className="h-8 w-8 p-0"
                                    >
                                      <span className="sr-only">Open menu</span>
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem>
                                      View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      Contact Customer
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>
                                      Update Status
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-red-600">
                                      Cancel Order
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => toggleOrderExpansion(order.id)}
                                  className="h-8 w-8"
                                >
                                  {expandedOrder === order.id ? (
                                    <ChevronUp className="h-4 w-4" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>
                          
                          {/* Expanded Details */}
                          {expandedOrder === order.id && (
                            <div className="md:table-row bg-muted/10">
                              <div className="md:col-span-12 p-4 md:p-6 border-t md:border-t-0">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div>
                                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                                      <User className="h-4 w-4" />
                                      Customer Details
                                    </h4>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <span>{(order as any).email ?? "-"}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <span>{(order as any).phone ?? "-"}</span>
                                      </div>
                                      <div className="flex items-start gap-2">
                                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                        <span>{(order as any).address ?? "-"}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                                      <Ruler className="h-4 w-4" />
                                      Order Specifications
                                    </h4>
                                    <div className="space-y-3 text-sm">
                                      <div>
                                        <span className="font-medium">Measurements: </span>
                                        {(order as any).measurements ?? "-"}
                                      </div>
                                      <div>
                                        <span className="font-medium">Fabric: </span>
                                        {order.fabric}
                                      </div>
                                      <div>
                                        <span className="font-medium">Notes: </span>
                                        {(order as any).notes ?? "-"}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                <Separator className="my-4" />
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div>
                                    <h4 className="text-sm font-medium mb-3">Order Progress</h4>
                                    <div className="space-y-2">
                                      <Progress
                                        value={
                                          order.status === "Completed"
                                            ? 100
                                            : order.status === "In Progress"
                                            ? 50
                                            : 10
                                        }
                                        className="h-2"
                                      />
                                      <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>Order Received</span>
                                        <span>In Progress</span>
                                        <span>Completed</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-medium mb-3">Add Note</h4>
                                    <div className="flex flex-col sm:flex-row gap-2">
                                      <Textarea placeholder="Add progress notes..." className="h-10 flex-1" />
                                      <Button size="sm" className="w-full sm:w-auto">Save</Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="col-span-12 p-8 text-center">
                        <div className="flex flex-col items-center justify-center py-6">
                          <Package className="h-12 w-12 text-muted-foreground mb-2" />
                          <p className="text-muted-foreground">
                            No orders found for this date.
                          </p>
                          <Button variant="outline" className="mt-4">
                            Create New Order
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {filteredOrders.length > 0 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      Showing <strong>{filteredOrders.length}</strong> orders
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
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      </div>
    </main>
  );
}