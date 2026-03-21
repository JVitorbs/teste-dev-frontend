declare module "bun:sqlite" {
  export class Statement {
    run(...params: unknown[]): unknown;
    get(...params: unknown[]): unknown;
    all(...params: unknown[]): unknown[];
  }

  export class Database {
    constructor(filename: string, options?: { create?: boolean; readonly?: boolean });
    run(sql: string): void;
    prepare(sql: string): Statement;
    query(sql: string): Statement;
  }
}
