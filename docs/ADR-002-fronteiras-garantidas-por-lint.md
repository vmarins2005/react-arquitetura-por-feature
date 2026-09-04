# ADR-002 — Garantir as fronteiras de arquitetura por lint, não por convenção

- **Status:** Aceito
- **Data:** 2026-09-04

## Contexto

A estrutura definida no ADR-001 só entrega valor enquanto as fronteiras forem
respeitadas. E fronteira baseada em convenção **não sobrevive** — não por má fé,
mas por economia de esforço em contexto de pressão:

- é sexta-feira, a entrega é hoje, e o import direto resolve em 10 segundos
- quem revisa não tem o diagrama de arquitetura na cabeça naquele momento
- a pessoa que entrou no time há duas semanas nunca leu o documento
- o cursor do editor auto-importa pelo caminho profundo, sem perguntar nada

Esse último item é o mais subestimado: **o auto-import da IDE viola a
arquitetura por padrão**, silenciosamente, dezenas de vezes por dia.

Depois de alguns meses assim, `features/` continua existindo como pasta e deixou
de existir como fronteira — que é o pior dos mundos, porque a estrutura passa a
comunicar uma garantia que não é verdade.

## Decisão

Codificar a regra de dependência em `eslint.config.mjs` com
`no-restricted-imports`, e rodar `eslint` como **gate obrigatório de CI**.

Convenção que torna a regra verificável:

- imports **relativos** dentro da mesma feature (`../model/product`)
- imports por **alias** entre camadas (`@/features/catalog`)

As mensagens de erro são escritas para **ensinar**: dizem o que fazer e por quê,
não apenas que algo é proibido.

## Alternativas consideradas

| Alternativa | Prós | Contras | Por que não |
|---|---|---|---|
| Documento de arquitetura + code review | Zero configuração; flexível | Depende de memória humana sob pressão; auto-import da IDE fura sem aviso; a regra decai em semanas | É o cenário que este ADR corrige |
| `eslint-plugin-boundaries` | Declarativo; cobre reexport e import dinâmico; feito para isto | Uma dependência a mais; conceitos próprios para aprender | **Recomendado em produção**; aqui a regra nativa é preferida por ser autoexplicativa |
| Monorepo, uma fronteira por pacote | Garantia máxima (o `package.json` é a fronteira) | Overhead de build, versionamento e refatoração entre pacotes | Desproporcional para uma aplicação |
| `dependency-cruiser` | Muito poderoso; gera grafo visual | Configuração extensa; ferramenta a mais no CI | Vale quando a arquitetura já for complexa |
| `no-restricted-imports` nativo | Zero dependência; legível; mensagem customizável | Não pega import dinâmico nem reexport transitivo | **Escolhido** |

## Consequências

**Positivas**
- A violação é detectada em segundos, no editor, por quem escreveu — não dias
  depois, por quem revisa.
- A discussão sai do campo da autoridade ("o tech lead prefere assim") e entra no
  campo da regra objetiva, versionada e questionável em PR.
- Onboarding melhora sem documento nenhum: a ferramenta ensina no momento do erro,
  que é quando a pessoa está prestando atenção.
- O auto-import da IDE passa a ser corrigido imediatamente.

**Negativas**
- Haverá casos legítimos bloqueados. O escape é `// eslint-disable-next-line`
  **com justificativa escrita** — e a regra de time é que todo `disable` é
  discutido no PR. Um `disable` sem comentário é falha de review.
- A configuração precisa de manutenção quando surgirem novas camadas.
- Regras erradas geram atrito real e minam a confiança na ferramenta; mudanças no
  `eslint.config.mjs` devem ser revisadas com o mesmo rigor de código de produção.

**Limitações conhecidas** (documentadas no próprio arquivo de configuração)
- Não detecta ciclo entre features — usar `madge --circular` ou `import/no-cycle`.
- Não impede import dinâmico (`await import('@/features/x/model/y')`).
- Não mede coesão: nenhuma regra impede uma feature de virar gigante.

**Monitorar**
- Quantidade de `eslint-disable` no repositório. Crescimento sustentado significa
  que a regra está errada, não que o time é indisciplinado — e o ADR deve ser
  revisitado.

## Nota transferível

O princípio geral, que vale muito além de arquitetura de front:

> **Toda regra que importa deve estar codificada em ferramenta.**
> O que depende só de disciplina humana tem meia-vida de dois sprints.

Formatação, ordem de import, cobertura mínima, tamanho de bundle, acessibilidade
e fronteira de módulo — se importa, automatize; se não vale automatizar,
provavelmente não importava tanto assim.
