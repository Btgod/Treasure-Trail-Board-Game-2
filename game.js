const TILE_COUNT = 30;
const boardEl = document.getElementById('board');
const diceEl = document.getElementById('dice');
const rollBtn = document.getElementById('rollBtn');
const statusEl = document.getElementById('status');
const turnNameEl = document.getElementById('currentName');
const restartBtn = document.getElementById('restart');
const playersSelect = document.getElementById('players');

const TREASURE = [3,7,12,15,19,22,25,27];
const TRAPS = [5,11,18,24];
const SWAPS = [9,21];
const MYST = [13,26];
const GOAL = 29;

const PALETTE = ['#F59E0B','#10B981','#3B82F6','#EF4444'];

let players = [];
let current = 0;

function initPlayers(count=2){
  players = [];
  const icons = ['🐒','🦜','🦁','🧭'];
  for(let i=0;i<count;i++){
    players.push({name:`Player ${i+1}`, pos:0, icon:icons[i], color:PALETTE[i], skip:false});
  }
  current = 0;
  renderBoard();
  updateUI();
}

function createTile(i){
  const div = document.createElement('div');
  div.className = 'tile';
  div.dataset.i = i;
  const idx = document.createElement('div');
  idx.className = 'index';
  idx.textContent = i+1;
  div.appendChild(idx);

  const icon = document.createElement('div');
  icon.className = 'icon';
  if(i === GOAL) icon.textContent = '🏴‍☠️';
  else if(TREASURE.includes(i)) icon.textContent = '💰';
  else if(TRAPS.includes(i)) icon.textContent = '🪤';
  else if(MYST.includes(i)) icon.textContent = '❓';
  else if(SWAPS.includes(i)) icon.textContent = '🐒';
  else icon.textContent = '🌿';
  div.appendChild(icon);

  return div;
}

function renderBoard(){
  boardEl.innerHTML = '';
  for(let i=0;i<TILE_COUNT;i++){
    const t = createTile(i);
    boardEl.appendChild(t);
  }
  renderPawns();
}

function renderPawns(){
  document.querySelectorAll('.tile').forEach(t=>{ t.querySelectorAll('.player-pawn').forEach(p=>p.remove()); });
  players.forEach((p, idx)=>{
    const tile = document.querySelector(`.tile[data-i='${Math.min(p.pos, GOAL)}']`);
    if(!tile) return;
    const span = document.createElement('div');
    span.className = 'player-pawn';
    span.style.right = (8 + idx*22) + 'px';
    span.innerHTML = `<span class="player-dot" style="background:${p.color}"></span>${p.icon}`;
    tile.appendChild(span);
  });
  updateUI();
}

function updateUI(){
  turnNameEl.textContent = players[current].name + ' ' + players[current].icon;
  statusEl.textContent = players[current].skip ? 'Skipping this turn...' : 'Ready to roll.';
}

function animateDice(callback){
  let times = 10;
  diceEl.style.transform = 'scale(1.06) rotate(10deg)';
  const iv = setInterval(()=>{
    const r = Math.floor(Math.random()*6)+1;
    diceEl.textContent = r;
    times--;
    if(times<=0){
      clearInterval(iv);
      diceEl.style.transform = 'none';
      callback(parseInt(diceEl.textContent));
    }
  },80);
}

function applyTileEffect(playerIdx){
  const pl = players[playerIdx];
  const pos = pl.pos;
  if(pos >= GOAL) return;

  if(TREASURE.includes(pos)){
    pl.pos = Math.min(GOAL, pl.pos + 1);
    statusEl.textContent = pl.name + ' found a treasure! +1';
  } else if(TRAPS.includes(pos)){
    pl.skip = true;
    statusEl.textContent = pl.name + ' hit a trap! skip next';
  } else if(SWAPS.includes(pos)){
    const other = (playerIdx+1) % players.length;
    const tmp = players[other].pos;
    players[other].pos = pl.pos;
    pl.pos = tmp;
    statusEl.textContent = pl.name + ' triggered a swap!';
  } else if(MYST.includes(pos)){
    const r = Math.floor(Math.random()*6)+1;
    if(r >= 4){
      pl.pos = Math.min(GOAL, pl.pos + r);
      statusEl.textContent = pl.name + ' mystery jump +' + r;
    } else {
      pl.pos = Math.max(0, pl.pos - r);
      statusEl.textContent = pl.name + ' mystery slip -' + r;
    }
  } else {
    statusEl.textContent = pl.name + ' is on a safe tile.';
  }
}

function checkWin(pl){
  if(pl.pos >= GOAL){
    statusEl.textContent = pl.name + ' reached the final treasure and wins! 🎉';
    rollBtn.disabled = true;
    return true;
  }
  return false;
}

rollBtn.addEventListener('click', ()=>{
  const pl = players[current];
  if(pl.skip){
    pl.skip = false;
    statusEl.textContent = pl.name + ' was skipping.';
    current = (current+1) % players.length;
    updateUI();
    return;
  }
  animateDice((d)=>{
    pl.pos += d;
    if(pl.pos > GOAL){
      const overflow = pl.pos - GOAL;
      pl.pos = GOAL - overflow;
      statusEl.textContent = pl.name + ' bounced back.';
    } else {
      statusEl.textContent = pl.name + ' rolled ' + d;
    }
    setTimeout(()=>{
      applyTileEffect(current);
      renderPawns();
      if(!checkWin(pl)){
        current = (current+1) % players.length;
        updateUI();
      }
    }, 350);
  });
});

restartBtn.addEventListener('click', ()=>{
  initPlayers(parseInt(playersSelect.value));
  rollBtn.disabled = false;
  statusEl.textContent = 'Game restarted.';
});

playersSelect.addEventListener('change', ()=>{
  initPlayers(parseInt(playersSelect.value));
  rollBtn.disabled = false;
  statusEl.textContent = 'Player count changed.';
});

(function setupBrand(){
  const headerLogo = document.querySelector('.logo');
  // If you saved the uploaded image into assets/brand.png, it will show automatically
  headerLogo.src = 'assets/brand.png';
})();

initPlayers(2);
