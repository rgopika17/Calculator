// ---------- Calculator operations (one JavaScript function each) ----------
function add(a, b)      { return a + b; }
function subtract(a, b) { return a - b; }
function multiply(a, b) { return a * b; }
function divide(a, b)   { return b === 0 ? null : a / b; }   // null = divide by zero

function operate(a, b, op) {
  switch (op) {
    case "+": return add(a, b);
    case "-": return subtract(a, b);
    case "×": return multiply(a, b);
    case "÷": return divide(a, b);
    default:  return b;
  }
}

// ---------- State ----------
let current = "0";      // number being typed / shown
let previous = null;    // first operand
let operator = null;    // pending operator
let resetNext = false;  // next digit starts a fresh number
let lastExpr = "";      // text of the last finished calculation

const resultEl = document.getElementById("result");
const exprEl = document.getElementById("expr");

// ---------- Helpers ----------
function format(n) {
  return String(parseFloat(Number(n).toPrecision(12)));
}

function updateDisplay() {
  resultEl.textContent = current;
  const len = current.length;
  resultEl.style.fontSize = len > 12 ? "1.6rem" : len > 9 ? "2rem" : "3rem";
  exprEl.textContent = operator !== null ? format(previous) + " " + operator : lastExpr;
}

function showError() {
  current = "Error";
  previous = null;
  operator = null;
  lastExpr = "Cannot divide by 0";
  resetNext = true;
  updateDisplay();
}

// ---------- Actions ----------
function inputDigit(d) {
  if (current === "Error") clearAll();
  if (resetNext) { current = d; resetNext = false; lastExpr = ""; }
  else if (current.replace(/[-.]/g, "").length < 12) { current = current === "0" ? d : current + d; }
  updateDisplay();
}

function inputDot() {
  if (current === "Error") clearAll();
  if (resetNext) { current = "0."; resetNext = false; lastExpr = ""; }
  else if (!current.includes(".")) { current += "."; }
  updateDisplay();
}

function chooseOperator(op) {
  if (current === "Error") return;
  if (operator !== null && !resetNext) {       // chain: 2 + 3 + ...
    compute();
    if (current === "Error") return;
  }
  previous = parseFloat(current);
  operator = op;
  resetNext = true;
  updateDisplay();
}

function compute() {
  if (operator === null) return;
  const b = parseFloat(current);
  const r = operate(previous, b, operator);
  if (r === null) { showError(); return; }
  lastExpr = format(previous) + " " + operator + " " + format(b) + " =";
  current = format(r);
  previous = null;
  operator = null;
  resetNext = true;
  updateDisplay();
}

function deleteLast() {
  if (resetNext || current === "Error") return;
  current = current.length > 1 ? current.slice(0, -1) : "0";
  if (current === "-") current = "0";
  updateDisplay();
}

function clearAll() {
  current = "0"; previous = null; operator = null; resetNext = false; lastExpr = "";
  updateDisplay();
}

// ---------- Mouse input ----------
document.getElementById("keys").addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  if (btn.dataset.num !== undefined) inputDigit(btn.dataset.num);
  else if (btn.dataset.op) chooseOperator(btn.dataset.op);
  else if (btn.dataset.action === "dot") inputDot();
  else if (btn.dataset.action === "equals") compute();
  else if (btn.dataset.action === "delete") deleteLast();
  else if (btn.dataset.action === "clear") clearAll();
});

// ---------- Keyboard input (extra credit) ----------
function flash(selector) {
  const btn = document.querySelector(selector);
  if (!btn) return;
  btn.classList.add("pressed");
  setTimeout(() => btn.classList.remove("pressed"), 120);
}

document.addEventListener("keydown", (e) => {
  const k = e.key;
  if (k >= "0" && k <= "9") { inputDigit(k); flash('[data-num="' + k + '"]'); }
  else if (k === ".") { inputDot(); flash('[data-action="dot"]'); }
  else if (["+", "-", "*", "/"].includes(k)) {
    const op = { "+": "+", "-": "-", "*": "×", "/": "÷" }[k];
    e.preventDefault();
    chooseOperator(op);
    flash('[data-op="' + op + '"]');
  }
  else if (k === "Enter" || k === "=") { e.preventDefault(); compute(); flash('[data-action="equals"]'); }
  else if (k === "Backspace") { deleteLast(); flash('[data-action="delete"]'); }
  else if (k === "Escape" || k.toLowerCase() === "c") { clearAll(); flash('[data-action="clear"]'); }
});

updateDisplay();
