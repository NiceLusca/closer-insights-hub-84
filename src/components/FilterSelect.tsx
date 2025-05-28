
import React from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
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

  // Validação e filtragem de opções
  const validOptions = React.useMemo(() => {
    if (isLoading || !Array.isArray(options)) {
      return [];
    }
    
    // Filtrar opções válidas, remover duplicatas e ordenar
    const filtered = options
      .filter(option => 
        option !== null && 
        option !== undefined && 
        typeof option === 'string' && 
        option.trim() !== ''
      )
      .map(option => option.trim())
      .filter((option, index, arr) => arr.indexOf(option) === index) // Remove duplicatas
      .sort();
    
    console.log(`FilterSelect ${label} - Opções válidas:`, filtered);
    return filtered;
  }, [options, isLoading, label]);

  const validSelectedValues = React.useMemo(() => {
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
    
    const trimmedValue = value.trim();
    const newValues = validSelectedValues.includes(trimmedValue)
      ? validSelectedValues.filter(v => v !== trimmedValue)
      : [...validSelectedValues, trimmedValue];
    
    onChange(newValues);
  };

  // Mostrar botão desabilitado se não houver opções válidas
  if (isLoading || validOptions.length === 0) {
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
            <CommandList>
              <CommandGroup>
                {validOptions.map((option) => (
                  <CommandItem
                    key={option}
                    value={option}
                    onSelect={() => handleSelect(option)}
                    className="cursor-pointer"
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
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
