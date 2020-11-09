import { DropTargetMonitor } from "react-dnd";

export function createHozitonalOrderingHover<
  DragItem extends { index: number }
>(
  ref: React.RefObject<HTMLElement>,
  currentIndex: number,
  move: (args: { fromIndex: number; toIndex: number }) => void
) {
  return (item: DragItem, monitor: DropTargetMonitor) => {
    if (!ref.current) return;

    const draggingIndex = item.index;
    const dragTargetIndex = currentIndex;

    if (draggingIndex === dragTargetIndex) return;

    const hoverBoundingRect = ref.current.getBoundingClientRect();

    const hoverMiddleX = (hoverBoundingRect.right - hoverBoundingRect.left) / 2;

    const clientOffset = monitor.getClientOffset();
    if (clientOffset === null) return;

    const hoverClientX = clientOffset.x - hoverBoundingRect.left;

    // Dragging rightwards
    if (draggingIndex < dragTargetIndex && hoverClientX < hoverMiddleX) return;

    // Dragging leftwards
    if (draggingIndex > dragTargetIndex && hoverClientX > hoverMiddleX) {
      return;
    }

    move({ fromIndex: draggingIndex, toIndex: dragTargetIndex });

    // Mutating for performance. Don't do this at home. Or out. Or anywhere really.
    item.index = dragTargetIndex;
  };
}
