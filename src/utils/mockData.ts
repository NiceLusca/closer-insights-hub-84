
import type { Lead } from "@/types/lead";

const nomes = [
  "Ana Silva", "Bruno Santos", "Carla Oliveira", "Diego Ferreira", "Elena Costa",
  "Felipe Lima", "Gabriela Souza", "Henrique Alves", "Isabela Rocha", "João Pereira",
  "Karen Martins", "Lucas Barbosa", "Mariana Torres", "Nicolas Ribeiro", "Olivia Nascimento",
  "Pedro Cardoso", "Queila Monteiro", "Rafael Gomes", "Sofia Araújo", "Thiago Mendes"
];

const emails = nomes.map(nome => 
  `${nome.toLowerCase().replace(' ', '.')}@email.com`
);

const origens = [
  "Google Ads", "Facebook Ads", "Instagram Ads", "YouTube Ads", "LinkedIn Ads",
  "Organic Search", "Email Marketing", "WhatsApp", "Indicação", "TikTok Ads"
];

const closers = [
  "Amanda Rodrigues", "Carlos Mendes", "Diana Silva", "Eduardo Santos", 
  "Fernanda Lima", "Gabriel Costa", "Helena Oliveira", "Igor Pereira"
];

const status = [
  "Agendado", "Não Apareceu", "Desmarcou", "Fechou", 
  "Mentorado", "Remarcou", "Confirmado", "Aguardando resposta"
];

function getRandomDate(days: number): Date {
  const today = new Date();
  const randomDays = Math.floor(Math.random() * days);
  const date = new Date(today);
  date.setDate(date.getDate() - randomDays);
  return date;
}

function formatDate(date: Date): string {
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", 
                  "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  return `${date.getDate().toString().padStart(2, '0')} ${months[date.getMonth()]}.`;
}

function formatHour(date: Date): string {
  return `${date.getHours().toString().padStart(2, '0')}h`;
}

function generatePhone(): string {
  return `(${Math.floor(Math.random() * 90) + 10}) 9${Math.floor(Math.random() * 90000000) + 10000000}`;
}

function generateVendaCompleta(status: string): number {
  if (status === "Fechou") {
    return Math.floor(Math.random() * 15000) + 5000; // R$ 5.000 - R$ 20.000
  }
  return 0;
}

function generateRecorrente(vendaCompleta: number): number | string {
  if (vendaCompleta > 0 && Math.random() > 0.7) {
    return Math.floor(vendaCompleta * 0.1); // 10% do valor como recorrente
  }
  return "";
}

export function generateMockData(count: number): Lead[] {
  const leads: Lead[] = [];
  
  for (let i = 1; i <= count; i++) {
    const date = getRandomDate(90); // últimos 90 dias
    const randomStatus = status[Math.floor(Math.random() * status.length)];
    const vendaCompleta = generateVendaCompleta(randomStatus);
    
    const lead: Lead = {
      row_number: i,
      data: formatDate(date),
      Hora: formatHour(date),
      Nome: nomes[Math.floor(Math.random() * nomes.length)],
      'e-mail': emails[Math.floor(Math.random() * emails.length)],
      Whatsapp: generatePhone(),
      origem: origens[Math.floor(Math.random() * origens.length)],
      Status: randomStatus as Lead['Status'],
      Closer: closers[Math.floor(Math.random() * closers.length)],
      'Venda Completa': vendaCompleta,
      recorrente: generateRecorrente(vendaCompleta),
      'Coluna 1': Math.random() > 0.8 ? "Observação especial" : "",
      parsedDate: date
    };
    
    leads.push(lead);
  }
  
  return leads.sort((a, b) => (b.parsedDate?.getTime() || 0) - (a.parsedDate?.getTime() || 0));
}
