
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

  // Validação rigorosa - garantir que NUNCA passemos dados inválidos
  const safeOptions = React.useMemo(() => {
    // Se está carregando, retorna array vazio
    if (isLoading) return [];
    
    // Se options não é array válido, retorna array vazio
    if (!Array.isArray(options)) return [];
    
    // Filtrar apenas strings válidas e não vazias
    const filtered = options.filter(option => 
      option !== null && 
      option !== undefined && 
      typeof option === 'string' && 
      option.trim() !== ''
    );
    
    console.log(`FilterSelect ${label} - opções filtradas:`, filtered.length);
    return filtered;
  }, [options, isLoading, label]);

  const safeSelectedValues = React.useMemo(() => {
    if (!Array.isArray(selectedValues)) return [];
    
    const filtered = selectedValues.filter(value => 
      value !== null && 
      value !== undefined && 
      typeof value === 'string' && 
      value.trim() !== ''
    );
    
    return filtered;
  }, [selectedValues]);

  const handleSelect = (value: string) => {
    // Extra verificação de segurança
    if (!value || typeof value !== 'string') {
      console.warn('FilterSelect: valor inválido selecionado:', value);
      return;
    }
    
    const newValues = safeSelectedValues.includes(value)
      ? safeSelectedValues.filter(v => v !== value)
      : [...safeSelectedValues, value];
    
    onChange(newValues);
  };

  // Condições para renderizar o popover funcional
  const hasValidData = safeOptions.length > 0;
  const isReady = !isLoading && hasValidData;

  console.log(`FilterSelect ${label} - Estado:`, { 
    isLoading, 
    hasValidData, 
    isReady, 
    optionsLength: safeOptions.length 
  });

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      
      {!isReady ? (
        <Button
          variant="outline"
          disabled
          className="w-full justify-between opacity-50"
        >
          {isLoading ? "Carregando..." : "Nenhuma opção disponível"}
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
      )}
    </div>
  );
}
