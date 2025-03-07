import { Request, Response } from 'express';
// import bcrypt from 'bcrypt';
import Decorator from "../interfaces/pattern/Decorator";
import Controller from "../interfaces/Controller";
import SharedState from "../interfaces/SharedState";
import { getOtherServiceUrl } from '../utils/common/getService';
import axios from 'axios';


function decodeBasicAuth(authorization: string): [email: string, password: string] {
  // Assumes the authorization header is in the format 'Basic <credentials>'
  const base64Credentials = authorization.split(' ')[1];
  const decodedCredentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
  return decodedCredentials.split(':') as [string, string];
}

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

    console.log("Pedindo a URL do serviço de usuário")
    const userServicesUrl = await getOtherServiceUrl("user");
    if (!userServicesUrl) {
      res.status(500).json({ message: 'Erro ao buscar URL do serviço de usuários para validar autenticação do userId.' });
      return false;
    }

    console.log(`Mandando requisição para o serviço de usuário ${userServicesUrl}/auth/${email}/${password}`)
    const isValidUser = await axios.get(`${userServicesUrl}/auth/${email}/${password}`);
    if (!isValidUser.data?.isValid) {
      res.status(400).json({ message: 'Não autorizado.' });
      return false;
    }

    return true;
  }

}

export default BasicAuthMiddleware;
