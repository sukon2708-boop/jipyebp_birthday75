/* =========================================================
   CAKE.JS
   หน้าเค้กวันเกิด
========================================================= */


/* =========================================================
   ELEMENTS
========================================================= */

const cake = document.getElementById("cake");
const msg = document.getElementById("msg");
const micBtn = document.getElementById("micBtn");

const pyro = document.getElementById("pyro");
const starsLayer = document.getElementById("starsLayer");

const step1 = document.getElementById("step1");
const step2 = document.getElementById("step2");
const step3 = document.getElementById("step3");

const titleText = document.getElementById("titleText");


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
   INITIAL STATE
========================================================= */

micBtn.style.display = "none";

step2.style.display = "none";

step3.style.display = "none";


/* =========================================================
   CLICK CAKE → CREATE CANDLE
========================================================= */

cake.addEventListener("click", function(event) {

  /* ถ้าเป่าเทียนไปแล้ว ห้ามปักเพิ่ม */
  if (hasBlown) {
    return;
  }


  /* ตำแหน่งของเค้ก */
  const rect = cake.getBoundingClientRect();


  /* ตำแหน่งที่ผู้ใช้คลิก */
  const x = event.clientX - rect.left;

  const y = event.clientY - rect.top;


  /*
    ให้คลิกได้เฉพาะบริเวณด้านบนของเค้ก
  */

  if (y < 15 || y > 80) {
    return;
  }


  /* =====================================================
     CREATE CANDLE
  ===================================================== */

  const candle = document.createElement("div");


  candle.className =
    "candle " +
    candleColors[
      candleCount %
      candleColors.length
    ];


  /*
    ตำแหน่งเทียน
  */

  candle.style.left = x + "px";

  candle.style.top = y + "px";


  candleCount++;


  /* =====================================================
     CREATE FLAME
  ===================================================== */

  const flame = document.createElement("div");

  flame.className = "flame";


  candle.appendChild(flame);


  /* ใส่เทียนลงบนเค้ก */
  cake.appendChild(candle);


  /* เก็บ flame ไว้สำหรับตอนเป่า */
  flames.push(flame);


  /* =====================================================
     SHOW STEP 2
  ===================================================== */

  step1.style.display = "none";

  step2.style.display = "flex";


  msg.textContent =
    "ปักเทียนแล้ว! กดอนุญาตไมโครโฟนเพื่อเป่า";


  micBtn.style.display = "inline-flex";

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

  /*
    ป้องกันการกดซ้ำ
  */

  if (detecting || hasBlown) {
    return;
  }


  detecting = true;


  micBtn.style.display = "none";


  msg.textContent =
    "กำลังเปิดไมโครโฟน...";


  try {


    /* =====================================================
       CHECK MICROPHONE API
    ===================================================== */

    if (
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {

      throw new Error(
        "Microphone API not supported"
      );

    }


    /* =====================================================
       REQUEST MICROPHONE
    ===================================================== */

    const stream =
      await navigator.mediaDevices.getUserMedia({

        audio: true

      });


    /* =====================================================
       AUDIO CONTEXT
    ===================================================== */

    const AudioContext =
      window.AudioContext ||
      window.webkitAudioContext;


    const audioContext =
      new AudioContext();


    await audioContext.resume();


    /* =====================================================
       AUDIO SOURCE
    ===================================================== */

    const source =
      audioContext.createMediaStreamSource(
        stream
      );


    /* =====================================================
       ANALYSER
    ===================================================== */

    const analyser =
      audioContext.createAnalyser();


    analyser.fftSize = 512;

    analyser.smoothingTimeConstant = .15;


    source.connect(analyser);


    const data =
      new Uint8Array(
        analyser.frequencyBinCount
      );


    /* =====================================================
       WAIT BEFORE DETECTING
    ===================================================== */

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


    }, 1000);


  } catch (error) {


    /* =====================================================
       MICROPHONE ERROR
    ===================================================== */

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


  /* อ่านเสียง */
  analyser.getByteFrequencyData(data);


  let total = 0;


  /* รวมค่าความดัง */
  for (
    let i = 0;
    i < data.length;
    i++
  ) {

    total += data[i];

  }


  /* ค่าเฉลี่ยเสียง */
  const volume =
    total / data.length;


  /*
    ค่าที่ใช้ตรวจจับการเป่า
  */

  const BLOW_THRESHOLD = 45;


  /* =====================================================
     BLOW DETECTED
  ===================================================== */

  if (volume > BLOW_THRESHOLD) {

    finishBlow(
      stream,
      audioContext
    );

    return;

  }


  /* ตรวจต่อ */
  requestAnimationFrame(function() {

    detectBlow(
      analyser,
      data,
      stream,
      audioContext
    );

  });

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


  /* =====================================================
     EXTINGUISH ALL FLAMES
  ===================================================== */

  flames.forEach(function(flame) {

    flame.style.opacity = "0";

    flame.style.animation = "none";

  });


  /* =====================================================
     REMOVE TITLE
  ===================================================== */

  titleText.textContent = "";


  /* =====================================================
     CHANGE STEP
  ===================================================== */

  step2.style.display = "none";

  step3.style.display = "flex";


  /* =====================================================
     FIREWORK ON CAKE
  ===================================================== */

  pyro.style.display = "block";


  /* =====================================================
     SPAWN FALLING STARS
  ===================================================== */

  spawnStars();


  /* =====================================================
     STOP MICROPHONE
  ===================================================== */

  if (stream) {

    stream
      .getTracks()
      .forEach(function(track) {

        track.stop();

      });

  }


  /* =====================================================
     CLOSE AUDIO
  ===================================================== */

  if (
    audioContext &&
    audioContext.state !== "closed"
  ) {

    audioContext.close();

  }

}


/* =========================================================
   SPAWN STARS
========================================================= */

function spawnStars() {


  /* จำนวนดาว */
  const STAR_COUNT = 100;


  /* ความกว้างหน้าจอ */
  const vw = window.innerWidth;


  /*
    ล้างดาวเก่าก่อน
    ป้องกันดาวซ้ำถ้ามีการเรียกฟังก์ชันอีกครั้ง
  */

  starsLayer.innerHTML = "";


  /* =====================================================
     CREATE STARS
  ===================================================== */

  for (
    let i = 0;
    i < STAR_COUNT;
    i++
  ) {


    /* ===================================================
       CREATE IMAGE
    =================================================== */

    const img =
      document.createElement("img");


    /*
      สลับ star1.png
      star2.png
      star3.png
      star4.png
    */

    const starNum =
      (i % 4) + 1;


    img.src =
      `star${starNum}.png`;


    img.className =
      "star-piece";


    /* ===================================================
       RANDOM SIZE
    =================================================== */

    const size =
      18 +
      Math.random() * 25;


    img.style.width =
      size + "px";


    /* ===================================================
       RANDOM START POSITION
    =================================================== */

    img.style.left =
      Math.random() * vw + "px";


    /*
      เริ่มเหนือหน้าจอ
    */

    img.style.top =
      "-80px";


    /* ===================================================
       RANDOM DRIFT
    =================================================== */

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


    /* ===================================================
       RANDOM ANIMATION SPEED
    =================================================== */

    const duration =
      5 +
      Math.random() * 7;


    /* ===================================================
       RANDOM DELAY
    =================================================== */

    const delay =
      Math.random() * 3;


    img.style.animationDuration =
      duration + "s";


    img.style.animationDelay =
      delay + "s";


    /*
      บังคับให้ใช้ animation
    */

    img.style.animationName =
      "starFall";


    img.style.animationTimingFunction =
      "linear";


    img.style.animationFillMode =
      "forwards";


    /* ===================================================
       ADD TO PAGE
    =================================================== */

    starsLayer.appendChild(img);


    /* ===================================================
       REMOVE AFTER ANIMATION
    =================================================== */

    setTimeout(function() {

      img.remove();

    }, (
      duration +
      delay
    ) * 1000 + 1000);


  }

}


/* =========================================================
   OPTIONAL:
   ถ้าหน้าจอเปลี่ยนขนาดระหว่างเอฟเฟกต์
   ไม่ต้องทำอะไรเพิ่มเติม
========================================================= */