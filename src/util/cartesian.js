// @flow

export default function cartesian<K: string | number, V>(data: {[key: K]: V}, key: K, values: V[]) {
	if (data.length === 0) {
		return values.map(value => ({[key]: value}))
	}

	const result = []
	for (let i = 0; i < data.length; i++) {
		for (const value of values) {
			result.push({...data[i], [key]: value})
		}
	}
	return result
}