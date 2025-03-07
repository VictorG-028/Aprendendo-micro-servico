import { Cart, Product } from '@prisma/client';
import { v4 as uuidV4 } from "uuid";
import Database from '../utils/common/Database';

export default class CartRepository {
  private static instance: CartRepository; // singleton
  private database: Database;

  private constructor() {
    this.database = Database.getInstance();
  }

  public static getInstance(): CartRepository {
    if (!CartRepository.instance) {
      CartRepository.instance = new CartRepository();
    }

    return CartRepository.instance;
  }

  public async addProducts(cartId: string, userId: string, quantities: number[], products: string[]): Promise<Cart> {
    // return this.database.prisma.cart.upsert({
    //   where: { id: cartId }, // Condição para encontrar o carrinho (ou criar um novo)
    //   update: {
    //     products: {
    //       connect: products.map(product => ({ id: product.id })), // Conecta os produtos ao carrinho
    //     },
    //   },
    //   create: {
    //     id: cartId, // Se o carrinho não existir, cria um novo com o ID fornecido
    //     userId: userId, // Associa o carrinho ao usuário
    //     products: {
    //       connect: products.map(product => ({ id: product.id })), // Conecta os produtos ao carrinho
    //     },
    //   },
    //   include: { products: true } // Inclui os produtos no retorno para verificar o resultado
    // });
    return this.database.prisma.cart.upsert({
      where: { id: cartId }, // Condição para encontrar o carrinho (ou criar um novo)
      update: {
        userId: userId,
        quantities: quantities,
        products: products,
      },
      create: {
        userId: userId,
        quantities: quantities,
        products: products,
      }
    });
  }

  public async searchCartByUserId(userId: string): Promise<string> {
    const cart = await this.database.prisma.cart.findFirst({
      where: {
        userId: userId
      }
    });

    return cart ? cart.id : uuidV4();
  }

}


