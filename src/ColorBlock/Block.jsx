import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import React from "react";

function Block(props) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: props.id,
    });
    const style = {
        transform: CSS.Translate.toString(transform),
        backgroundColor: `#${props.color}`,
    };

    return (
        <li
            ref={setNodeRef}
            className="block"
            style={style}
            {...listeners}
            {...attributes}
        />
    );
}

export default Block;
