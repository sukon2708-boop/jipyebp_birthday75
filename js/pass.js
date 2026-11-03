const correctPass = "0411";
let input = "";

const digitsEl = document.getElementById("digits");
const keypadEl = document.getElementById("keypad");
const clearBtn = document.getElementById("clearBtn");

const modalBackdrop = document.getElementById("modalBackdrop");
const closeModalBtn = document.getElementById("closeModalBtn");

function renderDigits(){
  digitsEl.innerHTML = "";
  for(let i=0;i<4;i++){
    const d = document.createElement("div");
    d.className = "digit";
    d.textContent = input[i] ? "•" : "";
    digitsEl.appendChild(d);
  }
}

function checkPass(){
  if(input === correctPass){
    // ✅ ถูก → ไปหน้าถัดไป
    window.location.href = "gift.html";
  }else{
    modalBackdrop.style.display = "flex";
    input = "";
    renderDigits();
  }
}

for(let i=1;i<=9;i++){
  const btn = document.createElement("button");
  btn.className = "key";
  btn.textContent = i;
  btn.onclick = () => {
    if(input.length < 4){
      input += i;
      renderDigits();
      if(input.length === 4) checkPass();
    }
  };
  keypadEl.appendChild(btn);
}

// 0
const zero = document.createElement("button");
zero.className = "key key-zero";
zero.textContent = "0";
zero.onclick = () => {
  if(input.length < 4){
    input += "0";
    renderDigits();
    if(input.length === 4) checkPass();
  }
};
keypadEl.appendChild(zero);

clearBtn.onclick = () => {
  input = "";
  renderDigits();
};

closeModalBtn.onclick = () => {
  modalBackdrop.style.display = "none";
};

renderDigits();
