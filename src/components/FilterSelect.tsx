
import React from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface FilterSelectProps {
  label: string;
  options: string[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  isLoading?: boolean;
}

export function FilterSelect({
  label,
  options,
  selectedValues,
  onChange,
  placeholder = "Selecione...",
  isLoading = false
}: FilterSelectProps) {
  const [open, setOpen] = React.useState(false);

  // Ultra safe validation - never allow Command to render with bad data
  const safeOptions = React.useMemo(() => {
    // Always return empty array if loading or invalid data
    if (isLoading || !Array.isArray(options)) {
      return [];
    }
    
    // Filter out any invalid entries
    const filtered = options.filter(option => 
      option !== null && 
      option !== undefined && 
      typeof option === 'string' && 
      option.trim() !== ''
    );
    
    return filtered;
  }, [options, isLoading]);

  const safeSelectedValues = React.useMemo(() => {
    if (!Array.isArray(selectedValues)) return [];
    
    return selectedValues.filter(value => 
      value !== null && 
      value !== undefined && 
      typeof value === 'string' && 
      value.trim() !== ''
    );
  }, [selectedValues]);

  const handleSelect = (value: string) => {
    if (!value || typeof value !== 'string') return;
    
    const newValues = safeSelectedValues.includes(value)
      ? safeSelectedValues.filter(v => v !== value)
      : [...safeSelectedValues, value];
    
    onChange(newValues);
  };

  // NEVER render Command component unless we have 100% valid data
  const canRenderCommand = !isLoading && 
                          Array.isArray(safeOptions) && 
                          safeOptions.length > 0 &&
                          safeOptions.every(opt => typeof opt === 'string' && opt.trim() !== '');

  // Always show disabled button if can't render Command
  if (!canRenderCommand) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
        <Button
          variant="outline"
          disabled
          className="w-full justify-between opacity-50"
        >
          {isLoading ? "Carregando..." : "Nenhuma opção disponível"}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </div>
    );
  }

  // Only render full component when data is completely safe
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {safeSelectedValues.length > 0
              ? `${safeSelectedValues.length} selecionado(s)`
              : placeholder}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0 bg-white shadow-lg border z-50">
          <Command>
            <CommandInput placeholder={`Buscar ${label.toLowerCase()}...`} />
            <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
            <CommandGroup>
              {safeOptions.map((option) => (
                <CommandItem
                  key={option}
                  value={option}
                  onSelect={() => handleSelect(option)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      safeSelectedValues.includes(option) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
