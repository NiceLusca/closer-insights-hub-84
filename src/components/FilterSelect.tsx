
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

  // Validação simples e direta
  const validOptions = React.useMemo(() => {
    if (!Array.isArray(options)) return [];
    return options.filter(option => 
      option && 
      typeof option === 'string' && 
      option.trim() !== ''
    );
  }, [options]);

  const validSelectedValues = React.useMemo(() => {
    if (!Array.isArray(selectedValues)) return [];
    return selectedValues.filter(value => 
      value && 
      typeof value === 'string' && 
      value.trim() !== ''
    );
  }, [selectedValues]);

  const handleSelect = (value: string) => {
    if (!value || typeof value !== 'string') return;
    
    const newValues = validSelectedValues.includes(value)
      ? validSelectedValues.filter(v => v !== value)
      : [...validSelectedValues, value];
    
    onChange(newValues);
  };

  const isDisabled = isLoading || validOptions.length === 0;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      
      {isDisabled ? (
        <Button
          variant="outline"
          disabled
          className="w-full justify-between opacity-50"
        >
          {isLoading ? "Carregando..." : placeholder}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      ) : (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
            >
              {validSelectedValues.length > 0
                ? `${validSelectedValues.length} selecionado(s)`
                : placeholder}
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0 bg-white shadow-lg border z-50">
            <Command>
              <CommandInput placeholder={`Buscar ${label.toLowerCase()}...`} />
              <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
              <CommandGroup>
                {validOptions.map((option) => (
                  <CommandItem
                    key={option}
                    value={option}
                    onSelect={() => handleSelect(option)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        validSelectedValues.includes(option) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
