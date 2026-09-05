/**
 * Máscaras e formatações de inputs
 */

/**
 * Formata um número de telefone brasileiro no formato (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
 */
export const maskPhone = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) {
    return digits;
  }
  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

/**
 * Formata uma hora no formato HH:MM
 */
export const maskTime = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) {
    return digits;
  }
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
};

/**
 * Valida se uma hora no formato HH:MM é válida (00:00 até 23:59)
 */
export const isValidTime = (time: string): boolean => {
  if (!time) return true;
  const parts = time.split(':');
  if (parts.length !== 2) return false;
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
};
