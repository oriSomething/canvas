//#region imports
import * as React from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
	draggable,
	dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { $getRoot } from "lexical";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { ITEM_CLASSNAME } from "./dnd-config";
//#endregion imports

interface Props {
	contentEditableRef: React.RefObject<HTMLElement>;
	overClassName: string;
}

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
							}),
							dropTargetForElements({
								element,
								onDragEnter(event) {
									event.self.element.classList.add(overClassName);
								},
								onDragLeave(event) {
									event.self.element.classList.remove(overClassName);
								},
								onDrop(event) {
									event.self.element.classList.remove(overClassName);

									if (event.source.element !== event.self.element) {
										const sourceIndex = getIndex(
											elements,
											event.source.element,
										);
										const targetIndex = getIndex(elements, event.self.element);

										if (sourceIndex !== -1 && targetIndex !== -1) {
											editor.update(() => {
												const root = $getRoot();
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
