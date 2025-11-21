export interface Message {
  id: number;
  title: string;
  items: string[];
  isList: boolean;
  isOrdered: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface MessageFormData {
  title: string;
  items: string[];
  isList: boolean;
  isOrdered: boolean;
}