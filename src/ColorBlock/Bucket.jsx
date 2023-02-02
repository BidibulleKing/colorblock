import { useDrop } from "react-dnd";

export default function Bucket() {
    const [{ canDrop, isOver }, drop] = useDrop(() => ({
        // The type (or types) to accept - strings or symbols
        accept: "BLOCK",
        // Props to collect
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    }));

    return (
        <li ref={drop} role={"Dustbin"} className="block">
            {canDrop ? "Relâchez pour poser" : "Déplacez un bloc ici"}
        </li>
    );
}
