// eslint-disable-next-line @typescript-eslint/ban-types
export type OptionalKeys<T> = { [K in keyof T]-?: {} extends Pick<T, K> ? K : never }[keyof T];
export type Defaults<T> = Required<Pick<T, OptionalKeys<T>>>

/**
 * Normalize message:
 * - lowercase
 * - ё -> е
 * - remove waste words (if there are other words)
 * - remove extra spaces
 * - trim
 */
 export function normalizeUserMessage(msg?: string) {
  return (msg || '')
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[^а-яa-z0-9]/g, ' ') // оставляем только буквы и цифры
   // .replace(/алиса/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
