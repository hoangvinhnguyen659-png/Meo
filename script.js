const loadingScreen = document.getElementById('loading-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');
const statusText = document.getElementById('status-text');
const setupOptions = document.getElementById('setup-options');
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
const progressBar = document.getElementById('progress-bar');

let quizData = [];
let userAnswers = []; // Lưu lại lịch sử làm bài
let currentQuiz = 0;
let score = 0;

// Hàm trộn mảng
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Tải câu hỏi
async function loadQuestions() {
    try {
        const response = await fetch('questions.json');
        if (!response.ok) throw new Error('Lỗi tải file questions.json');
        quizData = await response.json();
        statusText.innerText = `Đã sẵn sàng ${quizData.length} câu hỏi`;
        setupOptions.classList.remove('hidden');
    } catch (error) {
        statusText.innerText = "Lỗi: " + error.message;
    }
}

loadQuestions();

startBtn.addEventListener('click', () => {
    if (shuffleCheckbox.checked) shuffleArray(quizData);
    loadingScreen.classList.add('hidden');
    quizScreen.classList.remove('hidden');
    loadQuiz();
});

function loadQuiz() {
    deselectAnswers();
    const currentQuizData = quizData[currentQuiz];
    totalCountSpan.innerText = quizData.length;
    currentCountSpan.innerText = currentQuiz + 1;
    progressBar.style.width = `${(currentQuiz / quizData.length) * 100}%`;

    questionEl.innerText = currentQuizData.question;
    a_text.innerText = currentQuizData.a;
    b_text.innerText = currentQuizData.b;
    c_text.innerText = currentQuizData.c;
    d_text.innerText = currentQuizData.d;
}

function deselectAnswers() {
    answerEls.forEach(el => el.checked = false);
}

function getSelected() {
    let answer;
    answerEls.forEach(el => { if(el.checked) answer = el.id; });
    return answer;
}

submitBtn.addEventListener('click', () => {
    const answer = getSelected();
    if(answer) {
        // Lưu lịch sử
        userAnswers.push({
            question: quizData[currentQuiz].question,
            selected: answer,
            correct: quizData[currentQuiz].correct,
            options: {
                a: quizData[currentQuiz].a,
                b: quizData[currentQuiz].b,
                c: quizData[currentQuiz].c,
                d: quizData[currentQuiz].d
            }
        });

        if(answer === quizData[currentQuiz].correct) score++;
        currentQuiz++;

        if(currentQuiz < quizData.length) {
            loadQuiz();
        } else {
            showResults();
        }
    } else {
        alert("Vui lòng chọn đáp án!");
    }
});

function showResults() {
    quizScreen.classList.add('hidden');
    resultScreen.classList.remove('hidden');
    document.getElementById('final-score').innerText = `${score}/${quizData.length}`;

    // Hiển thị danh sách câu trả lời để xem lại
    userAnswers.forEach((item, index) => {
        const isRight = item.selected === item.correct;
        const reviewItem = document.createElement('div');
        reviewItem.className = 'review-item';
        reviewItem.style.marginBottom = '15px';
        reviewItem.style.padding = '10px';
        reviewItem.style.borderRadius = '5px';
        reviewItem.style.borderLeft = `5px solid ${isRight ? '#4caf50' : '#f44336'}`;
        reviewItem.style.background = '#fff';

        reviewItem.innerHTML = `
            <p><strong>Câu ${index + 1}: ${item.question}</strong></p>
            <p style="color: ${isRight ? '#4caf50' : '#f44336'}">
                Bạn chọn: ${item.selected.toUpperCase()}. ${item.options[item.selected]} 
                ${isRight ? '(Đúng)' : `(Sai - Đáp án đúng: ${item.correct.toUpperCase()})`}
            </p>
        `;
        reviewContainer.appendChild(reviewItem);
    });
}
