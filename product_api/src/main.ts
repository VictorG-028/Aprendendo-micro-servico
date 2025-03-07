import express, { Application, Request, Response } from 'express';
import Router from './Router';
import envVars from './utils/common/LoadEnvVars';
import DiscoveryRegister from './utils/common/DiscoveryRegister';
import axios from 'axios';
import { getOtherServiceUrl } from './utils/common/getService';


const app: Application = express();
app.use(express.json());
const r = new Router();
app.use(r.router);


app.get('/', (req: Request, res: Response) => { res.send('Product API'); });
app.listen(envVars.PORT, () => {
  console.log(`Server is running on port ${envVars.PORT}`);
  DiscoveryRegister.doRegistrationWithRetry();
});

// const response = axios.get(
//   `http://localhost:8000/services/user`
// ).then((r) => {
//   console.log(r.data);
// }).catch((e) => {
//   console.log(e);
// });

// const response2 = getOtherServiceUrl("user")
//   .then((r) => {
//     console.log(r);
//   }).catch((e) => {
//     console.log(e);
//   });

