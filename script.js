let xp = 0;             // The player's current experience points
let health = 100;       // The player's current health
let gold = 50;          // The player's current gold
let currentWeapon = 0;  // The index of the player's currently equipped weapon
let fighting;          // The index of the monster the player is currently fighting
let monsterHealth;      // The current health of the monster being fought
let inventory = ["stick"]; // The player's inventory, which starts with just a stick

// Get references to the DOM elements we'll be using
const button1 = document.querySelector("#button1");
const button2 = document.querySelector("#button2");
const button3 = document.querySelector("#button3");
const text = document.querySelector("#text");
const xpText = document.querySelector("#xpText");
const healthText = document.querySelector("#healthText");
const goldText = document.querySelector("#goldText");
const monsterStats = document.querySelector("#monsterStats");
const monsterName = document.querySelector("#monsterName");
const monsterHealthText = document.querySelector("#monsterHealth");

// Define the weapons the player can use
const weapons = [
    { name: "stick", power: 5 },
    { name: "dagger", power: 30 },
    { name: "claw hammer", power: 50 },
    { name: "sword", power: 100 }
];

// Define the monsters the player can fight
const monsters = [
    { name: "slime", level: 2, health: 15 },
    { name: "fanged beast", level: 8, health: 60 },
    { name: "dragon", level: 20, health: 300 }
];

// Define the different locations the player can visit
const locations = [
    // Town square
    { name: "town square", "button text": ["Go to store", "Go to cave", "Fight dragon"], "button functions": [goStore, goCave, fightDragon], text: "You are in the town square. You see a sign that says \"Store\"." },
    // Store
    { name: "store", "button text": ["Buy 10 health (10 gold)", "Buy weapon (30 gold)", "Go to town square"], "button functions": [buyHealth, buyWeapon, goTown], text: "You enter the store." },
    // Cave
    { name: "cave", "button text": ["Fight slime", "Fight fanged beast", "Go to town square"], "button functions": [fightSlime, fightBeast, goTown], text: "You enter the cave. You see some monsters." },
    // Fight
    { name: "fight", "button text": ["Attack", "Dodge", "Run"], "button functions": [attack, dodge, goTown], text: "You are fighting a monster." },
    // Kill monster
    { name: "kill monster", "button text": ["Go to town square", "Go to town square", "Go to town square"], "button functions": [goTown, goTown, easterEgg], text: 'The monster screams "Arg!" as it dies. You gain experience points and find gold.' },
    // Lose
    { name: "lose", "button text": ["REPLAY?", "REPLAY?", "REPLAY?"], "button functions": [restart, restart, restart], text: "You die. &#x2620;" },
    // Win
    { name: "win", "button text": ["REPLAY?", "REPLAY?", "REPLAY?"], "button functions": [restart, restart, restart], text: "You defeat the dragon! YOU WIN THE GAME! &#x1F389;" },
    // Easter egg
    { name: "easter egg", "button text": ["2", "8", "Go to town square?"], "button functions": [pickTwo, pickEight, goTown], text: "You find a secret game. Pick a number above. Ten numbers will be randomly chosen between 0 and 10. If the number you choose matches one of the random numbers, you win!" }
];

// Initialize the buttons with their starting functions
button1.onclick = goStore;
button2.onclick = goCave;
button3.onclick = fightDragon;

// Update the game interface based on the current location
function update(location) {
    // Hide the monster stats by default
    monsterStats.style.display = "none";

    // Set the button text and onclick functions based on the current location
    button1.innerText = location["button text"][0];
    button2.innerText = location["button text"][1];
    button3.innerText = location["button text"][2];
    button1.onclick = location["button functions"][0];
    button2.onclick = location["button functions"][1];
    button3.onclick = location["button functions"][2];

    // Update the text in the main game area
    text.innerHTML = location.text;
}

// Functions for navigating the game world
function goTown() { update(locations[0]); }
function goStore() { update(locations[1]); }
function goCave() { update(locations[2]); }

// Functions for buying health and weapons
function buyHealth() {
    // Check if the player has enough gold to buy health
    if (gold >= 10) {
        // Deduct the cost, increase the player's health, and update the displays
        gold -= 10;
        health += 10;
        goldText.innerText = gold;
        healthText.innerText = health;
    } else {
        // Not enough gold, display a message
        text.innerText = "You do not have enough gold to buy health.";
    }
}

function buyWeapon() {
    // Check if the player can upgrade their weapon
    if (currentWeapon < weapons.length - 1) {
        // Check if the player has enough gold to buy a new weapon
        if (gold >= 30) {
            // Deduct the cost, upgrade the weapon, and update the displays
            gold -= 30;
            currentWeapon++;
            goldText.innerText = gold;
            let newWeapon = weapons[currentWeapon].name;
            text.innerText = "You now have a " + newWeapon + ".";
            inventory.push(newWeapon);
            text.innerText += " In your inventory you have: " + inventory;
        } else {
            // Not enough gold, display a message
            text.innerText = "You do not have enough gold to buy a weapon.";
        }
    } else {
        // Player already has the most powerful weapon, display a message
        text.innerText = "You already have the most powerful weapon!";
        button2.innerText = "Sell weapon for 15 gold";
        button2.onclick = sellWeapon();
    }
}

function sellWeapon() {
    // Check if the player has more than just the starting weapon
    if (inventory.length > 1) {
        // Sell the weapon, update the gold, and update the inventory display
        gold += 15;
        goldText.innerText = gold;
        let currentWeapon = inventory.shift();
        text.innerText = "You sold a " + currentWeapon + ".";
        text.innerText += " In your inventory you have: " + inventory;
    } else {
        // Player only has the starting weapon, don't allow selling it
        text.innerText = "Don't sell your only weapon!";
    }
}

// Functions for initiating and handling battles
function fightSlime() { fighting = 0; goFight(); }
function fightBeast() { fighting = 1; goFight(); }
function fightDragon() { fighting = 2; goFight(); }

function goFight() {
    // Switch to the fight location and set up the monster's stats
    update(locations[3]);
    monsterHealth = monsters[fighting].health;
    monsterStats.style.display = "block";
    monsterName.innerText = monsters[fighting].name;
    monsterHealthText.innerText = monsterHealth;
}

function attack() {
    // Describe the attack
    text.innerText = "The " + monsters[fighting].name + " attacks.";
    text.innerText += " You attack it with your " + weapons[currentWeapon].name + ".";

    // Calculate the damage done to the player
    health -= getMonsterAttackValue(monsters[fighting].level);

    // Check if the player's attack hits the monster
    if (isMonsterHit()) {
        // Calculate the damage done to the monster
        monsterHealth -= weapons[currentWeapon].power + Math.floor(Math.random() * xp) + 1;
    } else {
        // Player missed, display a message
        text.innerText += " You miss.";
    }

    // Update the player's and monster's health displays
    healthText.innerText = "Health: " + health;
    monsterHealthText.innerText = "Monster Health: " + monsterHealth;

    // Check if the player or monster has been defeated
    if (health <= 0) {
        lose();
    } else if (monsterHealth <= 0) {
        if (fighting === 2) {
            winGame();
        } else {
            defeatMonster();
        }
    }

    // There's a 10% chance that the player's weapon will break
    if (Math.random() <= 0.1 && inventory.length !== 1) {
        text.innerText += " Your " + inventory.pop() + " breaks.";
        currentWeapon--;
    }
}

function getMonsterAttackValue(level) {
    // Calculate the damage the monster deals to the player
    const hit = (level * 5) - (Math.floor(Math.random() * xp));
    return hit > 0 ? hit : 0;
}

function isMonsterHit() {
    // Determine if the player's attack hits the monster
    return Math.random() > 0.2 || health < 20;
}

function dodge() {
    // Describe the player dodging the monster's attack
    text.innerText = "You dodge the attack from the " + monsters[fighting].name;
}

// Functions for handling the outcome of battles
function defeatMonster() {
    // Award the player gold and experience points, then move to the next location
    gold += Math.floor(monsters[fighting].level * 6.7);
    xp += monsters[fighting].level;
    goldText.innerText = gold;
    xpText.innerText = xp;
    update(locations[4]);
}

function lose() {
    // Move to the lose location
    update(locations[5]);
}

function winGame() {
    // Move to the win location
    update(locations[6]);
}

// Function for restarting the game
function restart() {
    // Reset the player's stats and inventory, then move to the town square
    xp = 0;
    health = 100;
    gold = 50;
    inventory = ["stick"];
    currentWeapon = 0;
    goldText.innerText = gold;
    healthText.innerText = health;
    xpText.innerText = xp;
    goTown();
}

// Functions for the easter egg mini-game
function easterEgg() {
    // Move to the easter egg location
    update(locations[7]);
}

function pick(guess) {
    // Generate 10 random numbers between 0 and 10
    const numbers = [];
    while (numbers.length < 10) {
        numbers.push(Math.floor(Math.random() * 11));
    }

    // Display the numbers and check if the player's guess is correct
    text.innerText = "You picked " + guess + ". Here are the random numbers:\n";
    for (let i = 0; i < 10; i++) {
        text.innerText += numbers[i] + "\n";
    }
    if (numbers.includes(guess)) {
        // Player guessed correctly, award 20 gold
        text.innerText += "Right! You win 20 gold!";
        gold += 20;
        goldText.innerText = gold;
    } else {
        // Player guessed incorrectly, subtract 10 health
        text.innerText += "Wrong! You lose 10 health!";
        health -= 10;
        healthText.innerText = health;
        if (health <= 0) {
            lose();
        }
    }
}

function pickTwo() {
    // Call the pick function with a guess of 2
    pick(2);
}

function pickEight() {
    // Call the pick function with a guess of 8
    pick(8);
}