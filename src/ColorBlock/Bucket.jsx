import React from "react";
import { useDroppable } from "@dnd-kit/core";

export function Bucket(props) {
    const { isOver, setNodeRef } = useDroppable({
        id: props.id,
    });
    const style = {
        opacity: isOver ? 1 : 0.5,
        backgroundColor: props.isGuessed && isOver ? `#${props.id}` : "",
    };

    return (
        <div className="block" ref={setNodeRef} style={style}>
            {props.children}
        </div>
    );
}

export default Bucket;
