document.addEventListener("DOMContentLoaded", () => {
    let totalQuestions = 75;
    let correctAnswers = parseInt(localStorage.getItem("jeeCorrect")) || 0;
    let wrongAnswers = parseInt(localStorage.getItem("jeeWrong")) || 0;
    let unattempted = totalQuestions - (correctAnswers + wrongAnswers);

    let score = (correctAnswers * 4) - (wrongAnswers * 1); // +4 for correct, -1 for wrong

    document.getElementById("score").innerText = score;
    document.getElementById("correct").innerText = correctAnswers;
    document.getElementById("wrong").innerText = wrongAnswers;
    document.getElementById("unattempted").innerText = unattempted;

    // Rank Prediction Logic (Rough Approximation)
    let rank;
    if (score >= 300) rank = "Top 500";
    else if (score >= 250) rank = "Top 2000";
    else if (score >= 200) rank = "Top 5000";
    else if (score >= 150) rank = "Top 10,000";
    else if (score >= 100) rank = "Top 50,000";
    else rank = "Needs Improvement";

    document.getElementById("rank").innerText = rank;

    // 🎉 Confetti Animation for High Scores
    if (score >= 250) {
        startConfetti();
    }

    // 🏆 Animate Circular Progress Bar
    let progressCircle = document.querySelector(".progress-ring-circle");
    let radius = progressCircle.r.baseVal.value;
    let circumference = 2 * Math.PI * radius;
    progressCircle.style.strokeDasharray = circumference;

    let progressPercent = Math.max(0, (score / 300) * 100); // Max score is 300
    let offset = circumference - (progressPercent / 100) * circumference;
    progressCircle.style.strokeDashoffset = offset;
});

// 🎉 Confetti Effect
function startConfetti() {
    let duration = 3 * 1000; // 3 seconds
    let end = Date.now() + duration;

    (function frame() {
        confetti({
            particleCount: 5,
            spread: 70,
            origin: { y: 0.6 }
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    })();
}
