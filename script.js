let questions = [];
let answers = {};
let markedForReview = {};
let timer;

// Load Questions Based on Year Selection
function loadYearwiseTest() {
    let yearFile = document.getElementById("yearSelect").value;
    
    fetch(`data/${yearFile}`)
        .then(response => response.json())
        .then(data => {
            questions = [...data.physics, ...data.chemistry, ...data.math];
            displayQuestions();
            startTimer(3 * 60 * 60);
        });
}

// Display Questions
function displayQuestions() {
    let questionContainer = document.getElementById("questions");
    let navContainer = document.getElementById("question-nav");

    questionContainer.innerHTML = "";
    navContainer.innerHTML = "";

    questions.forEach((q, index) => {
        let imageHTML = q.image ? `<img src="${q.image}" class="question-image" alt="Question Image">` : "";
        
        let optionsHTML = q.type === "mcq"
            ? q.options.map((opt, i) => `<label><input type="radio" name="q${q.id}" value="${i}" onchange="saveAnswer(${q.id}, ${i})"> ${opt}</label><br>`).join("")
            : `<input type="number" id="q${q.id}" oninput="saveAnswer(${q.id}, this.value)">`;

        questionContainer.innerHTML += `
            <div class="question" id="question${q.id}">
                <p><b>Q${index + 1}:</b> ${q.question}</p>
                ${imageHTML}
                ${optionsHTML}
                <button onclick="markForReview(${q.id})">Mark for Review</button>
            </div>
        `;

        navContainer.innerHTML += `<button onclick="jumpTo(${q.id})" id="nav${q.id}">${index + 1}</button>`;
    });
}

// Save Answers
function saveAnswer(qid, ans) {
    answers[qid] = ans;
    document.getElementById(`nav${qid}`).style.background = "#28a745";
}

// Mark for Review
function markForReview(qid) {
    markedForReview[qid] = !markedForReview[qid]; 
    document.getElementById(`nav${qid}`).style.background = markedForReview[qid] ? "#ffc107" : "";
}

// Timer Function
function startTimer(seconds) {
    clearInterval(timer);
    timer = setInterval(() => {
        let hours = Math.floor(seconds / 3600);
        let minutes = Math.floor((seconds % 3600) / 60);
        let secs = seconds % 60;

        document.getElementById("timer").innerText = `Time Left: ${hours}:${minutes}:${secs}`;
        if (seconds <= 0) {
            clearInterval(timer);
            submitTest();
        }
        seconds--;
    }, 1000);
}

// Submit & Calculate Score
function submitTest() {
    let score = 0;
    questions.forEach(q => {
        if (answers[q.id] == q.correct) score++;
    });
    
    localStorage.setItem("jeeScore", score);
    window.location.href = "result.html";
}

// Jump to a Question
function jumpTo(qid) {
    document.getElementById(`question${qid}`).scrollIntoView({ behavior: "smooth" });
}

document.addEventListener("DOMContentLoaded", loadYearwiseTest);
