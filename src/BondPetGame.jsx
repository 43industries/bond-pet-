import React, { useState, useEffect, useRef } from 'react';
import { Heart, Star, Gift, Sparkles, ShoppingBag, Zap, Trophy, Gamepad2 } from 'lucide-react';

const GameShell = ({ bgClass, children, maxWidth = 'max-w-lg' }) => (
  <div className={`min-h-screen p-3 sm:p-5 relative overflow-hidden game-shell-glow ${bgClass}`}>
    <div className={`relative ${maxWidth} mx-auto`}>{children}</div>
  </div>
);

const GameCard = ({ children, className = '' }) => (
  <div className={`game-card p-4 sm:p-5 ${className}`}>{children}</div>
);

const GameHeader = ({ title, onBack, actions, titleClass = 'text-stone-900' }) => (
  <div className="flex justify-between items-center gap-2 mb-4">
    <h2 className={`game-title text-2xl sm:text-3xl font-bold ${titleClass}`}>{title}</h2>
    <div className="flex gap-2 shrink-0">
      {actions}
      {onBack && (
        <button type="button" onClick={onBack}
          className="ctrl-btn bg-stone-800 text-white px-3 py-2 text-sm">
          ← Back
        </button>
      )}
    </div>
  </div>
);

const StatPill = ({ label, value, tone = 'bg-teal-100 text-teal-900' }) => (
  <div className={`rounded-2xl px-3 py-2.5 text-center shadow-sm ${tone}`}>
    <div className="text-xl font-extrabold leading-none">{value}</div>
    <div className="text-[10px] uppercase tracking-wider opacity-75 mt-1 font-bold">{label}</div>
  </div>
);

const BondPetGame = () => {
  const [gameState, setGameState] = useState('welcome');
  const [playerName, setPlayerName] = useState('');
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [relationshipMode, setRelationshipMode] = useState(null);
  const [selectedPetType, setSelectedPetType] = useState(null);
  
  // Interactive care activity states
  const [feedingStep, setFeedingStep] = useState(0); // 0: prepare, 1: feeding, 2: done
  const [teachingStep, setTeachingStep] = useState(0); // 0: choose, 1: teaching, 2: done
  const [bedtimeStep, setBedtimeStep] = useState(0); // 0: routine, 1: pajamas, 2: brush teeth, 3: story, 4: tuck in, 5: done
  const [pajamasProgress, setPajamasProgress] = useState(0);
  const [teethBrushingProgress, setTeethBrushingProgress] = useState(0);
  const [feedingProgress, setFeedingProgress] = useState(0);
  const [teachingActivity, setTeachingActivity] = useState(null);
  const [bedtimeStory, setBedtimeStory] = useState('');
  const [selectedFood, setSelectedFood] = useState(null);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  
  // Parent-Child bonding states
  const [learnAboutEachOtherIndex, setLearnAboutEachOtherIndex] = useState(0);
  const [parentTeachesIndex, setParentTeachesIndex] = useState(0);
  const [selectedLesson, setSelectedLesson] = useState(null);
  
  const [gameData, setGameData] = useState({
    pet: { 
      name: 'Buddy', 
      type: 'dog', 
      happiness: 50, 
      level: 1,
      hunger: 70, // 0-100
      energy: 70, // 0-100
      love: 50, // 0-100, grows through co-parenting
      cleanliness: 70, // 0-100, needs showering
      sleepiness: 50, // 0-100, needs bedtime
      learning: 30, // 0-100, grows through teaching
      isSleeping: false // Whether pet is currently sleeping
    },
    inventory: [],
    foodInventory: {}, // { '🍎': 0, '🍌': 0, etc. }
    coins: 20,
    conversationsCompleted: 0,
    relationshipProgress: 0, // 0-100, tracks relationship strength
    bondLevel: 1, // Levels up as relationship progresses
    unlockedPets: ['dog'],
    puzzlesCompleted: 0,
    sharedProgress: 0,
    gamesWon: 0,
    bibleVerses: [],
    conversationHistory: [], // Track conversation topics/questions
    careHistory: [], // Track who cared for the pet and when
    lastCareAction: null // Track last action taken
  });

  const petTypes = [
    { 
      id: 'dog', name: 'Buddy', emoji: '🐶', happy: '🐶', neutral: '🐕', sad: '😢', excited: '😎',
      cost: 0, unlocked: true, unlockCondition: 'Starting pet',
      description: 'Your loyal companion from the start!'
    },
    { 
      id: 'cat', name: 'Whiskers', emoji: '🐱', happy: '😸', neutral: '🐈', sad: '😿', excited: '😻',
      cost: 100, unlocked: false, unlockCondition: 'Earn 100 coins',
      description: 'A playful cat friend!'
    },
    { 
      id: 'bunny', name: 'Hopper', emoji: '🐰', happy: '😊', neutral: '🐇', sad: '😔', excited: '🤗',
      cost: 200, unlocked: false, unlockCondition: 'Complete 5 puzzles',
      description: 'A cute and energetic bunny!'
    },
    { 
      id: 'panda', name: 'Bamboo', emoji: '🐼', happy: '😊', neutral: '🐾', sad: '😟', excited: '🤩',
      cost: 300, unlocked: false, unlockCondition: 'Reach 50% shared progress',
      description: 'A gentle and friendly panda!'
    },
    { 
      id: 'bear', name: 'Honey', emoji: '🐻', happy: '😊', neutral: '🧸', sad: '😞', excited: '🤗',
      cost: 400, unlocked: false, unlockCondition: 'Earn 500 coins',
      description: 'A cuddly bear friend!'
    },
    { 
      id: 'fox', name: 'Swift', emoji: '🦊', happy: '😊', neutral: '🦊', sad: '😕', excited: '😎',
      cost: 500, unlocked: false, unlockCondition: 'Win 10 games',
      description: 'A clever and quick fox!'
    },
    { 
      id: 'penguin', name: 'Waddle', emoji: '🐧', happy: '😊', neutral: '🐧', sad: '😢', excited: '🤩',
      cost: 600, unlocked: false, unlockCondition: 'Reach 75% shared progress',
      description: 'A cool and charming penguin!'
    },
    { 
      id: 'unicorn', name: 'Sparkle', emoji: '🦄', happy: '😊', neutral: '🦄', sad: '😔', excited: '✨',
      cost: 1000, unlocked: false, unlockCondition: 'Reach 100% shared progress',
      description: 'A magical unicorn companion!'
    },
    { 
      id: 'dragon', name: 'Flame', emoji: '🐉', happy: '😊', neutral: '🐲', sad: '😤', excited: '🔥',
      cost: 1500, unlocked: false, unlockCondition: 'Earn 2000 coins',
      description: 'A powerful dragon friend!'
    },
    { 
      id: 'phoenix', name: 'Ember', emoji: '🔥', happy: '😊', neutral: '🦅', sad: '😔', excited: '🌟',
      cost: 2000, unlocked: false, unlockCondition: 'Complete 50 puzzles',
      description: 'A legendary phoenix companion!'
    }
  ];
  
  // Food shop items (defined early so pet hub can read inventory safely)
  const foodItems = [
    { emoji: '🍎', name: 'Apple', cost: 5, nutrition: 15 },
    { emoji: '🍌', name: 'Banana', cost: 5, nutrition: 15 },
    { emoji: '🥕', name: 'Carrot', cost: 4, nutrition: 12 },
    { emoji: '🍞', name: 'Bread', cost: 6, nutrition: 18 },
    { emoji: '🥛', name: 'Milk', cost: 8, nutrition: 20 },
    { emoji: '🥚', name: 'Egg', cost: 7, nutrition: 20 },
    { emoji: '🍇', name: 'Grapes', cost: 6, nutrition: 15 },
    { emoji: '🍓', name: 'Strawberry', cost: 5, nutrition: 12 },
    { emoji: '🍗', name: 'Chicken', cost: 12, nutrition: 30 },
    { emoji: '🥗', name: 'Salad', cost: 10, nutrition: 25 }
  ];

  // Puzzle games states (match-3)
  const [puzzleBoard, setPuzzleBoard] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(25);
  const [combo, setCombo] = useState(0);
  const [specialPieces, setSpecialPieces] = useState({});
  const [powerups, setPowerups] = useState({ shuffle: 1, hammer: 2, colorBomb: 1 });
  const [selectedPowerup, setSelectedPowerup] = useState(null);
  const [targetScore, setTargetScore] = useState(1000);
  const [animating, setAnimating] = useState(false);
  const [matchAnimations, setMatchAnimations] = useState(new Set());
  const [lastSwap, setLastSwap] = useState(null);

  const colors = ['🔴', '🔵', '🟢', '🟡', '🟣', '🟠'];
  const SPECIAL_TYPES = {
    ROCKET_H: '🚀→',
    ROCKET_V: '🚀↓',
    BOMB: '💣',
    RAINBOW: '🌈'
  };
  
  // Brick games states
  const [brickGameType, setBrickGameType] = useState(null); // 'tetris', 'snake', 'brickbreaker'
  
  // Tetris states
  const [tetrisBoard, setTetrisBoard] = useState(Array(20).fill(null).map(() => Array(10).fill(0)));
  const [tetrisPiece, setTetrisPiece] = useState(null);
  const [tetrisScore, setTetrisScore] = useState(0);
  const [tetrisLevel, setTetrisLevel] = useState(1);
  const [tetrisLines, setTetrisLines] = useState(0);
  const [tetrisGameOver, setTetrisGameOver] = useState(false);
  const [tetrisPaused, setTetrisPaused] = useState(false);
  const [tetrisFallTime, setTetrisFallTime] = useState(1000);
  const [tetrisNextPiece, setTetrisNextPiece] = useState(null);
  const tetrisNextRef = useRef(null);
  const tetrisRef = useRef({ board: null, piece: null, gameOver: false, paused: false });

  // Snake states (must be before snake useEffects)
  const [snakeGame, setSnakeGame] = useState(null);
  const [snakeScore, setSnakeScore] = useState(0);
  const [snakeGameOver, setSnakeGameOver] = useState(false);
  const [snakeRunning, setSnakeRunning] = useState(false);
  const snakeRef = useRef({ snake: [], direction: 'right', food: null, gameOver: false, running: false });

  // Brick Breaker states (must be before brick breaker useEffects)
  const [brickBreakerGame, setBrickBreakerGame] = useState(null);
  const [brickBreakerScore, setBrickBreakerScore] = useState(0);
  const [brickBreakerGameOver, setBrickBreakerGameOver] = useState(false);
  const [brickBreakerRunning, setBrickBreakerRunning] = useState(false);
  const brickBreakerRef = useRef(null);
  const brickBreakerCanvasRef = useRef(null);

  // Word search selection
  const [wordSelection, setWordSelection] = useState([]);
  const [wordSelecting, setWordSelecting] = useState(false);
  const [wordHighlighted, setWordHighlighted] = useState([]);
  const wordSelectionRef = useRef([]);

  // Escape room / two-player UI
  const [escapeAnswer, setEscapeAnswer] = useState('');
  const [escapeFeedback, setEscapeFeedback] = useState('');
  const [passBanner, setPassBanner] = useState('');
  const [player2Name, setPlayer2Name] = useState('');
  const [saveMessage, setSaveMessage] = useState('');

  // Keep ref in sync
  useEffect(() => {
    tetrisRef.current = { board: tetrisBoard, piece: tetrisPiece, gameOver: tetrisGameOver, paused: tetrisPaused };
    tetrisNextRef.current = tetrisNextPiece;
  }, [tetrisBoard, tetrisPiece, tetrisGameOver, tetrisPaused, tetrisNextPiece]);

  const [snakeMessage, setSnakeMessage] = useState('');
  // Snake game loop
  useEffect(() => {
    if (gameState !== 'snake' || !snakeRunning || snakeGameOver) return undefined;
    const speed = Math.max(70, 160 - Math.floor(snakeScore / 30) * 12);
    const tick = () => {
      const ref = snakeRef.current;
      if (!ref.running || ref.gameOver) return;
      const direction = ref.nextDirection || ref.direction;
      const head = ref.snake[0];
      if (!head) return;
      const next = {
        x: head.x + (direction === 'right' ? 1 : direction === 'left' ? -1 : 0),
        y: head.y + (direction === 'down' ? 1 : direction === 'up' ? -1 : 0)
      };
      const size = 15;
      if (next.x < 0 || next.y < 0 || next.x >= size || next.y >= size ||
          ref.snake.some(s => s.x === next.x && s.y === next.y)) {
        ref.gameOver = true;
        ref.running = false;
        setSnakeGameOver(true);
        setSnakeRunning(false);
        setSnakeMessage('Crashed!');
        return;
      }
      const grew = ref.food && next.x === ref.food.x && next.y === ref.food.y;
      const newSnake = [next, ...ref.snake];
      if (!grew) newSnake.pop();
      else {
        let food;
        do {
          food = { x: Math.floor(Math.random() * size), y: Math.floor(Math.random() * size) };
        } while (newSnake.some(s => s.x === food.x && s.y === food.y));
        ref.food = food;
        setSnakeScore(s => s + 10);
        setSnakeMessage('Yum! +10');
        setTimeout(() => setSnakeMessage(''), 600);
      }
      ref.snake = newSnake;
      ref.direction = direction;
      setSnakeGame({ snake: newSnake, direction, nextDirection: direction, food: ref.food });
    };
    const id = setInterval(tick, speed);
    return () => clearInterval(id);
  }, [gameState, snakeRunning, snakeGameOver, snakeScore]);

  useEffect(() => {
    if (gameState !== 'snake') return undefined;
    const onKey = (e) => {
      const map = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };
      if (map[e.key]) {
        e.preventDefault();
        const dir = map[e.key];
        const opposite = { up: 'down', down: 'up', left: 'right', right: 'left' };
        const current = snakeRef.current.direction;
        if (opposite[dir] === current) return;
        snakeRef.current.nextDirection = dir;
        setSnakeGame(prev => prev ? { ...prev, nextDirection: dir } : prev);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [gameState]);

  // Brick breaker loop
  useEffect(() => {
    if (gameState !== 'brickbreaker' || !brickBreakerRunning || brickBreakerGameOver) return undefined;
    const id = setInterval(() => {
      const ref = brickBreakerRef.current;
      if (!ref || !ref.running || ref.gameOver) return;
      let { ballX, ballY, ballVX, ballVY, paddleX, paddleW, width, height, bricks } = ref;
      ballX += ballVX;
      ballY += ballVY;
      if (ballX <= 0 || ballX >= width - 8) ballVX *= -1;
      if (ballY <= 0) ballVY *= -1;
      if (ballY + 8 >= height - 24 && ballX >= paddleX && ballX <= paddleX + paddleW) {
        ballVY = -Math.abs(ballVY);
        ballVX += (ballX - (paddleX + paddleW / 2)) * 0.08;
      }
      let scoreGain = 0;
      bricks = bricks.map(b => {
        if (!b.alive) return b;
        if (ballX + 8 > b.x && ballX < b.x + b.w && ballY + 8 > b.y && ballY < b.y + b.h) {
          ballVY *= -1;
          scoreGain += 10;
          return { ...b, alive: false };
        }
        return b;
      });
      if (scoreGain) {
        ref.score += scoreGain;
        setBrickBreakerScore(ref.score);
      }
      if (ballY > height) {
        ref.gameOver = true;
        ref.running = false;
        setBrickBreakerGameOver(true);
        setBrickBreakerRunning(false);
      }
      if (bricks.every(b => !b.alive)) {
        ref.won = true;
        ref.gameOver = true;
        ref.running = false;
        setBrickBreakerGameOver(true);
        setBrickBreakerRunning(false);
      }
      Object.assign(ref, { ballX, ballY, ballVX, ballVY, bricks });
      setBrickBreakerGame({
        paddleX: ref.paddleX,
        ballX,
        ballY,
        ballVX,
        ballVY,
        bricks,
        width,
        height,
        paddleW
      });
    }, 30);
    return () => clearInterval(id);
  }, [gameState, brickBreakerRunning, brickBreakerGameOver]);

  useEffect(() => {
    if (gameState !== 'brickbreaker') return undefined;
    const onKey = (e) => {
      const ref = brickBreakerRef.current;
      if (!ref) return;
      if (e.key === 'ArrowLeft') ref.paddleX = Math.max(0, ref.paddleX - 20);
      if (e.key === 'ArrowRight') ref.paddleX = Math.min(ref.width - ref.paddleW, ref.paddleX + 20);
      setBrickBreakerGame(prev => prev ? { ...prev, paddleX: ref.paddleX } : prev);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [gameState]);

  // Board games states
  const [ticTacToeBoard, setTicTacToeBoard] = useState(Array(9).fill(null));
  const [ticTacToePlayer, setTicTacToePlayer] = useState('X');
  const [ticTacToeWinner, setTicTacToeWinner] = useState(null);
  const [connect4Board, setConnect4Board] = useState(Array(6).fill(null).map(() => Array(7).fill(null)));
  const [connect4Player, setConnect4Player] = useState('🔴');
  const [connect4Winner, setConnect4Winner] = useState(null);

  // Ludo (local multiplayer)
  const [ludoPlayers, setLudoPlayers] = useState([]);
  const [ludoTurn, setLudoTurn] = useState(0);
  const [ludoDice, setLudoDice] = useState(null);
  const [ludoRolled, setLudoRolled] = useState(false);
  const [ludoWinner, setLudoWinner] = useState(null);
  const [ludoMessage, setLudoMessage] = useState('');
  const [ludoPlayerCount, setLudoPlayerCount] = useState(2);
  
  // Checkers states
  const [checkersBoard, setCheckersBoard] = useState([]);
  const [checkersPlayer, setCheckersPlayer] = useState('red');
  const [checkersSelected, setCheckersSelected] = useState(null);
  const [checkersWinner, setCheckersWinner] = useState(null);
  const [checkersLegalTargets, setCheckersLegalTargets] = useState([]);
  const [checkersJumping, setCheckersJumping] = useState(null);
  const [checkersMessage, setCheckersMessage] = useState('');
  
  // Mini Golf states
  const [golfHole, setGolfHole] = useState(1);
  const [golfScore, setGolfScore] = useState(0);
  const [golfStrokes, setGolfStrokes] = useState(0);
  const [golfBallPos, setGolfBallPos] = useState({ x: 20, y: 70 });
  const [golfVel, setGolfVel] = useState({ x: 0, y: 0 });
  const [golfAim, setGolfAim] = useState(0); // degrees
  const [golfPower, setGolfPower] = useState(40);
  const [golfMoving, setGolfMoving] = useState(false);
  const [golfHolePos] = useState({ x: 82, y: 22 });
  const [golfDone, setGolfDone] = useState(false);
  const golfBallRef = useRef({ x: 20, y: 70, vx: 0, vy: 0 });
  
  // Word games states
  const [wordGameType, setWordGameType] = useState(null);
  const [hangmanWord, setHangmanWord] = useState('');
  const [hangmanGuessed, setHangmanGuessed] = useState([]);
  const [hangmanWrong, setHangmanWrong] = useState(0);
  const [hangmanWon, setHangmanWon] = useState(false);
  const [scrambledWord, setScrambledWord] = useState('');
  const [currentWord, setCurrentWord] = useState('');
  const [scrambleScore, setScrambleScore] = useState(0);
  const [scrambleIndex, setScrambleIndex] = useState(0);
  const [scrambleInput, setScrambleInput] = useState('');
  
  // Card games states
  const [neverHaveIEverIndex, setNeverHaveIEverIndex] = useState(0);
  const [relationshipExplorerIndex, setRelationshipExplorerIndex] = useState(0);

  // Advanced puzzle games states
  const [puzzleGameType, setPuzzleGameType] = useState(null);
  
  // Tile matching (Mahjong-style) states
  const [tileBoard, setTileBoard] = useState([]);
  const [tileSelected, setTileSelected] = useState(null);
  const [tileScore, setTileScore] = useState(0);
  
  // Word puzzle states
  const [wordGrid, setWordGrid] = useState([]);
  const [wordFound, setWordFound] = useState([]);
  const [wordList, setWordList] = useState([]);
  
  // Jigsaw puzzle states
  const [jigsawPieces, setJigsawPieces] = useState([]);
  const [jigsawProgress, setJigsawProgress] = useState(0);
  
  // Logic puzzle states
  const [logicPuzzle, setLogicPuzzle] = useState(null);
  
  // Escape room states
  const [escapeRoom, setEscapeRoom] = useState(null);
  const [escapeInventory, setEscapeInventory] = useState([]);

  // Classic arcade games states
  const [pacmanMaze, setPacmanMaze] = useState([]);
  const [pacmanScore, setPacmanScore] = useState(0);
  const [pacmanLives, setPacmanLives] = useState(3);
  const [pacmanLevel, setPacmanLevel] = useState(1);
  const [pacmanDirection, setPacmanDirection] = useState('right');
  const [pacmanPos, setPacmanPos] = useState({ x: 1, y: 1 });
  const [pacmanGhosts, setPacmanGhosts] = useState([]);
  const [pacmanGameOver, setPacmanGameOver] = useState(false);
  const pacmanDirRef = useRef('right');
  const pacmanMazeRef = useRef([]);
  const pacmanHitCooldownRef = useRef(false);
  
  const [jetpackScore, setJetpackScore] = useState(0);
  const [jetpackY, setJetpackY] = useState(200);
  const [jetpackObstacles, setJetpackObstacles] = useState([]);
  const [jetpackGameOver, setJetpackGameOver] = useState(false);
  const [jetpackFlying, setJetpackFlying] = useState(false);
  const jetpackFlyingRef = useRef(false);
  const jetpackYRef = useRef(200);

  const handleJetpackFly = (pressed) => {
    jetpackFlyingRef.current = pressed;
    setJetpackFlying(pressed);
  };

  const createPacmanMaze = () => {
    const rows = 15;
    const cols = 19;
    const maze = Array(rows).fill(null).map(() => Array(cols).fill(2));
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (r === 0 || r === rows - 1 || c === 0 || c === cols - 1) maze[r][c] = 1;
        else if (r % 2 === 0 && c % 2 === 0) maze[r][c] = 1;
        else maze[r][c] = 2;
      }
    }
    maze[1][1] = 0;
    maze[1][cols - 2] = 0;
    maze[rows - 2][1] = 0;
    maze[rows - 2][cols - 2] = 0;
    return maze;
  };

  const initializePacman = () => {
    const maze = createPacmanMaze();
    pacmanMazeRef.current = maze.map(row => [...row]);
    setPacmanMaze(maze);
    setPacmanPos({ x: 1, y: 1 });
    setPacmanDirection('right');
    pacmanDirRef.current = 'right';
    setPacmanScore(0);
    setPacmanLives(3);
    setPacmanLevel(1);
    setPacmanGameOver(false);
    setPacmanGhosts([
      { x: 17, y: 1, color: '🔴' },
      { x: 17, y: 13, color: '🟣' }
    ]);
  };

  // Chess states
  const [chessBoard, setChessBoard] = useState(null);
  const [chessCurrentPlayer, setChessCurrentPlayer] = useState('white');
  const [chessSelectedSquare, setChessSelectedSquare] = useState(null);
  const [chessLegalTargets, setChessLegalTargets] = useState([]);
  const [chessGameOver, setChessGameOver] = useState(false);
  const [chessWinner, setChessWinner] = useState(null);
  const [chessStatusMsg, setChessStatusMsg] = useState('');
  const [chessEndReason, setChessEndReason] = useState(null); // checkmate | stalemate
  const [chessLastMove, setChessLastMove] = useState(null); // { from:[r,c], to:[r,c] }
  const [chessFlipped, setChessFlipped] = useState(false);
  const [chessCaptured, setChessCaptured] = useState({ white: [], black: [] });

  // Image/Memory game states
  const [imageMemoryCards, setImageMemoryCards] = useState([]);
  const [imageMemoryFlipped, setImageMemoryFlipped] = useState([]);
  const [imageMemoryMatched, setImageMemoryMatched] = useState([]);
  const [imageMemoryScore, setImageMemoryScore] = useState(0);
  const [imageMemoryMoves, setImageMemoryMoves] = useState(0);

  // Tetris pieces shapes
  const TETRIS_SHAPES = [
    [[1,1,1,1]], // I
    [[1,1],[1,1]], // O
    [[0,1,0],[1,1,1]], // T
    [[1,1,0],[0,1,1]], // S
    [[0,1,1],[1,1,0]], // Z
    [[1,0,0],[1,1,1]], // J
    [[0,0,1],[1,1,1]] // L
  ];

  const TETRIS_COLORS = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500'];

  // Bible Verses - focusing on humility and family bonds
  const BIBLE_VERSES = [
    { verse: "Humility is the fear of the Lord; its wages are riches and honor and life.", reference: "Proverbs 22:4", theme: "humility" },
    { verse: "Do nothing out of selfish ambition or vain conceit. Rather, in humility value others above yourselves.", reference: "Philippians 2:3", theme: "humility" },
    { verse: "Before a downfall the heart is haughty, but humility comes before honor.", reference: "Proverbs 18:12", theme: "humility" },
    { verse: "Honor your father and your mother, so that you may live long in the land the Lord your God is giving you.", reference: "Exodus 20:12", theme: "family" },
    { verse: "Children, obey your parents in the Lord, for this is right.", reference: "Ephesians 6:1", theme: "family" },
    { verse: "A wise son brings joy to his father, but a foolish son brings grief to his mother.", reference: "Proverbs 10:1", theme: "family" },
    { verse: "Train up a child in the way he should go; even when he is old he will not depart from it.", reference: "Proverbs 22:6", theme: "family" },
    { verse: "Whoever humbles himself like this child is the greatest in the kingdom of heaven.", reference: "Matthew 18:4", theme: "humility" },
    { verse: "Be completely humble and gentle; be patient, bearing with one another in love.", reference: "Ephesians 4:2", theme: "humility" },
    { verse: "When pride comes, then comes disgrace, but with humility comes wisdom.", reference: "Proverbs 11:2", theme: "humility" },
    { verse: "Clothe yourselves with humility toward one another, because 'God opposes the proud but shows favor to the humble.'", reference: "1 Peter 5:5", theme: "humility" },
    { verse: "The greatest among you will be your servant. For those who exalt themselves will be humbled, and those who humble themselves will be exalted.", reference: "Matthew 23:11-12", theme: "humility" },
    { verse: "A mother is not shaken by her children, and a daughter brings joy to her mother.", reference: "Proverbs 23:25 (adapted)", theme: "family" },
    { verse: "Start children off on the way they should go, and even when they are old they will not turn from it.", reference: "Proverbs 22:6", theme: "family" },
    { verse: "Listen, my son, to your father's instruction and do not forsake your mother's teaching.", reference: "Proverbs 1:8", theme: "family" }
  ];

  // Humility reflection prompts
  const HUMILITY_REFLECTIONS = [
    "How can you serve others today?",
    "What did you learn from someone else today?",
    "When did you put someone else's needs before your own?",
    "How did you show respect to your family today?",
    "What mistake taught you something important?",
    "How did you show appreciation for others?",
    "When did you ask for help today?",
    "How did you celebrate someone else's success?"
  ];
  
  const items = {
    friends: [
      { id: 'skateboard', name: 'Skateboard', cost: 50, icon: '🛹' },
      { id: 'cap', name: 'Cool Cap', cost: 30, icon: '🧢' },
      { id: 'game', name: 'Video Game', cost: 40, icon: '🎮' },
      { id: 'pizza', name: 'Pizza Party', cost: 25, icon: '🍕' }
    ],
    couples: [
      { id: 'rose', name: 'Rose', cost: 50, icon: '🌹' },
      { id: 'heart', name: 'Heart Necklace', cost: 60, icon: '💝' },
      { id: 'candle', name: 'Romantic Candles', cost: 40, icon: '🕯️' },
      { id: 'chocolate', name: 'Chocolates', cost: 30, icon: '🍫' }
    ],
    family: [
      { id: 'book', name: 'Story Book', cost: 35, icon: '📚' },
      { id: 'photo', name: 'Family Photo', cost: 45, icon: '📷' },
      { id: 'cake', name: 'Birthday Cake', cost: 50, icon: '🎂' },
      { id: 'blanket', name: 'Cozy Blanket', cost: 40, icon: '🧸' }
    ],
    parentChild: [
      { id: 'book', name: 'Story Book', cost: 35, icon: '📚' },
      { id: 'photo', name: 'Family Photo', cost: 45, icon: '📷' },
      { id: 'cake', name: 'Birthday Cake', cost: 50, icon: '🎂' },
      { id: 'blanket', name: 'Cozy Blanket', cost: 40, icon: '🧸' },
      { id: 'ball', name: 'Soccer Ball', cost: 40, icon: '⚽' },
      { id: 'game', name: 'Board Game', cost: 45, icon: '🎲' }
    ],
    'mother-daughter': [
      { id: 'book', name: 'Story Book', cost: 35, icon: '📚' },
      { id: 'photo', name: 'Photo Album', cost: 45, icon: '📷' },
      { id: 'jewelry', name: 'Special Jewelry', cost: 60, icon: '💍' },
      { id: 'tea', name: 'Tea Time Set', cost: 40, icon: '☕' }
    ],
    'mother-father-son': [
      { id: 'ball', name: 'Soccer Ball', cost: 40, icon: '⚽' },
      { id: 'game', name: 'Board Game', cost: 45, icon: '🎲' },
      { id: 'trophy', name: 'Trophy', cost: 55, icon: '🏆' },
      { id: 'tool', name: 'Tool Set', cost: 50, icon: '🔧' }
    ],
    mother: [
      { id: 'flowers', name: 'Bouquet', cost: 45, icon: '🌸' },
      { id: 'card', name: 'Handmade Card', cost: 25, icon: '💌' },
      { id: 'breakfast', name: 'Breakfast in Bed', cost: 50, icon: '🍳' },
      { id: 'hug', name: 'Warm Hug', cost: 0, icon: '🤗' }
    ]
  };

  // Card Game Questions
  const neverHaveIEverQuestions = {
    friends: [
      "Never have I ever stayed up all night talking",
      "Never have I ever had a secret I've never told anyone",
      "Never have I ever done something I'm embarrassed about",
      "Never have I ever had a crush on a friend",
      "Never have I ever lied to get out of plans",
      "Never have I ever sent a text to the wrong person",
      "Never have I ever stalked someone on social media",
      "Never have I ever eaten something off the floor",
      "Never have I ever cried during a movie",
      "Never have I ever had a dream about someone here",
      "Never have I ever pretended to be sick to skip something",
      "Never have I ever snooped through someone's phone",
      "Never have I ever had a one-sided friendship",
      "Never have I ever been jealous of a friend",
      "Never have I ever done something dangerous for fun"
    ],
    couples: [
      "Never have I ever thought about marrying you",
      "Never have I ever been attracted to someone else while with you",
      "Never have I ever snooped through your phone",
      "Never have I ever faked being asleep",
      "Never have I ever had a fantasy about someone else",
      "Never have I ever kept a secret from you",
      "Never have I ever been jealous of your friends",
      "Never have I ever thought about breaking up",
      "Never have I ever compared you to an ex",
      "Never have I ever lied about liking something you do",
      "Never have I ever been turned on by someone else",
      "Never have I ever pretended to enjoy something",
      "Never have I ever thought you were checking someone out",
      "Never have I ever been insecure about our relationship",
      "Never have I ever wanted to try something new in bed"
    ],
    family: [
      "Never have I ever kept a secret from family",
      "Never have I ever been embarrassed by family",
      "Never have I ever lied to avoid family time",
      "Never have I ever had a favorite family member",
      "Never have I ever resented a family member",
      "Never have I ever been jealous of a sibling",
      "Never have I ever felt misunderstood by family",
      "Never have I ever wanted to move away",
      "Never have I ever hidden something from parents",
      "Never have I ever wished for a different family",
      "Never have I ever felt judged by family",
      "Never have I ever cried because of family",
      "Never have I ever been proud of a family member",
      "Never have I ever felt unloved by family",
      "Never have I ever wanted to express feelings I haven't"
    ],
    parentChild: [
      "Never have I ever kept a secret from my parent/child",
      "Never have I ever been proud of something my parent/child did",
      "Never have I ever wanted to understand my parent/child better",
      "Never have I ever learned something new from my parent/child",
      "Never have I ever felt misunderstood by my parent/child",
      "Never have I ever been surprised by something my parent/child said",
      "Never have I ever wanted to spend more time together",
      "Never have I ever been amazed by my parent/child's knowledge",
      "Never have I ever wished I could teach my parent/child something",
      "Never have I ever felt grateful for our relationship",
      "Never have I ever wanted to share a hobby with my parent/child",
      "Never have I ever been curious about my parent/child's interests",
      "Never have I ever wanted to learn something together",
      "Never have I ever felt proud to be their parent/child",
      "Never have I ever wanted to create a special memory together"
    ]
  };

  const relationshipExplorerQuestions = {
    friends: [
      "What's something you've always wanted to tell me but never have?",
      "What do you think is my biggest fear?",
      "What's a memory of us you'll never forget?",
      "If we could do anything together, what would it be?",
      "What makes you feel most connected to me?",
      "What's something I do that you secretly love?",
      "What's a way I've changed your life?",
      "What's something you want me to know about you?",
      "What's your favorite thing about our friendship?",
      "What's something we should do together more?",
      "What's a dream you've never shared with me?",
      "How do you think I see you?",
      "What's something I don't know about you?",
      "What would make our friendship stronger?",
      "What's a secret wish you have for us?"
    ],
    couples: [
      "What's something you're curious to explore with me?",
      "What makes you feel most loved by me?",
      "What's a fantasy you've never told me about?",
      "What's something intimate you want to try?",
      "What's your favorite memory of us being intimate?",
      "What's something I do that turns you on the most?",
      "What's a kink or preference you want to share?",
      "What's something you want more of in our relationship?",
      "What's a way you want me to touch you?",
      "What's something romantic you've always wanted to do?",
      "What makes you feel most vulnerable with me?",
      "What's a boundary you want to explore?",
      "What's something you're shy to ask for?",
      "What's your idea of perfect intimacy?",
      "What's something new you want to discover together?"
    ],
    family: [
      "What's something you wish you could tell me?",
      "What's a memory of us that means the most to you?",
      "What's something you've always wanted to know about me?",
      "What makes you feel most connected to our family?",
      "What's a way I've influenced who you are?",
      "What's something you're proud of about me?",
      "What's a family tradition you want to create?",
      "What's something you want to understand better about me?",
      "What's a way we could grow closer?",
      "What's something you've learned from me?",
      "What's a worry you have about our relationship?",
      "What's something you want me to know about yourself?",
      "What's a hope you have for our future?",
      "What's something that brings us together?",
      "What's a way you want to support me more?"
    ],
    parentChild: [
      "What's something you've always wanted to know about me?",
      "What's a memory of us that makes you happy?",
      "What's something I do that makes you feel loved?",
      "What's something you want to teach me?",
      "What's something you want to learn from me?",
      "What's your favorite thing we do together?",
      "What's something you're curious about that I know?",
      "What's a skill you'd like me to help you learn?",
      "What's something about me that surprises you?",
      "What's a hobby or interest you'd like to share with me?",
      "What's something you're proud of that I taught you?",
      "What's a question you've always wanted to ask me?",
      "What's something you wish I understood better about you?",
      "What's a way we could learn together?",
      "What's something you'd like to explore or discover together?"
    ],
    'mother-daughter': [
      "What's your favorite memory of us together?",
      "What's something you learned from me that you're grateful for?",
      "How can we strengthen our bond?",
      "What makes you feel most loved by me?",
      "What's a tradition you want us to start?",
      "What's something you're proud of about our relationship?",
      "How can I support you better?",
      "What's a dream we can pursue together?",
      "What quality of mine do you admire most?",
      "What's something I taught you that you'll never forget?",
      "How do you want to be like me when you grow up?",
      "What makes our relationship special?",
      "What's a challenge we faced together?",
      "How can we show more appreciation for each other?",
      "What's your favorite thing about our time together?"
    ],
    'mother-father-son': [
      "What's your favorite family activity?",
      "What's something you learned from dad?",
      "What's something you learned from mom?",
      "How do we make you feel loved?",
      "What's a family tradition you love?",
      "What's something you're grateful for about our family?",
      "How can we spend more quality time together?",
      "What's a lesson we taught you that's important?",
      "What makes our family strong?",
      "What's a memory of all of us together you treasure?",
      "How can we support your dreams better?",
      "What's something you want to learn from us?",
      "What's a way we show we care about you?",
      "How do you want to be like your parents?",
      "What's your favorite thing about our family?"
    ],
    mother: [
      "What makes you feel most appreciated?",
      "What's a way your family shows they love you?",
      "What's your favorite thing about being a mother?",
      "What's something you're proud of in your children?",
      "How can your family support you better?",
      "What's a memory with your family you treasure?",
      "What's something you've learned from being a mother?",
      "What makes you feel most connected to your family?",
      "What's a dream you have for your family?",
      "What's something you want your children to know?",
      "How do you want to be remembered?",
      "What's a tradition you want to pass down?",
      "What's something you're grateful for?",
      "What's a challenge you've overcome?",
      "What brings you the most joy as a mother?"
    ]
  };

  const hasInitialMatches = (board) => {
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 6; j++) {
        if (board[i][j] === board[i][j + 1] && board[i][j] === board[i][j + 2]) return true;
        if (i < 6 && board[i][j] === board[i + 1][j] && board[i][j] === board[i + 2][j]) return true;
      }
    }
    return false;
  };

  const handleCellClick = (row, col) => {
    if (moves <= 0 || animating) return;
    
    const cell = puzzleBoard[row][col];
    const isSpecial = Object.values(SPECIAL_TYPES).includes(cell);
    
    // Activate special piece on click
    if (isSpecial && !selectedPowerup && !selectedCell) {
      const newBoard = puzzleBoard.map(r => [...r]);
      const color = specialPieces[`${row},${col}`]?.color || colors[0];
      const cellsToRemove = activateSpecialPiece(newBoard, row, col, cell, color);
      
      cellsToRemove.forEach(([r, c]) => {
        newBoard[r][c] = '💫';
      });
      
      setAnimating(true);
      setMatchAnimations(new Set(cellsToRemove.map(([r, c]) => `${r},${c}`)));
      setPuzzleBoard(newBoard);
      setMoves(moves - 1);
      
      setTimeout(() => {
        setMatchAnimations(new Set());
        dropPieces(newBoard, cellsToRemove);
      }, 300);
      return;
    }
    
    if (selectedPowerup) {
      usePowerup(selectedPowerup, row, col);
      return;
    }
    
    if (!selectedCell) {
      setSelectedCell({ row, col });
    } else {
      const rowDiff = Math.abs(selectedCell.row - row);
      const colDiff = Math.abs(selectedCell.col - col);
      
      if ((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)) {
        swapCells(selectedCell, { row, col });
      }
      setSelectedCell(null);
    }
  };

  const usePowerup = (powerup, row, col) => {
    if (powerups[powerup] <= 0) return;
    
    const newBoard = puzzleBoard.map(r => [...r]);
    let cellsToRemove = [];
    
    if (powerup === 'hammer') {
      cellsToRemove.push([row, col]);
      setScore(s => s + 50);
    } else if (powerup === 'shuffle') {
      const flat = newBoard.flat();
      for (let i = flat.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [flat[i], flat[j]] = [flat[j], flat[i]];
      }
      let idx = 0;
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          newBoard[i][j] = flat[idx++];
        }
      }
      setPuzzleBoard(newBoard);
      setPowerups(prev => ({ ...prev, shuffle: prev.shuffle - 1 }));
      setSelectedPowerup(null);
      return;
    } else if (powerup === 'colorBomb') {
      const color = newBoard[row][col];
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          if (newBoard[i][j] === color) cellsToRemove.push([i, j]);
        }
      }
      setScore(s => s + cellsToRemove.length * 50);
    }
    
    if (cellsToRemove.length > 0) {
      cellsToRemove.forEach(([r, c]) => { newBoard[r][c] = '💫'; });
      setPuzzleBoard(newBoard);
      setTimeout(() => dropPieces(newBoard, cellsToRemove), 300);
    }
    
    setPowerups(prev => ({ ...prev, [powerup]: prev[powerup] - 1 }));
    setSelectedPowerup(null);
  };

  const swapCells = (cell1, cell2) => {
    if (animating) return;
    
    const newBoard = puzzleBoard.map(row => [...row]);
    [newBoard[cell1.row][cell1.col], newBoard[cell2.row][cell2.col]] = 
    [newBoard[cell2.row][cell2.col], newBoard[cell1.row][cell1.col]];
    
    const hasMatch = checkForMatches(newBoard, cell1) || checkForMatches(newBoard, cell2);
    
    if (!hasMatch) {
      // Undo swap - no match found
      [newBoard[cell1.row][cell1.col], newBoard[cell2.row][cell2.col]] = 
      [newBoard[cell2.row][cell2.col], newBoard[cell1.row][cell1.col]];
      setPuzzleBoard(newBoard);
      return;
    }
    
    setAnimating(true);
    setLastSwap({ cell1, cell2 });
    setPuzzleBoard(newBoard);
    setMoves(moves - 1);
    setTimeout(() => checkMatches(newBoard), 150);
  };

  const checkForMatches = (board, cell) => {
    const { row, col } = cell;
    const color = board[row][col];
    
    let hCount = 1;
    for (let i = col - 1; i >= 0 && board[row][i] === color; i--) hCount++;
    for (let i = col + 1; i < 8 && board[row][i] === color; i++) hCount++;
    
    let vCount = 1;
    for (let i = row - 1; i >= 0 && board[i][col] === color; i--) vCount++;
    for (let i = row + 1; i < 8 && board[i][col] === color; i++) vCount++;
    
    return hCount >= 3 || vCount >= 3;
  };

  const getSpecialType = (matches, row, col) => {
    const matchSet = new Set(matches.map(([r, c]) => `${r},${c}`));
    
    // Check for 5-in-a-row (creates bomb)
    let hCount = 1, vCount = 1;
    for (let i = col - 1; i >= 0 && matchSet.has(`${row},${i}`); i--) hCount++;
    for (let i = col + 1; i < 8 && matchSet.has(`${row},${i}`); i++) hCount++;
    for (let i = row - 1; i >= 0 && matchSet.has(`${i},${col}`); i--) vCount++;
    for (let i = row + 1; i < 8 && matchSet.has(`${i},${col}`); i++) vCount++;
    
    if (hCount >= 5 || vCount >= 5) return SPECIAL_TYPES.BOMB;
    
    // Check for L or T shape (creates rainbow)
    const neighbors = [
      matchSet.has(`${row-1},${col}`), matchSet.has(`${row+1},${col}`),
      matchSet.has(`${row},${col-1}`), matchSet.has(`${row},${col+1}`)
    ];
    const horizontal = neighbors[2] && neighbors[3];
    const vertical = neighbors[0] && neighbors[1];
    if (horizontal && vertical) return SPECIAL_TYPES.RAINBOW;
    
    // Check for 4-in-a-row (creates rocket)
    if (hCount >= 4) return SPECIAL_TYPES.ROCKET_H;
    if (vCount >= 4) return SPECIAL_TYPES.ROCKET_V;
    
    return null;
  };

  const activateSpecialPiece = (board, row, col, specialType, color) => {
    const cellsToRemove = [];
    let bonus = 0;
    
    if (specialType === SPECIAL_TYPES.ROCKET_H) {
      // Clear entire row
      for (let j = 0; j < 8; j++) {
        cellsToRemove.push([row, j]);
      }
      bonus = 100;
    } else if (specialType === SPECIAL_TYPES.ROCKET_V) {
      // Clear entire column
      for (let i = 0; i < 8; i++) {
        cellsToRemove.push([i, col]);
      }
      bonus = 100;
    } else if (specialType === SPECIAL_TYPES.BOMB) {
      // Clear 3x3 area
      for (let i = Math.max(0, row - 1); i <= Math.min(7, row + 1); i++) {
        for (let j = Math.max(0, col - 1); j <= Math.min(7, col + 1); j++) {
          cellsToRemove.push([i, j]);
        }
      }
      bonus = 150;
    } else if (specialType === SPECIAL_TYPES.RAINBOW) {
      // Clear all pieces of same color
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          const cell = board[i][j];
          if (cell === color && cell !== '💫' && !Object.values(SPECIAL_TYPES).includes(cell)) {
            cellsToRemove.push([i, j]);
          }
        }
      }
      bonus = 200;
    }
    
    if (bonus > 0) {
      setScore(s => s + bonus * Math.min(combo + 1, 5));
    }
    
    return cellsToRemove;
  };

  const checkMatches = (board) => {
    let matches = [];
    const newBoard = board.map(row => [...row]);
    const specialPiecesToCreate = [];
    const matchSet = new Set();
    
    // Find horizontal matches
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 6; j++) {
        let len = 1;
        while (j + len < 8 && 
               newBoard[i][j] === newBoard[i][j + len] && 
               newBoard[i][j] !== '💫' &&
               !Object.values(SPECIAL_TYPES).includes(newBoard[i][j])) {
          len++;
        }
        if (len >= 3) {
          const color = newBoard[i][j];
          for (let l = j; l < j + len; l++) {
            if (!matchSet.has(`${i},${l}`)) {
            matches.push([i, l]);
              matchSet.add(`${i},${l}`);
            }
          }
          
          // Create special piece in middle of match
          if (len >= 4) {
            const midCol = Math.floor(j + len / 2);
            const specialType = len >= 5 ? SPECIAL_TYPES.BOMB : SPECIAL_TYPES.ROCKET_H;
            specialPiecesToCreate.push({ row: i, col: midCol, type: specialType, color });
          }
          j += len - 1;
        }
      }
    }
    
    // Find vertical matches
    for (let j = 0; j < 8; j++) {
      for (let i = 0; i < 6; i++) {
        let len = 1;
        while (i + len < 8 && 
               newBoard[i][j] === newBoard[i + len][j] && 
               newBoard[i][j] !== '💫' &&
               !Object.values(SPECIAL_TYPES).includes(newBoard[i][j])) {
          len++;
        }
        if (len >= 3) {
          for (let l = i; l < i + len; l++) {
            if (!matchSet.has(`${l},${j}`)) {
              matches.push([l, j]);
              matchSet.add(`${l},${j}`);
            }
          }
          
          // Create special piece in middle of match
          if (len >= 4) {
            const midRow = Math.floor(i + len / 2);
            const existing = specialPiecesToCreate.find(sp => sp.row === midRow && sp.col === j);
            if (existing) {
              // Already creating a special piece here, upgrade to rainbow
              existing.type = SPECIAL_TYPES.RAINBOW;
            } else {
              const specialType = len >= 5 ? SPECIAL_TYPES.BOMB : SPECIAL_TYPES.ROCKET_V;
              specialPiecesToCreate.push({ row: midRow, col: j, type: specialType, color: newBoard[i][j] });
            }
          }
          i += len - 1;
        }
      }
    }
    
    // Check for L/T shapes and create rainbow
    for (const [row, col] of matches) {
      const matchSetForShape = new Set(matches.map(([r, c]) => `${r},${c}`));
      const hNeighbors = matchSetForShape.has(`${row},${col-1}`) || matchSetForShape.has(`${row},${col+1}`);
      const vNeighbors = matchSetForShape.has(`${row-1},${col}`) || matchSetForShape.has(`${row+1},${col}`);
      
      if (hNeighbors && vNeighbors) {
        const existing = specialPiecesToCreate.find(sp => sp.row === row && sp.col === col);
        if (!existing || existing.type === SPECIAL_TYPES.ROCKET_H || existing.type === SPECIAL_TYPES.ROCKET_V) {
          if (existing) {
            existing.type = SPECIAL_TYPES.RAINBOW;
          } else {
            specialPiecesToCreate.push({ row, col, type: SPECIAL_TYPES.RAINBOW, color: newBoard[row][col] });
          }
        }
      }
    }
    
    if (matches.length > 0) {
      // Remove regular matches and place special pieces
      matches.forEach(([r, c]) => {
        const special = specialPiecesToCreate.find(sp => sp.row === r && sp.col === c);
        if (special) {
          newBoard[r][c] = special.type;
          setSpecialPieces(prev => ({ ...prev, [`${r},${c}`]: { type: special.type, color: special.color } }));
        } else {
          newBoard[r][c] = '💫';
        }
      });
      
      // Animate matches
      setMatchAnimations(new Set(matches.map(([r, c]) => `${r},${c}`)));
      
      const newCombo = combo + 1;
      const multiplier = Math.min(newCombo, 5);
      const baseScore = matches.length * 30;
      const bonusScore = specialPiecesToCreate.length * 50;
      setScore(s => s + (baseScore + bonusScore) * multiplier);
      setCombo(newCombo);
      
      setPuzzleBoard(newBoard);
      
      setTimeout(() => {
        setMatchAnimations(new Set());
        dropPieces(newBoard, matches);
      }, 400);
    } else {
      setCombo(0);
      setAnimating(false);
    }
  };

  const dropPieces = (board, matches) => {
    const newBoard = board.map(row => [...row]);
    const matchSet = new Set(matches.map(m => `${m[0]},${m[1]}`));
    
    // Check for special pieces to activate
    const specialPiecesToActivate = [];
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const cell = newBoard[i][j];
        if (Object.values(SPECIAL_TYPES).includes(cell) && matchSet.has(`${i},${j}`)) {
          const specialInfo = specialPieces[`${i},${j}`] || {};
          specialPiecesToActivate.push({ row: i, col: j, type: cell, color: specialInfo.color || colors[0] });
        }
      }
    }
    
    // Activate special pieces first
    if (specialPiecesToActivate.length > 0) {
      let allCellsToRemove = new Set(matches.map(m => `${m[0]},${m[1]}`));
      specialPiecesToActivate.forEach(({ row, col, type, color }) => {
        const activated = activateSpecialPiece(newBoard, row, col, type, color);
        activated.forEach(([r, c]) => allCellsToRemove.add(`${r},${c}`));
      });
      matches = Array.from(allCellsToRemove).map(key => {
        const [r, c] = key.split(',').map(Number);
        return [r, c];
      });
      matchSet.clear();
      matches.forEach(([r, c]) => matchSet.add(`${r},${c}`));
    }
    
    // Drop pieces
    for (let col = 0; col < 8; col++) {
      let writePos = 7;
      for (let row = 7; row >= 0; row--) {
        if (!matchSet.has(`${row},${col}`)) {
          if (writePos !== row) {
            newBoard[writePos][col] = newBoard[row][col];
          }
          writePos--;
        }
      }
      
      // Fill empty spaces at top
      while (writePos >= 0) {
        newBoard[writePos][col] = colors[Math.floor(Math.random() * colors.length)];
        writePos--;
      }
    }
    
    setPuzzleBoard(newBoard);
    
    // Prevent initial matches in new pieces
    let attempts = 0;
    while (hasInitialMatches(newBoard) && attempts < 10) {
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          if (matchSet.has(`${i},${j}`) || (i < 3 && newBoard[i][j] !== '💫' && !Object.values(SPECIAL_TYPES).includes(newBoard[i][j]))) {
            newBoard[i][j] = colors[Math.floor(Math.random() * colors.length)];
          }
        }
      }
      attempts++;
    }
    
    setTimeout(() => checkMatches(newBoard), 250);
  };

  // Helper function to award Bible verse
  const awardBibleVerse = (success = true) => {
    if (success && Math.random() > 0.5) { // 50% chance to get a verse
      const availableVerses = BIBLE_VERSES.filter(v => 
        !gameData.bibleVerses.some(bv => bv.reference === v.reference)
      );
      if (availableVerses.length > 0) {
        const verse = availableVerses[Math.floor(Math.random() * availableVerses.length)];
        setGameData(prev => ({
          ...prev,
          bibleVerses: [...prev.bibleVerses, verse]
        }));
        return verse;
      }
    }
    return null;
  };

  const applyBondProgress = (prev, amount) => {
    const relationshipProgress = Math.min(100, (prev.relationshipProgress || 0) + amount);
    return {
      relationshipProgress,
      bondLevel: Math.floor(relationshipProgress / 20) + 1
    };
  };

  const awardMiniGameRewards = (coinsEarned, bondGain = 3, puzzlesInc = 1) => {
    setGameData(prev => {
      const bond = applyBondProgress(prev, bondGain);
      return {
        ...prev,
        coins: prev.coins + coinsEarned,
        puzzlesCompleted: (prev.puzzlesCompleted || 0) + puzzlesInc,
        sharedProgress: Math.min(100, (prev.sharedProgress || 0) + bondGain),
        pet: { ...prev.pet, happiness: Math.min(100, prev.pet.happiness + 5) },
        ...bond
      };
    });
  };

  const SAVE_KEY = 'bondpet-save';

  const persistSave = (overrides = {}) => {
    try {
      const payload = {
        gameData,
        playerName,
        player2Name,
        relationshipMode,
        currentPlayer,
        ...overrides
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
      setSaveMessage('Progress saved!');
      setTimeout(() => setSaveMessage(''), 2000);
    } catch (_) {
      setSaveMessage('Could not save');
    }
  };

  const loadSave = () => {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);
      if (data.gameData) {
        setGameData({
          ...data.gameData,
          puzzlesCompleted: data.gameData.puzzlesCompleted || 0,
          sharedProgress: data.gameData.sharedProgress || 0
        });
      }
      if (data.playerName) setPlayerName(data.playerName);
      if (data.player2Name) setPlayer2Name(data.player2Name);
      if (data.relationshipMode) setRelationshipMode(data.relationshipMode);
      if (data.currentPlayer) setCurrentPlayer(data.currentPlayer);
      setGameState('pet');
      setSaveMessage('Welcome back!');
      setTimeout(() => setSaveMessage(''), 2000);
      return true;
    } catch (_) {
      return false;
    }
  };

  const startNewGame = () => {
    localStorage.removeItem(SAVE_KEY);
    setPlayerName('');
    setPlayer2Name('');
    setCurrentPlayer(null);
    setRelationshipMode(null);
    setPassBanner('');
    setGameData({
      pet: {
        name: 'Buddy', type: 'dog', happiness: 50, level: 1,
        hunger: 70, energy: 70, love: 50, cleanliness: 70, sleepiness: 50, learning: 30, isSleeping: false
      },
      inventory: [],
      foodInventory: {},
      coins: 20,
      conversationsCompleted: 0,
      relationshipProgress: 0,
      bondLevel: 1,
      unlockedPets: ['dog'],
      puzzlesCompleted: 0,
      sharedProgress: 0,
      gamesWon: 0,
      bibleVerses: [],
      conversationHistory: [],
      careHistory: [],
      lastCareAction: null
    });
    setGameState('welcome');
  };

  const getOtherPlayer = () => {
    const p1 = playerName || 'Player 1';
    const p2 = player2Name || 'Player 2';
    return currentPlayer === p1 ? p2 : p1;
  };

  const switchPlayer = () => {
    const next = getOtherPlayer();
    setCurrentPlayer(next);
    setPassBanner('');
  };

  const promptPassDevice = () => {
    const other = getOtherPlayer();
    setPassBanner(`Pass to ${other}`);
  };

  const SNAKE_SIZE = 15;
  const spawnSnakeFood = (snakeBody) => {
    let food;
    do {
      food = { x: Math.floor(Math.random() * SNAKE_SIZE), y: Math.floor(Math.random() * SNAKE_SIZE) };
    } while (snakeBody.some(s => s.x === food.x && s.y === food.y));
    return food;
  };

  const initializeSnake = () => {
    const snake = [{ x: 7, y: 7 }, { x: 6, y: 7 }, { x: 5, y: 7 }];
    const food = spawnSnakeFood(snake);
    const state = { snake, direction: 'right', nextDirection: 'right', food };
    setSnakeGame(state);
    snakeRef.current = { ...state, gameOver: false, running: true };
    setSnakeScore(0);
    setSnakeGameOver(false);
    setSnakeRunning(true);
  };

  const setSnakeDirection = (dir) => {
    const opposite = { up: 'down', down: 'up', left: 'right', right: 'left' };
    const current = snakeRef.current.direction;
    if (opposite[dir] === current) return;
    snakeRef.current.nextDirection = dir;
    setSnakeGame(prev => prev ? { ...prev, nextDirection: dir } : prev);
  };

  const initializeBrickBreaker = () => {
    const cols = 8;
    const rows = 4;
    const bricks = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        bricks.push({ x: c * 40 + 10, y: r * 22 + 30, w: 36, h: 16, alive: true });
      }
    }
    const state = {
      paddleX: 140,
      ballX: 175,
      ballY: 280,
      ballVX: 3,
      ballVY: -3,
      bricks,
      width: 350,
      height: 400,
      paddleW: 70
    };
    setBrickBreakerGame(state);
    brickBreakerRef.current = { ...state, gameOver: false, won: false, running: true, score: 0 };
    setBrickBreakerScore(0);
    setBrickBreakerGameOver(false);
    setBrickBreakerRunning(true);
  };

  const initializeJigsaw = () => {
    let board = [1, 2, 3, 4, 5, 6, 7, 8, 0];
    for (let n = 0; n < 40; n++) {
      const empty = board.indexOf(0);
      const er = Math.floor(empty / 3);
      const ec = empty % 3;
      const moves = [];
      if (er > 0) moves.push(empty - 3);
      if (er < 2) moves.push(empty + 3);
      if (ec > 0) moves.push(empty - 1);
      if (ec < 2) moves.push(empty + 1);
      const swap = moves[Math.floor(Math.random() * moves.length)];
      [board[empty], board[swap]] = [board[swap], board[empty]];
    }
    setJigsawPieces(board);
    setJigsawProgress(board.filter((v, i) => i < 8 && v === i + 1).length);
  };

  const LOGIC_QUESTIONS = [
    { q: 'What comes next: 2, 4, 8, 16, ?', options: ['18', '24', '32', '30'], answer: '32' },
    { q: 'Odd one out: 🍎 🍌 🚗 🍇', options: ['🍎', '🍌', '🚗', '🍇'], answer: '🚗' },
    { q: 'If all roses are flowers and some flowers fade quickly, then:', options: ['All roses fade quickly', 'Some roses may fade quickly', 'No roses fade', 'Roses are not flowers'], answer: 'Some roses may fade quickly' },
    { q: 'Complete: A, C, E, G, ?', options: ['H', 'I', 'J', 'K'], answer: 'I' },
    { q: '3 cats catch 3 mice in 3 minutes. How long for 100 cats to catch 100 mice?', options: ['100 min', '3 min', '1 min', '300 min'], answer: '3 min' },
    { q: 'Which number is missing: 1, 1, 2, 3, 5, ?, 13', options: ['6', '7', '8', '10'], answer: '8' },
    { q: 'A is taller than B. C is shorter than B. Who is tallest?', options: ['A', 'B', 'C', 'Tie'], answer: 'A' },
    { q: 'How many triangles if you draw an X inside a triangle?', options: ['2', '3', '4', '5'], answer: '4' }
  ];

  const initializeLogicPuzzle = () => {
    setLogicPuzzle({ index: 0, score: 0, finished: false });
  };

  const ESCAPE_ROOMS = [
    { title: 'Room 1: The Locked Gate', clue: 'The gate code is the number of letters in BOND plus LOVE (as numbers: BOND=4, LOVE=4). Enter 44.', answer: '44' },
    { title: 'Room 2: The Whispering Mirror', clue: 'Unscramble: TEP → your companion type. Answer: PET', answer: 'PET' },
    { title: 'Room 3: Freedom Door', clue: 'What do you build through play? (one word)', answer: 'BOND' }
  ];

  const initializeEscapeRoom = () => {
    setEscapeRoom({ room: 0, completed: false });
    setEscapeAnswer('');
    setEscapeFeedback('');
  };

  const completePuzzle = () => {
    const success = score >= targetScore;
    const coinsEarned = success ? Math.floor(score / 10) + 50 : Math.floor(score / 20);
    const verse = awardBibleVerse(success);
    
    setGameData(prev => ({
      ...prev,
      coins: prev.coins + coinsEarned,
      puzzlesCompleted: success ? prev.puzzlesCompleted + 1 : prev.puzzlesCompleted,
      sharedProgress: prev.sharedProgress + (success ? 10 : 5),
      pet: { ...prev.pet, happiness: Math.min(100, prev.pet.happiness + (success ? 10 : 5)) }
    }));
    
    if (success) {
      setPowerups(prev => ({
        shuffle: prev.shuffle + 1,
        hammer: prev.hammer + 1,
        colorBomb: prev.colorBomb + 1
      }));
    }
    
    if (verse) {
      setTimeout(() => {
        alert(`🌟 Bible Verse Prize!\n\n"${verse.verse}"\n${verse.reference}\n\nReflect: ${HUMILITY_REFLECTIONS[Math.floor(Math.random() * HUMILITY_REFLECTIONS.length)]}`);
      }, 100);
    }
    
    setGameState('pet');
  };

  const buyItem = (item) => {
    if (gameData.coins >= item.cost) {
      setGameData(prev => ({
        ...prev,
        coins: prev.coins - item.cost,
        inventory: [...prev.inventory, item],
        pet: { ...prev.pet, happiness: Math.min(100, prev.pet.happiness + 10) }
      }));
    }
  };

  useEffect(() => {
    setGameData(prev => {
    const newlyUnlocked = [];
    petTypes.forEach(pet => {
        if (prev.unlockedPets.includes(pet.id)) return;
      
      let shouldUnlock = false;
      if (pet.unlockCondition.toLowerCase().includes('coins')) {
        const coinsNeeded = parseInt(pet.unlockCondition.match(/\d+/)?.[0] || '0');
          if (prev.coins >= coinsNeeded) shouldUnlock = true;
      } else if (pet.unlockCondition.toLowerCase().includes('puzzles') || pet.unlockCondition.toLowerCase().includes('complete')) {
        const puzzlesNeeded = parseInt(pet.unlockCondition.match(/\d+/)?.[0] || '0');
          if (prev.puzzlesCompleted >= puzzlesNeeded) shouldUnlock = true;
      } else if (pet.unlockCondition.toLowerCase().includes('shared progress') || pet.unlockCondition.toLowerCase().includes('reach')) {
        const progressNeeded = parseInt(pet.unlockCondition.match(/\d+/)?.[0] || '0');
          if (prev.sharedProgress >= progressNeeded) shouldUnlock = true;
      } else if (pet.unlockCondition.toLowerCase().includes('games') || pet.unlockCondition.toLowerCase().includes('win')) {
        const gamesNeeded = parseInt(pet.unlockCondition.match(/\d+/)?.[0] || '0');
          if (prev.gamesWon >= gamesNeeded) shouldUnlock = true;
      }
      
        if (shouldUnlock && !prev.unlockedPets.includes(pet.id)) {
        newlyUnlocked.push(pet.id);
      }
    });
    
    if (newlyUnlocked.length > 0) {
        return {
        ...prev,
        unlockedPets: [...prev.unlockedPets, ...newlyUnlocked]
        };
      }
      return prev;
    });
  }, [gameData.coins, gameData.puzzlesCompleted, gameData.sharedProgress, gameData.gamesWon]);

  const getPetMood = () => {
    if (gameData.pet.isSleeping) return '😴';
    
    const petType = petTypes.find(p => p.id === gameData.pet.type) || petTypes[0];
    const h = gameData.pet.happiness;
    const needsMet = gameData.pet.hunger > 40 && gameData.pet.cleanliness > 40 && gameData.pet.sleepiness < 60;
    
    if (!needsMet) {
      // Baby needs attention
      if (gameData.pet.hunger < 30) return '😢'; // Hungry
      if (gameData.pet.cleanliness < 30) return '😟'; // Dirty
      if (gameData.pet.sleepiness > 80) return '😴'; // Tired
      return '😔'; // General needs
    }
    
    if (h > 80 && gameData.pet.love > 70) {
      if (relationshipMode === 'couples') return '🥰';
      return petType.excited;
    }
    if (h > 50) return petType.happy;
    if (h > 30) return petType.neutral;
    return petType.sad;
  };

  const buyPet = (pet) => {
    if (gameData.unlockedPets.includes(pet.id)) {
      // Switch to this pet
      setGameData(prev => ({
        ...prev,
        pet: { ...prev.pet, type: pet.id, name: pet.name }
      }));
      setSelectedPetType(pet.id);
      setGameState('pet');
    } else if (gameData.coins >= pet.cost) {
      // Buy and unlock pet
      setGameData(prev => ({
        ...prev,
        coins: prev.coins - pet.cost,
        unlockedPets: [...prev.unlockedPets, pet.id],
        pet: { ...prev.pet, type: pet.id, name: pet.name }
      }));
      setSelectedPetType(pet.id);
      setGameState('pet');
    }
  };

  const getPetMessage = () => {
    const msgs = {
      friends: [
        "You two make me so happy! 💕", 
        "I'm the fruit of your amazing friendship! 🌟", 
        "Your bond makes me stronger! 💪",
        "I love watching you two together! 💖"
      ],
      couples: [
        "I'm the fruit of your love! 💕", 
        "Your love makes me blossom! 🌸", 
        "I feel your connection growing stronger! ✨",
        "Every conversation makes me happier! 💖",
        "Take care of me together, and we'll all grow! 🌱"
      ]
    };
    const relationshipMsgs = msgs[relationshipMode] || msgs.friends;
    return relationshipMsgs[Math.floor(Math.random() * relationshipMsgs.length)];
  };

  // Sync pet love with relationship progress
  useEffect(() => {
    setGameData(prev => {
      // Pet's love should reflect relationship progress
      const targetLove = Math.max(prev.pet.love, prev.relationshipProgress);
      if (targetLove > prev.pet.love) {
        return {
          ...prev,
          pet: {
            ...prev.pet,
            love: Math.min(100, targetLove),
            happiness: Math.min(100, prev.pet.happiness + 1)
          }
        };
      }
      return prev;
    });
  }, [gameData.relationshipProgress]);

  // Pet needs decrease over time (like real babies)
  useEffect(() => {
    if (gameState !== 'pet' && gameState !== 'welcome') return;
    
    const interval = setInterval(() => {
      setGameData(prev => {
        if (prev.pet.isSleeping) {
          // While sleeping, only sleepiness decreases, other needs decrease slower
          return {
            ...prev,
            pet: {
              ...prev.pet,
              sleepiness: Math.max(0, prev.pet.sleepiness - 2),
              hunger: Math.max(0, prev.pet.hunger - 0.5),
              cleanliness: Math.max(0, prev.pet.cleanliness - 0.3),
              energy: Math.min(100, prev.pet.energy + 1)
            }
          };
        } else {
          // While awake, needs decrease gradually
          const newHunger = Math.max(0, prev.pet.hunger - 0.5);
          const newSleepiness = Math.min(100, prev.pet.sleepiness + 0.8);
          const newCleanliness = Math.max(0, prev.pet.cleanliness - 0.5);
          const newEnergy = Math.max(0, prev.pet.energy - 0.3);
          
          // Calculate happiness based on needs
          const avgNeeds = (newHunger + newCleanliness + (100 - newSleepiness)) / 3;
          const newHappiness = Math.max(0, Math.min(100, avgNeeds * 0.7 + prev.pet.love * 0.3));
          
          return {
            ...prev,
            pet: {
              ...prev.pet,
              hunger: newHunger,
              sleepiness: newSleepiness,
              cleanliness: newCleanliness,
              energy: newEnergy,
              happiness: newHappiness
            }
          };
        }
      });
    }, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [gameState]);

  // Tetris functions (needed by hooks below)
  const createNewTetrisPiece = () => {
    const shapeIndex = Math.floor(Math.random() * TETRIS_SHAPES.length);
    return {
      shape: TETRIS_SHAPES[shapeIndex],
      x: Math.floor(10 / 2) - 1,
      y: 0,
      color: TETRIS_COLORS[shapeIndex]
    };
  };

  const rotateTetrisPiece = (piece) => {
    const rows = piece.shape.length;
    const cols = piece.shape[0].length;
    const rotated = Array(cols).fill(null).map(() => Array(rows).fill(0));
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        rotated[j][rows - 1 - i] = piece.shape[i][j];
      }
    }
    return { ...piece, shape: rotated };
  };

  const isValidPosition = (board, piece, dx = 0, dy = 0) => {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const newX = piece.x + x + dx;
          const newY = piece.y + y + dy;
          if (newX < 0 || newX >= 10 || newY >= 20) return false;
          if (newY >= 0 && board[newY][newX]) return false;
        }
      }
    }
    return true;
  };

  const placeTetrisPiece = (board, piece) => {
    const newBoard = board.map(row => [...row]);
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const boardY = piece.y + y;
          const boardX = piece.x + x;
          if (boardY >= 0) {
            newBoard[boardY][boardX] = piece.color;
          }
        }
      }
    }
    return newBoard;
  };

  const clearTetrisLines = (board) => {
    let newBoard = board.filter(row => !row.every(cell => cell !== 0));
    const linesCleared = board.length - newBoard.length;
    while (newBoard.length < 20) {
      newBoard.unshift(Array(10).fill(0));
    }
    return { board: newBoard, linesCleared };
  };

  const moveTetrisPiece = (direction) => {
    if (!tetrisPiece || tetrisGameOver || tetrisPaused) return;
    
    if (direction === 'hardDrop') {
      let piece = { ...tetrisPiece };
      while (isValidPosition(tetrisBoard, { ...piece, y: piece.y + 1 })) {
        piece = { ...piece, y: piece.y + 1 };
      }
      const newBoard = placeTetrisPiece(tetrisBoard, piece);
      const { board: clearedBoard, linesCleared } = clearTetrisLines(newBoard);
      setTetrisBoard(clearedBoard);
      if (linesCleared > 0) {
        const points = [0, 100, 300, 500, 800][linesCleared] * (tetrisLevel + 1);
        setTetrisScore(prev => prev + points + 20);
        setTetrisLines(prev => prev + linesCleared);
      }
      const upcoming = tetrisNextPiece || createNewTetrisPiece();
      const following = createNewTetrisPiece();
      setTetrisNextPiece(following);
      if (!isValidPosition(clearedBoard, upcoming)) setTetrisGameOver(true);
      else setTetrisPiece(upcoming);
      return;
    }

    let newPiece = { ...tetrisPiece };
    if (direction === 'left') newPiece.x--;
    else if (direction === 'right') newPiece.x++;
    else if (direction === 'down') newPiece.y++;
    else if (direction === 'rotate') newPiece = rotateTetrisPiece(tetrisPiece);
    
    if (isValidPosition(tetrisBoard, newPiece)) {
      setTetrisPiece(newPiece);
    } else if (direction === 'down') {
      const newBoard = placeTetrisPiece(tetrisBoard, tetrisPiece);
      const { board: clearedBoard, linesCleared } = clearTetrisLines(newBoard);
      setTetrisBoard(clearedBoard);
      
      if (linesCleared > 0) {
        const points = [0, 100, 300, 500, 800][linesCleared] * (tetrisLevel + 1);
        setTetrisScore(prev => prev + points);
        setTetrisLines(prev => prev + linesCleared);
        setTetrisLevel(prev => Math.floor((prev + linesCleared) / 10) + 1);
        setTetrisFallTime(prev => Math.max(100, prev - 50));
      }
      
      const upcoming = tetrisNextPiece || createNewTetrisPiece();
      const following = createNewTetrisPiece();
      setTetrisNextPiece(following);
      if (!isValidPosition(clearedBoard, upcoming)) {
        setTetrisGameOver(true);
      } else {
        setTetrisPiece(upcoming);
      }
    }
  };

  const initializePuzzle = () => {
    let board;
    let attempts = 0;
    do {
      board = Array(8).fill(0).map(() => 
      Array(8).fill(0).map(() => colors[Math.floor(Math.random() * colors.length)])
    );
      attempts++;
    } while (hasInitialMatches(board) && attempts < 50);
    
    setPuzzleBoard(board);
    setMoves(25);
    setScore(0);
    setCombo(0);
    setSpecialPieces({});
    setMatchAnimations(new Set());
    setTargetScore(1000 + (gameData.puzzlesCompleted * 200));
  };

  // All useEffect hooks must be before any early returns
  // Auto fall effect
  useEffect(() => {
    if (gameState !== 'tetris') return;
    
    const interval = setInterval(() => {
      const { board, piece, gameOver, paused } = tetrisRef.current;
      if (!piece || gameOver || paused) return;
      
      const newPiece = { ...piece, y: piece.y + 1 };
      
      if (isValidPosition(board, newPiece)) {
        setTetrisPiece(newPiece);
      } else {
        // Place piece
        const placedBoard = placeTetrisPiece(board, piece);
        const { board: clearedBoard, linesCleared } = clearTetrisLines(placedBoard);
        setTetrisBoard(clearedBoard);
        
        if (linesCleared > 0) {
          setTetrisScore(prev => {
            const newScore = prev + [0, 100, 300, 500, 800][linesCleared] * (tetrisLevel + 1);
            return newScore;
          });
          setTetrisLines(prev => prev + linesCleared);
          setTetrisLevel(prev => Math.floor((prev + linesCleared) / 10) + 1);
          setTetrisFallTime(prev => Math.max(100, prev - 50));
        }
        
        const upcoming = tetrisNextRef.current || createNewTetrisPiece();
        const following = createNewTetrisPiece();
        setTetrisNextPiece(following);
        tetrisNextRef.current = following;
        if (!isValidPosition(clearedBoard, upcoming)) {
          setTetrisGameOver(true);
        } else {
          setTetrisPiece(upcoming);
        }
      }
    }, tetrisFallTime);
    
    return () => clearInterval(interval);
  }, [gameState, tetrisFallTime, tetrisLevel]);

  // Keyboard controls
  useEffect(() => {
    if (gameState !== 'tetris') return;
    
    const handleKeyPress = (e) => {
      if (tetrisGameOver || tetrisPaused) {
        if (e.key === 'p' || e.key === 'P') setTetrisPaused(!tetrisPaused);
        return;
      }
      e.preventDefault();
      if (e.key === 'ArrowLeft') moveTetrisPiece('left');
      else if (e.key === 'ArrowRight') moveTetrisPiece('right');
      else if (e.key === 'ArrowDown') moveTetrisPiece('down');
      else if (e.key === 'ArrowUp') moveTetrisPiece('rotate');
      else if (e.key === ' ') { e.preventDefault(); moveTetrisPiece('hardDrop'); }
      else if (e.key === 'p' || e.key === 'P') setTetrisPaused(!tetrisPaused);
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState, tetrisPiece, tetrisGameOver, tetrisPaused]);

  useEffect(() => {
    if (gameState === 'puzzle' && puzzleBoard.length === 0) {
      initializePuzzle();
    }
  }, [gameState, puzzleBoard.length]);

  // Pacman keyboard
  useEffect(() => {
    if (gameState !== 'pacman') return undefined;
    const handleKeyPress = (e) => {
      const map = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };
      if (map[e.key]) {
        e.preventDefault();
        pacmanDirRef.current = map[e.key];
        setPacmanDirection(map[e.key]);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState]);

  // Pacman movement + ghosts
  useEffect(() => {
    if (gameState !== 'pacman' || pacmanGameOver) return undefined;
    const tick = () => {
      const maze = pacmanMazeRef.current;
      if (!maze.length) return;
      const dir = pacmanDirRef.current;
      setPacmanPos(current => {
        const next = { ...current };
        if (dir === 'up') next.y--;
        else if (dir === 'down') next.y++;
        else if (dir === 'left') next.x--;
        else if (dir === 'right') next.x++;
        const rows = maze.length;
        const cols = maze[0].length;
        if (next.x < 0 || next.y < 0 || next.x >= cols || next.y >= rows) return current;
        if (maze[next.y][next.x] === 1) return current;
        if (maze[next.y][next.x] === 2) {
          maze[next.y][next.x] = 0;
          pacmanMazeRef.current = maze;
          setPacmanMaze(maze.map(r => [...r]));
          setPacmanScore(s => s + 10);
        }
        return next;
      });
      setPacmanGhosts(prev => prev.map(g => {
        const options = [
          { x: g.x + 1, y: g.y },
          { x: g.x - 1, y: g.y },
          { x: g.x, y: g.y + 1 },
          { x: g.x, y: g.y - 1 }
        ].filter(p => maze[p.y] && maze[p.y][p.x] !== 1 && maze[p.y][p.x] !== undefined);
        if (!options.length) return g;
        // Prefer step toward pac (use latest via closure — approximate with random bias)
        const pick = options[Math.floor(Math.random() * options.length)];
        return { ...g, x: pick.x, y: pick.y };
      }));
    };
    const id = setInterval(tick, 220);
    return () => clearInterval(id);
  }, [gameState, pacmanGameOver]);

  // Pacman ghost collision
  useEffect(() => {
    if (gameState !== 'pacman' || pacmanGameOver || pacmanHitCooldownRef.current) return;
    const hit = pacmanGhosts.some(g => g.x === pacmanPos.x && g.y === pacmanPos.y);
    if (hit) {
      pacmanHitCooldownRef.current = true;
      setPacmanLives(l => {
        const next = l - 1;
        if (next <= 0) setPacmanGameOver(true);
        else setPacmanPos({ x: 1, y: 1 });
        return Math.max(0, next);
      });
      setPacmanGhosts([
        { x: 17, y: 1, color: '🔴' },
        { x: 17, y: 13, color: '🟣' }
      ]);
      setTimeout(() => { pacmanHitCooldownRef.current = false; }, 1500);
    }
  }, [pacmanPos, pacmanGhosts, gameState, pacmanGameOver]);

  // Jetpack keyboard + fly loop
  useEffect(() => {
    if (gameState !== 'jetpack' || jetpackGameOver) return undefined;
    const onDown = (e) => {
      if (e.key === ' ' || e.key === 'ArrowUp') {
        e.preventDefault();
        handleJetpackFly(true);
      }
    };
    const onUp = (e) => {
      if (e.key === ' ' || e.key === 'ArrowUp') {
        e.preventDefault();
        handleJetpackFly(false);
      }
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, [gameState, jetpackGameOver]);

  useEffect(() => {
    if (gameState !== 'jetpack' || jetpackGameOver) return undefined;
    const gameLoop = setInterval(() => {
      const flying = jetpackFlyingRef.current;
      let y = jetpackYRef.current;
      y = flying ? Math.max(40, y - 6) : Math.min(340, y + 4);
      jetpackYRef.current = y;
      setJetpackY(y);
      setJetpackScore(prev => prev + 1);
      setJetpackObstacles(prev => {
        let next = prev.map(obs => ({ ...obs, x: obs.x - 5 })).filter(obs => obs.x > -50);
        if (Math.random() < 0.08) {
          const gapTop = 80 + Math.random() * 120;
          next.push({ x: 360, yTop: gapTop, yBottom: gapTop + 110 });
        }
        const crashed = next.some(obs =>
          obs.x < 70 && obs.x > 30 && (y < obs.yTop || y + 30 > obs.yBottom)
        );
        if (crashed) setJetpackGameOver(true);
        return next;
      });
    }, 40);
    return () => clearInterval(gameLoop);
  }, [gameState, jetpackGameOver]);

  useEffect(() => {
    if (gameState !== 'miniGolf' || !golfMoving) return undefined;
    const id = setInterval(() => {
      const b = golfBallRef.current;
      b.x += b.vx;
      b.y += b.vy;
      b.vx *= 0.96;
      b.vy *= 0.96;
      if (b.x < 2) { b.x = 2; b.vx *= -0.7; }
      if (b.x > 95) { b.x = 95; b.vx *= -0.7; }
      if (b.y < 2) { b.y = 2; b.vy *= -0.7; }
      if (b.y > 90) { b.y = 90; b.vy *= -0.7; }
      setGolfBallPos({ x: b.x, y: b.y });
      const dx = b.x - golfHolePos.x;
      const dy = b.y - golfHolePos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
      if (dist < 4 && speed < 1.2) {
        b.vx = 0; b.vy = 0;
        setGolfMoving(false);
        setGolfScore(s => s + golfStrokes);
        if (golfHole >= 5) {
          setGolfDone(true);
          awardMiniGameRewards(Math.max(10, 80 - golfScore), 4, 1);
        } else {
          setGolfHole(h => h + 1);
          setGolfStrokes(0);
          b.x = 20; b.y = 70;
          setGolfBallPos({ x: 20, y: 70 });
        }
        return;
      }
      if (speed < 0.15) {
        b.vx = 0; b.vy = 0;
        setGolfMoving(false);
        setGolfVel({ x: 0, y: 0 });
      }
    }, 30);
    return () => clearInterval(id);
  }, [gameState, golfMoving, golfHole, golfStrokes, golfScore, golfHolePos.x, golfHolePos.y]);

  // Word Scramble initialization
  useEffect(() => {
    if (gameState !== 'wordScramble') return;
    
    const words = relationshipMode === 'couples'
      ? ['LOVE', 'KISS', 'HEART', 'ROMANCE']
      : relationshipMode === 'parentChild'
      ? ['FAMILY', 'HOME', 'LOVE', 'CARE']
      : ['FRIEND', 'FUN', 'LAUGH', 'JOY'];
    
    if (!scrambledWord && words.length > 0) {
      const word = words[0];
      setCurrentWord(word);
      setScrambledWord(word.split('').sort(() => Math.random() - 0.5).join(''));
    }
  }, [gameState, relationshipMode]);

  if (gameState === 'petSelection') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 p-8 flex items-center justify-center">
        <div className="bg-white rounded-3xl p-8 max-w-4xl w-full shadow-2xl">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-purple-600 mb-2">Choose Your Pet! 🐾</h2>
            <p className="text-gray-600">Pick a pet companion for your journey together</p>
            <div className="text-xl font-bold text-yellow-600 mt-2">🪙 {gameData.coins} Coins</div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {petTypes.map((pet) => {
              const isUnlocked = gameData.unlockedPets.includes(pet.id);
              const canAfford = gameData.coins >= pet.cost;
              
              return (
                <div
                  key={pet.id}
                  className={`p-4 sm:p-6 rounded-xl border-4 transition-all min-h-[140px] relative ${
                    gameData.pet.type === pet.id
                      ? 'border-purple-500 bg-purple-50 shadow-lg ring-4 ring-purple-200'
                      : isUnlocked
                      ? 'border-green-300 bg-white active:border-purple-300 active:scale-95 cursor-pointer'
                      : 'border-gray-300 bg-gray-100 opacity-60'
                  }`}
                  onClick={() => {
                    if (isUnlocked) {
                      setGameData(prev => ({
                        ...prev,
                        pet: { ...prev.pet, type: pet.id, name: pet.name }
                      }));
                      setSelectedPetType(pet.id);
                      setGameState('pet');
                    } else if (canAfford) {
                      buyPet(pet);
                    }
                  }}
                >
                  {!isUnlocked && (
                    <div className="absolute top-1 right-1 text-2xl">🔒</div>
                  )}
                  {gameData.pet.type === pet.id && (
                    <div className="absolute top-1 left-1 text-lg">✓</div>
                  )}
                  
                  <div className="text-5xl sm:text-6xl mb-2">{pet.emoji}</div>
                  <div className="font-semibold text-gray-800 text-sm sm:text-base mb-1">{pet.name}</div>
                  
                  {!isUnlocked ? (
                    <div className="text-xs text-gray-600 mt-2">
                      {pet.cost > 0 && (
                        <div className="mb-1">🪙 {pet.cost} coins</div>
                      )}
                      <div className="text-[10px] leading-tight">{pet.unlockCondition}</div>
                    </div>
                  ) : (
                    <button
                      className={`w-full mt-2 py-2 rounded-lg font-semibold text-xs sm:text-sm ${
                        gameData.pet.type === pet.id
                          ? 'bg-purple-500 text-white'
                          : 'bg-green-500 text-white active:bg-green-600'
                      }`}
                    >
                      {gameData.pet.type === pet.id ? 'Active' : 'Select'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-3 mt-6">
            <button
              onClick={() => setGameState('welcome')}
              className="bg-gray-400 text-white py-3 rounded-xl font-semibold active:bg-gray-500">
              ← Back
            </button>
            <button
              onClick={() => setGameState('petShop')}
              className="bg-yellow-500 text-white py-3 rounded-xl font-semibold active:bg-yellow-600">
              🛍️ Pet Shop
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 p-4 sm:p-8 flex items-center justify-center">
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 max-w-md w-full shadow-2xl">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-purple-600 mb-2">🐾 BondPet</h1>
            <p className="text-gray-600">Build relationships through play!</p>
          </div>
          
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Player 1 name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-purple-300 focus:border-purple-500 outline-none"
            />
            <input
              type="text"
              placeholder="Player 2 name"
              value={player2Name}
              onChange={(e) => setPlayer2Name(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-pink-300 focus:border-pink-500 outline-none"
            />
            
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-700 text-center">Build stronger bonds through meaningful conversations</p>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    const p1 = playerName.trim() || 'Player 1';
                    const p2 = player2Name.trim() || 'Player 2';
                    setPlayerName(p1);
                    setPlayer2Name(p2);
                    setRelationshipMode('couples');
                    setCurrentPlayer(p1);
                    setGameState('pet');
                    persistSave({ playerName: p1, player2Name: p2, relationshipMode: 'couples', currentPlayer: p1 });
                  }}
                  className="w-full text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all bg-gradient-to-r from-pink-400 to-red-400 text-lg"
                >
                  💕 Couples Mode
                  <div className="text-sm font-normal mt-1">Deepen your romantic connection</div>
                </button>
                <button
                  onClick={() => {
                    const p1 = playerName.trim() || 'Player 1';
                    const p2 = player2Name.trim() || 'Player 2';
                    setPlayerName(p1);
                    setPlayer2Name(p2);
                    setRelationshipMode('friends');
                    setCurrentPlayer(p1);
                    setGameState('pet');
                    persistSave({ playerName: p1, player2Name: p2, relationshipMode: 'friends', currentPlayer: p1 });
                  }}
                  className="w-full text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all bg-gradient-to-r from-yellow-400 to-orange-400 text-lg"
                >
                  👫 Best Friends Mode
                  <div className="text-sm font-normal mt-1">Strengthen your friendship</div>
                </button>
                <button
                  onClick={() => {
                    const p1 = playerName.trim() || 'Parent';
                    const p2 = player2Name.trim() || 'Child';
                    setPlayerName(p1);
                    setPlayer2Name(p2);
                    setRelationshipMode('parentChild');
                    setCurrentPlayer(p1);
                    setGameState('pet');
                    persistSave({ playerName: p1, player2Name: p2, relationshipMode: 'parentChild', currentPlayer: p1 });
                  }}
                  className="w-full text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all bg-gradient-to-r from-blue-400 to-cyan-400 text-lg"
                >
                  👨‍👩‍👧 Parent-Child Mode
                  <div className="text-sm font-normal mt-1">Build bonds through learning together</div>
                </button>
                {typeof localStorage !== 'undefined' && localStorage.getItem('bondpet-save') && (
                  <button
                    onClick={loadSave}
                    className="w-full text-purple-700 py-3 rounded-xl font-semibold border-2 border-purple-300 bg-purple-50"
                  >
                    Continue Saved Game
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'pet') {
    const recentCare = (gameData.careHistory || []).slice(-3).reverse();
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl p-4 mb-4 shadow-lg">
            <div className="flex justify-between items-center flex-wrap gap-3">
              <div>
                <h2 className="text-2xl font-bold text-purple-600">Hello, {currentPlayer}!</h2>
                <p className="text-sm text-gray-600">
                  {relationshipMode === 'friends' && '👫 Best Friends Mode'}
                  {relationshipMode === 'couples' && '💕 Couples Mode'}
                  {relationshipMode === 'parentChild' && '👨‍👩‍👧 Parent-Child Mode'}
                </p>
                <p className="text-xs text-gray-500 mt-1">{playerName} & {player2Name}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-yellow-600">🪙 {gameData.coins}</div>
                <div className="flex gap-2 mt-2 justify-end flex-wrap">
                  <button onClick={switchPlayer}
                    className="bg-purple-500 text-white px-3 py-2 rounded-lg text-sm font-semibold min-h-[40px]">
                    Switch to {getOtherPlayer()}
                  </button>
                  <button onClick={() => persistSave()}
                    className="bg-teal-500 text-white px-3 py-2 rounded-lg text-sm font-semibold min-h-[40px]">
                    Save
                  </button>
                  <button onClick={startNewGame}
                    className="bg-gray-500 text-white px-3 py-2 rounded-lg text-sm font-semibold min-h-[40px]">
                    New Game
                  </button>
                </div>
                {saveMessage && <p className="text-xs text-green-600 mt-1">{saveMessage}</p>}
              </div>
            </div>
            {passBanner && (
              <div className="mt-3 bg-amber-100 border-2 border-amber-300 rounded-xl p-3 text-center">
                <p className="font-bold text-amber-800">{passBanner}</p>
                <button onClick={switchPlayer} className="mt-2 bg-amber-500 text-white px-4 py-2 rounded-lg font-semibold text-sm">
                  I&apos;m {getOtherPlayer()} — continue
                </button>
              </div>
            )}
          </div>

          {recentCare.length > 0 && (
            <div className="bg-white rounded-2xl p-4 mb-4 shadow-lg">
              <h4 className="font-semibold text-center text-gray-700 mb-2">Together so far</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {recentCare.map((c, i) => (
                  <li key={i} className="text-center">
                    {c.player} {c.action === 'feed' ? 'fed' : c.action === 'bedtime' ? 'put to bed' : c.action === 'teach' ? 'taught' : c.action === 'shower' ? 'bathed' : c.action === 'wake' ? 'woke' : 'cared for'} {gameData.pet.name}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Relationship Progress - Prominent */}
          <div className="bg-white rounded-2xl p-6 mb-4 shadow-lg border-4 border-purple-300">
            <h3 className="text-2xl font-bold text-center mb-4 text-purple-600">
              💕 Your Relationship Progress
            </h3>
            
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-lg">Bond Level {gameData.bondLevel}</span>
                <span className="text-gray-600">{gameData.relationshipProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-6">
                <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 h-6 rounded-full transition-all flex items-center justify-end pr-2"
                  style={{ width: `${gameData.relationshipProgress}%` }}>
                  {gameData.relationshipProgress >= 10 && <span className="text-white text-xs font-bold">💖</span>}
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2 text-center">
                {gameData.conversationsCompleted} meaningful conversations completed
              </p>
            </div>

            <div className="text-center">
              {/* Enhanced Pet Display */}
              <div className="relative mb-4">
                <div className="bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 rounded-full p-8 inline-block shadow-lg border-4 border-purple-300">
                  <div className="text-8xl mb-2 animate-pulse">{getPetMood()}</div>
                </div>
                {/* Pet Level Badge */}
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-sm shadow-lg border-2 border-white">
                  Lv.{gameData.pet.level}
                </div>
                {/* Love Hearts Animation */}
                {gameData.pet.love > 70 && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 animate-bounce">
                    <span className="text-2xl">💕</span>
                  </div>
                )}
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{gameData.pet.name}</h3>
              <p className="text-sm text-purple-600 font-semibold mb-2">✨ The Fruit of Your Love ✨</p>
              <p className="text-gray-600 italic mb-4">"{getPetMessage()}"</p>
              
              {/* Pet Status Icons */}
              <div className="flex justify-center gap-2 mb-4">
                {gameData.pet.hunger > 50 && <span className="text-2xl" title="Well Fed">🍽️</span>}
                {gameData.pet.cleanliness > 50 && <span className="text-2xl" title="Clean">✨</span>}
                {gameData.pet.energy > 50 && <span className="text-2xl" title="Energetic">⚡</span>}
                {gameData.pet.learning > 30 && <span className="text-2xl" title="Learning">📚</span>}
                {gameData.pet.love > 70 && <span className="text-2xl" title="Loved">💖</span>}
                </div>
              
              {/* Pet Needs - Baby Care Stats */}
              {gameData.pet.isSleeping ? (
                <div className="bg-indigo-100 rounded-lg p-4 mt-4 text-center">
                  <div className="text-4xl mb-2">😴</div>
                  <p className="text-indigo-700 font-semibold">{gameData.pet.name} is sleeping peacefully...</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
                  <div className="bg-pink-50 rounded-lg p-2">
                    <div className="text-xs font-semibold text-gray-700 mb-1">🍽️ Hunger</div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-orange-400 to-red-500 h-2 rounded-full transition-all"
                        style={{ width: `${gameData.pet.hunger}%` }}></div>
                    </div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-2">
                    <div className="text-xs font-semibold text-gray-700 mb-1">😴 Sleepy</div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-blue-400 to-indigo-500 h-2 rounded-full transition-all"
                        style={{ width: `${gameData.pet.sleepiness}%` }}></div>
                    </div>
                  </div>
                  <div className="bg-cyan-50 rounded-lg p-2">
                    <div className="text-xs font-semibold text-gray-700 mb-1">🧼 Clean</div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${gameData.pet.cleanliness}%` }}></div>
                    </div>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-2">
                    <div className="text-xs font-semibold text-gray-700 mb-1">📚 Learning</div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all"
                        style={{ width: `${gameData.pet.learning}%` }}></div>
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-2">
                    <div className="text-xs font-semibold text-gray-700 mb-1">⚡ Energy</div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all"
                        style={{ width: `${gameData.pet.energy}%` }}></div>
                    </div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-2">
                    <div className="text-xs font-semibold text-gray-700 mb-1">💕 Love</div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-pink-400 to-purple-500 h-2 rounded-full transition-all"
                        style={{ width: `${gameData.pet.love}%` }}></div>
                    </div>
                  </div>
                </div>
              )}
                </div>
              </div>

          {/* Co-Parenting Actions - Baby Care */}
          {gameData.pet.isSleeping ? (
            <div className="bg-white rounded-2xl p-6 mb-4 shadow-lg border-2 border-indigo-300">
              <div className="text-center">
                <div className="text-5xl mb-3">😴</div>
                <h3 className="text-xl font-bold mb-2 text-indigo-600">{gameData.pet.name} is Sleeping</h3>
                <p className="text-gray-600 mb-4">Your little one is resting peacefully...</p>
                <button
                  onClick={() => {
                    setGameData(prev => {
                      const hoursSlept = 8; // Simulate full sleep
                      const bond = applyBondProgress(prev, 3);
                      return {
                        ...prev,
                        pet: {
                          ...prev.pet,
                          isSleeping: false,
                          energy: Math.min(100, prev.pet.energy + 30),
                          sleepiness: Math.max(0, prev.pet.sleepiness - 50),
                          hunger: Math.max(0, prev.pet.hunger - 10), // Gets hungry after sleep
                          happiness: Math.min(100, prev.pet.happiness + 5)
                        },
                        careHistory: [...prev.careHistory, { action: 'wake', player: currentPlayer, time: new Date() }],
                        lastCareAction: { action: 'wake', player: currentPlayer },
                        ...bond
                      };
                    });
                    promptPassDevice();
                  }}
                  className="bg-gradient-to-r from-indigo-400 to-purple-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Wake {gameData.pet.name} Up ☀️
                </button>
                </div>
            </div>
          ) : (
            <>
              {/* Food Inventory Quick View */}
              <div className="bg-white rounded-2xl p-4 mb-4 shadow-lg">
                <div className="flex justify-between items-center flex-wrap gap-3">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">🛒 Food Inventory</h4>
                    <div className="flex gap-2 flex-wrap">
                      {Object.entries(gameData.foodInventory).map(([emoji, quantity]) => {
                        if (quantity > 0) {
                          const foodItem = foodItems.find(f => f.emoji === emoji);
                          return (
                            <span key={emoji} className="text-2xl" title={`${quantity}x ${foodItem?.name || emoji}`}>
                              {emoji} <span className="text-xs text-gray-600">{quantity}</span>
                            </span>
                          );
                        }
                        return null;
                      })}
                      {Object.values(gameData.foodInventory).every(q => q === 0) && (
                        <span className="text-sm text-gray-500">No food - visit shop!</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setGameState('foodShop')}
                    className="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-4 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    🛒 Buy Food
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 mb-4 shadow-lg border-2 border-purple-300">
                <h3 className="text-xl font-bold text-center mb-4 text-purple-600">
                  💕 Care for {gameData.pet.name} Together
                </h3>
                <p className="text-sm text-gray-600 text-center mb-4">
                  Taking care of your little one together strengthens your bond
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  onClick={() => {
                    setFeedingStep(0);
                    setFeedingProgress(0);
                    setGameState('feeding');
                  }}
                  className="bg-gradient-to-r from-orange-400 to-red-500 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all active:scale-95"
                >
                  <div className="text-3xl mb-1">🍽️</div>
                  <div className="text-sm font-semibold">Feed</div>
                </button>
                
                <button
                  onClick={() => {
                    setBedtimeStep(0);
                    setBedtimeStory('');
                    setGameState('bedtime');
                  }}
                  className="bg-gradient-to-r from-indigo-400 to-purple-500 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all active:scale-95"
                >
                  <div className="text-3xl mb-1">🛏️</div>
                  <div className="text-sm font-semibold">Put to Bed</div>
                </button>
                
                <button
                  onClick={() => {
                    setTeachingStep(0);
                    setTeachingActivity(null);
                    setGameState('teaching');
                  }}
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all active:scale-95"
                >
                  <div className="text-3xl mb-1">📚</div>
                  <div className="text-sm font-semibold">Teach</div>
                </button>
                
                <button
                  onClick={() => {
                    setGameData(prev => {
                      const newCleanliness = Math.min(100, prev.pet.cleanliness + 30);
                      const newLove = Math.min(100, prev.pet.love + 3);
                      const bond = applyBondProgress(prev, 2);
                      return {
                        ...prev,
                        pet: {
                          ...prev.pet,
                          cleanliness: newCleanliness,
                          love: newLove,
                          happiness: Math.min(100, prev.pet.happiness + 3),
                          energy: Math.min(100, prev.pet.energy + 5) // Bath time is refreshing
                        },
                        careHistory: [...prev.careHistory, { action: 'shower', player: currentPlayer, time: new Date() }],
                        lastCareAction: { action: 'shower', player: currentPlayer },
                        ...bond
                      };
                    });
                    promptPassDevice();
                  }}
                  className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all active:scale-95"
                >
                  <div className="text-3xl mb-1">🚿</div>
                  <div className="text-sm font-semibold">Shower</div>
                </button>
              </div>
              {gameData.lastCareAction && (
                <p className="text-xs text-center text-gray-500 mt-3">
                  {gameData.lastCareAction.player} just {
                    gameData.lastCareAction.action === 'feed' ? 'fed' : 
                    gameData.lastCareAction.action === 'bedtime' ? 'put' : 
                    gameData.lastCareAction.action === 'teach' ? 'taught' : 
                    gameData.lastCareAction.action === 'shower' ? 'bathed' : 
                    'cared for'
                  } {gameData.pet.name} 💕
                </p>
              )}
              </div>
            </>
          )}

          {/* Primary Action - Conversations */}
          <div className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl p-6 mb-4 shadow-lg text-white">
            <h3 className="text-2xl font-bold mb-2 text-center">💬 Start a Conversation</h3>
            <p className="text-center mb-4 opacity-90">Build your bond through meaningful conversations</p>
            <p className="text-center mb-4 text-xs opacity-75">As you grow closer, {gameData.pet.name} grows stronger 💕</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button 
                onClick={() => {
                  setNeverHaveIEverIndex(0);
                  setGameState('neverHaveIEver');
                }}
                className="bg-white text-pink-600 py-4 rounded-xl font-semibold hover:bg-pink-50 transition-all text-lg shadow-lg"
              >
                🎴 Never Have I Ever
                <div className="text-sm font-normal mt-1 text-gray-600">Share and discover together</div>
              </button>
              <button 
                onClick={() => {
                  setRelationshipExplorerIndex(0);
                  setGameState('relationshipExplorer');
                }}
                className="bg-white text-purple-600 py-4 rounded-xl font-semibold hover:bg-purple-50 transition-all text-lg shadow-lg"
              >
                💕 Relationship Explorer
                <div className="text-sm font-normal mt-1 text-gray-600">Deep questions to connect</div>
              </button>
              {relationshipMode === 'parentChild' && (
                <>
                  <button 
                    onClick={() => {
                      setLearnAboutEachOtherIndex(0);
                      setGameState('learnAboutEachOther');
                    }}
                    className="bg-white text-blue-600 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-all text-lg shadow-lg"
                  >
                    🔍 Learn About Each Other
                    <div className="text-sm font-normal mt-1 text-gray-600">Discover and share together</div>
                  </button>
                  <button 
                    onClick={() => {
                      setParentTeachesIndex(0);
                      setSelectedLesson(null);
                      setGameState('parentTeaches');
                    }}
                    className="bg-white text-green-600 py-4 rounded-xl font-semibold hover:bg-green-50 transition-all text-lg shadow-lg"
                  >
                    📚 Parent Teaches Child
                    <div className="text-sm font-normal mt-1 text-gray-600">Share knowledge and wisdom</div>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Secondary Activities */}
          <div className="bg-white rounded-2xl p-4 mb-4 shadow-lg">
            <h3 className="text-lg font-bold mb-3 text-center text-gray-700">Other Activities</h3>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setGameState('puzzleGames')}
                className="bg-gradient-to-r from-pink-400 to-purple-400 text-white py-3 rounded-xl font-semibold active:scale-95 transition-all">
                🧩 Puzzles
              </button>
              <button onClick={() => setGameState('boardGames')}
                className="bg-gradient-to-r from-purple-400 to-blue-400 text-white py-3 rounded-xl font-semibold active:scale-95 transition-all">
                🎲 Games
              </button>
              <button onClick={() => setGameState('brickGames')}
                className="bg-gradient-to-r from-red-400 to-orange-400 text-white py-3 rounded-xl font-semibold active:scale-95 transition-all">
                🧱 Brick Games
              </button>
              <button onClick={() => setGameState('arcadeGames')}
                className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white py-3 rounded-xl font-semibold active:scale-95 transition-all">
                👾 Arcade
              </button>
              <button onClick={() => setGameState('shop')}
                className="bg-gradient-to-r from-rose-400 to-pink-500 text-white py-3 rounded-xl font-semibold active:scale-95 transition-all">
                🎁 Gift Shop
              </button>
              <button onClick={() => setGameState('petShop')}
                className="bg-gradient-to-r from-teal-400 to-cyan-500 text-white py-3 rounded-xl font-semibold active:scale-95 transition-all">
                🐾 Pet Shop
              </button>
              <button onClick={() => setGameState('bibleVerses')}
                className="bg-gradient-to-r from-indigo-400 to-violet-500 text-white py-3 rounded-xl font-semibold active:scale-95 transition-all col-span-2">
                📖 Bible Verses
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Food Shop
  if (gameState === 'foodShop') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-200 via-yellow-200 to-orange-200 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-green-600">🛒 Food Shop</h2>
              <div className="flex gap-3">
                <div className="text-xl font-bold text-yellow-600">🪙 {gameData.coins}</div>
                <button onClick={() => setGameState('pet')}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-600">
                  ← Back
                </button>
              </div>
            </div>
            
            <p className="text-gray-600 mb-6 text-center">Buy food to feed {gameData.pet.name}!</p>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {foodItems.map((food) => {
                const quantity = gameData.foodInventory[food.emoji] || 0;
                const canAfford = gameData.coins >= food.cost;
                
                return (
                  <div key={food.emoji} className="bg-gradient-to-br from-green-50 to-yellow-50 rounded-xl p-4 border-2 border-green-200">
                    <div className="text-center mb-3">
                      <div className="text-5xl mb-2">{food.emoji}</div>
                      <div className="font-semibold text-sm text-gray-700">{food.name}</div>
                      <div className="text-xs text-gray-600">+{food.nutrition} hunger</div>
                    </div>
                    <div className="text-center mb-2">
                      <div className="text-lg font-bold text-yellow-600">🪙 {food.cost}</div>
                      {quantity > 0 && (
                        <div className="text-xs text-green-600 font-semibold">Own: {quantity}</div>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        if (canAfford) {
                          setGameData(prev => ({
                            ...prev,
                            coins: prev.coins - food.cost,
                            foodInventory: {
                              ...prev.foodInventory,
                              [food.emoji]: (prev.foodInventory[food.emoji] || 0) + 1
                            }
                          }));
                        }
                      }}
                      disabled={!canAfford}
                      className={`w-full py-2 rounded-lg font-semibold text-sm ${
                        canAfford
                          ? 'bg-green-500 text-white hover:bg-green-600 active:scale-95'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {canAfford ? 'Buy' : 'Not Enough'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Interactive Feeding Activity
  if (gameState === 'feeding') {
    const availableFoods = foodItems.filter(food => (gameData.foodInventory[food.emoji] || 0) > 0);
    
    if (feedingStep === 0) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-orange-200 via-red-200 to-pink-200 p-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-orange-600">🍽️ Feed {gameData.pet.name}</h2>
                <button onClick={() => setGameState('pet')}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-600">
                  ← Back
                </button>
              </div>
              
              <div className="text-center mb-6">
                <div className="text-6xl mb-4 animate-bounce">{getPetMood()}</div>
                <p className="text-lg text-gray-700 mb-4">Choose what to feed {gameData.pet.name}:</p>
              </div>
              
              {availableFoods.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-5xl mb-4">🛒</div>
                  <p className="text-lg text-gray-700 mb-4">No food in inventory!</p>
                  <p className="text-gray-600 mb-6">Visit the food shop to buy food for {gameData.pet.name}</p>
                  <button
                    onClick={() => setGameState('foodShop')}
                    className="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition-all text-lg"
                  >
                    🛒 Go to Food Shop
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    {availableFoods.map((food) => {
                      const quantity = gameData.foodInventory[food.emoji] || 0;
                      return (
                        <button
                          key={food.emoji}
                          onClick={() => {
                            setSelectedFood(food);
                            setFeedingStep(1);
                            setFeedingProgress(0);
                          }}
                          className="bg-gradient-to-br from-orange-100 to-red-100 p-6 rounded-xl hover:scale-110 transition-all active:scale-95 border-2 border-orange-300 relative"
                        >
                          <div className="text-5xl mb-2">{food.emoji}</div>
                          {quantity > 1 && (
                            <div className="absolute top-1 right-1 bg-green-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                              {quantity}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <div className="text-center">
                    <button
                      onClick={() => setGameState('foodShop')}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      🛒 Buy More Food
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      );
    }
    
    if (feedingStep === 1) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-orange-200 via-red-200 to-pink-200 p-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-orange-600">🍽️ Feeding {gameData.pet.name}</h2>
                <button onClick={() => {
                  setFeedingStep(0);
                  setFeedingProgress(0);
                }}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-600">
                  ← Back
                </button>
              </div>
              
              <div className="text-center mb-6">
                <div className="text-6xl mb-4 animate-bounce">{selectedFood?.emoji || selectedFood}</div>
                <p className="text-lg text-gray-700 mb-4">Feed {gameData.pet.name} the {selectedFood?.name || selectedFood}</p>
                <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                  <div className="bg-gradient-to-r from-orange-400 to-red-500 h-4 rounded-full transition-all"
                    style={{ width: `${feedingProgress}%` }}></div>
                </div>
                <p className="text-sm text-gray-600">{Math.round(feedingProgress)}% fed</p>
              </div>
              
              <div className="text-center">
                <button
                  onClick={() => {
                    const newProgress = Math.min(100, feedingProgress + 10);
                    setFeedingProgress(newProgress);
                    
                    if (newProgress >= 100) {
                      setFeedingStep(2);
                      setGameData(prev => {
                        const foodEmoji = selectedFood?.emoji || selectedFood;
                        const foodItem = foodItems.find(f => f.emoji === foodEmoji) || foodItems[0];
                        const newHunger = Math.min(100, prev.pet.hunger + foodItem.nutrition);
                        const newLove = Math.min(100, prev.pet.love + 5);
                        const newProgress = Math.min(100, prev.relationshipProgress + 3);
                        const newQuantity = Math.max(0, (prev.foodInventory[foodEmoji] || 0) - 1);
                        
                        return {
                          ...prev,
                          pet: {
                            ...prev.pet,
                            hunger: newHunger,
                            love: newLove,
                            happiness: Math.min(100, prev.pet.happiness + 5),
                            energy: Math.min(100, prev.pet.energy + 5)
                          },
                          relationshipProgress: newProgress,
                          foodInventory: {
                            ...prev.foodInventory,
                            [foodEmoji]: newQuantity
                          },
                          careHistory: [...prev.careHistory, { action: 'feed', player: currentPlayer, time: new Date() }],
                          lastCareAction: { action: 'feed', player: currentPlayer }
                        };
                      });
                    }
                  }}
                  className="bg-gradient-to-r from-orange-400 to-red-500 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition-all text-lg active:scale-95"
                >
                  {feedingProgress < 100 ? '🍽️ Feed More' : '✅ Done!'}
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    if (feedingStep === 2) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-orange-200 via-red-200 to-pink-200 p-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
              <div className="text-6xl mb-4">😊</div>
              <h2 className="text-2xl font-bold text-green-600 mb-4">Great job!</h2>
              <p className="text-lg text-gray-700 mb-6">{gameData.pet.name} is full and happy!</p>
              <button
                onClick={() => {
                  setFeedingStep(0);
                  setFeedingProgress(0);
                  setGameState('pet');
                }}
                className="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition-all text-lg"
              >
                Return to Pet 💕
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  // Interactive Teaching Activity
  if (gameState === 'teaching') {
    const teachingActivities = [
      { id: 'colors', name: 'Colors', icon: '🌈', words: ['Red', 'Blue', 'Green', 'Yellow', 'Purple'] },
      { id: 'numbers', name: 'Numbers', icon: '🔢', words: ['One', 'Two', 'Three', 'Four', 'Five'] },
      { id: 'animals', name: 'Animals', icon: '🐾', words: ['Dog', 'Cat', 'Bird', 'Fish', 'Rabbit'] },
      { id: 'shapes', name: 'Shapes', icon: '🔷', words: ['Circle', 'Square', 'Triangle', 'Star', 'Heart'] }
    ];
    
    if (teachingStep === 0) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-200 via-orange-200 to-amber-200 p-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-yellow-600">📚 Teach {gameData.pet.name}</h2>
                <button onClick={() => setGameState('pet')}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-600">
                  ← Back
                </button>
              </div>
              
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">{getPetMood()}</div>
                <p className="text-lg text-gray-700 mb-4">What would you like to teach {gameData.pet.name} today?</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {teachingActivities.map((activity) => (
                  <button
                    key={activity.id}
                    onClick={() => {
                      setTeachingActivity(activity);
                      setTeachingStep(1);
                      setCurrentWordIndex(0);
                    }}
                    className="bg-gradient-to-br from-yellow-100 to-orange-100 p-6 rounded-xl hover:scale-105 transition-all active:scale-95 border-2 border-yellow-300"
                  >
                    <div className="text-5xl mb-2">{activity.icon}</div>
                    <div className="font-semibold text-lg">{activity.name}</div>
                  </button>
                    ))}
                  </div>
            </div>
          </div>
        </div>
      );
    }
    
    if (teachingStep === 1 && teachingActivity) {
      const currentWord = teachingActivity.words[currentWordIndex];
      const isComplete = currentWordIndex >= teachingActivity.words.length;
      
      return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-200 via-orange-200 to-amber-200 p-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-yellow-600">📚 Teaching {teachingActivity.name}</h2>
                <button onClick={() => {
                  setTeachingStep(0);
                  setCurrentWordIndex(0);
                }}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-600">
                  ← Back
                </button>
              </div>
              
              {!isComplete ? (
                <>
                  <div className="text-center mb-6">
                    <div className="text-7xl mb-4">{teachingActivity.icon}</div>
                    <div className="text-5xl font-bold text-gray-800 mb-4">{currentWord}</div>
                    <p className="text-gray-600 mb-4">
                      Word {currentWordIndex + 1} of {teachingActivity.words.length}
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all"
                        style={{ width: `${((currentWordIndex + 1) / teachingActivity.words.length) * 100}%` }}></div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-lg text-gray-700 mb-4">Say "{currentWord}" together and point to examples!</p>
                    <button
                      onClick={() => {
                        if (currentWordIndex < teachingActivity.words.length - 1) {
                          setCurrentWordIndex(currentWordIndex + 1);
                        } else {
                          setTeachingStep(2);
                          setGameData(prev => {
                            const newLearning = Math.min(100, prev.pet.learning + 20);
                            const newLove = Math.min(100, prev.pet.love + 6);
                            const newProgress = Math.min(100, prev.relationshipProgress + 4);
                            return {
                              ...prev,
                              pet: {
                                ...prev.pet,
                                learning: newLearning,
                                love: newLove,
                                happiness: Math.min(100, prev.pet.happiness + 6),
                                energy: Math.max(0, prev.pet.energy - 5)
                              },
                              relationshipProgress: newProgress,
                              careHistory: [...prev.careHistory, { action: 'teach', player: currentPlayer, time: new Date() }],
                              lastCareAction: { action: 'teach', player: currentPlayer }
                            };
                          });
                        }
                      }}
                      className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition-all text-lg active:scale-95"
                    >
                      {currentWordIndex < teachingActivity.words.length - 1 ? '➡️ Next Word' : '✅ Complete Lesson'}
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <div className="text-6xl mb-4">🎉</div>
                  <h2 className="text-2xl font-bold text-green-600 mb-4">Lesson Complete!</h2>
                  <p className="text-lg text-gray-700 mb-6">{gameData.pet.name} learned {teachingActivity.name}!</p>
                  <button
                    onClick={() => {
                      setTeachingStep(0);
                      setCurrentWordIndex(0);
                      setTeachingActivity(null);
                      setGameState('pet');
                    }}
                    className="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition-all text-lg"
                  >
                    Return to Pet 💕
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }
  }

  // Interactive Bedtime Routine
  if (gameState === 'bedtime') {
    const bedtimeStories = [
      "Once upon a time, there was a little pet who was loved very much by two special people...",
      "In a cozy home, a tiny pet dreamed of adventures with their loving family...",
      "The stars twinkled as a little pet snuggled close, feeling safe and loved...",
      "A magical pet discovered that love makes everything grow, just like a beautiful garden..."
    ];
    
    if (bedtimeStep === 0) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-200 via-purple-200 to-blue-200 p-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-indigo-600">🛏️ Bedtime for {gameData.pet.name}</h2>
                <button onClick={() => setGameState('pet')}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-600">
                  ← Back
                </button>
              </div>
              
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">{getPetMood()}</div>
                <p className="text-lg text-gray-700 mb-4">Let's get {gameData.pet.name} ready for bed</p>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="bg-indigo-50 rounded-lg p-4 border-2 border-indigo-200">
                  <h3 className="font-semibold text-indigo-700 mb-2">Bedtime Routine:</h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>🛏️ Change into pajamas</li>
                    <li>🪥 Brush teeth</li>
                    <li>📖 Read a bedtime story</li>
                    <li>💤 Tuck in and say goodnight</li>
                  </ul>
                </div>
              </div>
              
              <button
                onClick={() => {
                  setBedtimeStep(1);
                  setPajamasProgress(0);
                }}
                className="w-full bg-gradient-to-r from-indigo-400 to-purple-500 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all text-lg active:scale-95"
              >
                Start Bedtime Routine 🌙
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    // Step 1: Change into pajamas
    if (bedtimeStep === 1) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-200 via-purple-200 to-blue-200 p-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-indigo-600">🛏️ Change into Pajamas</h2>
                <button onClick={() => setBedtimeStep(0)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-600">
                  ← Back
                </button>
              </div>
              
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">🛏️</div>
                <p className="text-lg text-gray-700 mb-4">Help {gameData.pet.name} change into cozy pajamas</p>
                <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                  <div className="bg-gradient-to-r from-indigo-400 to-purple-500 h-4 rounded-full transition-all"
                    style={{ width: `${pajamasProgress}%` }}></div>
                </div>
                <p className="text-sm text-gray-600">{Math.round(pajamasProgress)}% done</p>
              </div>
              
              <div className="text-center">
                <button
                  onClick={() => {
                    const newProgress = Math.min(100, pajamasProgress + 25);
                    setPajamasProgress(newProgress);
                    
                    if (newProgress >= 100) {
                      setBedtimeStep(2);
                      setTeethBrushingProgress(0);
                    }
                  }}
                  className="bg-gradient-to-r from-indigo-400 to-purple-500 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition-all text-lg active:scale-95"
                >
                  {pajamasProgress < 100 ? '👕 Put on Pajamas' : '✅ Done!'}
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    // Step 2: Brush teeth
    if (bedtimeStep === 2) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-cyan-200 via-blue-200 to-indigo-200 p-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-cyan-600">🪥 Brush Teeth</h2>
                <button onClick={() => setBedtimeStep(1)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-600">
                  ← Back
                </button>
              </div>
              
              <div className="text-center mb-6">
                <div className="text-6xl mb-4 animate-pulse">🪥</div>
                <p className="text-lg text-gray-700 mb-4">Help {gameData.pet.name} brush their teeth</p>
                <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                  <div className="bg-gradient-to-r from-cyan-400 to-blue-500 h-4 rounded-full transition-all"
                    style={{ width: `${teethBrushingProgress}%` }}></div>
                </div>
                <p className="text-sm text-gray-600">{Math.round(teethBrushingProgress)}% done</p>
                <p className="text-xs text-gray-500 mt-2">Brush up and down, back and forth! ✨</p>
              </div>
              
              <div className="text-center">
                <button
                  onClick={() => {
                    const newProgress = Math.min(100, teethBrushingProgress + 20);
                    setTeethBrushingProgress(newProgress);
                    
                    if (newProgress >= 100) {
                      setBedtimeStep(3);
                      setBedtimeStory(bedtimeStories[Math.floor(Math.random() * bedtimeStories.length)]);
                    }
                  }}
                  className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition-all text-lg active:scale-95"
                >
                  {teethBrushingProgress < 100 ? '🪥 Brush Teeth' : '✅ Done!'}
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    // Step 3: Read bedtime story (original step 1)
    if (bedtimeStep === 3) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-200 via-purple-200 to-blue-200 p-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-indigo-600">📖 Bedtime Story</h2>
                <button onClick={() => setBedtimeStep(2)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-600">
                  ← Back
                </button>
              </div>
              
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">📚</div>
                <div className="bg-indigo-50 rounded-lg p-6 mb-4">
                  <p className="text-lg text-gray-700 leading-relaxed italic">"{bedtimeStory}"</p>
                </div>
                <p className="text-sm text-gray-600">Read this story together to {gameData.pet.name}</p>
              </div>
              
              <button
                onClick={() => {
                  setBedtimeStep(4);
                }}
                className="w-full bg-gradient-to-r from-indigo-400 to-purple-500 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all text-lg active:scale-95"
              >
                Story Finished ➡️
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    // Step 4: Tuck in and say goodnight
    if (bedtimeStep === 4) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-200 via-purple-200 to-blue-200 p-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-indigo-600">🌙 Tuck {gameData.pet.name} In</h2>
                <button onClick={() => setBedtimeStep(3)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-600">
                  ← Back
                </button>
              </div>
              
              <div className="text-center mb-6">
                <div className="text-6xl mb-4 animate-pulse">😴</div>
                <p className="text-lg text-gray-700 mb-4">Tuck {gameData.pet.name} in and say goodnight</p>
                <div className="bg-indigo-50 rounded-lg p-4 mb-4">
                  <p className="text-gray-700">💤 {gameData.pet.name} is getting sleepy...</p>
                </div>
              </div>
              
              <button
                onClick={() => {
                  setBedtimeStep(5);
                  setGameData(prev => {
                    return {
                      ...prev,
                      pet: {
                        ...prev.pet,
                        isSleeping: true,
                        sleepiness: Math.max(0, prev.pet.sleepiness - 50),
                        love: Math.min(100, prev.pet.love + 8),
                        happiness: Math.min(100, prev.pet.happiness + 5)
                      },
                      relationshipProgress: Math.min(100, prev.relationshipProgress + 5),
                      careHistory: [...prev.careHistory, { action: 'bedtime', player: currentPlayer, time: new Date() }],
                      lastCareAction: { action: 'bedtime', player: currentPlayer }
                    };
                  });
                }}
                className="w-full bg-gradient-to-r from-indigo-400 to-purple-500 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all text-lg active:scale-95"
              >
                💤 Say Goodnight & Tuck In
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    // Step 5: All done - pet is sleeping
    if (bedtimeStep === 5) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-200 via-purple-200 to-blue-200 p-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
              <div className="text-6xl mb-4">😴✨</div>
              <h2 className="text-2xl font-bold text-indigo-600 mb-4">Sweet Dreams!</h2>
              <p className="text-lg text-gray-700 mb-6">{gameData.pet.name} is sleeping peacefully...</p>
              <button
                onClick={() => {
                  setBedtimeStep(0);
                  setBedtimeStory('');
                  setPajamasProgress(0);
                  setTeethBrushingProgress(0);
                  setGameState('pet');
                }}
                className="bg-gradient-to-r from-indigo-400 to-purple-500 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition-all text-lg"
              >
                Return to Pet 💕
            </button>
          </div>
        </div>
      </div>
    );
    }
  }

  // Learn About Each Other Activity (Parent-Child)
  if (gameState === 'learnAboutEachOther') {
    const learnQuestions = [
      "What's your favorite hobby or activity?",
      "What makes you feel proud?",
      "What's something you're curious about?",
      "What's a skill you'd like to learn?",
      "What's your favorite memory with me?",
      "What's something that makes you happy?",
      "What's a goal you have?",
      "What's something you want to share with me?",
      "What's your favorite subject or topic?",
      "What's something you're good at?",
      "What's a challenge you're facing?",
      "What's something you'd like to do together?",
      "What's your favorite way to spend time?",
      "What's something you've learned recently?",
      "What's a question you have for me?"
    ];
    
    const currentQuestion = learnQuestions[learnAboutEachOtherIndex % learnQuestions.length];
    
    const nextQuestion = () => {
      setLearnAboutEachOtherIndex(prev => {
        const newIndex = (prev + 1) % learnQuestions.length;
        return newIndex;
      });
    };
    
    const completeActivity = () => {
      setGameData(prev => ({
        ...prev,
        conversationsCompleted: prev.conversationsCompleted + 1,
        relationshipProgress: Math.min(100, prev.relationshipProgress + 5),
        bondLevel: Math.floor((prev.relationshipProgress + 5) / 20) + 1,
        pet: {
          ...prev.pet,
          happiness: Math.min(100, prev.pet.happiness + 5),
          love: Math.min(100, prev.pet.love + 5),
          learning: Math.min(100, prev.pet.learning + 3)
        },
        coins: prev.coins + 20,
        conversationHistory: [...prev.conversationHistory, { 
          type: 'learnAboutEachOther', 
          question: currentQuestion, 
          time: new Date() 
        }]
      }));
      setGameState('pet');
    };
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-200 via-cyan-200 to-indigo-200 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-blue-600">🔍 Learn About Each Other</h2>
              <button onClick={() => setGameState('pet')}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-600">
                ← Back
              </button>
            </div>
            
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">💬</div>
              <p className="text-lg text-gray-700 mb-4">Take turns answering and learning about each other</p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 mb-6 border-2 border-blue-200">
              <h3 className="text-2xl font-bold mb-4 text-blue-700">Question:</h3>
              <p className="text-xl font-semibold text-gray-800 mb-4">{currentQuestion}</p>
              <p className="text-sm text-gray-600 italic">Take turns sharing your answers with each other</p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={nextQuestion}
                className="w-full bg-gradient-to-r from-blue-400 to-cyan-500 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all text-lg active:scale-95"
              >
                Next Question ➡️
              </button>
              <button
                onClick={completeActivity}
                className="w-full bg-gradient-to-r from-green-400 to-emerald-500 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all text-lg active:scale-95"
              >
                Complete Activity ✅ (+20 coins, +5% bond)
              </button>
            </div>
            
            <div className="mt-6 text-center text-sm text-gray-600">
              Question {learnAboutEachOtherIndex + 1} of {learnQuestions.length}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Parent Teaches Child Activity
  if (gameState === 'parentTeaches') {
    const lessons = [
      { id: 'math', name: 'Mathematics', emoji: '🔢', description: 'Numbers, counting, and basic math' },
      { id: 'reading', name: 'Reading', emoji: '📖', description: 'Letters, words, and stories' },
      { id: 'science', name: 'Science', emoji: '🔬', description: 'Nature, experiments, and discovery' },
      { id: 'art', name: 'Art & Creativity', emoji: '🎨', description: 'Drawing, colors, and imagination' },
      { id: 'music', name: 'Music', emoji: '🎵', description: 'Songs, rhythm, and instruments' },
      { id: 'life', name: 'Life Skills', emoji: '🌱', description: 'Important lessons for everyday life' },
      { id: 'history', name: 'History', emoji: '📜', description: 'Stories from the past' },
      { id: 'nature', name: 'Nature', emoji: '🌳', description: 'Plants, animals, and the environment' }
    ];
    
    if (!selectedLesson) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-green-200 via-emerald-200 to-teal-200 p-4">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-green-600">📚 Parent Teaches Child</h2>
                <button onClick={() => setGameState('pet')}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-600">
                  ← Back
                </button>
              </div>
              
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">📚</div>
                <p className="text-lg text-gray-700 mb-4">Choose a lesson to teach together</p>
                <p className="text-sm text-gray-600">Share knowledge and learn together!</p>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {lessons.map((lesson) => (
                  <button
                    key={lesson.id}
                    onClick={() => setSelectedLesson(lesson)}
                    className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200 hover:border-green-400 transition-all hover:shadow-lg active:scale-95"
                  >
                    <div className="text-4xl mb-2">{lesson.emoji}</div>
                    <div className="font-semibold text-gray-800 mb-1">{lesson.name}</div>
                    <div className="text-xs text-gray-600">{lesson.description}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    const lessonContent = {
      math: [
        "Let's count together: 1, 2, 3, 4, 5...",
        "What's 2 + 2? Let's figure it out!",
        "Can you find 3 red objects in the room?",
        "Let's practice counting by 10s: 10, 20, 30..."
      ],
      reading: [
        "Let's learn the letter A. What words start with A?",
        "Can you find the word 'love' in this sentence?",
        "Let's read a story together. What happens next?",
        "What's your favorite letter? Let's write it!"
      ],
      science: [
        "Why do plants need water? Let's explore!",
        "What happens when we mix colors?",
        "Let's observe the weather today. What do you see?",
        "How do butterflies grow? Let's learn together!"
      ],
      art: [
        "What colors make you happy? Let's draw it!",
        "Can you create a picture of our family?",
        "Let's make something beautiful together!",
        "What's your favorite thing to draw?"
      ],
      music: [
        "Let's sing a song together!",
        "Can you clap to the rhythm?",
        "What's your favorite song? Let's sing it!",
        "Let's make music with our voices!"
      ],
      life: [
        "Why is it important to be kind to others?",
        "How do we take care of ourselves?",
        "What does it mean to be a good friend?",
        "Let's talk about being responsible!"
      ],
      history: [
        "Let's learn about people from long ago!",
        "What's an important event that happened?",
        "Who are some heroes from history?",
        "Let's explore how things used to be!"
      ],
      nature: [
        "What animals live in the forest?",
        "How do trees grow? Let's find out!",
        "What's your favorite animal? Let's learn about it!",
        "Why is it important to take care of nature?"
      ]
    };
    
    const currentContent = lessonContent[selectedLesson.id] || lessonContent.math;
    const currentStep = parentTeachesIndex % currentContent.length;
    const currentTeaching = currentContent[currentStep];
    
    const nextStep = () => {
      setParentTeachesIndex(prev => prev + 1);
    };
    
    const completeTeaching = () => {
      setGameData(prev => ({
        ...prev,
        conversationsCompleted: prev.conversationsCompleted + 1,
        relationshipProgress: Math.min(100, prev.relationshipProgress + 8),
        bondLevel: Math.floor((prev.relationshipProgress + 8) / 20) + 1,
        pet: {
          ...prev.pet,
          happiness: Math.min(100, prev.pet.happiness + 8),
          love: Math.min(100, prev.pet.love + 8),
          learning: Math.min(100, prev.pet.learning + 10)
        },
        coins: prev.coins + 30,
        conversationHistory: [...prev.conversationHistory, { 
          type: 'parentTeaches', 
          lesson: selectedLesson.name, 
          time: new Date() 
        }]
      }));
      setSelectedLesson(null);
      setParentTeachesIndex(0);
      setGameState('pet');
    };
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-200 via-emerald-200 to-teal-200 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-green-600">📚 Teaching: {selectedLesson.name}</h2>
              <button onClick={() => {
                setSelectedLesson(null);
                setParentTeachesIndex(0);
              }}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-600">
                ← Back
              </button>
            </div>
            
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">{selectedLesson.emoji}</div>
              <p className="text-lg text-gray-700 mb-4">Share this lesson together</p>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 mb-6 border-2 border-green-200">
              <h3 className="text-xl font-bold mb-4 text-green-700">Lesson Step {currentStep + 1}:</h3>
              <p className="text-lg font-semibold text-gray-800 mb-4">{currentTeaching}</p>
              <p className="text-sm text-gray-600 italic">Parent: Share this with your child. Child: Ask questions and learn!</p>
            </div>
            
            <div className="space-y-3">
              {currentStep < currentContent.length - 1 ? (
                <button
                  onClick={nextStep}
                  className="w-full bg-gradient-to-r from-green-400 to-emerald-500 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all text-lg active:scale-95"
                >
                  Next Step ➡️
                </button>
              ) : (
                <button
                  onClick={completeTeaching}
                  className="w-full bg-gradient-to-r from-blue-400 to-cyan-500 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all text-lg active:scale-95"
                >
                  Complete Lesson ✅ (+30 coins, +8% bond, +10 learning)
                </button>
              )}
            </div>
            
            <div className="mt-6 text-center text-sm text-gray-600">
              Step {currentStep + 1} of {currentContent.length}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'petShop') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-200 via-orange-200 to-pink-200 p-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl p-6 mb-4 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-yellow-600">🛍️ Pet Shop</h2>
              <div className="text-right">
                <div className="text-2xl font-bold text-yellow-600">🪙 {gameData.coins}</div>
                <button onClick={() => setGameState('petSelection')}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold active:bg-gray-600 text-sm mt-2">
                  ← Back
                </button>
              </div>
            </div>
            
            <div className="mb-4 text-center">
              <p className="text-gray-600">Buy pets with coins or unlock them by completing challenges!</p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {petTypes.map((pet) => {
                const isUnlocked = gameData.unlockedPets.includes(pet.id);
                const canAfford = gameData.coins >= pet.cost;
                const isOwned = isUnlocked;
                const isActive = gameData.pet.type === pet.id;
                
                return (
                  <div
                    key={pet.id}
                    className={`p-4 rounded-xl border-4 transition-all relative ${
                      isActive
                        ? 'border-purple-500 bg-purple-50 shadow-lg ring-4 ring-purple-200'
                        : isUnlocked
                        ? 'border-green-300 bg-white'
                        : 'border-gray-300 bg-gray-100 opacity-75'
                    }`}
                  >
                    {!isUnlocked && <div className="absolute top-1 right-1 text-xl">🔒</div>}
                    {isActive && <div className="absolute top-1 left-1">✓</div>}
                    
                    <div className="text-6xl text-center mb-2">{pet.emoji}</div>
                    <div className="font-bold text-center mb-1 text-sm">{pet.name}</div>
                    <div className="text-xs text-gray-600 text-center mb-3 min-h-[40px]">{pet.description}</div>
                    
                    {!isUnlocked ? (
                      <div>
                        <div className="text-center mb-2">
                          <div className="text-lg font-bold text-yellow-600">🪙 {pet.cost}</div>
                        </div>
                        <div className="text-xs text-gray-500 text-center mb-3 min-h-[30px]">
                          {pet.unlockCondition}
                        </div>
                        <button
                          onClick={() => buyPet(pet)}
                          disabled={!canAfford}
                          className={`w-full py-2 rounded-lg font-semibold text-sm min-h-[40px] ${
                            canAfford
                              ? 'bg-yellow-500 text-white active:bg-yellow-600'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {canAfford ? 'Buy Now' : 'Locked'}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setGameData(prev => ({
                            ...prev,
                            pet: { ...prev.pet, type: pet.id, name: pet.name }
                          }));
                          setGameState('pet');
                        }}
                        className={`w-full py-2 rounded-lg font-semibold text-sm min-h-[40px] ${
                          isActive
                            ? 'bg-purple-500 text-white'
                            : 'bg-green-500 text-white active:bg-green-600'
                        }`}
                      >
                        {isActive ? 'Active' : 'Switch To'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'shop') {
    const availableItems = items[relationshipMode] || items.friends;
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-200 via-teal-200 to-blue-200 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-6 mb-4 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-teal-600">🛍️ Shop</h2>
              <div className="text-xl font-bold text-yellow-600">🪙 {gameData.coins}</div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
              {availableItems.map((item) => (
                <div key={item.id} className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-3 sm:p-4 border-2 border-gray-200">
                  <div className="text-3xl sm:text-4xl text-center mb-2">{item.icon}</div>
                  <h3 className="font-semibold text-center mb-1 text-sm sm:text-base">{item.name}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 text-center mb-3">🪙 {item.cost}</p>
                  <button onClick={() => buyItem(item)} disabled={gameData.coins < item.cost}
                    className={`w-full py-2 rounded-lg font-semibold min-h-[44px] active:scale-95 ${
                      gameData.coins >= item.cost ? 'bg-teal-500 text-white active:bg-teal-600' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}>
                    Buy
                  </button>
                </div>
              ))}
            </div>
            
            <button onClick={() => setGameState('pet')}
              className="w-full bg-gray-500 text-white py-3 rounded-xl font-semibold hover:bg-gray-600">
              ← Back to Pet
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'bibleVerses') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-200 via-indigo-200 to-blue-200 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-6 mb-4 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-purple-600">✨ Bible Verses Collection</h2>
              <button onClick={() => setGameState('pet')}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-600">
                ← Back
              </button>
            </div>

            {gameData.bibleVerses.length === 0 ? (
              <div className="text-center p-12 bg-gray-50 rounded-xl">
                <div className="text-6xl mb-4">📖</div>
                <h3 className="text-2xl font-bold text-gray-700 mb-2">No Verses Yet</h3>
                <p className="text-gray-600 mb-4">Complete games to earn Bible verses about humility and family!</p>
                <p className="text-sm text-gray-500">Play games like Chess, Puzzles, and Memory Games to collect verses.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <p className="text-gray-600">You have collected <span className="font-bold text-purple-600">{gameData.bibleVerses.length}</span> Bible verses!</p>
                  <p className="text-sm text-gray-500 italic mt-2">"Humility comes before honor." - Proverbs 15:33</p>
                </div>
                {gameData.bibleVerses.map((verse, index) => (
                  <div key={index} className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border-2 border-purple-200 shadow-md">
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">✨</div>
                      <div className="flex-1">
                        <p className="text-lg font-semibold text-gray-800 mb-3 italic">"{verse.verse}"</p>
                        <div className="flex items-center justify-between">
                          <p className="text-purple-700 font-bold">{verse.reference}</p>
                          <span className="text-xs bg-purple-200 text-purple-800 px-3 py-1 rounded-full font-semibold">
                            {verse.theme === 'humility' ? 'Humility' : 'Family'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Board Games Functions
  const LUDO_COLORS = [
    { id: 'red', label: 'Red', emoji: '🔴', bg: 'bg-red-500', light: 'bg-red-100', start: 0 },
    { id: 'green', label: 'Green', emoji: '🟢', bg: 'bg-green-500', light: 'bg-green-100', start: 13 },
    { id: 'yellow', label: 'Yellow', emoji: '🟡', bg: 'bg-yellow-400', light: 'bg-yellow-100', start: 26 },
    { id: 'blue', label: 'Blue', emoji: '🔵', bg: 'bg-blue-500', light: 'bg-blue-100', start: 39 }
  ];

  const ludoAbs = (playerIdx, rel) => {
    if (rel < 0 || rel > 50) return null;
    return (LUDO_COLORS[playerIdx].start + rel) % 52;
  };

  const ludoIsSafe = (abs) => abs !== null && abs % 13 === 0;

  const initializeLudo = (count = 2) => {
    const names = [
      playerName || 'Player 1',
      player2Name || 'Player 2',
      'Player 3',
      'Player 4'
    ];
    const players = LUDO_COLORS.slice(0, count).map((meta, i) => ({
      ...meta,
      name: names[i],
      tokens: [-1, -1, -1, -1] // -1 yard, 0-50 track, 51-55 home, 56 done
    }));
    setLudoPlayers(players);
    setLudoPlayerCount(count);
    setLudoTurn(0);
    setLudoDice(null);
    setLudoRolled(false);
    setLudoWinner(null);
    setLudoMessage(`${players[0].name}'s turn — roll the dice!`);
  };

  const getLudoValidMoves = (players, turn, dice) => {
    if (!dice || !players[turn]) return [];
    const tokens = players[turn].tokens;
    const moves = [];
    tokens.forEach((rel, idx) => {
      if (rel === 56) return;
      if (rel === -1) {
        if (dice === 6) moves.push(idx);
        return;
      }
      if (rel <= 50) {
        const next = rel + dice;
        if (next <= 50) moves.push(idx);
        else if (next <= 56) moves.push(idx); // enter/finish home with exact-or-less into home path
        return;
      }
      // home stretch 51-55
      if (rel + dice <= 56) moves.push(idx);
    });
    return moves;
  };

  const advanceLudoTurn = (players, turn, rolledSix) => {
    if (rolledSix) {
      setLudoTurn(turn);
      setLudoDice(null);
      setLudoRolled(false);
      setLudoMessage(`${players[turn].name} rolled a 6 — roll again!`);
      return;
    }
    const next = (turn + 1) % players.length;
    setLudoTurn(next);
    setLudoDice(null);
    setLudoRolled(false);
    setLudoMessage(`${players[next].name}'s turn — roll the dice!`);
  };

  const rollLudoDice = () => {
    if (ludoWinner || ludoRolled) return;
    const dice = Math.floor(Math.random() * 6) + 1;
    setLudoDice(dice);
    setLudoRolled(true);
    const moves = getLudoValidMoves(ludoPlayers, ludoTurn, dice);
    if (moves.length === 0) {
      setLudoMessage(`Rolled ${dice} — no moves. Passing...`);
      setTimeout(() => advanceLudoTurn(ludoPlayers, ludoTurn, false), 700);
    } else {
      setLudoMessage(`Rolled ${dice} — tap a glowing token to move`);
    }
  };

  const moveLudoToken = (tokenIdx) => {
    if (ludoWinner || !ludoRolled || !ludoDice) return;
    const valid = getLudoValidMoves(ludoPlayers, ludoTurn, ludoDice);
    if (!valid.includes(tokenIdx)) return;

    const dice = ludoDice;
    const players = ludoPlayers.map(p => ({ ...p, tokens: [...p.tokens] }));
    const me = players[ludoTurn];
    let rel = me.tokens[tokenIdx];
    let msg = '';

    if (rel === -1 && dice === 6) {
      rel = 0;
      msg = `${me.name} entered the board!`;
    } else if (rel >= 0 && rel <= 50) {
      const next = rel + dice;
      if (next <= 50) {
        rel = next;
        const abs = ludoAbs(ludoTurn, rel);
        // Capture opponents
        if (!ludoIsSafe(abs)) {
          players.forEach((p, pi) => {
            if (pi === ludoTurn) return;
            p.tokens = p.tokens.map(t => {
              if (t >= 0 && t <= 50 && ludoAbs(pi, t) === abs) {
                msg = `${me.name} captured ${p.name}'s token!`;
                return -1;
              }
              return t;
            });
          });
        }
      } else {
        rel = next; // 51-56 home / finish
        if (rel === 56) msg = `${me.name} got a token home!`;
        else msg = `${me.name} entered the home stretch!`;
      }
    } else if (rel >= 51 && rel <= 55) {
      rel = rel + dice;
      if (rel === 56) msg = `${me.name} got a token home!`;
    }

    me.tokens[tokenIdx] = rel;
    setLudoPlayers(players);

    if (me.tokens.every(t => t === 56)) {
      setLudoWinner(me.name);
      setLudoMessage(`${me.name} wins Ludo!`);
      awardMiniGameRewards(60, 5, 1);
      setGameData(prev => ({ ...prev, gamesWon: (prev.gamesWon || 0) + 1 }));
      return;
    }

    setLudoMessage(msg || `${me.name} moved`);
    advanceLudoTurn(players, ludoTurn, dice === 6);
  };

  const initializeTicTacToe = () => {
    setTicTacToeBoard(Array(9).fill(null));
    setTicTacToePlayer('X');
    setTicTacToeWinner(null);
  };

  const checkTicTacToeWinner = (board) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6] // diagonals
    ];

    for (let line of lines) {
      const [a, b, c] = line;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    
    if (board.every(cell => cell !== null)) return 'tie';
    return null;
  };

  const handleTicTacToeClick = (index) => {
    if (ticTacToeBoard[index] || ticTacToeWinner) return;
    
    const newBoard = [...ticTacToeBoard];
    newBoard[index] = ticTacToePlayer;
    setTicTacToeBoard(newBoard);
    
      const winner = checkTicTacToeWinner(newBoard);
      if (winner) {
        setTicTacToeWinner(winner);
        if (winner !== 'tie') {
          const coinsEarned = 30;
          const verse = awardBibleVerse(true);
          setGameData(prev => ({
            ...prev,
            coins: prev.coins + coinsEarned,
            gamesWon: prev.gamesWon + 1,
            pet: { ...prev.pet, happiness: Math.min(100, prev.pet.happiness + 5) },
            sharedProgress: Math.min(100, prev.sharedProgress + 5)
          }));
          if (verse) {
            setTimeout(() => {
              alert(`🎉 Well Played! Bible Verse Prize!\n\n"${verse.verse}"\n${verse.reference}`);
            }, 100);
          }
        }
    } else {
      setTicTacToePlayer(ticTacToePlayer === 'X' ? 'O' : 'X');
    }
  };

  const initializeConnect4 = () => {
    setConnect4Board(Array(6).fill(null).map(() => Array(7).fill(null)));
    setConnect4Player('🔴');
    setConnect4Winner(null);
  };

  const initializeCheckers = () => {
    const board = Array(8).fill(null).map(() => Array(8).fill(null));
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if ((row + col) % 2 === 1) {
          if (row < 3) board[row][col] = { type: 'red', king: false };
          else if (row > 4) board[row][col] = { type: 'black', king: false };
        }
      }
    }
    setCheckersBoard(board);
    setCheckersPlayer('red');
    setCheckersSelected(null);
    setCheckersWinner(null);
    setCheckersLegalTargets([]);
    setCheckersJumping(null);
    setCheckersMessage('Red moves first — captures are forced');
  };

  const checkersClone = (board) => board.map(r => r.map(c => (c ? { ...c } : null)));

  const checkersDirs = (piece) => {
    if (piece.king) return [[-1, -1], [-1, 1], [1, -1], [1, 1]];
    return piece.type === 'red' ? [[1, -1], [1, 1]] : [[-1, -1], [-1, 1]];
  };

  const getCheckersJumpsFrom = (board, row, col) => {
    const piece = board[row]?.[col];
    if (!piece) return [];
    const jumps = [];
    for (const [dr, dc] of checkersDirs(piece)) {
      const mr = row + dr;
      const mc = col + dc;
      const lr = row + dr * 2;
      const lc = col + dc * 2;
      if (lr < 0 || lr > 7 || lc < 0 || lc > 7) continue;
      const mid = board[mr]?.[mc];
      if (mid && mid.type !== piece.type && !board[lr][lc]) {
        jumps.push({ row: lr, col: lc, midRow: mr, midCol: mc });
      }
    }
    return jumps;
  };

  const getCheckersStepsFrom = (board, row, col) => {
    const piece = board[row]?.[col];
    if (!piece) return [];
    const steps = [];
    for (const [dr, dc] of checkersDirs(piece)) {
      const nr = row + dr;
      const nc = col + dc;
      if (nr < 0 || nr > 7 || nc < 0 || nc > 7) continue;
      if (!board[nr][nc]) steps.push({ row: nr, col: nc });
    }
    return steps;
  };

  const getAllCheckersJumps = (board, player) => {
    const all = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (board[r][c]?.type === player) {
          const jumps = getCheckersJumpsFrom(board, r, c);
          jumps.forEach(j => all.push({ fromRow: r, fromCol: c, ...j }));
        }
      }
    }
    return all;
  };

  const getCheckersMovesForPiece = (board, row, col, player, jumping) => {
    const piece = board[row]?.[col];
    if (!piece || piece.type !== player) return [];
    if (jumping && (jumping.row !== row || jumping.col !== col)) return [];
    const jumps = getCheckersJumpsFrom(board, row, col);
    if (jumping) return jumps;
    const anyJumps = getAllCheckersJumps(board, player);
    if (anyJumps.length > 0) return jumps;
    return getCheckersStepsFrom(board, row, col);
  };

  const promoteCheckersIfNeeded = (piece, row) => {
    if (piece.king) return piece;
    if (piece.type === 'red' && row === 7) return { ...piece, king: true };
    if (piece.type === 'black' && row === 0) return { ...piece, king: true };
    return piece;
  };

  const countCheckersPieces = (board, player) => {
    let n = 0;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (board[r][c]?.type === player) n++;
      }
    }
    return n;
  };

  const playerHasCheckersMove = (board, player) => {
    if (getAllCheckersJumps(board, player).length > 0) return true;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (board[r][c]?.type === player && getCheckersStepsFrom(board, r, c).length > 0) return true;
      }
    }
    return false;
  };

  const finishCheckersWin = (winner) => {
    setCheckersWinner(winner);
    setCheckersMessage(`${winner === 'red' ? 'Red' : 'Black'} wins!`);
    awardMiniGameRewards(50, 5, 1);
  };

  const handleCheckersClick = (row, col) => {
    if (checkersWinner || !checkersBoard.length) return;
    const board = checkersBoard;
    const player = checkersPlayer;

    if (checkersJumping) {
      const jumps = getCheckersJumpsFrom(board, checkersJumping.row, checkersJumping.col);
      const hit = jumps.find(j => j.row === row && j.col === col);
      if (!hit) return;
      const newBoard = checkersClone(board);
      let piece = newBoard[checkersJumping.row][checkersJumping.col];
      newBoard[checkersJumping.row][checkersJumping.col] = null;
      newBoard[hit.midRow][hit.midCol] = null;
      piece = promoteCheckersIfNeeded(piece, row);
      newBoard[row][col] = piece;
      const more = getCheckersJumpsFrom(newBoard, row, col);
      setCheckersBoard(newBoard);
      if (more.length > 0) {
        setCheckersJumping({ row, col });
        setCheckersSelected({ row, col });
        setCheckersLegalTargets(more.map(j => ({ row: j.row, col: j.col })));
        setCheckersMessage('Continue jumping!');
        return;
      }
      setCheckersJumping(null);
      setCheckersSelected(null);
      setCheckersLegalTargets([]);
      const opponent = player === 'red' ? 'black' : 'red';
      if (countCheckersPieces(newBoard, opponent) === 0 || !playerHasCheckersMove(newBoard, opponent)) {
        finishCheckersWin(player);
      } else {
        setCheckersPlayer(opponent);
        setCheckersMessage(getAllCheckersJumps(newBoard, opponent).length ? 'Capture required!' : `${opponent === 'red' ? 'Red' : 'Black'}'s turn`);
      }
      return;
    }

    if (checkersSelected && checkersSelected.row === row && checkersSelected.col === col) {
      setCheckersSelected(null);
      setCheckersLegalTargets([]);
      return;
    }

    const targets = checkersSelected
      ? getCheckersMovesForPiece(board, checkersSelected.row, checkersSelected.col, player, null)
      : [];
    const moveHit = targets.find(t => t.row === row && t.col === col);

    if (checkersSelected && moveHit) {
      const newBoard = checkersClone(board);
      let piece = newBoard[checkersSelected.row][checkersSelected.col];
      const isJump = Math.abs(row - checkersSelected.row) === 2;
      newBoard[checkersSelected.row][checkersSelected.col] = null;
      if (isJump) {
        const mr = (row + checkersSelected.row) / 2;
        const mc = (col + checkersSelected.col) / 2;
        newBoard[mr][mc] = null;
      }
      piece = promoteCheckersIfNeeded(piece, row);
      newBoard[row][col] = piece;
      setCheckersBoard(newBoard);

      if (isJump) {
        const more = getCheckersJumpsFrom(newBoard, row, col);
        if (more.length > 0) {
          setCheckersJumping({ row, col });
          setCheckersSelected({ row, col });
          setCheckersLegalTargets(more.map(j => ({ row: j.row, col: j.col })));
          setCheckersMessage('Continue jumping!');
          return;
        }
      }

      setCheckersSelected(null);
      setCheckersLegalTargets([]);
      setCheckersJumping(null);
      const opponent = player === 'red' ? 'black' : 'red';
      if (countCheckersPieces(newBoard, opponent) === 0 || !playerHasCheckersMove(newBoard, opponent)) {
        finishCheckersWin(player);
      } else {
        setCheckersPlayer(opponent);
        setCheckersMessage(getAllCheckersJumps(newBoard, opponent).length ? 'Capture required!' : `${opponent === 'red' ? 'Red' : 'Black'}'s turn`);
      }
      return;
    }

    if (board[row][col]?.type === player) {
      const moves = getCheckersMovesForPiece(board, row, col, player, null);
      const anyJumps = getAllCheckersJumps(board, player);
      if (anyJumps.length > 0 && moves.length === 0) {
        setCheckersMessage('You must capture with another piece');
        return;
      }
      setCheckersSelected({ row, col });
      setCheckersLegalTargets(moves.map(m => ({ row: m.row, col: m.col })));
    } else {
      setCheckersSelected(null);
      setCheckersLegalTargets([]);
    }
  };

  const initializeMiniGolf = () => {
    setGolfHole(1);
    setGolfScore(0);
    setGolfStrokes(0);
    setGolfBallPos({ x: 20, y: 70 });
    setGolfVel({ x: 0, y: 0 });
    setGolfAim(-40);
    setGolfPower(45);
    setGolfMoving(false);
    setGolfDone(false);
    golfBallRef.current = { x: 20, y: 70, vx: 0, vy: 0 };
  };

  const dropPiece = (col) => {
    if (connect4Winner) return;
    
    const newBoard = [...connect4Board];
    for (let row = 5; row >= 0; row--) {
      if (!newBoard[row][col]) {
        newBoard[row][col] = connect4Player;
        setConnect4Board(newBoard);
        
        const winner = checkConnect4Winner(newBoard, row, col);
        if (winner) {
          setConnect4Winner(winner);
          const coinsEarned = 50;
          const verse = awardBibleVerse(true);
          setGameData(prev => ({
            ...prev,
            coins: prev.coins + coinsEarned,
            gamesWon: prev.gamesWon + 1,
            pet: { ...prev.pet, happiness: Math.min(100, prev.pet.happiness + 8) },
            sharedProgress: Math.min(100, prev.sharedProgress + 8)
          }));
          if (verse) {
            setTimeout(() => {
              alert(`🎉 Connect 4 Win! Bible Verse Prize!\n\n"${verse.verse}"\n${verse.reference}`);
            }, 100);
          }
        } else {
          // Check for tie
          const isFull = newBoard.every(row => row.every(cell => cell !== null));
          if (isFull) {
            setConnect4Winner('tie');
          } else {
            setConnect4Player(connect4Player === '🔴' ? '🟡' : '🔴');
          }
        }
        break;
      }
    }
  };

  const checkConnect4Winner = (board, row, col) => {
    const player = board[row][col];
    if (!player) return null;

    // Check all directions
    const directions = [
      [[0, 1], [0, -1]], // horizontal
      [[1, 0], [-1, 0]], // vertical
      [[1, 1], [-1, -1]], // diagonal /
      [[1, -1], [-1, 1]] // diagonal \
    ];

    for (let direction of directions) {
      let count = 1;
      
      for (let [dr, dc] of direction) {
        let r = row + dr;
        let c = col + dc;
        while (r >= 0 && r < 6 && c >= 0 && c < 7 && board[r][c] === player) {
          count++;
          r += dr;
          c += dc;
        }
      }
      
      if (count >= 4) return player;
    }
    
    return null;
  };

  // Chess Functions
  const CHESS_SYMBOLS = {
    white: { king: '♔', queen: '♕', rook: '♖', bishop: '♗', knight: '♘', pawn: '♙' },
    black: { king: '♚', queen: '♛', rook: '♜', bishop: '♝', knight: '♞', pawn: '♟' }
  };

  const chessClone = (board) => board.map(r => r.map(c => (c ? { ...c } : null)));

  const initializeChess = () => {
    const board = Array(8).fill(null).map(() => Array(8).fill(null));
    const back = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
    for (let i = 0; i < 8; i++) {
      board[0][i] = { role: back[i], color: 'black', type: CHESS_SYMBOLS.black[back[i]] };
      board[1][i] = { role: 'pawn', color: 'black', type: CHESS_SYMBOLS.black.pawn };
      board[6][i] = { role: 'pawn', color: 'white', type: CHESS_SYMBOLS.white.pawn };
      board[7][i] = { role: back[i], color: 'white', type: CHESS_SYMBOLS.white[back[i]] };
    }
    setChessBoard(board);
    setChessCurrentPlayer('white');
    setChessSelectedSquare(null);
    setChessLegalTargets([]);
    setChessGameOver(false);
    setChessWinner(null);
    setChessEndReason(null);
    setChessStatusMsg("White's turn");
    setChessLastMove(null);
    setChessFlipped(false);
    setChessCaptured({ white: [], black: [] });
  };

  const findChessKing = (board, color) => {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (board[r][c]?.role === 'king' && board[r][c]?.color === color) return [r, c];
      }
    }
    return null;
  };

  const rayMoves = (board, row, col, deltas) => {
    const piece = board[row][col];
    const moves = [];
    for (const [dr, dc] of deltas) {
      let r = row + dr;
      let c = col + dc;
      while (r >= 0 && r < 8 && c >= 0 && c < 8) {
        const target = board[r][c];
        if (!target) moves.push([r, c]);
        else {
          if (target.color !== piece.color) moves.push([r, c]);
          break;
        }
        r += dr;
        c += dc;
      }
    }
    return moves;
  };

  const getRawChessMoves = (board, row, col) => {
    const piece = board[row]?.[col];
    if (!piece) return [];
    const moves = [];
    const { role, color } = piece;

    if (role === 'pawn') {
      const dir = color === 'white' ? -1 : 1;
      const start = color === 'white' ? 6 : 1;
      const fr = row + dir;
      if (fr >= 0 && fr < 8 && !board[fr][col]) {
        moves.push([fr, col]);
        if (row === start && !board[row + dir * 2][col]) moves.push([row + dir * 2, col]);
      }
      for (const dc of [-1, 1]) {
        const c = col + dc;
        if (fr >= 0 && fr < 8 && c >= 0 && c < 8 && board[fr][c] && board[fr][c].color !== color) {
          moves.push([fr, c]);
        }
      }
    } else if (role === 'knight') {
      for (const [dr, dc] of [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]]) {
        const r = row + dr;
        const c = col + dc;
        if (r < 0 || r > 7 || c < 0 || c > 7) continue;
        if (!board[r][c] || board[r][c].color !== color) moves.push([r, c]);
      }
    } else if (role === 'bishop') {
      return rayMoves(board, row, col, [[-1, -1], [-1, 1], [1, -1], [1, 1]]);
    } else if (role === 'rook') {
      return rayMoves(board, row, col, [[-1, 0], [1, 0], [0, -1], [0, 1]]);
    } else if (role === 'queen') {
      return rayMoves(board, row, col, [[-1, -1], [-1, 1], [1, -1], [1, 1], [-1, 0], [1, 0], [0, -1], [0, 1]]);
    } else if (role === 'king') {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (!dr && !dc) continue;
          const r = row + dr;
          const c = col + dc;
          if (r < 0 || r > 7 || c < 0 || c > 7) continue;
          if (!board[r][c] || board[r][c].color !== color) moves.push([r, c]);
        }
      }
    }
    return moves;
  };

  const isSquareAttacked = (board, row, col, byColor) => {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (!p || p.color !== byColor) continue;
        if (p.role === 'pawn') {
          const dir = byColor === 'white' ? -1 : 1;
          if (row === r + dir && (col === c - 1 || col === c + 1)) return true;
          continue;
        }
        if (p.role === 'king') {
          if (Math.abs(r - row) <= 1 && Math.abs(c - col) <= 1) return true;
          continue;
        }
        const attacks = getRawChessMoves(board, r, c);
        if (attacks.some(([ar, ac]) => ar === row && ac === col)) return true;
      }
    }
    return false;
  };

  const isInCheck = (board, color) => {
    const king = findChessKing(board, color);
    if (!king) return true;
    return isSquareAttacked(board, king[0], king[1], color === 'white' ? 'black' : 'white');
  };

  const applyChessMove = (board, fromR, fromC, toR, toC) => {
    const next = chessClone(board);
    let piece = next[fromR][fromC];
    next[fromR][fromC] = null;
    if (piece.role === 'pawn' && (toR === 0 || toR === 7)) {
      piece = { role: 'queen', color: piece.color, type: CHESS_SYMBOLS[piece.color].queen };
    }
    next[toR][toC] = piece;
    return next;
  };

  const getLegalChessMoves = (board, row, col) => {
    const piece = board[row]?.[col];
    if (!piece) return [];
    return getRawChessMoves(board, row, col).filter(([tr, tc]) => {
      const next = applyChessMove(board, row, col, tr, tc);
      return !isInCheck(next, piece.color);
    });
  };

  const hasAnyLegalChessMove = (board, color) => {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (board[r][c]?.color === color && getLegalChessMoves(board, r, c).length > 0) return true;
      }
    }
    return false;
  };

  const handleChessSquareClick = (row, col) => {
    if (chessGameOver || !chessBoard) return;
    const board = chessBoard;
    const square = board[row][col];

    if (chessSelectedSquare) {
      const [selRow, selCol] = chessSelectedSquare;
      const legal = chessLegalTargets.some(([r, c]) => r === row && c === col);
      if (legal) {
        const captured = board[row][col];
        const newBoard = applyChessMove(board, selRow, selCol, row, col);
        setChessBoard(newBoard);
        setChessSelectedSquare(null);
        setChessLegalTargets([]);
        setChessLastMove({ from: [selRow, selCol], to: [row, col] });
        if (captured) {
          setChessCaptured(prev => ({
            ...prev,
            [chessCurrentPlayer]: [...prev[chessCurrentPlayer], captured.type]
          }));
        }
        const opponent = chessCurrentPlayer === 'white' ? 'black' : 'white';
        const oppInCheck = isInCheck(newBoard, opponent);
        const oppHasMove = hasAnyLegalChessMove(newBoard, opponent);
        if (!oppHasMove) {
          setChessGameOver(true);
          if (oppInCheck) {
            setChessWinner(chessCurrentPlayer);
            setChessEndReason('checkmate');
            setChessStatusMsg(`${chessCurrentPlayer === 'white' ? 'White' : 'Black'} wins by checkmate!`);
            awardMiniGameRewards(100, 8, 1);
          } else {
            setChessWinner(null);
            setChessEndReason('stalemate');
            setChessStatusMsg('Stalemate — draw!');
            awardMiniGameRewards(30, 3, 1);
          }
        } else {
          setChessCurrentPlayer(opponent);
          setChessStatusMsg(oppInCheck
            ? `${opponent === 'white' ? 'White' : 'Black'} is in check!`
            : `${opponent === 'white' ? 'White' : 'Black'}'s turn`);
        }
        return;
      }
      if (square && square.color === chessCurrentPlayer) {
        const moves = getLegalChessMoves(board, row, col);
        setChessSelectedSquare([row, col]);
        setChessLegalTargets(moves);
        return;
      }
      setChessSelectedSquare(null);
      setChessLegalTargets([]);
      return;
    }

    if (square && square.color === chessCurrentPlayer) {
      const moves = getLegalChessMoves(board, row, col);
      setChessSelectedSquare([row, col]);
      setChessLegalTargets(moves);
    }
  };

  // Image Memory Game Functions
  const initializeImageMemory = () => {
    const emojis = ['❤️', '🌟', '🎉', '🎈', '🎁', '🎂', '🎄', '🎃', '🌙', '⭐', '💝', '🎀'];
    const selectedEmojis = emojis.slice(0, 8); // Use 8 pairs (16 cards)
    const cards = [...selectedEmojis, ...selectedEmojis]
      .map((emoji, index) => ({ id: index, emoji, matched: false }))
      .sort(() => Math.random() - 0.5);
    
    setImageMemoryCards(cards);
    setImageMemoryFlipped([]);
    setImageMemoryMatched([]);
    setImageMemoryScore(0);
    setImageMemoryMoves(0);
  };

  const handleImageMemoryClick = (index) => {
    if (imageMemoryFlipped.length >= 2 || imageMemoryMatched.includes(index)) return;
    
    const newFlipped = [...imageMemoryFlipped, index];
    setImageMemoryFlipped(newFlipped);
    
    if (newFlipped.length === 2) {
      setImageMemoryMoves(prev => prev + 1);
      const [first, second] = newFlipped;
      
      if (imageMemoryCards[first].emoji === imageMemoryCards[second].emoji) {
        // Match found
        setImageMemoryMatched(prev => [...prev, first, second]);
        setImageMemoryScore(prev => prev + 10);
        setImageMemoryFlipped([]);
        
        // Check if all matched
        if (imageMemoryMatched.length + 2 >= imageMemoryCards.length) {
          const coinsEarned = 40;
          const verse = awardBibleVerse(true);
          setGameData(prev => ({
            ...prev,
            coins: prev.coins + coinsEarned,
            puzzlesCompleted: prev.puzzlesCompleted + 1,
            pet: { ...prev.pet, happiness: Math.min(100, prev.pet.happiness + 10) },
            sharedProgress: Math.min(100, prev.sharedProgress + 10)
          }));
          if (verse) {
            setTimeout(() => {
              alert(`🎉 Perfect Memory! Bible Verse Prize!\n\n"${verse.verse}"\n${verse.reference}\n\nReflect: ${HUMILITY_REFLECTIONS[Math.floor(Math.random() * HUMILITY_REFLECTIONS.length)]}`);
            }, 100);
          }
        }
      } else {
        // No match, flip back after delay
        setTimeout(() => {
          setImageMemoryFlipped([]);
        }, 1000);
      }
    }
  };

  if (gameState === 'boardGames') {
    return (
      <GameShell bgClass="bg-gradient-to-br from-orange-400 via-rose-400 to-fuchsia-500" maxWidth="max-w-4xl">
        <GameCard>
          <GameHeader title="Board Games" titleClass="text-rose-700" onBack={() => setGameState('pet')} />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-6">
              <div className="menu-tile bg-gradient-to-br from-sky-200 to-blue-300">
                <h3 className="game-title text-xl sm:text-2xl font-bold mb-2 text-sky-900">Tic-Tac-Toe</h3>
                <p className="text-sky-900/70 mb-4 text-sm font-semibold">Classic 3×3. Win for 30 coins!</p>
                <button onClick={() => {
                  initializeTicTacToe();
                  setGameState('ticTacToe');
                }}
                  className="ctrl-btn w-full bg-sky-600 text-white py-3">
                  Play Tic-Tac-Toe
                </button>
              </div>

              <div className="menu-tile bg-gradient-to-br from-rose-200 to-orange-300 border-rose-300">
                <h3 className="game-title text-xl sm:text-2xl font-bold mb-2 text-rose-900">Ludo</h3>
                <p className="text-rose-900/70 mb-4 text-sm font-semibold">Pass the device — race tokens home.</p>
                <div className="flex gap-2 mb-3">
                  {[2, 3, 4].map(n => (
                    <button key={n} type="button" onClick={() => setLudoPlayerCount(n)}
                      className={`flex-1 py-2 rounded-xl font-bold text-sm min-h-[40px] ${
                        ludoPlayerCount === n ? 'bg-rose-600 text-white shadow' : 'bg-white/80 text-rose-700 border border-rose-200'
                      }`}>
                      {n}P
                    </button>
                  ))}
                </div>
                <button onClick={() => {
                  initializeLudo(ludoPlayerCount);
                  setGameState('ludo');
                }}
                  className="ctrl-btn w-full bg-rose-600 text-white py-3">
                  Play Ludo
                </button>
              </div>

              <div className="menu-tile bg-gradient-to-br from-red-200 to-amber-200">
                <h3 className="game-title text-xl sm:text-2xl font-bold mb-2 text-red-900">Connect 4</h3>
                <p className="text-red-900/70 mb-4 text-sm font-semibold">Connect 4 in a row. Win for 50 coins!</p>
                <button onClick={() => {
                  initializeConnect4();
                  setGameState('connect4');
                }}
                  className="ctrl-btn w-full bg-red-500 text-white py-3">
                  Play Connect 4
                </button>
              </div>

              <div className="menu-tile bg-gradient-to-br from-teal-200 to-cyan-300">
                <h3 className="game-title text-xl sm:text-2xl font-bold mb-2 text-teal-900">Chess</h3>
                <p className="text-teal-900/70 mb-4 text-sm font-semibold">Legal moves, check & mate. 100 coins!</p>
                <button onClick={() => {
                  initializeChess();
                  setGameState('chess');
                }}
                  className="ctrl-btn w-full bg-teal-600 text-white py-3">
                  Play Chess
                </button>
              </div>

              <div className="menu-tile bg-gradient-to-br from-emerald-200 to-lime-200">
                <h3 className="game-title text-xl sm:text-2xl font-bold mb-2 text-emerald-950">Checkers</h3>
                <p className="text-emerald-900/70 mb-4 text-sm font-semibold">Forced jumps & kings. Win for 50 coins!</p>
                <button onClick={() => {
                  initializeCheckers();
                  setGameState('checkers');
                }}
                  className="ctrl-btn w-full bg-emerald-600 text-white py-3">
                  Play Checkers
                </button>
              </div>

              <div className="menu-tile bg-gradient-to-br from-lime-200 to-green-300">
                <h3 className="game-title text-xl sm:text-2xl font-bold mb-2 text-green-900">Mini Golf</h3>
                <p className="text-green-900/70 mb-4 text-sm font-semibold">Aim, power, sink it!</p>
                <button onClick={() => {
                  initializeMiniGolf();
                  setGameState('miniGolf');
                }}
                  className="ctrl-btn w-full bg-green-600 text-white py-3">
                  Play Mini Golf
                </button>
              </div>

              <div className="menu-tile bg-gradient-to-br from-indigo-200 to-blue-300">
                <h3 className="game-title text-xl sm:text-2xl font-bold mb-2 text-indigo-900">Word Games</h3>
                <p className="text-indigo-900/70 mb-4 text-sm font-semibold">Hangman, scramble & more</p>
                <button onClick={() => setGameState('wordGames')}
                  className="ctrl-btn w-full bg-indigo-600 text-white py-3">
                  Play Word Games
                </button>
              </div>

              <div className="menu-tile bg-gradient-to-br from-yellow-200 to-orange-300">
                <h3 className="game-title text-xl sm:text-2xl font-bold mb-2 text-amber-900">Arcade</h3>
                <p className="text-amber-900/70 mb-4 text-sm font-semibold">Pac-Man and Jetpack!</p>
                <button onClick={() => setGameState('arcadeGames')}
                  className="ctrl-btn w-full bg-amber-500 text-white py-3">
                  Open Arcade
                </button>
              </div>
            </div>

            <div className="border-t-2 border-rose-200/80 pt-4 sm:pt-6">
              <h3 className="game-title text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6 text-fuchsia-800">Card Games</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div className="menu-tile bg-gradient-to-br from-pink-200 to-rose-300">
                  <h3 className="game-title text-2xl font-bold mb-2 text-pink-900">Never Have I Ever</h3>
                  <p className="text-pink-900/70 mb-4 text-sm font-semibold">Reveal secrets and bond together!</p>
                  <button onClick={() => {
                    setNeverHaveIEverIndex(0);
                    setGameState('neverHaveIEver');
                  }}
                    className="ctrl-btn w-full bg-pink-500 text-white py-3">
                    Play Never Have I Ever
                  </button>
                </div>

                <div className="menu-tile bg-gradient-to-br from-violet-200 to-fuchsia-300">
                  <h3 className="game-title text-2xl font-bold mb-2 text-violet-950">Relationship Explorer</h3>
                  <p className="text-violet-900/70 mb-4 text-sm font-semibold">Deep questions to connect more.</p>
                  <button onClick={() => {
                    setRelationshipExplorerIndex(0);
                    setGameState('relationshipExplorer');
                  }}
                    className="ctrl-btn w-full bg-violet-600 text-white py-3">
                    Explore Relationship
                  </button>
                </div>
              </div>
            </div>
        </GameCard>
      </GameShell>
    );
  }

  if (gameState === 'ludo') {
    const current = ludoPlayers[ludoTurn];
    const validMoves = ludoRolled && ludoDice ? getLudoValidMoves(ludoPlayers, ludoTurn, ludoDice) : [];
    const tokenLabel = (rel) => {
      if (rel === -1) return 'Yard';
      if (rel === 56) return 'Home ✓';
      if (rel >= 51) return `Home ${rel - 50}/5`;
      return `Track ${rel + 1}/51`;
    };

    return (
      <GameShell bgClass="bg-gradient-to-br from-rose-500 via-orange-400 to-amber-300" maxWidth="max-w-2xl">
        <GameCard className="!bg-gradient-to-b from-rose-50 to-amber-50">
          <GameHeader title="Ludo" titleClass="text-rose-800" onBack={() => setGameState('boardGames')} />

            <p className="text-center text-sm text-rose-800/80 mb-2 font-semibold">Pass-and-play — share one device</p>
            <p className="text-center font-extrabold text-rose-700 mb-4 min-h-[24px]">{ludoMessage}</p>

            {ludoWinner ? (
              <div className="text-center p-6 bg-green-50 rounded-xl mb-4">
                <div className="text-3xl font-bold mb-2">🏆 {ludoWinner} wins!</div>
                <p className="text-green-700 mb-4">+60 coins and bond boost</p>
                <button onClick={() => initializeLudo(ludoPlayerCount)}
                  className="w-full bg-rose-500 text-white py-3 rounded-lg font-semibold min-h-[48px]">
                  Play Again
                </button>
              </div>
            ) : (
              <>
                <div className="flex justify-center items-center gap-4 mb-4">
                  <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl font-bold shadow-inner ${
                    ludoDice ? 'bg-white border-4 border-rose-400' : 'bg-gray-100 border-2 border-dashed border-gray-300'
                  }`}>
                    {ludoDice || '?'}
                  </div>
                  <button
                    onClick={rollLudoDice}
                    disabled={ludoRolled}
                    className={`px-6 py-4 rounded-xl font-bold min-h-[56px] ${
                      ludoRolled ? 'bg-gray-300 text-gray-500' : 'bg-rose-500 text-white active:bg-rose-600'
                    }`}
                  >
                    {ludoRolled ? 'Select a token' : `Roll — ${current?.emoji || ''} ${current?.name || ''}`}
                  </button>
                </div>

                {/* Visual track board: 52 cells in a ring preview */}
                <div className="mb-4 p-3 bg-rose-50 rounded-xl border-2 border-rose-200">
                  <p className="text-xs font-semibold text-center text-rose-700 mb-2">Board track (tokens on path)</p>
                  <div className="grid gap-0.5 max-w-lg mx-auto" style={{ gridTemplateColumns: 'repeat(13, minmax(0, 1fr))' }}>
                    {Array.from({ length: 52 }).map((_, abs) => {
                      const occupants = [];
                      ludoPlayers.forEach((p, pi) => {
                        p.tokens.forEach((rel, ti) => {
                          if (rel >= 0 && rel <= 50 && ludoAbs(pi, rel) === abs) {
                            occupants.push({ emoji: p.emoji, canMove: pi === ludoTurn && validMoves.includes(ti), pi, ti });
                          }
                        });
                      });
                      const isSafe = abs % 13 === 0;
                      return (
                        <div key={abs}
                          className={`aspect-square rounded-sm text-[10px] flex items-center justify-center ${
                            isSafe ? 'bg-yellow-200' : 'bg-white border border-rose-100'
                          }`}
                          title={`Cell ${abs}`}
                        >
                          {occupants[0] ? (
                            <button type="button" disabled={!occupants[0].canMove}
                              onClick={() => occupants[0].canMove && moveLudoToken(occupants[0].ti)}
                              className={occupants[0].canMove ? 'ring-2 ring-yellow-400 rounded animate-pulse' : ''}>
                              {occupants[0].emoji}
                            </button>
                          ) : (
                            <span className="text-rose-200">{abs % 13 === 0 ? '★' : ''}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  {ludoPlayers.map((p, pi) => (
                    <div key={p.id}
                      className={`rounded-xl p-3 border-2 ${
                        pi === ludoTurn && !ludoWinner ? 'border-rose-500 ring-2 ring-rose-200' : 'border-gray-200'
                      } ${p.light}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold">{p.emoji} {p.name}</span>
                        <span className="text-xs text-gray-600">
                          {p.tokens.filter(t => t === 56).length}/4 home
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {p.tokens.map((rel, ti) => {
                          const canMove = pi === ludoTurn && validMoves.includes(ti);
                          return (
                            <button
                              key={ti}
                              type="button"
                              disabled={!canMove}
                              onClick={() => moveLudoToken(ti)}
                              className={`rounded-lg p-2 text-center min-h-[64px] transition-all ${
                                canMove
                                  ? `${p.bg} text-white ring-4 ring-yellow-300 scale-105 animate-pulse`
                                  : rel === 56
                                  ? 'bg-emerald-200 text-emerald-800'
                                  : 'bg-white/80 text-gray-700 border border-gray-200'
                              }`}
                            >
                              <div className="text-lg">{p.emoji}</div>
                              <div className="text-[10px] leading-tight font-semibold">{tokenLabel(rel)}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-xs text-gray-500 text-center space-y-1">
                  <p>Need a <strong>6</strong> to leave the yard. Landing on others (except safe starts) sends them back.</p>
                  <p>Roll a 6 for an extra turn. First to get all 4 tokens home wins.</p>
                </div>
              </>
            )}

            <button onClick={() => initializeLudo(ludoPlayerCount)}
              className="ctrl-btn w-full mt-4 bg-rose-200 text-rose-900 py-3">
              Restart Match
            </button>
        </GameCard>
      </GameShell>
    );
  }

  if (gameState === 'ticTacToe') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 p-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-blue-600">❌ Tic-Tac-Toe</h2>
              <button onClick={() => setGameState('boardGames')}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-600">
                ← Back
              </button>
            </div>

            {ticTacToeWinner ? (
              <div className="text-center mb-4">
                <div className="text-2xl sm:text-3xl font-bold mb-2">
                  {ticTacToeWinner === 'tie' ? "It's a Tie! 🤝" : `Player ${ticTacToeWinner} Wins! 🎉`}
                </div>
                {ticTacToeWinner !== 'tie' && (
                  <div className="text-green-600 font-semibold text-sm sm:text-base">+30 Coins Earned! 🪙</div>
                )}
                <button onClick={initializeTicTacToe}
                  className="mt-4 bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold active:bg-blue-600 min-h-[48px]">
                  Play Again
                </button>
              </div>
            ) : (
              <div className="text-center mb-4">
                <div className="text-lg sm:text-xl font-semibold">Player {ticTacToePlayer}'s Turn</div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-2 sm:gap-2 mb-4 mx-auto max-w-xs">
              {ticTacToeBoard.map((cell, index) => (
                <button
                  key={index}
                  onClick={() => handleTicTacToeClick(index)}
                  disabled={cell !== null || ticTacToeWinner !== null}
                  className={`w-20 h-20 sm:w-24 sm:h-24 text-3xl sm:text-4xl font-bold rounded-lg transition-all active:scale-95 ${
                    cell === 'X' ? 'bg-blue-500 text-white' :
                    cell === 'O' ? 'bg-red-500 text-white' :
                    'bg-gray-200 hover:bg-gray-300'
                  } ${cell !== null || ticTacToeWinner ? '' : 'cursor-pointer hover:scale-105'}`}
                >
                  {cell || ' '}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'connect4') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-200 via-yellow-200 to-orange-200 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-red-600">🔴 Connect 4</h2>
              <button onClick={() => setGameState('boardGames')}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-600">
                ← Back
              </button>
            </div>

            {connect4Winner ? (
              <div className="text-center mb-4">
                <div className="text-2xl sm:text-3xl font-bold mb-2">
                  {connect4Winner === 'tie' ? "It's a Tie! 🤝" : `Player ${connect4Winner} Wins! 🎉`}
                </div>
                {connect4Winner !== 'tie' && (
                  <div className="text-green-600 font-semibold text-sm sm:text-base">+50 Coins Earned! 🪙</div>
                )}
                <button onClick={initializeConnect4}
                  className="mt-4 bg-red-500 text-white px-6 py-3 rounded-lg font-semibold active:bg-red-600 min-h-[48px]">
                  Play Again
                </button>
              </div>
            ) : (
              <div className="text-center mb-4">
                <div className="text-lg sm:text-xl font-semibold mb-2">Player {connect4Player}'s Turn</div>
                <div className="text-xs sm:text-sm text-gray-600">Tap a column to drop your piece</div>
              </div>
            )}

            <div className="bg-blue-500 rounded-lg p-2 sm:p-4 overflow-x-auto">
              <div className="inline-block min-w-max mx-auto">
                {/* Column buttons */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {[0, 1, 2, 3, 4, 5, 6].map(col => (
                    <button
                      key={col}
                      onClick={() => dropPiece(col)}
                      disabled={connect4Winner !== null || connect4Board[0][col] !== null}
                      className={`h-8 sm:h-10 w-10 sm:w-12 rounded min-h-[44px] active:scale-95 ${
                        connect4Board[0][col] ? 'bg-gray-400 cursor-not-allowed' : 'bg-white active:bg-gray-200'
                      }`}
                    >
                      ↓
                    </button>
                  ))}
                </div>

                {/* Board */}
                <div className="grid grid-cols-7 gap-1">
                  {connect4Board.map((row, rowIndex) => 
                    row.map((cell, colIndex) => (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-2xl sm:text-3xl ${
                          cell === '🔴' ? 'bg-red-500' : cell === '🟡' ? 'bg-yellow-400' : 'bg-white'
                        }`}
                      >
                        {cell || '⚪'}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'chess') {
    if (!chessBoard) initializeChess();

    const files = chessFlipped ? ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'] : ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = chessFlipped ? [1, 2, 3, 4, 5, 6, 7, 8] : [8, 7, 6, 5, 4, 3, 2, 1];
    const toBoardPos = (displayR, displayC) => {
      if (!chessFlipped) return [displayR, displayC];
      return [7 - displayR, 7 - displayC];
    };
    const kingPos = chessBoard ? findChessKing(chessBoard, chessCurrentPlayer) : null;
    const kingInCheck = chessBoard && !chessGameOver && isInCheck(chessBoard, chessCurrentPlayer);

    return (
      <GameShell bgClass="bg-gradient-to-br from-teal-700 via-cyan-800 to-slate-900" maxWidth="max-w-lg">
        <GameCard className="!bg-gradient-to-b from-cyan-50 via-white to-amber-50 border-2 border-teal-200/60">
          <GameHeader
            title="Chess"
            titleClass="text-teal-900"
            onBack={() => setGameState('boardGames')}
            actions={
              <button type="button" onClick={() => setChessFlipped(f => !f)}
                className="ctrl-btn bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-3 py-2 text-sm">
                Flip
              </button>
            }
          />

          <div className="flex items-center justify-between mb-2 min-h-[36px] px-2 py-1.5 rounded-xl bg-gradient-to-r from-slate-800 to-slate-700 text-white shadow-inner">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${chessCurrentPlayer === 'black' && !chessGameOver ? 'bg-lime-400 animate-pulse' : 'bg-slate-500'}`} />
              <span className="text-sm font-bold">Black</span>
            </div>
            <div className="flex flex-wrap justify-end gap-0.5 text-lg leading-none opacity-95">
              {(chessCaptured.black || []).map((sym, i) => <span key={`b-${i}`}>{sym}</span>)}
            </div>
          </div>

          {chessGameOver ? (
            <div className="text-center mb-3 p-4 rounded-2xl bg-gradient-to-br from-lime-100 to-teal-100 border-2 border-teal-300">
              <div className="game-title text-xl sm:text-2xl font-bold mb-1 text-teal-950">
                {chessEndReason === 'stalemate'
                  ? 'Stalemate — Draw'
                  : `${chessWinner === 'white' ? 'White' : 'Black'} wins by checkmate!`}
              </div>
              <div className="text-teal-700 font-bold text-sm mb-3">
                {chessEndReason === 'stalemate' ? '+30 coins' : '+100 coins'} earned
              </div>
              <button type="button" onClick={initializeChess}
                className="ctrl-btn bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-6 py-3">
                Play Again
              </button>
            </div>
          ) : (
            <div className="text-center mb-2">
              <p className={`text-sm font-bold min-h-[20px] ${kingInCheck ? 'text-rose-600 animate-pulse' : 'text-teal-800'}`}>
                {chessStatusMsg}
              </p>
            </div>
          )}

          <div className="mx-auto rounded-2xl overflow-hidden shadow-xl"
            style={{ maxWidth: 420, border: '5px solid #0f766e', boxShadow: '0 12px 40px rgba(15,118,110,0.45), inset 0 0 0 2px #5eead4' }}>
            <div className="grid" style={{
              gridTemplateColumns: '20px repeat(8, 1fr)',
              gridTemplateRows: 'repeat(8, 1fr) 20px',
              background: 'linear-gradient(135deg, #115e59, #0f766e)'
            }}>
              {ranks.map((rankLabel, displayR) => (
                <React.Fragment key={`rank-${rankLabel}`}>
                  <div className="flex items-center justify-center text-[10px] font-extrabold text-teal-100 select-none">
                    {rankLabel}
                  </div>
                  {files.map((_, displayC) => {
                    const [rowIndex, colIndex] = toBoardPos(displayR, displayC);
                    const cell = chessBoard?.[rowIndex]?.[colIndex];
                    const isSelected = chessSelectedSquare && chessSelectedSquare[0] === rowIndex && chessSelectedSquare[1] === colIndex;
                    const isTarget = chessLegalTargets.some(([r, c]) => r === rowIndex && c === colIndex);
                    const isLast = chessLastMove && (
                      (chessLastMove.from[0] === rowIndex && chessLastMove.from[1] === colIndex) ||
                      (chessLastMove.to[0] === rowIndex && chessLastMove.to[1] === colIndex)
                    );
                    const isKingCheck = kingInCheck && kingPos && kingPos[0] === rowIndex && kingPos[1] === colIndex;
                    const isLight = (rowIndex + colIndex) % 2 === 0;
                    let bg = isLight ? '#ecfdf5' : '#0d9488';
                    if (isLast) bg = isLight ? '#fde68a' : '#d97706';
                    if (isSelected) bg = '#38bdf8';
                    if (isKingCheck) bg = '#fb7185';

                    return (
                      <button
                        key={`${rowIndex}-${colIndex}`}
                        type="button"
                        onClick={() => handleChessSquareClick(rowIndex, colIndex)}
                        disabled={chessGameOver}
                        className="relative aspect-square flex items-center justify-center select-none active:brightness-95 transition-colors"
                        style={{ backgroundColor: bg, fontSize: 'clamp(1.4rem, 8.5vw, 2.2rem)', lineHeight: 1 }}
                        aria-label={`Square ${String.fromCharCode(97 + colIndex)}${8 - rowIndex}`}
                      >
                        {cell && (
                          <span
                            className="relative z-[1] leading-none drop-shadow"
                            style={{
                              color: cell.color === 'white' ? '#fffef8' : '#0f172a',
                              textShadow: cell.color === 'white'
                                ? '0 0 2px #0f172a, 1px 1px 0 #0f172a, -1px -1px 0 #0f172a'
                                : '0 1px 0 rgba(255,255,255,0.35)',
                              filter: cell.color === 'white' ? 'drop-shadow(0 2px 2px rgba(0,0,0,0.4))' : undefined
                            }}
                          >
                            {cell.type}
                          </span>
                        )}
                        {isTarget && !cell && (
                          <span className="absolute w-[30%] h-[30%] rounded-full bg-cyan-950/40 ring-2 ring-white/50" />
                        )}
                        {isTarget && cell && (
                          <span className="absolute inset-[5%] rounded-full border-[3px] border-rose-400/80 pointer-events-none shadow" />
                        )}
                      </button>
                    );
                  })}
                </React.Fragment>
              ))}
              <div />
              {files.map(f => (
                <div key={`file-${f}`} className="flex items-center justify-center text-[10px] font-extrabold text-teal-100 select-none">
                  {f}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between mt-2 min-h-[36px] px-2 py-1.5 rounded-xl bg-gradient-to-r from-amber-100 to-orange-100 text-amber-950 border border-amber-200">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${chessCurrentPlayer === 'white' && !chessGameOver ? 'bg-lime-500 animate-pulse ring-2 ring-lime-300' : 'bg-amber-400'}`} />
              <span className="text-sm font-bold">White</span>
            </div>
            <div className="flex flex-wrap justify-end gap-0.5 text-lg leading-none">
              {(chessCaptured.white || []).map((sym, i) => <span key={`w-${i}`}>{sym}</span>)}
            </div>
          </div>

          {!chessGameOver && (
            <p className="text-center text-xs text-teal-800/80 mt-3 font-semibold">
              Tap a piece → highlighted square · Flip for pass-and-play
            </p>
          )}
        </GameCard>
      </GameShell>
    );
  }

  if (gameState === 'imageMemory') {
    if (imageMemoryCards.length === 0) initializeImageMemory();
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-200 p-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-indigo-600">🖼️ Image Memory Game</h2>
              <button onClick={() => setGameState('puzzleGames')}
                className="bg-gray-500 text-white px-3 py-2 rounded-lg font-semibold hover:bg-gray-600 text-sm">
                ← Back
              </button>
            </div>

            <div className="text-center mb-4">
              <div className="text-xl font-bold text-indigo-600 mb-2">Score: {imageMemoryScore}</div>
              <div className="text-sm text-gray-600">Moves: {imageMemoryMoves} | Matched: {imageMemoryMatched.length / 2} pairs</div>
              <p className="text-xs text-gray-500 mt-2 italic">"Remember, humility comes before honor." - Proverbs 18:12</p>
            </div>

            {imageMemoryMatched.length >= imageMemoryCards.length && imageMemoryCards.length > 0 ? (
              <div className="text-center p-8 bg-green-50 rounded-lg mb-4">
                <div className="text-3xl mb-4">🎉 Perfect!</div>
                <div className="text-green-600 font-semibold text-lg mb-2">All pairs matched!</div>
                <div className="text-gray-600 text-sm mb-4">
                  You completed this with {imageMemoryMoves} moves. Well done!
                </div>
                <button onClick={() => {
                  initializeImageMemory();
                }}
                  className="bg-indigo-500 text-white px-6 py-3 rounded-lg font-semibold active:bg-indigo-600 min-h-[48px]">
                  Play Again
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-4 gap-2 sm:gap-3">
                {imageMemoryCards.map((card, index) => {
                  const isFlipped = imageMemoryFlipped.includes(index) || imageMemoryMatched.includes(index);
                  return (
                    <button
                      key={card.id}
                      onClick={() => handleImageMemoryClick(index)}
                      disabled={imageMemoryFlipped.length >= 2 && !isFlipped}
                      className={`aspect-square text-3xl sm:text-4xl font-bold rounded-lg transition-all active:scale-95 ${
                        isFlipped
                          ? 'bg-indigo-100 border-2 border-indigo-500'
                          : 'bg-indigo-200 hover:bg-indigo-300 border-2 border-indigo-300'
                      } ${imageMemoryFlipped.length >= 2 && !isFlipped ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      {isFlipped ? card.emoji : '?'}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'neverHaveIEver') {
    const questions = neverHaveIEverQuestions[relationshipMode] || neverHaveIEverQuestions.friends;
    const currentQuestion = questions[neverHaveIEverIndex % questions.length];

    const nextQuestion = () => {
      setNeverHaveIEverIndex(prev => {
        const newIndex = (prev + 1) % questions.length;
        if (newIndex === 0) {
          // Completed a round - update relationship progress
          setGameData(prev => {
            const newProgress = Math.min(100, prev.relationshipProgress + 5);
            const newBondLevel = Math.floor(newProgress / 20) + 1;
            return {
            ...prev,
            coins: prev.coins + 20,
              conversationsCompleted: prev.conversationsCompleted + 1,
              relationshipProgress: newProgress,
              bondLevel: newBondLevel,
              pet: { ...prev.pet, happiness: Math.min(100, prev.pet.happiness + 5) },
              conversationHistory: [...prev.conversationHistory, { type: 'neverHaveIEver', date: new Date() }]
            };
          });
        } else {
          // Each question answered increases progress slightly
          setGameData(prev => ({
            ...prev,
            conversationsCompleted: prev.conversationsCompleted + 1,
            relationshipProgress: Math.min(100, prev.relationshipProgress + 1),
            pet: {
              ...prev.pet,
              love: Math.min(100, prev.pet.love + 1) // Pet grows from conversations
            },
            conversationHistory: [...prev.conversationHistory, { type: 'neverHaveIEver', date: new Date() }]
          }));
        }
        return newIndex;
      });
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-indigo-200 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-pink-600">🎴 Never Have I Ever</h2>
              <button onClick={() => setGameState('pet')}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-600">
                ← Back
              </button>
            </div>

            <div className="text-center mb-6">
              <div className="text-sm text-gray-600 mb-2">
                Question {neverHaveIEverIndex + 1} of {questions.length}
              </div>
              <div className="bg-purple-50 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-purple-700">Relationship Progress</span>
                  <span className="text-sm font-bold text-purple-600">{gameData.relationshipProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-gradient-to-r from-pink-500 to-purple-500 h-3 rounded-full transition-all"
                    style={{ width: `${gameData.relationshipProgress}%` }}></div>
                </div>
                <p className="text-xs text-gray-600 mt-2">{gameData.conversationsCompleted} conversations completed</p>
              </div>
            </div>

            {/* Card */}
            <div className="relative mb-8">
              <div className="bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 rounded-2xl p-12 shadow-2xl transform hover:scale-105 transition-all duration-300 min-h-[300px] flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="text-4xl mb-4">🎴</div>
                  <h3 className="text-3xl font-bold mb-4">Never Have I Ever...</h3>
                  <p className="text-2xl font-semibold">{currentQuestion}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-center text-gray-600 mb-4">
                If you've done this, raise your hand or take a sip! Discuss and share stories.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={nextQuestion}
                  className="bg-gradient-to-r from-pink-500 to-purple-500 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all text-lg">
                  ➡️ Next Question
                </button>
                <button
                  onClick={() => {
                    setNeverHaveIEverIndex(Math.floor(Math.random() * questions.length));
                  }}
                  className="bg-gray-400 text-white py-4 rounded-xl font-semibold hover:bg-gray-500 transition-all text-lg">
                  🔀 Random
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'relationshipExplorer') {
    const questions = relationshipExplorerQuestions[relationshipMode] || relationshipExplorerQuestions.friends || relationshipExplorerQuestions.parentChild;
    const currentQuestion = questions[relationshipExplorerIndex % questions.length];

    const nextQuestion = () => {
      setRelationshipExplorerIndex(prev => {
        const newIndex = (prev + 1) % questions.length;
        if (newIndex === 0) {
          // Completed a round - update relationship progress and pet
          setGameData(prev => {
            const newProgress = Math.min(100, prev.relationshipProgress + 8);
            const newBondLevel = Math.floor(newProgress / 20) + 1;
            return {
            ...prev,
            coins: prev.coins + 30,
              conversationsCompleted: prev.conversationsCompleted + 1,
              relationshipProgress: newProgress,
              bondLevel: newBondLevel,
              pet: { 
                ...prev.pet, 
                happiness: Math.min(100, prev.pet.happiness + 8),
                love: Math.min(100, prev.pet.love + 5) // Pet grows from deep conversations
              },
              conversationHistory: [...prev.conversationHistory, { type: 'relationshipExplorer', date: new Date() }]
            };
          });
        } else {
          // Each question answered increases progress
          setGameData(prev => {
            const newProgress = Math.min(100, prev.relationshipProgress + 2);
            const newBondLevel = Math.floor(newProgress / 20) + 1;
            return {
              ...prev,
              conversationsCompleted: prev.conversationsCompleted + 1,
              relationshipProgress: newProgress,
              bondLevel: newBondLevel,
              pet: {
                ...prev.pet,
                love: Math.min(100, prev.pet.love + 2) // Pet grows from deep conversations
              },
              conversationHistory: [...prev.conversationHistory, { type: 'relationshipExplorer', date: new Date() }]
            };
          });
        }
        return newIndex;
      });
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-200 via-indigo-200 to-blue-200 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-purple-600">💕 Relationship Explorer</h2>
              <button onClick={() => setGameState('pet')}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-600">
                ← Back
              </button>
            </div>

            <div className="text-center mb-6">
              <div className="text-sm text-gray-600 mb-2">
                Question {relationshipExplorerIndex + 1} of {questions.length}
              </div>
              <div className="bg-purple-50 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-purple-700">Relationship Progress</span>
                  <span className="text-sm font-bold text-purple-600">{gameData.relationshipProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-gradient-to-r from-pink-500 to-purple-500 h-3 rounded-full transition-all"
                    style={{ width: `${gameData.relationshipProgress}%` }}></div>
                </div>
                <p className="text-xs text-gray-600 mt-2">{gameData.conversationsCompleted} conversations completed • Bond Level {gameData.bondLevel}</p>
              </div>
              <div className="text-xs text-purple-600 italic">
                Take turns answering honestly and listen with an open heart
              </div>
            </div>

            {/* Card */}
            <div className="relative mb-8">
              <div className="bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 rounded-2xl p-12 shadow-2xl transform hover:scale-105 transition-all duration-300 min-h-[350px] flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="text-5xl mb-6">💕</div>
                  <p className="text-2xl font-semibold leading-relaxed">{currentQuestion}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-purple-50 rounded-xl p-4 mb-4">
                <p className="text-sm text-gray-700 text-center">
                  💡 <strong>Tip:</strong> Share your thoughts openly. This is a safe space to explore your relationship and learn about each other on a deeper level.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={nextQuestion}
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all text-lg">
                  ➡️ Next Question
                </button>
                <button
                  onClick={() => {
                    setRelationshipExplorerIndex(Math.floor(Math.random() * questions.length));
                  }}
                  className="bg-gray-400 text-white py-4 rounded-xl font-semibold hover:bg-gray-500 transition-all text-lg">
                  🔀 Random
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const initializeTetris = () => {
    setTetrisBoard(Array(20).fill(null).map(() => Array(10).fill(0)));
    setTetrisPiece(createNewTetrisPiece());
    setTetrisNextPiece(createNewTetrisPiece());
    setTetrisScore(0);
    setTetrisLevel(1);
    setTetrisLines(0);
    setTetrisGameOver(false);
    setTetrisPaused(false);
    setTetrisFallTime(1000);
  };

  if (gameState === 'puzzleGames') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-indigo-200 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-6 mb-4 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-pink-600">💕 Puzzle Games</h2>
              <button onClick={() => setGameState('pet')}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold active:bg-gray-600">
                ← Back
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-xl p-4 sm:p-6">
                <h3 className="text-xl sm:text-2xl font-bold mb-2">✨ Match-3</h3>
                <p className="text-gray-600 mb-4 text-sm">Classic match-3 puzzle!</p>
                <button onClick={() => {
                  setGameState('puzzle');
                  if (puzzleBoard.length === 0) initializePuzzle();
                }}
                  className="w-full bg-pink-500 text-white py-3 rounded-lg font-semibold active:bg-pink-600 min-h-[48px]">
                  Play Match-3
                </button>
              </div>

              <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl p-4 sm:p-6">
                <h3 className="text-xl sm:text-2xl font-bold mb-2">🀄 Tile Match</h3>
                <p className="text-gray-600 mb-4 text-sm">Match tiles in pairs!</p>
                <button onClick={() => setGameState('tileMatch')}
                  className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold active:bg-blue-600 min-h-[48px]">
                  Play Tile Match
                </button>
              </div>

              <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl p-4 sm:p-6">
                <h3 className="text-xl sm:text-2xl font-bold mb-2">🔤 Word Search</h3>
                <p className="text-gray-600 mb-4 text-sm">Find hidden words!</p>
                <button onClick={() => setGameState('wordSearch')}
                  className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold active:bg-green-600 min-h-[48px]">
                  Play Word Search
                </button>
              </div>

              <div className="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-xl p-4 sm:p-6">
                <h3 className="text-xl sm:text-2xl font-bold mb-2">🧩 Jigsaw</h3>
                <p className="text-gray-600 mb-4 text-sm">Complete picture puzzles!</p>
                <button onClick={() => setGameState('jigsaw')}
                  className="w-full bg-yellow-500 text-white py-3 rounded-lg font-semibold active:bg-yellow-600 min-h-[48px]">
                  Play Jigsaw
                </button>
              </div>

              <div className="bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl p-4 sm:p-6">
                <h3 className="text-xl sm:text-2xl font-bold mb-2">🧠 Logic Puzzle</h3>
                <p className="text-gray-600 mb-4 text-sm">Solve brain-teasers!</p>
                <button onClick={() => setGameState('logicPuzzle')}
                  className="w-full bg-purple-500 text-white py-3 rounded-lg font-semibold active:bg-purple-600 min-h-[48px]">
                  Play Logic
                </button>
              </div>

              <div className="bg-gradient-to-br from-red-100 to-rose-100 rounded-xl p-4 sm:p-6">
                <h3 className="text-xl sm:text-2xl font-bold mb-2">🚪 Escape Room</h3>
                <p className="text-gray-600 mb-4 text-sm">Solve mysteries and escape!</p>
                <button onClick={() => setGameState('escapeRoom')}
                  className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold active:bg-red-600 min-h-[48px]">
                  Play Escape Room
                </button>
              </div>

              <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl p-4 sm:p-6">
                <h3 className="text-xl sm:text-2xl font-bold mb-2">🖼️ Image Memory</h3>
                <p className="text-gray-600 mb-4 text-sm">Match pairs of images! Teaches patience and humility.</p>
                <button onClick={() => {
                  initializeImageMemory();
                  setGameState('imageMemory');
                }}
                  className="w-full bg-indigo-500 text-white py-3 rounded-lg font-semibold active:bg-indigo-600 min-h-[48px]">
                  Play Image Memory
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'puzzle') {
    return (
      <GameShell bgClass="bg-gradient-to-br from-rose-400 via-orange-300 to-amber-300" maxWidth="max-w-3xl">
        <GameCard className="!bg-gradient-to-b from-rose-50 to-amber-50">
            <div className="grid grid-cols-3 gap-3 mb-4">
              <StatPill label="Score" value={score} tone="bg-rose-200 text-rose-950" />
              <StatPill label="Moves" value={moves} tone="bg-sky-200 text-sky-950" />
              <StatPill label="Combo" value={`x${combo > 0 ? Math.min(combo, 5) : 1}`} tone="bg-amber-200 text-amber-950" />
            </div>
            <div className="text-center text-xs font-bold text-rose-800 mb-2">Goal: {targetScore}</div>

            <div className="mb-4">
              <div className="w-full bg-rose-100 rounded-full h-3.5 border border-rose-200 overflow-hidden">
                <div className="bg-gradient-to-r from-rose-500 via-orange-400 to-amber-400 h-full rounded-full transition-all"
                  style={{ width: `${Math.min((score / targetScore) * 100, 100)}%` }}></div>
              </div>
            </div>

            <div className="text-xs text-rose-900/70 text-center mb-2 font-semibold">
              Match 3+ · pick a power-up, then tap a gem
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { id: 'shuffle', label: 'Shuffle', icon: '🔀', tone: 'from-sky-400 to-blue-500' },
                { id: 'hammer', label: 'Hammer', icon: '🔨', tone: 'from-amber-400 to-orange-500' },
                { id: 'colorBomb', label: 'Bomb', icon: '💥', tone: 'from-rose-400 to-pink-500' }
              ].map(p => (
                <button
                  key={p.id}
                  type="button"
                  disabled={powerups[p.id] <= 0 || animating}
                  onClick={() => {
                    if (p.id === 'shuffle') {
                      usePowerup('shuffle', 0, 0);
                    } else {
                      setSelectedPowerup(selectedPowerup === p.id ? null : p.id);
                    }
                  }}
                  className={`ctrl-btn py-2 px-1 text-sm border-2 ${
                    selectedPowerup === p.id
                      ? `bg-gradient-to-br ${p.tone} text-white border-white ring-2 ring-offset-1 ring-rose-400`
                      : powerups[p.id] > 0
                      ? 'bg-white border-rose-200 text-rose-900'
                      : 'bg-stone-100 border-stone-200 text-stone-400'
                  }`}
                >
                  <div>{p.icon} {p.label}</div>
                  <div className="text-xs">x{powerups[p.id]}</div>
                </button>
              ))}
            </div>
            
            <div className="rounded-2xl p-2 sm:p-3 mb-4 overflow-x-auto border-2 border-rose-200 shadow-inner"
              style={{ background: 'linear-gradient(160deg,#ffe4e6,#ffedd5)' }}>
              <div className="inline-block min-w-max mx-auto">
                {puzzleBoard.map((row, i) => (
                  <div key={i} className="flex justify-center">
                    {row.map((cell, j) => {
                      const isAnimating = matchAnimations.has(`${i},${j}`);
                      const isSelected = selectedCell?.row === i && selectedCell?.col === j;
                      
                      return (
                        <button
                          key={`${i}-${j}`}
                          onClick={() => {
                            if (animating) return;
                            if (selectedPowerup === 'hammer' || selectedPowerup === 'colorBomb') {
                              usePowerup(selectedPowerup, i, j);
                              return;
                            }
                            if (!selectedCell) {
                              setSelectedCell({ row: i, col: j });
                            } else {
                              const rowDiff = Math.abs(selectedCell.row - i);
                              const colDiff = Math.abs(selectedCell.col - j);
                              if ((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)) {
                                swapCells(selectedCell, { row: i, col: j });
                              }
                              setSelectedCell(null);
                            }
                          }}
                          disabled={animating && !isSelected}
                          className={`w-10 h-10 sm:w-11 sm:h-11 m-0.5 sm:m-1 text-lg sm:text-xl rounded-xl transition-all duration-200 active:scale-95 shadow-sm ${
                            isAnimating
                              ? 'bg-amber-300 scale-125 animate-pulse'
                              : isSelected || selectedPowerup
                              ? 'bg-rose-300 scale-105 shadow-lg ring-2 ring-rose-500'
                              : cell === '💫'
                              ? 'bg-stone-200 opacity-50'
                              : 'bg-white active:bg-rose-50'
                          }`}
                        >
                          {cell === '💫' ? '✨' : cell}
              </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setGameState('pet')}
                className="ctrl-btn bg-stone-700 text-white py-3">
                ← Back
              </button>
              <button onClick={completePuzzle}
                className="ctrl-btn bg-gradient-to-r from-rose-500 to-orange-500 text-white py-3 flex items-center justify-center gap-2">
                <Trophy size={20} /> {score >= targetScore ? 'Victory!' : 'End'}
              </button>
            </div>
        </GameCard>
      </GameShell>
    );
  }

  if (gameState === 'brickGames') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-200 via-blue-200 to-pink-200 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-6 mb-4 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-purple-600">🎮 Brick Games</h2>
              <button onClick={() => setGameState('pet')}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold active:bg-gray-600">
                ← Back
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-gradient-to-br from-red-100 to-orange-100 rounded-xl p-6">
                <h3 className="text-2xl font-bold mb-2">🧱 Tetris</h3>
                <p className="text-gray-600 mb-4 text-sm">Classic falling blocks! Clear lines to score points!</p>
                <button onClick={() => {
                  initializeTetris();
                  setBrickGameType('tetris');
                  setGameState('tetris');
                }}
                  className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold active:bg-red-600 min-h-[48px]">
                  Play Tetris
              </button>
            </div>
            
              <div className="bg-gradient-to-br from-green-100 to-teal-100 rounded-xl p-6">
                <h3 className="text-2xl font-bold mb-2">🐍 Snake</h3>
                <p className="text-gray-600 mb-4 text-sm">Grow your snake by eating food. Avoid walls and yourself!</p>
                <button onClick={() => {
                  initializeSnake();
                  setBrickGameType('snake');
                  setGameState('snake');
                }}
                  className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold active:bg-green-600 min-h-[48px]">
                  Play Snake
                </button>
              </div>

              <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl p-6">
                <h3 className="text-2xl font-bold mb-2">🎾 Brick Breaker</h3>
                <p className="text-gray-600 mb-4 text-sm">Break all the bricks with your paddle and ball!</p>
                <button onClick={() => {
                  initializeBrickBreaker();
                  setBrickGameType('brickbreaker');
                  setGameState('brickbreaker');
                }}
                  className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold active:bg-blue-600 min-h-[48px]">
                  Play Brick Breaker
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'tetris') {
    const displayBoard = tetrisBoard.map(row => [...row]);
    if (tetrisPiece && !tetrisGameOver) {
      for (let y = 0; y < tetrisPiece.shape.length; y++) {
        for (let x = 0; x < tetrisPiece.shape[y].length; x++) {
          if (tetrisPiece.shape[y][x]) {
            const boardY = tetrisPiece.y + y;
            const boardX = tetrisPiece.x + x;
            if (boardY >= 0 && boardY < 20 && boardX >= 0 && boardX < 10) {
              displayBoard[boardY][boardX] = tetrisPiece.color;
            }
          }
        }
      }
    }

    const completeGame = () => {
      const coinsEarned = Math.floor(tetrisScore / 10);
      setGameData(prev => ({
        ...prev,
        coins: prev.coins + coinsEarned,
        puzzlesCompleted: prev.puzzlesCompleted + 1,
        pet: { ...prev.pet, happiness: Math.min(100, prev.pet.happiness + 5) },
        sharedProgress: Math.min(100, prev.sharedProgress + 5)
      }));
      setGameState('pet');
    };

    return (
      <GameShell bgClass="bg-gradient-to-br from-violet-700 via-fuchsia-600 to-orange-500" maxWidth="max-w-md">
        <GameCard className="!bg-gradient-to-b from-slate-900 to-slate-800 !border-fuchsia-400/40 text-white">
          <GameHeader title="Tetris" titleClass="text-fuchsia-200" onBack={() => setGameState('brickGames')} />

            <div className="grid grid-cols-3 gap-2 mb-4">
              <StatPill label="Score" value={tetrisScore} tone="bg-fuchsia-500/30 text-fuchsia-100" />
              <StatPill label="Level" value={tetrisLevel} tone="bg-cyan-500/30 text-cyan-100" />
              <div className="rounded-2xl px-3 py-2.5 text-center bg-amber-500/20 text-amber-100 shadow-sm">
                <div className="text-[10px] uppercase tracking-wider opacity-75 font-bold mb-1">Next</div>
                <div className="inline-block bg-black/50 p-1 rounded-lg border border-white/10">
                  {(tetrisNextPiece?.shape || [[1]]).map((row, i) => (
                    <div key={i} className="flex">
                      {row.map((cell, j) => (
                        <div key={j} className="w-3 h-3 rounded-[2px]"
                          style={{ backgroundColor: cell ? (tetrisNextPiece?.color || '#888') : 'transparent' }} />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {tetrisGameOver ? (
              <div className="text-center mb-4 p-4 rounded-2xl bg-rose-500/20 border border-rose-300/40">
                <div className="game-title text-2xl font-bold mb-2 text-rose-100">Game Over!</div>
                <div className="text-lime-300 font-bold mb-4">+{Math.floor(tetrisScore / 10)} Coins</div>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={initializeTetris}
                    className="ctrl-btn bg-cyan-500 text-white py-2">
                    Play Again
                  </button>
                  <button onClick={completeGame}
                    className="ctrl-btn bg-lime-500 text-lime-950 py-2">
                    Collect Rewards
                  </button>
                </div>
              </div>
            ) : (
              <>
                {tetrisPaused && (
                  <div className="text-center mb-3 p-3 rounded-xl bg-amber-400/20 border border-amber-300/30">
                    <div className="game-title text-xl font-bold text-amber-200">Paused</div>
                  </div>
                )}
                <div className="rounded-xl p-2 mb-4 mx-auto border-2 border-fuchsia-400/50 shadow-lg shadow-fuchsia-900/40"
                  style={{ width: 'fit-content', background: '#0b1020' }}>
                  {displayBoard.map((row, i) => (
                    <div key={i} className="flex">
                  {row.map((cell, j) => (
                        <div
                          key={`${i}-${j}`}
                          className="w-6 h-6 sm:w-7 sm:h-7 rounded-[2px] border border-slate-800/80"
                          style={{ backgroundColor: cell || '#151b2e', boxShadow: cell ? 'inset 0 0 6px rgba(255,255,255,0.25)' : undefined }}
                        />
                      ))}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-2 mb-2">
                  <button onClick={() => moveTetrisPiece('left')}
                    className="ctrl-btn bg-cyan-500 text-white py-3">←</button>
                  <button onClick={() => moveTetrisPiece('rotate')}
                    className="ctrl-btn bg-fuchsia-500 text-white py-3">↻</button>
                  <button onClick={() => moveTetrisPiece('right')}
                    className="ctrl-btn bg-cyan-500 text-white py-3">→</button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => moveTetrisPiece('down')}
                    className="ctrl-btn bg-orange-500 text-white py-3">↓ Soft</button>
                  <button onClick={() => moveTetrisPiece('hardDrop')}
                    className="ctrl-btn bg-rose-500 text-white py-3">⬇ Drop</button>
                </div>
                <button onClick={() => setTetrisPaused(!tetrisPaused)}
                  className="ctrl-btn w-full mt-2 bg-amber-400 text-amber-950 py-3">
                  {tetrisPaused ? 'Resume' : 'Pause'}
                </button>
              </>
            )}
        </GameCard>
      </GameShell>
    );
  }

  if (gameState === 'snake') {
    const completeSnake = () => {
      const coinsEarned = Math.floor(snakeScore / 5) + (snakeGameOver ? 5 : 10);
      awardMiniGameRewards(coinsEarned, 3, 1);
      setSnakeRunning(false);
      setGameState('brickGames');
    };

    return (
      <GameShell bgClass="bg-gradient-to-br from-lime-400 via-emerald-500 to-teal-700" maxWidth="max-w-md">
        <GameCard className="!bg-gradient-to-b from-lime-50 to-teal-50">
          <GameHeader title="Snake" titleClass="text-emerald-800" onBack={() => { setSnakeRunning(false); setGameState('brickGames'); }} />
            <div className="grid grid-cols-2 gap-2 mb-3">
              <StatPill label="Score" value={snakeScore} tone="bg-emerald-200 text-emerald-950" />
              <StatPill label="Status" value={snakeMessage || (snakeRunning ? 'Go!' : 'Ready')} tone="bg-teal-200 text-teal-950" />
            </div>
            {snakeGameOver && (
              <div className="text-center p-3 rounded-2xl bg-rose-100 border-2 border-rose-300 mb-3">
                <p className="font-extrabold text-rose-700 game-title">Game Over!</p>
                <p className="text-sm text-emerald-800 font-bold">+{Math.floor(snakeScore / 5) + 5} coins ready</p>
              </div>
            )}
            <div className="grid gap-0.5 p-2.5 rounded-2xl mx-auto mb-4 shadow-inner border-4 border-emerald-700"
              style={{
                gridTemplateColumns: `repeat(${SNAKE_SIZE}, minmax(0, 1fr))`,
                maxWidth: 360,
                background: 'linear-gradient(160deg,#064e3b,#022c22)'
              }}>
              {Array.from({ length: SNAKE_SIZE * SNAKE_SIZE }).map((_, i) => {
                const x = i % SNAKE_SIZE;
                const y = Math.floor(i / SNAKE_SIZE);
                const isHead = snakeGame?.snake?.[0]?.x === x && snakeGame?.snake?.[0]?.y === y;
                const isBody = snakeGame?.snake?.some((s, idx) => idx > 0 && s.x === x && s.y === y);
                const isFood = snakeGame?.food?.x === x && snakeGame?.food?.y === y;
                return (
                  <div key={i} className={`aspect-square rounded-sm ${
                    isHead ? 'bg-lime-300 shadow animate-float-soft' :
                    isBody ? 'bg-emerald-400' :
                    isFood ? 'bg-rose-400 animate-pulse' :
                    'bg-emerald-950/50'
                  }`} />
                );
              })}
            </div>
            <div className="grid grid-cols-3 gap-2 mb-3 max-w-[220px] mx-auto">
              <div />
              <button onClick={() => setSnakeDirection('up')} className="ctrl-btn bg-emerald-500 text-white py-3">↑</button>
              <div />
              <button onClick={() => setSnakeDirection('left')} className="ctrl-btn bg-emerald-500 text-white py-3">←</button>
              <button onClick={() => setSnakeDirection('down')} className="ctrl-btn bg-emerald-500 text-white py-3">↓</button>
              <button onClick={() => setSnakeDirection('right')} className="ctrl-btn bg-emerald-500 text-white py-3">→</button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={initializeSnake} className="ctrl-btn bg-teal-500 text-white py-3">
                {snakeRunning ? 'Restart' : 'Start'}
              </button>
              <button onClick={completeSnake} className="ctrl-btn bg-amber-400 text-amber-950 py-3">
                Collect Rewards
              </button>
            </div>
        </GameCard>
      </GameShell>
    );
  }

  if (gameState === 'brickbreaker') {
    const movePaddle = (clientX, rect) => {
      const ref = brickBreakerRef.current;
      if (!ref) return;
      const x = clientX - rect.left;
      ref.paddleX = Math.max(0, Math.min(ref.width - ref.paddleW, x - ref.paddleW / 2));
      setBrickBreakerGame(prev => prev ? { ...prev, paddleX: ref.paddleX } : prev);
    };

    const completeBrick = () => {
      const bonus = brickBreakerRef.current?.won ? 40 : 10;
      const coinsEarned = Math.floor(brickBreakerScore / 5) + bonus;
      awardMiniGameRewards(coinsEarned, brickBreakerRef.current?.won ? 5 : 2, 1);
      setBrickBreakerRunning(false);
      setGameState('brickGames');
    };

    const g = brickBreakerGame;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-200 via-indigo-200 to-purple-200 p-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-blue-600">🎾 Brick Breaker</h2>
              <button onClick={() => { setBrickBreakerRunning(false); setGameState('brickGames'); }}
                className="bg-gray-500 text-white px-3 py-2 rounded-lg font-semibold active:bg-gray-600 text-sm">
                ← Back
              </button>
            </div>
            <div className="text-center mb-2 text-xl font-bold text-blue-600">Score: {brickBreakerScore}</div>
            {brickBreakerGameOver && (
              <div className="text-center p-3 bg-blue-50 rounded-lg mb-3">
                <p className="font-bold">{brickBreakerRef.current?.won ? 'You cleared all bricks!' : 'Ball lost!'}</p>
              </div>
            )}
            <div
              ref={brickBreakerCanvasRef}
              className="relative bg-slate-800 rounded-lg mx-auto mb-4 touch-none"
              style={{ width: g?.width || 350, height: g?.height || 400, maxWidth: '100%' }}
              onMouseMove={(e) => movePaddle(e.clientX, e.currentTarget.getBoundingClientRect())}
              onTouchMove={(e) => {
                const t = e.touches[0];
                movePaddle(t.clientX, e.currentTarget.getBoundingClientRect());
              }}
            >
              {g?.bricks?.filter(b => b.alive).map((b, i) => (
                <div key={i} className="absolute bg-gradient-to-r from-pink-400 to-purple-500 rounded-sm"
                  style={{ left: b.x, top: b.y, width: b.w, height: b.h }} />
              ))}
              {g && (
                <>
                  <div className="absolute bg-yellow-300 rounded-full"
                    style={{ left: g.ballX, top: g.ballY, width: 10, height: 10 }} />
                  <div className="absolute bg-cyan-300 rounded"
                    style={{ left: g.paddleX, top: (g.height || 400) - 20, width: g.paddleW, height: 12 }} />
                </>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <button onClick={() => {
                const ref = brickBreakerRef.current;
                if (ref) {
                  ref.paddleX = Math.max(0, ref.paddleX - 30);
                  setBrickBreakerGame(prev => prev ? { ...prev, paddleX: ref.paddleX } : prev);
                }
              }} className="bg-blue-500 text-white py-3 rounded-lg font-bold min-h-[48px]">←</button>
              <button onClick={() => {
                const ref = brickBreakerRef.current;
                if (ref) {
                  ref.paddleX = Math.min(ref.width - ref.paddleW, ref.paddleX + 30);
                  setBrickBreakerGame(prev => prev ? { ...prev, paddleX: ref.paddleX } : prev);
                }
              }} className="bg-blue-500 text-white py-3 rounded-lg font-bold min-h-[48px]">→</button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={initializeBrickBreaker} className="bg-indigo-500 text-white py-3 rounded-lg font-semibold min-h-[48px]">
                Restart
              </button>
              <button onClick={completeBrick} className="bg-yellow-500 text-white py-3 rounded-lg font-semibold min-h-[48px]">
                Collect Rewards
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Tile Matching Game (Mahjong-style)
  if (gameState === 'tileMatch') {
    const tiles = ['🌸', '🌺', '🌻', '🌷', '🌹', '🌼', '🌿', '🍀', '💐', '🎋'];
    
    const initializeTileMatch = () => {
      const tilePairs = [...tiles, ...tiles];
      const shuffled = tilePairs.sort(() => Math.random() - 0.5);
      const board = [];
      for (let i = 0; i < 4; i++) {
        board.push([]);
        for (let j = 0; j < 5; j++) {
          if (shuffled.length > 0) {
            board[i].push(shuffled.pop());
          }
        }
      }
      setTileBoard(board);
      setTileSelected(null);
      setTileScore(0);
    };

    if (tileBoard.length === 0) initializeTileMatch();

    const handleTileClick = (row, col) => {
      if (!tileBoard[row][col]) return;
      
      if (!tileSelected) {
        setTileSelected({ row, col });
      } else {
        if (tileBoard[tileSelected.row][tileSelected.col] === tileBoard[row][col] && 
            !(tileSelected.row === row && tileSelected.col === col)) {
          const newBoard = tileBoard.map(r => [...r]);
          newBoard[tileSelected.row][tileSelected.col] = null;
          newBoard[row][col] = null;
          setTileBoard(newBoard);
          setTileScore(tileScore + 10);
          setTileSelected(null);
          
          const remaining = newBoard.flat().filter(t => t !== null);
          if (remaining.length === 0) {
            setGameData(prev => ({
              ...prev,
              coins: prev.coins + 30,
              pet: { ...prev.pet, happiness: Math.min(100, prev.pet.happiness + 5) }
            }));
          }
        } else {
          setTileSelected({ row, col });
        }
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-200 via-cyan-200 to-teal-200 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-blue-600">🀄 Tile Match</h2>
              <button onClick={() => setGameState('puzzleGames')}
                className="bg-gray-500 text-white px-3 py-2 rounded-lg font-semibold active:bg-gray-600 text-sm">
                ← Back
              </button>
            </div>
            
            <div className="text-center mb-4">
              <div className="text-xl font-bold text-blue-600">Score: {tileScore}</div>
            </div>

            <div className="grid grid-cols-5 gap-2 mb-4">
              {tileBoard.map((row, i) => 
                row.map((tile, j) => (
                    <button
                      key={`${i}-${j}`}
                    onClick={() => handleTileClick(i, j)}
                    disabled={!tile}
                    className={`w-14 h-14 sm:w-16 sm:h-16 text-2xl sm:text-3xl rounded-lg transition-all active:scale-95 ${
                      tileSelected?.row === i && tileSelected?.col === j
                        ? 'bg-yellow-300 ring-4 ring-yellow-500'
                        : tile
                        ? 'bg-white hover:bg-blue-50 border-2 border-blue-200'
                        : 'bg-gray-100 opacity-50'
                    }`}
                  >
                    {tile || ''}
                  </button>
                ))
              )}
            </div>

            <button onClick={initializeTileMatch}
              className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold active:bg-blue-600 min-h-[48px]">
              New Game
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Word Search Game
  if (gameState === 'wordSearch') {
    const words = relationshipMode === 'couples' 
      ? ['LOVE', 'KISS', 'HEART', 'DATE', 'ROMANCE']
      : relationshipMode === 'parentChild'
      ? ['FAMILY', 'HOME', 'LOVE', 'CARE', 'UNITED']
      : ['FRIEND', 'FUN', 'LAUGH', 'JOY', 'BOND'];
    
    const initializeWordSearch = () => {
      const gridSize = 10;
      const grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(''));
      const placed = [];
      
      words.forEach(word => {
        let placedOk = false;
        for (let attempt = 0; attempt < 40 && !placedOk; attempt++) {
          const direction = Math.random() > 0.5 ? 'horizontal' : 'vertical';
          const row = Math.floor(Math.random() * (direction === 'vertical' ? gridSize - word.length + 1 : gridSize));
          const col = Math.floor(Math.random() * (direction === 'horizontal' ? gridSize - word.length + 1 : gridSize));
          let fits = true;
          for (let i = 0; i < word.length; i++) {
            const r = direction === 'horizontal' ? row : row + i;
            const c = direction === 'horizontal' ? col + i : col;
            if (grid[r][c] && grid[r][c] !== word[i]) fits = false;
          }
          if (!fits) continue;
          for (let i = 0; i < word.length; i++) {
            const r = direction === 'horizontal' ? row : row + i;
            const c = direction === 'horizontal' ? col + i : col;
            grid[r][c] = word[i];
          }
          placed.push(word);
          placedOk = true;
        }
      });
      
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
          if (!grid[i][j]) grid[i][j] = letters[Math.floor(Math.random() * letters.length)];
        }
      }
      
      setWordGrid(grid);
      setWordFound([]);
      setWordSelection([]);
      setWordHighlighted([]);
      setWordList(words);
    };

    if (wordGrid.length === 0) initializeWordSearch();

    const cellKey = (r, c) => `${r},${c}`;
    const isAdjacent = (a, b) => Math.abs(a.r - b.r) <= 1 && Math.abs(a.c - b.c) <= 1 && !(a.r === b.r && a.c === b.c);

    const finishSelection = (path) => {
      if (path.length < 2) {
        setWordSelection([]);
        return;
      }
      const selected = path.map(p => wordGrid[p.r][p.c]).join('');
      const reversed = selected.split('').reverse().join('');
      const match = words.find(w => !wordFound.includes(w) && (w === selected || w === reversed));
      if (match) {
        const newFound = [...wordFound, match];
        setWordFound(newFound);
        setWordHighlighted(prev => [...prev, ...path.map(p => cellKey(p.r, p.c))]);
        if (newFound.length === words.length) {
          awardMiniGameRewards(40, 5, 1);
        }
      }
      setWordSelection([]);
    };

    const onCellDown = (r, c) => {
      setWordSelecting(true);
      const path = [{ r, c }];
      wordSelectionRef.current = path;
      setWordSelection(path);
    };
    const onCellEnter = (r, c) => {
      if (!wordSelecting) return;
      setWordSelection(prev => {
        const last = prev[prev.length - 1];
        if (!last) {
          wordSelectionRef.current = [{ r, c }];
          return [{ r, c }];
        }
        if (last.r === r && last.c === c) return prev;
        if (!isAdjacent(last, { r, c })) return prev;
        if (prev.some(p => p.r === r && p.c === c)) return prev;
        const next = [...prev, { r, c }];
        wordSelectionRef.current = next;
        return next;
      });
    };
    const onCellUp = () => {
      if (!wordSelecting) return;
      setWordSelecting(false);
      finishSelection(wordSelectionRef.current);
      wordSelectionRef.current = [];
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-200 via-emerald-200 to-teal-200 p-4"
        onMouseUp={onCellUp} onTouchEnd={onCellUp}>
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-green-600">🔤 Word Search</h2>
              <button onClick={() => setGameState('puzzleGames')}
                className="bg-gray-500 text-white px-3 py-2 rounded-lg font-semibold active:bg-gray-600 text-sm">
                ← Back
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm font-semibold mb-2">Find these words (drag across letters):</p>
              <div className="flex flex-wrap gap-2">
                {words.map((word, i) => (
                  <span key={i} className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    wordFound.includes(word) ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {word}
                  </span>
                ))}
              </div>
              {wordFound.length === words.length && (
                <p className="text-center text-green-600 font-bold mt-2">All found! +40 coins earned 🎉</p>
              )}
            </div>

            <div className="grid grid-cols-10 gap-1 mb-4 bg-gray-100 p-2 rounded-lg select-none">
              {wordGrid.map((row, i) => 
                row.map((cell, j) => {
                  const key = cellKey(i, j);
                  const selected = wordSelection.some(p => p.r === i && p.c === j);
                  const found = wordHighlighted.includes(key);
                  return (
                    <button
                      type="button"
                      key={key}
                      onMouseDown={() => onCellDown(i, j)}
                      onMouseEnter={() => onCellEnter(i, j)}
                      onTouchStart={(e) => { e.preventDefault(); onCellDown(i, j); }}
                      onTouchMove={(e) => {
                        e.preventDefault();
                        const t = e.touches[0];
                        const el = document.elementFromPoint(t.clientX, t.clientY);
                        const btn = el?.closest?.('button[data-ws]');
                        if (!btn) return;
                        const r = Number(btn.getAttribute('data-r'));
                        const c = Number(btn.getAttribute('data-c'));
                        if (!Number.isNaN(r) && !Number.isNaN(c)) onCellEnter(r, c);
                      }}
                      data-ws="1"
                      data-r={i}
                      data-c={j}
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded flex items-center justify-center text-sm sm:text-base font-bold border ${
                        found ? 'bg-green-300 border-green-500' :
                        selected ? 'bg-yellow-300 border-yellow-500' :
                        'bg-white border-gray-300'
                      }`}
                    >
                      {cell}
                    </button>
                  );
                })
              )}
            </div>

            <button onClick={initializeWordSearch}
              className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold active:bg-green-600 min-h-[48px]">
              New Puzzle
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Jigsaw Puzzle (3x3 slide)
  if (gameState === 'jigsaw') {
    if (jigsawPieces.length === 0) initializeJigsaw();

    const slideTile = (index) => {
      const board = [...jigsawPieces];
      const empty = board.indexOf(0);
      const er = Math.floor(empty / 3);
      const ec = empty % 3;
      const tr = Math.floor(index / 3);
      const tc = index % 3;
      if (Math.abs(er - tr) + Math.abs(ec - tc) !== 1) return;
      [board[empty], board[index]] = [board[index], board[empty]];
      setJigsawPieces(board);
      const solved = board.every((v, i) => (i < 8 ? v === i + 1 : v === 0));
      setJigsawProgress(board.filter((v, i) => i < 8 && v === i + 1).length);
      if (solved) awardMiniGameRewards(35, 4, 1);
    };

    const solved = jigsawPieces.length === 9 && jigsawPieces.every((v, i) => (i < 8 ? v === i + 1 : v === 0));
    const emojis = ['💕', '🌸', '⭐', '🎮', '🐾', '🌈', '🎵', '🏆'];

    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-200 via-orange-200 to-red-200 p-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-yellow-600">🧩 Jigsaw Puzzle</h2>
              <button onClick={() => setGameState('puzzleGames')}
                className="bg-gray-500 text-white px-3 py-2 rounded-lg font-semibold active:bg-gray-600 text-sm">
                ← Back
              </button>
            </div>
            <p className="text-center text-sm text-gray-600 mb-3">Slide tiles into place ({jigsawProgress}/8 correct)</p>
            {solved && <p className="text-center font-bold text-green-600 mb-3">Solved! +35 coins 🎉</p>}
            <div className="grid grid-cols-3 gap-2 mb-4 max-w-[280px] mx-auto">
              {jigsawPieces.map((tile, i) => (
                <button
                  key={i}
                  onClick={() => slideTile(i)}
                  disabled={tile === 0 || solved}
                  className={`aspect-square text-3xl rounded-xl font-bold min-h-[80px] ${
                    tile === 0 ? 'bg-gray-200' : 'bg-gradient-to-br from-amber-100 to-orange-200 border-2 border-orange-300 active:scale-95'
                  }`}
                >
                  {tile === 0 ? '' : emojis[tile - 1]}
                </button>
              ))}
            </div>
            <button onClick={initializeJigsaw}
              className="w-full bg-yellow-500 text-white py-3 rounded-lg font-semibold active:bg-yellow-600 min-h-[48px]">
              Shuffle New Puzzle
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Logic Puzzle
  if (gameState === 'logicPuzzle') {
    if (!logicPuzzle) initializeLogicPuzzle();
    const q = LOGIC_QUESTIONS[logicPuzzle?.index || 0];

    const answerLogic = (option) => {
      if (!logicPuzzle || logicPuzzle.finished) return;
      const correct = option === q.answer;
      const nextScore = logicPuzzle.score + (correct ? 1 : 0);
      const nextIndex = logicPuzzle.index + 1;
      if (nextIndex >= LOGIC_QUESTIONS.length) {
        setLogicPuzzle({ index: nextIndex, score: nextScore, finished: true });
        awardMiniGameRewards(nextScore * 8 + 10, 4, 1);
      } else {
        setLogicPuzzle({ index: nextIndex, score: nextScore, finished: false });
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-200 via-indigo-200 to-blue-200 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-purple-600">🧠 Logic Puzzle</h2>
              <button onClick={() => setGameState('puzzleGames')}
                className="bg-gray-500 text-white px-3 py-2 rounded-lg font-semibold active:bg-gray-600 text-sm">
                ← Back
              </button>
            </div>
            {logicPuzzle?.finished ? (
              <div className="text-center p-6">
                <p className="text-2xl font-bold mb-2">Round complete!</p>
                <p className="text-lg text-purple-600 mb-4">Score: {logicPuzzle.score}/{LOGIC_QUESTIONS.length}</p>
                <p className="text-green-600 font-semibold mb-4">+{logicPuzzle.score * 8 + 10} coins earned</p>
                <button onClick={initializeLogicPuzzle} className="w-full bg-purple-500 text-white py-3 rounded-lg font-semibold min-h-[48px]">
                  Play Again
                </button>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-500 mb-2">Question {(logicPuzzle?.index || 0) + 1} of {LOGIC_QUESTIONS.length}</p>
                <p className="text-lg font-semibold mb-4">{q?.q}</p>
                <div className="grid gap-2">
                  {q?.options.map((opt) => (
                    <button key={opt} onClick={() => answerLogic(opt)}
                      className="w-full bg-indigo-50 hover:bg-indigo-100 border-2 border-indigo-200 text-left px-4 py-3 rounded-xl font-semibold min-h-[48px]">
                      {opt}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Escape Room
  if (gameState === 'escapeRoom') {
    if (!escapeRoom) initializeEscapeRoom();
    const room = ESCAPE_ROOMS[escapeRoom?.room || 0];

    const submitEscape = () => {
      if (!escapeRoom || escapeRoom.completed) return;
      const normalized = escapeAnswer.trim().toUpperCase();
      if (normalized === room.answer.toUpperCase()) {
        const nextRoom = escapeRoom.room + 1;
        if (nextRoom >= ESCAPE_ROOMS.length) {
          setEscapeRoom({ room: nextRoom, completed: true });
          setEscapeFeedback('You escaped!');
          awardMiniGameRewards(50, 5, 1);
        } else {
          setEscapeRoom({ room: nextRoom, completed: false });
          setEscapeAnswer('');
          setEscapeFeedback('Door unlocked! Enter the next room...');
        }
      } else {
        setEscapeFeedback('Wrong code — try again.');
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-red-200 via-rose-200 to-pink-200 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-red-600">🚪 Escape Room</h2>
              <button onClick={() => setGameState('puzzleGames')}
                className="bg-gray-500 text-white px-3 py-2 rounded-lg font-semibold active:bg-gray-600 text-sm">
                ← Back
              </button>
            </div>
            {escapeRoom?.completed ? (
              <div className="text-center p-6">
                <p className="text-2xl font-bold mb-2">Freedom! 🎉</p>
                <p className="text-green-600 font-semibold mb-4">+50 coins and bond boost</p>
                <button onClick={initializeEscapeRoom} className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold min-h-[48px]">
                  Play Again
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-bold mb-2">{room?.title}</h3>
                <p className="text-gray-700 mb-4 bg-rose-50 p-4 rounded-xl">{room?.clue}</p>
                <input
                  value={escapeAnswer}
                  onChange={(e) => setEscapeAnswer(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && submitEscape()}
                  placeholder="Enter the code..."
                  className="w-full border-2 border-rose-200 rounded-xl px-4 py-3 mb-3 min-h-[48px]"
                />
                {escapeFeedback && <p className="text-sm text-center mb-3 text-rose-700">{escapeFeedback}</p>}
                <button onClick={submitEscape}
                  className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold active:bg-red-600 min-h-[48px]">
                  Unlock Door
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Arcade menu
  if (gameState === 'arcadeGames') {
    return (
      <GameShell bgClass="bg-gradient-to-br from-amber-400 via-orange-500 to-rose-600" maxWidth="max-w-4xl">
        <GameCard>
          <GameHeader title="Arcade" titleClass="text-amber-800" onBack={() => setGameState('pet')} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="menu-tile bg-gradient-to-br from-yellow-200 to-amber-300">
                <h3 className="game-title text-2xl font-bold mb-2 text-amber-950">Pac-Man</h3>
                <p className="text-amber-900/70 mb-4 text-sm font-semibold">Chomp dots and dodge ghosts!</p>
                <button onClick={() => {
                  initializePacman();
                  setGameState('pacman');
                }}
                  className="ctrl-btn w-full bg-amber-500 text-white py-3">
                  Play Pac-Man
                </button>
              </div>
              <div className="menu-tile bg-gradient-to-br from-sky-200 to-cyan-300">
                <h3 className="game-title text-2xl font-bold mb-2 text-sky-950">Jetpack Joyride</h3>
                <p className="text-sky-900/70 mb-4 text-sm font-semibold">Fly as far as you can!</p>
                <button onClick={() => {
                  setJetpackScore(0);
                  setJetpackGameOver(false);
                  jetpackYRef.current = 200;
                  setJetpackY(200);
                  setJetpackObstacles([]);
                  handleJetpackFly(false);
                  setGameState('jetpack');
                }}
                  className="ctrl-btn w-full bg-sky-600 text-white py-3">
                  Play Jetpack
                </button>
              </div>
            </div>
        </GameCard>
      </GameShell>
    );
  }

  // Pac-Man Game
  if (gameState === 'pacman') {
    const maze = pacmanMaze.length ? pacmanMaze : createPacmanMaze();
    const dotsLeft = maze.flat().filter(c => c === 2).length;

    const completePacman = () => {
      awardMiniGameRewards(Math.floor(pacmanScore / 10) + 10, 3, 1);
      setGameState('arcadeGames');
    };

    return (
      <GameShell bgClass="bg-gradient-to-br from-slate-900 via-blue-950 to-black" maxWidth="max-w-2xl">
        <GameCard className="!bg-gradient-to-b from-slate-900 to-slate-950 !border-yellow-400/40 text-white">
          <GameHeader title="Pac-Man" titleClass="text-yellow-300" onBack={() => setGameState('arcadeGames')} />

            <div className="grid grid-cols-3 gap-2 mb-4">
              <StatPill label="Score" value={pacmanScore} tone="bg-yellow-400/20 text-yellow-200" />
              <StatPill label="Lives" value={pacmanLives} tone="bg-rose-400/20 text-rose-200" />
              <StatPill label="Dots" value={dotsLeft} tone="bg-sky-400/20 text-sky-200" />
            </div>

            {pacmanGameOver && (
              <div className="text-center p-3 rounded-xl bg-rose-500/20 border border-rose-400/40 mb-3 font-bold text-rose-200">Game Over!</div>
            )}
            {dotsLeft === 0 && !pacmanGameOver && (
              <div className="text-center p-3 rounded-xl bg-lime-500/20 border border-lime-400/40 mb-3 font-bold text-lime-200">All dots cleared!</div>
            )}

            <div className="rounded-xl p-2 mb-4 overflow-x-auto border-2 border-blue-500/60 shadow-lg shadow-blue-900/50"
              style={{ width: 'fit-content', margin: '0 auto', background: '#000814' }}>
              {maze.map((row, i) => (
                <div key={i} className="flex">
                  {row.map((cell, j) => {
                    const isPac = pacmanPos.x === j && pacmanPos.y === i;
                    const ghost = pacmanGhosts.find(g => g.x === j && g.y === i);
                    return (
                      <div key={`${i}-${j}`} className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-xs">
                        {isPac ? (
                          <span className="w-3 h-3 rounded-full bg-yellow-300 shadow shadow-yellow-300/80" />
                        ) : ghost ? ghost.color : cell === 1 ? (
                          <span className="w-full h-full bg-blue-600 rounded-[2px]" />
                        ) : cell === 2 ? (
                          <span className="w-1 h-1 rounded-full bg-yellow-200" />
                        ) : ''}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-3 gap-2 mb-2 max-w-[220px] mx-auto">
              <div />
              <button onClick={() => { pacmanDirRef.current = 'up'; setPacmanDirection('up'); }}
                className="ctrl-btn bg-yellow-400 text-slate-900 py-3">↑</button>
              <div />
              <button onClick={() => { pacmanDirRef.current = 'left'; setPacmanDirection('left'); }}
                className="ctrl-btn bg-yellow-400 text-slate-900 py-3">←</button>
              <button onClick={() => { pacmanDirRef.current = 'down'; setPacmanDirection('down'); }}
                className="ctrl-btn bg-yellow-400 text-slate-900 py-3">↓</button>
              <button onClick={() => { pacmanDirRef.current = 'right'; setPacmanDirection('right'); }}
                className="ctrl-btn bg-yellow-400 text-slate-900 py-3">→</button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button onClick={initializePacman} className="ctrl-btn bg-amber-500 text-white py-3">Restart</button>
              <button onClick={completePacman} className="ctrl-btn bg-lime-400 text-lime-950 py-3">
                Collect (+{Math.floor(pacmanScore / 10) + 10})
              </button>
            </div>
        </GameCard>
      </GameShell>
    );
  }

  // Jetpack Joyride Game
  if (gameState === 'jetpack') {
    const completeJetpack = () => {
      awardMiniGameRewards(Math.floor(jetpackScore / 5) + 5, 3, 1);
      setGameState('arcadeGames');
    };

    return (
      <GameShell bgClass="bg-gradient-to-br from-sky-500 via-indigo-600 to-slate-900" maxWidth="max-w-md">
        <GameCard className="!bg-gradient-to-b from-sky-50 to-indigo-100">
          <GameHeader title="Jetpack" titleClass="text-sky-900" onBack={() => setGameState('arcadeGames')} />

            <div className="grid grid-cols-2 gap-2 mb-4">
              <StatPill label="Score" value={jetpackScore} tone="bg-sky-200 text-sky-950" />
              <StatPill label="Status" value={jetpackFlying ? 'Flying!' : 'Hold fly'} tone="bg-indigo-200 text-indigo-950" />
            </div>

            {jetpackGameOver ? (
              <div className="text-center p-5 rounded-2xl bg-rose-100 border-2 border-rose-300 mb-4">
                <div className="game-title text-2xl font-bold mb-2 text-rose-800">Game Over!</div>
                <div className="text-emerald-700 font-bold mb-4">+{Math.floor(jetpackScore / 5) + 5} coins</div>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => {
                    setJetpackScore(0);
                    jetpackYRef.current = 200;
                    setJetpackY(200);
                    setJetpackObstacles([]);
                    setJetpackGameOver(false);
                    handleJetpackFly(false);
                  }}
                    className="ctrl-btn bg-sky-500 text-white py-2">
                    Play Again
                  </button>
                  <button onClick={completeJetpack}
                    className="ctrl-btn bg-lime-500 text-lime-950 py-2">
                    Collect Rewards
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="relative rounded-2xl h-96 mb-4 overflow-hidden border-4 border-sky-700 shadow-xl"
                  style={{ background: 'linear-gradient(180deg,#7dd3fc 0%,#38bdf8 40%,#0369a1 100%)' }}>
                  <div className="absolute inset-x-0 top-0 h-16 opacity-40"
                    style={{ background: 'repeating-linear-gradient(90deg,transparent,transparent 40px,rgba(255,255,255,0.25) 40px,rgba(255,255,255,0.25) 42px)' }} />
                  <div className="absolute left-12 animate-float-soft" style={{ top: `${jetpackY}px` }}>
                    <div className="text-4xl drop-shadow-lg">🚀</div>
                    {jetpackFlying && <div className="text-center text-orange-300 text-xs -mt-1">🔥</div>}
                  </div>
                  {jetpackObstacles.map((obs, i) => (
                    <div key={i}>
                      <div className="absolute w-12 rounded-b-lg bg-gradient-to-b from-slate-600 to-slate-900 border border-slate-500"
                        style={{ left: `${obs.x}px`, top: 0, height: `${obs.yTop}px` }} />
                      <div className="absolute w-12 rounded-t-lg bg-gradient-to-t from-slate-600 to-slate-900 border border-slate-500"
                        style={{ left: `${obs.x}px`, top: `${obs.yBottom}px`, bottom: 0 }} />
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onMouseDown={() => handleJetpackFly(true)}
                  onMouseUp={() => handleJetpackFly(false)}
                  onMouseLeave={() => handleJetpackFly(false)}
                  onTouchStart={(e) => { e.preventDefault(); handleJetpackFly(true); }}
                  onTouchEnd={() => handleJetpackFly(false)}
                  className={`ctrl-btn w-full py-5 text-lg select-none ${
                    jetpackFlying
                      ? 'bg-gradient-to-r from-orange-400 to-rose-500 text-white'
                      : 'bg-gradient-to-r from-sky-500 to-indigo-500 text-white'
                  }`}
                >
                  {jetpackFlying ? 'Flying…' : 'Hold to Fly'}
                </button>
              </>
            )}
        </GameCard>
      </GameShell>
    );
  }

  // Checkers Game
  if (gameState === 'checkers') {
    if (checkersBoard.length === 0) initializeCheckers();

    return (
      <GameShell bgClass="bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900" maxWidth="max-w-lg">
        <GameCard className="!bg-gradient-to-b from-emerald-50 to-lime-50">
          <GameHeader title="Checkers" titleClass="text-emerald-900" onBack={() => setGameState('boardGames')} />

            {checkersWinner ? (
              <div className="text-center mb-4 p-4 rounded-2xl bg-gradient-to-br from-lime-100 to-emerald-200 border-2 border-emerald-300">
                <div className="game-title text-2xl font-bold mb-2 text-emerald-950">
                  {checkersWinner === 'red' ? 'Red' : 'Black'} wins!
                </div>
                <p className="text-emerald-800 font-bold mb-3">+50 coins earned</p>
                <button onClick={initializeCheckers}
                  className="ctrl-btn bg-emerald-600 text-white px-6 py-3">
                  Play Again
                </button>
              </div>
            ) : (
              <div className="text-center mb-3 px-3 py-2 rounded-xl bg-emerald-100/80 border border-emerald-200">
                <div className="text-lg font-extrabold text-emerald-950">
                  {checkersPlayer === 'red' ? '🔴 Red' : '⚫ Black'}'s Turn
                  {checkersJumping ? ' — keep jumping!' : ''}
                </div>
                <p className="text-sm text-emerald-800 mt-1 min-h-[20px] font-semibold">{checkersMessage}</p>
              </div>
            )}

            <div className="rounded-2xl p-2 mb-4 mx-auto shadow-xl overflow-hidden"
              style={{ width: 'fit-content', background: 'linear-gradient(145deg,#064e3b,#022c22)', border: '4px solid #10b981' }}>
              {checkersBoard.map((row, i) => (
                <div key={i} className="flex">
                  {row.map((cell, j) => {
                    const isTarget = checkersLegalTargets.some(t => t.row === i && t.col === j);
                    const isSel = checkersSelected?.row === i && checkersSelected?.col === j;
                    const isLight = (i + j) % 2 === 0;
                    return (
                      <button
                        key={`${i}-${j}`}
                        type="button"
                        onClick={() => handleCheckersClick(i, j)}
                        disabled={!!checkersWinner}
                        className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center relative ${
                          isLight ? 'bg-emerald-100' : 'bg-emerald-800'
                        } ${isSel ? 'ring-4 ring-cyan-300 z-10' : ''} ${isTarget ? 'ring-4 ring-amber-300 z-10' : ''}`}
                      >
                        {cell ? (
                          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-amber-200 text-xs font-bold shadow-lg ${
                            cell.type === 'red'
                              ? 'bg-gradient-to-br from-rose-400 to-red-700'
                              : 'bg-gradient-to-br from-slate-600 to-slate-950'
                          } ${cell.king ? 'ring-2 ring-amber-300' : ''}`}>
                            {cell.king ? '★' : ''}
                          </div>
                        ) : isTarget ? (
                          <span className="w-3 h-3 rounded-full bg-amber-300 shadow" />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            {!checkersWinner && (
              <button onClick={initializeCheckers}
                className="ctrl-btn w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3">
                New Game
              </button>
            )}
        </GameCard>
      </GameShell>
    );
  }

  // Mini Golf Game
  if (gameState === 'miniGolf') {
    const takeStroke = () => {
      if (golfMoving || golfDone) return;
      const rad = (golfAim * Math.PI) / 180;
      const power = golfPower / 18;
      golfBallRef.current.vx = Math.cos(rad) * power;
      golfBallRef.current.vy = Math.sin(rad) * power;
      setGolfVel({ x: golfBallRef.current.vx, y: golfBallRef.current.vy });
      setGolfStrokes(s => s + 1);
      setGolfMoving(true);
    };

    return (
      <GameShell bgClass="bg-gradient-to-br from-lime-500 via-green-600 to-teal-800" maxWidth="max-w-2xl">
        <GameCard className="!bg-gradient-to-b from-lime-50 to-emerald-50">
          <GameHeader title="Mini Golf" titleClass="text-green-900" onBack={() => setGameState('boardGames')} />

            <div className="grid grid-cols-3 gap-2 mb-4">
              <StatPill label="Hole" value={`${Math.min(golfHole, 5)}/5`} tone="bg-lime-200 text-lime-950" />
              <StatPill label="Strokes" value={golfStrokes} tone="bg-sky-200 text-sky-950" />
              <StatPill label="Total" value={golfScore} tone="bg-amber-200 text-amber-950" />
            </div>

            <div className="relative rounded-2xl h-72 mb-4 overflow-hidden border-4 border-emerald-800 shadow-xl"
              style={{ background: 'linear-gradient(180deg,#86efac 0%,#22c55e 55%,#15803d 100%)' }}>
              <div className="absolute inset-0 opacity-20"
                style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, #fff 1px, transparent 1px)', backgroundSize: '18px 18px' }} />
              <div className="absolute w-10 h-10 bg-slate-950 rounded-full border-2 border-white shadow-lg"
                style={{ left: `${golfHolePos.x}%`, top: `${golfHolePos.y}%`, transform: 'translate(-50%, -50%)' }} />
              <div className="absolute w-1 h-8 bg-white origin-bottom"
                style={{ left: `${golfHolePos.x}%`, top: `${golfHolePos.y - 8}%`, transform: 'translateX(-50%)' }} />
              <div className="absolute w-4 h-3 bg-rose-500 rounded-sm"
                style={{ left: `${golfHolePos.x + 1}%`, top: `${golfHolePos.y - 8}%` }} />
              {!golfMoving && !golfDone && (
                <div className="absolute h-1 bg-white/90 origin-left rounded"
                  style={{
                    left: `${golfBallPos.x}%`,
                    top: `${golfBallPos.y}%`,
                    transform: `rotate(${golfAim}deg)`,
                    width: `${golfPower * 0.6}px`
                  }} />
              )}
              <div className="absolute w-5 h-5 bg-white rounded-full border-2 border-slate-800 shadow-lg"
                style={{ left: `${golfBallPos.x}%`, top: `${golfBallPos.y}%`, transform: 'translate(-50%, -50%)' }} />
            </div>

            {golfDone ? (
              <div className="text-center p-4 rounded-2xl bg-lime-100 border-2 border-lime-300 mb-3">
                <div className="game-title text-xl font-bold mb-2 text-green-900">Course complete!</div>
                <div className="text-green-800 font-bold mb-3">Total strokes: {golfScore}</div>
                <button onClick={initializeMiniGolf} className="ctrl-btn w-full bg-green-600 text-white py-3">Play Again</button>
              </div>
            ) : (
              <>
                <div className="mb-3">
                  <label className="text-sm font-bold text-green-900">Aim ({golfAim}°)</label>
                  <input type="range" min={-180} max={180} value={golfAim} disabled={golfMoving}
                    onChange={(e) => setGolfAim(Number(e.target.value))}
                    className="w-full accent-emerald-600" />
                </div>
                <div className="mb-4">
                  <label className="text-sm font-bold text-green-900">Power ({golfPower})</label>
                  <input type="range" min={15} max={90} value={golfPower} disabled={golfMoving}
                    onChange={(e) => setGolfPower(Number(e.target.value))}
                    className="w-full accent-amber-500" />
                </div>
                <button onClick={takeStroke} disabled={golfMoving}
                  className={`ctrl-btn w-full py-4 text-lg ${
                    golfMoving ? 'bg-stone-300 text-stone-500' : 'bg-gradient-to-r from-lime-500 to-emerald-600 text-white'
                  }`}>
                  {golfMoving ? 'Ball rolling...' : 'Swing'}
                </button>
              </>
            )}
        </GameCard>
      </GameShell>
    );
  }

  // Word Games Menu
  if (gameState === 'wordGames') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-200 via-blue-200 to-purple-200 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-6 mb-4 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-indigo-600">📝 Word Games</h2>
              <button onClick={() => setGameState('boardGames')}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold active:bg-gray-600">
                ← Back
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-gradient-to-br from-red-100 to-pink-100 rounded-xl p-6">
                <h3 className="text-2xl font-bold mb-2">🎯 Hangman</h3>
                <p className="text-gray-600 mb-4 text-sm">Guess the word before you run out of lives!</p>
                <button onClick={() => {
                  initializeHangman();
                  setGameState('hangman');
                }}
                  className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold active:bg-red-600 min-h-[48px]">
                  Play Hangman
                </button>
              </div>

              <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl p-6">
                <h3 className="text-2xl font-bold mb-2">🔤 Word Scramble</h3>
                <p className="text-gray-600 mb-4 text-sm">Unscramble the letters to form words!</p>
                <button onClick={() => setGameState('wordScramble')}
                  className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold active:bg-blue-600 min-h-[48px]">
                  Play Word Scramble
                </button>
              </div>

              <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl p-6">
                <h3 className="text-2xl font-bold mb-2">📚 Word Search</h3>
                <p className="text-gray-600 mb-4 text-sm">Find hidden words in the grid!</p>
                <button onClick={() => setGameState('wordSearch')}
                  className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold active:bg-green-600 min-h-[48px]">
                  Play Word Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Hangman Game
  if (gameState === 'hangman') {
    const words = relationshipMode === 'couples'
      ? ['LOVE', 'KISS', 'HEART', 'ROMANCE', 'DATE', 'SWEET']
      : relationshipMode === 'parentChild'
      ? ['FAMILY', 'HOME', 'LOVE', 'CARE', 'UNITED', 'BOND']
      : ['FRIEND', 'FUN', 'LAUGH', 'JOY', 'BOND', 'SMILE'];

    const initializeHangman = () => {
      const word = words[Math.floor(Math.random() * words.length)];
      setHangmanWord(word);
      setHangmanGuessed([]);
      setHangmanWrong(0);
      setHangmanWon(false);
    };

    if (!hangmanWord) initializeHangman();

    const handleGuess = (letter) => {
      if (hangmanGuessed.includes(letter) || hangmanWon || hangmanWrong >= 6) return;
      const nextGuessed = [...hangmanGuessed, letter];
      setHangmanGuessed(nextGuessed);
      let wrong = hangmanWrong;
      if (!hangmanWord.includes(letter)) {
        wrong = hangmanWrong + 1;
        setHangmanWrong(wrong);
      }
      const won = hangmanWord.split('').every(l => nextGuessed.includes(l));
      if (won) {
        setHangmanWon(true);
        awardMiniGameRewards(40, 3, 1);
        setGameData(prev => ({ ...prev, gamesWon: (prev.gamesWon || 0) + 1 }));
      }
    };

    const displayWord = hangmanWord.split('').map(letter => 
      hangmanGuessed.includes(letter) ? letter : '_'
    ).join(' ');

    const isWon = hangmanWon || hangmanWord.split('').every(letter => hangmanGuessed.includes(letter));
    const isLost = hangmanWrong >= 6;

    return (
      <div className="min-h-screen bg-gradient-to-br from-red-200 via-pink-200 to-rose-200 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-red-600">🎯 Hangman</h2>
              <button onClick={() => setGameState('wordGames')}
                className="bg-gray-500 text-white px-3 py-2 rounded-lg font-semibold active:bg-gray-600 text-sm">
                ← Back
              </button>
            </div>

            {isWon ? (
              <div className="text-center p-6 bg-green-50 rounded-lg mb-4">
                <div className="text-3xl font-bold mb-2">🎉 You Won!</div>
                <div className="text-green-600 font-semibold mb-4">+40 Coins Earned! 🪙</div>
                <button onClick={initializeHangman}
                  className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold active:bg-green-600">
                  Play Again
                </button>
              </div>
            ) : isLost ? (
              <div className="text-center p-6 bg-red-50 rounded-lg mb-4">
                <div className="text-3xl font-bold mb-2">💀 Game Over!</div>
                <div className="text-gray-600 mb-2">The word was: <strong>{hangmanWord}</strong></div>
                <button onClick={initializeHangman}
                  className="bg-red-500 text-white px-6 py-3 rounded-lg font-semibold active:bg-red-600">
                  Play Again
                </button>
              </div>
            ) : (
              <>
                <div className="text-center mb-4">
                  <div className="text-4xl font-mono mb-2">{displayWord}</div>
                  <div className="text-sm text-gray-600">Wrong guesses: {hangmanWrong}/6</div>
                </div>

                <div className="text-center mb-4">
                  <div className="text-6xl">
                    {hangmanWrong >= 1 && 'O'}
                    {hangmanWrong >= 2 && '|'}
                    {hangmanWrong >= 3 && '\\'}
                    {hangmanWrong >= 4 && '/'}
                    {hangmanWrong >= 5 && '|'}
                    {hangmanWrong >= 6 && '\\'}
                  </div>
                </div>

                <div className="grid grid-cols-6 sm:grid-cols-9 gap-2">
                  {Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ').map(letter => (
                    <button
                      key={letter}
                      onClick={() => handleGuess(letter)}
                      disabled={hangmanGuessed.includes(letter)}
                      className={`py-2 rounded-lg font-bold text-sm active:scale-95 ${
                        hangmanGuessed.includes(letter)
                          ? hangmanWord.includes(letter)
                            ? 'bg-green-500 text-white'
                            : 'bg-red-500 text-white'
                          : 'bg-blue-500 text-white active:bg-blue-600'
                      }`}
                    >
                      {letter}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Word Scramble Game
  if (gameState === 'wordScramble') {
    const words = relationshipMode === 'couples'
      ? ['LOVE', 'KISS', 'HEART', 'ROMANCE']
      : relationshipMode === 'parentChild'
      ? ['FAMILY', 'HOME', 'LOVE', 'CARE']
      : ['FRIEND', 'FUN', 'LAUGH', 'JOY'];

    const checkAnswer = () => {
      if (scrambleInput.toUpperCase() === currentWord && currentWord) {
        setScrambleScore(prev => prev + 10);
        const newIndex = (scrambleIndex + 1) % words.length;
        setScrambleIndex(newIndex);
        const word = words[newIndex];
        setCurrentWord(word);
        setScrambledWord(word.split('').sort(() => Math.random() - 0.5).join(''));
        setScrambleInput('');
        
        setGameData(prev => ({
          ...prev,
          coins: prev.coins + 5,
          pet: { ...prev.pet, happiness: Math.min(100, prev.pet.happiness + 2) }
        }));
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-200 via-cyan-200 to-teal-200 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-blue-600">🔤 Word Scramble</h2>
              <button onClick={() => setGameState('wordGames')}
                className="bg-gray-500 text-white px-3 py-2 rounded-lg font-semibold active:bg-gray-600 text-sm">
                ← Back
              </button>
            </div>

            <div className="text-center mb-4">
              <div className="text-2xl font-bold text-blue-600">Score: {scrambleScore}</div>
            </div>

            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-gray-800 mb-4">{scrambledWord}</div>
              <p className="text-gray-600 mb-4">Unscramble this word!</p>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={scrambleInput}
                  onChange={(e) => setScrambleInput(e.target.value.toUpperCase())}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      checkAnswer();
                    }
                  }}
                  placeholder="Type your answer..."
                  className="flex-1 px-4 py-3 rounded-lg border-2 border-blue-300 focus:border-blue-500 outline-none text-center text-xl"
                />
                <button
                  onClick={checkAnswer}
                  className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold active:bg-blue-600">
                  Check
                </button>
              </div>
            </div>

            {scrambleScore > 0 && (
              <div className="text-center p-4 bg-green-50 rounded-lg mb-4">
                <div className="text-green-600 font-semibold">+10 points! 🎉</div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default BondPetGame;
