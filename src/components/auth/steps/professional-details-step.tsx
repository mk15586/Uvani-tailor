"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  data: any;
  onChange: (patch: any) => void;
}

export function ProfessionalDetailsStep({ data, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="experience">Years of Experience</Label>
          <Input
            id="experience"
            value={data.experience || ""}
            onChange={(e) => onChange({ experience: e.target.value })}
            placeholder="e.g., 5"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="specialization">Specialization</Label>
          <Input
            id="specialization"
            value={data.specialization || ""}
            onChange={(e) => onChange({ specialization: e.target.value })}
            placeholder="e.g., Men's wear"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="skills">Skills</Label>
        <Input
          id="skills"
          value={data.skills || ""}
          onChange={(e) => onChange({ skills: e.target.value })}
          placeholder="e.g., stitching, embroidery"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="services">Services Offered</Label>
        <Textarea
          id="services"
          value={data.services || ""}
          onChange={(e) => onChange({ services: e.target.value })}
          placeholder="List services offered"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="address">Shop Address / Service Area</Label>
          <Input
            id="address"
            value={data.address || ""}
            onChange={(e) => onChange({ address: e.target.value })}
            placeholder="Street, city"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pincode">Pincode</Label>
          <Input
            id="pincode"
            value={data.pincode || ""}
            onChange={(e) => onChange({ pincode: e.target.value })}
            placeholder="e.g., 560001"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="workingHours">Working Hours / Days</Label>
        <Input
          id="workingHours"
          value={data.workingHours || ""}
          onChange={(e) => onChange({ workingHours: e.target.value })}
          placeholder="e.g., Mon-Sat 9am-6pm"
        />
      </div>
    </div>
  );
}
