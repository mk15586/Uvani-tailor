"use client";

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
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { MOCK_ORDERS } from "@/lib/mock-data";
import {
  Search,
  MoreHorizontal,
  File,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
  Download,
  BarChart3,
  Calendar,
  MapPin,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  Package,
  User,
} from "lucide-react";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

import { DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import dynamic from "next/dynamic";
const Map = dynamic(() => import("@/components/shared/Map"), { ssr: false });
import { cn } from "@/lib/utils";

type Order = (typeof MOCK_ORDERS)[0];

const statusVariant = (status: string) => {
  switch (status) {
    case "Completed":
      return "success";
    case "In Progress":
      return "secondary";
    case "New":
      return "destructive";
    case "Shipped":
      return "info";
    default:
      return "outline";
  }
};

const statusIcon = (status: string) => {
  switch (status) {
    case "Completed":
      return <CheckCircle className="h-4 w-4" />;
    case "In Progress":
      return <Clock className="h-4 w-4" />;
    case "New":
      return <AlertCircle className="h-4 w-4" />;
    case "Shipped":
      return <Truck className="h-4 w-4" />;
    default:
      return <Package className="h-4 w-4" />;
  }
};

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

export default function OrdersPage() {
  const [orders, setOrders] = useState(MOCK_ORDERS);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [customerFilter, setCustomerFilter] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState("date");
  const [sortDirection, setSortDirection] = useState("desc");
  const ordersPerPage = 10;

  const handleOrderStatus = (orderId: string, newStatus: string) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
    setIsViewModalOpen(false);
    setSelectedOrder(null);
  };

  const handleDeleteOrder = (orderId: string) => {
    setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
    setIsDeleteModalOpen(false);
    setSelectedOrder(null);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const filteredOrders = useMemo(() => {
    let filtered = [...orders];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        order =>
          order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.fabric.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "All") {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Apply date filter
    const now = new Date();
    if (dateFilter === "today") {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.date);
        return orderDate.toDateString() === now.toDateString();
      });
    } else if (dateFilter === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter(order => new Date(order.date) >= weekAgo);
    } else if (dateFilter === "month") {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      filtered = filtered.filter(order => new Date(order.date) >= monthAgo);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;

      if (sortField === "date") {
        aValue = new Date(a.date).getTime();
        bValue = new Date(b.date).getTime();
      } else if (sortField === "amount") {
        aValue = a.amount;
        bValue = b.amount;
      } else if (sortField === "customer") {
        aValue = a.customer.toLowerCase();
        bValue = b.customer.toLowerCase();
      } else {
        aValue = a.status;
        bValue = b.status;
      }

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [searchTerm, statusFilter, dateFilter, orders, sortField, sortDirection]);

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * ordersPerPage;
    return filteredOrders.slice(startIndex, startIndex + ordersPerPage);
  }, [filteredOrders, currentPage]);

  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const orderStats = useMemo(() => {
    return {
      total: orders.length,
      new: orders.filter((o) => o.status === "New").length,
      inProgress: orders.filter((o) => o.status === "In Progress").length,
      shipped: orders.filter((o) => o.status === "Shipped").length,
      completed: orders.filter((o) => o.status === "Completed").length,
    };
  }, [orders]);

  const revenueData = useMemo(() => {
    return orders
      .filter(order => order.status === "Completed")
      .reduce((total, order) => total + order.amount, 0);
  }, [orders]);

  // selection helpers
  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      const currentPageIds = paginatedOrders.map(o => o.id);
      setSelectedIds(currentPageIds);
    } else {
      setSelectedIds([]);
    }
  };

  const clearSelection = () => setSelectedIds([]);

  const bulkDeleteSelected = () => {
    setOrders(prev => prev.filter(o => !selectedIds.includes(o.id)));
    clearSelection();
  };

  const exportToCSV = (rows: Order[], filename = "orders.csv") => {
    if (!rows || rows.length === 0) return;
    const header = ["id", "customer", "type", "fabric", "date", "status", "amount", "location"];
    const csv = [header.join(',')].concat(
      rows.map(r => [r.id, r.customer, r.type, r.fabric, r.date, r.status, r.amount.toFixed(2), r.location]
        .map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
    ).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };


  return (
    <main className="flex flex-1 flex-col gap-6 bg-gradient-to-br from-muted/20 to-muted/40">
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-primary/10 p-3">
            <Package className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Orders Management</h1>
            <p className="text-muted-foreground mt-1">Track, manage, and fulfill all customer orders efficiently.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="h-9 gap-1" onClick={() => exportToCSV(filteredOrders, 'orders-all.csv')}>
            <Download className="h-4 w-4" />
            <span className="hidden sm:block">Export All</span>
          </Button>
          <Button size="sm" variant="outline" className="h-9 gap-1" onClick={() => setShowFilters(s => !s)}>
            <Filter className="h-4 w-4" />
            <span className="hidden sm:block">Filters</span>
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" className="h-9 gap-1">
                <PlusCircle className="h-4 w-4" />
                <span className="hidden sm:block">Add Order</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Order</DialogTitle>
                <DialogDescription>
                  Add a new customer order to the system.
                </DialogDescription>
              </DialogHeader>
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="details">Order Details</TabsTrigger>
                  <TabsTrigger value="customer">Customer Info</TabsTrigger>
                  <TabsTrigger value="shipping">Shipping</TabsTrigger>
                </TabsList>
                <TabsContent value="details" className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="customer">Customer Name</Label>
                      <Input id="customer" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Garment Type</Label>
                      <Input id="type" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fabric">Fabric Material</Label>
                      <Input id="fabric" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount ($)</Label>
                      <Input id="amount" type="number" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="design">Design Specifications</Label>
                    <Textarea id="design" placeholder="Enter design details..." />
                  </div>
                </TabsContent>
                <TabsContent value="customer" className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea id="address" />
                  </div>
                </TabsContent>
                <TabsContent value="shipping" className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="shipping">Shipping Method</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="express">Express</SelectItem>
                        <SelectItem value="priority">Priority</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="delivery-date">Expected Delivery Date</Label>
                    <Input id="delivery-date" type="date" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="tracking" />
                    <Label htmlFor="tracking">Enable Tracking</Label>
                  </div>
                </TabsContent>
              </Tabs>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit">Create Order</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stat boxes removed per user request */}

      {showFilters && (
        <div className="bg-card p-4 rounded-md shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Label>Start Date</Label>
              <Input type="date" value={startDate ?? ''} onChange={(e) => setStartDate(e.target.value || null)} />
            </div>
            <div>
              <Label>End Date</Label>
              <Input type="date" value={endDate ?? ''} onChange={(e) => setEndDate(e.target.value || null)} />
            </div>
            <div>
              <Label>Customer</Label>
              <Input placeholder="Customer name" value={customerFilter} onChange={(e) => setCustomerFilter(e.target.value)} />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.4 } }}
        >
          <Card className="shadow-lg border-0">
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle>Order Management</CardTitle>
                  <CardDescription>
                    Manage and track all customer orders in one place.
                  </CardDescription>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search orders..."
                      className="pl-10 w-full sm:w-[250px]"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="gap-2">
                        <Filter className="h-4 w-4" />
                        Filters
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <div className="px-2 py-1.5 text-sm font-semibold">Status</div>
                      {["All", "New", "In Progress", "Shipped", "Completed"].map(
                        (status) => (
                          <DropdownMenuItem 
                            key={status} 
                            className="cursor-pointer"
                            onClick={() => setStatusFilter(status)}
                          >
                            {status}
                          </DropdownMenuItem>
                        )
                      )}
                      <DropdownMenuSeparator />
                      <div className="px-2 py-1.5 text-sm font-semibold">Date</div>
                      <DropdownMenuItem className="cursor-pointer" onClick={() => setDateFilter("all")}>
                        All Time
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer" onClick={() => setDateFilter("today")}>
                        Today
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer" onClick={() => setDateFilter("week")}>
                        This Week
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer" onClick={() => setDateFilter("month")}>
                        This Month
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="border rounded-lg">
                {/* Desktop table (md and up) */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="w-[40px]">
                          <input
                            aria-label="Select all orders on page"
                            type="checkbox"
                            checked={paginatedOrders.length > 0 && selectedIds.length === paginatedOrders.length}
                            onChange={(e) => toggleSelectAll(e.target.checked)}
                          />
                        </TableHead>
                        <TableHead 
                          className="w-[100px] cursor-pointer"
                          onClick={() => handleSort("id")}
                        >
                          <div className="flex items-center">
                            Order ID
                            {sortField === "id" && (
                              <span className="ml-1">
                                {sortDirection === "asc" ? "↑" : "↓"}
                              </span>
                            )}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer"
                          onClick={() => handleSort("customer")}
                        >
                          <div className="flex items-center">
                            Customer
                            {sortField === "customer" && (
                              <span className="ml-1">
                                {sortDirection === "asc" ? "↑" : "↓"}
                              </span>
                            )}
                          </div>
                        </TableHead>
                        <TableHead>Garment Type</TableHead>
                        <TableHead 
                          className="cursor-pointer"
                          onClick={() => handleSort("date")}
                        >
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Date
                            {sortField === "date" && (
                              <span className="ml-1">
                                {sortDirection === "asc" ? "↑" : "↓"}
                              </span>
                            )}
                          </div>
                        </TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead 
                          className="text-right cursor-pointer"
                          onClick={() => handleSort("amount")}
                        >
                          <div className="flex items-center justify-end">
                            Amount
                            {sortField === "amount" && (
                              <span className="ml-1">
                                {sortDirection === "asc" ? "↑" : "↓"}
                              </span>
                            )}
                          </div>
                        </TableHead>
                        <TableHead className="w-[80px] text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence>
                        {paginatedOrders.map((order) => (
                          <motion.tr
                            key={order.id}
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="group hover:bg-muted/30 cursor-pointer border-b"
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsViewModalOpen(true);
                            }}
                          >
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              <input
                                aria-label={`Select order ${order.id}`}
                                type="checkbox"
                                checked={selectedIds.includes(order.id)}
                                onChange={() => toggleSelectOne(order.id)}
                                className="cursor-pointer"
                              />
                            </TableCell>
                            <TableCell className="font-medium">{order.id}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <User className="h-4 w-4 mr-2 text-muted-foreground" />
                                {order.customer}
                              </div>
                            </TableCell>
                            <TableCell>{order.type}</TableCell>
                            <TableCell>{order.date}</TableCell>
                            <TableCell>
                              <Badge
                                variant={statusVariant(order.status) as any}
                                className="capitalize flex items-center gap-1 w-fit"
                              >
                                {statusIcon(order.status)}
                                {order.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              ${order.amount.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedOrder(order);
                                      setIsViewModalOpen(true);
                                    }}
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedOrder(order);
                                      setIsEditModalOpen(true);
                                    }}
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Order
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-red-500"
                                    onClick={() => {
                                      setSelectedOrder(order);
                                      setIsDeleteModalOpen(true);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Order
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                      {paginatedOrders.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={8} className="h-24 text-center">
                            <div className="flex flex-col items-center justify-center text-muted-foreground py-6">
                              <Package className="h-12 w-12 opacity-20 mb-2" />
                              <p>No orders found.</p>
                              <p className="text-sm">Try adjusting your search or filter criteria.</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                {/* Mobile list (below md) */}
                <div className="md:hidden">
                  <div className="space-y-3 p-2">
                    {paginatedOrders.map((order) => (
                      <div key={order.id} className="bg-card rounded-lg p-3 shadow-sm">
                        <div className="flex items-start justify-between">
                          <div className="min-w-0">
                            <div className="font-medium truncate">{order.id} — {order.customer}</div>
                            <div className="text-sm text-muted-foreground truncate">{order.type} • {order.date}</div>
                          </div>
                          <div className="flex items-center gap-2 ml-3">
                            <Badge variant={statusVariant(order.status) as any} className="capitalize text-xs">{order.status}</Badge>
                            <div className="text-sm font-semibold">${order.amount.toFixed(2)}</div>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); setIsViewModalOpen(true); }}>View</Button>
                          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); setIsEditModalOpen(true); }}>Edit</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 sm:flex-row justify-between items-center pt-4">
              <div className="text-sm text-muted-foreground">
                Showing <strong>{paginatedOrders.length}</strong> of <strong>{filteredOrders.length}</strong> orders
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="ml-2 hidden sm:block">Previous</span>
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        className="h-9 w-9 p-0"
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  {totalPages > 5 && (
                    <span className="px-2 text-muted-foreground">...</span>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <span className="mr-2 hidden sm:block">Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>

      {/* View Order Dialog */}
      {selectedOrder && (
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Details: {selectedOrder.id}
              </DialogTitle>
              <DialogDescription>
                Complete information for this order
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Order Info</TabsTrigger>
                <TabsTrigger value="customer">Customer</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Customer Name</Label>
                    <p className="font-medium">{selectedOrder.customer}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Order ID</Label>
                    <p>{selectedOrder.id}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Garment Type</Label>
                    <p>{selectedOrder.type}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Fabric Type</Label>
                    <p>{selectedOrder.fabric}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Design Specifications</Label>
                  <p>{selectedOrder.design}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Location</Label>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                    <p>{selectedOrder.location}</p>
                  </div>
                </div>
                <div className="mt-4 rounded-lg overflow-hidden">
                  <Map lat={selectedOrder.lat} lng={selectedOrder.lng} location={selectedOrder.location} />
                </div>
              </TabsContent>
              <TabsContent value="customer" className="space-y-4 py-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{selectedOrder.customer}</h3>
                      <p className="text-sm text-muted-foreground">Customer since Jan 2023</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                      <p>customer@example.com</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                      <p>+1 (555) 123-4567</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Shipping Address</Label>
                    <p>123 Main St, Anytown, AN 12345</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Order History</Label>
                    <div className="flex items-center gap-2">
                      <div className="text-sm bg-muted px-2 py-1 rounded-md">12 orders total</div>
                      <div className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-md">$2,450.00 spent</div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="timeline" className="space-y-4 py-4">
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-3 w-3 rounded-full bg-primary"></div>
                      <div className="h-16 w-0.5 bg-muted mt-1"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold">Order Placed</h4>
                      <p className="text-sm text-muted-foreground">{selectedOrder.date}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-3 w-3 rounded-full bg-primary"></div>
                      <div className="h-16 w-0.5 bg-muted mt-1"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold">Order Confirmed</h4>
                      <p className="text-sm text-muted-foreground">{selectedOrder.date}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-3 w-3 rounded-full bg-muted"></div>
                      <div className="h-16 w-0.5 bg-muted mt-1"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-muted-foreground">In Production</h4>
                      <p className="text-sm text-muted-foreground">Estimated: Tomorrow</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-3 w-3 rounded-full bg-muted"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-muted-foreground">Shipped</h4>
                      <p className="text-sm text-muted-foreground">Estimated: 3 days</p>
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <Label className="text-sm font-medium text-muted-foreground">Progress</Label>
                  <Progress value={selectedOrder.status === "New" ? 25 : selectedOrder.status === "In Progress" ? 50 : selectedOrder.status === "Shipped" ? 75 : 100} className="mt-2" />
                </div>
              </TabsContent>
            </Tabs>
            {selectedOrder.status === "New" && (
              <DialogFooter className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleOrderStatus(selectedOrder.id, "Declined")}
                >
                  Decline
                </Button>
                <Button onClick={() => handleOrderStatus(selectedOrder.id, "In Progress")}>
                  Accept Order
                </Button>
              </DialogFooter>
            )}
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {selectedOrder && (
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                Confirm Deletion
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete order {selectedOrder.id}? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex justify-end gap-2 sm:justify-end">
              <Button
                variant="outline"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDeleteOrder(selectedOrder.id)}
              >
                Delete Order
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      </div>
    </main>
  );
}