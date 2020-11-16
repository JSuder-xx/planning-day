import React from "react";
import { useRef } from "react";
import * as Result from "../models/result";
import { css } from "goober";
import { Iteration } from "../models/iteration";
import { useApplicationState } from "./ApplicationStateContext";
import { createHozitonalOrderingHover } from "../helpers/dnd";
import { Map, createMap } from "../helpers/map.json";
import { useDrag, useDrop } from "react-dnd";

const storyClass = css`
  margin-left: 8px;
  padding: 6px;
  background-color: #006;
  border: solid 1px #999;
  border-radius: 3px;
  cursor: pointer;
`;

const precedingDependencyClass = css`
  border-left: solid 3px #99f;
`;

const succeedingDependencyClass = css`
  border-right: solid 3px #f00;
`;

type DragItem = {
  readonly storyName: string;
  readonly type: "Story";
  index: number;
};

type CollectedProps = { opacity: number };

type StoryIndex = { storyName: string; index: number };

const storyFactory = (
  storyIndexMap: Map<StoryIndex>,
  iteration: Iteration,
  moveStory: (args: { fromIndex: number; toIndex: number }) => void
) => ({ storyName, storyIndex }: { storyName: string; storyIndex: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [, drop] = useDrop({
    accept: "Story",
    hover: createHozitonalOrderingHover<DragItem>(ref, storyIndex, moveStory),
  });
  const [{ opacity }, drag] = useDrag<DragItem, unknown, CollectedProps>({
    item: { type: "Story", storyName, index: storyIndex },
    collect: (monitor) => ({
      opacity: monitor.isDragging() ? 0.5 : 1,
    }),
  });
  drag(drop(ref));

  const story = iteration.stories[storyName];
  const dependsOnBefore = (story.dependsOn ?? []).map(
    (dependency) => (storyIndexMap[dependency]?.index ?? 99999) < storyIndex
  );
  const hasPrecedingDependency =
    dependsOnBefore.length > 0 && dependsOnBefore.some((it) => it);
  const hasSucceedingDependency =
    dependsOnBefore.length > 0 && dependsOnBefore.some((it) => !it);

  return (
    <div
      ref={ref}
      key={storyName}
      className={`${storyClass} ${
        hasPrecedingDependency ? precedingDependencyClass : ""
      } ${hasSucceedingDependency ? succeedingDependencyClass : ""}`}
      style={{ opacity }}
      title={story?.description ?? storyName}
    >
      {storyName}
    </div>
  );
};

const StoryOrdering = () => {
  const { state, dispatch } = useApplicationState();
  const { storyOrdering, iterationResult } = state;

  const storyIndexMap = createMap<StoryIndex>(
    storyOrdering.map((storyName, index) => ({ storyName, index })),
    ({ storyName }) => storyName
  );

  if (Result.isOK(iterationResult)) {
    const DragDroppableStory = storyFactory(
      storyIndexMap,
      iterationResult,
      (args) => dispatch({ kind: "MoveStory", ...args })
    );
    return (
      <>
        <h3>Story Ordering</h3>
        <p>
          Drag/drop the stories below to change the order in which they should
          be worked during the iteration.
        </p>
        <div style={{ display: "flex" }}>
          {storyOrdering.map((story, index) => (
            <DragDroppableStory storyName={story} storyIndex={index} />
          ))}
        </div>
      </>
    );
  } else return <></>;
};

export default StoryOrdering;
