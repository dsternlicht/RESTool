import env from './env';
import path from 'path';
import fs from 'fs';

const SMCloudStore = require('smcloudstore');



(async () => {

    const storageProvider = env('STORAGE_PROVIDER') || 'local'
    const storagePath= env('STORAGE_PATH');
    const storageContainer= env('STORAGE_CONTAINER');
    const storageConnection = (env('STORAGE_CONNECTION') && JSON.parse(env('STORAGE_CONNECTION')))
    if(!storageProvider && !storagePath && !storageContainer && !storageConnection){
        throw Error("Valid args not found for storage provider")
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

