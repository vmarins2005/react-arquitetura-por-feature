/**
 * API PÚBLICA da feature `catalog`.
 *
 * Este arquivo é a **única** porta de entrada permitida. Nenhum código fora de
 * `features/catalog/` pode importar de `features/catalog/model/...` ou
 * `features/catalog/api/...` — a regra está no `eslint.config.mjs` e quebra o
 * lint, não depende de disciplina.
 *
 * Por que isso importa:
 *
 *   - **Refatoração interna deixa de ser breaking change.** Renomear uma pasta,
 *     dividir um arquivo ou trocar a fonte de dados não afeta ninguém, desde que
 *     este contrato continue valendo.
 *   - **A superfície fica visível.** Este arquivo é a resposta à pergunta "o que
 *     esta feature oferece?". Se ele tem 40 exports, a feature não tem foco.
 *   - **Acoplamento vira algo mensurável.** Dá para contar quem importa daqui.
 *
 * Note a diferença crucial para um barrel file convencional: NÃO é
 * `export * from './everything'`. Barrel que reexporta tudo quebra tree-shaking,
 * cria ciclos de import e, principalmente, deixa de ser um contrato — se tudo é
 * público, não existe interno para proteger.
 *
 * Exporte o mínimo. Um export a mais aqui é um acoplamento a mais para sempre.
 */

export { ProductGrid } from './components/ProductGrid'
export { getProducts, getProductById } from './api/getProducts'
export { isPurchasable, type Product, type ProductId } from './model/product'
