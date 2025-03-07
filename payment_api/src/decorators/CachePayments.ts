import { Request, Response } from "express";
import Controller from "../interfaces/Controller";
import Decorator from "../interfaces/pattern/Decorator";
import SharedState from "../interfaces/SharedState";
import database from "../Database";



export default class CachePayments implements Decorator {
  /*
    
  */
  private database = database.getInstance();
  private cache: Map<string, string> = new Map<string, string>();

  controller: Controller;

  constructor(controller: Controller) {
    this.controller = controller;
  }

  public async execute(req: Request, res: Response, sharedState: SharedState): Promise<void> {

    if (req.path === "/start-buy" && req.method === "POST") {
      const { userId, idempotentId, productIds } = req.body;
      const key = `PAYMENT ${userId}${idempotentId}${productIds.join("")}`;

      if (this.cache.has(key)) {
        req.body.status = "pending";
      } else {
        req.body.status = "new";
      }

      this.cache.set(key, "PENDING");
    }

    await this.controller.execute(req, res, sharedState);

    if (req.path === '/notify' && req.method === 'POST') {
      console.log(`Recurso Notify foi chamado com`);
      console.log(req.params);
      console.log(req.body);
      console.log(`@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@`);
      // this.cache.delete(key);
    }

    return;
  }
}
