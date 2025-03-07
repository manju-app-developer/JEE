let questions = [];
let answers = JSON.parse(localStorage.getItem("jeeAnswers")) || {};
let markedForReview = JSON.parse(localStorage.getItem("jeeReview")) || {};
let totalQuestions = 75;
let timeLeft = 3 * 60 * 60; // 3 hours in seconds
let timer;

// Load Questions Based on Year Selection
function loadYearwiseTest() {
    let yearFile = document.getElementById("yearSelect").value;

    fetch(`data/${yearFile}`)
        .then(response => response.json())
        .then(data => {
            questions = [...data.physics, ...data.chemistry, ...data.math];
            displayQuestions();
            startTimer(timeLeft);
            updateProgress();
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
            ? q.options.map((opt, i) => 
                `<label><input type="radio" name="q${q.id}" value="${i}" ${answers[q.id] == i ? "checked" : ""} 
                onchange="saveAnswer(${q.id}, ${i})"> ${opt}</label><br>`).join("")
            : `<input type="number" id="q${q.id}" value="${answers[q.id] || ""}" oninput="saveAnswer(${q.id}, this.value)">`;

        questionContainer.innerHTML += `
            <div class="question" id="question${q.id}">
                <p><b>Q${index + 1}:</b> ${q.question}</p>
                ${imageHTML}
                ${optionsHTML}
                <button onclick="markForReview(${q.id})" class="${markedForReview[q.id] ? 'review-marked' : ''}">🔍 Mark for Review</button>
            </div>
        `;

        let navBtn = document.createElement("button");
        navBtn.innerText = index + 1;
        navBtn.id = `nav${q.id}`;
        navBtn.className = answers[q.id] ? "answered" : "";
        navBtn.onclick = () => jumpTo(q.id);
        navContainer.appendChild(navBtn);
    });
}

// Save Answer & Auto-Navigate
function saveAnswer(qid, ans) {
    answers[qid] = ans;
    localStorage.setItem("jeeAnswers", JSON.stringify(answers));
    document.getElementById(`nav${qid}`).classList.add("answered");
    updateProgress();
    autoScroll(qid);
}

// Auto Scroll to Next Question
function autoScroll(qid) {
    let index = questions.findIndex(q => q.id == qid);
    if (index < questions.length - 1) {
        document.getElementById(`question${questions[index + 1].id}`).scrollIntoView({ behavior: "smooth" });
    }
}

// Mark for Review with Visual Indicator
function markForReview(qid) {
    markedForReview[qid] = !markedForReview[qid];
    localStorage.setItem("jeeReview", JSON.stringify(markedForReview));
    let btn = document.getElementById(`nav${qid}`);
    btn.classList.toggle("review-marked", markedForReview[qid]);
}

// Timer Function with Auto-Submit
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

// Submit Test & Calculate Score
function submitTest() {
    let score = 0, correct = 0, wrong = 0, unattempted = 0;

    questions.forEach(q => {
        if (answers[q.id] !== undefined) {
            if (q.type === "mcq") {
                if (parseInt(answers[q.id]) === q.correct) {
                    score += 4;
                    correct++;
                } else {
                    score -= 1;
                    wrong++;
                }
            } else if (q.type === "numerical") {
                if (parseFloat(answers[q.id]) === parseFloat(q.correct)) {
                    score += 4;
                    correct++;
                } else {
                    score -= 1;
                    wrong++;
                }
            }
        } else {
            unattempted++;
        }
    });

    localStorage.setItem("jeeScore", score);
    localStorage.setItem("jeeCorrect", correct);
    localStorage.setItem("jeeWrong", wrong);
    localStorage.setItem("jeeUnattempted", unattempted);
    
    window.location.href = "result.html";
}

// Jump to a Question with Smooth Scroll
function jumpTo(qid) {
    document.getElementById(`question${qid}`).scrollIntoView({ behavior: "smooth" });
}

// Update Progress Bar
function updateProgress() {
    let completed = Object.keys(answers).length;
    let progress = Math.round((completed / totalQuestions) * 100);
    document.getElementById("progress-bar").style.width = `${progress}%`;
    document.getElementById("progress-text").innerText = `${progress}% Completed`;
}

// Toggle Dark Mode with Smooth Transition
function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
}

// Reset Test Data & Restart Test
function resetTest() {
    if (confirm("Are you sure you want to reset the test? All answers will be lost!")) {
        localStorage.removeItem("jeeAnswers");
        localStorage.removeItem("jeeReview");
        localStorage.removeItem("jeeCorrect");
        localStorage.removeItem("jeeWrong");
        localStorage.removeItem("jeeUnattempted");
        localStorage.removeItem("jeeScore");
        location.reload();
    }
}

document.addEventListener("DOMContentLoaded", loadYearwiseTest);
