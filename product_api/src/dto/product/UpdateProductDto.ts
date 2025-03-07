

export default interface UpdateProductDto {
  id: string;
  newProduct: {
    name?: string;
    price?: number;
    quantity?: number;
  };
}

export function validateUpdateProductDto(dto: any): dto is UpdateProductDto {
  return (
    typeof dto === 'object' &&
    dto !== null &&
    typeof dto.id === 'string' &&
    dto.id.trim() !== '' && // Verifica se o ID não está vazio
    typeof dto.newProduct === 'object' &&
    dto.newProduct !== null &&
    (
      dto.newProduct.name === undefined || (typeof dto.newProduct.name === 'string' && dto.newProduct.name.trim() !== '')
    ) &&
    (
      dto.newProduct.price === undefined || (typeof dto.newProduct.price === 'number' && !isNaN(dto.newProduct.price) && dto.newProduct.price >= 0)
    ) &&
    (
      dto.newProduct.quantity === undefined || (typeof dto.newProduct.quantity === 'number' && !isNaN(dto.newProduct.quantity) && dto.newProduct.quantity >= 0)
    )
  );
}
