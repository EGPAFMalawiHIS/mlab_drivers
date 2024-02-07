import express, { Request, Response, Application } from 'express';
import dotenv from 'dotenv';

class DriverServer {
  private app: Application;
  private port: number;

  constructor() {
    dotenv.config();
    this.app = express();
    this.port = parseInt(process.env.PORT || '8000', 10);

    this.app.get('/', this.handleRootRequest.bind(this));
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`✨️ server running at http://localhost:${this.port}`);
    });
  }

  private handleRootRequest(req: Request, res: Response): void {
    res.send('Welcome to Express & TypeScript Server');
  }
}

export { DriverServer };
