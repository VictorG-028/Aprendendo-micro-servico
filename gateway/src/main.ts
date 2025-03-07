import express, { Application, Request, Response } from 'express';
import axios, { AxiosError } from "axios";
import { ErrorResponseDto } from './dto/common/ErrorResponseDto';
import envVars from './utils/common/LoadEnvVars';


const app: Application = express();
app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

type ServiceCategory = "user" | "payments" | "product";
type BalancingInfo = {
  urls: string[];
  nextServiceIndex: number;
};
const services: Record<ServiceCategory, BalancingInfo> = {
  user: { urls: [], nextServiceIndex: 0 },
  payments: { urls: [], nextServiceIndex: 0 },
  product: { urls: [], nextServiceIndex: 0 },
};

////////////////////////////////////////////////////////////////////////////////

function getAllServices(req: Request, res: Response): any {
  res.json(services);
}
app.get("/services", getAllServices);

function getServiceByCategory(req: Request, res: Response): any {
  const { category } = req.params;
  const registeredServices = services[category as ServiceCategory];

  if (!registeredServices) {
    return res.status(404).json({ error: "Category not found or no registered service" });
  }

  return res.json(registeredServices);
}
app.get("/services/:category", getServiceByCategory);

////////////////////////////////////////////////////////////////////////////////

function registerService(req: Request, res: Response): any {
  const { category, url } = req.body;
  const registeredServices = services[category as ServiceCategory];

  if (!registeredServices) {
    return res.status(404).json({ error: "Category not found" });
  }

  registeredServices.urls.push(url);
  return res.json({ message: "Service registered" });
}
app.post("/register", registerService);

function deleteService(req: Request, res: Response): any {
  const { category, url } = req.body;
  const registeredServices = services[category as ServiceCategory];

  if (!registeredServices) {
    return res.status(404).json({ error: "Category not found" });
  }

  const index = registeredServices.urls.indexOf(url);
  if (index === -1) {
    return res.status(404).json({ error: "Service not found" });
  }

  if (registeredServices.nextServiceIndex === index) {
    registeredServices.nextServiceIndex += -1;
  }

  registeredServices.urls.splice(index, 1);
  return res.json({ message: `Service ${url} from ${category} removed` });
}
app.delete("/register", deleteService);

////////////////////////////////////////////////////////////////////////////////

// Escolhe um serviço aleatório dentro da categoria (load balancing básico)
function loadBalancingLogic(category: ServiceCategory): string | null {
  const registeredServices = services[category];
  if (!registeredServices || registeredServices.urls.length === 0) return null;

  const nextService = registeredServices.urls[registeredServices.nextServiceIndex];
  registeredServices.nextServiceIndex = (registeredServices.nextServiceIndex + 1) % registeredServices.urls.length;
  return nextService;
};

// Proxy para um serviço registrado
async function mapRequestToService(req: Request, res: Response, next: Function): Promise<any> {
  const category = req.params.category as ServiceCategory;
  const serviceUrl = loadBalancingLogic(category);

  if (!serviceUrl) {
    return res.status(500).json({ error: "No available service for this category" });
  }
  console.log("Chegou aqui", req.method, req.headers, req.body, `${serviceUrl}/${req.params[0]}`);
  const response = await axios({
    method: req.method,
    url: `${serviceUrl}/${req.params[0]}`,
    data: req.body,
    headers: {
      "Content-Type": "application/json",
    },
  }).then((r) => {
    console.log("Chegou aqui SUCCESS");
    res.status(r.status).json(r.data);
  }).catch((e) => {
    console.log("Chegou aqui ERROR");
    const axiosError = e as AxiosError<ErrorResponseDto>;
    const data = axiosError.response?.data;

    if (!data || !data.statusCode || !data.message) {
      return res.status(500).json({ error: "Unknown error" });
    }

    res.status(data.statusCode).json({ error: data.message });
    // res.status(200).json({ msg: "repassou o pedido" });
  });
}
app.all("/:category/*", mapRequestToService);

////////////////////////////////////////////////////////////////////////////////

app.get("/", (req: Request, res: Response) => { res.send("Gateway API"); });
app.listen(envVars.PORT, () => {
  console.log(`Gateway API running on port ${envVars.PORT}`);
});
