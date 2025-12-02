export enum CurrencyType {
  USD = 'USD',
  CAD = 'CAD',
  EUR = 'EUR',
}

export const CurrencySign = {
  [CurrencyType.USD]: '$',
  [CurrencyType.CAD]: 'CA$',
  [CurrencyType.EUR]: '€',
};
