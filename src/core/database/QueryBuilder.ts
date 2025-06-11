export class QueryBuilder<T> {
    private tableName: string;
    private db: any;
    private modelFactory: (data: any) => T;
  
    private whereClauses: string[] = [];
    private params: any[] = [];
  
    constructor(tableName: string, db: any, modelFactory: (data: any) => T) {
      this.tableName = tableName;
      this.db = db;
      this.modelFactory = modelFactory;
    }
  
    where(condition: string, values: any[] = []): QueryBuilder<T> {
      this.whereClauses.push(condition);
      this.params.push(...values);
      return this;
    }
  
    all(): T[] {
      let query = `SELECT * FROM ${this.tableName}`;
      if (this.whereClauses.length > 0) {
        query += ` WHERE ${this.whereClauses.join(' AND ')}`;
      }
      const results = this.db.getAllSync(query, this.params);
      return results.map(this.modelFactory);
    }
  
    first(): T | null {
      let query = `SELECT * FROM ${this.tableName}`;
      if (this.whereClauses.length > 0) {
        query += ` WHERE ${this.whereClauses.join(' AND ')}`;
      }
      query += " LIMIT 1";
      const result = this.db.getFirstSync(query, this.params);
      return result ? this.modelFactory(result) : null;
    }
  
    count(): number {
      let query = `SELECT COUNT(*) as count FROM ${this.tableName}`;
      if (this.whereClauses.length > 0) {
        query += ` WHERE ${this.whereClauses.join(' AND ')}`;
      }
      const result = this.db.getFirstSync(query, this.params);
      return result?.count ?? 0;
    }

    last(): T | null {
      let query = `SELECT * FROM ${this.tableName}`;
      if (this.whereClauses.length > 0) {
        query += ` WHERE ${this.whereClauses.join(' AND ')}`;
      }
      query += " ORDER BY id DESC LIMIT 1";
      const result = this.db.getFirstSync(query, this.params);
      return result ? this.modelFactory(result) : null;
    }
    
  }
  