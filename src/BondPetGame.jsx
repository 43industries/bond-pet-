import React, { useState, useEffect } from 'react';
import { Heart, Star, Gift, Sparkles, ShoppingBag, Zap, Trophy, Gamepad2 } from 'lucide-react';

const BondPetGame = () => {
  const [gameState, setGameState] = useState('welcome');
  const [playerName, setPlayerName] = useState('');
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [relationshipMode, setRelationshipMode] = useState(null);
  const [selectedPetType, setSelectedPetType] = useState(null);
  const [gameData, setGameData] = useState({
    pet: { name: 'Buddy', type: null, happiness: 50, level: 1 },
    inventory: [],
    coins: 0,
    puzzlesCompleted: 0,
    sharedProgress: 0
  });

  const petTypes = [
    { id: 'dog', name: 'Dog', emoji: '🐶', happy: '🐶', neutral: '🐕', sad: '😢', excited: '😎' },
    { id: 'cat', name: 'Cat', emoji: '🐱', happy: '😸', neutral: '🐈', sad: '😿', excited: '😻' },
    { id: 'bunny', name: 'Bunny', emoji: '🐰', happy: '😊', neutral: '🐇', sad: '😔', excited: '🤗' },
    { id: 'panda', name: 'Panda', emoji: '🐼', happy: '😊', neutral: '🐾', sad: '😟', excited: '🤩' },
    { id: 'bear', name: 'Bear', emoji: '🐻', happy: '😊', neutral: '🧸', sad: '😞', excited: '🤗' },
    { id: 'fox', name: 'Fox', emoji: '🦊', happy: '😊', neutral: '🦊', sad: '😕', excited: '😎' },
    { id: 'penguin', name: 'Penguin', emoji: '🐧', happy: '😊', neutral: '🐧', sad: '😢', excited: '🤩' },
    { id: 'unicorn', name: 'Unicorn', emoji: '🦄', happy: '😊', neutral: '🦄', sad: '😔', excited: '✨' }
  ];

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
  
  // Card games states
  const [neverHaveIEverIndex, setNeverHaveIEverIndex] = useState(0);
  const [relationshipExplorerIndex, setRelationshipExplorerIndex] = useState(0);

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

  const completePuzzle = () => {
    const success = score >= targetScore;
    const coinsEarned = success ? Math.floor(score / 10) + 50 : Math.floor(score / 20);
    
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

  const getPetMessage = () => {
    const msgs = {
      friends: ["Let's go on an adventure! 🎮", "You two are awesome!", "Pizza time? 🍕", "Squad goals! ✨"],
      couples: ["You two are adorable! 💕", "Love is in the air! 🌹", "Date night ideas? ✨", "Someone's thinking of you 💝"],
      family: ["Family time is the best! 🏠", "I'm proud of you! ⭐", "Let's make memories! 📷", "Home sweet home! 💛"]
    };
    return msgs[relationshipMode]?.[Math.floor(Math.random() * 4)] || msgs.friends[0];
  };


  if (gameState === 'petSelection') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 p-8 flex items-center justify-center">
        <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-purple-600 mb-2">Choose Your Pet! 🐾</h2>
            <p className="text-gray-600">Pick a pet companion for your journey together</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {petTypes.map((pet) => (
              <button
                key={pet.id}
                onClick={() => {
                  setSelectedPetType(pet.id);
                  setGameData(prev => ({
                    ...prev,
                    pet: { ...prev.pet, type: pet.id, name: pet.name }
                  }));
                  setGameState('pet');
                }}
                className={`p-4 sm:p-6 rounded-xl border-4 transition-all active:scale-95 min-h-[120px] ${
                  selectedPetType === pet.id
                    ? 'border-purple-500 bg-purple-50 shadow-lg'
                    : 'border-gray-200 bg-white active:border-purple-300'
                }`}
              >
                <div className="text-5xl sm:text-6xl mb-2">{pet.emoji}</div>
                <div className="font-semibold text-gray-800 text-sm sm:text-base">{pet.name}</div>
              </button>
            ))}
          </div>

          <button
            onClick={() => setGameState('welcome')}
            className="w-full mt-6 bg-gray-400 text-white py-3 rounded-xl font-semibold hover:bg-gray-500">
            ← Back
          </button>
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
              <p className="text-sm font-semibold text-gray-700">Choose your relationship type:</p>
              {['friends', 'couples', 'family'].map((mode, idx) => (
                <button
                  key={mode}
                  onClick={() => {
                    setRelationshipMode(mode);
                    setCurrentPlayer(playerName || 'Player 1');
                    setGameState('petSelection');
                  }}
                  className={`w-full text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all ${
                    idx === 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-400' :
                    idx === 1 ? 'bg-gradient-to-r from-pink-400 to-red-400' :
                    'bg-gradient-to-r from-green-400 to-blue-400'
                  }`}
                >
                  {idx === 0 ? '👫 Best Friends Mode' : idx === 1 ? '💕 Couples Mode' : '👨‍👩‍👧 Family Mode'}
                </button>
              ))}
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
          <div className="bg-white rounded-2xl p-4 mb-4 shadow-lg">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-purple-600">Hello, {currentPlayer}!</h2>
                <p className="text-sm text-gray-600">
                  {relationshipMode === 'friends' && '👫 Best Friends Mode'}
                  {relationshipMode === 'couples' && '💕 Couples Mode'}
                  {relationshipMode === 'family' && '👨‍👩‍👧 Family Mode'}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-yellow-600">🪙 {gameData.coins}</div>
                <div className="text-sm text-gray-600">Puzzles: {gameData.puzzlesCompleted}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 mb-4 shadow-lg">
            <div className="text-center">
              <div className="text-6xl sm:text-8xl mb-4">{getPetMood()}</div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">{gameData.pet.name}</h3>
              <p className="text-gray-600 italic mb-4 text-sm sm:text-base">"{getPetMessage()}"</p>
              
              <div className="mb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Heart className="text-red-500" size={20} />
                  <span className="font-semibold">Happiness: {gameData.pet.happiness}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div className="bg-gradient-to-r from-pink-500 to-red-500 h-4 rounded-full transition-all"
                    style={{ width: `${gameData.pet.happiness}%` }}></div>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Sparkles className="text-purple-500" size={20} />
                  <span className="font-semibold">Shared Progress: {gameData.sharedProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-4 rounded-full transition-all"
                    style={{ width: `${gameData.sharedProgress}%` }}></div>
                </div>
              </div>

              {gameData.inventory.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-semibold mb-2">Your Pet's Items:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {gameData.inventory.map((item, idx) => (
                      <span key={idx} className="text-2xl">{item.icon}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <button onClick={() => setGameState('brickGames')}
              className="bg-gradient-to-r from-purple-500 to-blue-500 text-white py-4 sm:py-4 rounded-xl font-semibold active:scale-95 transition-all flex items-center justify-center gap-2 text-base sm:text-lg min-h-[56px]">
              <Star size={20} /> Brick Games
            </button>
            <button onClick={() => setGameState('boardGames')}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 sm:py-4 rounded-xl font-semibold active:scale-95 transition-all flex items-center justify-center gap-2 text-base sm:text-lg min-h-[56px]">
              <Gamepad2 size={20} /> Board Games
            </button>
            <button onClick={() => setGameState('shop')}
              className="bg-gradient-to-r from-green-500 to-teal-500 text-white py-4 sm:py-4 rounded-xl font-semibold active:scale-95 transition-all flex items-center justify-center gap-2 text-base sm:text-lg min-h-[56px]">
              <ShoppingBag size={20} /> Shop
            </button>
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
        setGameData(prev => ({
          ...prev,
          coins: prev.coins + coinsEarned,
          pet: { ...prev.pet, happiness: Math.min(100, prev.pet.happiness + 5) },
          sharedProgress: Math.min(100, prev.sharedProgress + 5)
        }));
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
          setGameData(prev => ({
            ...prev,
            coins: prev.coins + coinsEarned,
            pet: { ...prev.pet, happiness: Math.min(100, prev.pet.happiness + 8) },
            sharedProgress: Math.min(100, prev.sharedProgress + 8)
          }));
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
            
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl p-4 sm:p-6">
                <h3 className="text-xl sm:text-2xl font-bold mb-2">❌ Tic-Tac-Toe</h3>
                <p className="text-gray-600 mb-4">Classic 3x3 strategy game. Win to earn 30 coins!</p>
                <button onClick={() => {
                  initializeTicTacToe();
                  setGameState('ticTacToe');
                }}
                  className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600">
                  Play Tic-Tac-Toe
                </button>
              </div>

              <div className="bg-gradient-to-br from-red-100 to-yellow-100 rounded-xl p-4 sm:p-6">
                <h3 className="text-xl sm:text-2xl font-bold mb-2">🔴 Connect 4</h3>
                <p className="text-gray-600 mb-4 text-sm sm:text-base">Drop pieces and connect 4 in a row. Win to earn 50 coins!</p>
                <button onClick={() => {
                  initializeConnect4();
                  setGameState('connect4');
                }}
                  className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold active:bg-red-600 min-h-[48px]">
                  Play Connect 4
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

  if (gameState === 'neverHaveIEver') {
    const questions = neverHaveIEverQuestions[relationshipMode] || neverHaveIEverQuestions.friends;
    const currentQuestion = questions[neverHaveIEverIndex % questions.length];

    const nextQuestion = () => {
      setNeverHaveIEverIndex(prev => {
        const newIndex = (prev + 1) % questions.length;
        if (newIndex === 0) {
          // Completed a round
          setGameData(prev => ({
            ...prev,
            coins: prev.coins + 20,
            pet: { ...prev.pet, happiness: Math.min(100, prev.pet.happiness + 3) },
            sharedProgress: Math.min(100, prev.sharedProgress + 3)
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
              <button onClick={() => setGameState('boardGames')}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-600">
                ← Back
              </button>
            </div>

            <div className="text-center mb-6">
              <div className="text-sm text-gray-600 mb-2">
                Question {neverHaveIEverIndex + 1} of {questions.length}
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
          // Completed a round
          setGameData(prev => ({
            ...prev,
            coins: prev.coins + 30,
            pet: { ...prev.pet, happiness: Math.min(100, prev.pet.happiness + 5) },
            sharedProgress: Math.min(100, prev.sharedProgress + 5)
          }));
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
              <button onClick={() => setGameState('boardGames')}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-600">
                ← Back
              </button>
            </div>

            <div className="text-center mb-6">
              <div className="text-sm text-gray-600 mb-2">
                Question {relationshipExplorerIndex + 1} of {questions.length}
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

  // Tetris functions
  const createNewTetrisPiece = () => {
    const shapeIndex = Math.floor(Math.random() * TETRIS_SHAPES.length);
    return {
      shape: TETRIS_SHAPES[shapeIndex],
      x: Math.floor(10 / 2) - 1,
      y: 0,
      color: TETRIS_COLORS[shapeIndex]
    };
  };

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

  // Auto fall effect
  useEffect(() => {
    if (gameState === 'tetris' && !tetrisGameOver && !tetrisPaused && tetrisPiece) {
      const interval = setInterval(() => {
        moveTetrisPiece('down');
      }, tetrisFallTime);
      return () => clearInterval(interval);
    }
  }, [gameState === 'tetris', tetrisPiece, tetrisGameOver, tetrisPaused, tetrisFallTime]);

  // Keyboard controls
  useEffect(() => {
    if (gameState !== 'tetris') return;
    
    const handleKeyPress = (e) => {
      if (tetrisGameOver || tetrisPaused) return;
      if (e.key === 'ArrowLeft') moveTetrisPiece('left');
      if (e.key === 'ArrowRight') moveTetrisPiece('right');
      if (e.key === 'ArrowDown') moveTetrisPiece('down');
      if (e.key === 'ArrowUp' || e.key === ' ') moveTetrisPiece('rotate');
      if (e.key === 'p' || e.key === 'P') setTetrisPaused(!tetrisPaused);
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState === 'tetris', tetrisPiece, tetrisGameOver, tetrisPaused]);

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

  return null;
};

export default BondPetGame;
