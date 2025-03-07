import { Request, Response } from 'express';
import Controller from "../interfaces/Controller";
import ProcessPaymentStrategy from '../interfaces/pattern/Strategy';
import SharedState from '../interfaces/SharedState';
import { Payment } from '@prisma/client';
import { Customer, CustomerCard, MercadoPagoConfig, OAuth, Preference, Payment as StartPayment, CardToken, User } from 'mercadopago';
import PaymentCreateRequest from 'mercadopago';
import PagSeguroRepository from '../repository/PagSeguroRepository';
import StartPaymentDto, { validateStartPaymentDto } from '../dto/StartPaymentDto';
import { getOtherServiceUrl } from '../utils/common/getService';
import axios from 'axios';


interface Product {
  id: string;
  name: string;
  price: number; // float
  quantity: number; // int
}


class HandleCreatenNewPayment implements ProcessPaymentStrategy {

  public handlePayment(o: Payment): void {
  }
}


class HandleRepeatedPayment implements ProcessPaymentStrategy {

  public handlePayment(o: Payment): void {
  }

}

class PaymentContext {
  private strategy: ProcessPaymentStrategy;

  constructor(paymentStatus: string) {

    if (paymentStatus === 'new') {
      this.strategy = new HandleCreatenNewPayment();
    } else if (paymentStatus === 'repeated') {
      this.strategy = new HandleRepeatedPayment();
    } else {
      throw new Error('Invalid payment status');
    }
  }

  public setStrategy(strategy: ProcessPaymentStrategy) {
    this.strategy = strategy;
  }

  public getStrategy(): ProcessPaymentStrategy {
    return this.strategy;
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
    /*
    const isValid = validateStartPaymentDto(req.body);
    if (!isValid) {
      res.status(400).json({ message: 'Informações de pagamento inválidas' });
      return null;
    }

    if (this.client.options) this.client.options.idempotencyKey = req.body.idempotentId;
    else this.client.options = { timeout: 5000, idempotencyKey: req.body.idempotentId };

    // TODO: tratar pagamentos repetidos aqui
    const foundCopy = await this.pagSeguroRepository.getById(idempotentId);
    const context = new PaymentContext(foundCopy ? "new" : "repeated");

    context.getStrategy().handlePayment(undefined as any);

    // TODO: validar userId
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
    const productNames: string[] = products.map(p => p.name);
    // const productNames: string[] = productsIds.map((id: string) => "Produto com nome " + id);
    */
    console.log(`Iniciando pagamento com PAG seguro`);

    const customerClient = new Customer(this.client);
    // const newCustomer = await customerClient.create({ body: { email: "victor6g0@gmail.com" } });
    const newCustomer = await customerClient.create({ body: { email: "test_user_1895754264@testuser.com" } });
    // const newCustomer = await customerClient.get({ customerId: "2311966790-2Tcx9JERKNvrC3" });
    console.log(`NEW CUSTOMER ${newCustomer.id} ${newCustomer.email} ${newCustomer.metadata} ${newCustomer.cards?.[0]} `);

    // const userClient = new User(this.client);
    // const something = await userClient.get({ requestOptions: { testToken: true } });
    // console.log(`NEW SOMETHING ${something.id} ${something.api_response.headers} ${something.email} ${something.identification} `);

    const cardTokenClient = new CardToken(this.client);
    const token = await cardTokenClient.create({ body: { card_id: "5031433215406351", security_code: "123", customer_id: "2311966790-2Tcx9JERKNvrC3" } });
    console.log(`NEW TOKEN ${token.id} ${token} ${token} ${token}`);

    const cardCostumer = await customerClient.getCard({ cardId: "4235647728025682", customerId: "test_user_1895754264" });
    console.log(`NEW CARD 4 ${cardCostumer.id} ${cardCostumer.api_response} ${cardCostumer.payment_method} ${cardCostumer.user_id} `);

    // const card3 = await customerClient.createCard({ customerId: newCustomer.id || "", body: { token: token.id } });
    // console.log(`NEW CARD 3 ${card3.id} ${card3.api_response} ${card3.payment_method} ${card3.user_id} `);

    // const newCard = await customerClient.getCard({ customerId: "2311966790-2Tcx9JERKNvrC3", cardId: "5031433215406351" });
    // console.log(`NEW CARD 1 ${newCard.id} ${newCard.api_response} ${newCard.payment_method} ${newCard.user_id} `);

    // if (newCustomer.cards && newCustomer.cards[0].body) {
    // const token = newCustomer.cards[0].body.token;
    // const customerCard = new CustomerCard(this.client);
    // const newCustomerCard = await customerCard.create({
    //   customerId: newCustomer.id as string,
    //   body: {
    //     token: "testando"
    //   }
    // });
    // console.log(`${newCustomerCard.id} ${newCustomerCard.payment_method} ${newCustomer.api_response} `);
    // }
    // const itemExample = {
    //   id: productsIds[0], // id: 92190211,
    //   title: productNames[0],
    //   quantity: quantities[0],
    //   unit_price: unitPrices[0],
    //   // currency_id: 'BRL',
    //   picture_url: "https://http2.mlstatic.com/resources/frontend/statics/growth-sellers-landings/device-mlb-point-i_medium2x.png",
    // }
    // const preferenceClient = new Preference(this.client);
    // const createdProducts = await preferenceClient.create({
    //   body: {
    //     items: [
    //       itemExample
    //     ],
    //     back_urls: {
    //       "success": `${ process.env.PAGSEGURO_REDIRECT_URI }/notify}`,
    //       "failure": `${ process.env.PAGSEGURO_REDIRECT_URI }/notify}`,
    //       "pending": `${ process.env.PAGSEGURO_REDIRECT_URI }/notify}`
    //     },
    //     auto_return: "approved",
    //   }
    // })
    // console.log(`CREATED PRODUCTS RESPONSE @@@${ createdProducts } `)

    // let clientCards: CustomerCardResponse[] = [{ id: "123", api_response: { status: 200, headers: ["", [""]] } }];
    // try {
    //   clientCards = await customerClient.listCards({ customerId: 'user_1' })
    // } catch (e) {
    //   console.log("error", e);
    // }

    // TODO: pegar token (depende de conta teste compradora e cartão teste)
    // const getCreditCardPayload = {
    //   card_number: "5031433215406351",
    //   cardholder: {
    //     name: "test_user_1895754264",
    //     identification: {
    //       type: "CPF",
    //       number: "73106030445"
    //     }
    //   },
    //   security_code: "123",
    //   expiration_month: 11,
    //   expiration_year: 2030
    // }
    // const customerCardClient = new CustomerCard(this.client);
    // const card2 = await customerCardClient.get({ customerId: "2311966790-2Tcx9JERKNvrC3", cardId: "5031433215406351" });
    // console.log(`NEW CARD 2 ${card2.id} ${card2.api_response} ${card2.payment_method} ${card2.cardholder}`);
    // await customerCardClient.create({
    //   customerId: 'A83Du21UaW',
    //   body: getCreditCardPayload
    // });


    // TODO: realizar pagamento com as informações mínimas (depende de token)
    const paymentPayload = {
      // additional_info: {
      //   shipments: {
      //     receiver_address: {
      //       zip_code: "29092270",
      //       street_name: "rua das flores",
      //       city_name: "cidade flores",
      //       state_name: "ES",
      //       street_number: "312"
      //     }
      //   },
      //   items: [
      //     itemExample
      //   ],
      //   payer: {
      //     first_name: "test_user_1895754264",
      //     last_name: "test",
      //     email: "test_user_1895754264@testuser.com",
      //     identification: {
      //       type: "CPF",
      //       number: "73106030445"
      //     },
      //     phone: {
      //       area_code: 11,
      //       number: "991881199"
      //     },
      //     address: {
      //       zip_code: "29092270",
      //       street_name: "rua das flores",
      //       street_number: "312"
      //     }
      //   }
      // },
      transaction_amount: totalCost,
      description: 'Teste de pagamento',
      // external_reference: "Texto qualquer aqui",
      payment_method_id: 'master',
      installments: 1,
      payer: {
        id: newCustomer.id,
        email: "victor6g0@gmail.com",
        identification: {
          number: '73106030445',
          type: 'CPF',
        },
      },
      token: token.id,
      // payer: {
      //   first_name: "test_user_1895754264",
      //   last_name: "test",
      //   // type: 'customer',
      //   // id: userId,
      //   email: "test_user_1895754264@testuser.com",
      //   identification: {
      //     type: "CPF",
      //     number: "73106030445"
      //   },
      //   address: {
      //     zip_code: "29092270",
      //     street_name: "rua das flores",
      //     street_number: "312",
      //     neighborhood: "bairro das flores",
      //     city: "cidade das flores",
      //     federal_unit: "ES"
      //   }
      // },
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

    // TODO: salvar no banco de dados do prisma/postgresql

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
