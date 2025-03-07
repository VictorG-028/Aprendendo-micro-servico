import { Request, Response } from 'express';
import SharedState from './SharedState';


export default interface Controller {
  execute: (req: Request, res: Response, sharedState: SharedState) => void;
}
