import { Request, Response } from 'express';
import Controller from "../interfaces/Controller";
// import ProcessPaymentStrategy from '../interfaces/pattern/Strategy';
import SharedState from '../interfaces/SharedState';
import { Payment } from '@prisma/client';
import { Customer, CustomerCard, MercadoPagoConfig, OAuth, Preference, Payment as StartPayment, CardToken, User } from 'mercadopago';
import PaymentCreateRequest from 'mercadopago';
import PagSeguroRepository from '../repository/PagSeguroRepository';
import StartPaymentDto, { validateStartPaymentDto } from '../dto/StartPaymentDto';
import { getOtherServiceUrl } from '../utils/common/getService';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';


interface Product {
  id: string;
  name: string;
  price: number; // float
  quantity: number; // int
}


interface ProcessPaymentStrategy {
  handlePayment(req: Request, res: Response, pagSeguroRepository: PagSeguroRepository): Promise<boolean>;
}

class HandleCreateNewPayment implements ProcessPaymentStrategy {
  async handlePayment(req: Request, res: Response, pagSeguroRepository: PagSeguroRepository): Promise<boolean> {
    console.log("Novo pagamento iniciado.");
    return true; // Continua o fluxo normal
  }
}

class HandleRepeatedPayment implements ProcessPaymentStrategy {
  async handlePayment(req: Request, res: Response, pagSeguroRepository: PagSeguroRepository): Promise<boolean> {
    console.log("Pagamento duplicado detectado. Encerrando fluxo cedo.");
    res.status(200).json({ message: "Pagamento já processado anteriormente." });
    return false; // Corta o fluxo
  }
}

class PaymentContext {
  private strategy: ProcessPaymentStrategy;

  constructor(paymentStatus: string) {
    if (paymentStatus === 'new') {
      this.strategy = new HandleCreateNewPayment();
    } else if (paymentStatus === 'repeated') {
      this.strategy = new HandleRepeatedPayment();
    } else {
      throw new Error('Invalid payment status');
    }
  }

  public async executeStrategy(req: Request, res: Response, pagSeguroRepository: PagSeguroRepository): Promise<boolean> {
    return await this.strategy.handlePayment(req, res, pagSeguroRepository);
  }
}

export default class PagSeguroController implements Controller {

  private pagSeguroRepository = PagSeguroRepository.getInstance();

  private client: MercadoPagoConfig = new MercadoPagoConfig({
    accessToken: process.env.PAGSEGURO_TOKEN as string,
    options: {
      timeout: 5000,
      idempotencyKey: 'abc',
    }
  });


  public async execute(req: Request, res: Response, sharedState: SharedState): Promise<Payment | null> {
    if (req.path === '/start-payment' && req.method === 'POST') {
      return await this.startPayment(req, res);
    } else if (req.path === '/notify' && req.method === 'POST') {
      return await this.notify(req, res);
    }
    res.status(404).json({ message: 'Rota não encontrada' });
    return null;
  }

  public async startPayment(req: Request, res: Response): Promise<Payment | null> {
    const { idempotentId, userId, userEmail, productsIds, quantities, unitPrices, totalCost } = req.body as StartPaymentDto;
    console.log(`Recebido do insomnia: ${idempotentId} ${userEmail} ${userId} ${productsIds} ${quantities} ${unitPrices} ${totalCost}`);


    const isValid = validateStartPaymentDto(req.body);
    if (!isValid) {
      res.status(400).json({ message: 'Informações de pagamento inválidas' });
      return null;
    }

    if (this.client.options) this.client.options.idempotencyKey = req.body.idempotentId;
    else this.client.options = { timeout: 5000, idempotencyKey: req.body.idempotentId };
    // if (this.client.options) this.client.options.idempotencyKey = uuidv4();
    // else this.client.options = { timeout: 5000, idempotencyKey: uuidv4() };

    ////////////////////////////////////////////////////////////////////////////
    // Code pattern STRATEGY

    const foundCopy = await this.pagSeguroRepository.getByIndempotentId(idempotentId);
    const context = new PaymentContext(foundCopy ? "repeated" : "new");

    const shouldContinue = await context.executeStrategy(req, res, this.pagSeguroRepository);
    if (!shouldContinue) return null;

    ////////////////////////////////////////////////////////////////////////////
    console.log("Pedindo a URL do serviço de usuário")
    const userServicesUrl = await getOtherServiceUrl("user");
    if (!userServicesUrl) {
      res.status(500).json({ message: 'Erro ao buscar URL do serviço de usuários para validar autenticação do userId.' });
      return null;
    }

    console.log(`Mandando requisição para o serviço de usuário ${userServicesUrl}/validate/${userId}`)
    const isValidUser = (await axios.get(`${userServicesUrl}/validate/${userId}`)).data?.isValid;
    if (!isValidUser) {
      res.status(400).json({ message: 'Usuário não existe' });
      return null;
    }

    console.log("Pedindo a URL do serviço de produto")
    const productServicesUrl = await getOtherServiceUrl("product");
    if (!productServicesUrl) {
      res.status(500).json({ message: 'Erro ao buscar URL do serviço de usuários para validar autenticação dos productsIds.' });
      return null;
    }

    console.log(`Checando se produtos existem`);
    console.log(`${productServicesUrl}/validate-payment`);
    const productsAreValid = await axios.post(`${productServicesUrl}/validate-payment`, { productsIds, quantities });
    // console.log(`@@@@@ ${foundProductsList}`); @@@@@ ${foundProductsList[0].id} - ${foundProductsList[0].name}`);
    if (!productsAreValid.data.isValid || !productsAreValid.data.products) {
      res.status(400).json({ message: 'Algum ID de produto inválido' });
      return null;
    }
    const products: Product[] = productsAreValid.data.products;
    // const productNames: string[] = products.map(p => p.name);
    // const productNames: string[] = productsIds.map((id: string) => "Produto com nome " + id);

    console.log(`Iniciando pagamento com PAG seguro`);

    let newCustomer = null;
    let tokenId: string | null = null;

    try {
      const customerClient = new Customer(this.client);
      newCustomer = await customerClient.create({ body: { email: userEmail } });
      console.log(`CUSTOMER GENERATED ${newCustomer.id} ${newCustomer.email}`);
    } catch (e) {
      console.log("Cliente já existe, tentando buscar...");
      try {
        const customerClient = new Customer(this.client);
        newCustomer = await customerClient.get({ customerId: "2311966790-2Tcx9JERKNvrC3" });
        console.log(`CUSTOMER RETRIEVED ${newCustomer.id} ${newCustomer.email}`);
      } catch (err) {
        console.log("ERROR ao obter ou criar cliente:", err);
        res.status(500).json({ message: 'Erro ao processar cliente' });
        return null;
      }
    }

    try {
      const cardTokenClient = new CardToken(this.client);
      const token = await cardTokenClient.create({
        body: {
          card_id: "4235647728025682",
          security_code: "123",
          customer_id: newCustomer.id
        }
      });

      if (!token.id) {
        console.log("ERROR: Token do cartão não foi gerado corretamente.");
        res.status(500).json({ message: 'Erro ao criar token de cartão' });
        return null;
      }

      tokenId = token.id;
      console.log(`CREDIT CARD TOKEN GENERATED ${tokenId}`);
    } catch (e) {
      console.log("ERROR ao criar token de cartão:", e);
      res.status(500).json({ message: 'Erro ao criar token de cartão' });
      return null;
    }

    ////////////////////////////////////////////////////////////////////////////
    // Faz a compra no Mercado Pago
    console.log(`${process.env.PAGSEGURO_REDIRECT_URI}/notify`)

    const paymentPayload = {
      transaction_amount: totalCost,
      description: 'Descrição opicional do pagamento',
      payment_method_id: 'visa',
      installments: 1,
      payer: {
        id: newCustomer.id, // <-- causa resource not found 
        email: userEmail
      },
      token: tokenId,

      callback_url: `${process.env.PAGSEGURO_REDIRECT_URI}/notify`,
      notification_url: `${process.env.PAGSEGURO_REDIRECT_URI}/notify`,
    };

    const startPayment = new StartPayment(this.client);
    startPayment.create({
      body: paymentPayload,
      requestOptions: {
        idempotencyKey: idempotentId
      }
    }).then((res) => {
      console.log("payment success", res);
    }).catch((e) => {
      console.log("payment ERROR", e);
    });

    ////////////////////////////////////////////////////////////////////////////
    // Finaliza criando um timeout e colocando a compra no banco de dados

    await this.pagSeguroRepository.create(userId, idempotentId, productsIds, quantities, unitPrices, totalCost, 'new');

    setTimeout(async () => {
      const ngrok_response = await axios.post(`${process.env.PAGSEGURO_REDIRECT_URI}/notify?topic=payment&id=${idempotentId}`);
    }, 5000);

    res.status(200).json({ message: 'Compra iniciada' });
    return null;
  }

  public async notify(req: Request, res: Response): Promise<Payment | null> {
    const topic = req.params.topic;
    const id = req.params.id;

    console.log(`/ notify Received ${topic} ${id} `);

    // TODO: salvar no banco de dados do prisma/postgresql que compora finalizou

    res.status(200).json({ message: 'Compra finalizada' });
    return null;
  }
}
