// --- 1. KHAI BÁO BIẾN ---
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
let userAnswers = [];
let currentQuiz = 0;
let score = 0;
let isAnswered = false;

// --- 2. TRỘN ĐỀ ---
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// --- 3. TẢI DỮ LIỆU ---
async function loadQuestions() {
    try {
        const response = await fetch('questions.json');
        quizData = await response.json();
        statusText.innerText = `Đã sẵn sàng ${quizData.length} câu hỏi`;
        document.getElementById('setup-options').classList.remove('hidden');
    } catch (error) {
        statusText.innerText = "Lỗi: Không tìm thấy questions.json!";
    }
}
loadQuestions();

// --- 4. BẮT ĐẦU THI ---
startBtn.addEventListener('click', () => {
    if (shuffleCheckbox.checked) shuffleArray(quizData);
    loadingScreen.classList.add('hidden');
    quizScreen.classList.remove('hidden');
    loadQuiz();
});

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
        el.checked = false;
        el.disabled = false;
        const li = el.parentElement;
        li.style.background = "#fff";
        li.style.borderColor = "#eee";
    });
}

// --- 5. CHẤM ĐIỂM TỨC THÌ (XỬ LÝ MƯỢT) ---
answerEls.forEach(el => {
    el.addEventListener('click', function() {
        if (isAnswered) return;
        isAnswered = true;

        const selectedAnswer = this.id; 
        const correctAnswer = quizData[currentQuiz].answer.toLowerCase();
        
        const selectedLi = this.parentElement;
        const correctLi = document.getElementById(correctAnswer).parentElement;

        userAnswers.push({
            question: quizData[currentQuiz].question,
            selected: selectedAnswer,
            correct: correctAnswer,
            options: quizData[currentQuiz].options
        });

        // Đổi màu Xanh/Đỏ ngay khi chọn
        requestAnimationFrame(() => {
            if (selectedAnswer === correctAnswer) {
                selectedLi.style.background = "#d4edda";
                selectedLi.style.borderColor = "#28a745";
                score++;
                liveScoreSpan.innerText = score;
            } else {
                selectedLi.style.background = "#f8d7da";
                selectedLi.style.borderColor = "#dc3545";
                correctLi.style.background = "#d4edda";
                correctLi.style.borderColor = "#28a745";
            }
            answerEls.forEach(input => input.disabled = true);
            submitBtn.disabled = false;
        });
    });
});

submitBtn.addEventListener('click', () => {
    currentQuiz++;
    if(currentQuiz < quizData.length) {
        loadQuiz();
    } else {
        progressBar.style.width = "100%";
        showFinalResults();
    }
});

// --- 6. XEM LẠI: CHỈ HIỆN CÂU SAI ---
function showFinalResults() {
    quizScreen.classList.add('hidden');
    resultScreen.classList.remove('hidden');
    document.getElementById('final-score').innerText = `${score}/${quizData.length}`;
    
    const fragment = document.createDocumentFragment();
    const title = document.createElement('h3');
    title.innerText = "Những câu bạn cần xem lại:";
    fragment.appendChild(title);

    let hasWrong = false;
    userAnswers.forEach((item, index) => {
        if (item.selected !== item.correct) {
            hasWrong = true;
            const div = document.createElement('div');
            div.className = "review-item";
            div.style.cssText = "padding:15px; margin-bottom:12px; background:#fff5f5; border-left:5px solid #e74c3c; border-radius:8px;";
            
            div.innerHTML = `
                <p><strong>Câu ${index + 1}:</strong> ${item.question}</p>
                <p style="color:red">Bạn chọn: ${item.selected.toUpperCase()}. ${item.options[item.selected]}</p>
                <p style="color:green">Đáp án đúng: ${item.correct.toUpperCase()}. ${item.options[item.correct]}</p>
            `;
            fragment.appendChild(div);
        }
    });

    if(!hasWrong) {
        const p = document.createElement('p');
        p.innerText = "Bạn thật xuất sắc! Không làm sai câu nào.";
        p.style.color = "green";
        fragment.appendChild(p);
    }

    reviewContainer.innerHTML = "";
    reviewContainer.appendChild(fragment);
}
