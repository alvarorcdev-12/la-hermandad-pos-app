export class Formatter {
  static currency(amount: string | number): string {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB',
      minimumFractionDigits: 2,
    }).format(+amount);
  }

  static dateTime(value: Date): string {
    const date = new Date(value);
    return new Intl.DateTimeFormat('es-BO', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date);
  }

  static date(value: Date): string {
    const date = new Date(value);
    return new Intl.DateTimeFormat('es-BO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  }
}
