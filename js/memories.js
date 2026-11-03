const gallery = document.getElementById("gallery");
const modalBackdrop = document.getElementById("modalBackdrop");
const bigImg = document.getElementById("bigImg");

const photos = [
  "assets/memoriesm1.jpeg",
  "assets/memoriesm2.jpeg",
  "assets/memoriesm3.jpeg",
  "assets/memoriesm4.jpeg",
  "assets/memoriesm5.jpeg",
  "assets/memoriesm6.jpeg",
  "assets/memoriesm7.jpeg",
  "assets/memoriesm8.jpeg",
  "assets/memoriesm9.jpeg",
];

photos.forEach(src=>{
  const img = document.createElement("img");
  img.className = "photo";
  img.src = src;
  img.alt = "memory";
  img.addEventListener("click", ()=>{
    bigImg.src = src;
    modalBackdrop.style.display = "flex";
  });
  gallery.appendChild(img);
});

document.getElementById("closeModalBtn").addEventListener("click", ()=>{
  modalBackdrop.style.display = "none";
});
modalBackdrop.addEventListener("click", (e)=>{
  if(e.target === modalBackdrop) modalBackdrop.style.display = "none";
});
