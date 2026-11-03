const birthDate = new Date("1994-11-04T00:00:00");

function updateTime(){
  const now = new Date();
  let diff = Math.floor((now - birthDate) / 1000);

  const days = Math.floor(diff / 86400);
  diff %= 86400;
  const hours = Math.floor(diff / 3600);
  diff %= 3600;
  const minutes = Math.floor(diff / 60);
  const seconds = diff % 60;

  document.getElementById("days").textContent = days;
  document.getElementById("hours").textContent = hours;
  document.getElementById("minutes").textContent = minutes;
  document.getElementById("seconds").textContent = seconds;
}

updateTime();
setInterval(updateTime, 1000);
