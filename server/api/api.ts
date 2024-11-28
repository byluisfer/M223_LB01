import { Request, Response, Express, response } from 'express';
import { manageUser } from '../types/user';

export class API {
  // Properties
  app: Express;
  manageUser: manageUser;
  // Constructor
  constructor(app: Express, manageUser: manageUser) {
    this.app = app
    this.manageUser = manageUser
    this.app.get('/hello', this.sayHello)
  }
  // Methods
  private sayHello(req: Request, res: Response) {
    res.send('Hello There!')
  }
}
