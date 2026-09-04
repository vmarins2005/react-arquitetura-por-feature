/**
 * Camada `shared`: código sem conhecimento de domínio, usado por 2+ features.
 *
 * O teste para saber se algo pertence aqui: **este arquivo faria sentido em
 * outro produto da empresa, sem alteração?** Formatar moeda, sim. "Calcular
 * desconto de assinante Pro", não — isso é domínio e mora numa feature.
 *
 * Regra de dependência: `shared` NUNCA importa de `features`. Se você precisou
 * disso, o arquivo não era shared.
 */

export type Money = { readonly cents: number }

export function money(cents: number): Money {
  if (!Number.isInteger(cents)) {
    throw new TypeError('Valor monetário precisa ser inteiro em centavos')
  }
  return { cents }
}

export function addMoney(a: Money, b: Money): Money {
  return { cents: a.cents + b.cents }
}

export function multiplyMoney(value: Money, factor: number): Money {
  return { cents: Math.round(value.cents * factor) }
}

export function formatMoney(value: Money, locale = 'pt-BR', currency = 'BRL'): string {
  return (value.cents / 100).toLocaleString(locale, { style: 'currency', currency })
}
