# ADR-001 — Organizar por feature, adotando FSD em versão reduzida

- **Status:** Aceito
- **Data:** 2026-09-04

## Contexto

A estrutura por tipo de arquivo (`components/`, `hooks/`, `utils/`, `services/`)
tem dois problemas que só aparecem depois de alguns meses e que não são
estéticos:

1. **Toda mudança é espalhada.** Alterar uma feature exige abrir cinco ou seis
   pastas. O diff de um PR simples toca diretórios não relacionados, o que
   degrada a qualidade da revisão.
2. **Não existe informação de fronteira.** Como qualquer arquivo pode importar
   qualquer arquivo, não há como responder "o que quebra se eu mudar isto?" sem
   busca global. E `utils/` acumula tudo o que ninguém soube onde colocar.

Precisamos de um critério de agrupamento que se sustente com o tempo. O único que
se sustenta é **o que muda junto**.

Ao mesmo tempo, existe risco na direção oposta: adotar o FSD canônico completo
(`app`, `pages`, `widgets`, `features`, `entities`, `shared`) num projeto que
ainda não tem compartilhamento real cria camadas vazias e cerimônia sem retorno.

## Decisão

Organizar o código por feature, adotando um subconjunto do FSD:

```
src/
  app/        rotas finas: buscam, compõem, definem Suspense e erro
  features/   unidades de negócio autocontidas, com API pública em index.ts
  shared/     código sem conhecimento de domínio
```

`entities/` e `widgets/` **não** são criadas agora. Gatilhos explícitos para
introduzi-las:

- **`entities/`**: quando um mesmo conceito de domínio for necessário em duas ou
  mais features e a duplicação do modelo já tiver causado divergência real.
- **`widgets/`**: quando um bloco composto por duas ou mais features for usado em
  duas ou mais páginas — hoje isso vive na rota, que é o lugar certo enquanto for
  um só.

Cada feature expõe exatamente uma porta: `features/<nome>/index.ts`, com exports
enumerados. Nunca `export *`.

## Alternativas consideradas

| Alternativa | Prós | Contras | Por que não |
|---|---|---|---|
| Por tipo de arquivo | Familiar; zero decisão inicial | Mudança espalhada; nenhuma fronteira; `utils/` vira depósito | É o problema que originou este ADR |
| FSD canônico completo | Vocabulário conhecido; escala para monorepo grande | Seis camadas com pouco conteúdo; `entities` vazia; cerimônia alta para time pequeno | Antecipação de estrutura — o mesmo erro do projeto [react-quando-abstrair](https://github.com/vmarins2005/react-quando-abstrair) |
| Monorepo com um pacote por feature | Fronteira garantida pelo `package.json` | Overhead de build e versionamento; refatorar entre pacotes é caro | Desproporcional para uma aplicação |
| Feature-based com FSD reduzido | Fronteiras reais; três camadas; caminho de evolução claro | Exige disciplina sobre o que é `shared` | **Escolhido** |

## Consequências

**Positivas**
- Um PR de feature toca uma pasta. Revisão fica local e o histórico do Git conta
  uma história legível por feature.
- Apagar uma feature é apagar uma pasta — e o lint mostra imediatamente quem
  dependia dela.
- A API pública torna o acoplamento **contável**: dá para medir quantos módulos
  importam de cada feature e usar isso como métrica de saúde.
- Onboarding melhora: "mexa em `features/checkout`" é uma instrução completa.

**Negativas**
- Aparece a pergunta recorrente "isso é shared ou é da feature?". A resposta
  padrão precisa ser dita em voz alta: **na dúvida, comece dentro da feature**.
  Promover para `shared` depois é trivial; despromover é doloroso.
- Existirá alguma duplicação entre features (por exemplo, `CartItem` e `Product`
  têm campos parecidos). Isso é intencional — ver ADR-001 do projeto
  `dry-aha-kiss-yagni`.
- Quem vem de estrutura por tipo estranha nos primeiros dias.

**Monitorar**
- `index.ts` de uma feature passando de ~10 exports: sinal de que ela perdeu foco
  e provavelmente são duas features.
- Terceira ocorrência do mesmo modelo duplicado entre features: gatilho para
  criar `entities/`.

## Nota transferível

O critério de agrupamento não é "o que é parecido", é **"o que muda junto"**.
Toda estrutura de pastas que não responde a essa pergunta acaba virando uma
taxonomia que agrada no primeiro dia e atrapalha no centésimo.
