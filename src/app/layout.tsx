import type { Metadata } from 'next'
import Link from 'next/link'
import { CartBadge, CartProvider } from '@/features/cart'
import './globals.css'

export const metadata: Metadata = {
  title: 'Arquitetura feature-based',
  description: 'Organização por feature, fronteiras explícitas e rotas finas',
}

/**
 * O layout raiz é um SERVER COMPONENT, apesar de renderizar `<CartProvider>`,
 * que é um Client Component.
 *
 * O detalhe que faz isso funcionar — e que é pergunta clássica de entrevista:
 * `{children}` é passado como **prop** para o provider. Um Client Component pode
 * receber Server Components via `children` e renderizá-los, porque nesse
 * momento eles já foram renderizados no servidor e chegam como árvore pronta.
 *
 * Se em vez disso o provider IMPORTASSE as páginas, elas seriam arrastadas para
 * o bundle do cliente. A diferença entre as duas situações é sutil no código e
 * enorme no resultado.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <CartProvider>
          <header
            style={{
              borderBottom: '1px solid var(--border)',
              padding: '0.75rem 1rem',
            }}
          >
            <nav className="row" style={{ maxWidth: '62rem', margin: '0 auto' }}>
              <Link href="/">Início</Link>
              <Link href="/produtos">Produtos</Link>
              <Link href="/checkout">Checkout</Link>
              <span style={{ marginLeft: 'auto' }}>
                <CartBadge />
              </span>
            </nav>
          </header>
          {children}
        </CartProvider>
      </body>
    </html>
  )
}
