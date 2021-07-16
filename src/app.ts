import express from 'express';
// import * as bodyParser from 'body-parser';
import IPSetController from './ipsets/ipset.controller';
 
class App {
  public app: express.Application;
  public port: number;
 
  constructor(controllers: IPSetController[], port: number) {
    this.app = express();
    this.port = port;
 
    this.initializeMiddlewares();
    this.initializeControllers(controllers);
  }
 
  private initializeMiddlewares() {
    // //@ts-ignore
    // this.app.use(bodyParser.urlencoded());
    // //@ts-ignore
    // this.app.use(bodyParser.json());
  }
 
  private initializeControllers(controllers: IPSetController[]) {
    controllers.forEach((controller) => {
      this.app.use('/', controller.router);
    });
  }
 
  public listen() {
    this.app.listen(this.port, () => {
      console.log(`App listening on the port ${this.port}`);
    });
  }
}
 
export default App;