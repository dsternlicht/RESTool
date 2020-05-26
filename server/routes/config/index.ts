import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import SMCloudStore from 'smcloudstore';


let jsonData = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), "public/config.json")))

const configServer = Router();


configServer
    .get('/', (req: Request, res: Response) => {
        res.status(200).json(jsonData)
    });


export default configServer;



