import { Router, Request, Response } from 'express';


const pingServer = Router();


pingServer
    .get('/ping', (req: Request, res: Response) => {
        res.status(200).json({'ping':'pong','version':process.env.npm_package_version})
    });


export default pingServer;



