let questions = [];
let currentQuestionIndex = 0;
let answers = JSON.parse(localStorage.getItem("jeeAnswers")) || {};
let markedForReview = JSON.parse(localStorage.getItem("jeeReview")) || {};
let totalQuestions = 75;
let timeLeft = 3 * 60 * 60; // 3 hours in seconds
let timer;

// 📌 Load Questions Based on Year Selection
function loadYearwiseTest() {
    let yearFile = document.getElementById("yearSelect").value;

    fetch(`data/${yearFile}`)
        .then(response => {
            if (!response.ok) throw new Error(`Failed to load: ${yearFile}`);
            return response.json();
        })
        .then(data => {
            questions = [...(data.physics || []), ...(data.chemistry || []), ...(data.math || [])];
            totalQuestions = questions.length;
            if (totalQuestions === 0) throw new Error("No questions found!");
            displayQuestion(0);
            updateProgress();
            startTimer(timeLeft);
            updateNavButtons();
        })
        .catch(error => {
            console.error("Error loading questions:", error);
            document.getElementById("question-content").innerHTML = `<p class="error">⚠️ Error loading questions: ${error.message}</p>`;
        });
}

// 📌 Display a Question
function displayQuestion(index) {
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
}

// 📌 Save Answer
function saveAnswer(qid, ans) {
    answers[qid] = ans;
    localStorage.setItem("jeeAnswers", JSON.stringify(answers));
    updateProgress();
}

// 📌 Navigation Functions
function nextQuestion() {
    if (currentQuestionIndex < totalQuestions - 1) {
        displayQuestion(++currentQuestionIndex);
    }
}

function prevQuestion() {
    if (currentQuestionIndex > 0) {
        displayQuestion(--currentQuestionIndex);
    }
}

// 📌 Update Question Navigator
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

// 📌 Highlight Current Question Button
function highlightNavButton(index) {
    document.querySelectorAll(".nav-btn").forEach((btn, i) => {
        btn.classList.toggle("current-question", i === index);
    });
}

// 📌 Mark Question for Review
function markForReview(qid) {
    markedForReview[qid] = !markedForReview[qid];
    localStorage.setItem("jeeReview", JSON.stringify(markedForReview));
    updateNavButtons();
}

// 📌 Start Timer with Auto-Submit
function startTimer(seconds) {
    clearInterval(timer);
    timer = setInterval(() => {
        let hours = Math.floor(seconds / 3600);
        let minutes = Math.floor((seconds % 3600) / 60);
        let secs = seconds % 60;

        document.getElementById("timer").innerText = `⏳ Time Left: ${hours}:${minutes}:${secs}`;

        if (seconds <= 600) document.getElementById("timer").classList.add("warning"); // Red alert for last 10 mins
        if (seconds <= 0) {
            clearInterval(timer);
            submitTest();
        }
        seconds--;
    }, 1000);
}

// 📌 Submit Test & Calculate Score
function submitTest() {
    let correct = 0, wrong = 0, unattempted = 0;

    questions.forEach(q => {
        if (answers[q.id] !== undefined) {
            if (q.type === "mcq") {
                if (parseInt(answers[q.id]) === q.correct) {
                    correct++;
                } else {
                    wrong++;
                }
            } else if (q.type === "numerical") {
                if (parseFloat(answers[q.id]) === parseFloat(q.correct)) {
                    correct++;
                } else {
                    wrong++;
                }
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
    localStorage.setItem("jeeReviewAnswers", JSON.stringify(answers)); // Store for review

    window.location.href = "result.html";
}

// 📌 Update Progress Bar
function updateProgress() {
    let completed = Object.keys(answers).length;
    let progress = Math.round((completed / totalQuestions) * 100);
    document.getElementById("progressBar").style.width = `${progress}%`;
    document.getElementById("progress-text").innerText = `${progress}% Completed`;
}

// 📌 Toggle Dark Mode
function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
}

// 📌 Reset Test
function resetTest() {
    if (confirm("Are you sure you want to reset the test? All answers will be lost!")) {
        localStorage.clear();
        location.reload();
    }
}

// 📌 Review Answers (On Result Page)
function loadReviewAnswers() {
    let reviewContainer = document.getElementById("review-questions");
    let storedAnswers = JSON.parse(localStorage.getItem("jeeReviewAnswers")) || {};

    reviewContainer.innerHTML = "";

    questions.forEach((q, index) => {
        let correctAnswer = q.type === "mcq" ? q.options[q.correct] : q.correct;
        let userAnswer = storedAnswers[q.id] !== undefined
            ? (q.type === "mcq" ? q.options[storedAnswers[q.id]] : storedAnswers[q.id])
            : "Not Answered";

        reviewContainer.innerHTML += `
            <div class="question">
                <p><b>Q${index + 1}:</b> ${q.question}</p>
                <p><b>Your Answer:</b> ${userAnswer}</p>
                <p><b>Correct Answer:</b> ${correctAnswer}</p>
                <hr>
            </div>
        `;
    });
}

// 📌 Load Review Page
if (window.location.pathname.includes("review.html")) {
    loadReviewAnswers();
} else {
    document.addEventListener("DOMContentLoaded", loadYearwiseTest);
    }
