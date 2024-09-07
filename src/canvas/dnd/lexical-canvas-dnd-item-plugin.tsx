//#region imports
import * as React from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
	draggable,
	dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import {
	attachClosestEdge,
	extractClosestEdge,
	type Edge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { $getRoot } from "lexical";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { ITEM_CLASSNAME } from "./dnd-config";
//#endregion imports

interface Props {
	contentEditableRef: React.RefObject<HTMLElement>;
	overClassName: string;
	overTopClassName: string;
	overBottomClassName: string;
}

const DND_TYPE = "note-p";

//#region Helpers
function getElementsItems(element: HTMLElement) {
	const elements: HTMLElement[] = [];
	for (const item of element.children) {
		if (item.classList.contains(ITEM_CLASSNAME)) {
			elements.push(item as HTMLElement);
		}
	}

	return elements;
}

function getIndex(elements: Element[], element: Element): number {
	return elements.indexOf(element);
}
//#endregion Helpers

export function LexicalCanvasDndItemPlugin({
	contentEditableRef: ref,
	overClassName,
	overTopClassName,
	overBottomClassName,
}: Props) {
	const [editor] = useLexicalComposerContext();

	const cleanUpRef = React.useRef<() => void>();

	const cleanUp = React.useCallback(() => {
		cleanUpRef.current?.();
		cleanUpRef.current = undefined;
	}, []);

	React.useEffect(() => cleanUp, [cleanUp]);

	return (
		<OnChangePlugin
			onChange={() => {
				cleanUp();

				const elements = getElementsItems(ref.current!);

				cleanUpRef.current = combine(
					...elements.flatMap((element) => {
						return [
							draggable({
								element,
								getInitialData() {
									return {
										type: DND_TYPE,
									};
								},
							}),
							dropTargetForElements({
								element,
								canDrop(event) {
									return event.source.data.type === DND_TYPE;
								},
								getData(args) {
									return attachClosestEdge(
										{
											type: DND_TYPE,
										},
										{
											input: args.input,
											element: args.element,
											allowedEdges: ["bottom", "top"],
										},
									);
								},
								onDrag(event) {
									const closestEdgeOfTarget: Edge | null = extractClosestEdge(
										event.self.data,
									);

									event.self.element.classList.add(overClassName);
									if (closestEdgeOfTarget === "top") {
										event.self.element.classList.remove(overBottomClassName);
										event.self.element.classList.add(overTopClassName);
									} else if (closestEdgeOfTarget === "bottom") {
										event.self.element.classList.remove(overTopClassName);
										event.self.element.classList.add(overBottomClassName);
									} else {
										event.self.element.classList.remove(overBottomClassName);
										event.self.element.classList.remove(overTopClassName);
									}
								},
								onDragLeave(event) {
									event.self.element.classList.remove(
										overClassName,
										overBottomClassName,
										overTopClassName,
									);
								},
								onDrop(event) {
									const closestEdgeOfTarget: Edge | null = extractClosestEdge(
										event.self.data,
									);

									event.self.element.classList.remove(
										overClassName,
										overBottomClassName,
										overTopClassName,
									);

									if (event.source.element !== event.self.element) {
										const sourceIndex = getIndex(
											elements,
											event.source.element,
										);
										const targetIndex = getIndex(elements, event.self.element);

										if (sourceIndex !== -1 && targetIndex !== -1) {
											editor.update(() => {
												const root = $getRoot();

												// root.chil

												// 	etReorderDestinationIndex({
												// 		// list: ['A', 'B', 'C'],
												// 		// move A to left of B
												// 		startIndex: 0,
												// 		indexOfTarget: 1,
												// 		closestEdgeOfTarget: 'left',
												// 		axis: 'horizontal',
												// }),

												const target = root.getChildAtIndex(targetIndex)!;
												const source = root.getChildAtIndex(sourceIndex)!;

												if (sourceIndex > targetIndex) {
													target.insertBefore(source);
												} else {
													target.insertAfter(source);
												}
											});
										}
									}
								},
							}),
						];
					}),
				);
			}}
		/>
	);
}
