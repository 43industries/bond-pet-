import React, { useState, useEffect, useRef } from 'react';
import { Heart, Star, Gift, Sparkles, ShoppingBag, Zap, Trophy, Gamepad2 } from 'lucide-react';

const BondPetGame = () => {
  const [gameState, setGameState] = useState('welcome');
  const [playerName, setPlayerName] = useState('');
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [relationshipMode, setRelationshipMode] = useState(null);
  const [selectedPetType, setSelectedPetType] = useState(null);
  const [gameData, setGameData] = useState({
    pet: { name: 'Buddy', type: 'dog', happiness: 50, level: 1 },
    inventory: [],
    coins: 0,
    conversationsCompleted: 0,
    relationshipProgress: 0, // 0-100, tracks relationship strength
    bondLevel: 1, // Levels up as relationship progresses
    unlockedPets: ['dog'],
    gamesWon: 0,
    bibleVerses: [],
    conversationHistory: [] // Track conversation topics/questions
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
  
  const [unlockedPets, setUnlockedPets] = useState(['dog']);

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
  const tetrisRef = useRef({ board: null, piece: null, gameOver: false, paused: false });

  // Keep ref in sync
  useEffect(() => {
    tetrisRef.current = { board: tetrisBoard, piece: tetrisPiece, gameOver: tetrisGameOver, paused: tetrisPaused };
  }, [tetrisBoard, tetrisPiece, tetrisGameOver, tetrisPaused]);

  // Snake states
  const [snakeGame, setSnakeGame] = useState(null);
  const [snakeScore, setSnakeScore] = useState(0);
  const [snakeGameOver, setSnakeGameOver] = useState(false);

  // Brick Breaker states
  const [brickBreakerGame, setBrickBreakerGame] = useState(null);
  const [brickBreakerScore, setBrickBreakerScore] = useState(0);
  const [brickBreakerGameOver, setBrickBreakerGameOver] = useState(false);

  // Board games states
  const [ticTacToeBoard, setTicTacToeBoard] = useState(Array(9).fill(null));
  const [ticTacToePlayer, setTicTacToePlayer] = useState('X');
  const [ticTacToeWinner, setTicTacToeWinner] = useState(null);
  const [connect4Board, setConnect4Board] = useState(Array(6).fill(null).map(() => Array(7).fill(null)));
  const [connect4Player, setConnect4Player] = useState('🔴');
  const [connect4Winner, setConnect4Winner] = useState(null);
  
  // Checkers states
  const [checkersBoard, setCheckersBoard] = useState([]);
  const [checkersPlayer, setCheckersPlayer] = useState('red');
  const [checkersSelected, setCheckersSelected] = useState(null);
  const [checkersWinner, setCheckersWinner] = useState(null);
  
  // Mini Golf states
  const [golfHole, setGolfHole] = useState(1);
  const [golfScore, setGolfScore] = useState(0);
  const [golfStrokes, setGolfStrokes] = useState(0);
  const [golfBallPos, setGolfBallPos] = useState({ x: 50, y: 50 });
  
  // Word games states
  const [wordGameType, setWordGameType] = useState(null);
  const [hangmanWord, setHangmanWord] = useState('');
  const [hangmanGuessed, setHangmanGuessed] = useState([]);
  const [hangmanWrong, setHangmanWrong] = useState(0);
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
  const [pacmanGame, setPacmanGame] = useState(null);
  const [pacmanScore, setPacmanScore] = useState(0);
  const [pacmanLives, setPacmanLives] = useState(3);
  const [pacmanLevel, setPacmanLevel] = useState(1);
  const [pacmanDirection, setPacmanDirection] = useState('right');
  const [pacmanPos, setPacmanPos] = useState({ x: 14, y: 23 });
  
  const [jetpackGame, setJetpackGame] = useState(null);
  const [jetpackScore, setJetpackScore] = useState(0);
  const [jetpackY, setJetpackY] = useState(200);
  const [jetpackObstacles, setJetpackObstacles] = useState([]);
  const [jetpackGameOver, setJetpackGameOver] = useState(false);

  // Chess states
  const [chessBoard, setChessBoard] = useState(null);
  const [chessCurrentPlayer, setChessCurrentPlayer] = useState('white');
  const [chessSelectedSquare, setChessSelectedSquare] = useState(null);
  const [chessGameOver, setChessGameOver] = useState(false);
  const [chessWinner, setChessWinner] = useState(null);

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
    const petType = petTypes.find(p => p.id === gameData.pet.type) || petTypes[0];
    const h = gameData.pet.happiness;
    
    if (h > 80) {
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
      friends: ["Let's go on an adventure! 🎮", "You two are awesome!", "Pizza time? 🍕", "Squad goals! ✨"],
      couples: ["You two are adorable! 💕", "Love is in the air! 🌹", "Date night ideas? ✨", "Someone's thinking of you 💝"],
      family: ["Family time is the best! 🏠", "I'm proud of you! ⭐", "Let's make memories! 📷", "Home sweet home! 💛"]
    };
    return msgs[relationshipMode]?.[Math.floor(Math.random() * 4)] || msgs.friends[0];
  };

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
    
    let newPiece = { ...tetrisPiece };
    if (direction === 'left') newPiece.x--;
    else if (direction === 'right') newPiece.x++;
    else if (direction === 'down') newPiece.y++;
    else if (direction === 'rotate') newPiece = rotateTetrisPiece(tetrisPiece);
    
    if (isValidPosition(tetrisBoard, newPiece)) {
      setTetrisPiece(newPiece);
    } else if (direction === 'down') {
      // Place piece and create new one
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
      
      const nextPiece = createNewTetrisPiece();
      if (!isValidPosition(clearedBoard, nextPiece)) {
        setTetrisGameOver(true);
      } else {
        setTetrisPiece(nextPiece);
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
        
        const nextPiece = createNewTetrisPiece();
        if (!isValidPosition(clearedBoard, nextPiece)) {
          setTetrisGameOver(true);
        } else {
          setTetrisPiece(nextPiece);
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
      else if (e.key === 'ArrowUp' || e.key === ' ') moveTetrisPiece('rotate');
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

  // Pacman keyboard controls
  useEffect(() => {
    if (gameState !== 'pacman') return;
    
    const handlePacmanKey = (key) => {
      if (key === 'ArrowUp') setPacmanDirection('up');
      else if (key === 'ArrowDown') setPacmanDirection('down');
      else if (key === 'ArrowLeft') setPacmanDirection('left');
      else if (key === 'ArrowRight') setPacmanDirection('right');
    };
    
    const handleKeyPress = (e) => {
      e.preventDefault();
      handlePacmanKey(e.key);
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState]);

  // Pacman movement
  useEffect(() => {
    if (gameState !== 'pacman') return;
    
    const movePacman = () => {
      setPacmanPos(current => {
        let newPos = { ...current };
        if (pacmanDirection === 'up') newPos.y--;
        else if (pacmanDirection === 'down') newPos.y++;
        else if (pacmanDirection === 'left') newPos.x--;
        else if (pacmanDirection === 'right') newPos.x++;
        
        // Check bounds
        if (newPos.x < 0) newPos.x = 30;
        if (newPos.x > 30) newPos.x = 0;
        if (newPos.y < 0 || newPos.y > 27) return current;
        
        // Score will be updated when rendering checks the maze
        return newPos;
      });
    };
    
    const interval = setInterval(movePacman, 200);
    return () => clearInterval(interval);
  }, [gameState, pacmanDirection]);

  // Jetpack keyboard controls
  useEffect(() => {
    if (gameState !== 'jetpack' || jetpackGameOver) return;
    
    const handleJetpackKey = (pressed) => {
      if (pressed) {
        setJetpackY(prev => Math.max(50, prev - 5));
      } else {
        setJetpackY(prev => Math.min(350, prev + 3));
      }
    };
    
    const handleKeyPress = (e) => {
      if (e.key === ' ' || e.key === 'ArrowUp') {
        e.preventDefault();
        handleJetpackKey(true);
      }
    };
    
    const handleKeyUp = (e) => {
      if (e.key === ' ' || e.key === 'ArrowUp') {
        e.preventDefault();
        handleJetpackKey(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, jetpackGameOver]);

  // Jetpack game loop
  useEffect(() => {
    if (gameState !== 'jetpack' || jetpackGameOver) return;
    
    const gameLoop = setInterval(() => {
      setJetpackScore(prev => prev + 1);
      setJetpackObstacles(prev => {
        const newObstacles = prev.map(obs => ({ ...obs, x: obs.x - 5 }));
        const filtered = newObstacles.filter(obs => obs.x > -50);
        
        // Add new obstacles
        if (Math.random() < 0.1) {
          filtered.push({
            x: 600,
            yTop: Math.random() * 150 + 50,
            yBottom: Math.random() * 150 + 250,
            gap: 100
          });
        }
        
        // Check collisions
        filtered.forEach(obs => {
          if (obs.x < 100 && obs.x > 50) {
            if (jetpackY < obs.yTop || jetpackY > obs.yBottom) {
              setJetpackGameOver(true);
            }
          }
        });
        
        return filtered;
      });
    }, 50);
    
    return () => clearInterval(gameLoop);
  }, [gameState, jetpackGameOver, jetpackY]);

  // Word Scramble initialization
  useEffect(() => {
    if (gameState !== 'wordScramble') return;
    
    const words = relationshipMode === 'couples'
      ? ['LOVE', 'KISS', 'HEART', 'ROMANCE']
      : relationshipMode === 'family'
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
              placeholder="Enter your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-purple-300 focus:border-purple-500 outline-none"
            />
            
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-700 text-center">Build stronger bonds through meaningful conversations</p>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setRelationshipMode('couples');
                    setCurrentPlayer(playerName || 'Player 1');
                    setGameState('pet');
                  }}
                  className="w-full text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all bg-gradient-to-r from-pink-400 to-red-400 text-lg"
                >
                  💕 Couples Mode
                  <div className="text-sm font-normal mt-1">Deepen your romantic connection</div>
                </button>
                <button
                  onClick={() => {
                    setRelationshipMode('friends');
                    setCurrentPlayer(playerName || 'Player 1');
                    setGameState('pet');
                  }}
                  className="w-full text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all bg-gradient-to-r from-yellow-400 to-orange-400 text-lg"
                >
                  👫 Best Friends Mode
                  <div className="text-sm font-normal mt-1">Strengthen your friendship</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'pet') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl p-4 mb-4 shadow-lg">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-purple-600">Hello, {currentPlayer}!</h2>
                <p className="text-sm text-gray-600">
                  {relationshipMode === 'friends' && '👫 Best Friends Mode'}
                  {relationshipMode === 'couples' && '💕 Couples Mode'}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-yellow-600">🪙 {gameData.coins}</div>
              </div>
            </div>
          </div>

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
              <div className="text-6xl mb-2">{getPetMood()}</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{gameData.pet.name}</h3>
              <p className="text-gray-600 italic">"{getPetMessage()}"</p>
            </div>
          </div>

          {/* Primary Action - Conversations */}
          <div className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl p-6 mb-4 shadow-lg text-white">
            <h3 className="text-2xl font-bold mb-2 text-center">💬 Start a Conversation</h3>
            <p className="text-center mb-4 opacity-90">Build your bond through meaningful conversations</p>
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
    // Set up checkers board
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if ((row + col) % 2 === 1) {
          if (row < 3) {
            board[row][col] = { type: 'red', king: false };
          } else if (row > 4) {
            board[row][col] = { type: 'black', king: false };
          }
        }
      }
    }
    setCheckersBoard(board);
    setCheckersPlayer('red');
    setCheckersSelected(null);
    setCheckersWinner(null);
  };

  const initializeMiniGolf = () => {
    setGolfHole(1);
    setGolfScore(0);
    setGolfStrokes(0);
    setGolfBallPos({ x: 50, y: 50 });
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
  const initializeChess = () => {
    const board = Array(8).fill(null).map(() => Array(8).fill(null));
    // Place pieces - using Unicode chess symbols
    const blackPieces = ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'];
    const whitePieces = ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖'];
    for (let i = 0; i < 8; i++) {
      board[0][i] = { type: blackPieces[i], color: 'black' };
      board[1][i] = { type: '♟', color: 'black' };
      board[6][i] = { type: '♙', color: 'white' };
      board[7][i] = { type: whitePieces[i], color: 'white' };
    }
    setChessBoard(board);
    setChessCurrentPlayer('white');
    setChessSelectedSquare(null);
    setChessGameOver(false);
    setChessWinner(null);
  };

  const handleChessSquareClick = (row, col) => {
    if (chessGameOver || !chessBoard) return;
    const square = chessBoard[row][col];
    
    if (chessSelectedSquare) {
      const [selRow, selCol] = chessSelectedSquare;
      const selectedPiece = chessBoard[selRow][selCol];
      
      // Simple move validation - allow any move to any empty square or capture
      if (selectedPiece && selectedPiece.color === chessCurrentPlayer) {
        const newBoard = chessBoard.map(r => [...r]);
        newBoard[row][col] = selectedPiece;
        newBoard[selRow][selCol] = null;
        setChessBoard(newBoard);
        setChessSelectedSquare(null);
        setChessCurrentPlayer(chessCurrentPlayer === 'white' ? 'black' : 'white');
        
        // Simple check for game end (checkmate simulation - check if king is captured)
        if (selectedPiece.type === '♚' || selectedPiece.type === '♔') {
          setChessGameOver(true);
          setChessWinner(chessCurrentPlayer);
          const coinsEarned = 100;
          const verse = awardBibleVerse(true);
          setGameData(prev => ({
            ...prev,
            coins: prev.coins + coinsEarned,
            gamesWon: prev.gamesWon + 1,
            pet: { ...prev.pet, happiness: Math.min(100, prev.pet.happiness + 15) },
            sharedProgress: Math.min(100, prev.sharedProgress + 15)
          }));
          if (verse) {
            setTimeout(() => {
              alert(`🎉 Checkmate! Bible Verse Prize!\n\n"${verse.verse}"\n${verse.reference}\n\nReflect: ${HUMILITY_REFLECTIONS[Math.floor(Math.random() * HUMILITY_REFLECTIONS.length)]}`);
            }, 100);
          }
        }
      } else {
        setChessSelectedSquare(null);
      }
    } else if (square && square.color === chessCurrentPlayer) {
      setChessSelectedSquare([row, col]);
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
      <div className="min-h-screen bg-gradient-to-br from-orange-200 via-red-200 to-pink-200 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-6 mb-4 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-orange-600">🎲 Board Games</h2>
              <button onClick={() => setGameState('pet')}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-600">
                ← Back
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl p-4 sm:p-6">
                <h3 className="text-xl sm:text-2xl font-bold mb-2">❌ Tic-Tac-Toe</h3>
                <p className="text-gray-600 mb-4 text-sm">Classic 3x3 strategy game. Win to earn 30 coins!</p>
                <button onClick={() => {
                  initializeTicTacToe();
                  setGameState('ticTacToe');
                }}
                  className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold active:bg-blue-600 min-h-[48px]">
                  Play Tic-Tac-Toe
                </button>
              </div>

              <div className="bg-gradient-to-br from-red-100 to-yellow-100 rounded-xl p-4 sm:p-6">
                <h3 className="text-xl sm:text-2xl font-bold mb-2">🔴 Connect 4</h3>
                <p className="text-gray-600 mb-4 text-sm">Drop pieces and connect 4 in a row. Win to earn 50 coins!</p>
                <button onClick={() => {
                  initializeConnect4();
                  setGameState('connect4');
                }}
                  className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold active:bg-red-600 min-h-[48px]">
                  Play Connect 4
                </button>
              </div>

              <div className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl p-4 sm:p-6">
                <h3 className="text-xl sm:text-2xl font-bold mb-2">♔ Chess</h3>
                <p className="text-gray-600 mb-4 text-sm">Classic strategy game. Checkmate to win!</p>
                <button onClick={() => {
                  initializeChess();
                  setGameState('chess');
                }}
                  className="w-full bg-amber-600 text-white py-3 rounded-lg font-semibold active:bg-amber-700 min-h-[48px]">
                  Play Chess
                </button>
              </div>

              <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl p-4 sm:p-6">
                <h3 className="text-xl sm:text-2xl font-bold mb-2">⚫ Checkers</h3>
                <p className="text-gray-600 mb-4 text-sm">Jump pieces and capture all opponents!</p>
                <button onClick={() => {
                  initializeCheckers();
                  setGameState('checkers');
                }}
                  className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold active:bg-purple-700 min-h-[48px]">
                  Play Checkers
                </button>
              </div>

              <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl p-4 sm:p-6">
                <h3 className="text-xl sm:text-2xl font-bold mb-2">⛳ Mini Golf</h3>
                <p className="text-gray-600 mb-4 text-sm">Sink the ball in as few strokes as possible!</p>
                <button onClick={() => {
                  initializeMiniGolf();
                  setGameState('miniGolf');
                }}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold active:bg-green-700 min-h-[48px]">
                  Play Mini Golf
                </button>
              </div>

              <div className="bg-gradient-to-br from-indigo-100 to-blue-100 rounded-xl p-4 sm:p-6">
                <h3 className="text-xl sm:text-2xl font-bold mb-2">📝 Word Games</h3>
                <p className="text-gray-600 mb-4 text-sm">Hangman, Word Scramble, and more!</p>
                <button onClick={() => {
                  setGameState('wordGames');
                }}
                  className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold active:bg-indigo-700 min-h-[48px]">
                  Play Word Games
                </button>
              </div>
            </div>

            <div className="border-t-2 border-gray-300 pt-4 sm:pt-6">
              <h3 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6">🎴 Card Games</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-xl p-4 sm:p-6">
                  <h3 className="text-2xl font-bold mb-2">Never Have I Ever</h3>
                  <p className="text-gray-600 mb-4">Reveal secrets and learn about each other! Play to bond and earn coins!</p>
                  <button onClick={() => {
                    setNeverHaveIEverIndex(0);
                    setGameState('neverHaveIEver');
                  }}
                    className="w-full bg-pink-500 text-white py-3 rounded-lg font-semibold hover:bg-pink-600">
                    Play Never Have I Ever
                  </button>
                </div>

                <div className="bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl p-4 sm:p-6">
                  <h3 className="text-2xl font-bold mb-2">💕 Relationship Explorer</h3>
                  <p className="text-gray-600 mb-4">Deep questions to explore your relationship, preferences, and connect deeper!</p>
                  <button onClick={() => {
                    setRelationshipExplorerIndex(0);
                    setGameState('relationshipExplorer');
                  }}
                    className="w-full bg-purple-500 text-white py-3 rounded-lg font-semibold hover:bg-purple-600">
                    Explore Relationship
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
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
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-200 via-orange-200 to-yellow-200 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-amber-700">♔ Chess</h2>
              <button onClick={() => setGameState('boardGames')}
                className="bg-gray-500 text-white px-3 py-2 rounded-lg font-semibold hover:bg-gray-600 text-sm">
                ← Back
              </button>
            </div>

            {chessGameOver ? (
              <div className="text-center mb-4">
                <div className="text-2xl sm:text-3xl font-bold mb-2">
                  {chessWinner === 'white' ? 'White Wins! ♔' : 'Black Wins! ♚'} Checkmate!
                </div>
                <div className="text-green-600 font-semibold text-sm sm:text-base mb-2">+100 Coins & Bible Verse Earned! 🪙✨</div>
                <p className="text-gray-600 text-sm mb-4">
                  {HUMILITY_REFLECTIONS[Math.floor(Math.random() * HUMILITY_REFLECTIONS.length)]}
                </p>
                <button onClick={initializeChess}
                  className="mt-4 bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold active:bg-amber-700 min-h-[48px]">
                  Play Again
                </button>
              </div>
            ) : (
              <div className="text-center mb-4">
                <div className="text-lg sm:text-xl font-semibold">
                  {chessCurrentPlayer === 'white' ? '⚪ White' : '⚫ Black'}'s Turn
                </div>
                <p className="text-sm text-gray-600 mt-2">Click a piece to select, then click destination square</p>
              </div>
            )}

            <div className="bg-amber-100 rounded-lg p-2 sm:p-4 overflow-x-auto">
              <div className="inline-block min-w-max mx-auto">
                <div className="grid grid-cols-8 gap-1">
                  {chessBoard && chessBoard.map((row, rowIndex) => 
                    row.map((cell, colIndex) => {
                      const isSelected = chessSelectedSquare && chessSelectedSquare[0] === rowIndex && chessSelectedSquare[1] === colIndex;
                      const isLight = (rowIndex + colIndex) % 2 === 0;
                      return (
                        <button
                          key={`${rowIndex}-${colIndex}`}
                          onClick={() => handleChessSquareClick(rowIndex, colIndex)}
                          disabled={chessGameOver}
                          className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-2xl sm:text-3xl font-bold transition-all ${
                            isSelected ? 'bg-blue-500 ring-4 ring-blue-300' :
                            isLight ? 'bg-amber-100 hover:bg-amber-200' : 'bg-amber-800 hover:bg-amber-700'
                          } ${chessGameOver ? 'opacity-50' : 'cursor-pointer'}`}
                        >
                          {cell ? cell.type : ''}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
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
    const questions = relationshipExplorerQuestions[relationshipMode] || relationshipExplorerQuestions.friends;
    const currentQuestion = questions[relationshipExplorerIndex % questions.length];

    const nextQuestion = () => {
      setRelationshipExplorerIndex(prev => {
        const newIndex = (prev + 1) % questions.length;
        if (newIndex === 0) {
          // Completed a round - update relationship progress
          setGameData(prev => {
            const newProgress = Math.min(100, prev.relationshipProgress + 8);
            const newBondLevel = Math.floor(newProgress / 20) + 1;
            return {
              ...prev,
              coins: prev.coins + 30,
              conversationsCompleted: prev.conversationsCompleted + 1,
              relationshipProgress: newProgress,
              bondLevel: newBondLevel,
              pet: { ...prev.pet, happiness: Math.min(100, prev.pet.happiness + 8) },
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
      <div className="min-h-screen bg-gradient-to-br from-pink-300 via-purple-300 to-indigo-300 p-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl p-4 mb-4 shadow-lg">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{score}</div>
                <div className="text-xs text-gray-600">Score</div>
                <div className="text-xs text-green-600">Goal: {targetScore}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{moves}</div>
                <div className="text-xs text-gray-600">Moves</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">x{combo > 0 ? Math.min(combo, 5) : 1}</div>
                <div className="text-xs text-gray-600">Combo</div>
              </div>
            </div>

            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-gradient-to-r from-pink-500 to-purple-500 h-3 rounded-full transition-all"
                  style={{ width: `${Math.min((score / targetScore) * 100, 100)}%` }}></div>
              </div>
            </div>

            <div className="text-xs text-gray-600 text-center mb-4">
              💕 Match 3 or more colors to score points! Perfect for relaxing and bonding!
            </div>
            
            <div className="bg-gray-100 rounded-xl p-1 sm:p-2 mb-4 overflow-x-auto">
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
                          className={`w-10 h-10 sm:w-11 sm:h-11 m-0.5 sm:m-1 text-lg sm:text-xl rounded-lg transition-all duration-200 active:scale-95 ${
                            isAnimating
                              ? 'bg-pink-400 scale-125 animate-pulse'
                              : isSelected
                              ? 'bg-pink-300 scale-110 shadow-lg ring-2 ring-pink-500'
                              : cell === '💫'
                              ? 'bg-gray-300 opacity-50'
                              : 'bg-white active:bg-gray-50 active:scale-105'
                          } ${animating && !isSelected ? 'opacity-75' : ''}`}
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
                className="bg-gray-500 text-white py-3 rounded-xl font-semibold active:bg-gray-600 transition-all">
                ← Back
              </button>
              <button onClick={completePuzzle}
                className="bg-pink-500 text-white py-3 rounded-xl font-semibold active:bg-pink-600 flex items-center justify-center gap-2 transition-all">
                <Trophy size={20} /> {score >= targetScore ? 'Victory! 💕' : 'End'}
              </button>
            </div>
          </div>
        </div>
      </div>
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
      <div className="min-h-screen bg-gradient-to-br from-red-200 via-orange-200 to-pink-200 p-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-red-600">🧱 Tetris</h2>
              <button onClick={() => setGameState('brickGames')}
                className="bg-gray-500 text-white px-3 py-2 rounded-lg font-semibold active:bg-gray-600 text-sm">
                ← Back
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4 text-center">
              <div>
                <div className="text-xl font-bold text-purple-600">{tetrisScore}</div>
                <div className="text-xs text-gray-600">Score</div>
              </div>
              <div>
                <div className="text-xl font-bold text-blue-600">{tetrisLevel}</div>
                <div className="text-xs text-gray-600">Level</div>
              </div>
              <div>
                <div className="text-xl font-bold text-green-600">{tetrisLines}</div>
                <div className="text-xs text-gray-600">Lines</div>
              </div>
            </div>

            {tetrisGameOver ? (
              <div className="text-center mb-4 p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold mb-2">Game Over!</div>
                <div className="text-green-600 font-semibold mb-4">+{Math.floor(tetrisScore / 10)} Coins! 🪙</div>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={initializeTetris}
                    className="bg-blue-500 text-white py-2 rounded-lg font-semibold active:bg-blue-600">
                    Play Again
                  </button>
                  <button onClick={completeGame}
                    className="bg-green-500 text-white py-2 rounded-lg font-semibold active:bg-green-600">
                    Collect Rewards
                  </button>
                </div>
              </div>
            ) : (
              <>
                {tetrisPaused && (
                  <div className="text-center mb-4 p-4 bg-yellow-50 rounded-lg">
                    <div className="text-xl font-bold">⏸ Paused</div>
                  </div>
                )}
                <div className="bg-gray-900 rounded-lg p-2 mb-4 mx-auto" style={{ width: 'fit-content' }}>
                  {displayBoard.map((row, i) => (
                    <div key={i} className="flex">
                  {row.map((cell, j) => (
                        <div
                          key={`${i}-${j}`}
                          className="w-6 h-6 sm:w-7 sm:h-7 border border-gray-700"
                          style={{ backgroundColor: cell || '#111' }}
                        />
                      ))}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-2 mb-2">
                  <button onClick={() => moveTetrisPiece('left')}
                    className="bg-blue-500 text-white py-3 rounded-lg font-bold active:bg-blue-600 min-h-[48px]">
                    ←
                  </button>
                  <button onClick={() => moveTetrisPiece('rotate')}
                    className="bg-purple-500 text-white py-3 rounded-lg font-bold active:bg-purple-600 min-h-[48px]">
                    ↻
                  </button>
                  <button onClick={() => moveTetrisPiece('right')}
                    className="bg-blue-500 text-white py-3 rounded-lg font-bold active:bg-blue-600 min-h-[48px]">
                    →
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => moveTetrisPiece('down')}
                    className="bg-orange-500 text-white py-3 rounded-lg font-bold active:bg-orange-600 min-h-[48px]">
                    ↓ Down
                  </button>
                  <button onClick={() => setTetrisPaused(!tetrisPaused)}
                    className="bg-yellow-500 text-white py-3 rounded-lg font-bold active:bg-yellow-600 min-h-[48px]">
                    ⏸ {tetrisPaused ? 'Resume' : 'Pause'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'snake') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-200 via-teal-200 to-blue-200 p-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-green-600">🐍 Snake</h2>
              <button onClick={() => setGameState('brickGames')}
                className="bg-gray-500 text-white px-3 py-2 rounded-lg font-semibold active:bg-gray-600 text-sm">
                ← Back
              </button>
            </div>
            <div className="text-center p-8 bg-gray-100 rounded-lg mb-4">
              <p className="text-gray-600 mb-4">Snake game coming soon!</p>
              <p className="text-sm text-gray-500">This classic game will be available in the next update.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'brickbreaker') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-200 via-indigo-200 to-purple-200 p-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-blue-600">🎾 Brick Breaker</h2>
              <button onClick={() => setGameState('brickGames')}
                className="bg-gray-500 text-white px-3 py-2 rounded-lg font-semibold active:bg-gray-600 text-sm">
                ← Back
              </button>
            </div>
            <div className="text-center p-8 bg-gray-100 rounded-lg mb-4">
              <p className="text-gray-600 mb-4">Brick Breaker game coming soon!</p>
              <p className="text-sm text-gray-500">This classic game will be available in the next update.</p>
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
      : relationshipMode === 'family'
      ? ['FAMILY', 'HOME', 'LOVE', 'CARE', 'UNITED']
      : ['FRIEND', 'FUN', 'LAUGH', 'JOY', 'BOND'];
    
    const initializeWordSearch = () => {
      const gridSize = 10;
      const grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(''));
      
      // Place words
      words.forEach(word => {
        const direction = Math.random() > 0.5 ? 'horizontal' : 'vertical';
        const row = Math.floor(Math.random() * (gridSize - word.length));
        const col = Math.floor(Math.random() * (gridSize - word.length));
        
        for (let i = 0; i < word.length; i++) {
          if (direction === 'horizontal') {
            grid[row][col + i] = word[i];
          } else {
            grid[row + i][col] = word[i];
          }
        }
      });
      
      // Fill empty cells
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
          if (!grid[i][j]) {
            grid[i][j] = letters[Math.floor(Math.random() * letters.length)];
          }
        }
      }
      
      setWordGrid(grid);
      setWordFound([]);
    };

    if (wordGrid.length === 0) initializeWordSearch();

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-200 via-emerald-200 to-teal-200 p-4">
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
              <p className="text-sm font-semibold mb-2">Find these words:</p>
              <div className="flex flex-wrap gap-2">
                {words.map((word, i) => (
                  <span key={i} className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    wordFound.includes(word) ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {word}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-10 gap-1 mb-4 bg-gray-100 p-2 rounded-lg">
              {wordGrid.map((row, i) => 
                row.map((cell, j) => (
                  <div
                    key={`${i}-${j}`}
                    className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded flex items-center justify-center text-sm sm:text-base font-bold border border-gray-300"
                    >
                      {cell}
                  </div>
                ))
              )}
            </div>

            <div className="text-sm text-gray-600 text-center mb-4">
              💡 Word Search - Find all the words! (Interactive version coming soon)
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

  // Jigsaw Puzzle
  if (gameState === 'jigsaw') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-200 via-orange-200 to-red-200 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-yellow-600">🧩 Jigsaw Puzzle</h2>
              <button onClick={() => setGameState('puzzleGames')}
                className="bg-gray-500 text-white px-3 py-2 rounded-lg font-semibold active:bg-gray-600 text-sm">
                ← Back
              </button>
            </div>
            <div className="text-center p-8 bg-gray-100 rounded-lg mb-4">
              <p className="text-gray-600 mb-4">Jigsaw Puzzle coming soon!</p>
              <p className="text-sm text-gray-500">Beautiful picture puzzles will be available in the next update.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Logic Puzzle
  if (gameState === 'logicPuzzle') {
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
            <div className="text-center p-8 bg-gray-100 rounded-lg mb-4">
              <p className="text-gray-600 mb-4">Logic Puzzles coming soon!</p>
              <p className="text-sm text-gray-500">Brain-teasing puzzles will be available in the next update.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Escape Room
  if (gameState === 'escapeRoom') {
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
            <div className="text-center p-8 bg-gray-100 rounded-lg mb-4">
              <p className="text-gray-600 mb-4">Escape Room puzzles coming soon!</p>
              <p className="text-sm text-gray-500">Mystery and escape room style puzzles will be available in the next update.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Pac-Man Game
  if (gameState === 'pacman') {
    const pacmanMaze = Array(28).fill(null).map(() => Array(31).fill(0));
    
    // Simple maze pattern
    for (let i = 0; i < 28; i++) {
      for (let j = 0; j < 31; j++) {
        if (i === 0 || i === 27 || j === 0 || j === 30) {
          pacmanMaze[i][j] = 1; // Walls
        } else if ((i === 1 || i === 26) && j > 0 && j < 30) {
          pacmanMaze[i][j] = 2; // Dots
        } else if (i > 1 && i < 26 && (j === 1 || j === 29)) {
          pacmanMaze[i][j] = 2;
        } else if (i % 3 === 0 && j % 5 === 0) {
          pacmanMaze[i][j] = 2;
        }
      }
    }

    const movePacman = () => {
      setPacmanPos(current => {
        let newPos = { ...current };
        if (pacmanDirection === 'up') newPos.y--;
        else if (pacmanDirection === 'down') newPos.y++;
        else if (pacmanDirection === 'left') newPos.x--;
        else if (pacmanDirection === 'right') newPos.x++;
        
        // Check bounds
        if (newPos.x < 0) newPos.x = 30;
        if (newPos.x > 30) newPos.x = 0;
        if (newPos.y < 0 || newPos.y > 27) return current;
        
        // Check if dot collected
        if (pacmanMaze[newPos.y][newPos.x] === 2) {
          setPacmanScore(prev => prev + 10);
        }
        
        return newPos;
      });
    };

    const completePacman = () => {
      const coinsEarned = Math.floor(pacmanScore / 10);
      setGameData(prev => ({
        ...prev,
        coins: prev.coins + coinsEarned,
        pet: { ...prev.pet, happiness: Math.min(100, prev.pet.happiness + 5) },
        sharedProgress: Math.min(100, prev.sharedProgress + 5)
      }));
      setGameState('arcadeGames');
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-200 via-orange-200 to-red-200 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-yellow-600">👻 Pac-Man</h2>
              <button onClick={() => setGameState('arcadeGames')}
                className="bg-gray-500 text-white px-3 py-2 rounded-lg font-semibold active:bg-gray-600 text-sm">
                ← Back
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4 text-center">
              <div>
                <div className="text-xl font-bold text-yellow-600">{pacmanScore}</div>
                <div className="text-xs text-gray-600">Score</div>
              </div>
              <div>
                <div className="text-xl font-bold text-red-600">{pacmanLives}</div>
                <div className="text-xs text-gray-600">Lives</div>
              </div>
              <div>
                <div className="text-xl font-bold text-blue-600">Level {pacmanLevel}</div>
                <div className="text-xs text-gray-600">Level</div>
              </div>
            </div>

            <div className="bg-black rounded-lg p-2 mb-4" style={{ width: 'fit-content', margin: '0 auto' }}>
              {pacmanMaze.map((row, i) => (
                <div key={i} className="flex">
                  {row.map((cell, j) => (
                    <div
                      key={`${i}-${j}`}
                      className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center"
                    >
                      {pacmanPos.x === j && pacmanPos.y === i ? (
                        <span className="text-yellow-400 text-xl">👻</span>
                      ) : cell === 1 ? (
                        <span className="text-blue-600">█</span>
                      ) : cell === 2 ? (
                        <span className="text-yellow-300 text-xs">•</span>
                      ) : (
                        ' '
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-4 gap-2 mb-2">
              <div></div>
              <button onClick={() => setPacmanDirection('up')}
                className="bg-yellow-500 text-white py-3 rounded-lg font-bold active:bg-yellow-600 min-h-[48px]">
                ↑
              </button>
              <div></div>
              <div></div>
              <button onClick={() => setPacmanDirection('left')}
                className="bg-yellow-500 text-white py-3 rounded-lg font-bold active:bg-yellow-600 min-h-[48px]">
                ←
              </button>
              <button onClick={() => setPacmanDirection('down')}
                className="bg-yellow-500 text-white py-3 rounded-lg font-bold active:bg-yellow-600 min-h-[48px]">
                ↓
              </button>
              <button onClick={() => setPacmanDirection('right')}
                className="bg-yellow-500 text-white py-3 rounded-lg font-bold active:bg-yellow-600 min-h-[48px]">
                →
            </button>
            </div>

            <button onClick={completePacman}
              className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold active:bg-green-600 min-h-[48px]">
              Collect Rewards (+{Math.floor(pacmanScore / 10)} coins)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Jetpack Joyride Game
  if (gameState === 'jetpack') {

    const completeJetpack = () => {
      const coinsEarned = Math.floor(jetpackScore / 5);
      setGameData(prev => ({
        ...prev,
        coins: prev.coins + coinsEarned,
        pet: { ...prev.pet, happiness: Math.min(100, prev.pet.happiness + 5) },
        sharedProgress: Math.min(100, prev.sharedProgress + 5)
      }));
      setGameState('arcadeGames');
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-200 via-indigo-200 to-purple-200 p-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-blue-600">🚀 Jetpack Joyride</h2>
              <button onClick={() => setGameState('arcadeGames')}
                className="bg-gray-500 text-white px-3 py-2 rounded-lg font-semibold active:bg-gray-600 text-sm">
                ← Back
              </button>
            </div>

            <div className="text-center mb-4">
              <div className="text-2xl font-bold text-blue-600">Score: {jetpackScore}</div>
              <div className="text-sm text-gray-600">Distance: {jetpackScore}m</div>
            </div>

            {jetpackGameOver ? (
              <div className="text-center p-6 bg-red-50 rounded-lg mb-4">
                <div className="text-2xl font-bold mb-2">Game Over! 💥</div>
                <div className="text-green-600 font-semibold mb-4">+{Math.floor(jetpackScore / 5)} Coins Earned! 🪙</div>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => {
                    setJetpackScore(0);
                    setJetpackY(200);
                    setJetpackObstacles([]);
                    setJetpackGameOver(false);
                  }}
                    className="bg-blue-500 text-white py-2 rounded-lg font-semibold active:bg-blue-600">
                    Play Again
                  </button>
                  <button onClick={completeJetpack}
                    className="bg-green-500 text-white py-2 rounded-lg font-semibold active:bg-green-600">
                    Collect Rewards
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="relative bg-gradient-to-b from-sky-400 to-blue-500 rounded-lg h-96 mb-4 overflow-hidden border-4 border-gray-800">
                  {/* Player */}
                  <div
                    className="absolute left-12 transition-all duration-75"
                    style={{ top: `${jetpackY}px` }}
                  >
                    <div className="text-4xl">🚀</div>
                  </div>

                  {/* Obstacles */}
                  {jetpackObstacles.map((obs, i) => (
                    <div key={i}>
                      <div
                        className="absolute bg-gray-800 w-12"
                        style={{ left: `${obs.x}px`, top: '0px', height: `${obs.yTop}px` }}
                      />
                      <div
                        className="absolute bg-gray-800 w-12"
                        style={{ left: `${obs.x}px`, bottom: '0px', height: `${400 - obs.yBottom}px` }}
                      />
                    </div>
                  ))}
                </div>

                <div className="text-center mb-4">
                  <p className="text-sm text-gray-600 mb-2">Tap/Hold to fly up! Release to fall.</p>
                  <button
                    onMouseDown={() => handleJetpackKey(true)}
                    onMouseUp={() => handleJetpackKey(false)}
                    onTouchStart={() => handleJetpackKey(true)}
                    onTouchEnd={() => handleJetpackKey(false)}
                    className="w-full bg-blue-500 text-white py-4 rounded-lg font-bold active:bg-blue-600 text-lg min-h-[56px]"
                  >
                    🚀 FLY UP
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Checkers Game
  if (gameState === 'checkers') {
    if (checkersBoard.length === 0) initializeCheckers();

    const handleCheckersClick = (row, col) => {
      if (checkersWinner) return;
      
      if (!checkersSelected) {
        if (checkersBoard[row][col] && checkersBoard[row][col].type === checkersPlayer) {
          setCheckersSelected({ row, col });
        }
      } else {
        // Move piece
        const newBoard = checkersBoard.map(r => [...r]);
        const piece = newBoard[checkersSelected.row][checkersSelected.col];
        const rowDiff = row - checkersSelected.row;
        const colDiff = Math.abs(col - checkersSelected.col);
        
        if (Math.abs(rowDiff) === 1 && colDiff === 1) {
          // Regular move
          newBoard[row][col] = piece;
          newBoard[checkersSelected.row][checkersSelected.col] = null;
          setCheckersBoard(newBoard);
          setCheckersSelected(null);
          setCheckersPlayer(checkersPlayer === 'red' ? 'black' : 'red');
        } else if (Math.abs(rowDiff) === 2 && colDiff === 2) {
          // Jump move
          const jumpedRow = checkersSelected.row + rowDiff / 2;
          const jumpedCol = checkersSelected.col + (col - checkersSelected.col) / 2;
          if (newBoard[jumpedRow][jumpedCol] && newBoard[jumpedRow][jumpedCol].type !== checkersPlayer) {
            newBoard[row][col] = piece;
            newBoard[checkersSelected.row][checkersSelected.col] = null;
            newBoard[jumpedRow][jumpedCol] = null;
            setCheckersBoard(newBoard);
            setCheckersSelected(null);
            setCheckersPlayer(checkersPlayer === 'red' ? 'black' : 'red');
          }
        } else {
          setCheckersSelected(null);
        }
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-200 via-pink-200 to-indigo-200 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-purple-600">⚫ Checkers</h2>
              <button onClick={() => setGameState('boardGames')}
                className="bg-gray-500 text-white px-3 py-2 rounded-lg font-semibold active:bg-gray-600 text-sm">
                ← Back
              </button>
            </div>

            <div className="text-center mb-4">
              <div className="text-lg font-semibold">
                {checkersPlayer === 'red' ? '🔴 Red' : '⚫ Black'}'s Turn
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-2 mb-4 mx-auto" style={{ width: 'fit-content' }}>
              {checkersBoard.map((row, i) => (
                <div key={i} className="flex">
                  {row.map((cell, j) => (
                    <button
                      key={`${i}-${j}`}
                      onClick={() => handleCheckersClick(i, j)}
                      className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center ${
                        (i + j) % 2 === 0 ? 'bg-amber-200' : 'bg-amber-600'
                      } ${checkersSelected?.row === i && checkersSelected?.col === j ? 'ring-4 ring-blue-500' : ''} active:scale-95`}
                    >
                      {cell ? (
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${
                          cell.type === 'red' ? 'bg-red-600' : 'bg-gray-800'
                        } ${cell.king ? 'ring-2 ring-yellow-400' : ''}`}></div>
                      ) : null}
                    </button>
                  ))}
                </div>
              ))}
            </div>

            <button onClick={initializeCheckers}
              className="w-full bg-purple-500 text-white py-3 rounded-lg font-semibold active:bg-purple-600 min-h-[48px]">
              New Game
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Mini Golf Game
  if (gameState === 'miniGolf') {
    if (golfHole === 1 && golfScore === 0 && golfStrokes === 0) initializeMiniGolf();

    const takeStroke = () => {
      setGolfStrokes(prev => prev + 1);
      // Simple mini golf - ball moves toward hole
      setGolfBallPos(prev => ({
        x: prev.x + (Math.random() - 0.5) * 20,
        y: prev.y + (Math.random() - 0.5) * 20
      }));
      
      // Check if ball is in hole (simplified)
      if (Math.random() < 0.1) {
        const totalStrokes = golfStrokes + 1;
        setGolfScore(prev => prev + totalStrokes);
        setGolfHole(prev => prev + 1);
        setGolfStrokes(0);
        setGolfBallPos({ x: 50, y: 50 });
        
        if (golfHole >= 9) {
          const coinsEarned = Math.floor(100 / golfScore);
          setGameData(prev => ({
            ...prev,
            coins: prev.coins + coinsEarned,
            gamesWon: prev.gamesWon + 1,
            pet: { ...prev.pet, happiness: Math.min(100, prev.pet.happiness + 5) }
          }));
        }
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-200 via-emerald-200 to-teal-200 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-green-600">⛳ Mini Golf</h2>
              <button onClick={() => setGameState('boardGames')}
                className="bg-gray-500 text-white px-3 py-2 rounded-lg font-semibold active:bg-gray-600 text-sm">
                ← Back
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4 text-center">
              <div>
                <div className="text-xl font-bold text-green-600">Hole {golfHole}/9</div>
              </div>
              <div>
                <div className="text-xl font-bold text-blue-600">{golfStrokes}</div>
                <div className="text-xs text-gray-600">Strokes</div>
              </div>
              <div>
                <div className="text-xl font-bold text-purple-600">{golfScore}</div>
                <div className="text-xs text-gray-600">Total Score</div>
              </div>
            </div>

            <div className="relative bg-gradient-to-b from-green-400 to-green-600 rounded-lg h-64 mb-4 border-4 border-gray-800">
              {/* Hole */}
              <div className="absolute bottom-4 right-4 w-12 h-12 bg-black rounded-full border-4 border-white"></div>
              
              {/* Ball */}
              <div
                className="absolute w-6 h-6 bg-white rounded-full border-2 border-gray-800 transition-all"
                style={{ left: `${golfBallPos.x}%`, top: `${golfBallPos.y}%` }}
              >
                ⛳
              </div>
            </div>

            <button onClick={takeStroke}
              className="w-full bg-green-500 text-white py-4 rounded-lg font-bold active:bg-green-600 min-h-[56px] text-lg">
              ⛳ Take Stroke
            </button>

            {golfHole > 9 && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg text-center">
                <div className="text-xl font-bold mb-2">🎉 Course Complete!</div>
                <div className="text-green-600">Final Score: {golfScore}</div>
              </div>
            )}
          </div>
        </div>
      </div>
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
      : relationshipMode === 'family'
      ? ['FAMILY', 'HOME', 'LOVE', 'CARE', 'UNITED', 'BOND']
      : ['FRIEND', 'FUN', 'LAUGH', 'JOY', 'BOND', 'SMILE'];

    const initializeHangman = () => {
      const word = words[Math.floor(Math.random() * words.length)];
      setHangmanWord(word);
      setHangmanGuessed([]);
      setHangmanWrong(0);
    };

    if (!hangmanWord) initializeHangman();

    const handleGuess = (letter) => {
      if (hangmanGuessed.includes(letter)) return;
      
      setHangmanGuessed(prev => [...prev, letter]);
      if (!hangmanWord.includes(letter)) {
        setHangmanWrong(prev => prev + 1);
      }
    };

    const displayWord = hangmanWord.split('').map(letter => 
      hangmanGuessed.includes(letter) ? letter : '_'
    ).join(' ');

    const isWon = hangmanWord.split('').every(letter => hangmanGuessed.includes(letter));
    const isLost = hangmanWrong >= 6;

    if (isWon || isLost) {
      const coinsEarned = isWon ? 40 : 10;
      if (isWon) {
        setGameData(prev => ({
          ...prev,
          coins: prev.coins + coinsEarned,
          gamesWon: prev.gamesWon + 1,
          pet: { ...prev.pet, happiness: Math.min(100, prev.pet.happiness + 5) }
        }));
      }
    }

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
      : relationshipMode === 'family'
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
