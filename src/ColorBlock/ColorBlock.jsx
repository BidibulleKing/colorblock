import { useState, useEffect, useRef } from "react";
import { DndContext } from "@dnd-kit/core";
import Block from "./Block";
import Bucket from "./Bucket";
import "./ColorBlock.css";

function ColorBlock() {
    // * DATA
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

    const levels = [
        {
            range: "analogic",
            indication: "les semblables",
            title: "Complètez les blocs de gauche à l’aide de vos blocs de droite.",
            content: "Nous cherchons ici : les semblables.",
        },
        {
            range: "complement",
            indication: "les complémentaires",
            title: "Complètez les blocs de gauche à l'aide de vos blocs de droite.",
            content: "Nous cherchons ici : les complémentaires.",
        },
        {
            range: "triad",
            indication: "les triades",
            title: "Complètez les blocs de gauche à l'aide de vos blocs de droite.",
            content: "Nous cherchons ici : les triades.",
        },
        {
            range: "quad",
            indication: "les carrés",
            title: "Complètez les blocs de gauche à l'aide de vos blocs de droite.",
            content: "Nous cherchons ici : les carrés.",
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
        finish: {
            title: "Formidable !",
            content: "Vous avez surmonté toutes les épreuves !",
        },
    };

    const hearts = [];
    // generate hearts
    for (let i = 0; i < lives; i++) {
        hearts.push(<li className="heart" key={i} />);
    }

    // * USE EFFECTS

    useEffect(() => {
        setStart(true);
    }, []);

    useEffect(() => {
        if (!start) return;

        setStartNotice(() => generateNotice(levels[chosenLevel]));
        fadeNotice();
        setColors(generateThreeColors());
        setStart(false);
    }, [start]);

    useEffect(() => {
        if (colors.length < 3) return;

        isGuessed.splice(0, isGuessed.length);

        (async () => {
            const range = levels[chosenLevel].range;
            let color;
            let fetchedColors = [];

            for (let i = 0; i < 3; i++) {
                color = colors[i];
                let fetchedColor = await fetchColorApi(color, range);

                fetchedColors = [
                    ...fetchedColors,
                    fetchedColor.colors[range === "analogic" ? 1 : 0].hex.clean,
                ];
            }

            // User colors
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

        if (chosenLevel === levels.length - 1) {
            // if hit max levels
            setChosenLevel(0);
            setStartNotice(() => generateNotice(messages.finish, true));
            setScore(0);
            setLives(3);
        } else {
            setChosenLevel(chosenLevel + 1);
            setStartNotice(() => generateNotice(messages.win, true));
        }

        showNotice();
        setIsWin(false);
    }, [isWin]);

    useEffect(() => {
        if (!isLose) return;

        // TODO: save score to database
        // saveScore(score);
        setStartNotice(() => generateNotice(messages.lose, true));
        showNotice();
        setChosenLevel(0);
        setScore(0);
        setLives(3);
        setIsLose(false);
    }, [isLose]);

    useEffect(() => {
        if (lives > 0) return;

        setIsLose(true);
    }, [lives]);

    useEffect(() => {
        let notGuessed = isGuessed.filter(
            (currentGuessed) => currentGuessed.isGuessed === false
        );

        if (notGuessed.length <= 0 && guesses.length > 0) setIsWin(true);
    }, [isGuessed]);

    // * FUNCTIONS

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
     * Shuffle the array with Durstenfeld's shuffle algorithm
     * @param {Array} array
     */
    const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
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
                            {Object.values(message).includes("Bravo !")
                                ? "Continuer"
                                : "Rejouer"}
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
                                {shuffleArray(guesses.slice()).map((color) => (
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
