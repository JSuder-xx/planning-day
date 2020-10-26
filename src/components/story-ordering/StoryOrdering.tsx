import React from "react";
import { useRef } from "react";
import * as ParseResult from "../application-state/parseResult";
import { css } from "goober";
import { Iteration } from "../application-state/iteration";
import { useApplicationState } from "../application-state/useApplicationState";

import { XYCoord } from "dnd-core";
import { DropTargetMonitor, useDrag, useDrop } from "react-dnd";

const storyClass = css`
  margin-left: 8px;
  padding: 6px;
  border: solid 1px #999;
  border-radius: 3px;
`;

type DragItem = {
  story: string;
  type: "Story";
  index: number;
};

const story = (
  iteration: Iteration,
  moveStory: (args: { fromIndex: number; toIndex: number }) => void
) => (story: string, storyIndex: number) => {
  const ref = useRef<HTMLDivElement>(null);
  const [, drop] = useDrop({
    accept: "Story",
    hover(item: DragItem, monitor: DropTargetMonitor) {
      if (!ref.current) {
        return;
      }
      const draggingIndex = item.index;
      const dragTargetIndex = storyIndex;

      if (draggingIndex === dragTargetIndex) return;

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleX =
        (hoverBoundingRect.right - hoverBoundingRect.left) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientX = (clientOffset as XYCoord).x - hoverBoundingRect.left;

      // Dragging rightwards
      if (draggingIndex < dragTargetIndex && hoverClientX < hoverMiddleX)
        return;

      // Dragging leftwards
      if (draggingIndex > dragTargetIndex && hoverClientX > hoverMiddleX) {
        return;
      }

      moveStory({ fromIndex: draggingIndex, toIndex: dragTargetIndex });

      // Mutating for performance. Don't do this at home. Or out. Or anywhere really.
      item.index = dragTargetIndex;
    },
  });
  const [{ opacity }, drag] = useDrag({
    item: { type: "Story", story, index: storyIndex } as DragItem,
    collect: (monitor) => ({
      opacity: monitor.isDragging() ? 0.5 : 1,
    }),
  });
  drag(drop(ref));
  return (
    <div
      ref={ref}
      className={storyClass}
      style={{ opacity }}
      title={iteration.stories[story]?.description ?? story}
    >
      {story}
    </div>
  );
};

const StoryOrdering = () => {
  const { state, dispatch } = useApplicationState();
  const { storyOrdering, iterationParseResult } = state;

  return ParseResult.isParseResultOK(iterationParseResult) ? (
    <div style={{ display: "flex" }}>
      {storyOrdering.map(
        story(iterationParseResult, (args) =>
          dispatch({ kind: "MoveStory", ...args })
        )
      )}
    </div>
  ) : (
    <></>
  );
};

export default StoryOrdering;
