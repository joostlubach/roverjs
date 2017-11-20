declare module 'events' {
  export default class EventEmitter {
    constructor()

    addEventListener(event: string, callback: (...args: any[]) => void): void
    removeEventListener(event: string, callback: (...args: any[]) => void): void

    emit(event: string, ...args: any[]): void
  }
}