export abstract class BaseModel {
    id?: number;
    createdAt?: string;
    updatedAt?: string;

    
  public toJson(): Record<string, any> {
    const json: Record<string, any> = {};

    for (const key in this) {
      if (Object.prototype.hasOwnProperty.call(this, key)) {
        const value = (this as any)[key];
        // Formater les dates en ISO si ce sont des objets Date
        json[key] = value instanceof Date ? value.toISOString() : value;
      }
    }

    return json;
  }
}
  