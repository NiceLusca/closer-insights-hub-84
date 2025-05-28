
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
  icon?: React.ReactNode;
}

export function FilterSelect({
  label,
  options,
  selectedValues,
  onChange,
  placeholder = "Selecione...",
  isLoading = false,
  icon
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
        <label className="flex items-center space-x-2 text-sm font-medium text-gray-300 mb-2">
          {icon && <span className="text-gray-400">{icon}</span>}
          <span>{label}</span>
        </label>
        <Button
          variant="outline"
          disabled
          className="w-full justify-between opacity-50 bg-gray-800/30 border-gray-600 text-gray-400"
        >
          {isLoading ? "Carregando..." : "Nenhuma opção disponível"}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </div>
    );
  }

  return (
    <div>
      <label className="flex items-center space-x-2 text-sm font-medium text-gray-300 mb-2">
        {icon && <span className="text-gray-400">{icon}</span>}
        <span>{label}</span>
      </label>
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-gray-800/50 border-gray-600 text-gray-200 hover:bg-gray-700/50 hover:text-white transition-all duration-200"
          >
            {validSelectedValues.length > 0
              ? `${validSelectedValues.length} selecionado(s)`
              : placeholder}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0 bg-gray-800 border-gray-600 shadow-xl z-50">
          <Command className="bg-gray-800">
            <CommandInput 
              placeholder={`Buscar ${label.toLowerCase()}...`} 
              className="text-gray-200 placeholder:text-gray-400"
            />
            <CommandEmpty className="text-gray-400">Nenhum resultado encontrado.</CommandEmpty>
            <CommandList>
              <CommandGroup>
                {validOptions.map((option) => (
                  <CommandItem
                    key={option}
                    value={option}
                    onSelect={() => handleSelect(option)}
                    className="cursor-pointer text-gray-200 hover:bg-gray-700 focus:bg-gray-700"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        validSelectedValues.includes(option) ? "opacity-100 text-green-400" : "opacity-0"
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
