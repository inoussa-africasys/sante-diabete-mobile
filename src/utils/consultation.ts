export function generateConsultationName(date: Date = new Date()): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
  
    const day = pad(date.getDate());
    const month = pad(date.getMonth() + 1);
    const year = date.getFullYear();
  
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
  
    return `consultation_${day}-${month}-${year}_${hours}h${minutes}min`;
  }
  