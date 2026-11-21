
/* ==========================================
   ARCANIS: ENERGY TRACKER v0.3
   THE IDENTITY UPDATE
========================================== */

const MARK_COUNT = 15;

// Each player has 15 independent Energy counters.
const createPlayer = () => Array(MARK_COUNT).fill(0);

let players = [
    createPlayer(),
    createPlayer()
];

// Undo history.
let history = [];

// Local browser storage.
const SAVE_KEY = "arcanis-energy-tracker-v02";


// ==========================================
// SAVE AND LOAD
// ==========================================

function saveGame() {
    localStorage.setItem(
        SAVE_KEY,
        JSON.stringify(players)
    );
}

function loadGame() {
    try {
        const saved = localStorage.getItem(SAVE_KEY);

        if (!saved) return;

        const parsed = JSON.parse(saved);

        if (
            Array.isArray(parsed) &&
            parsed.length === 2 &&
            parsed.every(player =>
                Array.isArray(player) &&
                player.length === MARK_COUNT &&
                player.every(value =>
                    Number.isInteger(value) && value >= 0
                )
            )
        ) {
            players = parsed;
        }

    } catch (error) {
        console.error("Could not load saved game:", error);
    }
}


// ==========================================
// GENERATE ENERGY COUNTERS
// ==========================================

function createEnergyGrid(playerNumber) {

    const grid = document.getElementById(
        `grid${playerNumber}`
    );

    if (!grid) {
        console.error(`Could not find grid${playerNumber}`);
        return;
    }

    grid.innerHTML = "";

    for (let i = 0; i < MARK_COUNT; i++) {

        const cell = document.createElement("div");

        cell.className = "energy-cell";

        const markNumber = String(i + 1).padStart(2, "0");

        cell.innerHTML = `
            <div
                class="energy-count"
                id="count-${playerNumber}-${i}">
                0
            </div>

            <button
                type="button"
                class="mark-button"
                data-player="${playerNumber}"
                data-mark="${i}"
                aria-label="Subtract one Energy from Player ${playerNumber}, Mark ${i + 1}"
                style="
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 100%;
                    height: 68px;
                    padding: 0;
                    border: none;
                    border-radius: 0;
                    background: transparent;
                    cursor: pointer;
                ">

                <img
                    class="mark-icon"
                    src="assets/mark-${markNumber}.png"
                    alt="Mark ${i + 1}"
                    draggable="false"
                    style="
                        display: block;
                        width: 58px;
                        height: 58px;
                        object-fit: contain;
                    ">
            </button>

            <button
                type="button"
                class="add-button"
                data-player="${playerNumber}"
                data-mark="${i}"
                aria-label="Add one Energy to Player ${playerNumber}, Mark ${i + 1}">
                +
            </button>
        `;

        grid.appendChild(cell);
    }
}


// ==========================================
// UPDATE THE DISPLAY
// ==========================================

function updateDisplay() {

    for (let p = 0; p < 2; p++) {

        let total = 0;

        for (let m = 0; m < MARK_COUNT; m++) {

            const amount = players[p][m];

            const counter = document.getElementById(
                `count-${p + 1}-${m}`
            );

            if (counter) {
                counter.textContent = amount;
            }

            total += amount;
        }

        const totalDisplay = document.getElementById(
            `total${p + 1}`
        );

        if (totalDisplay) {
            totalDisplay.textContent = total;
        }
    }

    saveGame();
}


// ==========================================
// UNDO HISTORY
// ==========================================

function rememberState() {

    history.push(JSON.stringify(players));

    // Limit history to 100 actions.
    if (history.length > 100) {
        history.shift();
    }
}


// ==========================================
// ADD OR SUBTRACT ENERGY
// ==========================================

function changeEnergy(player, mark, amount) {

    const p = player - 1;

    // Never allow negative Energy.
    if (players[p][mark] + amount < 0) {
        return;
    }

    rememberState();

    players[p][mark] += amount;

    updateDisplay();
}


// ==========================================
// BUTTON INTERACTIONS
// ==========================================

document.addEventListener("click", function(event) {

    const button = event.target.closest(
        ".add-button, .mark-button"
    );

    if (!button) return;

    const player = Number(button.dataset.player);
    const mark = Number(button.dataset.mark);

    if (
        !Number.isInteger(player) ||
        player < 1 ||
        player > 2 ||
        !Number.isInteger(mark) ||
        mark < 0 ||
        mark >= MARK_COUNT
    ) {
        return;
    }

    if (button.classList.contains("add-button")) {

        // Gain one Energy.
        changeEnergy(player, mark, 1);

    } else {

        // Spend one Energy.
        changeEnergy(player, mark, -1);
    }
});


// ==========================================
// RESET INDIVIDUAL PLAYER
// ==========================================

document.querySelectorAll("[data-reset]").forEach(button => {

    button.addEventListener("click", function() {

        const player = Number(this.dataset.reset);
        const index = player - 1;

        if (index < 0 || index > 1) return;

        if (players[index].every(value => value === 0)) {
            return;
        }

        if (!confirm(
            `Reset all Energy for Player ${player}?`
        )) {
            return;
        }

        rememberState();

        players[index] = createPlayer();

        updateDisplay();
    });
});


// ==========================================
// UNDO LAST ACTION
// ==========================================

document.getElementById("undoButton")
    .addEventListener("click", function() {

        if (history.length === 0) return;

        players = JSON.parse(history.pop());

        updateDisplay();
    });


// ==========================================
// RESET BOTH PLAYERS
// ==========================================

document.getElementById("resetAllButton")
    .addEventListener("click", function() {

        if (!confirm(
            "Reset all Energy for both players?"
        )) {
            return;
        }

        rememberState();

        players = [
            createPlayer(),
            createPlayer()
        ];

        updateDisplay();
    });


// ==========================================
// START APPLICATION
// ==========================================

function startApp() {

    loadGame();

    createEnergyGrid(1);
    createEnergyGrid(2);

    updateDisplay();
}

startApp();
