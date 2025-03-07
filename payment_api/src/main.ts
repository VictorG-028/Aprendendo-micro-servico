import express, { Application, Request, Response } from 'express';
import Router from './Router';
import envVars from './utils/common/LoadEnvVars';
import DiscoveryRegister from './utils/common/DiscoveryRegister';


const app: Application = express();
app.use(express.json());
const r = new Router();
app.use(r.router);


app.get('/', (req: Request, res: Response) => { res.send('Payments API'); });
app.listen(envVars.PORT, () => {
  console.log(`Server is running on port ${envVars.PORT}`);
  DiscoveryRegister.doRegistrationWithRetry();
});

