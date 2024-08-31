//#region imports
import * as React from "react";
import {
  EditorConfig,
  type LexicalNode,
  type SerializedTextNode,
  $applyNodeReplacement,
  TextNode,
} from "lexical";
import { addClassNamesToElement } from "@lexical/utils";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalTextEntity } from "@lexical/react/useLexicalTextEntity";
//#endregion

export class TaggedNode extends TextNode {
  static getType(): string {
    return "tagged";
  }

  static clone(node: TaggedNode): TaggedNode {
    return new TaggedNode(node.__text, node.__key);
  }

  createDOM(config: EditorConfig): HTMLElement {
    const element = super.createDOM(config);
    addClassNamesToElement(element, config.theme.tagged);
    return element;
  }

  static importJSON(serializedNode: SerializedTextNode): TaggedNode {
    const node = $createTaggedNode(serializedNode.text);
    node.setFormat(serializedNode.format);
    node.setDetail(serializedNode.detail);
    node.setMode(serializedNode.mode);
    node.setStyle(serializedNode.style);
    return node;
  }

  exportJSON(): SerializedTextNode {
    return {
      ...super.exportJSON(),
      type: "tagged",
    };
  }

  canInsertTextBefore(): boolean {
    return false;
  }

  isTextEntity(): true {
    return true;
  }
}

export function $createTaggedNode(text = ""): TaggedNode {
  return $applyNodeReplacement(new TaggedNode(text));
}

export function $isTaggedNode(
  node: LexicalNode | null | undefined
): node is TaggedNode {
  return node instanceof TaggedNode;
}

export function TaggedPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  React.useEffect(() => {
    if (!editor.hasNodes([TaggedNode])) {
      throw new Error("TaggedPlugin: TaggedPlugin not registered on editor");
    }
  }, [editor]);

  const $createTaggedNode_ = React.useCallback((textNode: TextNode) => {
    return $createTaggedNode(textNode.getTextContent());
  }, []);

  const getTaggedMatch = React.useCallback((text: string) => {
    const matchArr = /^\[[ +x-]\]/.exec(text);

    if (matchArr === null) {
      return null;
    }

    // const hashtagLength = matchArr[3].length + 1;
    // const startOffset = matchArr.index + matchArr[1].length;
    // const endOffset = startOffset + hashtagLength;
    return {
      start: 0,
      end: matchArr[0].length,
    };
  }, []);

  useLexicalTextEntity<TaggedNode>(
    getTaggedMatch,
    TaggedNode,
    $createTaggedNode_
  );

  return null;
}
