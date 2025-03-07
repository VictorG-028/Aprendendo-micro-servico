

class PagSeguroApi {

  static async createPayment(items: any[], totalCost: number, userId: string, idempotentId: string): Promise<any> {
    const response = await fetch('http://localhost:3000/start-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        idempotentId,
        productIds: items.map((item) => item.id),
        totalCost,
        status: 'new',
      }),
    });
    return await response.json();

  }
}
