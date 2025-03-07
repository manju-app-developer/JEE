let questions = [];
let currentQuestionIndex = 0;
let answers = JSON.parse(localStorage.getItem("jeeAnswers")) || {};
let markedForReview = JSON.parse(localStorage.getItem("jeeReview")) || {};
let totalQuestions = 75;
let timeLeft = parseInt(localStorage.getItem("jeeTimeLeft")) || 3 * 60 * 60; // 3 hours
let timer;

// Load Questions Based on Year Selection
function loadYearwiseTest() {
    let yearFile = document.getElementById("yearSelect").value;
    
    fetch(`data/${yearFile}`)
        .then(response => response.json())
        .then(data => {
            questions = [...data.physics, ...data.chemistry, ...data.math];
            totalQuestions = questions.length;
            if (totalQuestions > 0) {
                displayQuestion(0);
                updateNavButtons();
                updateProgress();
                startTimer();
            } else {
                console.error("No questions found in the selected file.");
            }
        })
        .catch(error => console.error("Error loading questions:", error));
}

// Display One Question at a Time
function displayQuestion(index) {
    if (index < 0 || index >= totalQuestions) return;
    
    let questionContainer = document.getElementById("question-content");
    let q = questions[index];

    if (!q) return;

    let imageHTML = q.image ? `<img src="${q.image}" class="question-image" alt="Question Image">` : "";
    
    let optionsHTML = q.type === "mcq"
        ? q.options.map((opt, i) => 
            `<label><input type="radio" name="q${q.id}" value="${i}" ${answers[q.id] == i ? "checked" : ""} 
            onchange="saveAnswer(${q.id}, ${i})"> ${opt}</label><br>`).join("")
        : `<input type="number" id="q${q.id}" value="${answers[q.id] || ""}" 
            oninput="saveAnswer(${q.id}, this.value)">`;

    questionContainer.innerHTML = `
        <div class="question">
            <p><b>Q${index + 1}:</b> ${q.question}</p>
            ${imageHTML}
            ${optionsHTML}
            <button onclick="markForReview(${q.id})" class="${markedForReview[q.id] ? 'review-marked' : ''}">
                ${markedForReview[q.id] ? "✅ Marked for Review" : "🔍 Mark for Review"}
            </button>
        </div>
    `;

    currentQuestionIndex = index;
    highlightNavButton(index);
    smoothScrollTo("question-content");
}

// Save Answer & Auto-Navigate
function saveAnswer(qid, ans) {
    answers[qid] = ans;
    localStorage.setItem("jeeAnswers", JSON.stringify(answers));
    updateProgress();
    updateNavButtons();
}

// Navigate Between Questions
function nextQuestion() {
    if (currentQuestionIndex < totalQuestions - 1) {
        displayQuestion(currentQuestionIndex + 1);
    }
}

function prevQuestion() {
    if (currentQuestionIndex > 0) {
        displayQuestion(currentQuestionIndex - 1);
    }
}

// Update Question Navigator
function updateNavButtons() {
    let navContainer = document.getElementById("question-nav");
    navContainer.innerHTML = "";

    questions.forEach((_, i) => {
        let navBtn = document.createElement("button");
        navBtn.innerText = i + 1;
        navBtn.classList.add("nav-btn");
        if (answers[i] !== undefined) navBtn.classList.add("answered");
        if (markedForReview[i]) navBtn.classList.add("review-marked");
        navBtn.onclick = () => displayQuestion(i);
        navContainer.appendChild(navBtn);
    });
}

// Highlight the Current Question Button
function highlightNavButton(index) {
    document.querySelectorAll(".nav-btn").forEach((btn, i) => {
        btn.classList.toggle("current-question", i === index);
    });
}

// Mark for Review
function markForReview(qid) {
    markedForReview[qid] = !markedForReview[qid];
    localStorage.setItem("jeeReview", JSON.stringify(markedForReview));
    updateNavButtons();
}

// Timer Function with Auto-Submit
function startTimer() {
    clearInterval(timer);

    function updateTimerDisplay() {
        let hours = Math.floor(timeLeft / 3600);
        let minutes = Math.floor((timeLeft % 3600) / 60);
        let secs = timeLeft % 60;
        document.getElementById("timer").innerText = `⏳ Time Left: ${hours}:${minutes}:${secs}`;
        document.getElementById("timer").classList.toggle("warning", timeLeft <= 600);
    }

    updateTimerDisplay();

    timer = setInterval(() => {
        if (timeLeft <= 0) {
            clearInterval(timer);
            submitTest();
        } else {
            timeLeft--;
            localStorage.setItem("jeeTimeLeft", timeLeft);
            updateTimerDisplay();
        }
    }, 1000);
}

// Submit Test & Calculate Score
function submitTest() {
    let correct = 0, wrong = 0, unattempted = 0;

    questions.forEach(q => {
        if (answers[q.id] !== undefined) {
            if (q.type === "mcq") {
                correct += parseInt(answers[q.id]) === q.correct ? 1 : 0;
                wrong += parseInt(answers[q.id]) !== q.correct ? 1 : 0;
            } else if (q.type === "numerical") {
                correct += parseFloat(answers[q.id]) === parseFloat(q.correct) ? 1 : 0;
                wrong += parseFloat(answers[q.id]) !== parseFloat(q.correct) ? 1 : 0;
            }
        } else {
            unattempted++;
        }
    });

    let score = (correct * 4) - (wrong * 1); // Max Score = 300

    localStorage.setItem("jeeScore", score);
    localStorage.setItem("jeeCorrect", correct);
    localStorage.setItem("jeeWrong", wrong);
    localStorage.setItem("jeeUnattempted", unattempted);
    localStorage.setItem("jeeReviewAnswers", JSON.stringify(answers));

    window.location.href = "result.html";
}

// Update Progress Bar
function updateProgress() {
    let completed = Object.keys(answers).length;
    let progress = Math.round((completed / totalQuestions) * 100);
    document.getElementById("progressBar").style.width = `${progress}%`;
    document.getElementById("progress-text").innerText = `${progress}% Completed`;
}

// Toggle Dark Mode and Save Preference
function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem("darkMode", document.body.classList.contains("dark-mode") ? "enabled" : "disabled");
}

// Apply Dark Mode on Page Load
function applyDarkMode() {
    if (localStorage.getItem("darkMode") === "enabled") {
        document.body.classList.add("dark-mode");
    }
}

// Reset Test & Restart
function resetTest() {
    if (confirm("Are you sure you want to reset the test? All answers will be lost!")) {
        localStorage.clear();
        location.reload();
    }
}

// Review Answers Feature (On Result Page)
function loadReviewAnswers() {
    let reviewContainer = document.getElementById("review-questions");
    let storedAnswers = JSON.parse(localStorage.getItem("jeeReviewAnswers")) || {};

    reviewContainer.innerHTML = questions.map((q, index) => `
        <div class="question">
            <p><b>Q${index + 1}:</b> ${q.question}</p>
            <p><b>Your Answer:</b> ${storedAnswers[q.id] || "Not Answered"}</p>
            <p><b>Correct Answer:</b> ${q.type === "mcq" ? q.options[q.correct] : q.correct}</p>
            <hr>
        </div>`).join("");
}

// Smooth Scrolling to Element
function smoothScrollTo(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

// Initialize App
document.addEventListener("DOMContentLoaded", () => {
    applyDarkMode();
    loadYearwiseTest();
});
