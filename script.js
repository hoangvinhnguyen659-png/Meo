// --- 1. KHAI BÁO BIẾN & PHẦN TỬ ---
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

let quizData = [];
let originalData = [];
let userAnswers = [];
let currentQuiz = 0;
let score = 0;
let isAnswered = false;

// --- 2. HÀM TRỘN ĐỀ & PHÁO HOA ---
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function fireConfetti() {
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    (function frame() {
        confetti({
            particleCount: 7,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff']
        });
        confetti({
            particleCount: 7,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff']
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    }());
}

// --- 3. TẢI DỮ LIỆU JSON ---
async function loadQuestions() {
    try {
        const response = await fetch('questions.json');
        originalData = await response.json();
        quizData = [...originalData]; 
        statusText.innerText = `Đã sẵn sàng ${quizData.length} câu hỏi`;
        document.getElementById('setup-options').classList.remove('hidden');
    } catch (error) {
        statusText.innerText = "Lỗi tải dữ liệu!";
    }
}
loadQuestions();

// --- 4. BẮT ĐẦU VÀ LÀM LẠI ---
function startQuiz() {
    currentQuiz = 0; score = 0; userAnswers = [];
    liveScoreSpan.innerText = "0";
    quizData = [...originalData];
    if (shuffleCheckbox.checked) shuffleArray(quizData);
    loadingScreen.classList.add('hidden');
    resultScreen.classList.add('hidden');
    quizScreen.classList.remove('hidden');
    loadQuiz();
}

startBtn.addEventListener('click', startQuiz);

function loadQuiz() {
    isAnswered = false;
    submitBtn.disabled = true;
    const currentQuizData = quizData[currentQuiz];
    
    currentCountSpan.innerText = currentQuiz + 1;
    totalCountSpan.innerText = quizData.length;
    progressBar.style.width = `${(currentQuiz / quizData.length) * 100}%`;

    questionEl.innerText = currentQuizData.question;
    a_text.innerText = currentQuizData.options.a;
    b_text.innerText = currentQuizData.options.b;
    c_text.innerText = currentQuizData.options.c;
    d_text.innerText = currentQuizData.options.d;

    answerEls.forEach(el => {
        el.checked = false; el.disabled = false;
        el.parentElement.style.cssText = "background:#fff; border-color:#eee;";
    });
}

// --- 5. CHẤM ĐIỂM (CHỐNG LAG) ---
answerEls.forEach(el => {
    el.addEventListener('click', function() {
        if (isAnswered) return;
        isAnswered = true;

        const selected = this.id; 
        const correct = quizData[currentQuiz].answer.toLowerCase();
        userAnswers.push({ question: quizData[currentQuiz].question, selected, correct, options: quizData[currentQuiz].options });

        requestAnimationFrame(() => {
            const selectedLi = this.parentElement;
            const correctLi = document.getElementById(correct).parentElement;
            if (selected === correct) {
                selectedLi.style.cssText = "background:#d4edda; border-color:#28a745;";
                score++;
                liveScoreSpan.innerText = score;
            } else {
                selectedLi.style.cssText = "background:#f8d7da; border-color:#dc3545;";
                correctLi.style.cssText = "background:#d4edda; border-color:#28a745;";
            }
            answerEls.forEach(input => input.disabled = true);
            submitBtn.disabled = false;
        });
    });
});

submitBtn.addEventListener('click', () => {
    currentQuiz++;
    if(currentQuiz < quizData.length) loadQuiz();
    else showFinalResults();
});

// --- 6. KẾT QUẢ & XEM LẠI CÂU SAI ---
function showFinalResults() {
    quizScreen.classList.add('hidden');
    resultScreen.classList.remove('hidden');
    document.getElementById('final-score').innerText = `${score}/${quizData.length}`;
    
    // NẾU ĐẠT ĐIỂM TỐI ĐA THÌ BẮN PHÁO HOA
    if (score === quizData.length && quizData.length > 0) {
        fireConfetti();
    }

    const fragment = document.createDocumentFragment();
    let hasWrong = false;
    userAnswers.forEach((item, index) => {
        if (item.selected !== item.correct) {
            hasWrong = true;
            const div = document.createElement('div');
            div.style.cssText = "padding:15px; margin-bottom:12px; background:#fff5f5; border-left:5px solid #e74c3c; border-radius:8px; border:1px solid #fbd3d3;";
            div.innerHTML = `
                <p><strong>Câu ${index + 1}:</strong> ${item.question}</p>
                <p style="color:#c53030; font-weight:bold;">Bạn chọn: ${item.selected.toUpperCase()}. ${item.options[item.selected]}</p>
                <p style="color:#276749; font-weight:bold;">Đáp án đúng: ${item.correct.toUpperCase()}. ${item.options[item.correct]}</p>
            `;
            fragment.appendChild(div);
        }
    });

    const restartBtn = document.createElement('button');
    restartBtn.innerText = "LÀM LẠI BÀI THI";
    restartBtn.style.cssText = "width:100%; padding:15px; background:#3498db; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:bold; margin-top:20px;";
    restartBtn.onclick = () => location.reload();
    
    reviewContainer.innerHTML = hasWrong ? "<h3>Các câu bạn đã làm sai:</h3>" : "<h3>Tuyệt vời! Bạn đúng 100%.</h3>";
    reviewContainer.appendChild(fragment);
    reviewContainer.appendChild(restartBtn);
}
