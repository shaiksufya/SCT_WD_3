document.addEventListener('DOMContentLoaded', () => {
  // Game state
  let board = Array(9).fill(null);
  let currentPlayer = 'X';
  let gameMode = 'ai';
  let difficulty = 'medium';
  let boardSize = 3;
  let gameOver = false;
  let winner = null;
  let darkMode = false;
  let soundEnabled = true;
  let playerScore = 0;
  let aiScore = 0;
  let ties = 0;
  
  // DOM elements
  const app = document.getElementById('app');
  const gameBoard = document.getElementById('gameBoard');
  const playerIndicator = document.getElementById('playerIndicator');
  const playerScoreEl = document.getElementById('playerScore');
  const aiScoreEl = document.getElementById('aiScore');
  const tiesScoreEl = document.getElementById('tiesScore');
  const playerLabel = document.getElementById('playerLabel');
  const aiLabel = document.getElementById('aiLabel');
  const gridSizeBadge = document.getElementById('gridSizeBadge');
  const levelBadge = document.getElementById('levelBadge');
  
  // Buttons
  const soundToggle = document.getElementById('soundToggle');
  const settingsToggle = document.getElementById('settingsToggle');
  const darkModeToggle = document.getElementById('darkModeToggle');
  const newGameBtn = document.getElementById('newGameBtn');
  const resetScoresBtn = document.getElementById('resetScoresBtn');
  const saveSettingsBtn = document.getElementById('saveSettingsBtn');
  const playAgainBtn = document.getElementById('playAgainBtn');
  const closeResultBtn = document.getElementById('closeResultBtn');
  
  // Dialogs
  const settingsDialog = document.getElementById('settingsDialog');
  const resultDialog = document.getElementById('resultDialog');
  
  // Settings selects
  const boardSizeSelect = document.getElementById('boardSizeSelect');
  const gameModeSelect = document.getElementById('gameModeSelect');
  const difficultySelect = document.getElementById('difficultySelect');
  const difficultyGroup = document.getElementById('difficultyGroup');
  
  // Result message
  const resultMessage = document.getElementById('resultMessage');
  
  // Initialize the game
  initGame();
  
  // Event listeners
  soundToggle.addEventListener('click', toggleSound);
  settingsToggle.addEventListener('click', () => toggleDialog(settingsDialog));
  darkModeToggle.addEventListener('click', toggleDarkMode);
  newGameBtn.addEventListener('click', resetGame);
  resetScoresBtn.addEventListener('click', resetScores);
  saveSettingsBtn.addEventListener('click', saveSettings);
  playAgainBtn.addEventListener('click', resetGame);
  closeResultBtn.addEventListener('click', () => toggleDialog(resultDialog, false));
  
  // Initialize game board
  function initGame() {
    renderBoard();
    updateUI();
  }
  
  // Render the game board
  function renderBoard() {
    gameBoard.innerHTML = '';
    gameBoard.style.gridTemplateColumns = `repeat(${boardSize}, minmax(0, 1fr))`;
    gameBoard.style.maxWidth = `${boardSize * 80 + (boardSize - 1) * 12 + 64}px`;
    
    for (let i = 0; i < boardSize * boardSize; i++) {
      const cell = document.createElement('button');
      cell.dataset.index = i;
      cell.addEventListener('click', () => handleCellClick(i));
      
      if (board[i] === 'X') {
        cell.textContent = 'X';
        cell.classList.add('x');
      } else if (board[i] === 'O') {
        cell.textContent = 'O';
        cell.classList.add('o');
      }
      
      if (gameOver || board[i] !== null) {
        cell.disabled = true;
      }
      
      gameBoard.appendChild(cell);
    }
  }
  
  // Handle cell click
  function handleCellClick(index) {
    if (board[index] || gameOver) return;
    
    board[index] = currentPlayer;
    playSound('move');
    renderBoard();
    
    const result = checkWinner(board, boardSize);
    if (result) {
      handleGameEnd(result);
      return;
    }
    
    if (gameMode === 'ai' && currentPlayer === 'X') {
      currentPlayer = 'O';
      updateUI();
      
      setTimeout(() => {
        const aiMove = makeAIMove([...board], boardSize, difficulty);
        if (aiMove !== -1) {
          board[aiMove] = 'O';
          playSound('move');
          renderBoard();
          
          const aiResult = checkWinner(board, boardSize);
          if (aiResult) {
            handleGameEnd(aiResult);
          } else {
            currentPlayer = 'X';
            updateUI();
          }
        }
      }, 500);
    } else {
      currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
      updateUI();
    }
  }
  
  // Check for winner
  function checkWinner(board, size) {
    const lines = [];
    
    // Rows
    for (let i = 0; i < size; i++) {
      const row = [];
      for (let j = 0; j < size; j++) {
        row.push(i * size + j);
      }
      lines.push(row);
    }
    
    // Columns
    for (let i = 0; i < size; i++) {
      const col = [];
      for (let j = 0; j < size; j++) {
        col.push(j * size + i);
      }
      lines.push(col);
    }
    
    // Diagonals
    const diag1 = [];
    const diag2 = [];
    for (let i = 0; i < size; i++) {
      diag1.push(i * size + i);
      diag2.push(i * size + (size - 1 - i));
    }
    lines.push(diag1, diag2);
    
    // Check lines
    for (const line of lines) {
      const values = line.map(i => board[i]);
      if (values.every(v => v === 'X')) return 'X';
      if (values.every(v => v === 'O')) return 'O';
    }
    
    // Check for tie
    if (board.every(cell => cell !== null)) return 'tie';
    
    return null;
  }
  
  // AI move logic
  function makeAIMove(board, size, difficulty) {
    const emptyCells = board.map((cell, index) => cell === null ? index : null).filter(val => val !== null);
    
    if (emptyCells.length === 0) return -1;
    
    if (difficulty === 'easy') {
      return emptyCells[Math.floor(Math.random() * emptyCells.length)];
    }
    
    // Medium and Hard AI with minimax
    const minimax = (board, depth, isMaximizing, alpha = -Infinity, beta = Infinity) => {
      const result = checkWinner(board, size);
      
      if (result === 'O') return 10 - depth;
      if (result === 'X') return depth - 10;
      if (result === 'tie') return 0;
      
      if (difficulty === 'medium' && depth > 3) return 0;
      
      const empty = board.map((cell, index) => cell === null ? index : null).filter(val => val !== null);
      
      if (isMaximizing) {
        let maxEval = -Infinity;
        for (const index of empty) {
          board[index] = 'O';
          const eval_ = minimax(board, depth + 1, false, alpha, beta);
          board[index] = null;
          maxEval = Math.max(maxEval, eval_);
          alpha = Math.max(alpha, eval_);
          if (beta <= alpha) break;
        }
        return maxEval;
      } else {
        let minEval = Infinity;
        for (const index of empty) {
          board[index] = 'X';
          const eval_ = minimax(board, depth + 1, true, alpha, beta);
          board[index] = null;
          minEval = Math.min(minEval, eval_);
          beta = Math.min(beta, eval_);
          if (beta <= alpha) break;
        }
        return minEval;
      }
    };
    
    let bestMove = emptyCells[0];
    let bestValue = -Infinity;
    
    for (const index of emptyCells) {
      board[index] = 'O';
      const moveValue = minimax(board, 0, false);
      board[index] = null;
      
      if (moveValue > bestValue) {
        bestValue = moveValue;
        bestMove = index;
      }
    }
    
    return bestMove;
  }
  
  // Handle game end
  function handleGameEnd(result) {
    gameOver = true;
    winner = result;
    
    if (result === 'X') {
      playerScore++;
      playSound('win');
    } else if (result === 'O') {
      aiScore++;
      playSound('lose');
    } else {
      ties++;
      playSound('tie');
    }
    
    updateUI();
    showResultMessage();
    toggleDialog(resultDialog, true);
  }
  
  // Show result message
  function showResultMessage() {
    const quotes = [
      "Victory belongs to the most persevering! - Napoleon Bonaparte",
      "Success is not final, failure is not fatal! - Winston Churchill",
      "The only way to do great work is to love what you do! - Steve Jobs",
      "Don't watch the clock; do what it does. Keep going! - Sam Levenson"
    ];
    
    const loseQuotes = [
      "Better luck next time! Every master was once a disaster.",
      "Don't give up! Champions keep playing until they get it right.",
      "Try again! Success is the sum of small efforts repeated.",
      "Keep going! The only impossible journey is the one you never begin."
    ];
    
    let message = '';
    
    if (winner === 'X' && gameMode === 'ai') {
      message = `🎉 Congratulations! You Won! 🎉\n\n${quotes[Math.floor(Math.random() * quotes.length)]}`;
    } else if (winner === 'O' && gameMode === 'ai') {
      message = `😔 You Lost! 😔\n\n${loseQuotes[Math.floor(Math.random() * loseQuotes.length)]}`;
    } else if (winner === 'tie') {
      message = "🤝 It's a Tie! 🤝\n\nWell played! Great minds think alike.";
    } else {
      message = `🎉 Player ${winner} Wins! 🎉\n\n${quotes[Math.floor(Math.random() * quotes.length)]}`;
    }
    
    resultMessage.textContent = message;
  }
  
  // Reset game
  function resetGame() {
    board = Array(boardSize * boardSize).fill(null);
    currentPlayer = 'X';
    gameOver = false;
    winner = null;
    renderBoard();
    updateUI();
    toggleDialog(resultDialog, false);
  }
  
  // Reset scores
  function resetScores() {
    playerScore = 0;
    aiScore = 0;
    ties = 0;
    updateUI();
  }
  
  // Update UI
  function updateUI() {
    playerScoreEl.textContent = playerScore;
    aiScoreEl.textContent = aiScore;
    tiesScoreEl.textContent = ties;
    
    gridSizeBadge.textContent = `Grid: ${boardSize}×${boardSize}`;
    
    if (gameMode === 'ai') {
      playerLabel.textContent = 'You';
      aiLabel.textContent = 'AI';
      levelBadge.textContent = `Level: ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}`;
    } else {
      playerLabel.textContent = 'Player X';
      aiLabel.textContent = 'Player O';
      levelBadge.textContent = 'Level: PvP';
    }
    
    if (!gameOver) {
      if (gameMode === 'ai') {
        playerIndicator.textContent = currentPlayer === 'X' ? "Your Turn" : "AI is thinking...";
      } else {
        playerIndicator.textContent = `Player ${currentPlayer}'s Turn`;
      }
    } else {
      playerIndicator.textContent = '';
    }
  }
  
  // Toggle dialogs
  function toggleDialog(dialog, show = null) {
    if (show === null) {
      dialog.classList.toggle('active');
    } else {
      if (show) {
        dialog.classList.add('active');
      } else {
        dialog.classList.remove('active');
      }
    }
  }
  
  // Toggle dark mode
  function toggleDarkMode() {
    darkMode = !darkMode;
    if (darkMode) {
      app.classList.add('dark-mode');
      app.classList.remove('light-mode');
      darkModeToggle.innerHTML = '<i data-lucide="sun" class="icon"></i>';
    } else {
      app.classList.add('light-mode');
      app.classList.remove('dark-mode');
      darkModeToggle.innerHTML = '<i data-lucide="moon" class="icon"></i>';
    }
    lucide.createIcons();
  }
  
  // Toggle sound
  function toggleSound() {
    soundEnabled = !soundEnabled;
    if (soundEnabled) {
      soundToggle.innerHTML = '<i data-lucide="volume-2" class="icon"></i>';
    } else {
      soundToggle.innerHTML = '<i data-lucide="volume-x" class="icon"></i>';
    }
    lucide.createIcons();
  }
  
  // Play sound
  function playSound(type) {
    if (!soundEnabled) return;
    
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    switch (type) {
      case 'move':
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1);
        break;
      case 'win':
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1000, audioContext.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.3);
        break;
      case 'lose':
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.5);
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.5);
        break;
      case 'tie':
        oscillator.frequency.setValueAtTime(500, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.2);
        break;
    }
  }
  
  // Save settings
  function saveSettings() {
    boardSize = parseInt(boardSizeSelect.value);
    gameMode = gameModeSelect.value;
    difficulty = difficultySelect.value;
    
    if (gameMode === 'ai') {
      difficultyGroup.style.display = 'flex';
    } else {
      difficultyGroup.style.display = 'none';
    }
    
    resetGame();
    updateUI();
    toggleDialog(settingsDialog, false);
  }
  
  // Initialize settings
  function initSettings() {
    boardSizeSelect.value = boardSize;
    gameModeSelect.value = gameMode;
    difficultySelect.value = difficulty;
    
    if (gameMode === 'ai') {
      difficultyGroup.style.display = 'flex';
    } else {
      difficultyGroup.style.display = 'none';
    }
  }
  
  // Initialize the game
  initSettings();
});