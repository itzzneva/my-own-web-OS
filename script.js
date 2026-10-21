
const timeEl = document.getElementById("timeElement");
function tick() {
  timeEl.textContent = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
tick(); setInterval(tick, 1000);
 
// ---------- Window manager ----------
let topZ = 10;
function bringToFront(win) { win.style.zIndex = ++topZ; }
 
function openWindow(id) {
  const win = document.getElementById(id);
  win.classList.remove("hidden");
  bringToFront(win);
}
 
document.querySelectorAll(".window").forEach(win => {
  const header = win.querySelector(".windowheader");
  win.addEventListener("mousedown", () => bringToFront(win));
 
  win.querySelector(".closebutton").addEventListener("click", () => win.classList.add("hidden"));
 
  // dragging
  header.addEventListener("pointerdown", e => {
    if (e.target.classList.contains("closebutton")) return;
    const rect = win.getBoundingClientRect();
    const dx = e.clientX - rect.left, dy = e.clientY - rect.top;
    // convert calc() positions to plain pixels so dragging works
    win.style.left = rect.left + "px";
    win.style.top = rect.top + "px";
    header.setPointerCapture(e.pointerId);
    const move = ev => {
      win.style.left = Math.max(0, ev.clientX - dx) + "px";
      win.style.top = Math.max(32, ev.clientY - dy) + "px";
    };
    const up = () => {
      header.removeEventListener("pointermove", move);
      header.removeEventListener("pointerup", up);
    };
    header.addEventListener("pointermove", move);
    header.addEventListener("pointerup", up);
  });
});
 
document.querySelectorAll("[data-open]").forEach(icon =>
  icon.addEventListener("click", () => openWindow(icon.dataset.open)));
document.getElementById("welcomeopen").addEventListener("click", () => openWindow("welcome"));
 
// ---------- Calculator ----------
const display = document.getElementById("display");
const keyLayout = [
  "AC","C","%","/",
  "7","8","9","*",
  "4","5","6","-",
  "1","2","3","+",
  "00","0",".","="
];
const keysEl = document.getElementById("keys");
keyLayout.forEach(k => {
  const b = document.createElement("button");
  b.textContent = k;
  if ("/*-+".includes(k)) b.className = "op";
  if (k === "=") b.className = "eq";
  b.addEventListener("click", () => pressKey(k));
  keysEl.appendChild(b);
});
 
function calculate(expr) {
  // only allow digits, operators, dots, parentheses
  if (!/^[0-9+\-*/.() ]+$/.test(expr)) return "Error";
  try {
    const r = Function('"use strict"; return (' + expr + ')')();
    return Number.isFinite(r) ? String(+r.toFixed(10)) : "Error";
  } catch { return "Error"; }
}
function pressKey(k) {
  if (display.value === "Error") display.value = "";
  if (k === "AC") display.value = "";
  else if (k === "C") display.value = display.value.slice(0, -1);
  else if (k === "%") display.value = calculate(display.value + "/100");
  else if (k === "=") display.value = display.value ? calculate(display.value) : "";
  else display.value += k;
}
 
// ---------- Notes ----------
const noteList = document.getElementById("noteList");
const noteText = document.getElementById("noteText");
let notes = [{ text: "My first note" }];
let current = 0;
 
function renderNotes() {
  noteList.innerHTML = "";
  notes.forEach((n, i) => {
    const li = document.createElement("li");
    li.textContent = n.text.split("\n")[0] || "Untitled";
    if (i === current) li.classList.add("active");
    li.addEventListener("click", () => { current = i; noteText.value = notes[i].text; renderNotes(); });
    noteList.appendChild(li);
  });
}
document.getElementById("newNote").addEventListener("click", () => {
  notes.push({ text: "" }); current = notes.length - 1; noteText.value = ""; renderNotes(); noteText.focus();
});
noteText.addEventListener("input", () => { notes[current].text = noteText.value; renderNotes(); });
noteText.value = notes[0].text;
renderNotes();
 
// ---------- Shopping list ----------
const shopInput = document.getElementById("shoppinginput");
const shopList = document.getElementById("shoppinglist");
let items = [];
 
function renderItems() {
  shopList.innerHTML = "";
  items.forEach((it, i) => {
    const li = document.createElement("li");
    if (it.done) li.classList.add("done");
    const span = document.createElement("span");
    span.textContent = it.text;
    span.addEventListener("click", () => { it.done = !it.done; renderItems(); });
    const del = document.createElement("button");
    del.textContent = "✕";
    del.addEventListener("click", () => { items.splice(i, 1); renderItems(); });
    li.append(span, del);
    shopList.appendChild(li);
  });
}
function addItem() {
  const t = shopInput.value.trim();
  if (!t) return;
  items.push({ text: t, done: false });
  shopInput.value = "";
  renderItems();
}
document.getElementById("shoppingadd").addEventListener("click", addItem);
shopInput.addEventListener("keydown", e => { if (e.key === "Enter") addItem(); });
 