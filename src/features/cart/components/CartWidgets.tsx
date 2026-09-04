'use client'

import { formatMoney, type Money } from '@/shared/lib/money'
import { useCart } from '../store/CartProvider'

/**
 * Componentes de cliente da feature `cart`.
 *
 * Repare no formato das props de `AddToCartButton`: `id`, `name` e `unitPrice`,
 * primitivos e mínimos. Ele **não** recebe um `Product`.
 *
 * Isso não é purismo. É o que permite que a rota de checkout, a wishlist e um
 * futuro "comprar de novo" a partir do histórico usem o mesmo botão, sem que a
 * feature `cart` precise conhecer nenhum desses domínios.
 */

export function AddToCartButton(props: {
  id: string
  name: string
  unitPrice: Money
  disabled?: boolean
}) {
  const { add } = useCart()

  return (
    <button
      onClick={() => add({ id: props.id, name: props.name, unitPrice: props.unitPrice })}
      disabled={props.disabled ?? false}
    >
      {props.disabled ? 'Indisponível' : 'Adicionar'}
    </button>
  )
}

export function CartSummary() {
  const { cart, remove, total, count } = useCart()

  if (count === 0) return <p className="muted">Carrinho vazio.</p>

  return (
    <div>
      <ul style={{ paddingLeft: '1.1rem' }}>
        {cart.items.map((item) => (
          <li key={item.id}>
            {item.name} x{item.quantity} — {formatMoney(item.unitPrice)}{' '}
            <button onClick={() => remove(item.id)} aria-label={`Remover ${item.name}`}>
              remover
            </button>
          </li>
        ))}
      </ul>
      <p>
        <strong>Total: {formatMoney(total)}</strong>
      </p>
    </div>
  )
}

export function CartBadge() {
  const { count } = useCart()
  return <span className="tag">carrinho: {count}</span>
}
