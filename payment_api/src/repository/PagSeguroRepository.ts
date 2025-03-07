import { Payment } from "@prisma/client";
import { v4 as uuidV4 } from "uuid";
import Database from '../utils/common/Database';

export default class PagSeguroRepository {
  private static instance: PagSeguroRepository; // singleton
  private database: Database;

  private constructor() {
    this.database = Database.getInstance();
  }

  public static getInstance(): PagSeguroRepository {
    if (!PagSeguroRepository.instance) {
      PagSeguroRepository.instance = new PagSeguroRepository();
    }

    return PagSeguroRepository.instance;
  }

  // public async validate(o: Order): Promise<boolean> {
  //   if (o.userId === undefined || o.idempotentId === undefined || o.productIds === undefined || o.totalCost === undefined || o.status === undefined) {
  //     return false;
  //   }

  //   if (o.totalCost < 0 || o.productIds.length === 0 || o.status as string === '') {
  //     return false;
  //   }

  //   if (!isOrderStatus(o.status)) {
  //     return false;
  //   }

  //   return true;
  // }

  public async getById(id: string): Promise<Payment | null> {
    return await this.database.prisma.payment.findUnique({
      where: { id: id },
    });
    // const found = await this.database.prisma.order.findUnique({
    //   where: { id: id },
    //   select: {
    //     id: true,
    //     userId: true,
    //     idempotentId: true,
    //     products: {
    //       select: {
    //         id: true
    //       }
    //     },
    //     totalCost: true,
    //     status: true
    //   }
    // });

    // if (!found) {
    //   return null;
    // }

    // const productIds = found.products.map((product) => product.id);
    // const orderStatus = convertToOrderStatus(found.status);

    // if (orderStatus === null) {
    //   return null;
    // }

    // const order: Omit<Order, 'products'> = {
    //   ...found,
    //   status: orderStatus,
    //   productIds: productIds,
    // };

    // return order;
  }

  public async create(userId: string, idempotentId: string, productIds: string[], totalCost: number, status: string): Promise<Payment> {
    return await this.database.prisma.payment.create({
      data: {
        id: uuidV4(),
        userId: userId,
        idempotentId: idempotentId,
        products: productIds,
        totalCost: totalCost,
        status: "pending"
      }
    });
  }
}
