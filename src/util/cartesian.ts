export type Datum<K extends string, V> = {[key in K]?: V}
export type CartesianArray<K extends string, V> = Datum<K, V>[]

export default function cartesian<K extends string, V>(
  data:   CartesianArray<K, V>,
  key:    K,
  values: V[]
): CartesianArray<K, V> {
  if (data.length === 0) {
    return values.map(value => ({[key]: value})) as CartesianArray<K, V>
  }

  const result: CartesianArray<K, V> = []
  for (const datum of data) {
    for (const value of values) {
      // tslint:disable-next-line no-any -- I don't know why it won't accept Datum<K, V>
      result.push({...(datum as any), [key]: value})
    }
  }
  return result
}