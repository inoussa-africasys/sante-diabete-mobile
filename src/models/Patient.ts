import { BaseModel } from "./BaseModel";

export default class Patient implements BaseModel {
    id: number | null;
    id_patient: string;
    first_name: string;
    last_name: string;
    date: string;
    photo: string;
    user_id: string;
    status: string;
    created_at: string;
    updated_at: string;
    last_synced_at: string;
    synced: number;
  
    constructor(id_patient: string, first_name: string, last_name: string, date: string, photo: string, user_id: string, status: string, created_at: string, updated_at: string, last_synced_at: string, synced: number, id: number | null = null) {
      this.id = id;
      this.id_patient = id_patient;
      this.first_name = first_name;
      this.last_name = last_name;
      this.date = date;
      this.photo = photo;
      this.user_id = user_id;
      this.status = status;
      this.created_at = created_at;
      this.updated_at = updated_at;
      this.last_synced_at = last_synced_at;
      this.synced = synced;
    }
  
    toDB(): any[] {
      return [
        this.id,
        this.id_patient,
        this.first_name,
        this.last_name,
        this.date,
        this.photo,
        this.user_id,
        this.status,
        this.created_at,
        this.updated_at,
        this.last_synced_at,
        this.synced,
      ];
    }

    static columns(): string[] {
      return [
        'id',
        'id_patient',
        'first_name',
        'last_name',
        'date',
        'photo',
        'user_id',
        'status',
        'created_at',
        'updated_at',
        'last_synced_at',
        'synced',
      ];
    }
  
    static fromRow(row: any): Patient {
      return new Patient(row.id_patient, row.first_name, row.last_name, row.date, row.photo, row.user_id, row.status, row.created_at, row.updated_at, row.last_synced_at, row.synced, row.id);
    }
  }
  