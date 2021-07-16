
import gitHandler from './gitHandler';
import fs from "fs";


export class repo {
    
    loadRepo = (repoName: string, downloadDir: string, branch: string, cb: any): boolean => {
        const gitrepo = new gitHandler();

        // fs.rmSync(downloadDir, { recursive:true, force: true } );
        // Check if the directory exists, if not create it.
        const dirExists = fs.statSync(downloadDir,{throwIfNoEntry:false});
        if ( !dirExists ) {
            fs.mkdirSync(downloadDir);
        }

        if ( !gitrepo.repoExists(repoName, downloadDir) ) {
            console.log(` cloning: ${downloadDir}`);
            gitrepo.clone(repoName, downloadDir, branch, cb);
        }
        else {
            console.log(` pulling: ${downloadDir}`);
            gitrepo.pull(downloadDir, branch, cb);
        }
        return true;
    }
}

export default repo;