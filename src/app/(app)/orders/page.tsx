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
  CardFooter,
} from "@/components/ui/card";
import {
  Search,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Filter,
  Download,
  Calendar,
  MapPin,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Trash2,
  Package,
  User,
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { format } from 'date-fns';
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import dynamic from "next/dynamic";
const Map = dynamic(() => import("@/components/shared/Map"), { ssr: false });

type Order = {
  id: string;
  customer: string;
  email?: string;
  phone?: string;
  type?: string;
  fabric?: string;
  amount: number;
  date: string;
  status: string;
  location?: string;
  lat?: number;
  lng?: number;
  design?: string;
  raw?: any;
};

const statusVariant = (status: string) => {
  switch (status) {
    case "Completed": return "success";
    case "In Progress": return "secondary";
    case "New": return "destructive";
    case "Shipped": return "info";
    default: return "outline";
  }
};

const statusIcon = (status: string) => {
  switch (status) {
    case "Completed": return <CheckCircle className="h-4 w-4" />;
    case "In Progress": return <Clock className="h-4 w-4" />;
    case "New": return <AlertCircle className="h-4 w-4" />;
    case "Shipped": return <Truck className="h-4 w-4" />;
    default: return <Package className="h-4 w-4" />;
  }
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
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

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(q) ||
        (order.customer ?? "").toLowerCase().includes(q) ||
        (order.type ?? "").toLowerCase().includes(q) ||
        (order.fabric ?? "").toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "All") {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    const now = new Date();
    const todayKey = format ? format(now, 'yyyy-MM-dd') : now.toDateString();
    if (dateFilter === "today") {
      filtered = filtered.filter(order => format(new Date(order.date), 'yyyy-MM-dd') === todayKey);
    } else if (dateFilter === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter(order => new Date(order.date) >= weekAgo);
    } else if (dateFilter === "month") {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      filtered = filtered.filter(order => new Date(order.date) >= monthAgo);
    }

    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      if (sortField === "date") {
        aValue = new Date(a.date).getTime();
        bValue = new Date(b.date).getTime();
      } else if (sortField === "amount") {
        aValue = a.amount;
        bValue = b.amount;
      } else if (sortField === "customer") {
        aValue = (a.customer ?? "").toLowerCase();
        bValue = (b.customer ?? "").toLowerCase();
      } else {
        aValue = a.status;
        bValue = b.status;
      }
      return sortDirection === "asc" ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
    });

    return filtered;
  }, [searchTerm, statusFilter, dateFilter, orders, sortField, sortDirection]);

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * ordersPerPage;
    return filteredOrders.slice(startIndex, startIndex + ordersPerPage);
  }, [filteredOrders, currentPage]);

  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? paginatedOrders.map(o => o.id) : []);
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

  useEffect(() => {
    let mounted = true;
    const fetchOrders = async () => {
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000);
      
      if (ordersError || !mounted || !ordersData) return;

      const userIds = Array.from(new Set(ordersData.map((o: any) => o.user_id).filter(Boolean).map(String)));
      let usersData: any[] = [];
      
      if (userIds.length > 0) {
        const { data: udata } = await supabase
          .from('users')
          .select('id, username, email, phone')
          .in('id', userIds);
        usersData = udata || [];
      }

      const usersById: Record<string, any> = {};
      usersData.forEach(u => { if (u?.id) usersById[String(u.id)] = u; });

      const uiOrders: Order[] = ordersData.map((r: any) => {
        const uid = r.user_id ? String(r.user_id) : null;
        const user = uid ? usersById[uid] ?? null : null;
        const shipping = r.shipping_address || {};
        const customer = user?.username || shipping?.name || user?.email || 'Unknown';
        const amount = typeof r.total_amount === 'number' ? r.total_amount : parseFloat(String(r.total_amount || 0));

        return {
          id: r.id,
          customer,
          email: user?.email,
          phone: user?.phone || shipping?.phone,
          type: r.items?.[0]?.type,
          fabric: r.items?.[0]?.fabric,
          amount,
          date: r.created_at,
          status: r.order_status || 'New',
          location: shipping?.location || shipping?.address || '',
          lat: shipping?.lat,
          lng: shipping?.lng,
          design: r.items?.[0]?.design,
          raw: r,
        };
      });

      setOrders(uiOrders);
    };
    fetchOrders();
    return () => { mounted = false; };
  }, []);

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
            <Button size="sm" variant="outline" className="h-9 gap-1" onClick={() => exportToCSV(filteredOrders)}>
              <Download className="h-4 w-4" />
              <span className="hidden sm:block">Export</span>
            </Button>
            <Button size="sm" variant="outline" className="h-9 gap-1" onClick={() => setShowFilters(s => !s)}>
              <Filter className="h-4 w-4" />
              <span className="hidden sm:block">Filters</span>
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="bg-card p-4 rounded-md shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label>Start Date</Label>
                <Input type="date" value={startDate ?? ''} onChange={(e) => setStartDate(e.target.value || null)} />
              </div>
              <div>
                <Label>End Date</Label>
                <Input type="date" value={endDate ?? ''} onChange={(e) => setEndDate(e.target.value || null)} />
              </div>
            </div>
          </div>
        )}

        <Card className="shadow-lg border-0">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders..."
                  className="pl-10 w-full"
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
                  {["All", "New", "In Progress", "Shipped", "Completed"].map(status => (
                    <DropdownMenuItem key={status} onClick={() => setStatusFilter(status)}>
                      {status}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <div className="px-2 py-1.5 text-sm font-semibold">Date</div>
                  <DropdownMenuItem onClick={() => setDateFilter("all")}>All Time</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setDateFilter("today")}>Today</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setDateFilter("week")}>This Week</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setDateFilter("month")}>This Month</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="border rounded-lg">
              <div className="hidden md:block">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="w-[40px]">
                        <input
                          type="checkbox"
                          checked={paginatedOrders.length > 0 && selectedIds.length === paginatedOrders.length}
                          onChange={(e) => toggleSelectAll(e.target.checked)}
                        />
                      </TableHead>
                      <TableHead className="w-[100px] cursor-pointer" onClick={() => handleSort("id")}>
                        Order ID {sortField === "id" && (sortDirection === "asc" ? "↑" : "↓")}
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort("customer")}>
                        Customer {sortField === "customer" && (sortDirection === "asc" ? "↑" : "↓")}
                      </TableHead>
                      <TableHead>Garment Type</TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort("date")}>
                        <Calendar className="h-4 w-4 inline mr-1" />
                        Date {sortField === "date" && (sortDirection === "asc" ? "↑" : "↓")}
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right cursor-pointer" onClick={() => handleSort("amount")}>
                        Amount {sortField === "amount" && (sortDirection === "asc" ? "↑" : "↓")}
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
                          className="group hover:bg-muted/30 cursor-pointer border-b"
                          onClick={() => { setSelectedOrder(order); setIsViewModalOpen(true); }}
                        >
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(order.id)}
                              onChange={() => toggleSelectOne(order.id)}
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
                            <Badge variant={statusVariant(order.status) as any} className="capitalize flex items-center gap-1 w-fit">
                              {statusIcon(order.status)}
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-semibold">₹{order.amount.toFixed(2)}</TableCell>
                          <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => { setSelectedOrder(order); setIsViewModalOpen(true); }}>
                                  <Eye className="h-4 w-4 mr-2" />View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => { setSelectedOrder(order); setIsDeleteModalOpen(true); }} className="text-red-500">
                                  <Trash2 className="h-4 w-4 mr-2" />Delete Order
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
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="md:hidden space-y-3 p-2">
                {paginatedOrders.map((order) => (
                  <div key={order.id} className="bg-card rounded-lg p-3 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0">
                        <div className="font-medium truncate">{order.id} — {order.customer}</div>
                        <div className="text-sm text-muted-foreground truncate">{order.type} • {order.date}</div>
                      </div>
                      <div className="flex items-center gap-2 ml-3">
                        <Badge variant={statusVariant(order.status) as any} className="capitalize text-xs">{order.status}</Badge>
                        <div className="text-sm font-semibold">₹{order.amount.toFixed(2)}</div>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => { setSelectedOrder(order); setIsViewModalOpen(true); }}>View</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 sm:flex-row justify-between items-center pt-4">
            <div className="text-sm text-muted-foreground">
              Showing <strong>{paginatedOrders.length}</strong> of <strong>{filteredOrders.length}</strong> orders
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">{currentPage} / {totalPages}</span>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>

        {/* View Order Dialog */}
        {selectedOrder && (
          <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
            <DialogContent className="sm:max-w-3xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order Details: {selectedOrder.id}
                </DialogTitle>
                <DialogDescription>Complete information for this order</DialogDescription>
              </DialogHeader>
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="details">Order Info</TabsTrigger>
                  <TabsTrigger value="customer">Customer</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                </TabsList>
                <TabsContent value="details" className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Customer</Label>
                      <p className="font-medium">{selectedOrder.customer}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Order ID</Label>
                      <p>{selectedOrder.id}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Type</Label>
                      <p>{selectedOrder.type}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Fabric</Label>
                      <p>{selectedOrder.fabric}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Location</Label>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                      <p>{selectedOrder.location}</p>
                    </div>
                  </div>
                  <div className="rounded-lg overflow-hidden">
                    <Map lat={selectedOrder.lat} lng={selectedOrder.lng} location={selectedOrder.location} />
                  </div>
                </TabsContent>
                <TabsContent value="customer" className="space-y-4 py-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{selectedOrder.customer}</h3>
                      <p className="text-sm text-muted-foreground">{selectedOrder.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                      <p>{selectedOrder.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                      <p>{selectedOrder.email || 'N/A'}</p>
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
                  </div>
                  <Progress value={selectedOrder.status === "New" ? 25 : selectedOrder.status === "In Progress" ? 50 : selectedOrder.status === "Shipped" ? 75 : 100} />
                </TabsContent>
              </Tabs>
              {selectedOrder.status === "New" && (
                <DialogFooter>
                  <Button onClick={() => handleOrderStatus(selectedOrder.id, "In Progress")}>Accept Order</Button>
                </DialogFooter>
              )}
            </DialogContent>
          </Dialog>
        )}

        {/* Delete Dialog */}
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
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
                <Button variant="destructive" onClick={() => handleDeleteOrder(selectedOrder.id)}>Delete</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </main>
  );
}
