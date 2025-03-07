import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import Decorator from "../interfaces/pattern/Decorator";
import Controller from "../interfaces/Controller";
import SharedState from "../interfaces/SharedState";
import findUserByEmail from '../utils/findUser';



class BasicAuthMiddleware implements Decorator {
  /*
    Expects user to come in basic auth header
    This have a colateral effect of creating a user header.
  */

  controller: Controller;

  constructor(controller: Controller) {
    this.controller = controller;
  }


  public async execute(req: Request, res: Response, sharedState: SharedState): Promise<void> {
    const isAtuhorized = await BasicAuthMiddleware.authenticate(req, res, sharedState);
    if (!isAtuhorized) { return; }
    return this.controller.execute(req, res, sharedState);
  }


  private static async authenticate(req: Request, res: Response, sharedState: SharedState): Promise<boolean> {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      res.status(400).json({ message: 'Bad request: Missing "Basic " substring at start of authorization header' });
      return false;
    }

    const [email, password] = decodeBasicAuth(authHeader);

    const foundUser = await findUserByEmail(email).catch((e) => null);
    if (!foundUser) {
      res.status(401).json({ message: 'Unauthorized: Invalid username or password' });
      return false;
    }

    const hasCorrectPass = await bcrypt
      .compare(password, foundUser.password)
      .then((result: boolean) => result);

    if (!hasCorrectPass) {
      res.status(401).json({ message: 'Unauthorized: Invalid username or password' });
      return false;
    }

    sharedState['user'] = foundUser;
    return true;
  }

}

export default BasicAuthMiddleware;
function decodeBasicAuth(authHeader: string): [any, any] {
  throw new Error('Function not implemented.');
}

