// @flow

export type ASTNode = {
	type:  string,
	value: string,
	loc: {
		start: ASTNodeLocation,
		end:   ASTNodeLocation
	}
}

export type ASTNodeLocation = {
	line:   number,
	column: number
}