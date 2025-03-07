import { Request, Response } from 'express';
import Controller from "../interfaces/Controller";
import SharedState from '../interfaces/SharedState';
import { validateAddProductToCartDto } from '../dto/cart/AddProductToCartDto';
import { Cart } from '@prisma/client';
import CartRepository from '../repository/CartRepository';
import { getOtherServiceUrl } from '../utils/common/getService';
import axios from 'axios';
import ProductRepository from '../repository/ProductRepository';


export default class CartController implements Controller {

  cartRepository: CartRepository = CartRepository.getInstance();
  productRepository: ProductRepository = ProductRepository.getInstance();

  public async execute(req: Request, res: Response, sharedState: SharedState): Promise<Cart | null> {
    if (req.path === '/add-products-to-cart' && req.method === 'POST') {
      return await this.addProductsToCart(req, res);
    }

    res.status(404).json({ message: 'Rota não encontrada' });
    return null;
  }

  public async addProductsToCart(req: Request, res: Response): Promise<Cart | null> {
    const { userId, quantities, productIds } = req.body;

    const isValid = validateAddProductToCartDto(req.body);

    if (!isValid) {
      res.status(400).json({ message: 'Produto inválido' });
      return null;
    }

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

    console.log(`Checando se produtos existem`);
    const foundProductsList = await this.productRepository.getByIds(productIds);
    // console.log(`@@@@@ ${foundProductsList}`); @@@@@ ${foundProductsList[0].id} - ${foundProductsList[0].name}`);
    if (!foundProductsList || foundProductsList.length !== productIds.length) {
      res.status(400).json({ message: 'Algum ID de produto inválido' });
      return null;
    }

    const cartId: string = await this.cartRepository.searchCartByUserId(userId);

    const createdProduct = await this.cartRepository.addProducts(cartId, userId, quantities, productIds);

    res.status(200).json({ message: 'Produto criado com sucesso.', ...createdProduct });

    return createdProduct;
  }
}
