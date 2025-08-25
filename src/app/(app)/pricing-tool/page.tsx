"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Wand2, Loader2, Sparkles } from "lucide-react";

export default function PricingToolPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<null | object>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);
    setTimeout(() => {
      setResult({
        price: "450 - 550",
        reasoning: "Based on the complexity of a 'Silk Evening Gown' and the premium nature of 'Silk Charmeuse', the price reflects approximately 10-12 hours of skilled labor, material costs, and a 20% markup for intricate details like beading."
      });
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col gap-8">
      <header className="animate-fade-in-up">
        <h1 className="font-headline text-4xl font-bold tracking-tight text-primary flex items-center gap-3">
          <Wand2 /> AI Pricing Assistant
        </h1>
        <p className="text-muted-foreground">
          Generate ideal price suggestions for your bespoke creations.
        </p>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <Card className="animate-fade-in-up shadow-lg" style={{ animationDelay: '200ms' }}>
            <form onSubmit={handleSubmit}>
                <CardHeader>
                    <CardTitle>Describe the Garment</CardTitle>
                    <CardDescription>
                    Provide the details below for an AI-powered price estimate.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="garment-type">Garment Type</Label>
                        <Input id="garment-type" placeholder="e.g., Bespoke Suit, Evening Gown" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="fabric">Main Fabric</Label>
                         <Select>
                            <SelectTrigger id="fabric">
                                <SelectValue placeholder="Select fabric type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="cotton">Cotton</SelectItem>
                                <SelectItem value="silk">Silk</SelectItem>
                                <SelectItem value="wool">Wool</SelectItem>
                                <SelectItem value="linen">Linen</SelectItem>
                                <SelectItem value="synthetic">Synthetic</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="complexity">Complexity</Label>
                        <Select>
                            <SelectTrigger id="complexity">
                                <SelectValue placeholder="Select complexity level" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="simple">Simple (Minimal seams, basic shape)</SelectItem>
                                <SelectItem value="intermediate">Intermediate (Pockets, collars, lining)</SelectItem>
                                <SelectItem value="complex">Complex (Intricate details, beading, tailoring)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="details">Additional Details</Label>
                        <Textarea id="details" placeholder="Describe any unique features, embellishments, or specific client requests..." />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={isLoading} className="w-full">
                        {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Wand2 className="mr-2 h-4 w-4" />
                        )}
                        Generate Pricing
                    </Button>
                </CardFooter>
            </form>
        </Card>

        <Card className="animate-fade-in-up shadow-lg sticky top-6" style={{ animationDelay: '300ms' }}>
            <CardHeader className="flex-row gap-3 items-center">
                <Sparkles className="w-8 h-8 text-accent" />
                <div>
                    <CardTitle>Suggested Pricing</CardTitle>
                    <CardDescription>Our AI's recommendation will appear here.</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="min-h-[200px] flex items-center justify-center">
                {isLoading && <Loader2 className="w-10 h-10 text-primary animate-spin" />}
                {!isLoading && !result && (
                    <div className="text-center text-muted-foreground p-8">
                        <p>Your price suggestion is waiting...</p>
                    </div>
                )}
                {result && (
                    <div className="space-y-4 text-center animate-fade-in-up">
                        <p className="text-sm text-primary font-semibold">Suggested Price Range</p>
                        <h2 className="font-headline text-5xl text-primary">{result.price}</h2>
                        <p className="text-sm text-muted-foreground pt-4 border-t">{result.reasoning}</p>
                    </div>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
