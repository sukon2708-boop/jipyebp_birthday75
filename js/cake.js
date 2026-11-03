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

micBtn.style.display = "none";

step2.style.display = "none";

step3.style.display = "none";


/* =========================================================
   CLICK / TOUCH CAKE
========================================================= */

cake.addEventListener(
  "pointerdown",
  function(event){

    if(hasBlown){
      return;
    }


    /*
      ป้องกัน touch
      ไม่ให้เกิด click ซ้ำ
    */

    event.preventDefault();


    /* =====================================================
       GET CAKE POSITION
    ===================================================== */

    const rect =
      cake.getBoundingClientRect();


    /*
      เนื่องจาก .cake ถูก scale
      บนมือถือ

      getBoundingClientRect()
      จะได้ขนาดหลัง scale

      จึงต้องคำนวณ scale
      กลับไปเป็นขนาดจริง
    */

    const scaleX =
      rect.width /
      cake.offsetWidth;


    const scaleY =
      rect.height /
      cake.offsetHeight;


    /*
      ตำแหน่งที่กดบนหน้าจอ
      แปลงกลับเป็นตำแหน่งภายใน cake
    */

    let x =
      (
        event.clientX -
        rect.left
      ) / scaleX;


    let y =
      (
        event.clientY -
        rect.top
      ) / scaleY;


    /* =====================================================
       ตรวจตำแหน่งที่อนุญาต
    ===================================================== */

    /*
      cake จริงมีขนาด:

      width  = 250px
      height = 200px

      ให้ปักเทียนบริเวณ
      ส่วนบนของเค้ก
    */

    if(
      y < 8 ||
      y > 100
    ){

      return;

    }


    /* =====================================================
       จำกัดตำแหน่ง X
    ===================================================== */

    x =
      Math.max(
        15,
        Math.min(
          235,
          x
        )
      );


    /* =====================================================
       จำกัดตำแหน่ง Y
    ===================================================== */

    y =
      Math.max(
        45,
        Math.min(
          92,
          y
        )
      );


    /* =====================================================
       CREATE CANDLE
    ===================================================== */

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


    /*
      เพิ่มจำนวนเทียน
    */

    candleCount++;


    /*
      ไม่ให้การแตะเทียน
      ส่ง event กลับไปสร้างเทียนซ้ำ
    */

    candle.addEventListener(
      "pointerdown",
      function(e){

        e.stopPropagation();

      }
    );


    /* =====================================================
       CREATE FLAME
    ===================================================== */

    const flame =
      document.createElement("div");


    flame.className =
      "flame";


    candle.appendChild(flame);


    /* =====================================================
       ADD CANDLE
    ===================================================== */

    cake.appendChild(candle);


    /*
      เก็บ flame
      ไว้ใช้ตอนเป่า
    */

    flames.push(flame);


    /* =====================================================
       CHANGE STEP
    ===================================================== */

    step1.style.display =
      "none";


    step2.style.display =
      "block";


    msg.textContent =
      "ปักเทียนแล้ว! กดอนุญาตไมโครโฟนเพื่อเป่า";


    micBtn.style.display =
      "inline-flex";

  }
);


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

async function startMicrophone(){

  if(
    detecting ||
    hasBlown
  ){

    return;

  }


  detecting = true;


  micBtn.style.display =
    "none";


  msg.textContent =
    "กำลังเปิดไมโครโฟน...";


  try{

    /* =====================================================
       CHECK MICROPHONE
    ===================================================== */

    if(
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ){

      throw new Error(
        "Microphone API not supported"
      );

    }


    /* =====================================================
       REQUEST MICROPHONE
    ===================================================== */

    const stream =
      await navigator.mediaDevices
      .getUserMedia({
        audio:true
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
      audioContext
      .createMediaStreamSource(
        stream
      );


    /* =====================================================
       ANALYSER
    ===================================================== */

    const analyser =
      audioContext
      .createAnalyser();


    analyser.fftSize =
      512;


    analyser.smoothingTimeConstant =
      .15;


    source.connect(
      analyser
    );


    const data =
      new Uint8Array(
        analyser.frequencyBinCount
      );


    /* =====================================================
       START DETECTION
    ===================================================== */

    setTimeout(
      function(){

        if(hasBlown){
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

      },
      1000
    );

  }
  catch(error){

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
){

  if(hasBlown){
    return;
  }


  analyser.getByteFrequencyData(
    data
  );


  let total = 0;


  for(
    let i = 0;
    i < data.length;
    i++
  ){

    total += data[i];

  }


  const volume =
    total /
    data.length;


  /*
    ระดับเสียงที่ใช้ตรวจ
    การเป่า
  */

  const BLOW_THRESHOLD =
    45;


  if(
    volume >
    BLOW_THRESHOLD
  ){

    finishBlow(
      stream,
      audioContext
    );

    return;

  }


  requestAnimationFrame(
    function(){

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
){

  if(hasBlown){
    return;
  }


  hasBlown = true;

  detecting = false;


  /* =====================================================
     ดับไฟเทียน
  ===================================================== */

  flames.forEach(
    function(flame){

      flame.style.opacity =
        "0";

      flame.style.animation =
        "none";

    }
  );


  /* =====================================================
     TITLE
  ===================================================== */

  titleText.textContent =
    "";


  /* =====================================================
     HIDE STEP 2
  ===================================================== */

  step2.style.display =
    "none";


  /* =====================================================
     SHOW STEP 3
  ===================================================== */

  step3.style.display =
    "block";


  /* =====================================================
     FIREWORK
  ===================================================== */

  pyro.style.display =
    "block";


  /* =====================================================
     STARS
  ===================================================== */

  spawnStars();


  /* =====================================================
     CLOSE MICROPHONE
  ===================================================== */

  if(stream){

    stream
      .getTracks()
      .forEach(
        function(track){

          track.stop();

        }
      );

  }


  if(
    audioContext &&
    audioContext.state !==
      "closed"
  ){

    audioContext.close();

  }

}


/* =========================================================
   STARS
========================================================= */

function spawnStars(){

  const STAR_COUNT =
    100;


  const vw =
    window.innerWidth;


  for(
    let i = 0;
    i < STAR_COUNT;
    i++
  ){

    const img =
      document.createElement("img");


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
      Math.random() *
      vw +
      "px";


    img.style.setProperty(
      "--drift1",
      (
        Math.random() *
        240 -
        120
      ) + "px"
    );


    img.style.setProperty(
      "--drift2",
      (
        Math.random() *
        360 -
        180
      ) + "px"
    );


    img.style.setProperty(
      "--drift3",
      (
        Math.random() *
        480 -
        240
      ) + "px"
    );


    img.style.setProperty(
      "--drift4",
      (
        Math.random() *
        600 -
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
      function(){

        img.remove();

      },
      (
        duration +
        delay
      ) * 1000 + 1000
    );

  }

}