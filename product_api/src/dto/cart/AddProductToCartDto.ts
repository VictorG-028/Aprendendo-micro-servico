export default interface AddProductToCartDto {
  userId: string;
  productIds: string[];
  quantities: number;
}

export function validateAddProductToCartDto(dto: any): dto is AddProductToCartDto {
  return (
    typeof dto === 'object' &&
    dto !== null &&
    typeof dto.userId === 'string' &&
    dto.userId.trim() !== '' &&
    Array.isArray(dto.productIds) && // Verifica se productIds é um array
    dto.productIds.every((id: any) => typeof id === 'string' && id.trim() !== '') && // Cada item de productIds deve ser string
    Array.isArray(dto.quantities) && // Verifica se quantities é um array
    dto.quantities.every((quantity: any) => typeof quantity === 'number' && !isNaN(quantity) && quantity >= 0) && // Cada item de quantities deve ser number
    dto.productIds.length === dto.quantities.length // productIds e quantities devem ter o mesmo tamanho
  );
}
