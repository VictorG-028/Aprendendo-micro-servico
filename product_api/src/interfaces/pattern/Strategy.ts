import { Payment } from "@prisma/client";

export default interface ProcessPaymentStrategy {
  handlePayment: (o: Payment) => void;
}


