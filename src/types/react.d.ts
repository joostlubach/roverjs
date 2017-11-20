type CN1 = string[] | (CN2 | string)[]
type CN2 = string[] | (CN3 | string)[]
type CN3 = string[] | any[]

// Augment the react module to accept a classNames prop of a string on HTML elements.
// The file init/classNames.js will convert this into a classNames prop.
import {HTMLAttributes} from 'react'

declare module 'react' {
  export interface HTMLAttributes<T> {
    classNames?: ClassNamesProp
  }
  export type ClassNamesProp = string | (CN1 | string)[]
}