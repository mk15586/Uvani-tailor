
"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { MOCK_FINANCIAL_DATA, MOCK_FINANCIAL_CHART_CONFIG } from "@/lib/mock-data";
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react";

export default function FinancePage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
       <div className="flex items-center">
        <h1 className="font-semibold text-lg md:text-2xl">Finance</h1>
       </div>
      <Tabs defaultValue="overview" className="space-y-4 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="income">Income Report</TabsTrigger>
          <TabsTrigger value="expenses">Expense Report</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Total Profit", value: "$32,121.89", icon: DollarSign, description: "+22% from last month" },
              { title: "Total Income", value: "$45,231.89", icon: TrendingUp, description: "+25% from last month" },
              { title: "Total Expenses", value: "$13,110.00", icon: TrendingDown, description: "+15% from last month" },
            ].map((item, index) => (
              <Card 
                key={item.title} 
                className="animate-fade-in-up"
                style={{ animationDelay: `${300 + index * 100}ms` }}
                >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{item.value}</div>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="animate-fade-in-up" style={{ animationDelay: '600ms' }}>
            <CardHeader>
              <CardTitle>Annual Performance</CardTitle>
              <CardDescription>Income vs. Expenses over the year</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={MOCK_FINANCIAL_CHART_CONFIG} className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                    data={MOCK_FINANCIAL_DATA.monthly}
                    margin={{
                        top: 10,
                        right: 30,
                        left: 0,
                        bottom: 0,
                    }}
                    >
                    <defs>
                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => `$${value/1000}k`} />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Area type="monotone" dataKey="income" stroke="hsl(var(--chart-1))" fillOpacity={1} fill="url(#colorIncome)" />
                    <Area type="monotone" dataKey="expenses" stroke="hsl(var(--chart-2))" fillOpacity={1} fill="url(#colorExpenses)" />
                    </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
