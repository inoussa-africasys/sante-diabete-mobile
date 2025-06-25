import { Consultation } from '../models/Consultation';
import { GenericRepository } from './GenericRepository';

export class ConsultationRepository extends GenericRepository<Consultation> {
  constructor() {
    super('consultations', (data) => new Consultation(data));
  }


    public getAllConsultationByPatientIdOnLocalDB(patientId: string): Consultation[] {
      const result = this.db.getAllSync(`SELECT * FROM ${this.tableName} WHERE id_patient = ?`, [patientId]);
      return result.map((item) => this.modelFactory(item));
    }


    public getAllConsultationOnLocalDBGroupedByDate(patientId: string,type_diabete: string): Record<string, Consultation[]> {
      const rows = this.db.getAllSync(
        `SELECT * FROM consultations WHERE id_patient = ? AND type_diabete = ? ORDER BY createdAt ASC`,
        [patientId,type_diabete]
      );
    
      const grouped: Record<string, Consultation[]> = {};
    
      for (const row of rows) {
        const date = row.createdAt?.split('T')[0] || 'inconnue';
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(this.modelFactory(row));
      }
    
      return grouped;
    }




}
