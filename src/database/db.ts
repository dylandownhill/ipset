import MySQL from 'mysql';
import util from 'util';

const HOST = 'database-test.crqao5k6sqkx.us-east-2.rds.amazonaws.com';
const USER = 'myTestUser' ;
const PASSWORD = 'r9658fFGViw2CoyU8KwJ' ;
const DATABASE =  'ipsetDB';
const TABLENAME_IPSET = 'ipsetTable';
const NEEDS_UPDATE_FLAG = 1;

export class db {
    #pool: MySQL.Pool;

    constructor() {
        this.#pool  = MySQL.createPool({
          connectionLimit : 10,
          host     : HOST,
          user     : USER,
          password : PASSWORD,
          database : DATABASE
        });
    }


    startTransaction = () => {
        const query = this.#pool.query(`start transaction`, (error, results, fields) => {
            if (error) throw error;
        });
    }
    commit = () => {
        const query = this.#pool.query(`commit`, (error, results, fields) => {
            if (error) throw error;
        });
    }
    rollback = () => {
        const query = this.#pool.query(`rollback`, (error, results, fields) => {
            if (error) throw error;
        });
    }

    markAllIPSetAsNeedingUpdate = () => {
        const query = this.#pool.query(`update ${TABLENAME_IPSET} set needsUpdate = 1 where needsUpdate <> ?`, NEEDS_UPDATE_FLAG, (error, results, fields) => {
            if (error) throw error;
        });
        console.log(query.sql);
    }
    deleteAllIPSetNotUpdated = () => {
        const query = this.#pool.query(`delete from ${TABLENAME_IPSET} where needsUpdate = ?`, NEEDS_UPDATE_FLAG, (error, results, fields) => {
            if (error) throw error;
        });
        console.log(query.sql);
    }

    updateIPSet = (author: string, ipset: string[], cb:any ) => {
        
        console.log(`delete start for author ${author} `);
        const query = this.#pool.query(`delete from ${TABLENAME_IPSET} where author=?`, author, (error, results, fields) => {
            if (error) throw error;
            // Neat!
            console.log(`delete finished for author ${author}  - now to insert`);
            cb(author, ipset);
        });
    }

    insertIPSet = (author: string, ipset: string[]) => {

        const readData = util.promisify( this.#pool.query );

        ipset.forEach( ip => {
            readData(`INSERT INTO ${TABLENAME_IPSET} SET ipSet = ${this.#pool.escape(ip)}, author = ${this.#pool.escape(author)}`)
                .then((data: any) => {
                console.log(`INSERT returned`);
                return data;
              }).catch((error) => {
                console.error(`INSERT errored`);
                // Handle the error.
                throw error;
              });

            // const newRow = { ipSet: ip,author };
            // this.#pool.query(`INSERT INTO ${TABLENAME_IPSET} SET ?`, newRow, (error, results, fields) => {
            //     if (error) throw error;
            //     // console.log(query.sql); // INSERT INTO posts SET `id` = 1, `title` = 'Hello MySQL'
            // });
        });
    }

    getIPSet = (lookupIP: string):any => {
        const readData = util.promisify( this.#pool.query );
        readData(`select author, ipSet from ${TABLENAME_IPSET} where ipSet=${this.#pool.escape(lookupIP)}`)
        .then((data: any) => {
            // Do something with `stats`
            console.log(`readData returned`);
            console.log(data);
            return data;
          }).catch((error) => {
            console.error(`readData errored`);
            console.error(error);
            // Handle the error.
            throw error;
          });
    }
}

export default db;