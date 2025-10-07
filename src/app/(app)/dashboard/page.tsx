"use client";

import { useState, useEffect, useMemo } from "react";
import { format } from 'date-fns';
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
import { supabase } from '@/lib/supabaseClient';
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

type OrderRow = {
  id: string;
  user_id?: string;
  order_status?: string | null;
  total_amount?: number | null;
  items?: any;
  shipping_address?: any;
  created_at?: string | null;
};

type UiOrder = {
  id: string;
  customer: string;
  phone?: string;
  date: string;
  status: string;
  items?: any;
  raw?: OrderRow;
};

function normalizeStatus(raw?: string | null) {
  if (!raw) return 'Pending';
  const s = String(raw).toLowerCase().trim();
  if (s === 'pending') return 'Pending';
  if (s.includes('deliver') || s === 'delivered' || s === 'completed' || s === 'delivered') return 'Completed';
  if (s.includes('process') || s.includes('processing') || s.includes('stitch') || s.includes('measurement') || s.includes('confirm') || s.includes('shipp') || s === 'processing') return 'In Progress';
  if (s.includes('cancel')) return 'Cancelled';
  return 'Other';
}

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
  const [orders, setOrders] = useState<UiOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<UiOrder[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("today");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    let ordersForDate: UiOrder[] = [];

    if (activeTab === "all") {
      ordersForDate = [...orders];
    } else {
      if (!date) {
        setFilteredOrders([]);
        return;
      }
      const selectedDateString = date ? format(date, 'yyyy-MM-dd') : null;
      ordersForDate = orders.filter(
        (o) => selectedDateString && format(new Date(o.date), 'yyyy-MM-dd') === selectedDateString
      );
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      ordersForDate = ordersForDate.filter(
        (order) =>
          (order.customer ?? "").toLowerCase().includes(q) ||
          order.id.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "all") {
      ordersForDate = ordersForDate.filter(
        (order) => (order.status ?? "").toLowerCase() === statusFilter.toLowerCase()
      );
    }
    setFilteredOrders(ordersForDate);
  }, [date, searchQuery, statusFilter, orders, activeTab]);

  useEffect(() => {
    let mounted = true;
    const fetchOrders = async () => {
      setLoadingOrders(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000);
      setLoadingOrders(false);
      if (error) {
        console.error('Failed to load orders:', error);
        return;
      }
      if (!mounted || !data) return;

      const userIds = Array.from(new Set(data.map((o) => o.user_id).filter(Boolean).map(String)));
      let usersData: any[] = [];
      if (userIds.length > 0) {
        const { data: udata } = await supabase
          .from('users')
          .select('id, username, email, phone')
          .in('id', userIds as string[]);
        usersData = udata || [];
      }

      const usersById: Record<string, any> = {};
      usersData.forEach((u) => { if (u?.id) usersById[String(u.id)] = u; });

      const ui = data.map((r) => {
        const addr = r.shipping_address ?? {};
        const user = r.user_id ? usersById[String(r.user_id)] ?? null : null;
        const customer = addr.name || addr.contact_person || addr.full_name || user?.username || user?.email || r.user_id || 'Unknown';
        const phone = user?.phone || addr.phone || addr.contact_phone || addr.contact || undefined;
        return {
          id: r.id,
          customer,
          phone,
          date: r.created_at || new Date().toISOString(),
          status: normalizeStatus(r.order_status as string || null),
          items: r.items,
          raw: r,
        } as UiOrder;
      });
      setOrders(ui);
    };
    fetchOrders();
    return () => { mounted = false; };
  }, []);

  const datesWithOrders = useMemo(() => {
    const s = new Set<string>();
    for (const o of orders) {
      try {
        const d = new Date(o.date);
        s.add(format(d, 'yyyy-MM-dd'));
      } catch (e) {
        // ignore
      }
    }
    return s;
  }, [orders]);

  const statusVariant = (status: string) => {
    switch (status) {
      case "Completed":
        return "default";
      case "In Progress":
        return "secondary";
      case "Pending":
        return "outline";
      default:
        return "outline";
    }
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircle className="h-3.5 w-3.5" />;
      case "In Progress":
        return <Clock className="h-3.5 w-3.5" />;
      case "Pending":
        return <AlertCircle className="h-3.5 w-3.5" />;
      default:
        return <AlertCircle className="h-3.5 w-3.5" />;
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800";
      case "In Progress":
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800";
      case "Pending":
        return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const completedOrders = orders.filter(order => order.status === "Completed").length;
  const inProgressOrders = orders.filter(order => order.status === "In Progress").length;
  const pendingOrders = orders.filter(order => order.status === "Pending").length;

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
                    For {date ? format(date, 'MMM d, yyyy') : "selected date"}.
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
                        {orders.length > 0 ? Math.round((completedOrders / orders.length) * 100) : 0}%
                      </div>
                      <p className="text-sm text-muted-foreground">Completion Rate</p>
                    </Card>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            
            <Popover>
              <PopoverTrigger asChild className="hidden sm:flex">
                <Button variant="outline" className="gap-1">
                  <BarChart className="h-4 w-4" />
                  Summary
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">Daily Summary</h4>
                    <p className="text-sm text-muted-foreground">
                      For {date ? format(date, 'MMM d, yyyy') : "selected date"}.
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
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Stats Cards - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[
            {
              title: "Total Orders",
              value: orders.length.toString(),
              change: "+5 from yesterday",
              icon: Package,
              color: "bg-blue-100 text-blue-600",
            },
            {
              title: "In Progress",
              value: inProgressOrders.toString(),
              change: `${orders.length ? Math.round((inProgressOrders / orders.length) * 100) : 0}% of orders`,
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
                            modifiers={{
                              hasOrder: (d: Date) => datesWithOrders.has(format(d, 'yyyy-MM-dd')),
                            } as any}
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
                    modifiers={{ hasOrder: (d: Date) => datesWithOrders.has(format(d, 'yyyy-MM-dd')) } as any}
                  />
                </div>

                <div className="lg:col-span-3">
                  <div className="rounded-md border shadow-sm overflow-hidden">
                    <div className="max-h-[600px] overflow-y-auto">
                      {/* Desktop Table Header */}
                      <Table>
                        <TableHeader className="sticky top-0 bg-muted/80 backdrop-blur-sm z-10">
                          <TableRow className="hover:bg-transparent">
                            <TableHead className="w-[30%]">Order/Customer</TableHead>
                            <TableHead className="w-[15%]">Type</TableHead>
                            <TableHead className="w-[18%]">Due Date</TableHead>
                            <TableHead className="w-[17%]">Status</TableHead>
                            <TableHead className="w-[20%] text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredOrders.length > 0 ? (
                            filteredOrders.map((order) => (
                              <>
                                {/* Mobile Card View */}
                                <TableRow className="md:hidden border-b" key={`mobile-${order.id}`}>
                                  <TableCell colSpan={5} className="p-0">
                                    <div 
                                      className="p-4 cursor-pointer hover:bg-muted/30"
                                      onClick={() => toggleOrderExpansion(order.id)}
                                    >
                                      <div className="flex justify-between items-start mb-3">
                                        <div className="flex-1 min-w-0">
                                          <div className="font-medium text-sm truncate">{order.id}</div>
                                          <div className="text-sm text-muted-foreground truncate">{order.customer}</div>
                                          {order.phone && (
                                            <div className="text-xs text-muted-foreground mt-1">{order.phone}</div>
                                          )}
                                        </div>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8 flex-shrink-0 ml-2"
                                        >
                                          {expandedOrder === order.id ? (
                                            <ChevronUp className="h-4 w-4" />
                                          ) : (
                                            <ChevronDown className="h-4 w-4" />
                                          )}
                                        </Button>
                                      </div>
                                      
                                      <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                          <Badge variant="outline" className="text-xs">
                                            {(order as any).type || 'Order'}
                                          </Badge>
                                          <span className="text-xs text-muted-foreground">
                                            {format(new Date(((order as any).dueDate ?? (order.date))), 'MMM d')}
                                          </span>
                                        </div>
                                        <Badge className={`${statusColor(order.status)} border text-xs gap-1.5 font-medium`}>
                                          {statusIcon(order.status)}
                                          {order.status}
                                        </Badge>
                                      </div>
                                    </div>
                                  </TableCell>
                                </TableRow>
                                
                                {/* Desktop Table Row */}
                                <TableRow 
                                  key={`desktop-${order.id}`}
                                  className="hidden md:table-row hover:bg-muted/30 cursor-pointer"
                                  onClick={() => toggleOrderExpansion(order.id)}
                                >
                                  <TableCell className="font-medium">
                                    <div className="flex flex-col gap-1">
                                      <span className="font-semibold text-sm">{order.id}</span>
                                      <span className="text-sm text-muted-foreground">{order.customer}</span>
                                      {order.phone && (
                                        <span className="text-xs text-muted-foreground">{order.phone}</span>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className="text-xs font-normal">
                                      {(order as any).type || '—'}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex flex-col gap-1">
                                      <span className="text-sm font-medium">
                                        {format(new Date(((order as any).dueDate ?? (order.date))), 'MMM d, yyyy')}
                                      </span>
                                      {(order as any).priority === "High" && (
                                        <Badge variant="destructive" className="text-xs w-fit">
                                          Urgent
                                        </Badge>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge className={`${statusColor(order.status)} border gap-1.5 font-medium`}>
                                      {statusIcon(order.status)}
                                      {order.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-1">
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
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
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleOrderExpansion(order.id);
                                        }}
                                        className="h-8 w-8"
                                      >
                                        {expandedOrder === order.id ? (
                                          <ChevronUp className="h-4 w-4" />
                                        ) : (
                                          <ChevronDown className="h-4 w-4" />
                                        )}
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                                
                                {/* Expanded Details */}
                                {expandedOrder === order.id && (
                                  <TableRow key={`expanded-${order.id}`} className="bg-muted/10 hover:bg-muted/10">
                                    <TableCell colSpan={5} className="p-6 border-t">
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                            <User className="h-4 w-4 text-primary" />
                                            Customer Details
                                          </h4>
                                          <div className="space-y-3 text-sm">
                                            <div className="flex items-center gap-2">
                                              <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                              <span className="break-all">{(order as any).email ?? "—"}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                              <span>{order.phone ?? "—"}</span>
                                            </div>
                                            <div className="flex items-start gap-2">
                                              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                              <span className="break-words">{(order as any).address ?? "—"}</span>
                                            </div>
                                          </div>
                                        </div>
                                        <div>
                                          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                            <Ruler className="h-4 w-4 text-primary" />
                                            Order Specifications
                                          </h4>
                                          <div className="space-y-3 text-sm">
                                            <div>
                                              <span className="font-medium">Measurements: </span>
                                              <span className="text-muted-foreground">{(order as any).measurements ?? "—"}</span>
                                            </div>
                                            <div>
                                              <span className="font-medium">Fabric: </span>
                                              <span className="text-muted-foreground">{(order as any).fabric ?? "—"}</span>
                                            </div>
                                            <div>
                                              <span className="font-medium">Notes: </span>
                                              <span className="text-muted-foreground">{(order as any).notes ?? "—"}</span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <Separator className="my-4" />
                                      
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                          <h4 className="text-sm font-semibold mb-3">Order Progress</h4>
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
                                              <span>Received</span>
                                              <span>Processing</span>
                                              <span>Completed</span>
                                            </div>
                                          </div>
                                        </div>
                                        <div>
                                          <h4 className="text-sm font-semibold mb-3">Add Note</h4>
                                          <div className="flex flex-col sm:flex-row gap-2">
                                            <Textarea placeholder="Add progress notes..." className="h-10 flex-1 text-sm" />
                                            <Button size="sm" className="w-full sm:w-auto">Save</Button>
                                          </div>
                                        </div>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                )}
                              </>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={5} className="h-32">
                                <div className="flex flex-col items-center justify-center py-8">
                                  <Package className="h-12 w-12 text-muted-foreground mb-3 opacity-50" />
                                  <p className="text-muted-foreground font-medium">
                                    No orders found for this date.
                                  </p>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    Try selecting a different date or clearing filters
                                  </p>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                  
                  {filteredOrders.length > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t bg-muted/20">
                      <div className="text-sm text-muted-foreground">
                        Showing <strong className="font-semibold text-foreground">{filteredOrders.length}</strong> {filteredOrders.length === 1 ? 'order' : 'orders'}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled>
                          Previous
                        </Button>
                        <Button variant="outline" size="sm" disabled>
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
