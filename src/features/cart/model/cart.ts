import { addMoney, money, multiplyMoney, type Money } from '@/shared/lib/money'

/**
 * O modelo do carrinho define seu PRÓPRIO item — e isso é intencional.
 *
 * `CartItem` não é `Product`. O carrinho precisa de id, nome, preço e
 * quantidade; ele não precisa de estoque, categoria, descrição, avaliações nem
 * de nada que o catálogo venha a acrescentar.
 *
 * Se `cart` importasse `Product` de `catalog`, teríamos:
 *   - acoplamento entre duas features que deveriam evoluir independentemente
 *   - o carrinho quebrando quando o catálogo mudar um campo que ele nem lê
 *   - impossibilidade de adicionar ao carrinho algo que não seja produto de
 *     catálogo (um plano, um serviço, um item de wishlist)
 *
 * É o mesmo raciocínio do ISP, aplicado na escala de features em vez de
 * componentes. Quem faz a tradução de `Product` para `CartItem` é a **rota**,
 * que é o único lugar que legitimamente conhece as duas.
 */

export type CartItem = {
  readonly id: string
  readonly name: string
  readonly unitPrice: Money
  readonly quantity: number
}

export type Cart = { readonly items: readonly CartItem[] }

export const EMPTY_CART: Cart = { items: [] }

export function addItem(cart: Cart, item: Omit<CartItem, 'quantity'>): Cart {
  const existing = cart.items.find((i) => i.id === item.id)
  if (existing) {
    return {
      items: cart.items.map((i) =>
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
      ),
    }
  }
  return { items: [...cart.items, { ...item, quantity: 1 }] }
}

export function removeItem(cart: Cart, id: string): Cart {
  return { items: cart.items.filter((item) => item.id !== id) }
}

export function cartTotal(cart: Cart): Money {
  return cart.items.reduce(
    (total, item) => addMoney(total, multiplyMoney(item.unitPrice, item.quantity)),
    money(0),
  )
}

export function itemCount(cart: Cart): number {
  return cart.items.reduce((count, item) => count + item.quantity, 0)
}
