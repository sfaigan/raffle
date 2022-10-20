function setRaffleInfo(inProgress = false, numTickets = 0, drawn = []) {
  localStorage.setItem("inProgress", inProgress);
  localStorage.setItem("numTickets", numTickets);
  localStorage.setItem("drawn", JSON.stringify(drawn));
}

const getRaffleInfo = (key) => {
  switch (key) {
    case "inProgress":
      return localStorage.getItem("inProgress") === "true";
    case "numTickets":
      return parseInt(localStorage.getItem("numTickets"));
    case "drawn":
      return JSON.parse(localStorage.getItem("drawn"));
  }
}

const saveDrawnNumber = (number) => {
  const numbersDrawn = getRaffleInfo("drawn");
  numbersDrawn.push(number);
  localStorage.setItem("drawn", JSON.stringify(numbersDrawn));
}

const generateGrid = () => {
  const hideDrawnTickets = document.getElementById("toggle-filter").checked;
  const numTickets = getRaffleInfo("numTickets");
  const drawn = getRaffleInfo("drawn");
  const container = document.getElementById("grid");
  container.replaceChildren();
  const children = [];
  let gridCell;
  for (let i = 1; i <= numTickets; i++) {
    if (!hideDrawnTickets || (hideDrawnTickets && !drawn.includes(i))) {
      gridCell = document.createElement("div");
      gridCell.className = drawn.includes(i) ? "grid-cell drawn" : "grid-cell";
      gridCell.append(i.toString());
      container.append(gridCell);
    }
  }
}

const updateLastNumberDrawn = (number = null) => {
  const numberDrawn = document.getElementById("number-drawn");
  const text = number ? "Last Number Drawn: " + number.toString() : "Draw a number!";
  numberDrawn.innerText = text;
}

const generateRaffle = () => {
  const inProgress = getRaffleInfo("inProgress");
  if (inProgress) {
    generateGrid();
    const raffleMenu = document.getElementById("raffle-menu");
    raffleMenu.className = "menu";
    toggleStartMenu.call(document.getElementById("toggle-start-menu"));
  }
}

const handleStartNewRaffle = () => {
  const inProgress = getRaffleInfo("inProgress");
  if (inProgress && !confirm("Raffle in progress, are you sure you want to restart?")) {
    return false;
  }
  const numTickets = document.getElementById("number-tickets").value;
  setRaffleInfo(true, numTickets);
  const hideDrawnTickets = document.getElementById("toggle-filter");
  hideDrawnTickets.checked = false;
  generateRaffle();
  updateTicketCount();
  updateLastNumberDrawn();
  return false;
}

function toggleStartMenu() {
  this.classList.toggle("active");
  const panel = this.nextElementSibling;
  if (panel.style.maxHeight) {
    panel.style.maxHeight = null;
  } else {
    panel.style.maxHeight = panel.scrollHeight + "px";
  }
}

const updateTicketCount = () => {
  const numTickets = getRaffleInfo("numTickets");
  const numDrawn = getRaffleInfo("drawn").length;
  const numRemaining = numTickets - numDrawn;
  const elem = document.getElementById("ticket-count");
  elem.innerText = `Tickets Remaining: ${numRemaining}/${numTickets}`;
}

const handleDrawNumber = () => {
  const numTickets = getRaffleInfo("numTickets");
  const drawnNumbers = getRaffleInfo("drawn");
  if (drawnNumbers.length >= numTickets) {
    alert("No tickets left to draw!");
    return;
  }
  const remainingNumbers = [];
  for (let i = 1; i <= numTickets; i++) {
    if (!drawnNumbers.includes(i))
      remainingNumbers.push(i);
  }
  const number = remainingNumbers[Math.floor(Math.random() * remainingNumbers.length)];
  saveDrawnNumber(number);

  updateTicketCount();
  updateLastNumberDrawn(number);

  const popup = document.getElementById("number-drawn-popup");
  popup.innerText = number.toString();
  popup.classList.remove("zero-out");
  popup.classList.add("opaque");
  const drawNumberBtn = document.getElementById("draw-number");
  drawNumberBtn.toggleAttribute("disabled");
  setTimeout(function() {
    popup.addEventListener("transitionend", function() {
      drawNumberBtn.toggleAttribute("disabled");
      popup.classList.add("zero-out");
      popup.innerText = "";
      console.log("end");
    }, { once: true });
    popup.classList.toggle("opaque");
  }, 2000);

  const cell = document.querySelector(`#grid :nth-child(${number})`);
  cell.classList.toggle("drawn");

  const hideDrawnTickets = document.getElementById("toggle-filter").checked;
  if (hideDrawnTickets) {
    generateGrid();
  }
}

const handleFilter = () => {
  const drawnNumbers = getRaffleInfo("drawn");
  if (drawnNumbers.length) {
    generateGrid();
  }
}

const handleUploadLogo = (input) => {
  const file = input.files[0];

  const img = document.getElementById("logo");
  img.style.display = ""
  img.classList.add("obj");
  img.file = file;

  const reader = new FileReader();
  reader.onload = (e) => { img.src = e.target.result; };
  reader.readAsDataURL(file);
}

window.onload = () => {
  // Add toggleable start menu
  const startMenuBtn = document.getElementById("toggle-start-menu");
  startMenuBtn.addEventListener("click", toggleStartMenu);

  // Prevent form from refreshing page
  const handleForm = (event) => { event.preventDefault(); }
  const form = document.getElementById("start-form");
  form.addEventListener('submit', handleForm);

  const raffleMenu = document.getElementById("raffle-menu");

  if (getRaffleInfo("inProgress")) {
    // Resume existing raffle
    generateRaffle();
    toggleStartMenu.call(startMenuBtn);
    raffleMenu.className = "menu";
    updateTicketCount();
  } else {
    // Set up for new raffle
    setRaffleInfo();
    toggleStartMenu.call(startMenuBtn);
    raffleMenu.className = "menu hidden";
  }
}