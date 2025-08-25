
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
import { Ruler, Edit } from "lucide-react";

export default function MeasurementsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="animate-fade-in-up shadow-lg" style={{ animationDelay: '200ms' }}>
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
                    <TableHead>Email</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_CLIENTS.map((client, index) => (
                    <TableRow key={client.id} className="animate-fade-in-up" style={{ animationDelay: `${300 + index * 100}ms` }}>
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell>{client.email}</TableCell>
                      <TableCell>{client.lastUpdated}</TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle className="font-headline text-2xl flex items-center gap-2">
                                <Ruler /> {client.name}'s Measurements
                              </DialogTitle>
                              <DialogDescription>
                                All measurements are in inches.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid grid-cols-2 gap-4 py-4">
                              {Object.entries(MOCK_MEASUREMENTS[client.id as keyof typeof MOCK_MEASUREMENTS]).map(([key, value]) => (
                                <div className="grid grid-cols-3 items-center gap-4" key={key}>
                                    <Label htmlFor={key} className="text-right capitalize">
                                        {key}
                                    </Label>
                                    <Input id={key} defaultValue={value} className="col-span-2" />
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
          <Card className="animate-fade-in-up shadow-lg" style={{ animationDelay: '300ms' }}>
            <CardHeader>
              <CardTitle>Delivery Schedule</CardTitle>
              <CardDescription>Upcoming deadlines and deliveries.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Calendar
                mode="single"
                selected={new Date()}
                className="rounded-md"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
