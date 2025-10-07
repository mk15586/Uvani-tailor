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
  Bell,
  Construction,
  Wrench
} from "lucide-react";
import { MOCK_CLIENTS, MOCK_MEASUREMENTS, MOCK_ORDERS } from "@/lib/mock-data";
import dynamic from "next/dynamic";
const Map = dynamic(() => import("@/components/shared/Map"), { ssr: false });
import { useState } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO, isValid } from "date-fns";

export default function MeasurementsPage() {
  const [orders] = useState(MOCK_ORDERS);
  const router = useRouter();
  const [notified, setNotified] = useState(false);
  type Order = (typeof MOCK_ORDERS)[0];
  const initialCenter = orders && orders.length > 0 ? { lat: orders[0].lat, lng: orders[0].lng, location: orders[0].location } : { lat: 0, lng: 0, location: "" };
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number; location?: string }>(initialCenter);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Measurement scheduling + received lists
  const MASTERS = [
    { id: "MSTR1", name: "Ravi Kumar" },
    { id: "MSTR2", name: "Anita Sharma" },
    { id: "MSTR3", name: "Miguel Santos" },
  ];

  const [measurementRequests, setMeasurementRequests] = useState(() =>
    orders.slice(0, 4).map((o, i) => ({
      id: `MR-${o.id}`,
      orderId: o.id,
      customer: o.customer,
      clientId: MOCK_CLIENTS.find((c) => c.name === o.customer)?.id ?? null,
      garment: o.type ?? "Unknown",
      address: o.location,
      preferredDate: null as string | null,
      preferredTime: "",
      assignedMaster: null as string | null,
      status: "unassigned" as "unassigned" | "scheduled" | "received",
    }))
  );

  const [receivedMeasurements, setReceivedMeasurements] = useState<any[]>([]);
  const [openAssignId, setOpenAssignId] = useState<string | null>(null);
  
  // Ensure mock clients have expected optional fields to avoid TS errors
  const clientsWithDefaults = MOCK_CLIENTS.map((c) => ({
    id: c.id,
    name: c.name,
    email: c.email,
    lastUpdated: (c as any).lastUpdated ?? "-",
    avatar: (c as any).avatar ?? "",
    status: (c as any).status ?? "active",
    progress: (c as any).progress ?? 0,
  }));

  // Filtered clients based on search and status
  const filteredClients = clientsWithDefaults.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          client.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6 relative overflow-hidden">
      {/* Main Content - Dimmed but not blurred (so sidebar remains un-blurred) */}
      <div className="opacity-40 pointer-events-none select-none">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-bold text-2xl md:text-3xl text-foreground">Measurements</h1>
            <p className="text-muted-foreground mt-1">Manage client measurements</p>
          </div>
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
                {/* Desktop/Tablet: show table on md+ */}
                <div className="hidden md:block">
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
                </div>

                {/* Mobile: stacked client cards list */}
                <div className="md:hidden space-y-3">
                  {filteredClients.map((client) => (
                    <div key={client.id} className="p-3 bg-background rounded-lg border shadow-sm">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={client.avatar} alt={client.name} />
                          <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{client.name}</div>
                              <div className="text-sm text-muted-foreground">{client.email}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-semibold">{client.progress}%</div>
                              <Badge variant={client.status === 'active' ? 'default' : 'secondary'} className="capitalize mt-1">{client.status}</Badge>
                            </div>
                          </div>
                          <div className="mt-3 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <Progress value={client.progress} className="w-28 h-2" />
                            </div>
                            <div className="flex gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="sm">View</Button>
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
                              <Button variant="ghost" size="sm">More</Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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

            {/* Measurements to Take */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ruler className="h-5 w-5 text-primary" />
                  Measurements to Take
                </CardTitle>
                <CardDescription>Schedule a visit, assign a master and a time slot</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {measurementRequests.map((req) => (
                    <div key={req.id} className="p-3 rounded-lg border">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-medium">{req.customer}</div>
                          <div className="text-sm text-muted-foreground">{req.garment} • {req.address}</div>
                          <div className="text-xs text-muted-foreground mt-2">
                            {req.status === 'unassigned' && <span>Unassigned</span>}
                            {req.status === 'scheduled' && req.preferredDate && (() => {
                              const parsed = parseISO(req.preferredDate);
                              return isValid(parsed) ? <span>Scheduled: {format(parsed, 'MMM d, yyyy')} {req.preferredTime}</span> : <span>Scheduled</span>
                            })()}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => setOpenAssignId(openAssignId === req.id ? null : req.id)}>
                              {openAssignId === req.id ? 'Close' : 'Assign'}
                            </Button>
                            <Button size="sm" onClick={() => {
                              setMeasurementRequests((prev) => prev.filter((p) => p.id !== req.id));
                              setReceivedMeasurements((prev) => [{ ...req, status: 'received' }, ...prev]);
                            }}>
                              Mark Received
                            </Button>
                          </div>
                          {req.assignedMaster && <div className="text-xs text-muted-foreground">Master: {MASTERS.find(m=>m.id===req.assignedMaster)?.name ?? req.assignedMaster}</div>}
                        </div>
                      </div>

                      {openAssignId === req.id && (
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <Label className="text-sm">Preferred Date</Label>
                            <Input type="date" value={req.preferredDate ?? ''} onChange={(e) => {
                              const val = e.target.value;
                              setMeasurementRequests((prev) => prev.map(p => p.id === req.id ? { ...p, preferredDate: val || null } : p));
                            }} />
                          </div>
                          <div>
                            <Label className="text-sm">Preferred Time</Label>
                            <Input placeholder="e.g. 10:30 AM" value={req.preferredTime} onChange={(e) => setMeasurementRequests((prev) => prev.map(p => p.id === req.id ? { ...p, preferredTime: e.target.value } : p))} />
                          </div>
                          <div className="sm:col-span-2">
                            <Label className="text-sm">Assign Master</Label>
                            <Select value={req.assignedMaster ?? '__none'} onValueChange={(val) => setMeasurementRequests((prev) => prev.map(p => p.id === req.id ? { ...p, assignedMaster: val === '__none' ? null : val } : p))}>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select master" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__none">Unassigned</SelectItem>
                                {MASTERS.map((m) => (
                                  <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="sm:col-span-2 flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => setOpenAssignId(null)}>Cancel</Button>
                            <Button size="sm" onClick={() => {
                              setMeasurementRequests((prev) => prev.map(p => p.id === req.id ? { ...p, status: 'scheduled' } : p));
                              setOpenAssignId(null);
                            }}>Save</Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <div className="text-sm text-muted-foreground">{measurementRequests.length} requests</div>
              </CardFooter>
            </Card>

            {/* Received Measurements */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Received Measurements
                </CardTitle>
                <CardDescription>Measurements returned by masters</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {receivedMeasurements.length === 0 && (
                    <div className="text-sm text-muted-foreground">No measurements received yet</div>
                  )}
                  {receivedMeasurements.map((r) => (
                    <div key={r.id} className="p-3 rounded-lg border">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium">{r.customer}</div>
                          <div className="text-sm text-muted-foreground">{r.garment} • {r.address}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="ghost" onClick={() => {
                            const cid = r.clientId as string | null;
                            const measurements = cid ? MOCK_MEASUREMENTS[cid as keyof typeof MOCK_MEASUREMENTS] : null;
                            if (measurements) {
                              alert(`Measurements for ${r.customer}:\n` + Object.entries(measurements).map(([k,v])=>`${k}: ${v}`).join('\n'));
                            } else {
                              alert('No measurements available for this client');
                            }
                          }}>View</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <div className="text-sm text-muted-foreground">{receivedMeasurements.length} received</div>
              </CardFooter>
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
                <div className="h-48 md:h-64">
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
                    <Construction className="h-12 w-12 md:h-16 md:w-16 text-primary animate-bounce" />
                  </div>
                </div>
              </div>
              <CardTitle className="text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Page Under Development
              </CardTitle>
              <CardDescription className="text-sm md:text-base mt-3">
                We're working hard to bring you an amazing measurements management experience
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
                        <span>Advanced measurement management</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0"></div>
                        <span>Master scheduling system</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0"></div>
                        <span>Real-time location tracking</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0"></div>
                        <span>Detailed measurement profiles</span>
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
                  Get notified when this page goes live
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

                <Button variant="ghost" className="w-full" size="sm" onClick={() => router.push('/dashboard')}>
                  Return to Dashboard
                </Button>
              </CardFooter>
          </Card>
        </div>
      </div>
    </main>
  );
}
