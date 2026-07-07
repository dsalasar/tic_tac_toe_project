/**
 * app.js — Tic Tac Toe Frontend Logic
 * Handles all game state, UI updates, and communication with the backend API.
 */

'use strict';

/* ============================================================
   CONFIG
   ============================================================ */
const API_BASE = 'http://localhost:3000/api';

/* ============================================================
   GAME STATE
   ============================================================ */
const state = {
  players: { X: 'Player 1', O: 'Player 2' },
  board: Array(9).fill(null),          // null | 'X' | 'O'
  currentPlayer: 'X',
  gameOver: false,
  scores: { X: 0, O: 0, draws: 0 },
  roundHistory: [],                    // array of round results for saving
  winningCells: [],
};

/* Win combinations */
const WIN_COMBOS = [
  [0,1,2],[3,4,5],[6,7,8], // rows
  [0,3,6],[1,4,7],[2,5,8], // cols
  [0,4,8],[2,4,6],         // diags
];

/* ============================================================
   DOM REFERENCES
   ============================================================ */
const dom = {
  setupSection:     document.getElementById('setupSection'),
  gameSection:      document.getElementById('gameSection'),
  player1Input:     document.getElementById('player1Name'),
  player2Input:     document.getElementById('player2Name'),
  startGameBtn:     document.getElementById('startGameBtn'),
  board:            document.getElementById('board'),
  cells:            document.querySelectorAll('.cell'),
  turnText:         document.getElementById('turnText'),
  turnSymbol:       document.getElementById('turnSymbol'),
  scoreNameX:       document.getElementById('scoreNameX'),
  scoreNameO:       document.getElementById('scoreNameO'),
  scoreX:           document.getElementById('scoreX'),
  scoreO:           document.getElementById('scoreO'),
  scoreDraws:       document.getElementById('scoreDraws'),
  scoreCardX:       document.getElementById('scoreCardX'),
  scoreCardO:       document.getElementById('scoreCardO'),
  newRoundBtn:      document.getElementById('newRoundBtn'),
  resetGameBtn:     document.getElementById('resetGameBtn'),
  changePlayersBtn: document.getElementById('changePlayersBtn'),
  saveGameBtn:      document.getElementById('saveGameBtn'),
  saveStatus:       document.getElementById('saveStatus'),
  // Modal
  modalOverlay:     document.getElementById('modalOverlay'),
  modalIcon:        document.getElementById('modalIcon'),
  modalTitle:       document.getElementById('modalTitle'),
  modalMessage:     document.getElementById('modalMessage'),
  modalNextRound:   document.getElementById('modalNextRound'),
  modalClose:       document.getElementById('modalClose'),
  // Leaderboard
  refreshBtn:       document.getElementById('refreshLeaderboardBtn'),
  leaderboardBody:  document.getElementById('leaderboardBody'),
  recentGamesBody:  document.getElementById('recentGamesBody'),
  // Footer
  footerYear:       document.getElementById('footerYear'),
};

/* ============================================================
   INIT
   ============================================================ */
function init() {
  dom.footerYear.textContent = new Date().getFullYear();
  bindEvents();
  loadLeaderboard();
}

/* ============================================================
   EVENT BINDING
   ============================================================ */
function bindEvents() {
  dom.startGameBtn.addEventListener('click', startGame);
  dom.player1Input.addEventListener('keydown', (e) => { if (e.key === 'Enter') dom.player2Input.focus(); });
  dom.player2Input.addEventListener('keydown', (e) => { if (e.key === 'Enter') startGame(); });

  dom.cells.forEach(cell => cell.addEventListener('click', onCellClick));

  dom.newRoundBtn.addEventListener('click', newRound);
  dom.resetGameBtn.addEventListener('click', resetScores);
  dom.changePlayersBtn.addEventListener('click', changePlayers);
  dom.saveGameBtn.addEventListener('click', saveGame);

  dom.modalNextRound.addEventListener('click', () => { closeModal(); newRound(); });
  dom.modalClose.addEventListener('click', closeModal);
  dom.modalOverlay.addEventListener('click', (e) => { if (e.target === dom.modalOverlay) closeModal(); });

  dom.refreshBtn.addEventListener('click', loadLeaderboard);
}

/* ============================================================
   GAME FLOW
   ============================================================ */
function startGame() {
  const p1 = dom.player1Input.value.trim() || 'Player 1';
  const p2 = dom.player2Input.value.trim() || 'Player 2';
  state.players.X = p1;
  state.players.O = p2;
  state.scores = { X: 0, O: 0, draws: 0 };
  state.roundHistory = [];

  dom.scoreNameX.textContent = p1;
  dom.scoreNameO.textContent = p2;

  dom.setupSection.classList.add('hidden');
  dom.gameSection.classList.remove('hidden');

  newRound();
}

function newRound() {
  state.board = Array(9).fill(null);
  state.currentPlayer = 'X';
  state.gameOver = false;
  state.winningCells = [];

  dom.cells.forEach(cell => {
    cell.textContent = '';
    cell.className = 'cell';
    cell.disabled = false;
    cell.setAttribute('aria-label', `Cell ${+cell.dataset.index + 1}`);
  });

  updateTurnIndicator();
  updateScoreBoard();
  hideSaveStatus();
}

function resetScores() {
  state.scores = { X: 0, O: 0, draws: 0 };
  state.roundHistory = [];
  updateScoreBoard();
  newRound();
}

function changePlayers() {
  dom.player1Input.value = state.players.X;
  dom.player2Input.value = state.players.O;
  dom.gameSection.classList.add('hidden');
  dom.setupSection.classList.remove('hidden');
}

/* ============================================================
   CELL CLICK
   ============================================================ */
function onCellClick(e) {
  const cell = e.currentTarget;
  const index = +cell.dataset.index;

  if (state.gameOver || state.board[index]) return;

  const player = state.currentPlayer;
  state.board[index] = player;

  // Update cell visually
  cell.textContent = player;
  cell.classList.add(player.toLowerCase());
  cell.disabled = true;
  cell.setAttribute('aria-label', `Cell ${index + 1}: ${player}`);

  const result = checkWinner();

  if (result.winner) {
    endRound('win', result.winner, result.cells);
  } else if (result.draw) {
    endRound('draw', null, []);
  } else {
    state.currentPlayer = player === 'X' ? 'O' : 'X';
    updateTurnIndicator();
  }
}

/* ============================================================
   WINNER CHECK
   ============================================================ */
function checkWinner() {
  for (const combo of WIN_COMBOS) {
    const [a, b, c] = combo;
    if (
      state.board[a] &&
      state.board[a] === state.board[b] &&
      state.board[a] === state.board[c]
    ) {
      return { winner: state.board[a], cells: combo, draw: false };
    }
  }
  if (state.board.every(cell => cell !== null)) {
    return { winner: null, cells: [], draw: true };
  }
  return { winner: null, cells: [], draw: false };
}

/* ============================================================
   END ROUND
   ============================================================ */
function endRound(outcome, winner, winCells) {
  state.gameOver = true;

  // Disable all cells
  dom.cells.forEach(cell => cell.disabled = true);

  const winnerName = winner ? state.players[winner] : null;

  if (outcome === 'win') {
    state.scores[winner]++;
    // Highlight winning cells
    winCells.forEach(idx => {
      dom.cells[idx].classList.add('winning');
    });
    state.winningCells = winCells;
    showModal('🎉', `${winnerName} Wins!`, `${winnerName} takes the round!`);
  } else {
    state.scores.draws++;
    showModal('🤝', "It's a Draw!", "No winner this time. Play again!");
  }

  // Record round
  state.roundHistory.push({
    board: [...state.board],
    outcome,
    winner,
    winnerName,
    timestamp: new Date().toISOString(),
  });

  updateScoreBoard();
}

/* ============================================================
   UI HELPERS
   ============================================================ */
function updateTurnIndicator() {
  const p = state.currentPlayer;
  const name = state.players[p];
  dom.turnText.textContent = `${name}'s Turn`;
  dom.turnSymbol.textContent = p;
  dom.turnSymbol.className = `turn-symbol ${p === 'X' ? 'x-sym' : 'o-sym'}`;

  // Highlight active score card
  dom.scoreCardX.classList.toggle('active-x', p === 'X');
  dom.scoreCardO.classList.toggle('active-o', p === 'O');
}

function updateScoreBoard() {
  dom.scoreX.textContent    = state.scores.X;
  dom.scoreO.textContent    = state.scores.O;
  dom.scoreDraws.textContent = state.scores.draws;
}

function showModal(icon, title, message) {
  dom.modalIcon.textContent    = icon;
  dom.modalTitle.textContent   = title;
  dom.modalMessage.textContent = message;
  dom.modalOverlay.classList.remove('hidden');
}

function closeModal() {
  dom.modalOverlay.classList.add('hidden');
}

function hideSaveStatus() {
  dom.saveStatus.textContent = '';
  dom.saveStatus.className = 'save-status';
}

function showSaveStatus(type, text) {
  dom.saveStatus.textContent = text;
  dom.saveStatus.className = `save-status ${type}`;
}

/* ============================================================
   BACKEND: SAVE GAME
   ============================================================ */
async function saveGame() {
  if (state.roundHistory.length === 0) {
    showSaveStatus('error', 'Play at least one round first.');
    return;
  }

  dom.saveGameBtn.disabled = true;
  showSaveStatus('', 'Saving…');

  const payload = {
    playerX:  state.players.X,
    playerO:  state.players.O,
    scoreX:   state.scores.X,
    scoreO:   state.scores.O,
    draws:    state.scores.draws,
    rounds:   state.roundHistory.length,
    history:  state.roundHistory,
  };

  try {
    const res = await fetch(`${API_BASE}/games`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(`Server error: ${res.status}`);

    showSaveStatus('success', '✓ Game saved!');
    loadLeaderboard(); // refresh leaderboard after save
  } catch (err) {
    console.error(err);
    showSaveStatus('error', '✗ Could not connect to server.');
  } finally {
    dom.saveGameBtn.disabled = false;
  }
}

/* ============================================================
   BACKEND: LOAD LEADERBOARD
   ============================================================ */
async function loadLeaderboard() {
  try {
    const [lbRes, gamesRes] = await Promise.all([
      fetch(`${API_BASE}/leaderboard`),
      fetch(`${API_BASE}/games?limit=10`),
    ]);

    if (lbRes.ok) {
      const data = await lbRes.json();
      renderLeaderboard(data);
    }

    if (gamesRes.ok) {
      const data = await gamesRes.json();
      renderRecentGames(data);
    }
  } catch (_) {
    // Backend not connected — silently fail, table stays empty
  }
}

function renderLeaderboard(rows) {
  if (!rows || rows.length === 0) {
    dom.leaderboardBody.innerHTML = '<tr><td colspan="6" class="no-data">No records yet. Play and save a game!</td></tr>';
    return;
  }

  dom.leaderboardBody.innerHTML = rows.map((r, i) => `
    <tr class="rank-${i + 1}">
      <td>${i + 1}</td>
      <td><strong>${escapeHtml(r.player)}</strong></td>
      <td>${r.wins}</td>
      <td>${r.losses}</td>
      <td>${r.draws}</td>
      <td>${r.gamesPlayed}</td>
    </tr>
  `).join('');
}

function renderRecentGames(games) {
  if (!games || games.length === 0) {
    dom.recentGamesBody.innerHTML = '<tr><td colspan="5" class="no-data">No recent games found.</td></tr>';
    return;
  }

  dom.recentGamesBody.innerHTML = games.map(g => `
    <tr>
      <td>${new Date(g.createdAt).toLocaleDateString()}</td>
      <td>${escapeHtml(g.playerX)}</td>
      <td>${escapeHtml(g.playerO)}</td>
      <td>${g.winner ? escapeHtml(g.winner) : '<em>Draw</em>'}</td>
      <td>${g.rounds}</td>
    </tr>
  `).join('');
}

/* ============================================================
   UTILITIES
   ============================================================ */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ============================================================
   START
   ============================================================ */
init();
