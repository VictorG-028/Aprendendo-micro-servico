import { Router as ExpreessRouter, Request, Response } from 'express';
import PagSeguroController from './controller/PagSeguroController';
import SharedState from './interfaces/SharedState';


export default class Router {

  router: ExpreessRouter;
  sharedState: SharedState = {};

  pagSeguroController = new PagSeguroController();

  constructor() {
    this.router = ExpreessRouter();

    // bind(this) é usado para manter o contexto da classe Router dentro do método post
    this.router.post("/start-payment", this.startPayment.bind(this));

    // API do mercado pago enviar um post nessa rota
    this.router.post("/notify", this.endPayment.bind(this));

  }

  private async startPayment(req: Request, res: Response): Promise<void> {
    this.pagSeguroController.execute(req, res, this.sharedState);
    return undefined;
  }

  private async endPayment(req: Request, res: Response): Promise<void> {
    this.pagSeguroController.execute(req, res, this.sharedState);
    return undefined;
  }
}
