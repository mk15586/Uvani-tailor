"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, PlusCircle, XCircle } from "lucide-react";

interface Service {
  name: string;
  price: string;
  image: File | null;
}

export function ServicesStep() {
  const [services, setServices] = useState<Service[]>([
    { name: "", price: "", image: null },
  ]);

  const handleAddService = () => {
    setServices([...services, { name: "", price: "", image: null }]);
  };

  const handleRemoveService = (index: number) => {
    const newServices = services.filter((_, i) => i !== index);
    setServices(newServices);
  };

  const handleServiceChange = (
    index: number,
    field: keyof Service,
    value: any
  ) => {
    const newServices = [...services];
    if (field === "image") {
      newServices[index][field] = value.target.files[0];
    } else {
      newServices[index][field] = value.target.value;
    }
    setServices(newServices);
  };

  return (
    <div className="space-y-6">
      {services.map((service, index) => (
        <div
          key={index}
          className="p-4 border rounded-lg space-y-4 relative bg-gray-50 dark:bg-gray-800"
        >
          {services.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2"
              onClick={() => handleRemoveService(index)}
            >
              <XCircle className="h-5 w-5 text-red-500" />
            </Button>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor={`serviceName-${index}`}>Service/Garment Type</Label>
              <Input
                id={`serviceName-${index}`}
                placeholder="e.g., Men's Suit"
                value={service.name}
                onChange={(e) => handleServiceChange(index, "name", e)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`price-${index}`}>Price</Label>
              <Input
                id={`price-${index}`}
                placeholder="e.g., $250"
                value={service.price}
                onChange={(e) => handleServiceChange(index, "price", e)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Sample Image</Label>
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor={`image-upload-${index}`}
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">Click to upload</span>
                  </p>
                  {service.image && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {service.image.name}
                    </p>
                  )}
                </div>
                <input
                  id={`image-upload-${index}`}
                  type="file"
                  className="hidden"
                  onChange={(e) => handleServiceChange(index, "image", e)}
                />
              </label>
            </div>
          </div>
        </div>
      ))}
      <Button onClick={handleAddService} variant="outline" className="w-full">
        <PlusCircle className="h-5 w-5 mr-2" />
        Add Another Service
      </Button>
    </div>
  );
}
