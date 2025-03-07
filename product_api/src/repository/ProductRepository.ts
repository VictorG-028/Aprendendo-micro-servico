import { Product } from '@prisma/client';
import { v4 as uuidV4 } from "uuid";
import Database from '../utils/common/Database';

export default class ProductRepository {
  private static instance: ProductRepository; // singleton
  private database: Database;

  private constructor() {
    this.database = Database.getInstance();
  }

  public static getInstance(): ProductRepository {
    if (!ProductRepository.instance) {
      ProductRepository.instance = new ProductRepository();
    }

    return ProductRepository.instance;
  }

  // public async validate(p: Product): Promise<boolean> {
  //   if (p.name === undefined || p.price === undefined || p.quantity === undefined) {
  //     return false;
  //   }

  //   if (p.price < 0 || p.quantity < 0) {
  //     return false;
  //   }

  //   return true;
  // }

  public async getById(id: string): Promise<Product | null> {
    return this.database.prisma.product.findUnique({
      where: { id: id },
      select: {
        id: true,
        name: true,
        price: true,
        quantity: true,
        // cartId: true,
        // cart: false
      }
    });
  }

  public async getByIds(ids: string[]): Promise<Product[]> {
    return this.database.prisma.product.findMany({
      where: {
        id: {
          in: ids
        }
      }
    });
  }

  public async create(name: string, price: number, quantity: number): Promise<Product> {
    return this.database.prisma.product.create({
      data: {
        id: uuidV4(),
        name: name,
        price: price,
        quantity: quantity
      }
    });
  }

  public async update(newProduct: Product): Promise<Product> {
    return this.database.prisma.product.update({
      where: { id: newProduct.id },
      data: {
        name: newProduct.name,
        price: newProduct.price,
        quantity: newProduct.quantity
      }
    });
  }
}


