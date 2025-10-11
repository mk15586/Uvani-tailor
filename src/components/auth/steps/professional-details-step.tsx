"use client";

import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, ChevronDown, X, Check, Clock, MapPin, Briefcase, Navigation, Loader2 } from "lucide-react";

type MultiSelectOption = { value: string; label: string };
type CustomGarmentsMap = Record<string, string[]>;

const addUniqueCaseInsensitive = (list: string[], value: string) => {
  const lower = value.toLowerCase();
  return [...list.filter((item) => item.toLowerCase() !== lower), value];
};

const removeCaseInsensitive = (list: string[], value: string) => {
  const lower = value.toLowerCase();
  return list.filter((item) => item.toLowerCase() !== lower);
};

const includesCaseInsensitive = (list: string[], value: string) => {
  const lower = value.toLowerCase();
  return list.some((item) => item.toLowerCase() === lower);
};

const normalizeCategoryMap = (input: any, categories: string[]): CustomGarmentsMap => {
  const map: CustomGarmentsMap = {};
  if (input && typeof input === 'object') {
    Object.keys(input).forEach((key) => {
      const value = input[key];
      if (Array.isArray(value)) {
        map[key] = value;
      }
    });
  }
  categories.forEach((category) => {
    if (!Array.isArray(map[category])) {
      map[category] = [];
    }
  });
  return map;
};

const SPECIALIZATION_OPTIONS: MultiSelectOption[] = [
  { value: 'men', label: "Men's Wear" },
  { value: 'women', label: "Women's Wear" },
  
];

const SKILLS_SUGGESTIONS: string[] = [
  "Stitching", "Embroidery", "Pattern Making", "Alterations", 
  "Custom Fitting", "Hand Stitching", "Machine Stitching", 
  "Fabric Selection", "Design Consultation",
];

const FABRICS_LIST: string[] = [
  "Cotton",
  "Linen",
  "Silk",
  "Wool",
  "Branded Suiting (Raymond Siyaram)",
  "Madhubani Khadi",
  "Bhagalpuri Khadi",
  "Andhra Khadi",
  "Hemp Fabric",
  "Polyester",
  "Velvet",
  "Chikankari",
  "Paper Cotton",
  "Tussar Cotton",
  "White Fabric",
  "Galaxy Linen",
  "Thailand Linen",
  "Khadi Cotton",
  "Pajama Cotton",
  "Paithani Fabric",
  "Dusuti",
  "Pure Cotton",
  "Centari",
  "Char Sutti",
  "Matka Khadi",
  "Rayon Chicken",
];

const GARMENTS_BY_CATEGORY: Record<string, string[]> = {
  men: [
    'Pant','Shirt','Kurta','Paijama','Blazer','Coat (Set)','Vastcoat','Bandi','Paithani Suit','Sherwani','Shirt + Pant Set','Kurta + Paijama (Set)','Coat + Pant (Set)','Coat + Vastcoat + Pant','Blazer + Pant (Set)','Sherwani + Paijama (Set)'
  ],
  women: [
    'Saree Blouse','Lehenga Choli','Kurti','Anarkali Suit','Salwar Kameez','Western Dress','Gown / Evening Wear','Dupatta Customization'
  ]
};

const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Mon', fullLabel: 'Monday' },
  { value: 'tuesday', label: 'Tue', fullLabel: 'Tuesday' },
  { value: 'wednesday', label: 'Wed', fullLabel: 'Wednesday' },
  { value: 'thursday', label: 'Thu', fullLabel: 'Thursday' },
  { value: 'friday', label: 'Fri', fullLabel: 'Friday' },
  { value: 'saturday', label: 'Sat', fullLabel: 'Saturday' },
  { value: 'sunday', label: 'Sun', fullLabel: 'Sunday' },
];

interface Props {
  data: any;
  onChange: (patch: any) => void;
}

// Multi-Select Dropdown
function MultiSelectDropdown({
  options,
  selectedValues,
  onChange,
  placeholder,
}: {
  options: MultiSelectOption[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && e.target instanceof Node && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (value: string) => {
    onChange(selectedValues.includes(value) 
      ? selectedValues.filter(v => v !== value) 
      : [...selectedValues, value]
    );
  };

  const removeOption = (value: string | undefined, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!value) return;
    onChange(selectedValues.filter(v => v !== value));
  };

  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedLabels = options
    .filter(opt => selectedValues.includes(opt.value))
    .map(opt => opt.label);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div
        className="w-full min-h-[44px] sm:min-h-[42px] border rounded-lg px-3 py-2 bg-white dark:bg-gray-800 cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 transition-colors flex items-center flex-wrap gap-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedLabels.length > 0 ? (
          selectedLabels.map((label, idx) => (
            <span key={idx} className="inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs sm:text-sm px-2 py-1 rounded-md">
              <span className="truncate max-w-[120px] sm:max-w-none">{label}</span>
              <button onClick={(e) => removeOption(options.find(o => o.label === label)?.value, e)} className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5 flex-shrink-0" aria-label={`Remove ${label}`}>
                <X size={14} />
              </button>
            </span>
          ))
        ) : (
          <span className="text-gray-400 text-sm sm:text-base">{placeholder}</span>
        )}
        <ChevronDown size={18} className={`ml-auto text-gray-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-white dark:bg-gray-800 border rounded-lg shadow-lg overflow-hidden">
          <div className="p-3 sm:p-2 border-b">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 sm:py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          <div className="max-h-60 overflow-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map(opt => (
                <label key={opt.value} className="flex items-center px-4 py-3 sm:py-2.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors active:bg-gray-200 dark:active:bg-gray-600">
                  <input type="checkbox" checked={selectedValues.includes(opt.value)} onChange={() => toggleOption(opt.value)} className="w-5 h-5 sm:w-4 sm:h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer flex-shrink-0" />
                  <span className="ml-3 text-sm">{opt.label}</span>
                </label>
              ))
            ) : (
              <div className="px-4 py-4 sm:py-3 text-sm text-gray-500 text-center">No options found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Skills Input
function SkillsInput({ value, onChange }: { value?: string; onChange: (val: string) => void }) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const currentSkills = value ? value.split(',').map(s => s.trim()).filter(Boolean) : [];

  const addSkill = (skill: string) => {
    if (!currentSkills.includes(skill)) {
      onChange([...currentSkills, skill].join(', '));
    }
    setShowSuggestions(false);
  };

  const removeSkill = (skill: string) => onChange(currentSkills.filter((s) => s !== skill).join(', '));
  const availableSuggestions = SKILLS_SUGGESTIONS.filter(s => !currentSkills.includes(s));

  return (
    <div className="relative">
      {currentSkills.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {currentSkills.map((skill, idx) => (
            <span key={idx} className="inline-flex items-center gap-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs sm:text-sm px-2.5 sm:px-3 py-1.5 sm:py-1 rounded-full">
              {skill}
              <button onClick={() => removeSkill(skill)} className="hover:bg-green-200 dark:hover:bg-green-800 rounded-full p-1 sm:p-0.5 flex-shrink-0" aria-label={`Remove ${skill}`}>
                <X size={12} className="sm:w-3.5 sm:h-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}
      <Input
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        placeholder="Type skills or select suggestions"
        className="focus:ring-2 focus:ring-blue-500 min-h-[44px] sm:min-h-[42px] text-sm sm:text-base"
      />
      {showSuggestions && availableSuggestions.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border rounded-lg shadow-lg max-h-52 overflow-auto">
          <div className="p-2 text-xs text-gray-500 border-b">Quick add:</div>
          {availableSuggestions.map((skill, idx) => (
            <button key={idx} onClick={() => addSkill(skill)} className="w-full text-left px-4 py-3 sm:py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm transition-colors active:bg-gray-200 dark:active:bg-gray-600">
              + {skill}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Location Picker
interface LocationPickerProps {
  address?: string;
  pincode?: string;
  onAddressChange: (value: string) => void;
  onPincodeChange: (value: string) => void;
}

function LocationPicker({ address, pincode, onAddressChange, onPincodeChange }: LocationPickerProps) {
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState("");

  const getMyLocation = async () => {
    setIsLocating(true);
    setLocationError("");

    if (!("geolocation" in navigator)) {
      setLocationError("Geolocation is not supported by your browser");
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          if (!response.ok) throw new Error("Failed to fetch address");
          
          const data: any = await response.json();
          console.log("Geocoding API Response:", data);

          const addressParts = [data.locality, data.city, data.principalSubdivision, data.countryName].filter(Boolean);
          const fullAddress = addressParts.join(", ");
          const detectedPincode = data.postcode || data.postalCode || data.zipCode || data.zip || "";

          onAddressChange(fullAddress || "Location detected");
          onPincodeChange(detectedPincode);

          // Attempt to save coordinates to Supabase if we have a registered email in localStorage
          try {
            const email = typeof window !== 'undefined' ? localStorage.getItem('uvani_signup_email') : null;
            if (email) {
              const { error: upErr } = await supabase
                .from('tailors')
                .update({ latitude: latitude, longitude: longitude })
                .eq('email', email);
              if (upErr) {
                console.error('Failed to save coordinates to Supabase', upErr);
                setLocationError('Address detected but failed to save coordinates to profile');
              } else {
                // optional visual cue could be handled by parent via onChange as well
                console.log('Coordinates saved for', email, latitude, longitude);
              }
            }
          } catch (err) {
            console.error('Error saving coordinates:', err);
            setLocationError('Address detected but failed to save coordinates to profile');
          }

          if (!detectedPincode) {
            setLocationError("Address detected, but pincode not available for this location. Please enter manually.");
          }
          setIsLocating(false);
        } catch (error) {
          console.error("Reverse geocoding error:", error);
          setLocationError("Could not fetch address details. Please enter manually.");
          setIsLocating(false);
        }
      },
      (error) => {
        const messages: Record<number, string> = {
          [error.PERMISSION_DENIED]: "Location access denied. Please enable location permissions.",
          [error.POSITION_UNAVAILABLE]: "Location information unavailable.",
          [error.TIMEOUT]: "Location request timed out.",
        };
        setLocationError(messages[error.code] || "Unable to retrieve location");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const AlertMessage = ({ type, children }: { type: 'error' | 'warning' | 'success'; children: React.ReactNode }) => {
    const styles: Record<'error' | 'warning' | 'success', string> = {
      error: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200",
      warning: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200",
      success: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200"
    };
    return (
      <div className={`flex items-start gap-2 p-3 border rounded-lg text-xs sm:text-sm ${styles[type]}`}>
        {type === 'success' ? <MapPin size={16} className="mt-0.5 flex-shrink-0" /> : <X size={16} className="mt-0.5 flex-shrink-0" />}
        {children}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="address" className="text-sm sm:text-base">Shop Address / Service Area</Label>
          <Input id="address" value={address || ""} onChange={(e) => onAddressChange(e.target.value)} placeholder="Street, Area, City, State" className="focus:ring-2 focus:ring-blue-500 min-h-[44px] sm:min-h-[42px] text-sm sm:text-base" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pincode" className="text-sm sm:text-base">Pincode</Label>
          <Input id="pincode" type="text" inputMode="numeric" maxLength={6} value={pincode || ""} onChange={(e) => onPincodeChange(e.target.value.replace(/\D/g, ''))} placeholder="e.g., 560001" className="focus:ring-2 focus:ring-blue-500 min-h-[44px] sm:min-h-[42px] text-sm sm:text-base" />
        </div>
      </div>

      <button type="button" onClick={getMyLocation} disabled={isLocating} className="w-full sm:w-full md:w-auto px-6 py-3 sm:py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-400 disabled:to-blue-500 text-white font-medium text-sm sm:text-base rounded-lg flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg active:scale-95">
        {isLocating ? (
          <>
            <Loader2 size={18} className="animate-spin flex-shrink-0" />
            <span>Detecting Location...</span>
          </>
        ) : (
          <>
            <Navigation size={18} className="flex-shrink-0" />
            <span>Get My Current Location</span>
          </>
        )}
      </button>
      <p className="text-xs text-gray-500">This will automatically fill your address and pincode based on your current location</p>

      {locationError && (
        <AlertMessage type={locationError.includes("pincode not available") ? "warning" : "error"}>
          <span>{locationError}</span>
        </AlertMessage>
      )}

      {!locationError && address && !isLocating && pincode && (
        <AlertMessage type="success">
          <div className="flex-1 min-w-0">
            <div className="font-medium">Location detected successfully!</div>
            <div className="text-xs mt-1 break-words">Address: {address}</div>
            <div className="text-xs">Pincode: {pincode}</div>
          </div>
        </AlertMessage>
      )}

      {!locationError && address && !isLocating && !pincode && (
        <AlertMessage type="warning">
          <div className="flex-1 min-w-0">
            <div className="font-medium">Address detected!</div>
            <div className="text-xs mt-1 break-words">Address: {address}</div>
            <div className="text-xs mt-1">⚠️ Pincode not available for this location. Please enter manually.</div>
          </div>
        </AlertMessage>
      )}
    </div>
  );
}

// Availability Selector
type WorkingSchedule = {
  days: string[];
  startTime: string;
  endTime: string;
  is24Hours: boolean;
  isClosed: boolean;
};

function AvailabilitySelector({ value, onChange }: { value?: WorkingSchedule; onChange: (schedule: WorkingSchedule) => void }) {
  const parseAvailability = (val: WorkingSchedule | string | undefined): WorkingSchedule => {
    if (!val || typeof val === 'string') {
      return { days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'], startTime: '09:00', endTime: '18:00', is24Hours: false, isClosed: false };
    }
    return val;
  };

  const availability = parseAvailability(value);
  const [selectedDays, setSelectedDays] = useState<string[]>(availability.days || []);
  const [startTime, setStartTime] = useState<string>(availability.startTime || '09:00');
  const [endTime, setEndTime] = useState<string>(availability.endTime || '18:00');
  const [is24Hours, setIs24Hours] = useState<boolean>(availability.is24Hours || false);
  const [isClosed, setIsClosed] = useState<boolean>(availability.isClosed || false);

  useEffect(() => {
    onChange({ days: selectedDays, startTime, endTime, is24Hours, isClosed });
  }, [selectedDays, startTime, endTime, is24Hours, isClosed]);

  const toggleDay = (day: string) => setSelectedDays((prev: string[]) => prev.includes(day) ? prev.filter((d: string) => d !== day) : [...prev, day]);

  const setPreset = (preset: 'weekdays' | 'weekend' | 'alldays') => {
    const presets: Record<'weekdays' | 'weekend' | 'alldays', string[]> = {
      weekdays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      weekend: ['saturday', 'sunday'],
      alldays: DAYS_OF_WEEK.map(d => d.value)
    };
    setSelectedDays(presets[preset]);
  };

  const generateTimeOptions = () => {
    const options: { value: string; label: string }[] = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 30) {
        const time24 = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
        const period = h >= 12 ? 'PM' : 'AM';
        options.push({ value: time24, label: `${hour12}:${m.toString().padStart(2, '0')} ${period}` });
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  const formatSelectedSchedule = () => {
    if (isClosed) return "Currently Closed";
    if (selectedDays.length === 0) return "No days selected";
  const dayLabels = DAYS_OF_WEEK.filter(d => selectedDays.includes(d.value)).map(d => d.label).join(', ');
    if (is24Hours) return `${dayLabels}: Open 24 Hours`;
    const start = timeOptions.find(t => t.value === startTime)?.label || startTime;
    const end = timeOptions.find(t => t.value === endTime)?.label || endTime;
    return `${dayLabels}: ${start} - ${end}`;
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 border rounded-lg bg-gray-50 dark:bg-gray-800/50">
      <div className="space-y-2">
        <Label className="text-sm font-medium">Quick Presets</Label>
        <div className="flex flex-col sm:flex-row flex-wrap gap-2">
          {(['weekdays', 'weekend', 'alldays'] as const).map(preset => (
            <button key={preset} type="button" onClick={() => setPreset(preset)} className="w-full sm:w-auto px-4 py-2.5 sm:py-2 text-sm bg-white dark:bg-gray-700 border rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-400 transition-colors active:scale-95">
              {preset === 'weekdays' ? 'Weekdays (Mon-Fri)' : preset === 'weekend' ? 'Weekend (Sat-Sun)' : 'All Days'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium">Working Days</Label>
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {DAYS_OF_WEEK.map(day => (
            <button key={day.value} type="button" onClick={() => toggleDay(day.value)} disabled={isClosed} className={`p-2 sm:p-3 text-xs sm:text-sm font-medium rounded-lg transition-all min-h-[44px] sm:min-h-[auto] ${selectedDays.includes(day.value) ? 'bg-blue-600 text-white shadow-md' : 'bg-white dark:bg-gray-700 border hover:border-blue-400'} ${isClosed ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-95'}`}>
              <div className="text-[10px] sm:text-xs md:text-sm leading-tight">{day.label}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {['startTime', 'endTime'].map(type => (
          <div key={type} className="space-y-2">
            <Label htmlFor={type} className="text-sm font-medium">{type === 'startTime' ? 'Opening' : 'Closing'} Time</Label>
            <select id={type} value={type === 'startTime' ? startTime : endTime} onChange={(e) => type === 'startTime' ? setStartTime(e.target.value) : setEndTime(e.target.value)} disabled={is24Hours || isClosed} className="w-full px-3 py-2.5 sm:py-2 text-sm border rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] sm:min-h-[auto]">
              {timeOptions.map(time => <option key={time.value} value={time.value}>{time.label}</option>)}
            </select>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
        <label className="flex items-center gap-2 cursor-pointer min-h-[44px] sm:min-h-[auto]">
          <input type="checkbox" checked={is24Hours} onChange={(e) => { setIs24Hours(e.target.checked); if (e.target.checked) setIsClosed(false); }} className="w-5 h-5 sm:w-4 sm:h-4 text-blue-600 rounded focus:ring-blue-500 flex-shrink-0" />
          <span className="text-sm">Open 24 Hours</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer min-h-[44px] sm:min-h-[auto]">
          <input type="checkbox" checked={isClosed} onChange={(e) => { setIsClosed(e.target.checked); if (e.target.checked) { setIs24Hours(false); setSelectedDays([]); } }} className="w-5 h-5 sm:w-4 sm:h-4 text-blue-600 rounded focus:ring-blue-500 flex-shrink-0" />
          <span className="text-sm">Currently Closed / Not Accepting Orders</span>
        </label>
      </div>

      <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="text-xs font-medium text-blue-800 dark:text-blue-200 mb-1">Schedule Preview:</div>
        <div className="text-xs sm:text-sm text-blue-900 dark:text-blue-100 font-medium break-words">{formatSelectedSchedule()}</div>
      </div>
    </div>
  );
}

export function ProfessionalDetailsStep({ data, onChange }: Props) {
  const [newFabricName, setNewFabricName] = useState<string>("");
  const [newFabricPrice, setNewFabricPrice] = useState<string>("");
  const specializationArray = Array.isArray(data.specialization) ? data.specialization : (data.specialization ? [data.specialization] : []);
  const initialCategory = specializationArray[0] || 'men';
  const [newGarmentCategory, setNewGarmentCategory] = useState<string>(initialCategory);
  const [newGarmentName, setNewGarmentName] = useState<string>("");
  const [newGarmentPrice, setNewGarmentPrice] = useState<string>("");

  const specializationKey = specializationArray.join("|");
  useEffect(() => {
    if (!specializationArray.length) return;
    if (!specializationArray.includes(newGarmentCategory)) {
      setNewGarmentCategory(specializationArray[0]);
    }
  }, [specializationKey, newGarmentCategory, specializationArray]);

  const fallbackCategories = specializationArray.length ? specializationArray : Object.keys(GARMENTS_BY_CATEGORY);
  const customFabricNames: string[] = Array.isArray(data.customFabricNames) ? data.customFabricNames : [];
  const removedFabrics: string[] = Array.isArray(data.removedFabrics) ? data.removedFabrics : [];
  const fabricPrices = data.fabricPrices || {};
  const allFabricNames = Array.from(new Set([
    ...FABRICS_LIST,
    ...customFabricNames,
    ...Object.keys(fabricPrices),
  ])).filter((name) => name && typeof name === 'string');
  const visibleFabricEntries = allFabricNames.filter((name) => !includesCaseInsensitive(removedFabrics, name));

  const stitchingCosts = data.stitchingCosts || {};
  const customGarments = normalizeCategoryMap(data.customGarments, fallbackCategories);
  const removedGarments = normalizeCategoryMap(data.removedGarments, fallbackCategories);

  const handleAddFabric = () => {
    const name = newFabricName.trim();
    const price = newFabricPrice.replace(/[^0-9]/g, "").trim();
    if (!name || !price) return;

    const numericPrice = Number(price);
    if (Number.isNaN(numericPrice)) return;

    const nameLower = name.toLowerCase();
    const updatedPrices = { ...fabricPrices, [name]: numericPrice };

    let updatedCustom = customFabricNames;
    const isDefault = FABRICS_LIST.some((f) => f.toLowerCase() === nameLower);
    if (!isDefault && !includesCaseInsensitive(customFabricNames, name)) {
      updatedCustom = [...customFabricNames, name];
    }

    const updatedRemoved = removeCaseInsensitive(removedFabrics, name);

    const patch: any = { fabricPrices: updatedPrices };
    if (updatedCustom !== customFabricNames) patch.customFabricNames = updatedCustom;
    if (updatedRemoved.length !== removedFabrics.length) patch.removedFabrics = updatedRemoved;
    onChange(patch);
    setNewFabricName("");
    setNewFabricPrice("");
  };

  const handleRemoveFabric = (name: string) => {
    const updatedPrices = { ...fabricPrices };
    delete updatedPrices[name];

    const isDefault = FABRICS_LIST.some((f) => f.toLowerCase() === name.toLowerCase());
    const updatedCustom = isDefault ? customFabricNames : removeCaseInsensitive(customFabricNames, name);
    const updatedRemoved = addUniqueCaseInsensitive(removedFabrics, name);

    const patch: any = { fabricPrices: updatedPrices };
    if (updatedCustom !== customFabricNames) patch.customFabricNames = updatedCustom;
    if (updatedRemoved.length !== removedFabrics.length) patch.removedFabrics = updatedRemoved;
    onChange(patch);
  };

  const handleRestoreFabric = (name: string) => {
    const updatedRemoved = removeCaseInsensitive(removedFabrics, name);
    const isDefault = FABRICS_LIST.some((f) => f.toLowerCase() === name.toLowerCase());

    const patch: any = {};
    if (updatedRemoved.length !== removedFabrics.length) {
      patch.removedFabrics = updatedRemoved;
    }
    if (!isDefault && !includesCaseInsensitive(customFabricNames, name)) {
      patch.customFabricNames = [...customFabricNames, name];
    }
    if (Object.keys(patch).length) {
      onChange(patch);
    }
  };

  const handleAddGarment = () => {
    const category = newGarmentCategory;
    const name = newGarmentName.trim();
    const price = newGarmentPrice.replace(/[^0-9]/g, "").trim();
    if (!name || !price) return;
    if (!specializationArray.includes(category)) return;

    const numericPrice = Number(price);
    if (Number.isNaN(numericPrice)) return;

    const updatedCosts: Record<string, number> = { ...stitchingCosts, [name]: numericPrice };
    const currentCustomList = Array.isArray(customGarments[category]) ? customGarments[category] : [];
    const nameLower = name.toLowerCase();
    const isDefault = (GARMENTS_BY_CATEGORY as any)[category]?.some((g: string) => g.toLowerCase() === nameLower);
    const alreadyCustom = includesCaseInsensitive(currentCustomList, name);

    let updatedCustomGarments = customGarments;
    if (!isDefault && !alreadyCustom) {
      updatedCustomGarments = {
        ...customGarments,
        [category]: [...currentCustomList, name],
      };
    }

    const currentRemoved = Array.isArray(removedGarments[category]) ? removedGarments[category] : [];
    const updatedRemoved = removeCaseInsensitive(currentRemoved, name);

    const patch: any = { stitchingCosts: updatedCosts };
    if (updatedCustomGarments !== customGarments) patch.customGarments = updatedCustomGarments;
    if (updatedRemoved.length !== currentRemoved.length) {
      patch.removedGarments = {
        ...removedGarments,
        [category]: updatedRemoved,
      };
    }
    onChange(patch);
    setNewGarmentName("");
    setNewGarmentPrice("");
  };

  const handleRemoveGarment = (category: string, name: string) => {
    const updatedCosts: Record<string, number> = { ...stitchingCosts };
    delete updatedCosts[name];

    const baseGarments = GARMENTS_BY_CATEGORY[category] || [];
    const isDefault = includesCaseInsensitive(baseGarments, name);

    const currentCustomList = Array.isArray(customGarments[category]) ? customGarments[category] : [];
    const filteredCustomList = isDefault ? currentCustomList : removeCaseInsensitive(currentCustomList, name);
    const customChanged = filteredCustomList.length !== currentCustomList.length;

    const currentRemoved = Array.isArray(removedGarments[category]) ? removedGarments[category] : [];
    const updatedRemoved = addUniqueCaseInsensitive(currentRemoved, name);

    const patch: any = { stitchingCosts: updatedCosts };
    if (customChanged) {
      patch.customGarments = {
        ...customGarments,
        [category]: filteredCustomList,
      };
    }
    if (updatedRemoved.length !== currentRemoved.length) {
      patch.removedGarments = {
        ...removedGarments,
        [category]: updatedRemoved,
      };
    }
    onChange(patch);
  };

  const handleRestoreGarment = (category: string, name: string) => {
    const currentRemoved = Array.isArray(removedGarments[category]) ? removedGarments[category] : [];
    const updatedRemoved = removeCaseInsensitive(currentRemoved, name);

    const baseGarments = GARMENTS_BY_CATEGORY[category] || [];
    const isDefault = includesCaseInsensitive(baseGarments, name);
    const currentCustomList = Array.isArray(customGarments[category]) ? customGarments[category] : [];
    const needsCustomRestore = !isDefault && !includesCaseInsensitive(currentCustomList, name);

    const patch: any = {};
    if (updatedRemoved.length !== currentRemoved.length) {
      patch.removedGarments = {
        ...removedGarments,
        [category]: updatedRemoved,
      };
    }
    if (needsCustomRestore) {
      patch.customGarments = {
        ...customGarments,
        [category]: [...currentCustomList, name],
      };
    }
    if (Object.keys(patch).length) {
      onChange(patch);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 px-4 sm:px-0">
      <div>
        <h3 className="text-base sm:text-lg font-semibold mb-1">Professional Details</h3>
        <p className="text-xs sm:text-sm text-gray-500">Tell us about your expertise and services</p>
      </div>

      <div className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-2">
            <Label htmlFor="experience" className="flex items-center gap-2 text-sm sm:text-base">
              <Briefcase size={16} className="text-gray-500 flex-shrink-0" />
              <span>Years of Experience</span>
            </Label>
            <Input id="experience" type="number" inputMode="numeric" min="0" max="50" value={data.experience || ""} onChange={(e) => onChange({ experience: e.target.value })} placeholder="e.g., 5" className="focus:ring-2 focus:ring-blue-500 min-h-[44px] sm:min-h-[42px] text-sm sm:text-base" />
            <p className="text-xs text-gray-500 mt-1">How many years have you been tailoring?</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialization" className="flex items-center gap-2 text-sm sm:text-base">
              <Briefcase size={16} className="text-gray-500 flex-shrink-0" />
              <span>Specialization</span>
            </Label>
            <MultiSelectDropdown options={SPECIALIZATION_OPTIONS} selectedValues={Array.isArray(data.specialization) ? data.specialization : (data.specialization ? [data.specialization] : [])} onChange={(selected) => onChange({ specialization: selected })} placeholder="Select your specializations..." />
            <p className="text-xs text-gray-500 mt-1">Select all types of garments you specialize in</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="skills" className="flex items-center gap-2 text-sm sm:text-base">Skills & Expertise</Label>
          <SkillsInput value={data.skills || ""} onChange={(skills) => onChange({ skills })} />
          <p className="text-xs text-gray-500 mt-1">Add your key skills to help customers find you</p>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm sm:text-base">
            <Briefcase size={16} className="text-gray-500 flex-shrink-0" />
            <span>Do you also provide fabric?</span>
          </Label>

          <div role="radiogroup" aria-label="Provide fabric" className="inline-flex rounded-lg overflow-hidden border bg-transparent">
            {[{ val: true, label: 'Yes' }, { val: false, label: 'No' }].map((opt, idx) => {
              const selected = data.fabricProvided === opt.val;
              return (
                <label
                  key={String(opt.val)}
                  aria-checked={selected}
                  role="radio"
                  className={`flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2 text-sm font-medium transition-colors cursor-pointer select-none ${selected ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200'} ${idx === 0 ? 'border-r' : ''}`}
                >
                  <input
                    type="radio"
                    name="fabricProvided"
                    value={String(opt.val)}
                    checked={selected}
                    onChange={() => onChange({ fabricProvided: opt.val })}
                    className="sr-only"
                  />
                  {selected && <Check size={16} className="flex-shrink-0" />}
                  <span>{opt.label}</span>
                </label>
              );
            })}
          </div>

          <p className="text-xs text-gray-500 mt-1">Choose whether you supply fabric for orders</p>
        </div>

        {data.fabricProvided === true && (
          <div className="space-y-3">
            <Label className="text-sm sm:text-base">Set prices for fabrics you supply</Label>
            <p className="text-xs text-gray-500">Enter the price per meter you will charge for each fabric. These are set by you and will be shown to customers.</p>

            <div className="flex flex-col sm:flex-row gap-3 items-end">
              <div className="flex-1">
                <Label className="text-xs font-medium text-gray-500">Fabric name</Label>
                <Input
                  value={newFabricName}
                  onChange={(e) => setNewFabricName(e.target.value)}
                  placeholder="e.g., Organic Cotton"
                  className="text-sm"
                />
              </div>
              <div className="w-full sm:w-40">
                <Label className="text-xs font-medium text-gray-500">Price / meter</Label>
                <Input
                  value={newFabricPrice}
                  inputMode="numeric"
                  onChange={(e) => setNewFabricPrice(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="₹"
                  className="text-sm"
                />
              </div>
              <button
                type="button"
                onClick={handleAddFabric}
                className="w-full sm:w-auto px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                Add Fabric
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-auto p-2 border rounded-lg bg-white dark:bg-gray-800">
              {visibleFabricEntries.map((fabric) => {
                const priceValue = fabricPrices[fabric] !== undefined ? String(fabricPrices[fabric]) : '';
                return (
                  <div key={fabric} className="flex items-center gap-3 p-2 rounded-md bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{fabric}</div>
                    </div>
                    <div className="w-36 flex items-center gap-2">
                      <Input
                        type="text"
                        inputMode="numeric"
                        pattern="\d*"
                        value={priceValue}
                        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                          // block + - e E . characters which are allowed in number inputs in some browsers
                          if (['+', '-', 'e', 'E', '.'].includes(String(e.key))) e.preventDefault();
                        }}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          const next = { ...fabricPrices };
                          if (val === '') {
                            delete next[fabric];
                          } else {
                            next[fabric] = Number(val);
                          }
                          onChange({ fabricPrices: next });
                        }}
                        placeholder="Price / m"
                        className="text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveFabric(fabric)}
                        className="p-2 text-gray-400 hover:text-red-500"
                        aria-label={`Remove ${fabric}`}
                        title="Hide this fabric from your offerings"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            {removedFabrics.length > 0 && (
              <div className="rounded-lg border border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Removed fabrics</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {removedFabrics.map((fabric) => (
                    <span key={fabric} className="inline-flex items-center gap-2 rounded-full bg-white dark:bg-gray-800 px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-200 shadow-sm">
                      {fabric}
                      <button
                        type="button"
                        onClick={() => handleRestoreFabric(fabric)}
                        className="text-blue-600 hover:text-blue-500 dark:text-blue-300"
                      >
                        Restore
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Stitching costs editor based on specialization */}
        {Array.isArray(data.specialization) && data.specialization.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm sm:text-base">Set stitching cost for selected garment types</Label>
            <p className="text-xs text-gray-500">Only garments from your selected specializations are shown. Enter the stitching cost you charge for each garment.</p>

            <div className="flex flex-col md:flex-row gap-3 items-end">
              <div className="w-full md:w-40">
                <Label className="text-xs font-medium text-gray-500">Specialization</Label>
                <select
                  value={newGarmentCategory}
                  onChange={(e) => setNewGarmentCategory(e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-800"
                >
                  {specializationArray.map((spec: string) => (
                    <option key={spec} value={spec}>{spec === 'men' ? 'Men' : spec === 'women' ? 'Women' : spec}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <Label className="text-xs font-medium text-gray-500">Garment name</Label>
                <Input
                  value={newGarmentName}
                  onChange={(e) => setNewGarmentName(e.target.value)}
                  placeholder="e.g., Indo-Western Suit"
                  className="text-sm"
                />
              </div>
              <div className="w-full md:w-40">
                <Label className="text-xs font-medium text-gray-500">Stitching price</Label>
                <Input
                  value={newGarmentPrice}
                  inputMode="numeric"
                  onChange={(e) => setNewGarmentPrice(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="₹"
                  className="text-sm"
                />
              </div>
              <button
                type="button"
                onClick={handleAddGarment}
                className="w-full md:w-auto px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                Add Garment
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {(['men','women'] as const).map(cat => {
                if (!specializationArray.includes(cat)) return null;
                const baseGarments = GARMENTS_BY_CATEGORY[cat] || [];
                const extraGarments = Array.isArray(customGarments[cat]) ? customGarments[cat] : [];
                const removedForCategory = Array.isArray(removedGarments[cat]) ? removedGarments[cat] : [];
                const garmentList = Array.from(new Set([
                  ...baseGarments,
                  ...extraGarments,
                ])).filter((item) => !includesCaseInsensitive(removedForCategory, item));
                const sectionLabel = cat === 'men' ? 'Men garments' : cat === 'women' ? 'Women garments' : `${cat} garments`;

                return (
                  <div key={cat} className="space-y-2">
                    <div className="text-sm font-medium capitalize">{sectionLabel}</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-2 border rounded-lg bg-white dark:bg-gray-800 max-h-72 overflow-auto">
                      {garmentList.map((g) => {
                        const val = stitchingCosts[g] !== undefined ? String(stitchingCosts[g]) : '';
                        return (
                          <div key={g} className="flex items-center gap-3 p-2 rounded-md bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700">
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">{g}</div>
                            </div>
                            <div className="w-36 flex items-center gap-2">
                              <Input
                                type="text"
                                inputMode="numeric"
                                pattern="\d*"
                                value={val}
                                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                  if (['+', '-', 'e', 'E', '.'].includes(String(e.key))) e.preventDefault();
                                }}
                                onChange={(e) => {
                                  const v = e.target.value.replace(/[^0-9]/g, '');
                                  const next = { ...stitchingCosts };
                                  if (v === '') delete next[g]; else next[g] = Number(v);
                                  onChange({ stitchingCosts: next });
                                }}
                                placeholder="Stitching ₹"
                                className="text-sm"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveGarment(cat, g)}
                                className="p-2 text-gray-400 hover:text-red-500"
                                aria-label={`Remove ${g}`}
                                title="Hide this garment type"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                      {garmentList.length === 0 && (
                        <div className="col-span-full rounded-md border border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 p-4 text-sm text-gray-500 dark:text-gray-300">
                          No garments currently listed for this specialization.
                        </div>
                      )}
                    </div>
                    {removedForCategory.length > 0 && (
                      <div className="rounded-lg border border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-3">
                        <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Removed {sectionLabel.toLowerCase()}</div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {removedForCategory.map((item) => (
                            <span key={item} className="inline-flex items-center gap-2 rounded-full bg-white dark:bg-gray-800 px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-200 shadow-sm">
                              {item}
                              <button
                                type="button"
                                onClick={() => handleRestoreGarment(cat, item)}
                                className="text-blue-600 hover:text-blue-500 dark:text-blue-300"
                              >
                                Restore
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        
      </div>

      <div className="space-y-4 sm:space-y-6 pt-4 sm:pt-6 border-t">
        <h4 className="font-medium flex items-center gap-2 text-sm sm:text-base">
          <MapPin size={18} className="text-gray-500 flex-shrink-0" />
          Location & Service Area
        </h4>
  <LocationPicker address={data.address} pincode={data.pincode} onAddressChange={(address: string) => onChange({ address })} onPincodeChange={(pincode: string) => onChange({ pincode })} />
      </div>

      <div className="space-y-4 pt-4 sm:pt-6 border-t">
        <div>
          <h4 className="font-medium flex items-center gap-2 mb-1 text-sm sm:text-base">
            <Clock size={18} className="text-gray-500 flex-shrink-0" />
            Working Hours & Availability
          </h4>
          <p className="text-xs sm:text-sm text-gray-500">Set your working schedule to let customers know when you're available</p>
        </div>
  <AvailabilitySelector value={data.workingHours} onChange={(schedule: WorkingSchedule) => onChange({ workingHours: schedule })} />
      </div>
    </div>
  );
}
