

export default interface StartPaymentDto {
  idempotentId: string
  userId: string
  userEmail: string
  productsIds: string[]
  quantities: number[]
  unitPrices: number[]
  totalCost: number
}

export function validateStartPaymentDto(dto: any): dto is StartPaymentDto {
  return (
    typeof dto === 'object' &&
    dto !== null &&
    typeof dto.idempotentId === 'string' &&
    dto.idempotentId.trim() !== '' && // Verifica se o nome não está vazio após remover espaços em branco
    typeof dto.userId === 'string' &&
    dto.userId.trim() !== '' && // Verifica se o nome não está vazio após remover espaços em branco
    typeof dto.userEmail === 'string' &&
    dto.userEmail.trim() !== '' && // Verifica se o nome não está vazio após remover espaços em branco
    Array.isArray(dto.productsIds) && // Verifica se productsIds é um array
    dto.productsIds.every((id: any) => typeof id === 'string' && id.trim() !== '') && // Cada item de productsIds deve ser string
    Array.isArray(dto.quantities) && // Verifica se quantities é um array
    dto.quantities.every((price: any) => typeof price === 'number' && price >= 0) && // Cada item de quantities deve ser string
    Array.isArray(dto.unitPrices) && // Verifica se unitPrices é um array
    dto.unitPrices.every((price: any) => typeof price === 'number' && price >= 0) && // Cada item de unitPrices deve ser string
    typeof dto.totalCost === 'number' &&
    !isNaN(dto.totalCost) && // Verifica se o preço é um número válido (não NaN)
    dto.totalCost >= 0 // Verifica se o preço é maior ou igual a zero
  );
}
