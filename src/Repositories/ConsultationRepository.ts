import { Consultation } from '../models/Consultation';
import Logger from '../utils/Logger';
import { GenericRepository } from './GenericRepository';

export class ConsultationRepository extends GenericRepository<Consultation> {
  constructor() {
    super('consultations', (data) => new Consultation(data), false);
  }


    public getAllConsultationByPatientIdOnLocalDB(patientId: string): Consultation[] {
      try {
        const result = this.db.getAllSync(`SELECT * FROM ${this.tableName} WHERE id_patient = ?`, [patientId]);
        return result.map((item) => this.modelFactory(item));
      } catch (error) {
        console.error('Error fetching consultations by patient id:', error);
        Logger.log('error', 'Error fetching consultations by patient id', { error });
        return [];
      }
    }


    public getAllConsultationOnLocalDBGroupedByDate(patientId: string,type_diabete: string): Record<string, Consultation[]> {
      try {
        const rows = this.db.getAllSync(
          `SELECT * FROM consultations WHERE id_patient = ? AND type_diabete = ? AND deletedAt IS NULL ORDER BY createdAt ASC`,
          [patientId,type_diabete]
        );
      
        const grouped: Record<string, Consultation[]> = {};
    
      for (const row of rows) {
        const date = row.createdAt?.split('T')[0] || 'inconnue';
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(this.modelFactory(row));
      }
    
      return grouped;
    } catch (error) {
      console.error('Error fetching consultations grouped by date:', error);
      Logger.log('error', 'Error fetching consultations grouped by date', { error });
      return {};
    }
  }




}
