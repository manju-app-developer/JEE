document.addEventListener("DOMContentLoaded", () => {
    let totalQuestions = 75;
    let correctAnswers = parseInt(localStorage.getItem("jeeCorrect")) || 0;
    let wrongAnswers = parseInt(localStorage.getItem("jeeWrong")) || 0;
    let unattempted = totalQuestions - (correctAnswers + wrongAnswers);

    let score = (correctAnswers * 4) - (wrongAnswers * 1); // +4 for correct, -1 for wrong

    // 🔥 Animate Score and Performance Stats
    animateCounter("score", score, 1200);
    animateCounter("correct", correctAnswers, 1000);
    animateCounter("wrong", wrongAnswers, 1000);
    animateCounter("unattempted", unattempted, 1000);

    // 🎯 Enhanced Rank Prediction Logic
    let rank;
    if (score >= 300) rank = "🏆 AIR 500 or Better";
    else if (score >= 250) rank = "🥇 AIR 2000";
    else if (score >= 200) rank = "🥈 AIR 5000";
    else if (score >= 150) rank = "🥉 AIR 10,000";
    else if (score >= 100) rank = "🔹 AIR 50,000";
    else rank = "📉 Needs More Practice";

    document.getElementById("rank").innerText = rank;

    // 🎉 Confetti Animation for High Scores (Celebration)
    if (score >= 250) {
        startConfetti();
    }

    // 📊 Render Performance Chart
    renderPerformanceChart(correctAnswers, wrongAnswers, unattempted);

    // 🎨 Fade-in Effect for Smooth UI Appearance
    document.querySelector(".result-container").style.opacity = "1";
});

// 🏆 Smooth Number Counter Animation
function animateCounter(id, targetValue, duration) {
    let element = document.getElementById(id);
    let startValue = 0;
    let stepTime = Math.abs(Math.floor(duration / targetValue));

    let counter = setInterval(() => {
        startValue++;
        element.innerText = startValue;
        if (startValue >= targetValue) {
            clearInterval(counter);
        }
    }, stepTime);
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
    if (confirm("Are you sure you want to reset the test? All answers will be lost!")) {
        localStorage.clear();
        window.location.href = "index.html";
    }
}
