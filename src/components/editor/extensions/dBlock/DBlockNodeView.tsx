/* eslint-disable jsx-a11y/no-static-element-interactions */

import { Button, Tooltip, styled } from '@nextui-org/react';
import { NodeViewContent, NodeViewProps, NodeViewWrapper } from "@tiptap/react";
import React, { useMemo } from "react";
import { BiPlus } from 'react-icons/bi';
import { MdClose, MdDragIndicator } from 'react-icons/md';
import { RiArrowDownLine, RiArrowUpLine } from 'react-icons/ri';

import './DBlockStyle.scss'

const LeftSection = styled('section', {
  display: 'flex',
  gap: '4px',
  alignItems: 'center'
})

const MoveButtonsContainer = styled('div', {
  display: 'flex',
  justifyContent: 'space-between'
})

export const DBlockNodeView: React.FC<NodeViewProps> = ({
  node,
  getPos,
  editor,
  deleteNode
}) => {
  const isTable = useMemo(() => {
    const { content } = node.content as any;

    return content[0].type.name === "table";
  }, [node.content]);

  const createNodeAfter = () => {
    const pos = getPos() + node.nodeSize;

    editor
      .chain()
      .insertContentAt(pos, {
        type: "dBlock",
        content: [
          {
            type: "paragraph",
          },
        ],
      })
      .focus(pos + 2)
      .run();
  };

  const onDeleteClicked = () => {
    deleteNode()

    setTimeout(() => editor.commands.focus())
  }

  const moveNode = (dir: 'up' | 'down') => {
    const { from, to } = editor.state.selection
    const [nodeFrom, nodeTo] = [getPos(), getPos() + node.nodeSize]

    if (!(nodeFrom <= from && to <= nodeTo)) editor.commands.focus(getPos() + 2)

    setTimeout(() => editor.chain().moveNode(dir).focus().run())
  }

  return (
    <NodeViewWrapper as="div" className="dBlockWrapper flex">
      {
        editor.isEditable && (
          <LeftSection
            aria-label="left-menu"
            contentEditable="false"
          >
            <button
              className="d-block-button"
              onClick={createNodeAfter}
            >
              <BiPlus />
            </button>
            <Tooltip
              content={(
                <MoveButtonsContainer>
                  <Button.Group size='sm' css={{ padding: 0, margin: 0 }} flat>
                    <Button auto size={'sm'} icon={<RiArrowUpLine />} onPress={() => moveNode('up')} />
                    <Button auto size={'sm'} icon={<MdClose />} onPress={onDeleteClicked} />
                    <Button auto size={'sm'} icon={<RiArrowDownLine />} onPress={() => moveNode('down')} />
                  </Button.Group>
                </MoveButtonsContainer>
              )}
              trigger={'click'}
              hideArrow
              placement='bottom'
            >
              <div
                className="d-block-button drag-handle"
                contentEditable={false}
                draggable
                data-drag-handle
              >
                <MdDragIndicator />
              </div>
            </Tooltip>
          </LeftSection>
        )
      }

      <NodeViewContent className={`content w-full ${isTable ? "is-table" : ""}`} />
    </NodeViewWrapper>
  );
};
