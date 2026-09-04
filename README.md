# Arquitetura feature-based

> **Stack:** Next.js 15 (App Router) + React 19 + TypeScript strict + ESLint 9
> **Conceito:** organização por feature, API pública por feature, e fronteiras
> garantidas por ferramenta em vez de disciplina

---

## O problema que este projeto ataca

A estrutura padrão que quase todo projeto React começa é organizada por **tipo de
arquivo**:

```
src/
  components/   ← 200 arquivos
  hooks/        ← 60 arquivos
  utils/        ← o cemitério
  services/
  types/
```

Ela parece organizada e não é. O sintoma aparece na primeira manutenção real:
**para mexer em uma feature você abre seis pastas**, e para saber se pode apagar
um arquivo você precisa buscar no repositório inteiro. Não existe fronteira, logo
não existe informação sobre o que depende do quê — e o acoplamento cresce sem que
ninguém veja acontecer.

A organização por **feature** inverte isso: o critério de agrupamento passa a ser
"o que muda junto", que é o único critério que se sustenta ao longo do tempo.

Mas trocar as pastas de lugar não resolve nada sozinho. Sem fronteiras
garantidas, `features/` vira uma pasta decorativa em três meses — alguém importa
`features/cart/model/cart` de dentro de `catalog` num sprint apertado, ninguém
percebe no review, e o acoplamento voltou. **É por isso que o coração deste
projeto é o `eslint.config.mjs`, não a árvore de diretórios.**

---

## Rodando

```bash
npm install
npm run dev
```

O que realmente importa aqui é o lint:

```bash
npm run lint
```

---

## A regra de dependência

```
app/        →  pode importar de features/ e shared/
features/   →  pode importar de shared/ e da própria feature
            →  NÃO pode importar do interior de outra feature
shared/     →  não importa de ninguém acima
```

Setas apontam sempre para baixo. Uma seta lateral ou para cima é o começo do
acoplamento que anula a arquitetura inteira.

### A convenção que faz isso ser verificável

- **Dentro** de uma feature: imports **relativos** (`../model/product`)
- **Entre** camadas: imports por **alias** (`@/features/catalog`)

Não é preferência estética. É o que permite ao ESLint distinguir acesso interno
de acesso externo olhando só o caminho, sem plugin nem análise de grafo.

---

## Onde olhar, em ordem

1. **`eslint.config.mjs`** — as fronteiras viram erro de CI. Leia os comentários,
   inclusive a seção final sobre o que essas regras **não** pegam.

2. **`src/features/catalog/index.ts`** — API pública de uma feature, e por que
   ela não é `export *`. Um export a mais aqui é um acoplamento a mais para
   sempre.

3. **`src/features/cart/model/cart.ts`** — por que o carrinho define o próprio
   `CartItem` em vez de importar `Product` do catálogo. É ISP na escala de
   features.

4. **`src/features/catalog/components/ProductGrid.tsx`** — como uma feature cede
   uma decisão que não é dela (`renderAction`) em vez de importar outra feature.

5. **`src/app/produtos/page.tsx`** — rota fina. A rota é a única camada que
   legitimamente conhece duas features ao mesmo tempo.

6. **`src/app/layout.tsx`** — provider de cliente no layout **sem** arrastar as
   páginas para o bundle. A explicação de `children` como prop está no arquivo.

7. **`src/features/catalog/api/getProducts.ts`** — `import 'server-only'` como
   fronteira garantida pelo build, não por convenção.

---

## Comparação com FSD (Feature-Sliced Design)

FSD é a formalização mais adotada dessa ideia no mundo React, e vale conhecer o
vocabulário porque ele aparece em entrevista e em RFC de time:

| Camada FSD | Papel | Neste projeto |
|---|---|---|
| `app` | inicialização, providers, roteamento | `src/app/` |
| `pages` | uma tela completa | `src/app/*/page.tsx` |
| `widgets` | blocos compostos, reutilizáveis entre páginas | não usado (ainda não há necessidade) |
| `features` | ação do usuário com valor de negócio | `src/features/` |
| `entities` | conceitos de domínio compartilhados entre features | não usado (ainda não há necessidade) |
| `shared` | código sem domínio | `src/shared/` |

Adotamos a versão reduzida de propósito. `entities` e `widgets` só se pagam
quando existe compartilhamento real — criá-las vazias é a mesma antecipação que
o projeto [quando-abstrair](https://github.com/vmarins2005/quando-abstrair) discute. O gatilho para introduzir `entities` está
documentado no ADR-001.

---

## Decisões documentadas

- [ADR-001 — Organizar por feature, com FSD reduzido](./docs/ADR-001-feature-based-com-fsd-reduzido.md)
- [ADR-002 — Garantir fronteiras por lint, não por convenção](./docs/ADR-002-fronteiras-garantidas-por-lint.md)

---

## Exercícios

1. **Veja a fronteira funcionar.** Em `src/features/cart/model/cart.ts`, adicione
   `import { Product } from '@/features/catalog/model/product'`. Rode
   `npm run lint`. Leia a mensagem de erro — ela foi escrita para ensinar, não só
   para bloquear.

2. **Descubra o buraco.** Agora tente `import { Product } from '@/features/catalog'`
   (pela API pública). O lint **passa**. Isso é intencional e está documentado no
   fim do `eslint.config.mjs`. Decida se o seu time quer permitir isso, e escreva
   o ADR com a decisão — inclusive se for "permitir".

3. **Sinta o custo do `'use client'` no lugar errado.** Rode `npm run build` e
   anote o tamanho do First Load JS de `/produtos`. Depois mova `'use client'`
   para o topo de `layout.tsx` e rode de novo. A diferença é o preço de uma
   diretiva mal colocada.

4. **Prove o `server-only`.** Importe `getProducts` dentro de
   `CartWidgets.tsx` (que é Client Component). O build quebra, com mensagem
   explícita. Agora imagine esse mesmo arquivo lendo `process.env.DATABASE_URL`.

5. **Adicione uma feature.** Crie `features/wishlist` com o mesmo desenho:
   `model/`, `components/`, `index.ts` enxuto. Adicione o botão de favoritar na
   página de produtos **sem** que `catalog` ou `cart` saibam que wishlist existe.
   Se você precisou tocar em alguma das duas, a fronteira estava no lugar errado.

6. **O exercício de tech lead.** Pegue o repositório onde você trabalha hoje,
   desenhe o grafo de dependências entre pastas de primeiro nível, e encontre a
   primeira seta que aponta para cima ou para o lado. Escreva o ADR que
   proibiria essa seta e — a parte difícil — o plano de migração incremental que
   não exige parar o roadmap.

---

## Armadilha comum

Feature-based não é sobre pastas. É sobre **onde o acoplamento pode existir**.

Um projeto com `features/` impecável e imports cruzados por toda parte é pior que
um projeto honestamente organizado por tipo — porque cria a ilusão de fronteira
onde não há nenhuma, e ninguém vai medir de novo.

Se você adotar só uma coisa deste projeto, adote o `eslint.config.mjs`.


---

## Faz parte de uma série

16 projetos independentes, um por conceito, sobre o que separa um dev pleno de um
senior/tech lead em React e Next.js. Cada um tem README, ADRs documentando as
decisões, e exercícios.

| Projeto | Conceito |
|---|---|
| [react-solid-na-pratica](https://github.com/vmarins2005/react-solid-na-pratica) | Os 5 principios SOLID traduzidos para componentes React, com anti-exemplo e versao boa lado a lado |
| [quando-abstrair](https://github.com/vmarins2005/quando-abstrair) | A mesma feature em 3 versoes: duplicada, abstraida cedo demais, e abstraida na hora certa |
| [padroes-de-componentes-react](https://github.com/vmarins2005/padroes-de-componentes-react) | Compound, headless, slots, state reducer e estado controlavel: como absorver variacao sem explodir em props |
| `arquitetura-por-feature` **(você está aqui)** | Organizacao por feature em Next.js, com fronteiras garantidas por ESLint em vez de disciplina |
| [regra-de-negocio-no-front](https://github.com/vmarins2005/regra-de-negocio-no-front) | Clean Architecture no front: dominio puro, portas e adaptadores, sem uma linha de React no nucleo |
| [onde-mora-o-estado](https://github.com/vmarins2005/onde-mora-o-estado) | Os 6 tipos de estado em React e a ferramenta certa para cada um |
| [estados-impossiveis](https://github.com/vmarins2005/estados-impossiveis) | Da sopa de booleanos ao XState: tornar estados invalidos inexprimiveis |
| [typescript-na-fronteira](https://github.com/vmarins2005/typescript-na-fronteira) | Tipo nao existe em runtime: validacao com Zod, branded types e verificacao de exaustividade |
| [testes-que-valem-a-pena](https://github.com/vmarins2005/testes-que-valem-a-pena) | Testing Trophy com Vitest, Testing Library, MSW, Playwright e axe |
| [performance-no-next](https://github.com/vmarins2005/performance-no-next) | Waterfalls de requisicao, streaming com Suspense e o que RSC realmente economiza de bundle |
| [entendendo-o-cache-do-next](https://github.com/vmarins2005/entendendo-o-cache-do-next) | As 4 camadas de cache do App Router e como diagnosticar dado velho na tela |
| [acessibilidade-na-pratica](https://github.com/vmarins2005/acessibilidade-na-pratica) | WCAG 2.2 AA em React: foco, teclado, live regions e os requisitos invisiveis em code review |
| [seguranca-no-next](https://github.com/vmarins2005/seguranca-no-next) | Server Action e endpoint publico: autorizacao, validacao, rate limit e CSP com nonce |
| [quando-quebra-em-producao](https://github.com/vmarins2005/quando-quebra-em-producao) | Taxonomia de erros, error boundaries, log estruturado e feature flags com kill switch |
| [design-system-em-monorepo](https://github.com/vmarins2005/design-system-em-monorepo) | Design system como pacote versionado: Turborepo, design tokens e changesets |
| [commits-que-contam-historia](https://github.com/vmarins2005/commits-que-contam-historia) | Commit atomico e Conventional Commits, com historico curado e um bug para achar via git bisect |
