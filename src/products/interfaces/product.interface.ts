export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  category: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  quantity: number;
  category: string;
}

export interface UpdateProductRequest {
  id: string;
  name?: string;
  description?: string;
  price?: number;
  quantity?: number;
  category?: string;
  isActive?: boolean;
}

export interface GetProductRequest {
  id: string;
}
