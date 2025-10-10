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
  DropdownMenuLabel,
  DropdownMenuCheckboxItem
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Search, MoreHorizontal, ChevronLeft, ChevronRight, Download, Calendar, MapPin, Truck, CheckCircle, Clock, AlertCircle, Eye, Trash2, Package, User, DollarSign, Loader2, ListFilter, File, XCircle, Beaker, Ruler, Scissors,
  PackageCheck
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
import dynamic from "next/dynamic";
const Map = dynamic(() => import("@/components/shared/Map"), { ssr: false });

// --- CONFIGURATION ---

const ORDER_STATUSES = ["Pending", "confirmed", "Measurement", "Stitching", "Processing", "Shipped", "Delivered", "Cancelled", "NULL"];
const ACTIVE_STATUSES = ["Measurement", "Stitching", "Processing"];
const PENDING_STATUSES = ["Pending", "confirmed", "NULL"];

type Order = {
  id: string;
  customer: string;
  email?: string;
  phone?: string;
  type?: string;
  fabric?: string;
  amount: number;
  date: string; // ISO String
  status: string;
  location?: string;
  lat?: number;
  lng?: number;
  design?: string;
  raw: any;
};

// --- UPDATED: Professional Status Badge Styles ---
const getStatusClasses = (status: string): string => {
  status = status || "NULL";
  switch (status.toLowerCase()) {
    case "delivered":
      return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-500/20";
    case "shipped":
      return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-500/20";
    case "cancelled":
      return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-500/20";
    case "processing":
    case "stitching":
    case "measurement":
      return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-500/20";
    case "pending":
    case "confirmed":
    case "null":
      return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-500/20";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-500/20";
  }
};
const getStatusIcon = (status: string) => {
  status = status || "NULL";
  switch (status.toLowerCase()) {
    case "delivered": return <PackageCheck className="h-4 w-4" />;
    case "shipped": return <Truck className="h-4 w-4" />;
    case "processing": return <Clock className="h-4 w-4" />;
    case "stitching": return <Scissors className="h-4 w-4" />;
    case "measurement": return <Ruler className="h-4 w-4" />;
    case "confirmed": return <CheckCircle className="h-4 w-4" />;
    case "cancelled": return <XCircle className="h-4 w-4" />;
    case "pending": return <Clock className="h-4 w-4" />;
    default: return <Package className="h-4 w-4" />;
  }
};

const timelineSteps = [
    { name: "Order Pending", status: "Pending" },
    { name: "Order Confirmed", status: "confirmed" },
    { name: "Measurement", status: "Measurement" },
    { name: "Stitching", status: "Stitching" },
    { name: "Processing", status: "Processing" },
    { name: "Shipped", status: "Shipped" },
    { name: "Delivered", status: "Delivered" },
];

type StatTone = "amber" | "violet" | "emerald" | "rose";

const STAT_STYLES: Record<StatTone, {
  container: string;
  label: string;
  iconWrapper: string;
  value: string;
  caption: string;
}> = {
  amber: {
    container: "border border-amber-100/70 bg-amber-50/80 dark:border-amber-900/40 dark:bg-amber-950/20 shadow-sm backdrop-blur-sm",
    label: "text-amber-900/80 dark:text-amber-200/80",
    iconWrapper: "bg-amber-500/15 text-amber-500",
    value: "text-amber-950 dark:text-amber-50",
    caption: "text-amber-700/70 dark:text-amber-200/70",
  },
  violet: {
    container: "border border-violet-100/70 bg-violet-50/80 dark:border-violet-900/40 dark:bg-violet-950/20 shadow-sm backdrop-blur-sm",
    label: "text-violet-900/80 dark:text-violet-200/80",
    iconWrapper: "bg-violet-500/15 text-violet-500",
    value: "text-violet-950 dark:text-violet-50",
    caption: "text-violet-700/70 dark:text-violet-200/70",
  },
  emerald: {
    container: "border border-emerald-100/70 bg-emerald-50/80 dark:border-emerald-900/40 dark:bg-emerald-950/20 shadow-sm backdrop-blur-sm",
    label: "text-emerald-900/80 dark:text-emerald-200/80",
    iconWrapper: "bg-emerald-500/15 text-emerald-500",
    value: "text-emerald-950 dark:text-emerald-50",
    caption: "text-emerald-700/70 dark:text-emerald-200/70",
  },
  rose: {
    container: "border border-rose-100/70 bg-rose-50/80 dark:border-rose-900/40 dark:bg-rose-950/20 shadow-sm backdrop-blur-sm",
    label: "text-rose-900/80 dark:text-rose-200/80",
    iconWrapper: "bg-rose-500/15 text-rose-500",
    value: "text-rose-950 dark:text-rose-50",
    caption: "text-rose-700/70 dark:text-rose-200/70",
  },
};


export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'date', direction: 'desc' });
  
  const ordersPerPage = 10;

  useEffect(() => {
    let mounted = true;
    const fetchOrders = async () => {
      setIsLoading(true);
      let ordersData: any = null;
      try {
        const resp = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1000);
        ordersData = resp.data;
        if (resp.error) {
          // Log real error and bail
          console.error('Supabase orders error:', resp.error);
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        setIsLoading(false);
        return;
      }
      if (!mounted || !ordersData) {
        setIsLoading(false);
        return;
      }

      const userIds = Array.from(new Set(ordersData.map((o: any) => o.user_id).filter(Boolean).map(String)));
      let usersData: any[] = [];
      if (userIds.length > 0) {
        const { data: udata } = await supabase.from('users').select('id, username, email, phone').in('id', userIds);
        usersData = udata || [];
      }
      const usersById: Record<string, any> = {};
      usersData.forEach(u => { if (u?.id) usersById[String(u.id)] = u; });

      const uiOrders: Order[] = ordersData.map((r: any) => {
        const uid = r.user_id ? String(r.user_id) : null;
        const user = uid ? usersById[uid] : null;
        const shipping = r.shipping_address || {};
        const customer = user?.username || shipping?.name || user?.email || 'Unknown';
        const amount = typeof r.total_amount === 'number' ? r.total_amount : parseFloat(String(r.total_amount || 0));

        return {
          id: r.id, customer, email: user?.email, phone: user?.phone || shipping?.phone,
          type: r.items?.[0]?.type, fabric: r.items?.[0]?.fabric, amount,
          date: r.created_at, status: r.order_status || 'Pending', // Default to Pending
          location: shipping?.location || shipping?.address || '',
          lat: shipping?.lat, lng: shipping?.lng, design: r.items?.[0]?.design, raw: r,
        };
      });

      if (mounted) {
        setOrders(uiOrders);
        setIsLoading(false);
      }
    };

    fetchOrders();
    return () => { mounted = false; };
  }, []);

  const handleOrderStatus = (orderId: string, newStatus: string) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
    // await supabase.from('orders').update({ order_status: newStatus }).eq('id', orderId);
    setIsViewModalOpen(false);
    setSelectedOrder(null);
  };
  
  const handleDeleteOrder = (orderId: string) => {
    setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
    // await supabase.from('orders').delete().eq('id', orderId);
    setIsDeleteModalOpen(false);
    setSelectedOrder(null);
  };
  
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };
  
  const filteredAndSortedOrders = useMemo(() => {
    let filtered = orders.filter(order => {
      const q = searchTerm.toLowerCase();
      return (q === "" || 
        order.id.toLowerCase().includes(q) ||
        order.customer.toLowerCase().includes(q)) &&
        (statusFilter === "All" || (order.status || "").toLowerCase() === statusFilter.toLowerCase());
    });
    return filtered;
  }, [orders, searchTerm, statusFilter, sortConfig]);

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * ordersPerPage;
    return filteredAndSortedOrders.slice(startIndex, startIndex + ordersPerPage);
  }, [filteredAndSortedOrders, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedOrders.length / ordersPerPage);
  
  const stats = useMemo(() => {
    return {
      pending: orders.filter(o => PENDING_STATUSES.includes(o.status)).length,
      active: orders.filter(o => ACTIVE_STATUSES.includes(o.status)).length,
      delivered: orders.filter(o => o.status === 'Delivered').length,
      cancelled: orders.filter(o => o.status === 'Cancelled').length,
    };
  }, [orders]);

  const statItems = useMemo(() => (
    [
      { key: "pending", label: "Pending", value: stats.pending, caption: "Awaiting confirmation", Icon: Clock, tone: "amber" as const },
      { key: "active", label: "Active", value: stats.active, caption: "In production", Icon: Beaker, tone: "violet" as const },
      { key: "delivered", label: "Delivered", value: stats.delivered, caption: "Completed", Icon: PackageCheck, tone: "emerald" as const },
      { key: "cancelled", label: "Cancelled", value: stats.cancelled, caption: "Removed", Icon: XCircle, tone: "rose" as const },
    ]
  ), [stats]);

  const formatCurrency = useMemo(() =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format,
  []);

  const getNextStatus = (currentStatus: string): string | null => {
    const currentIndex = timelineSteps.findIndex(step => step.status.toLowerCase() === currentStatus.toLowerCase());
    if (currentIndex > -1 && currentIndex < timelineSteps.length - 1) {
      return timelineSteps[currentIndex + 1].status;
    }
    return null;
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 bg-muted/40">
      {/* --- UPDATED: Professional Stat Cards --- */}
      <section>
        <Card className="overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-background via-background to-muted/40 shadow-lg shadow-black/5">
          <CardHeader className="px-5 pt-5 pb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <Badge variant="outline" className="w-fit rounded-full border-primary/40 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-primary">
                Operational Overview
              </Badge>
              <CardTitle className="text-lg font-semibold tracking-tight text-foreground">Order Snapshot</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">Live view of your production pipeline.</CardDescription>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-border/50 bg-muted/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground/80">
              <span className="inline-flex h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
              Live
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5 pt-4 border-t border-border/70">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {statItems.map(({ key, label, value, caption, Icon, tone }) => {
                const toneClasses = STAT_STYLES[tone];
                return (
                  <div
                    key={key}
                    className={`group rounded-2xl p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${toneClasses.container}`}
                  >
                    <div className="flex items-start justify-between">
                      <span className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${toneClasses.label}`}>
                        {label}
                      </span>
                      <span className={`flex h-9 w-9 items-center justify-center rounded-full ${toneClasses.iconWrapper}`}>
                        <Icon className="h-4 w-4" />
                      </span>
                    </div>
                    <div className="mt-3 flex items-end justify-between gap-2">
                      <span className={`text-2xl font-semibold leading-none ${toneClasses.value}`}>{value}</span>
                      <span className={`text-[11px] font-medium ${toneClasses.caption}`}>{caption}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader className="flex flex-col gap-4 border-b border-border/60 bg-gradient-to-r from-background via-background to-muted/30 md:flex-row md:items-center md:justify-between">
          <div className="flex-1 space-y-1.5">
            <CardTitle className="text-lg font-semibold tracking-tight">Orders Ledger</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">Track, filter, and action every order in your pipeline.</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by ID, name..."
                className="h-10 w-[240px] rounded-full border-border/60 bg-background/80 pl-10 pr-4 text-sm shadow-sm backdrop-blur-sm sm:w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-10 rounded-full border-border/60 bg-background/80 px-4 text-sm font-medium shadow-sm">
                  <ListFilter className="mr-2 h-4 w-4" /> Filters
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground/80">Filter by Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem checked={statusFilter === "All"} onSelect={() => setStatusFilter("All")}>
                  All
                </DropdownMenuCheckboxItem>
                {ORDER_STATUSES.map((status) => (
                  <DropdownMenuCheckboxItem
                    key={status}
                    checked={statusFilter === status}
                    onSelect={() => setStatusFilter(status)}
                    className="capitalize"
                  >
                    {status}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="hidden md:block">
            <div className="overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-b from-background via-background to-muted/40 shadow-sm">
              <Table>
                <TableHeader className="bg-muted/60">
                  <TableRow className="border-b border-border/70">
                    <TableHead className="hidden pl-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70 sm:table-cell">
                      Order ID
                    </TableHead>
                    <TableHead className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">
                      Customer
                    </TableHead>
                    <TableHead className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">
                      Status
                    </TableHead>
                    <TableHead className="hidden text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70 md:table-cell">
                      Date
                    </TableHead>
                    <TableHead className="text-right text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">
                      Amount
                    </TableHead>
                    <TableHead className="w-[110px] text-right text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-28 text-center text-sm text-muted-foreground">
                        <Loader2 className="mr-2 inline-block h-4 w-4 animate-spin" /> Loading orders…
                      </TableCell>
                    </TableRow>
                  ) : paginatedOrders.length > 0 ? (
                    paginatedOrders.map((order) => (
                      <TableRow
                        key={order.id}
                        className="group border-b border-border/50 bg-background/80 transition-colors last:border-b-0 hover:bg-primary/5"
                      >
                        <TableCell className="hidden pl-6 align-middle text-xs font-medium tracking-wide text-muted-foreground/80 sm:table-cell">
                          {order.id.substring(0, 10)}…
                        </TableCell>
                        <TableCell className="align-middle">
                          <div className="flex flex-col gap-1">
                            <span className="text-sm font-semibold text-foreground">{order.customer}</span>
                            <span className="text-xs text-muted-foreground">#{order.id.substring(0, 8)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="align-middle">
                          <Badge className={`capitalize gap-1 rounded-full px-3 py-1 text-xs font-medium shadow-sm transition-colors ${getStatusClasses(order.status)}`}>
                            {getStatusIcon(order.status)}
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden align-middle text-sm text-muted-foreground md:table-cell">
                          {order.date ? format(new Date(order.date), 'PP') : '—'}
                        </TableCell>
                        <TableCell className="align-middle text-right text-sm font-semibold text-foreground">
                          {formatCurrency(order.amount)}
                        </TableCell>
                        <TableCell className="align-middle text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => { setSelectedOrder(order); setIsViewModalOpen(true); }}>
                                <Eye className="mr-2 h-4 w-4" /> View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => { setSelectedOrder(order); setIsDeleteModalOpen(true); }}
                                className="text-red-500 focus:text-red-500"
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-28 text-center text-sm text-muted-foreground">
                        No orders found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="space-y-3 md:hidden">
            {isLoading ? (
              <div className="flex h-24 items-center justify-center rounded-2xl border border-border/60 bg-background/80 text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading orders…
              </div>
            ) : paginatedOrders.length > 0 ? (
              paginatedOrders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-2xl border border-border/60 bg-gradient-to-br from-background via-background to-muted/40 p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-foreground truncate">{order.customer}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">#{order.id.substring(0, 10)}…</p>
                    </div>
                    <Badge className={`capitalize gap-1 rounded-full px-3 py-1 text-xs font-medium shadow-sm ${getStatusClasses(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status}
                    </Badge>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {order.date ? format(new Date(order.date), 'PP') : '—'}
                    </span>
                    <span className="text-sm font-semibold text-foreground">{formatCurrency(order.amount)}</span>
                  </div>
                  <div className="mt-4 flex items-center justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3 text-xs font-medium">
                          Actions
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setSelectedOrder(order); setIsViewModalOpen(true); }}>
                          <Eye className="mr-2 h-4 w-4" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => { setSelectedOrder(order); setIsDeleteModalOpen(true); }}
                          className="text-red-500 focus:text-red-500"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex h-24 items-center justify-center rounded-2xl border border-border/60 bg-background/80 text-sm text-muted-foreground">
                No orders found.
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-center justify-between gap-4 border-t border-border/60 bg-gradient-to-r from-background via-background to-muted/40 pt-4 sm:flex-row">
          <div className="text-sm text-muted-foreground">
            Showing <strong>{paginatedOrders.length > 0 ? (currentPage - 1) * ordersPerPage + 1 : 0}</strong>
            –<strong>{Math.min(currentPage * ordersPerPage, filteredAndSortedOrders.length)}</strong> of
            <strong> {filteredAndSortedOrders.length}</strong> orders
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-9 rounded-full border-border/60 bg-background/80 px-4"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="ml-1">Previous</span>
            </Button>
            <span className="text-sm font-semibold text-foreground">
              {currentPage} / {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="h-9 rounded-full border-border/60 bg-background/80 px-4"
            >
              <span className="mr-1">Next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
     </Card>

     {selectedOrder && (
       <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
         <DialogContent className="sm:max-w-3xl">
           <DialogHeader>
             <DialogTitle>Order Details</DialogTitle>
             <DialogDescription>ID: {selectedOrder.id}</DialogDescription>
           </DialogHeader>
           <div className="grid gap-6 py-4 md:grid-cols-2">
             <div className="space-y-4">
               {/* Customer and Shipping Info can be filled in here */}
             </div>
             <div className="space-y-4">
               <h3 className="font-semibold">Order Timeline</h3>
               {selectedOrder.status === 'Cancelled' ? (
                 <div className="flex items-center gap-4 p-4 bg-destructive/10 rounded-lg">
                   <XCircle className="h-8 w-8 text-destructive"/>
                   <div>
                     <h4 className="font-semibold text-destructive">Order Cancelled</h4>
                     <p className="text-sm text-muted-foreground">This order has been cancelled.</p>
                   </div>
                 </div>
               ) : (
                 <div className="relative">
                 {timelineSteps.map((step, index) => {
                   const currentStatusIndex = timelineSteps.findIndex(s => s.status.toLowerCase() === selectedOrder.status.toLowerCase());
                   const isCompleted = index <= currentStatusIndex;
                   const isCurrent = index === currentStatusIndex;
                   return(
                     <div key={step.name} className="flex gap-4 items-start">
                       <div className="flex flex-col items-center">
                           <div className={`h-4 w-4 rounded-full flex items-center justify-center ${isCompleted ? 'bg-primary' : 'bg-muted'}`}>
                             {isCompleted && <CheckCircle className="h-3 w-3 text-primary-foreground" />}
                           </div>
                           {index < timelineSteps.length - 1 && (
                             <div className={`w-0.5 h-16 ${index < currentStatusIndex ? 'bg-primary' : 'bg-muted'}`}></div>
                           )}
                       </div>
                       <div>
                         <p className={`font-semibold ${isCurrent ? 'text-primary' : ''}`}>{step.name}</p>
                         {index === 0 && <p className="text-xs text-muted-foreground">{format(new Date(selectedOrder.date), 'PPp')}</p>}
                       </div>
                     </div>
                   )
                 })}
                </div>
               )}
             </div>
           </div>
           <DialogFooter className="flex-wrap justify-start gap-2">
             <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>Close</Button>
             {getNextStatus(selectedOrder.status) && (
               <Button onClick={() => handleOrderStatus(selectedOrder.id, getNextStatus(selectedOrder.status)!)}>
                 Move to: {getNextStatus(selectedOrder.status)}
               </Button>
             )}
             {selectedOrder.status !== 'Cancelled' && selectedOrder.status !== 'Delivered' && (
               <Button variant="destructive" onClick={() => handleOrderStatus(selectedOrder.id, "Cancelled")}>Cancel Order</Button>
             )}
           </DialogFooter>
         </DialogContent>
       </Dialog>
     )}

     {selectedOrder && (
       <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
         <DialogContent className="sm:max-w-md">
           <DialogHeader>
             <DialogTitle className="flex items-center gap-2 text-destructive">
               <AlertCircle className="h-5 w-5" />
               Confirm Deletion
             </DialogTitle>
             <DialogDescription>
               Are you sure you want to delete order <strong>{selectedOrder.id}</strong>? This action cannot be undone.
             </DialogDescription>
           </DialogHeader>
           <DialogFooter>
             <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
             <Button variant="destructive" onClick={() => handleDeleteOrder(selectedOrder.id)}>Delete</Button>
           </DialogFooter>
         </DialogContent>
       </Dialog>
     )}
   </main>
  );
}
