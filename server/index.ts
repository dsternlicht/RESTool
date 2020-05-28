import express from 'express';
import cors from 'cors';
import path from 'path';
import bodyParser from 'body-parser';
import routes from './routes';


const isProd =  process.env.NODE_ENV==='production'

let app = express();
app.set('port', process.env.PORT || 1729);
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app = routes.mapRoutes(app);

console.log(path.join(process.cwd(), 'build'))
if(isProd){
  app.use(express.static(path.join(process.cwd(), 'build')));
  app.get('*', (req,res) =>{
      res.sendFile(path.join(process.cwd()+'/build/index.html'));
  });
}

app.listen(app.get("port"), () => {
    console.log(`🚀 Server ready at ${app.get("port")}`);
});

