
export interface Specification {
  name: string;
  value: string;
}

export interface Laptop {
  modelName: string;
  specifications: Specification[];
}
