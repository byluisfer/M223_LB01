import { Request, Response, Express } from 'express';
import { manageUser } from '../types/user';
import { manageTweet } from '../types/tweets';

export class API {
  // Properties
  app: Express;
  manageUser: manageUser;
  manageTweet: manageTweet;
  
  // Constructor
  constructor(app: Express, manageUser: manageUser, manageTweet: manageTweet) {
    this.app = app
    this.manageUser = manageUser
    this.manageTweet = manageTweet
  }
}
