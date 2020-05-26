import env from './env';
import path from 'path';
import fs from 'fs';

const SMCloudStore = require('smcloudstore');



(async () => {

    const storageProvider = env("storageProvider");
    const storagePath= env("storagePath");
    const storageContainer= env("storageContainer");
    const storageConnection = (env("storageConnection") && JSON.parse(env("storageConnection")))
    if(!storageProvider && !storagePath && !storageContainer && !storageConnection){
        throw Error("valid args not found")
    }

    const storage = SMCloudStore.Create(storageProvider, storageConnection)

    const data = fs.createReadStream(path.resolve(process.cwd(), "devTools/config.json"))
    const options = {
        metadata: {
            'Content-Type': 'application/json'
        }
    }
    const exists = await storage.isContainer(storageContainer)
    if(!exists){
        // TODO: need to handle option specific to provider like  {region: 'us-east-1'} for s3
        await storage.createContainer(storageContainer,storageConnection)
    }
    await storage.putObject(storageContainer, storagePath, data, options)
    const configString = await storage.getObjectAsString(storageContainer, storagePath)

    console.log("success fully uploaded config", configString)

})().catch(err => {
    console.error(err);
});

