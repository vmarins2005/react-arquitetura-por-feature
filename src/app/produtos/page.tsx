import { AddToCartButton } from '@/features/cart'
import { getProducts, isPurchasable, ProductGrid } from '@/features/catalog'

/**
 * ROTA FINA — o padrão que este projeto defende.
 *
 * Uma página do App Router deve fazer três coisas e parar:
 *   1. buscar o que a tela precisa
 *   2. compor features
 *   3. definir metadata e fronteiras de Suspense/erro
 *
 * O que ela NÃO deve ter: JSX de negócio, regra de domínio, estado, formulário.
 * Se este arquivo passar de ~50 linhas, algo que pertence a uma feature vazou
 * para a camada de roteamento.
 *
 * O motivo prático: a rota é o único lugar do sistema que legitimamente conhece
 * DUAS features ao mesmo tempo. É aqui que `catalog` e `cart` se encontram — e é
 * por isso que a tradução de `Product` para as props do `AddToCartButton`
 * acontece nesta linha, e não dentro de nenhuma das duas.
 *
 * Manter esse encontro concentrado na rota é o que permite abrir `features/cart`
 * e ter certeza de que nada ali depende de catálogo.
 */
export default async function ProdutosPage() {
  const products = await getProducts()

  return (
    <main>
      <h1>Produtos</h1>
      <p>
        Esta rota compõe duas features independentes. Abra o código: ela tem 1 fetch,
        1 composição e nenhuma regra de negócio.
      </p>

      <ProductGrid
        products={products}
        renderAction={(product) => (
          <AddToCartButton
            id={product.id}
            name={product.name}
            unitPrice={product.price}
            disabled={!isPurchasable(product)}
          />
        )}
      />
    </main>
  )
}
