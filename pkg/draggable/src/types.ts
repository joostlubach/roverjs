export interface Point {
  x: number
  y: number
}

export interface Translation {
  x: number
  y: number
}

export interface DragHandleState {

  /** The coordinates of the mouse cursor when dragging started. */
  mouseStart: Point

  /** The current coordinates of the mouse cursor. */
  mouseCurrent: Point

  /** The translation of the mouse cursor since dragging started. */
  mouseDelta: Translation

}

export interface DraggableState extends DragHandleState {

  /** The left coordinate of the draggable when dragging started.  */
  startLeft: number

  /** The top coordinate of the draggable when dragging started.  */
  startTop: number

  /** The current left coordinate of the draggable. */
  left: number

  /** The current top coordinate of the draggable. */
  top: number

}