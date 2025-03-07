import express, { Application, Request, Response } from 'express';
import { user } from './utils/FakeDatabase';
import envVars from './utils/common/LoadEnvVars';
import DiscoveryRegister from './utils/common/DiscoveryRegister';


function auth(req: Request, res: Response): void {
  const email = req.params.email;
  const password = req.params.password;

  const valid = user.password === password && user.email === email;

  if (!valid) {
    res.status(200).json({ isValid: false, message: 'Usuário não encontrado' });
    return;
  }

  res.status(200).json({ isValid: true, message: 'ID de usuário é válido' });
}


function validateUserId(req: Request, res: Response): void {
  const userId = req.params.id;

  const valid = user.id === userId;

  if (!valid) {
    res.status(200).json({ isValid: false, message: 'Usuário não encontrado' });
    return;
  }

  res.status(200).json({ isValid: true, message: 'ID de usuário é válido' });
}


const app: Application = express();
app.use(express.json());

app.get('/validate/:id', validateUserId);
app.get('/auth/:email/:password', auth);
app.get('/fake-user', (req: Request, res: Response) => { res.status(200).json(user) });
app.get('/', (req: Request, res: Response) => { res.send('Product API'); });
app.listen(envVars.PORT, () => {
  console.log(`Server is running on port ${envVars.PORT}`);
  DiscoveryRegister.doRegistrationWithRetry();
});
