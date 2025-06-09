export interface BaseModel {
    id: number | null;
    toDB(): any[];
}
  