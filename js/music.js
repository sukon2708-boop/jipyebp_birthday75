const music = document.getElementById("music");
const playBtn = document.getElementById("playBtn");
const vinyl = document.getElementById("vinyl");

const progress = document.getElementById("progress");
const currentTimeText = document.getElementById("currentTime");
const durationText = document.getElementById("duration");

function formatTime(sec){
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}

/* โหลดความยาวเพลง */
music.addEventListener("loadedmetadata", () => {
  progress.max = Math.floor(music.duration);
  durationText.textContent = formatTime(music.duration);
});

/* อัปเดตระหว่างเล่น */
music.addEventListener("timeupdate", () => {
  progress.value = music.currentTime;
  currentTimeText.textContent = formatTime(music.currentTime);
});

/* ลากแถบเพลง */
progress.addEventListener("input", () => {
  music.currentTime = progress.value;
});

/* ปุ่มเล่น / หยุด */
playBtn.addEventListener("click", () => {
  if(music.paused){
    music.play();
    vinyl.classList.add("spin");
    playBtn.textContent = "〢 หยุดเพลง";
  }else{
    music.pause();
    vinyl.classList.remove("spin");
    playBtn.textContent = "▶ เล่นเพลง";
  }
});

/* เพลงจบ */
music.addEventListener("ended", () => {
  vinyl.classList.remove("spin");
  playBtn.textContent = "▶ เล่นเพลง";
});
