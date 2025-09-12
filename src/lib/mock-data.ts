import type { ChartConfig } from "@/components/ui/chart";

export const MOCK_ORDERS = [
  { id: "ORD001", customer: "Eleonora Vance", type: "Silk Gown", fabric: "Charmeuse Silk", design: "A-Line, floor length", location: "New York, NY", lat: 40.7128, lng: -74.0060, status: "Completed", amount: 450.0, date: "2023-10-26" },
  { id: "ORD002", customer: "Julian Croft", type: "Bespoke Suit", fabric: "Merino Wool", design: "Two-piece, single-breasted", location: "London, UK", lat: 51.5072, lng: -0.1276, status: "In Progress", amount: 1250.0, date: "2023-10-28" },
  { id: "ORD003", customer: "Penelope Hayes", type: "Tweed Blazer", fabric: "Harris Tweed", design: "Classic fit, patch pockets", location: "Edinburgh, SCT", lat: 55.9533, lng: -3.1883, status: "New", amount: 320.0, date: "2023-11-01" },
  { id: "ORD004", customer: "Arthur Finch", type: "Linen Trousers", fabric: "Irish Linen", design: "Pleated front, relaxed fit", location: "Dublin, IRE", lat: 53.3498, lng: -6.2603, status: "Completed", amount: 180.0, date: "2023-10-22" },
  { id: "ORD005", customer: "Seraphina Monroe", type: "Evening Dress", fabric: "Velvet", design: "Mermaid silhouette", location: "Los Angeles, CA", lat: 34.0522, lng: -118.2437, status: "Shipped", amount: 780.0, date: "2023-10-20" },
  { id: "ORD006", customer: "Maximilian Sterling", type: "Tuxedo", fabric: "Satin Lapel Wool", design: "Shawl collar, slim fit", location: "Paris, FR", lat: 48.8566, lng: 2.3522, status: "In Progress", amount: 1500.0, date: "2023-11-05" },
  { id: "ORD007", customer: "Isabella Dubois", type: "Cocktail Dress", fabric: "Lace", design: "Sheath, knee-length", location: "Miami, FL", lat: 25.7617, lng: -80.1918, status: "Completed", amount: 550.0, date: "2023-10-15" },
  { id: "ORD008", customer: "Aarav Sharma", type: "Kurta Pajama", fabric: "Cotton Silk", design: "Embroidered neckline", location: "Mumbai, IND", lat: 19.0760, lng: 72.8777, status: "New", amount: 250.0, date: "2023-11-02" },
];

export const MOCK_FINANCIAL_DATA = {
  monthly: [
    { month: "Jan", income: 4000, expenses: 2400 },
    { month: "Feb", income: 3000, expenses: 1398 },
    { month: "Mar", income: 5000, expenses: 3800 },
    { month: "Apr", income: 2780, expenses: 1908 },
    { month: "May", income: 1890, expenses: 800 },
    { month: "Jun", income: 2390, expenses: 1800 },
    { month: "Jul", income: 3490, expenses: 2300 },
    { month: "Aug", income: 4200, expenses: 2500 },
    { month: "Sep", income: 3100, expenses: 1500 },
    { month: "Oct", income: 4800, expenses: 2800 },
    { month: "Nov", income: 3900, expenses: 2100 },
    { month: "Dec", income: 4300, expenses: 2500 },
  ],
};

export const MOCK_FINANCIAL_CHART_CONFIG = {
  income: { label: "Income", color: "hsl(var(--chart-1))" },
  expenses: { label: "Expenses", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig;

export const MOCK_CLIENTS = [
  { id: "CUST001", name: "Eleonora Vance", email: "eleonora.v@example.com", lastUpdated: "2023-10-26" },
  { id: "CUST002", name: "Julian Croft", email: "j.croft@example.com", lastUpdated: "2023-10-28" },
  { id: "CUST003", name: "Penelope Hayes", email: "penny.h@example.com", lastUpdated: "2023-11-01" },
  { id: "CUST004", name: "Arthur Finch", email: "a.finch@example.com", lastUpdated: "2023-10-22" },
];

export const MOCK_MEASUREMENTS = {
  CUST001: { chest: "34", waist: "26", hips: "36", inseam: "32", shoulder: "15" },
  CUST002: { chest: "42", waist: "34", hips: "40", inseam: "34", shoulder: "18" },
  CUST003: { chest: "36", waist: "28", hips: "38", inseam: "30", shoulder: "16" },
  CUST004: { chest: "38", waist: "32", hips: "37", inseam: "31", shoulder: "17" },
};

export const MOCK_DELIVERIES = [
  { date: new Date(2023, 10, 20), details: "ORD005 - Shipped" },
  { date: new Date(2023, 11, 5), details: "ORD006 - Final fitting" },
  { date: new Date(2023, 11, 15), details: "ORD002 - Delivery due" },
];
