function setRaffleInfo(inProgress = false, numTickets = 0, drawn = []) {
  localStorage.setItem("inProgress", inProgress);
  localStorage.setItem("numTickets", numTickets);
  localStorage.setItem("drawn", JSON.stringify(drawn));
}

function getRaffleInfo(key) {
  switch (key) {
    case "inProgress":
      return localStorage.getItem("inProgress") === "true";
    case "numTickets":
      return parseInt(localStorage.getItem("numTickets"));
    case "drawn":
      return JSON.parse(localStorage.getItem("drawn"));
  }
}

function saveDrawnNumber(number) {
  var numbersDrawn = getRaffleInfo("drawn");
  numbersDrawn.push(number);
  localStorage.setItem("drawn", JSON.stringify(numbersDrawn));
}

function generateGrid() {
  var hideDrawnTickets = document.getElementById("toggle-filter").checked;
  var numTickets = getRaffleInfo("numTickets");
  var drawn = getRaffleInfo("drawn");
  var container = document.getElementById("grid");
  container.replaceChildren();
  var children = [];
  for (var i = 1; i <= numTickets; i++) {
    if (!hideDrawnTickets || (hideDrawnTickets && !drawn.includes(i))) {
      var gridCell = document.createElement("div");
      gridCell.className = drawn.includes(i) ? "grid-cell drawn" : "grid-cell";
      gridCell.append(i.toString());
      container.append(gridCell);
    }
  }
}

function updateLastNumberDrawn(number = null) {
  var numberDrawn = document.getElementById("number-drawn");
  var text = number ? "Last Number Drawn: " + number.toString() : "Draw a number!";
  numberDrawn.innerText = text;
}

function generateRaffle() {
  var inProgress = getRaffleInfo("inProgress");
  if (inProgress) {
    generateGrid();
    var raffleMenu = document.getElementById("raffle-menu");
    raffleMenu.className = "menu";
    toggleStartMenu.call(document.getElementById("toggle-start-menu"));
  }
}

function handleStartNewRaffle() {
  var inProgress = getRaffleInfo("inProgress");
  if (inProgress && !confirm("Raffle in progress, are you sure you want to restart?")) {
    return false;
  }
  var numTickets = document.getElementById("number-tickets").value;
  setRaffleInfo(true, numTickets);
  var hideDrawnTickets = document.getElementById("toggle-filter");
  hideDrawnTickets.checked = false;
  generateRaffle();
  updateTicketCount();
  updateLastNumberDrawn();
  return false;
}

function toggleStartMenu() {
  this.classList.toggle("active");
  var panel = this.nextElementSibling;
  if (panel.style.maxHeight) {
    panel.style.maxHeight = null;
  } else {
    panel.style.maxHeight = panel.scrollHeight + "px";
  }
}

function updateTicketCount() {
  var numTickets = getRaffleInfo("numTickets");
  var numDrawn = getRaffleInfo("drawn").length;
  var numRemaining = numTickets - numDrawn;
  var elem = document.getElementById("ticket-count");
  elem.innerText = `Tickets Remaining: ${numRemaining}/${numTickets}`;
}

function handleDrawNumber() {
  var numTickets = getRaffleInfo("numTickets");
  var drawnNumbers = getRaffleInfo("drawn");
  if (drawnNumbers.length >= numTickets) {
    alert("No tickets left to draw!");
    return;
  }
  var remainingNumbers = [];
  for (var i = 1; i <= numTickets; i++) {
    if (!drawnNumbers.includes(i))
      remainingNumbers.push(i);
  }
  var number = remainingNumbers[Math.floor(Math.random() * remainingNumbers.length)];
  saveDrawnNumber(number);

  updateTicketCount();
  updateLastNumberDrawn(number);

  var popup = document.getElementById("number-drawn-popup");
  popup.innerText = number.toString();
  popup.classList.remove("zero-out");
  popup.classList.add("opaque");
  var drawNumberBtn = document.getElementById("draw-number");
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

  var cell = document.querySelector(`#grid :nth-child(${number})`);
  cell.classList.toggle("drawn");

  var hideDrawnTickets = document.getElementById("toggle-filter").checked;
  if (hideDrawnTickets) {
    generateGrid();
  }
}

function handleFilter() {
  var drawnNumbers = getRaffleInfo("drawn");
  if (drawnNumbers.length) {
    generateGrid();
  }
}

window.onload = function onLoad() {
  // Add toggleable start menu
  var startMenuBtn = document.getElementById("toggle-start-menu");
  startMenuBtn.addEventListener("click", toggleStartMenu);

  // Prevent form from refreshing page
  var form = document.getElementById("start-form");
  function handleForm(event) { event.preventDefault(); }
  form.addEventListener('submit', handleForm);

  var raffleMenu = document.getElementById("raffle-menu");

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