
import pingRouter from './ping';
import configRouter from './config';



const routes = module.exports;

routes.mapRoutes = (app) => {
    /* APIs and Routes */
    app.use('/ping', pingRouter);
    app.use('/remote', configRouter);

    return app;
};
export default routes;
