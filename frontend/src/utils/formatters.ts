/**
 * Formata um valor numérico para a moeda fictícia do estudo de caso (ex: 1.744,14 ou 40,00)
 */
export const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '-';

  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Formata variação de caixa sempre exibindo o sinal explícito (+ ou -) (ex: +35,70 ou -45,55)
 */
export const formatCashChange = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '-';

  const formattedValue = formatCurrency(Math.abs(value));
  if (value > 0) return `+${formattedValue}`;
  if (value < 0) return `-${formattedValue}`;
  return `0,00`;
};

/**
 * Formata uma string de data/hora ISO para o padrão exibido nas telas (ex: 07/11/2026 10:30)
 * ajustado para o horário de Brasília (-03:00).
 */
export const formatDateTime = (
  isoString: string | null | undefined
): string => {
  if (!isoString) return '-';

  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Sao_Paulo',
    }).format(date);
  } catch {
    return isoString;
  }
};

/**
 * Gera a string de data/hora no formato exigido pela RN01 ao enviar para a API: AAAA-MM-DDTHH:MM-03:00
 */
export const formatDateToISOWithTimezone = (date: Date): string => {
  const pad = (n: number) => String(n).padStart(2, '0');

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}-03:00`;
};
