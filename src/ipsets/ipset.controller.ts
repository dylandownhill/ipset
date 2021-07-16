import * as express from 'express';
import IPSetInterface from './ipset.interface';
import IPSet from './ipset'
import Repo from '../repo/repo';
 
const BASE_PATH = '/';
const REPO = "https://github.com/firehol/blocklist-ipsets.git";
const DOWNLOAD_DIR = "/tmp/ipset";
const REPO_BRANCH = "master";


class IPSetController {
  public router = express.Router();

  constructor() {
    this.intializeRoutes();
  }
 
  intializeRoutes = () => {
    this.router.get(`${BASE_PATH}`, this.getCheckIPSet);
    this.router.get(`${BASE_PATH}update`, this.updateIPSet);
  }
 
  getCheckIPSet = (request: express.Request, response: express.Response) => {
    const paramIP = request.query['ip'] ?? undefined ;
    if ( typeof paramIP === 'string') {
        const ipSet = new IPSet() ;
        const ret = ipSet.checkIP( paramIP );
        if ( ret === false ) {
          response.status(500).send("Error checking IP");
        }
        else if ( Array.isArray(ret)) {
          if ( ret.length === 0 ){
            response.status(201).send(null);
          }
          else {
            response.status(200).send(ret);
          }
        }
        else {
          response.status(500).send("Unknown error");
        }
    }
    else {
      response.status(400).send("Bad request - no ip parameter passed");
    }
  }
 
  updateIPSet = (request: express.Request, response: express.Response) => {
    const repo = new Repo();
    const ipSet = new IPSet();
    
    const ret = repo.loadRepo(REPO, DOWNLOAD_DIR, REPO_BRANCH, ipSet.loadAllIPSets);
    response.send(ret);
  }
}
 
export default IPSetController;