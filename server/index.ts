import express, { Express, Request, Response } from 'express'
import { API } from './api'
import http from 'http'
import { resolve, dirname } from 'path'
import { Database } from './database'
import { manageUser } from './types/user'

class Backend {
  // Properties
  private _app: Express
  private _api: API
  private _database: Database
  private _env: string
  private manageUser: manageUser

  // Getters
  public get app(): Express {
    return this._app
  }

  public get api(): API {
    return this._api
  }

  public get database(): Database {
    return this._database
  }

  // Constructor
  constructor() {
    this._app = express()
    this._app.use(express.json()) // Middleware allows the app Express to parse JSON data
    // https://www.geeksforgeeks.org/express-js-express-urlencoded-function/
    this._app.use(express.urlencoded()); // Middleware allows the app Express to parse URL-encoded data
    this._database = new Database()
    this.manageUser = new manageUser(this._database)
    this._api = new API(this._app, this.manageUser)
    this._env = process.env.NODE_ENV || 'development'

    this.setupStaticFiles()
    this.setupRoutes()
    this.startServer()
  }

  // Methods
  private setupStaticFiles(): void {
    this._app.use(express.static('client'))
  }

  private setupRoutes(): void {
    this._app.get('/', (req: Request, res: Response) => {
        const __dirname = resolve(dirname(''));
        res.sendFile(__dirname + '/client/index.html');
    });

    this._app.get('/register', (req: Request, res: Response) => {
        const __dirname = resolve(dirname(''));
        res.sendFile(__dirname + '/client/register.html');
    });

    this._app.post('/register', (req: Request, res: Response) => {
        this.manageUser.register(req, res);
    });

    this._app.get('/login', (req: Request, res: Response) => {
        const __dirname = resolve(dirname(''));
        res.sendFile(__dirname + '/client/login.html');
    });
}

  private startServer(): void {
    if (this._env === 'production') {
      http.createServer(this.app).listen(3000, () => {
        console.log('Server is listening!')
      })
    }
  }
}

const backend = new Backend()
export const viteNodeApp = backend.app
