/* =========================================================
   ELEMENTS
========================================================= */

const cake = document.getElementById("cake");

const msg = document.getElementById("msg");

const micBtn = document.getElementById("micBtn");

const pyro = document.getElementById("pyro");

const starsLayer =
  document.getElementById("starsLayer");

const step1 =
  document.getElementById("step1");

const step2 =
  document.getElementById("step2");

const step3 =
  document.getElementById("step3");

const titleText =
  document.getElementById("titleText");


/* =========================================================
   VARIABLES
========================================================= */

let flames = [];

let candleCount = 0;

let hasBlown = false;

let detecting = false;


/* =========================================================
   CANDLE COLORS
========================================================= */

const candleColors = [

  "candle-blue",

  "candle-yellow",

  "candle-pink",

  "candle-purple",

  "candle-green"

];


/* =========================================================
   INITIAL
========================================================= */

if (micBtn) {
  micBtn.style.display = "none";
}

if (step2) {
  step2.style.display = "none";
}

if (step3) {
  step3.style.display = "none";
}


/* =========================================================
   CLICK CAKE
========================================================= */

cake.addEventListener("click", function(event) {

  if (hasBlown) {
    return;
  }


  /*
   * IMPORTANT
   *
   * .cake ถูก scale บนมือถือ
   * ดังนั้น getBoundingClientRect()
   * จะได้ขนาดหลัง scale
   *
   * เราจึงต้องแปลงกลับเป็น
   * coordinate จริงของ cake 250x200
   */


  const rect =
    cake.getBoundingClientRect();


  const baseWidth = 250;

  const baseHeight = 200;


  const scaleX =
    rect.width / baseWidth;

  const scaleY =
    rect.height / baseHeight;


  let x =
    (event.clientX - rect.left)
    / scaleX;


  let y =
    (event.clientY - rect.top)
    / scaleY;


  /*
   * กันคลิกนอกตัว cake
   */

  if (
    x < 0 ||
    x > baseWidth ||
    y < 0 ||
    y > baseHeight
  ) {
    return;
  }


  /*
   * ต้องคลิกบริเวณด้านบนของเค้ก
   *
   * แต่ไม่ล็อกแค่ 15-80 แบบของเดิม
   * เพราะมือถือ scale ทำให้ตำแหน่งเพี้ยน
   *
   * เปิดช่วงกว้างขึ้น
   */

  if (y > 105) {
    return;
  }


  /*
   * จำกัดไม่ให้เทียนชิดขอบเกินไป
   */

  x =
    Math.max(
      20,
      Math.min(
        230,
        x
      )
    );


  /*
   * ให้เทียนปักอยู่บนหน้าครีม
   *
   * ไม่ว่าผู้ใช้จะคลิกตรงไหน
   * จะใช้ตำแหน่ง Y ที่เหมาะสม
   */

  y =
    Math.max(
      18,
      Math.min(
        76,
        y
      )
    );


  /* =======================================================
     CREATE CANDLE
  ======================================================= */

  const candle =
    document.createElement("div");


  candle.className =
    "candle " +
    candleColors[
      candleCount %
      candleColors.length
    ];


  candle.style.left =
    x + "px";


  candle.style.top =
    y + "px";


  /* =======================================================
     CREATE FLAME
  ======================================================= */

  const flame =
    document.createElement("div");


  flame.className =
    "flame";


  candle.appendChild(flame);


  /*
   * เพิ่มเทียนเข้า cake
   */

  cake.appendChild(candle);


  /*
   * เก็บ flame
   * เอาไว้ดับตอนเป่า
   */

  flames.push(flame);


  candleCount++;


  /* =======================================================
     CHANGE STEP
  ======================================================= */

  step1.style.display =
    "none";


  step2.style.display =
    "block";


  msg.textContent =
    "ปักเทียนแล้ว! กดอนุญาตไมโครโฟนเพื่อเป่า";


  micBtn.style.display =
    "inline-flex";

});


/* =========================================================
   MICROPHONE BUTTON
========================================================= */

micBtn.addEventListener(
  "click",
  startMicrophone
);


/* =========================================================
   START MICROPHONE
========================================================= */

async function startMicrophone() {

  if (
    detecting ||
    hasBlown
  ) {
    return;
  }


  detecting = true;


  micBtn.style.display =
    "none";


  msg.textContent =
    "กำลังเปิดไมโครโฟน...";


  try {

    if (
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {

      throw new Error(
        "Microphone API not supported"
      );

    }


    const stream =
      await navigator.mediaDevices
      .getUserMedia({
        audio:true
      });


    const AudioContext =
      window.AudioContext ||
      window.webkitAudioContext;


    if (!AudioContext) {

      throw new Error(
        "AudioContext not supported"
      );

    }


    const audioContext =
      new AudioContext();


    await audioContext.resume();


    const source =
      audioContext
      .createMediaStreamSource(
        stream
      );


    const analyser =
      audioContext
      .createAnalyser();


    analyser.fftSize =
      512;


    analyser.smoothingTimeConstant =
      0.15;


    source.connect(
      analyser
    );


    const data =
      new Uint8Array(
        analyser.frequencyBinCount
      );


    setTimeout(function() {

      if (hasBlown) {
        return;
      }


      msg.textContent =
        "เป่าเทียนได้เลย!";


      detectBlow(
        analyser,
        data,
        stream,
        audioContext
      );

    }, 700);


  } catch (error) {

    console.error(
      "Microphone error:",
      error
    );


    detecting = false;


    micBtn.style.display =
      "inline-flex";


    msg.textContent =
      "เปิดไมโครโฟนไม่ได้ กรุณาอนุญาตการใช้งานไมโครโฟน";

  }

}


/* =========================================================
   DETECT BLOW
========================================================= */

function detectBlow(
  analyser,
  data,
  stream,
  audioContext
) {

  if (hasBlown) {
    return;
  }


  analyser.getByteFrequencyData(
    data
  );


  let total = 0;


  for (
    let i = 0;
    i < data.length;
    i++
  ) {

    total += data[i];

  }


  const volume =
    total / data.length;


  /*
   * ค่าประมาณสำหรับมือถือ
   */

  const BLOW_THRESHOLD = 35;


  if (
    volume >
    BLOW_THRESHOLD
  ) {

    finishBlow(
      stream,
      audioContext
    );

    return;
  }


  requestAnimationFrame(
    function() {

      detectBlow(
        analyser,
        data,
        stream,
        audioContext
      );

    }
  );

}


/* =========================================================
   FINISH BLOW
========================================================= */

function finishBlow(
  stream,
  audioContext
) {

  if (hasBlown) {
    return;
  }


  hasBlown = true;

  detecting = false;


  /* =======================================================
     ดับเทียน
  ======================================================= */

  flames.forEach(
    function(flame) {

      flame.style.opacity =
        "0";

      flame.style.animation =
        "none";

    }
  );


  /* =======================================================
     TITLE
  ======================================================= */

  titleText.textContent =
    "";


  /* =======================================================
     HIDE STEP 2
  ======================================================= */

  step2.style.display =
    "none";


  /* =======================================================
     SHOW STEP 3
  ======================================================= */

  step3.style.display =
    "block";


  /* =======================================================
     FIREWORK
  ======================================================= */

  pyro.style.display =
    "block";


  /* =======================================================
     STARS
  ======================================================= */

  spawnStars();


  /* =======================================================
     CLOSE MICROPHONE
  ======================================================= */

  if (stream) {

    stream
      .getTracks()
      .forEach(
        function(track) {

          track.stop();

        }
      );

  }


  if (
    audioContext &&
    audioContext.state !== "closed"
  ) {

    audioContext.close();

  }

}


/* =========================================================
   STARS
========================================================= */

function spawnStars() {

  const STAR_COUNT =
    100;


  const vw =
    window.innerWidth;


  for (
    let i = 0;
    i < STAR_COUNT;
    i++
  ) {

    const img =
      document.createElement(
        "img"
      );


    const starNum =
      (i % 4) + 1;


    img.src =
      `star${starNum}.png`;


    img.className =
      "star-piece";


    const size =
      18 +
      Math.random() * 25;


    img.style.width =
      size + "px";


    img.style.left =
      Math.random() * vw +
      "px";


    img.style.setProperty(
      "--drift1",
      (
        Math.random() * 240 -
        120
      ) + "px"
    );


    img.style.setProperty(
      "--drift2",
      (
        Math.random() * 360 -
        180
      ) + "px"
    );


    img.style.setProperty(
      "--drift3",
      (
        Math.random() * 480 -
        240
      ) + "px"
    );


    img.style.setProperty(
      "--drift4",
      (
        Math.random() * 600 -
        300
      ) + "px"
    );


    const duration =
      5 +
      Math.random() * 7;


    const delay =
      Math.random() * 3;


    img.style.animationDuration =
      duration + "s";


    img.style.animationDelay =
      delay + "s";


    starsLayer.appendChild(
      img
    );


    setTimeout(
      function() {

        img.remove();

      },
      (duration + delay) *
      1000 +
      1000
    );

  }

}