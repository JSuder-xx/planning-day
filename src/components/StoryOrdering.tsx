import React from "react";
import { useRef } from "react";
import * as Result from "../models/result";
import { css } from "goober";
import { Iteration } from "../models/iteration";
import { useApplicationState } from "./ApplicationStateContext";
import { createHozitonalOrderingHover } from "../helpers/dnd";
import { partition } from "../helpers/array";
import { createMap } from "../helpers/map.json";
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
  border-left: solid 3px #9f9;
`;

const succeedingDependencyClass = css`
  border-right: solid 3px #f44;
`;

type DragItem = {
  readonly storyName: string;
  readonly type: "Story";
  index: number;
};

type CollectedProps = { opacity: number };

type StoryIndex = { storyName: string; index: number };

type StoryViewModel = {
  dependenciesBefore: string[];
  dependenciesAfter: string[];
  storyName: string;
  storyIndex: number;
  description?: string;
};

const createStoryViewModels = (
  storyOrdering: readonly string[],
  iteration: Iteration
): StoryViewModel[] => {
  const storyIndexMap = createMap<StoryIndex>(
    storyOrdering.map((storyName, index) => ({ storyName, index })),
    ({ storyName }) => storyName
  );

  return storyOrdering.map<StoryViewModel>((storyName, storyIndex) => {
    const story = iteration.stories[storyName];
    const [dependenciesBefore, dependenciesAfter] = partition(
      story.dependsOn ?? [],
      (dependency) => (storyIndexMap[dependency]?.index ?? 99999) < storyIndex
    );

    return {
      dependenciesAfter,
      dependenciesBefore,
      storyName,
      storyIndex,
      description: story.description,
    };
  });
};

/** Creates a Drag/Drop React component. */
const createDragDropStory = (
  moveStory: (args: { fromIndex: number; toIndex: number }) => void
) => ({
  story: {
    storyName,
    description,
    storyIndex,
    dependenciesBefore,
    dependenciesAfter,
  },
}: {
  story: StoryViewModel;
}) => {
  // DnD Plumbing
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

  // Render
  return (
    <div
      ref={ref}
      key={storyName}
      className={`${storyClass} ${
        dependenciesBefore.length > 0 ? precedingDependencyClass : ""
      } ${dependenciesAfter.length > 0 ? succeedingDependencyClass : ""}`}
      style={{ opacity }}
      title={description ?? storyName}
    >
      {storyName}
    </div>
  );
};

const StoryOrderingValidation = ({
  stories,
}: {
  stories: readonly StoryViewModel[];
}) => {
  const storiesWithFollowingDependencies = stories.filter(
    (story) => story.dependenciesAfter.length > 0
  );

  return storiesWithFollowingDependencies.length === 0 ? (
    <></>
  ) : (
    <div
      style={{
        marginTop: "10px",
        marginBottom: "4px",
        padding: "4px",
        border: "solid 1px #777",
      }}
    >
      {storiesWithFollowingDependencies.length === 1
        ? "The following story is scheduled earlier in the iteration than its dependencies"
        : "The following stories are scheduled earlier in the iteration than their dependencies"}
      <ul>
        {storiesWithFollowingDependencies.map((story) => (
          <li>
            {story.storyName} is scheduled before other stories on which it
            depends:
            {story.dependenciesAfter.join(", ")}
          </li>
        ))}
      </ul>
    </div>
  );
};

const StoryOrdering = () => {
  const { state, dispatch } = useApplicationState();
  const { storyOrdering, iterationResult } = state;

  if (!Result.isOK(iterationResult)) return <></>;
  else {
    const DragDropStory = createDragDropStory((args) =>
      dispatch({ kind: "MoveStory", ...args })
    );

    const stories = createStoryViewModels(storyOrdering, iterationResult);
    return (
      <>
        <h3>Story Ordering</h3>
        <p>
          Drag/drop the stories below to change the order in which they should
          be worked during the iteration.
        </p>
        <div style={{ display: "flex" }}>
          {stories.map((story) => (
            <DragDropStory story={story} />
          ))}
        </div>
        <StoryOrderingValidation stories={stories} />
      </>
    );
  }
};

export default StoryOrdering;
