
"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
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
import { MOCK_CLIENTS, MOCK_MEASUREMENTS } from "@/lib/mock-data";
import { Ruler, Edit, PlusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function MeasurementsPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
       <div className="flex items-center">
        <h1 className="font-semibold text-lg md:text-2xl">Measurements</h1>
        <div className="ml-auto flex items-center gap-2">
            <Button size="sm" className="h-8 gap-1">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Add Client
              </span>
            </Button>
        </div>
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <CardHeader>
              <CardTitle>Client Measurements</CardTitle>
              <CardDescription>
                Select a client to view or edit their measurements.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client Name</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_CLIENTS.map((client, index) => (
                    <TableRow key={client.id} className="animate-fade-in-up" style={{ animationDelay: `${300 + index * 100}ms` }}>
                      <TableCell>
                         <div className="font-medium">{client.name}</div>
                         <div className="text-sm text-muted-foreground">{client.email}</div>
                      </TableCell>
                      <TableCell>{client.lastUpdated}</TableCell>
                      <TableCell>
                        <Badge variant="outline">Active</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <Ruler /> {client.name}'s Measurements
                              </DialogTitle>
                              <DialogDescription>
                                All measurements are in inches. Click save when you're done.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid grid-cols-2 gap-4 py-4">
                              {Object.entries(MOCK_MEASUREMENTS[client.id as keyof typeof MOCK_MEASUREMENTS]).map(([key, value]) => (
                                <div className="space-y-2" key={key}>
                                    <Label htmlFor={key} className="capitalize">
                                        {key}
                                    </Label>
                                    <Input id={key} defaultValue={value} />
                                </div>
                              ))}
                            </div>
                            <DialogFooter>
                                <Button type="submit">Save Changes</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <CardHeader>
              <CardTitle>Delivery Schedule</CardTitle>
              <CardDescription>Upcoming deadlines and deliveries.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Calendar
                mode="single"
                selected={new Date()}
                className="rounded-md border"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
