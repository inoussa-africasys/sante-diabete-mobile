import { BaseModel } from "./BaseModel";

export default class Config implements BaseModel {
    id: number | null;
    name: string;
    value: string;
  
    constructor(name: string, value: string, id: number | null = null) {
      this.id = id;
      this.name = name;
      this.value = value;
    }
  
    toDB(): any[] {
      return [
        this.id,
        this.name,
        this.value,
      ];
    }

    static columns(): string[] {
      return [
        'name',
        'value',
      ];
    }
  
    static fromRow(row: any): Config {
      return new Config(row.name, row.value, row.id);
    }
  }
  