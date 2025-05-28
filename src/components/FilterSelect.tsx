
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

  // VALIDAÇÃO ULTRA RIGOROSA - não renderizar Command até ter certeza de dados válidos
  const safeOptions = React.useMemo(() => {
    console.log(`FilterSelect ${label} - Validando opções:`, { 
      isLoading,
      optionsIsArray: Array.isArray(options),
      optionsLength: options?.length || 0,
      options: options?.slice(0, 3) // Mostrar apenas primeiras 3 para debug
    });
    
    // Nunca retornar nada durante carregamento
    if (isLoading) {
      console.log(`FilterSelect ${label} - Retornando vazio (carregando)`);
      return [];
    }
    
    // Verificação rigorosa do array
    if (!Array.isArray(options)) {
      console.log(`FilterSelect ${label} - Retornando vazio (não é array)`);
      return [];
    }
    
    // Filtrar com validação extra
    const filtered = options.filter(option => {
      const isValid = option !== null && 
                     option !== undefined && 
                     typeof option === 'string' && 
                     option.trim() !== '';
      return isValid;
    });
    
    console.log(`FilterSelect ${label} - Opções válidas:`, filtered.length);
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
    if (!value || typeof value !== 'string') {
      console.warn('FilterSelect: valor inválido selecionado:', value);
      return;
    }
    
    const newValues = safeSelectedValues.includes(value)
      ? safeSelectedValues.filter(v => v !== value)
      : [...safeSelectedValues, value];
    
    onChange(newValues);
  };

  // CONDIÇÕES ULTRA RIGOROSAS para renderizar o Command
  const hasValidOptions = safeOptions.length > 0;
  const canRenderCommand = !isLoading && hasValidOptions;

  console.log(`FilterSelect ${label} - Estado de renderização:`, { 
    isLoading, 
    hasValidOptions, 
    canRenderCommand,
    optionsCount: safeOptions.length
  });

  // Se não pode renderizar Command, mostrar apenas botão desabilitado
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

  // Renderizar componente completo apenas quando dados estão 100% prontos
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
