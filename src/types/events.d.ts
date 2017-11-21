declare module 'events' {
  export default class EventEmitter {
    constructor()

    on(event: string, callback: (...args: any[]) => void): void
    addEventListener(event: string, callback: (...args: any[]) => void): void
    removeEventListener(event: string, callback: (...args: any[]) => void): void
    removeAllListeners(): void

    emit(event: string, ...args: any[]): void
  }
}