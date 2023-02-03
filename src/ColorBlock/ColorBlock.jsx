import { useState, useEffect, useRef } from "react";
import { DndContext } from "@dnd-kit/core";
import Block from "./Block";
import Bucket from "./Bucket";
import "./ColorBlock.css";

function ColorBlock() {
    const [parent, setParent] = useState(null);
    const [start, setStart] = useState(true);
    const [score, setScore] = useState(0);
    const [chosenLevel, setChosenLevel] = useState(0);
    const [colors, setColors] = useState([]);
    const [guesses, setGuesses] = useState([]);
    const [isWin, setIsWin] = useState(false);
    const [isLose, setIsLose] = useState(false);
    const [isGuessed, setIsGuessed] = useState([]);

    const noticeModal = useRef(null);

    const level = [
        {
            range: "analogic",
            indication: "les semblables",
        },
    ];

    useEffect(() => {
        setStart(true);
        setColors(generateThreeColors());
    }, []);

    useEffect(() => {
        notice(3000);
    }, [start]);

    useEffect(() => {
        if (colors.length < 3) return;

        (async () => {
            let fetchedColors = [];
            for (let i = 0; i < 3; i++) {
                let fetchedColor = await fetchColorApi(
                    colors[i],
                    level[chosenLevel].range
                );
                fetchedColors = [
                    ...fetchedColors,
                    fetchedColor.colors[1].hex.clean,
                ];
            }
            setGuesses(fetchedColors);
            fetchedColors.map((fetchedColor) =>
                setIsGuessed((prevState) => [
                    ...isGuessed,
                    {
                        color: fetchedColor,
                        isGuessed: false,
                    },
                ])
            );
        })();
    }, [colors]);

    useEffect(() => {
        if (isWin) setChosenLevel(chosenLevel + 1);
        colors;
    }, [isWin]);

    /**
     *
     * @param {string} hexCode Hexadecimal code without #
     * @param {string} range Color range
     * @returns {Promise} JSON promise
     */
    const fetchColorApi = async (hexCode, range) => {
        const response = await fetch(
            `https://www.thecolorapi.com/scheme?hex=${hexCode}&mode=${range}&count=2`
        );
        const json = await response.json();

        return json;
    };

    const generateRandomHexColor = () => {
        return Math.floor(Math.random() * 16777215).toString(16);
    };

    const generateThreeColors = () => {
        let colors = [];

        for (let i = 0; i < 3; i++) {
            colors = [...colors, generateRandomHexColor()];
        }
        return colors;
    };

    /**
     * Hide modal after timing
     * @param {number} timing
     */
    const notice = (timing) => {
        setTimeout(() => {
            noticeModal.current.style.opacity = 0;
            setTimeout(
                () => (noticeModal.current.style.display = "none"),
                1000
            );
        }, timing);
    };

    function handleDragEnd(event) {
        console.log(event);
        if (event.active.id === event.over.id) {
            event.activatorEvent.target.style.display = "none";
            // let isGuessedCopy = isGuessed.slice();
            // const index = isGuessedCopy.findIndex(
            //     (object) => object.color == event.over.id
            // );
            // isGuessedCopy[index].isGuessed = true;
            // console.log(isGuessedCopy);
            console.log(isGuessed);
        }
    }

    return (
        <>
            <DndContext onDragEnd={handleDragEnd}>
                <section className="modal" ref={noticeModal}>
                    <h1>
                        Complètez les blocs de gauches à l’aide de vos blocs de
                        droite. <br /> <br /> Nous cherchons ici...{" "}
                        <strong>{level[chosenLevel].indication}</strong> !
                    </h1>
                    <div className="modal__background" />
                </section>

                <main className="main">
                    <header>
                        <h2>Votre score : {score}</h2>
                        <ul className="heart-list">
                            <li className="heart"></li>
                            <li className="heart"></li>
                            <li className="heart"></li>
                        </ul>
                    </header>

                    <div className="block-container">
                        <section className="left-blocks">
                            <ul className="block-list">
                                {colors.map((color) => (
                                    <li
                                        className="block"
                                        style={{ backgroundColor: `#${color}` }}
                                        key={color}
                                    />
                                ))}
                            </ul>
                            <ul className="block-list">
                                {guesses.map((color) => (
                                    <Bucket
                                        id={color}
                                        key={color}
                                        style={{
                                            backgroundColor: `#${isGuessed}`,
                                        }}
                                        isGuessed={false}
                                    />
                                ))}
                            </ul>
                        </section>

                        <section className="right-blocks">
                            <ul className="block-list">
                                <mark>Vos blocs ici</mark>
                                {guesses.map((color) => (
                                    <Block
                                        id={color}
                                        color={color}
                                        key={color}
                                    />
                                ))}
                            </ul>
                        </section>
                    </div>
                </main>
            </DndContext>
        </>
    );
}

export default ColorBlock;
