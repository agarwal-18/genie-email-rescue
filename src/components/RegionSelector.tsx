
import { useEffect, useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import axios from 'axios';
import { API_CONFIG } from '@/config';

interface RegionSelectorProps {
  value?: string;
  onChange?: (value: string) => void;
  showAllOption?: boolean;
  buttonClassName?: string;
}

const RegionSelector = ({ 
  value, 
  onChange, 
  showAllOption = true,
  buttonClassName
}: RegionSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [regions, setRegions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_CONFIG.baseURL}/api/regions`);
        if (response.data && response.data.regions) {
          setRegions(response.data.regions);
        }
      } catch (error) {
        console.error("Error fetching regions:", error);
        // Fallback to default regions if API call fails
        setRegions([
          "Navi Mumbai", 
          "Mumbai", 
          "Western Ghats", 
          "Konkan Coast",
          "Aurangabad", 
          "Vidarbha", 
          "Western Maharashtra"
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRegions();
  }, []);
  
  const handleSelect = (currentValue: string) => {
    // If the value is "All Regions", send an empty string to clear the selection
    const newValue = currentValue === "All Regions" ? "" : currentValue;
    onChange?.(newValue === value ? "" : newValue);
    setOpen(false);
  };
  
  const displayValue = value || (showAllOption ? "All Regions" : "Select Region");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", buttonClassName)}
          disabled={loading}
        >
          {loading ? "Loading regions..." : displayValue}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search regions..." />
          <CommandEmpty>No region found.</CommandEmpty>
          <CommandGroup>
            {showAllOption && (
              <CommandItem
                value="All Regions"
                onSelect={() => handleSelect("All Regions")}
                className="cursor-pointer"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    !value ? "opacity-100" : "opacity-0"
                  )}
                />
                All Regions
              </CommandItem>
            )}
            
            {regions.map((region) => (
              <CommandItem
                key={region}
                value={region}
                onSelect={() => handleSelect(region)}
                className="cursor-pointer"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === region ? "opacity-100" : "opacity-0"
                  )}
                />
                {region}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default RegionSelector;
