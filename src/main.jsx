import React from "react";
import ReactDOM from "react-dom/client";
import ColorBlock from "./ColorBlock/ColorBlock";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <DndProvider backend={HTML5Backend}>
            <ColorBlock />
        </DndProvider>
    </React.StrictMode>
);
