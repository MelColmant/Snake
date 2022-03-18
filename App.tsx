import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, View, Text, Pressable, Modal } from 'react-native';
import useInterval from './UseInterval'

const HEIGHT: number = 9;
const WIDTH: number = 9;
const INITIAL_DELAY: number = 2000;
const DELAY_DECREASE: number = 50;

interface gridElement {
  i: number;
  j: number;
}

enum Direction {
  Right, Down, Left, Up
}

const App = (): JSX.Element => {

  const startingSnake: gridElement[] = [{ i: 4, j: 4 }, { i: 4, j: 3 }, { i: 4, j: 2 }, { i: 4, j: 1 }];

  const [snake, setSnake] = useState<gridElement[]>(startingSnake);
  const [apple, setApple] = useState<null | gridElement>(null);
  const [delay, setDelay] = useState<null | number>(null);
  const [direction, setDirection] = useState<Direction>(Direction.Right);
  const [score, setScore] = useState<number>(0);
  const [pause, setPause] = useState<null | number>(null);
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [disableButtons, setDisableButtons] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const board = (): JSX.Element[] => [...Array(HEIGHT)].map((_, i) => <View key={i} style={styles.row}>{row(i + 1)}</View>);
  const row = (height: number): JSX.Element[] => [...Array(WIDTH)].map((_, i) => gridItem(height, i + 1));
  const gridItem = (i: number, j: number): JSX.Element => {
    return <View style={isSnakeHead(i, j) ? styles.snakeHead : isSnakeElement(i, j) ? styles.snakeItem : isApple(i, j) ? styles.apple : styles.gridItem} key={i.toString() + j.toString()}>
      {/* <Text style={styles.textItem}>{i} {j}</Text> */}
      <Text style={styles.textItem}></Text>
    </View>;
  }

  const isApple = (i: number, j: number): null | boolean => apple && apple.i === i && apple.j === j;
  const isSnakeElement = (i: number, j: number): undefined | gridElement => snake.find((el: { i: number; j: number; }) => el.i === i && el.j === j);
  const isSnakeHead = (i: number, j: number): boolean => snake[0].i === i && snake[0].j === j;

  const generateApple = (): void => {
    const i = Math.floor(Math.random() * HEIGHT) + 1;
    const j = Math.floor(Math.random() * WIDTH) + 1;
    snake.find((el: { i: number; j: number; }) => el.i === i && el.j === j) ?
      generateApple() : setApple({ i, j } as gridElement);
  }

  const appleEaten = (): null | boolean => {
    return apple && snake[0].i === apple.i && snake[0].j === apple.j;
  }

  const snakeEaten = (): undefined | gridElement => {
    return snake.find((el: { i: number; j: number; }) => el.i === snake[0].i && el.j === snake[0].j && snake.indexOf(el) !== 0);
  }

  const onSnakeEaten = (): void => {
    setDelay(null);
    setDisableButtons(true);
    setModalVisible(true);
  }

  useInterval(() => {
    !apple && generateApple();
    if (snakeEaten()) { onSnakeEaten(); return }
    if (direction === Direction.Right) {
      if (snake[0].j < WIDTH) {
        if (appleEaten()) {
          setSnake([{ i: snake[0].i, j: snake[0].j + 1 } as gridElement, ...snake]);
          updateGame();
        } else setSnake([{ i: snake[0].i, j: snake[0].j + 1 } as gridElement, ...snake.slice(0, -1)]);
      } else {
        if (appleEaten()) {
          setSnake([{ i: snake[0].i, j: 1 } as gridElement, ...snake]);
          updateGame();
        } else setSnake([{ i: snake[0].i, j: 1 } as gridElement, ...snake.slice(0, -1)]);
      }
    }
    if (direction === Direction.Left) {
      if (snake[0].j > 1) {
        if (appleEaten()) {
          setSnake([{ i: snake[0].i, j: snake[0].j - 1 } as gridElement, ...snake]);
          updateGame();
        } else setSnake([{ i: snake[0].i, j: snake[0].j - 1 } as gridElement, ...snake.slice(0, -1)]);
      } else {
        if (appleEaten()) {
          setSnake([{ i: snake[0].i, j: WIDTH } as gridElement, ...snake]);
          updateGame();
        } else setSnake([{ i: snake[0].i, j: WIDTH } as gridElement, ...snake.slice(0, -1)]);
      }
    }
    if (direction === Direction.Down) {
      if (snake[0].i < HEIGHT) {
        if (appleEaten()) {
          setSnake([{ i: snake[0].i + 1, j: snake[0].j } as gridElement, ...snake]);
          updateGame();
        } else setSnake([{ i: snake[0].i + 1, j: snake[0].j } as gridElement, ...snake.slice(0, -1)]);
      } else {
        if (appleEaten()) {
          setSnake([{ i: 1, j: snake[0].j } as gridElement, ...snake]);
          updateGame();
        } else setSnake([{ i: 1, j: snake[0].j } as gridElement, ...snake.slice(0, -1)]);
      }
    }
    if (direction === Direction.Up) {
      if (snake[0].i > 1) {
        if (appleEaten()) {
          setSnake([{ i: snake[0].i - 1, j: snake[0].j } as gridElement, ...snake]);
          updateGame();
        } else setSnake([{ i: snake[0].i - 1, j: snake[0].j } as gridElement, ...snake.slice(0, -1)]);
      } else {
        if (appleEaten()) {
          setSnake([{ i: HEIGHT, j: snake[0].j } as gridElement, ...snake]);
          updateGame();
        } else setSnake([{ i: HEIGHT, j: snake[0].j } as gridElement, ...snake.slice(0, -1)]);
      }
    }
  }, delay);

  const updateGame = (): void => {
    generateApple();
    setScore((prev) => prev + 1);
    setDelay((prev) => prev && prev - DELAY_DECREASE);
  }

  const updateDirection = (newDirection: Direction): void => {
    if (newDirection !== direction && !areOpposite(newDirection, direction)) {
      setDirection(newDirection);
    }
  }

  const areOpposite = (newDirection: Direction, direction: Direction): boolean => {
    if (newDirection === Direction.Down) return direction === Direction.Up;
    if (newDirection === Direction.Up) return direction === Direction.Down;
    if (newDirection === Direction.Right) return direction === Direction.Left;
    else return direction === Direction.Right;
  }

  const onPausePressed = (): void => {
    if (pause) {
      setDelay(pause);
      setPause(null);
    } else {
      setPause(delay);
      setDelay(null);
    }
  }

  const onStartPressed = (): void => {
    if (!hasStarted) {
      setHasStarted(true);
      setDelay(INITIAL_DELAY);
    } else { newGame(true); }
  }

  const newGame = (restart: boolean): void => {
    !restart && setModalVisible(!modalVisible);
    setHasStarted(false);
    setPause(null);
    setDirection(Direction.Right);
    setDelay(null);
    setSnake(startingSnake);
    setScore(0);
    setDisableButtons(false);
  }

  return (
    <View style={styles.container}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => newGame(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modal}>
            <Text style={styles.modalText}>Game Over!</Text>
            <Pressable
              style={styles.button}
              onPress={() => newGame(false)}
            >
              <Text>New Game</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      <View style={styles.scoreView}>
        <Text style={styles.scoreText}>Your score: </Text><Text style={styles.scoreNumber}>{score}</Text>
      </View>
      {board()}
      <View style={styles.buttonsView}>
        <Pressable onPress={onStartPressed} disabled={disableButtons}>
          <View style={disableButtons ? styles.disabledButton : styles.button}>
            <Text style={styles.buttonText}>{!hasStarted ? 'Start' : 'Reset'}</Text>
          </View>
        </Pressable>
        <Pressable onPress={() => updateDirection(Direction.Up)}>
          <View style={styles.button}>
            <Text style={styles.buttonText}>Up</Text>
          </View>
        </Pressable>
        <View style={styles.row}>
          <Pressable onPress={() => updateDirection(Direction.Left)}>
            <View style={styles.button}>
              <Text style={styles.buttonText}>Left</Text>
            </View>
          </Pressable>
          <Pressable onPress={onPausePressed} disabled={disableButtons}>
            <View style={disableButtons ? styles.disabledButton : styles.button}>
              <Text style={styles.buttonText}>{pause ? 'Continue' : 'Pause'}</Text>
            </View>
          </Pressable>
          <Pressable onPress={() => updateDirection(Direction.Right)}>
            <View style={styles.button}>
              <Text style={styles.buttonText}>Right</Text>
            </View>
          </Pressable>
        </View>
        <Pressable onPress={() => updateDirection(Direction.Down)}>
          <View style={styles.button}>
            <Text style={styles.buttonText}>Down</Text>
          </View>
        </Pressable>
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal: {
    width: 160,
    height: 100,
    backgroundColor: '#5AA469',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#D35D6E',
    borderRadius: 4,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
  },
  gridItem: {
    borderColor: 'grey',
    borderWidth: 1,
    width: 30,
    height: 30,
  },
  textItem: {
    textAlign: 'center',
  },
  snakeItem: {
    borderColor: '#EFB08C',
    borderWidth: 1,
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#5AA469',
  },
  snakeHead: {
    borderColor: '#5AA469',
    borderWidth: 2,
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#EFB08C',
  },
  apple: {
    borderColor: '#F8D49D',
    borderWidth: 2,
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#D35D6E',
  },
  buttonsView: {
    margin: 15,
  },
  button: {
    borderColor: '#D35D6E',
    backgroundColor: '#EFB08C',
    borderWidth: 2,
    borderRadius: 4,
    marginVertical: 6,
    marginHorizontal: 12,
    padding: 4,
  },
  disabledButton: {
    borderColor: '#D35D6E',
    backgroundColor: 'grey',
    borderWidth: 2,
    borderRadius: 4,
    marginVertical: 6,
    marginHorizontal: 12,
    padding: 4,
  },
  buttonText: {
    textAlign: 'center',
    color: '#D35D6E',
  },
  scoreView: {
    marginBottom: 15,
    flexDirection: 'row',
  },
  scoreText: {
    fontSize: 18,
    color: 'black',
  },
  scoreNumber: {
    fontSize: 18,
    color: '#5AA469',
  }
});

export default App;
