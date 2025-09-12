"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Ruler, 
  Edit, 
  PlusCircle, 
  Package, 
  MapPin, 
  User, 
  Calendar as CalendarIcon,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Filter,
  Search,
  MoreHorizontal,
  Eye,
  Download,
  Bell
} from "lucide-react";
import { MOCK_CLIENTS, MOCK_MEASUREMENTS, MOCK_ORDERS } from "@/lib/mock-data";
import Map from "@/components/shared/Map";
import { useState } from "react";
import { format } from "date-fns";

export default function MeasurementsPage() {
  const [orders] = useState(MOCK_ORDERS);
  type Order = (typeof MOCK_ORDERS)[0];
  const initialCenter = orders && orders.length > 0 ? { lat: orders[0].lat, lng: orders[0].lng, location: orders[0].location } : { lat: 0, lng: 0, location: "" };
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number; location?: string }>(initialCenter);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Stats data
  const stats = [
    { title: "Total Clients", value: "142", change: "+12%", icon: User },
    { title: "Active Projects", value: "24", change: "+3%", icon: Package },
    { title: "Completion Rate", value: "87%", change: "+5%", icon: CheckCircle },
    { title: "Pending Tasks", value: "9", change: "-2", icon: Clock },
  ];

  // Filtered clients based on search and status
  const filteredClients = MOCK_CLIENTS.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          client.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-bold text-2xl md:text-3xl text-foreground">Measurements & Orders</h1>
          <p className="text-muted-foreground mt-1">Manage client measurements and track orders</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </Button>
          <Button size="sm" className="gap-2">
            <PlusCircle className="h-4 w-4" />
            <span>Add New</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                  <p className="text-xs text-emerald-500 mt-1 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {stat.change}
                  </p>
                </div>
                <div className="p-2 bg-primary/10 rounded-lg">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:gap-6 lg:grid-cols-3">
        {/* Client Measurements Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Ruler className="h-5 w-5 text-primary" />
                    Client Measurements
                  </CardTitle>
                  <CardDescription>
                    View and edit client measurement profiles
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search clients..."
                      className="pl-8 w-full sm:w-40"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client, index) => (
                    <TableRow key={client.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={client.avatar} alt={client.name} />
                            <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{client.name}</div>
                            <div className="text-sm text-muted-foreground">{client.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{client.lastUpdated}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={client.status === "active" ? "default" : "secondary"}
                          className="capitalize"
                        >
                          {client.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={client.progress} className="w-24" />
                          <span className="text-xs text-muted-foreground">{client.progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <Ruler className="h-5 w-5 text-primary" /> 
                                  {client.name}'s Measurements
                                </DialogTitle>
                                <DialogDescription>
                                  Detailed measurements profile. All measurements are in inches.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid grid-cols-2 gap-4 py-4">
                                {Object.entries(MOCK_MEASUREMENTS[client.id as keyof typeof MOCK_MEASUREMENTS]).map(([key, value]) => (
                                  <div className="space-y-2" key={key}>
                                    <Label htmlFor={key} className="capitalize text-sm">
                                      {key.replace(/([A-Z])/g, ' $1').trim()}
                                    </Label>
                                    <Input id={key} defaultValue={value} className="text-sm" />
                                  </div>
                                ))}
                              </div>
                              <DialogFooter className="gap-2 sm:gap-0">
                                <Button variant="outline">Export PDF</Button>
                                <Button>Save Changes</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {filteredClients.length} of {MOCK_CLIENTS.length} clients
              </div>
              <Button variant="ghost" size="sm">
                View All Clients
              </Button>
            </CardFooter>
          </Card>

          {/* Delivery Schedule */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-primary" />
                Delivery Schedule
              </CardTitle>
              <CardDescription>Upcoming deadlines and deliveries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={new Date()}
                  className="rounded-md border w-full max-w-xs"
                />
              </div>
              <Separator className="my-4" />
              <div className="space-y-3">
                <h4 className="font-medium">Today's Deliveries</h4>
                <div className="space-y-2">
                  {orders.slice(0, 3).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-md">
                          <Package className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{order.customer}</p>
                          <p className="text-xs text-muted-foreground">{order.location}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="capitalize">{order.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders & Map Panel */}
        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Orders & Locations
              </CardTitle>
              <CardDescription>Recent orders and delivery locations</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-64">
                <Map lat={mapCenter.lat} lng={mapCenter.lng} location={mapCenter.location ?? ""} />
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Recent Orders</h4>
                  <Button variant="ghost" size="sm" className="text-xs">
                    View All
                  </Button>
                </div>
                <div className="space-y-3">
                  {orders.slice(0, 4).map((order) => (
                    <div 
                      key={order.id}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedOrder?.id === order.id ? 'bg-primary/5 border-primary' : 'hover:bg-muted/30'
                      }`}
                      onClick={() => {
                        setSelectedOrder(order as Order);
                        if (order.lat && order.lng) {
                          setMapCenter({ lat: order.lat, lng: order.lng, location: order.location });
                        }
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-md">
                          <Package className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{order.customer}</p>
                          <p className="text-xs text-muted-foreground">{format(new Date(order.date), 'MMM d, yyyy')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize text-xs">{order.status}</Badge>
                        <span className="font-semibold text-sm">${order.amount.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                {selectedOrder ? `Showing: ${selectedOrder.location}` : `Showing: ${initialCenter.location}`}
              </div>
              <Button variant="ghost" size="sm" className="gap-1">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </CardFooter>
          </Card>

          {/* Quick Actions */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and operations</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-16 flex flex-col gap-1 items-center justify-center">
                <PlusCircle className="h-5 w-5" />
                <span>New Order</span>
              </Button>
              <Button variant="outline" className="h-16 flex flex-col gap-1 items-center justify-center">
                <Ruler className="h-5 w-5" />
                <span>Add Measurements</span>
              </Button>
              <Button variant="outline" className="h-16 flex flex-col gap-1 items-center justify-center">
                <AlertCircle className="h-5 w-5" />
                <span>Pending Tasks</span>
              </Button>
              <Button variant="outline" className="h-16 flex flex-col gap-1 items-center justify-center">
                <Download className="h-5 w-5" />
                <span>Reports</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Detailed Orders Section */}
      <div className="mt-2">
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Order Management
                </CardTitle>
                <CardDescription>
                  Track and manage all client orders
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-1">
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
                <Button size="sm" className="gap-1">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow 
                    key={order.id}
                    className={`cursor-pointer ${selectedOrder?.id === order.id ? 'bg-muted/30' : ''}`}
                    onClick={() => {
                      setSelectedOrder(order as Order);
                      if (order.lat && order.lng) {
                        setMapCenter({ lat: order.lat, lng: order.lng, location: order.location });
                      }
                    }}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        {order.id}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={`https://i.pravatar.cc/150?u=${order.customer}`} />
                          <AvatarFallback>{order.customer.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {order.customer}
                      </div>
                    </TableCell>
                    <TableCell>{format(new Date(order.date), 'MMM d, yyyy')}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={order.status === "delivered" ? "default" : order.status === "pending" ? "secondary" : "outline"}
                        className="capitalize"
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        {order.location}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-semibold">${order.amount.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {orders.length} orders
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Previous</Button>
              <Button variant="outline" size="sm">Next</Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}