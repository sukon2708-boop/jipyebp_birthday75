const modalBackdrop = document.getElementById("modalBackdrop");
const closeBtn = document.getElementById("closeModalBtn");
const openLetter = document.getElementById("openLetter");
const readBtn = document.getElementById("readBtn");
const letterText = document.getElementById("letterText");

// ✅ ข้อความจดหมาย
const MESSAGE = `
🎉🎉🎉🎂🎂🎂สุขสันต์วันเกิดนะคะตัวจ๋า ขอให้เทอมีความสุขมากๆๆๆ 
ขอให้ทุกคนใจดีกับเทอ  ขอให้พรใดอันประเสริฐจงเกิดกับเทอผู้เป็นที่รักของเค้า  
ร่ำรวยเงินทอง คิดสิ่งใดก็ขอให้สมความปรารถนา สุขภาพแข็งแรง รักเทอนะ 
จะคอยอยู่ข้างๆเทอไปแบบนี้ตลอดเลย
 Happy birthday to my love.🐳❤️🐙 รักนะม๊วฟๆๆๆ

`;

// 🔓 เปิด modal
function openModal(){
  letterText.textContent = MESSAGE.trim();
  modalBackdrop.style.display = "flex";
}

// ❌ ปิด modal
function closeModal(){
  modalBackdrop.style.display = "none";
}

// ===== EVENTS =====
if(openLetter){
  openLetter.addEventListener("click", openModal);
}

if(readBtn){
  readBtn.addEventListener("click", openModal);
}

if(closeBtn){
  closeBtn.addEventListener("click", closeModal);
}

// กดพื้นหลังเพื่อปิด
modalBackdrop.addEventListener("click", (e)=>{
  if(e.target === modalBackdrop){
    closeModal();
  }
});
