import * as React from 'react'

type AllProps<DP, P extends {[key in keyof DP]?: any}> =
  Omit<P, keyof DP> &         // Mandate all properties in P and not in DP
  Partial<Pick<P, keyof DP>>  // Accept all properties from P that are in DP, but use type from P

export interface ComponentDefaulter<DP> {
  <P extends {[key in keyof DP]?: any}>(Component: React.ComponentType<P>): React.ComponentClass<AllProps<DP, P>>
}

export default function withDefaults<DP>(defaultProps: DP): ComponentDefaulter<DP> {
  return Component => class extends React.Component<AllProps<DP, any>> {
    render() {
      return <Component {...defaultProps} {...this.props}/>
    }
  }
}