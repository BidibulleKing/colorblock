import { useDrag } from "react-dnd";

export default function Block({ customStyle }) {
    const [{ isDragging }, drag] = useDrag(() => ({
        // "type" is required. It is used by the "accept" specification of drop targets.
        type: "BLOCK",
        // The collect function utilizes a "monitor" instance (see the Overview for what this is)
        // to pull important pieces of state from the DnD system.
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }));

    return <li ref={drag} style={customStyle} className="block" />;
}
