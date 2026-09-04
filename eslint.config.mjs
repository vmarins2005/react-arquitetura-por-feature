import js from '@eslint/js'
import tseslint from 'typescript-eslint'

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  A PARTE MAIS IMPORTANTE DESTE PROJETO.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Um diagrama de arquitetura no Notion tem meia-vida de dois sprints. O que
 * sobrevive é o que quebra o build.
 *
 * As regras abaixo transformam a regra de dependência em erro de lint. A
 * diferença prática: um PR que viola a arquitetura não chega à revisão humana
 * precisando de uma conversa sobre princípios — ele simplesmente falha no CI,
 * com uma mensagem que explica o que fazer.
 *
 * Isso muda a natureza da discussão no time. Deixa de ser "o tech lead prefere
 * assim" e passa a ser uma regra objetiva, versionada, que qualquer pessoa pode
 * questionar num PR — porque está escrita, e não na cabeça de alguém.
 *
 * ───────────────────────────────────────────────────────────────────────────
 * A CONVENÇÃO QUE FAZ AS REGRAS FUNCIONAREM
 *
 *   - DENTRO de uma feature: imports RELATIVOS  (`../model/product`)
 *   - ENTRE camadas:         imports por ALIAS  (`@/features/catalog`)
 *
 * Não é preferência estética. É o que permite ao lint distinguir "acesso
 * interno" de "acesso externo" olhando apenas o caminho do import — sem
 * precisar de plugin nem de análise de grafo.
 * ───────────────────────────────────────────────────────────────────────────
 *
 * Em produção, considere `eslint-plugin-boundaries`, que expressa isso de forma
 * declarativa e cobre casos que `no-restricted-imports` não cobre (import
 * dinâmico, reexport transitivo). Aqui usamos a regra nativa de propósito: zero
 * dependência extra, e você entende exatamente o que está acontecendo.
 */

const NAO_ATRAVESSE_A_API_PUBLICA = [
  'Importe features pela API pública: `@/features/<nome>`, nunca por um caminho interno.',
  'O caminho interno é detalhe de implementação e pode mudar sem aviso.',
  'Se o que você precisa não está exportado no index.ts da feature, essa é a discussão a ter —',
  'e ela deve acontecer num PR, não num import.',
].join(' ')

const SHARED_NAO_CONHECE_DOMINIO = [
  '`shared/` não pode importar de `features/` nem de `app/`.',
  'Se este arquivo precisa de algo de uma feature, ele não é shared:',
  'mova-o para dentro da feature que o usa.',
].join(' ')

const FEATURE_NAO_CONHECE_ROTA = [
  'Uma feature não deve importar de `app/`. A dependência é ao contrário:',
  'a rota compõe features. Se você precisa de algo da rota, receba por prop.',
].join(' ')

export default tseslint.config(
  { ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts'] },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  // ── Camada shared ────────────────────────────────────────────────────────
  // É a base da pirâmide: não conhece ninguém acima dela.
  {
    files: ['src/shared/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['@/features/*', '@/app/*'], message: SHARED_NAO_CONHECE_DOMINIO },
          ],
        },
      ],
    },
  },

  // ── Camada features ──────────────────────────────────────────────────────
  // Pode usar shared e a si mesma (por caminho relativo). Não pode espiar o
  // interior de outra feature nem depender da camada de rotas.
  {
    files: ['src/features/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            // `@/features/catalog/model/product` -> bloqueado.
            // `@/features/catalog`               -> permitido (API pública).
            { group: ['@/features/*/*'], message: NAO_ATRAVESSE_A_API_PUBLICA },
            { group: ['@/app/*'], message: FEATURE_NAO_CONHECE_ROTA },
          ],
        },
      ],
    },
  },

  // ── Camada app (rotas) ───────────────────────────────────────────────────
  // Pode compor qualquer feature, mas só pela porta da frente.
  {
    files: ['src/app/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [{ group: ['@/features/*/*'], message: NAO_ATRAVESSE_A_API_PUBLICA }],
        },
      ],
    },
  },
)

/**
 * O QUE ESTAS REGRAS **NÃO** PEGAM — e é honesto saber:
 *
 *  1. Uma feature importando outra pela API pública (`@/features/cart` dentro de
 *     `features/catalog`). Isso é permitido aqui de propósito: às vezes é
 *     legítimo. Se você quiser proibir totalmente, adicione o grupo
 *     `@/features/*` na camada de features e force toda comunicação a passar
 *     pela rota. É uma decisão de time — documente num ADR.
 *
 *  2. Dependência circular entre features. Use `madge --circular` ou
 *     `eslint-plugin-import` com `import/no-cycle` para isso.
 *
 *  3. Uma feature virando gigante. Nenhum lint mede coesão. O sinal humano é
 *     `index.ts` com dezenas de exports — o que significa que a feature perdeu
 *     o foco e provavelmente são duas.
 */
