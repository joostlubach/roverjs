// @flow

export type Point = {x: number, y: number};

export type Translation = {x: number, y: number};

export type DragHandleState = {

  /** The coordinates of the mouse cursor when dragging started. */
  mouseStart: Point,

  /** The current coordinates of the mouse cursor. */
  mouseCurrent: Point,

  /** The translation of the mouse cursor since dragging started. */
  mouseDelta: Translation

};

export type DraggableState = DragHandleState & {

  /** The left coordinate of the draggable when dragging started.  */
  startLeft: number,

  /** The top coordinate of the draggable when dragging started.  */
  startTop: number,

  /** The current left coordinate of the draggable. */
  left: number,

  /** The current top coordinate of the draggable. */
  top: number

};

export type ReorderableState = DragHandleState & {

  /** The current index of the reorderable. */
  index: number;

  /** The start coordinate (left or top) of the reorderable. */
  startCoord: number;

  /** The current coordinate (left or top) of the reorderable. */
  coord: number;

  /** The size (width or height) of the reorderable. */
  size: number;

  /** All reorderables. */
  all: HTMLElement[];

  /** The coordinates (left or top) of all reorderables. */
  coords: number[];

};