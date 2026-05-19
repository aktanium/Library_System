export interface Book {
  id: number;
  title: string;
  author: string;
  genre: string;
  isbn: string;
  quantity: number;
  status: string;
  description?: string | null;
  summary?: string | null;
  publishedYear?: number | null;
  coverColor?: string | null;
}
