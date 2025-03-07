document.addEventListener("DOMContentLoaded", () => {
    let totalQuestions = 75;
    let correctAnswers = parseInt(localStorage.getItem("jeeCorrect")) || 0;
    let wrongAnswers = parseInt(localStorage.getItem("jeeWrong")) || 0;
    let unattempted = totalQuestions - (correctAnswers + wrongAnswers);

    let score = (correctAnswers * 4) - (wrongAnswers * 1); // +4 for correct, -1 for wrong

    // 🔥 Smooth Score Animation
    animateCounter("score", score, 1200);
    animateCounter("correct", correctAnswers, 1000);
    animateCounter("wrong", wrongAnswers, 1000);
    animateCounter("unattempted", unattempted, 1000);

    // 🎯 Improved Rank Prediction Logic
    let rank = calculateRank(score);
    document.getElementById("rank").innerText = rank;

    // 🎉 Confetti Animation for High Scores
    if (score >= 250) startConfetti();

    // 📊 Render Performance Chart
    renderPerformanceChart(correctAnswers, wrongAnswers, unattempted);

    // 🎨 UI Fade-in Effect
    document.querySelector(".result-container").classList.add("fade-in");

    // 🔄 Event Listener for Reset Button
    document.getElementById("resetBtn").addEventListener("click", resetTest);
});

// 🏆 Advanced Rank Calculation
function calculateRank(score) {
    if (score >= 320) return "🏆 AIR 100 or Better";
    if (score >= 280) return "🥇 AIR 500";
    if (score >= 240) return "🥈 AIR 2000";
    if (score >= 200) return "🥉 AIR 5000";
    if (score >= 160) return "🔹 AIR 10,000";
    if (score >= 120) return "⚡ AIR 50,000";
    return "📉 Needs More Practice";
}

// 🏆 Smooth Animated Number Counter
function animateCounter(id, targetValue, duration) {
    let element = document.getElementById(id);
    let startValue = 0;
    let increment = Math.ceil(targetValue / (duration / 20));
    
    let counter = setInterval(() => {
        startValue += increment;
        if (startValue > targetValue) startValue = targetValue;
        element.innerText = startValue;
        if (startValue >= targetValue) clearInterval(counter);
    }, 20);
}

// 📊 Render Enhanced Performance Chart
function renderPerformanceChart(correct, wrong, unattempted) {
    let ctx = document.getElementById("performanceChart").getContext("2d");
    new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["✅ Correct", "❌ Wrong", "⚪ Unattempted"],
            datasets: [{
                data: [correct, wrong, unattempted],
                backgroundColor: ["#28a745", "#dc3545", "#ffc107"],
                borderWidth: 2,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                animateScale: true,
                animateRotate: true
            },
            plugins: {
                legend: {
                    position: "bottom",
                    labels: {
                        font: {
                            size: 14
                        }
                    }
                }
            }
        }
    });
}

// 🎉 Confetti Effect Upgrade
function startConfetti() {
    let duration = 3000; // 3 seconds
    let end = Date.now() + duration;
    (function frame() {
        confetti({
            particleCount: 8,
            spread: 80,
            origin: { y: 0.6 }
        });
        if (Date.now() < end) requestAnimationFrame(frame);
    })();
}

// 🔄 Reset Test and Clear Data
function resetTest() {
    if (confirm("Are you sure you want to reset the test? All answers will be lost!")) {
        localStorage.clear();
        window.location.href = "index.html";
    }
}
