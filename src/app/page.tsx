import Link from 'next/link'

export default function HomePage() {
  return (
    <main>
      <h1>Arquitetura feature-based</h1>
      <p>
        O código deste projeto é o conteúdo. A aplicação (um catálogo com carrinho)
        existe apenas para dar substância às fronteiras.
      </p>

      <h2>A regra de dependência</h2>
      <pre className="panel" style={{ overflowX: 'auto' }}>
        {`app/        ->  pode importar de features/ e shared/
features/   ->  pode importar de shared/ e da PRÓPRIA feature
            ->  NÃO pode importar de outra feature
shared/     ->  não importa de ninguém acima
`}
      </pre>
      <p>
        Setas apontam sempre para baixo. Uma seta para cima ou lateral é o começo do
        acoplamento que transforma "features" em pastas decorativas.
      </p>

      <h2>Onde olhar</h2>
      <ul>
        <li>
          <code>eslint.config.mjs</code> — as fronteiras acima, transformadas em erro de
          lint. É a parte mais importante do projeto.
        </li>
        <li>
          <code>src/features/catalog/index.ts</code> — API pública de uma feature, e por
          que ela não é <code>export *</code>.
        </li>
        <li>
          <code>src/features/cart/model/cart.ts</code> — por que o carrinho define o
          próprio <code>CartItem</code> em vez de importar <code>Product</code>.
        </li>
        <li>
          <code>src/app/produtos/page.tsx</code> — rota fina: a única camada que conhece
          duas features ao mesmo tempo.
        </li>
        <li>
          <code>src/app/layout.tsx</code> — provider de cliente sem arrastar as páginas
          para o bundle.
        </li>
      </ul>

      <p>
        <Link href="/produtos">Ver a aplicação →</Link>
      </p>
    </main>
  )
}
