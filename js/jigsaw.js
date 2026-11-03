const canvas = document.getElementById("puzzle");
const ctx = canvas.getContext("2d");

const modalBackdrop = document.getElementById("modalBackdrop");
document.getElementById("showHintBtn").addEventListener("click", ()=> modalBackdrop.style.display="flex");
document.getElementById("closeModalBtn").addEventListener("click", ()=> modalBackdrop.style.display="none");
modalBackdrop.addEventListener("click", (e)=>{ if(e.target===modalBackdrop) modalBackdrop.style.display="none"; });

const img = new Image();
img.src = "assets/puzzle.jpg";

const N = 3;                 // 3x3
const size = canvas.width;   // 600
const tile = size / N;

let order = [];   // ตำแหน่งปัจจุบัน: order[pos] = originalIndex
let selected = null;

function initOrder(){
  order = Array.from({length:N*N}, (_,i)=>i);
}

function shuffle(){
  // สับแบบง่าย
  for(let i=order.length-1; i>0; i--){
    const j = Math.floor(Math.random() * (i+1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  selected = null;
  draw();
}

function draw(){
  ctx.clearRect(0,0,size,size);
  // วาดตาม order
  for(let pos=0; pos<N*N; pos++){
    const orig = order[pos];

    const sx = (orig % N) * tile;
    const sy = Math.floor(orig / N) * tile;

    const dx = (pos % N) * tile;
    const dy = Math.floor(pos / N) * tile;

    ctx.drawImage(img, sx, sy, tile, tile, dx, dy, tile, tile);

    // เส้นกริด
    ctx.strokeStyle = "rgba(255,255,255,.65)";
    ctx.lineWidth = 3;
    ctx.strokeRect(dx,dy,tile,tile);

    // ไฮไลท์ชิ้นที่เลือก
    if(selected === pos){
      ctx.strokeStyle = "rgba(240,111,147,.95)";
      ctx.lineWidth = 6;
      ctx.strokeRect(dx+3, dy+3, tile-6, tile-6);
    }
  }

  // ตรวจเสร็จ
  const ok = order.every((v,i)=>v===i);
  if(ok){
    setTimeout(()=> alert("เก่งมาก! ต่อสำเร็จแล้ว 🎉"), 50);
  }
}

function posFromXY(x,y){
  const col = Math.floor(x / tile);
  const row = Math.floor(y / tile);
  return row * N + col;
}

canvas.addEventListener("click", (e)=>{
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (canvas.width / rect.width);
  const y = (e.clientY - rect.top) * (canvas.height / rect.height);
  const pos = posFromXY(x,y);

  if(selected === null){
    selected = pos;
    draw();
    return;
  }
  if(selected === pos){
    selected = null;
    draw();
    return;
  }

  // สลับ
  [order[selected], order[pos]] = [order[pos], order[selected]];
  selected = null;
  draw();
});

document.getElementById("shuffleBtn").addEventListener("click", shuffle);

img.onload = ()=>{
  initOrder();
  shuffle();
};
