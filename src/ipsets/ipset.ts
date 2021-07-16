import fs from "fs";
import path from 'path';
import IPSetInterface from "./ipset.interface";
import { getIPRange } from 'get-ip-range';
import Db from "../database/db";

const FILE_EXT = ".ipset" ;

export class ipSet {
    #ipSet: IPSetInterface[];
    
    constructor() {
        this.#ipSet = [];
    };

    checkIP = ( ip: string ): IPSetInterface[]|boolean => {
        const database = new Db();
        return database.getIPSet( ip );
    };

    // Load all the IP Sets in the directory given.
    loadAllIPSets = ( downloadDir: string): boolean|string[] => {
        let ret: string[] = [] ;

        const database2 = new Db();
        try {
            database2.markAllIPSetAsNeedingUpdate();
        }
        catch (error) {
            console.error(`Error markAllIPSetAsNeedingUpdate`);
            console.error(error);
            return false ;
        }


        // Get a list of all the filenames in the directory supplied.
        console.log(`opening ${downloadDir}`);
        fs.readdir(downloadDir, (err, files) => {
            if ( typeof err?.code !== 'undefined'){
                console.error("loadAllIPSets error")
                console.error(err);
                return false ;
            }
            // Remove files that don't have the extension we are looking for.
            const filesIPSet = files.filter(file => file.endsWith(FILE_EXT));
            if ( filesIPSet.length === 0){
                console.error(`no files end with ${FILE_EXT} in directory ${downloadDir}`);
                return false ;
            }
            // Load all the files 
            filesIPSet.forEach(file => {
                const database = new Db();
                console.log(`opening file ${file}`);
                const fileName = path.resolve( downloadDir , `.${path.sep}${file}`);
                const ipList = this.#getIPSetList( fileName ) ;

                if ( Array.isArray(ipList)){
                    try{
                        database.updateIPSet(file, ipList, database.insertIPSet);
                    }
                    catch(error) {
                        database.rollback();
                        console.error(`Could not store ipsets for author ${file}`)
                        return false ;
                    }
                }
                else if ( ipList === false ) {
                    return false;
                }
                else {
                    console.error(`unknown value for ipList ${ipList}`)
                    return false ;
                }
            });
        });

        try {
            database2.deleteAllIPSetNotUpdated();
        }
        catch (error) {
            console.error(`Error deleteAllIPSetNotUpdated`);
            console.error(error);
            return false ;
        }
        return true;
    }

    // Take the filename supplied and read all the IP sets from it.
    #getIPSetList = (fileName: string): string[]|boolean => {
        
        let ret: string[] = [] ;

        const data = fs.readFileSync(fileName, "utf8");
        // split the contents by new line
        const lines = data.split(/\r?\n/);

        // print all lines
        lines.forEach((line) => {
            if ( line.length > 0 ) {
                // # marks the start of a comment - could be mid line so split in two 
                // around this character to get the non-commented part of the string.
                const ipInfo = line.split(/#/,2)[0].trim();
                if ( ipInfo.length !== 0 ){
                    if ( ipInfo.includes("/") || ipInfo.includes("-")){
                        const ipSetToArray = getIPRange(ipInfo);
                        ret = ret.concat(ipSetToArray);
                    }
                    else {
                        ret.push(ipInfo);
                    }
                }
            }
        });
        return ret;
    }
};

export default ipSet;