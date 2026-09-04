import 'server-only'
import { CATALOG_FIXTURE, type Product } from '../model/product'

/**
 * `api/` — acesso a dado da feature. Roda **apenas no servidor**.
 *
 * O import de `server-only` no topo é uma proteção de arquitetura, não um
 * detalhe: se alguém importar este módulo a partir de um Client Component, o
 * build QUEBRA com uma mensagem clara, em vez de vazar credencial para o bundle
 * do navegador.
 *
 * Esse é o tipo de fronteira que você quer que a ferramenta garanta. Regras de
 * arquitetura que dependem de disciplina humana sobrevivem ao primeiro sprint
 * apertado; regras que quebram o build sobrevivem ao time inteiro.
 *
 * O pacote irmão é `client-only`, para o caminho oposto (módulo que toca
 * `window` e nunca deve ser importado no servidor).
 */
export async function getProducts(): Promise<readonly Product[]> {
  // Em produção: fetch numa API, query no banco, chamada a um serviço.
  // Aqui, latência simulada para que o streaming do projeto de performance
  // tenha algo visível para mostrar.
  await new Promise((resolve) => setTimeout(resolve, 300))
  return CATALOG_FIXTURE
}

export async function getProductById(id: string): Promise<Product | null> {
  const products = await getProducts()
  return products.find((product) => product.id === id) ?? null
}
