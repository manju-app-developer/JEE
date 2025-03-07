document.addEventListener("DOMContentLoaded", () => {
    let totalQuestions = 75;
    let correctAnswers = parseInt(localStorage.getItem("jeeCorrect")) || 0;
    let wrongAnswers = parseInt(localStorage.getItem("jeeWrong")) || 0;
    let unattempted = totalQuestions - (correctAnswers + wrongAnswers);

    let score = (correctAnswers * 4) - (wrongAnswers * 1); // +4 for correct, -1 for wrong

    // Smooth Score Animation
    animateCounter("score", score, 1000);
    animateCounter("correct", correctAnswers, 800);
    animateCounter("wrong", wrongAnswers, 800);
    animateCounter("unattempted", unattempted, 800);

    // Rank Prediction
    let rank;
    if (score >= 300) rank = "🏆 Top 500";
    else if (score >= 250) rank = "🥇 Top 2000";
    else if (score >= 200) rank = "🥈 Top 5000";
    else if (score >= 150) rank = "🥉 Top 10,000";
    else if (score >= 100) rank = "🔹 Top 50,000";
    else rank = "📉 Needs Improvement";

    document.getElementById("rank").innerText = rank;

    // 🎉 Confetti Animation for High Scores
    if (score >= 250) {
        startConfetti();
    }

    // 📊 Performance Chart
    renderPerformanceChart(correctAnswers, wrongAnswers, unattempted);

    // Smooth fade-in effect for better UI experience
    document.querySelector(".result-container").style.opacity = "1";
});

// 🏆 Smooth Number Counter Animation
function animateCounter(id, targetValue, duration) {
    let element = document.getElementById(id);
    let startValue = 0;
    let increment = Math.ceil(targetValue / (duration / 16)); // Adjust based on frame rate

    let counter = setInterval(() => {
        startValue += increment;
        if (startValue > targetValue) startValue = targetValue;
        element.innerText = startValue;

        if (startValue >= targetValue) {
            clearInterval(counter);
        }
    }, 16); // Approx. 60 FPS
}

// 📊 Render Performance Chart using Chart.js
function renderPerformanceChart(correct, wrong, unattempted) {
    let ctx = document.getElementById("performanceChart").getContext("2d");
    new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["✅ Correct", "❌ Wrong", "⚪ Unattempted"],
            datasets: [{
                data: [correct, wrong, unattempted],
                backgroundColor: ["#28a745", "#dc3545", "#ffc107"],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                animateScale: true
            },
            plugins: {
                legend: {
                    position: "bottom"
                }
            }
        }
    });
}

// 🎉 Confetti Effect for High Scores
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

// 🔄 Reset Test and Clear Data
function resetTest() {
    localStorage.clear();
    window.location.href = "index.html";
}
