export default interface CreateProductDto {
  name: string;
  price: number;
  quantity: number;
}

export function validateCreateProductDto(dto: any): dto is CreateProductDto {
  return (
    typeof dto === 'object' &&
    dto !== null &&
    typeof dto.name === 'string' &&
    dto.name.trim() !== '' && // Verifica se o nome não está vazio após remover espaços em branco
    typeof dto.price === 'number' &&
    !isNaN(dto.price) && // Verifica se o preço é um número válido (não NaN)
    dto.price >= 0 && // Verifica se o preço é maior ou igual a zero
    typeof dto.quantity === 'number' &&
    !isNaN(dto.quantity) && // Verifica se a quantidade é um número válido
    dto.quantity >= 0 // Verifica se a quantidade é maior ou igual a zero
  );
}
