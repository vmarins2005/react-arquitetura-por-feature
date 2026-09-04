/**
 * API PÚBLICA da feature `cart`.
 *
 * Compare com o que NÃO está aqui: `addItem`, `removeItem`, `cartTotal`,
 * `EMPTY_CART`. Essas funções existem em `model/cart.ts`, são testadas, e são
 * puramente internas — ninguém de fora deve manipular o carrinho diretamente.
 *
 * A regra que orienta o que exportar: **exponha capacidades, não estruturas.**
 * "Adicionar ao carrinho" é capacidade. "A função que transforma um objeto Cart
 * em outro" é estrutura, e expô-la permitiria que outra feature construísse um
 * carrinho paralelo, fora do provider — que é exatamente o bug que ninguém
 * consegue rastrear seis meses depois.
 */

export { CartProvider, useCart } from './store/CartProvider'
export { AddToCartButton, CartSummary, CartBadge } from './components/CartWidgets'
export type { CartItem } from './model/cart'
