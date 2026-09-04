import { money, type Money } from '@/shared/lib/money'

/**
 * `model/` — os tipos e regras de negócio da feature. Sem React, sem I/O.
 *
 * Este é o arquivo mais estável da feature e o que outras features podem vir a
 * precisar. Se um dia `cart` e `catalog` compartilharem o conceito de Product,
 * ele sobe para uma camada `entities/` — mas só quando isso acontecer de fato,
 * não por antecipação.
 */

export type ProductId = string & { readonly __brand: 'ProductId' }

export type Product = {
  readonly id: ProductId
  readonly name: string
  readonly price: Money
  readonly stock: number
}

/** Regra de negócio da feature. Pura, testável em milissegundos, sem mock. */
export function isPurchasable(product: Product): boolean {
  return product.stock > 0
}

export function productId(value: string): ProductId {
  return value as ProductId
}

export const CATALOG_FIXTURE: readonly Product[] = [
  { id: productId('p1'), name: 'Teclado 60%', price: money(34900), stock: 12 },
  { id: productId('p2'), name: 'Mouse vertical', price: money(21900), stock: 0 },
  { id: productId('p3'), name: 'Monitor 27 QHD', price: money(189900), stock: 4 },
  { id: productId('p4'), name: 'Fone com ANC', price: money(129900), stock: 7 },
]
