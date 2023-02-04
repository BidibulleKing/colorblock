import { useState, useEffect, useRef } from "react";
import { DndContext } from "@dnd-kit/core";
import Block from "./Block";
import Bucket from "./Bucket";
import "./ColorBlock.css";

function ColorBlock() {
    const [chosenLevel, setChosenLevel] = useState(0);
    const [start, setStart] = useState(true);
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [colors, setColors] = useState([]);
    const [guesses, setGuesses] = useState([]);
    const [startNotice, setStartNotice] = useState();
    const [isGuessed, setIsGuessed] = useState([]);
    const [isWin, setIsWin] = useState(false);
    const [isLose, setIsLose] = useState(false);

    const noticeModal = useRef(null);

    const level = [
        {
            range: "analogic",
            indication: "les semblables",
            title: "Complètez les blocs de gauches à l’aide de vos blocs de droite.",
            content: "Nous cherchons ici : les semblable",
        },
    ];

    const messages = {
        win: {
            title: "Bravo !",
            content: "Vous passez au niveau suivant…",
        },
        lose: {
            title: "Ne baissez pas les bras !",
            content: "Retentez votre chance.",
        },
    };

    const hearts = [];
    // generate hearts
    for (let i = 0; i < lives; i++) {
        hearts.push(<li className="heart" key={i} />);
    }

    useEffect(() => {
        setStart(true);
    }, []);

    useEffect(() => {
        if (!start) return;

        setStartNotice(() => generateNotice(level[chosenLevel]));
        setColors(generateThreeColors());
        setLives(3);
        fadeNotice();
        setStart(false);
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
                    ...prevState,
                    {
                        color: fetchedColor,
                        isGuessed: false,
                    },
                ])
            );
        })();
    }, [colors]);

    useEffect(() => {
        if (!isWin) return;

        setChosenLevel(chosenLevel + 1);
        setStart(true);
        setIsWin(false);
    }, [isWin]);

    useEffect(() => {
        if (!isLose) return;

        saveScore(score);
        setScore(0);
        setStartNotice(() => generateNotice(messages.lose, true));
        showNotice();
        setChosenLevel(0);
        setIsLose(false);
    }, [isLose]);

    useEffect(() => {
        if (lives > 0) return;

        setIsLose(true);
    }, [lives]);

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

    const generateNotice = (message, isRestarting = false) => {
        return (
            <section className="modal" ref={noticeModal}>
                <div className="modal__text">
                    <h1>{message.title}</h1>
                    <p>
                        <strong>{message.content}</strong>
                    </p>
                    {isRestarting && (
                        <button
                            className="modal__button"
                            onClick={() => setStart(true)}
                        >
                            Rejouer
                        </button>
                    )}
                </div>
                <div className="modal__background" />
            </section>
        );
    };

    /**
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

    const saveScore = (scoreToSave) => {
        fetch("http://remydelepaule.vpnuser.lan:8000/api/scores", {
            method: "POST",
            body: JSON.stringify({
                score: scoreToSave,
            }),
            mode: "no-cors",
        });
    };

    /**
     * @param {number} timing to delay
     */
    const fadeNotice = (timing = 3000) => {
        setTimeout(() => {
            noticeModal.current.style.opacity = 0;
            setTimeout(
                () => (noticeModal.current.style.display = "none"),
                1000
            );
        }, timing);
    };

    const showNotice = () => {
        noticeModal.current.style.display = "block";
        noticeModal.current.style.opacity = 1;
    };

    /**
     * Disable the guessed droppable component
     * @param {String} color without "#"
     */
    const userAsGuessedAction = (color) => {
        const isGuessedCopy = isGuessed.slice();
        let isGuessedValue = isGuessedCopy.find(
            (object) => object.color === color
        );
        isGuessedValue.isGuessed = true;
        setIsGuessed(isGuessedCopy);
    };

    /**
     * Controls drop event
     * @param {Event} event
     */
    function handleDragEnd(event) {
        if (!event.over) return;

        const draggable = event.activatorEvent.target;
        const droppable =
            event.collisions[0].data.droppableContainer.node.current;

        if (event.active.id === event.over.id) {
            // * win
            draggable.style.display = "none";
            droppable.style.backgroundColor = `#${event.over.id}`;

            userAsGuessedAction(event.over.id);
            setScore(score + 5);
        } else {
            // * lose
            setLives(lives - 1);
        }
    }

    return (
        <>
            <DndContext onDragEnd={handleDragEnd} autoScroll={false}>
                {startNotice}

                <main className="main">
                    <header>
                        <h2>Votre score : {score}</h2>
                        <ul className="heart-list">{hearts}</ul>
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
                                        isGuessed={
                                            isGuessed.find(
                                                (object) =>
                                                    object.color === color
                                            ).isGuessed
                                        }
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
