
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
}

export function FilterSelect({
  label,
  options,
  selectedValues,
  onChange,
  placeholder = "Selecione..."
}: FilterSelectProps) {
  const [open, setOpen] = React.useState(false);

  // Garantir que sempre temos arrays válidos, mesmo se props chegarem como undefined/null
  const safeOptions = React.useMemo(() => {
    if (!options || !Array.isArray(options)) {
      console.log(`FilterSelect ${label}: options inválidas, usando array vazio`, options);
      return [];
    }
    return options.filter(option => option && typeof option === 'string' && option.trim() !== '');
  }, [options, label]);

  const safeSelectedValues = React.useMemo(() => {
    if (!selectedValues || !Array.isArray(selectedValues)) {
      console.log(`FilterSelect ${label}: selectedValues inválidos, usando array vazio`, selectedValues);
      return [];
    }
    return selectedValues.filter(value => value && typeof value === 'string');
  }, [selectedValues, label]);

  const handleSelect = (value: string) => {
    if (!value || typeof value !== 'string') return;
    
    if (safeSelectedValues.includes(value)) {
      onChange(safeSelectedValues.filter(v => v !== value));
    } else {
      onChange([...safeSelectedValues, value]);
    }
  };

  // Se não há opções válidas, não renderizar o componente
  if (safeOptions.length === 0) {
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
          {placeholder}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </div>
    );
  }

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
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder={`Buscar ${label.toLowerCase()}...`} />
            <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
            <CommandGroup>
              {safeOptions.map((option) => (
                <CommandItem
                  key={option}
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
