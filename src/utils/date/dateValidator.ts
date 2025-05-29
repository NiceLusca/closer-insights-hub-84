
export function isValidDate(date: Date): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}

export function isValidYear(year: number): boolean {
  return year >= 2020 && year <= 2030;
}

export function validateParsedDate(date: Date): boolean {
  return isValidDate(date) && isValidYear(date.getFullYear());
}
