// --- 1. KHAI BÁO CÁC PHẦN TỬ GIAO DIỆN ---
const loadingScreen = document.getElementById('loading-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');
const statusText = document.getElementById('status-text');
const startBtn = document.getElementById('start-btn');
const shuffleCheckbox = document.getElementById('shuffle-checkbox');
const reviewContainer = document.getElementById('review-container');

const questionEl = document.getElementById('question');
const answerEls = document.querySelectorAll('.answer');
const a_text = document.getElementById('a_text');
const b_text = document.getElementById('b_text');
const c_text = document.getElementById('c_text');
const d_text = document.getElementById('d_text');
const submitBtn = document.getElementById('submit');

const currentCountSpan = document.getElementById('current-count');
const totalCountSpan = document.getElementById('total-count');
const liveScoreSpan = document.getElementById('live-score');
const progressBar = document.getElementById('progress-bar');

// --- 2. BIẾN DỮ LIỆU ---
let quizData = [];
let userAnswers = [];
let currentQuiz = 0;
let score = 0;
let isAnswered = false;

// Hàm trộn đề
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// --- 3. TẢI DỮ LIỆU JSON ---
async function loadQuestions() {
    try {
        const response = await fetch('questions.json');
        quizData = await response.json();
        statusText.innerText = `Đã sẵn sàng ${quizData.length} câu hỏi`;
        document.getElementById('setup-options').classList.remove('hidden');
    } catch (error) {
        statusText.innerText = "Lỗi: Không tải được câu hỏi!";
    }
}
loadQuestions();

// --- 4. BẮT ĐẦU ---
startBtn.addEventListener('click', () => {
    if (shuffleCheckbox.checked) shuffleArray(quizData);
    loadingScreen.classList.add('hidden');
    quizScreen.classList.remove('hidden');
    loadQuiz();
});

function loadQuiz() {
    deselectAnswers();
    isAnswered = false;
    submitBtn.disabled = true;

    const currentQuizData = quizData[currentQuiz];
    totalCountSpan.innerText = quizData.length;
    currentCountSpan.innerText = currentQuiz + 1;
    progressBar.style.width = `${(currentQuiz / quizData.length) * 100}%`;

    questionEl.innerText = currentQuizData.question;
    a_text.innerText = currentQuizData.options.a;
    b_text.innerText = currentQuizData.options.b;
    c_text.innerText = currentQuizData.options.c;
    d_text.innerText = currentQuizData.options.d;

    document.querySelectorAll('.option-item').forEach(li => {
        li.style.background = "#fff";
        li.style.borderColor = "#eee";
    });
}

function deselectAnswers() {
    answerEls.forEach(el => {
        el.checked = false;
        el.disabled = false;
    });
}

// --- 5. CHẤM ĐIỂM XANH ĐỎ TỨC THÌ ---
answerEls.forEach(el => {
    el.addEventListener('change', () => {
        if (isAnswered) return;
        isAnswered = true;

        const selectedAnswer = el.id;
        const correctAnswer = quizData[currentQuiz].answer.toLowerCase();
        
        const selectedLi = el.parentElement;
        const correctLi = document.getElementById(correctAnswer).parentElement;

        userAnswers.push({
            question: quizData[currentQuiz].question,
            selected: selectedAnswer,
            correct: correctAnswer,
            options: quizData[currentQuiz].options
        });

        if (selectedAnswer === correctAnswer) {
            selectedLi.style.background = "#d4edda"; // Xanh lá
            selectedLi.style.borderColor = "#28a745";
            score++;
            liveScoreSpan.innerText = score;
        } else {
            selectedLi.style.background = "#f8d7da"; // Đỏ
            selectedLi.style.borderColor = "#dc3545";
            correctLi.style.background = "#d4edda"; // Hiện luôn đáp án đúng
            correctLi.style.borderColor = "#28a745";
        }

        answerEls.forEach(input => input.disabled = true);
        submitBtn.disabled = false;
    });
});

submitBtn.addEventListener('click', () => {
    currentQuiz++;
    if(currentQuiz < quizData.length) {
        loadQuiz();
    } else {
        showFinalResults();
    }
});

// --- 6. XEM LẠI: CHỈ HIỆN CÂU SAI ---
function showFinalResults() {
    quizScreen.classList.add('hidden');
    resultScreen.classList.remove('hidden');
    document.getElementById('final-score').innerText = `${score}/${quizData.length}`;
    
    reviewContainer.innerHTML = "<h3>Các câu bạn đã làm sai:</h3>";
    let wrongCount = 0;

    userAnswers.forEach((item, index) => {
        if (item.selected !== item.correct) {
            wrongCount++;
            const div = document.createElement('div');
            div.className = "review-item";
            div.style.padding = "15px";
            div.style.marginBottom = "10px";
            div.style.background = "#fff5f5";
            div.style.borderLeft = "5px solid #e74c3c";
            div.style.borderRadius = "8px";
            
            div.innerHTML = `
                <p><strong>Câu ${index + 1}:</strong> ${item.question}</p>
                <p style="color: red">Bạn chọn: ${item.selected.toUpperCase()}. ${item.options[item.selected]}</p>
                <p style="color: green">Đáp án đúng: ${item.correct.toUpperCase()}. ${item.options[item.correct]}</p>
            `;
            reviewContainer.appendChild(div);
        }
    });

    if (wrongCount === 0) {
        reviewContainer.innerHTML = "<p style='color: green; font-weight: bold;'>Tuyệt vời! Bạn không sai câu nào.</p>";
    }
}
