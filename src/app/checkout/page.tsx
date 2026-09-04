import { CartSummary } from '@/features/cart'

export default function CheckoutPage() {
  return (
    <main>
      <h1>Checkout</h1>
      <p>
        Outra rota fina: ela só monta a feature. Note que o carrinho sobrevive à
        navegação porque o provider está no layout, e o layout não é remontado entre
        rotas do mesmo segmento.
      </p>
      <div className="panel">
        <CartSummary />
      </div>
    </main>
  )
}
