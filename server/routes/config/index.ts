import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import SMCloudStore from 'smcloudstore';
import env from '../../env';

const storageProvider = env('STORAGE_PROVIDER') || 'local'
const storagePath= env('STORAGE_PATH');
const storageContainer= env('STORAGE_CONTAINER');
const storageConnection = (env('STORAGE_CONNECTION') && JSON.parse(env('STORAGE_CONNECTION')))

let  storage = null;
if(storageProvider !== 'local' && !(storageProvider!==undefined && storagePath!==undefined && storageContainer!==undefined && storageConnection!==undefined)){
    throw Error("Valid args not found for storage provider")
}else{
    storage = SMCloudStore.Create(storageProvider, storageConnection)
}




const configServer = Router();

// TODO: config.js support
configServer
    .get('/config.json', async(req: Request, res: Response) => {
        let configString = ''
        if(storageProvider!== 'local'){
            configString = await storage.getObjectAsBuffer(storageContainer, storagePath);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(configString, 'utf-8');
        }
        return res.status(500).send("Wrong storage provider")
    });

configServer
    .get('/config.js', async(req: Request, res: Response) => {
        let configString = ''
        if(storageProvider!== 'local'){
            configString = await storage.getObjectAsBuffer(storageContainer, storagePath);
            res.writeHead(200, { 'Content-Type': 'text/javascript' });
            return res.end(configString, 'utf-8');
        }
        
        return res.status(500).send("Wrong storage provider")
    });


export default configServer;



