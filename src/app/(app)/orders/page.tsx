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

  const getNextStatus = (currentStatus: string): string | null => {
    const currentIndex = timelineSteps.findIndex(step => step.status.toLowerCase() === currentStatus.toLowerCase());
    if (currentIndex > -1 && currentIndex < timelineSteps.length - 1) {
      return timelineSteps[currentIndex + 1].status;
    }
    return null;
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 bg-muted/40">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting confirmation/action</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <Beaker className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">In measurement, stitching, etc.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered Orders</CardTitle>
            <PackageCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.delivered}</div>
            <p className="text-xs text-muted-foreground">Successfully fulfilled</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelled Orders</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.cancelled}</div>
            <p className="text-xs text-muted-foreground">Cancelled by user or admin</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <CardTitle>Orders</CardTitle>
              <CardDescription>Manage your orders and view their details.</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
               <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                   type="search" 
                   placeholder="Search by ID, name..." 
                   className="pl-8 sm:w-[300px]"
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
             <DropdownMenu>
               <DropdownMenuTrigger asChild>
                 <Button variant="outline" size="sm" className="h-9 gap-1">
                   <ListFilter className="h-3.5 w-3.5" />
                   <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Filter</span>
                 </Button>
               </DropdownMenuTrigger>
               <DropdownMenuContent align="end">
                 <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                 <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem checked={statusFilter === "All"} onSelect={() => setStatusFilter("All")}>All</DropdownMenuCheckboxItem>
                  {ORDER_STATUSES.map(status => (
                   <DropdownMenuCheckboxItem 
                       key={status} 
                       checked={statusFilter === status} 
                       onSelect={() => setStatusFilter(status)}>
                       {status}
                   </DropdownMenuCheckboxItem>
                  ))}
               </DropdownMenuContent>
             </DropdownMenu>
           </div>
         </div>
       </CardHeader>
       <CardContent>
         {/* Desktop / Tablet: keep the existing table on md+ */}
         <div className="hidden md:block rounded-md border">
           <Table>
             <TableHeader>
               <TableRow>
                 <TableHead className="hidden sm:table-cell">Order ID</TableHead>
                 <TableHead>Customer</TableHead>
                 <TableHead>Status</TableHead>
                 <TableHead className="hidden md:table-cell">Date</TableHead>
                 <TableHead className="text-right">Amount</TableHead>
                 <TableHead className="w-[100px] text-right">Actions</TableHead>
               </TableRow>
             </TableHeader>
             <TableBody>
               {isLoading ? (
                   <TableRow><TableCell colSpan={6} className="text-center h-24"><Loader2 className="animate-spin inline-block mr-2" /> Loading...</TableCell></TableRow>
               ) : paginatedOrders.length > 0 ? (
                 paginatedOrders.map((order) => (
                   <TableRow key={order.id} className="hover:bg-muted/50">
                     <TableCell className="font-medium text-xs hidden sm:table-cell">{order.id.substring(0, 8)}...</TableCell>
                     <TableCell>
                       <div className="font-medium">{order.customer}</div>
                       <div className="text-xs text-muted-foreground md:hidden">{order.id.substring(0, 8)}...</div>
                     </TableCell>
                     <TableCell>
                         {/* --- UPDATED BADGE IMPLEMENTATION --- */}
                       <Badge className={`capitalize gap-1 text-xs whitespace-nowrap ${getStatusClasses(order.status)}`}>
                         {getStatusIcon(order.status)}
                         {order.status}
                       </Badge>
                     </TableCell>
                    <TableCell className="hidden md:table-cell">{order.date ? format(new Date(order.date), 'PP') : '—'}</TableCell>
                     <TableCell className="text-right">₹{order.amount.toFixed(2)}</TableCell>
                     <TableCell className="text-right">
                       <DropdownMenu>
                         <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                         <DropdownMenuContent align="end">
                           <DropdownMenuItem onClick={() => { setSelectedOrder(order); setIsViewModalOpen(true); }}><Eye className="mr-2 h-4 w-4" /> View Details</DropdownMenuItem>
                           <DropdownMenuItem onClick={() => { setSelectedOrder(order); setIsDeleteModalOpen(true); }} className="text-red-500 focus:text-red-500"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                         </DropdownMenuContent>
                       </DropdownMenu>
                     </TableCell>
                   </TableRow>
                 )) ) : (
                   <TableRow><TableCell colSpan={6} className="text-center h-24">No orders found.</TableCell></TableRow>
               )}
             </TableBody>
           </Table>
         </div>

         {/* Mobile: stacked, readable list to avoid table shrink */}
         <div className="md:hidden space-y-3">
           {isLoading ? (
             <div className="text-center h-24 flex items-center justify-center"><Loader2 className="animate-spin inline-block mr-2" /> Loading...</div>
           ) : paginatedOrders.length > 0 ? (
             paginatedOrders.map(order => (
               <div key={order.id} className="border rounded-lg p-3 flex flex-col gap-2 bg-background">
                 <div className="flex items-start justify-between gap-2">
                   <div className="flex-1 min-w-0">
                     <div className="flex items-center justify-between gap-2">
                       <div className="font-medium truncate">{order.customer}</div>
                       <div className="text-xs text-muted-foreground">₹{order.amount.toFixed(2)}</div>
                     </div>
                     <div className="text-xs text-muted-foreground truncate">{order.id.substring(0,8)}…</div>
                   </div>
                 </div>
                 <div className="flex items-center justify-between gap-2">
                   <div className="flex items-center gap-2">
                     <Badge className={`capitalize gap-1 text-xs whitespace-nowrap ${getStatusClasses(order.status)}`}>
                       {getStatusIcon(order.status)}
                       {order.status}
                     </Badge>
                     <div className="text-xs text-muted-foreground">{order.date ? format(new Date(order.date), 'PP') : '—'}</div>
                   </div>
                   <div>
                     <DropdownMenu>
                       <DropdownMenuTrigger asChild>
                         <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                       </DropdownMenuTrigger>
                       <DropdownMenuContent align="end">
                         <DropdownMenuItem onClick={() => { setSelectedOrder(order); setIsViewModalOpen(true); }}><Eye className="mr-2 h-4 w-4" /> View Details</DropdownMenuItem>
                         <DropdownMenuItem onClick={() => { setSelectedOrder(order); setIsDeleteModalOpen(true); }} className="text-red-500 focus:text-red-500"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                       </DropdownMenuContent>
                     </DropdownMenu>
                   </div>
                 </div>
               </div>
             ))
           ) : (
             <div className="text-center h-24 flex items-center justify-center">No orders found.</div>
           )}
         </div>
       </CardContent>
       <CardFooter className="flex flex-col gap-4 sm:flex-row justify-between items-center pt-4">
          <div className="text-sm text-muted-foreground">Showing <strong>{paginatedOrders.length > 0 ? (currentPage - 1) * ordersPerPage + 1 : 0}</strong>-<strong>{Math.min(currentPage * ordersPerPage, filteredAndSortedOrders.length)}</strong> of <strong>{filteredAndSortedOrders.length}</strong> orders</div>
          <div className="flex items-center space-x-2">
           <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
             <ChevronLeft className="h-4 w-4" /> <span className="ml-1">Previous</span>
           </Button>
           <span className="text-sm font-medium">{currentPage} / {totalPages || 1}</span>
           <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
            <span className="mr-1">Next</span> <ChevronRight className="h-4 w-4" />
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
