/* CODSOFT Level 1 - Calculator
 * Features:
 * - Click + keyboard input
 * - CSS Grid layout
 * - Clear (AC), Delete (DEL), decimal, + − × ÷, equals
 * - Prevents multiple decimals & invalid operator chains
 * - Rounds floating results to avoid precision noise
 * - Simple, readable logic (no eval)
 */

const previousEl = document.getElementById('previous');
const currentEl  = document.getElementById('current');
const keys = document.querySelector('.keys');

let current = '0';
let previous = '';
let operator = null;
let justEvaluated = false;

function updateDisplay() {
  previousEl.textContent = previous;
  currentEl.textContent = current;
}

function clearAll() {
  current = '0';
  previous = '';
  operator = null;
  justEvaluated = false;
  updateDisplay();
}

function deleteOne() {
  if (justEvaluated) { // DEL after equals resets current
    current = '0';
    justEvaluated = false;
    updateDisplay();
    return;
  }
  if (current.length <= 1 || (current.length === 2 && current.startsWith('-'))) {
    current = '0';
  } else {
    current = current.slice(0, -1);
  }
  updateDisplay();
}

function appendDigit(d) {
  if (justEvaluated) {
    // Start a new input after equals
    current = d;
    justEvaluated = false;
    updateDisplay();
    return;
  }

  if (current === '0') {
    current = d; // replace leading zero
  } else {
    current += d;
  }
  updateDisplay();
}

function appendDecimal() {
  if (justEvaluated) {
    current = '0.';
    justEvaluated = false;
    updateDisplay();
    return;
  }
  if (!current.includes('.')) {
    current += (current === '' ? '0.' : '.');
    updateDisplay();
  }
}

function setOperator(op) {
  // If user presses operator right after another, replace it
  if (operator && !justEvaluated && previous && (current === '' || current === '-')) {
    operator = op;
    previous = previous.replace(/.$/, op);
    updateDisplay();
    return;
  }

  if (operator && !justEvaluated) {
    // Chain operations: compute previous op before setting new one
    compute();
  }

  operator = op;
  previous = `${current} ${op}`;
  current = '';
  justEvaluated = false;
  updateDisplay();
}

function compute() {
  if (operator === null) return;
  if (current === '') return;

  const a = parseFloat(previous);
  const b = parseFloat(current);
  if (Number.isNaN(a) || Number.isNaN(b)) return;

  let result;
  switch (operator) {
    case '+': result = a + b; break;
    case '−': result = a - b; break;
    case '×': result = a * b; break;
    case '÷':
      if (b === 0) {
        current = 'Error';
        previous = '';
        operator = null;
        justEvaluated = true;
        updateDisplay();
        return;
      }
      result = a / b;
      break;
    default: return;
  }

  // Round to mitigate floating point issues, then stringify
  result = roundTo(result, 12);
  current = String(result);
  previous = '';
  operator = null;
  justEvaluated = true;
  updateDisplay();
}

function roundTo(num, places = 12) {
  const p = Math.pow(10, places);
  return Math.round(num * p) / p;
}

// -------- Event handling (Clicks) --------
keys.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;

  if (btn.classList.contains('digit')) {
    appendDigit(btn.dataset.digit);
    return;
  }
  if (btn.classList.contains('decimal')) {
    appendDecimal();
    return;
  }
  if (btn.classList.contains('operator')) {
    setOperator(btn.dataset.operator);
    return;
  }

  const action = btn.dataset.action;
  switch (action) {
    case 'clear': clearAll(); break;
    case 'delete': deleteOne(); break;
    case 'equals': compute(); break;
    default: break;
  }
});

// -------- Keyboard support --------
document.addEventListener('keydown', (e) => {
  const { key } = e;

  // Digits
  if (/\d/.test(key)) {
    appendDigit(key);
    return;
  }

  // Decimal
  if (key === '.') {
    appendDecimal();
    return;
  }

  // Operators
  if (key === '+' || key === '-' || key === '*' || key === '/') {
    const opMap = { '+': '+', '-': '−', '*': '×', '/': '÷' };
    setOperator(opMap[key]);
    e.preventDefault();
    return;
  }

  // Enter/Return => equals
  if (key === 'Enter' || key === '=') {
    compute();
    e.preventDefault();
    return;
  }

  // Backspace => delete; Escape => clear
  if (key === 'Backspace') { deleteOne(); return; }
  if (key === 'Escape') { clearAll(); return; }
});

// Initialize
updateDisplay();
