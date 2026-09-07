'use client'

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { addItem, cartTotal, EMPTY_CART, itemCount, removeItem, type Cart, type CartItem } from '../model/cart'

/**
 * `'use client'` está AQUI, na folha da árvore, e não no layout raiz.
 *
 * Esta é a decisão de arquitetura número um do App Router, e a que mais gera
 * regressão silenciosa de performance. Um `'use client'` no layout não significa
 * "este arquivo roda no cliente" — significa "este arquivo e **toda a subárvore
 * de componentes que ele importa** vão para o bundle do navegador". Uma diretiva
 * no lugar errado transforma um app inteiro de RSC em SPA, sem nenhum erro.
 *
 * A regra prática: empurre `'use client'` o mais para baixo possível. Um Server
 * Component pode renderizar um Client Component; o contrário não vale — mas um
 * Client Component PODE receber Server Components via `children`, e é assim que
 * se mantém a fronteira baixa mesmo com um provider no topo.
 *
 * Ver o projeto `react-nextjs-performance` para o custo medido disso.
 */

type CartContextValue = {
  cart: Cart
  add: (item: Omit<CartItem, 'quantity'>) => void
  remove: (id: string) => void
  total: ReturnType<typeof cartTotal>
  count: number
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>(EMPTY_CART)

  const add = useCallback((item: Omit<CartItem, 'quantity'>) => {
    setCart((current) => addItem(current, item))
  }, [])

  const remove = useCallback((id: string) => {
    setCart((current) => removeItem(current, id))
  }, [])

  // Memoizar o value é obrigatório em Context: sem isso, todo consumidor
  // re-renderiza a cada render do provider, mesmo sem mudança de dado.
  const value = useMemo<CartContextValue>(
    () => ({ cart, add, remove, total: cartTotal(cart), count: itemCount(cart) }),
    [cart, add, remove],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart precisa estar dentro de <CartProvider>.')
  return context
}
