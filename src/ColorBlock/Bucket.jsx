import React from "react";
import { useDroppable } from "@dnd-kit/core";

export function Bucket(props) {
    const { isOver, setNodeRef } = useDroppable({
        id: props.id,
        disabled: props.isGuessed,
    });
    const style = {
        opacity: isOver ? 1 : 0.5,
    };

    return <li className="block" ref={setNodeRef} style={style} />;
}

export default Bucket;
