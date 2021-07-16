//@ts-ignore - no types for this library
import git from 'gift';
import fs from "fs";
import path from "path";

export class gitHandler {
    #lastErrors: unknown = undefined;
    #repo: unknown = undefined;

    public repoExists = (repoName: string, downloadDir: string): boolean => {
      const fileName = path.resolve( downloadDir + `${path.sep}.git`);
      console.log(`Checking Permission for reading the file ${fileName}`);
      
      const exists = fs.statSync(fileName,{throwIfNoEntry:false});
      // fs.statSync returns undefined if file does not exist, otherwise it returns info on the file.
      // using double-bang converts these into boolean (undefined=false, stat=true)
      return !!exists;
    }

    public clone = (repoName: string, downloadDir: string, branch: string, cb: any): boolean => {
      console.log(`calling clone ${repoName} ${downloadDir} ${branch} `);
      console.log(`error from clone repo ${repoName} branch ${branch}`);
      git.clone (repoName, downloadDir,0 , "master", (err: unknown, _repo: unknown) => {
          this.#repo = _repo;
          this.#lastErrors = err;
          if ( err !== null ) {
            console.error(`error from clone repo dir ${downloadDir} name ${repoName} branch ${branch}`);
            console.error(err);
            return false ;
          }
          cb(downloadDir);
        }
      ) ;
      return true;
    };
  
    public pull = (downloadDir: string, branch: string, cb:any ): boolean => {
      console.log(`calling pull ${downloadDir} ${branch} `);
      this.#repo = git(downloadDir);
      this.#lastErrors = undefined;
      if ( typeof this.#repo === 'undefined' ){
          console.error('no repo loaded');
          return false ;
      }
      else {
        (this.#repo as any).pull(branch, (err: unknown) => {
          if ( err !== null ) {
            this.#lastErrors = err;
            console.error(`error from pull repo dir ${downloadDir} branch ${branch}`);
            console.error(err);
            return false ;
          }
          cb(downloadDir);
        });
      }
      return true;
    }

    getLastErrors = (): string[]|undefined|unknown => {
      return this.#lastErrors;
    }
}

export default gitHandler ;
