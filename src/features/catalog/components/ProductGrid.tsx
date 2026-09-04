import type { ReactNode } from 'react'
import { formatMoney } from '@/shared/lib/money'
import { isPurchasable, type Product } from '../model/product'

/**
 * Server Component (sem `'use client'`) — o padrão do App Router.
 *
 * Repare no `renderAction`: o catálogo sabe listar produtos, mas **não sabe o
 * que fazer com um deles**. Adicionar ao carrinho é assunto da feature `cart`;
 * comparar é de `comparison`; favoritar é de `wishlist`.
 *
 * Se `ProductGrid` importasse `AddToCartButton`, o catálogo passaria a depender
 * do carrinho, e essa dependência apareceria em toda tela que lista produto —
 * inclusive na do admin, que não tem carrinho nenhum.
 *
 * A saída é ceder a decisão a quem compõe: a rota. Isto é um render prop
 * atravessando a fronteira server → client, o que é permitido porque quem
 * INVOCA a função é um Server Component; o que ela devolve é que vira ilha de
 * cliente. (O contrário — passar função de um Client Component para um Server
 * Component — não é possível: funções não são serializáveis.)
 */
export function ProductGrid(props: {
  products: readonly Product[]
  renderAction?: (product: Product) => ReactNode
}) {
  return (
    <div className="grid cols-2">
      {props.products.map((product) => (
        <article key={product.id} className="panel">
          <h3 style={{ margin: '0 0 0.25rem' }}>{product.name}</h3>
          <p className="muted" style={{ margin: 0 }}>
            {formatMoney(product.price)}
            {isPurchasable(product) ? '' : ' — sem estoque'}
          </p>
          {props.renderAction ? (
            <div style={{ marginTop: '0.75rem' }}>{props.renderAction(product)}</div>
          ) : null}
        </article>
      ))}
    </div>
  )
}
