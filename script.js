let questions = [];
let currentQuestionIndex = 0;
let answers = JSON.parse(localStorage.getItem("jeeAnswers")) || {};
let markedForReview = JSON.parse(localStorage.getItem("jeeReview")) || {};
let totalQuestions = 75;
let timeLeft = parseInt(localStorage.getItem("jeeTimeLeft")) || 3 * 60 * 60; // 3 hours
let timer;
let autoNavigate = true; // Auto-move to next question after answering

// Load Questions Based on Year Selection
function loadYearwiseTest() {
    let yearFile = document.getElementById("yearSelect").value;

    fetch(`data/${yearFile}`)
        .then(response => response.json())
        .then(data => {
            if (!data.physics || !data.chemistry || !data.math) {
                throw new Error("Invalid question format in JSON file.");
            }

            questions = [...data.physics, ...data.chemistry, ...data.math];
            totalQuestions = questions.length;

            if (totalQuestions > 0) {
                updateNavButtons();
                displayQuestion(0);
                startTimer();
            } else {
                document.getElementById("question-content").innerHTML = "<p>No questions available for this year.</p>";
            }
        })
        .catch(error => {
            console.error("Error loading questions:", error);
            document.getElementById("question-content").innerHTML = "<p>Error loading questions. Please try again.</p>";
        });
}

// Display One Question at a Time
function displayQuestion(index) {
    if (index < 0 || index >= totalQuestions || !questions[index]) return;

    let questionContainer = document.getElementById("question-content");
    let q = questions[index];

    let imageHTML = q.image ? `<img src="${q.image}" class="question-image" alt="Question Image">` : "";

    let optionsHTML = "";
    if (q.type === "mcq") {
        optionsHTML = q.options.map((opt, i) =>
            `<label>
                <input type="radio" name="q${q.id}" value="${i}" ${answers[q.id] == i ? "checked" : ""} 
                onchange="saveAnswer(${q.id}, ${i})"> ${opt}
            </label><br>`).join("");
    } else if (q.type === "numerical") {
        optionsHTML = `<input type="number" id="q${q.id}" value="${answers[q.id] || ""}" 
                       oninput="saveAnswer(${q.id}, this.value)">`;
    }

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

// Save Answer & Auto-Navigate
function saveAnswer(qid, ans) {
    answers[qid] = ans;
    localStorage.setItem("jeeAnswers", JSON.stringify(answers));
    updateProgress();
    updateNavButtons();

    if (autoNavigate && currentQuestionIndex < totalQuestions - 1) {
        nextQuestion();
    }
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

// Mark for Review
function markForReview(qid) {
    markedForReview[qid] = !markedForReview[qid];
    localStorage.setItem("jeeReview", JSON.stringify(markedForReview));
    updateNavButtons();
}

// Timer Function with Warning Popup
function startTimer() {
    clearInterval(timer);

    function updateTimerDisplay() {
        let hours = String(Math.floor(timeLeft / 3600)).padStart(2, '0');
        let minutes = String(Math.floor((timeLeft % 3600) / 60)).padStart(2, '0');
        let secs = String(timeLeft % 60).padStart(2, '0');
        document.getElementById("timer").innerText = `⏳ Time Left: ${hours}:${minutes}:${secs}`;
        document.getElementById("timer").classList.toggle("warning", timeLeft <= 600);

        if (timeLeft === 300) {
            alert("⚠️ Only 5 minutes remaining! Submit your test soon.");
        }
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

    window.location.href = "result.html";
}

// Initialize App
document.addEventListener("DOMContentLoaded", () => {
    applyDarkMode();
    loadYearwiseTest();
});
