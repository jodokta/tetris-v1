import { StyledTetrisWrapper, StyledTetris } from "../../css/StyledTetris";

//React
import { useState } from "react";

// Redux
import { useDispatch } from "react-redux";
import { setIsPlayNow } from "../../store/IsPlayNow";

// Components
import Stage from "./Stage";
import Display from "./Display";
import StartButton from "./StartButton";
import GameOver from "./GameOver";

// Custom Hooks
import { usePlayer } from "../../hooks/tetris/usePlayer";
import { useStage } from "../../hooks/tetris/useStage";
import { useInterval } from "../../hooks/tetris/useInterval";
import { useStats } from "../../hooks/tetris/useStats";
import { usePlaySound } from "../../hooks/tetris/usePlaySound";

// Help, Constance
import { checkCollision, createStage } from "../../gameHelpers";
import Preview from "./Preview";
import { queue } from "../../constants";
import { clickSound } from "../../hooks/tetris/useClickSound";



const Tetris = ({setIsStart}) => {
    const [isPlaying, setIsPlaying] = useState(false);

    // Redux
    const dispatch = useDispatch();

    const [dropTime, setDropTime] = useState(null);
    const [gameOver, setGameOver] = useState(false);

    const [player, updatePlayerPos, resetPlayer, playerRotate] = usePlayer();
    const [stage, setStage, rowsCleared, ghostPositions] = useStage(player, resetPlayer);
    const [score, setScore, rows, setRows, level, setlevel] = useStats(rowsCleared);

    // Sound
    usePlaySound("/sound/play.mp3", isPlaying, gameOver, 1);

    const movePlayer = dir => {
        // check x-1, x+1
        if(!checkCollision(player, stage, { x: dir, y: 0 })) {
            updatePlayerPos({ x: dir, y: 0 });
        }
    }

    const startGame = (e) => {
        // Sound(click)
        clickSound(0.2);
        setIsPlaying(true);
        dispatch(setIsPlayNow(true));
        const target = document.getElementById('TetrisWrpper');
        e.target.blur();
        target.focus();
        // Reset all
        setDropTime(1000);
        setStage(createStage());
        resetPlayer();
        setGameOver(false);
        setScore(0);
        setRows(0);
        setlevel(1);
    }
    
    const drop = () => {
        //레벨 증가
        if(rows > (level + 1) * 10) {
            setlevel(prev => prev + 1);
            // 속도 증가
            setDropTime(1000 / (level + 1) + 200);
        }
        
        if(!checkCollision(player, stage, { x: 0, y: 1})) {
            //다음 y좌표가 이동이 가능하면 블럭 한칸 내림
            updatePlayerPos({ x: 0, y: 1, collide: false })
        } else { 
            //Game Over
            //다음 y좌표 이동 불가 + 현재 죄표가 1보다 작다면? Game Over
            if(player.pos.y < 1) {
                // console.log('Game Over!!!');
                setGameOver(true);
                setDropTime(null);
            }
            updatePlayerPos({x: 0, y: 0, collide: true});
            setDropTime(1000 / (level + 1) + 200);
        }
    }
    const keyUp = ({ keyCode }) => {
        if(!gameOver) {
            if(keyCode === 40) {
                setDropTime(1000);
            }
        }
    }
    
    const dropPlayer = () => {
        setDropTime(null);
        drop();
    }
    const hardDrop = () => {
        setDropTime(0);
    }

    const move = ({ keyCode }) => {
        if(!gameOver) {
            if(keyCode === 37) {
                movePlayer(-1);
            } else if (keyCode === 39) {
                movePlayer(1);
            } else if (keyCode === 38) {
                playerRotate(stage, 1);                
            } else if (keyCode === 32) {
                hardDrop();
            } else if (keyCode === 40) {
                dropPlayer();
            }
        }
    }


    useInterval(() => {
        drop();
    }, dropTime);

    return(
        <StyledTetrisWrapper id="TetrisWrpper" role='button' tabIndex='0' onKeyDown={e => move(e)} onKeyUp={keyUp}>
            {gameOver ? (<GameOver score={score} restart = {startGame} setIsStart = {setIsStart}/>) : (
            <StyledTetris>
                <Stage stage={ stage } ghostPos={ghostPositions} />
                <aside>
                    <Preview queue={queue} />
                    <div>
                        <Display text={`Score : ${score}`} />
                        <Display text={`Lines : ${rows}`} />
                        <Display text={`Level : ${level}`} />
                        <StartButton callback={startGame} isPlaying={isPlaying} />
                    </div>
                </aside>
            </StyledTetris>
            )}
        </StyledTetrisWrapper>
    );
}

export default Tetris;
