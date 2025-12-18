// Các phần tử giao diện
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
const liveScoreSpan = document.getElementById('live-score');
const progressBar = document.getElementById('progress-bar');

let quizData = [];
let userAnswers = [];
let currentQuiz = 0;
let score = 0;
let isAnswered = false; // Trạng thái để ngăn người dùng chọn nhiều lần 1 câu

// 1. Hàm trộn mảng
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// 2. Tải dữ liệu từ questions.json
async function loadQuestions() {
    try {
        const response = await fetch('questions.json');
        if (!response.ok) throw new Error('Không thấy file questions.json');
        quizData = await response.json();
        statusText.innerText = `Đã sẵn sàng ${quizData.length} câu hỏi`;
        setupOptions.classList.remove('hidden');
    } catch (error) {
        statusText.innerText = "Lỗi: " + error.message;
        statusText.style.color = "red";
    }
}

loadQuestions();

// 3. Xử lý khi nhấn nút Bắt đầu
startBtn.addEventListener('click', () => {
    if (shuffleCheckbox.checked) shuffleArray(quizData);
    loadingScreen.classList.add('hidden');
    quizScreen.classList.remove('hidden');
    loadQuiz();
});

// 4. Hiển thị câu hỏi
function loadQuiz() {
    deselectAnswers();
    isAnswered = false;
    submitBtn.disabled = true; // Khóa nút tiếp tục cho đến khi chọn xong

    const currentQuizData = quizData[currentQuiz];
    totalCountSpan.innerText = quizData.length;
    currentCountSpan.innerText = currentQuiz + 1;
    progressBar.style.width = `${(currentQuiz / quizData.length) * 100}%`;

    questionEl.innerText = currentQuizData.question;
    a_text.innerText = currentQuizData.a;
    b_text.innerText = currentQuizData.b;
    c_text.innerText = currentQuizData.c;
    d_text.innerText = currentQuizData.d;

    // Reset màu sắc các ô đáp án về mặc định
    document.querySelectorAll('.option-item').forEach(li => {
        li.style.background = "#fff";
        li.style.color = "#333";
        li.style.borderColor = "#eee";
    });
}

// 5. Bỏ chọn radio
function deselectAnswers() {
    answerEls.forEach(el => {
        el.checked = false;
        el.disabled = false;
    });
}

// 6. Xử lý khi người dùng CLICK chọn đáp án
answerEls.forEach(el => {
    el.addEventListener('change', () => {
        if (isAnswered) return; // Nếu đã chọn rồi thì không cho đổi

        isAnswered = true;
        const selectedAnswer = el.id;
        const correctAnswer = quizData[currentQuiz].correct;
        
        const selectedLi = el.parentElement;
        const correctLi = document.getElementById(correctAnswer).parentElement;

        // Lưu lịch sử để xem lại cuối bài
        userAnswers.push({
            question: quizData[currentQuiz].question,
            selected: selectedAnswer,
            correct: correctAnswer,
            options: {
                a: quizData[currentQuiz].a,
                b: quizData[currentQuiz].b,
                c: quizData[currentQuiz].c,
                d: quizData[currentQuiz].d
            }
        });

        // Kiểm tra Đúng/Sai để đổi màu
        if (selectedAnswer === correctAnswer) {
            // ĐÚNG -> Hiện xanh
            selectedLi.style.background = "#d4edda"; // Màu xanh nhạt
            selectedLi.style.color = "#155724";
            selectedLi.style.borderColor = "#c3e6cb";
            score++;
            liveScoreSpan.innerText = score;
        } else {
            // SAI -> Hiện đỏ ô chọn, hiện xanh ô đúng
            selectedLi.style.background = "#f8d7da"; // Màu đỏ nhạt
            selectedLi.style.color = "#721c24";
            selectedLi.style.borderColor = "#f5c6cb";

            correctLi.style.background = "#d4edda";
            correctLi.style.color = "#155724";
            correctLi.style.borderColor = "#c3e6cb";
        }

        // Khóa các ô còn lại không cho bấm nữa
        answerEls.forEach(input => input.disabled = true);
        
        // Mở khóa nút "Tiếp tục"
        submitBtn.disabled = false;
    });
});

// 7. Chuyển sang câu tiếp theo
submitBtn.addEventListener('click', () => {
    currentQuiz++;
    if(currentQuiz < quizData.length) {
        loadQuiz();
    } else {
        showFinalResults();
    }
});

// 8. Hiển thị bảng tổng kết
function showFinalResults() {
    quizScreen.classList.add('hidden');
    resultScreen.classList.remove('hidden');
    document.getElementById('final-score').innerText = `${score}/${quizData.length}`;

    reviewContainer.innerHTML = ""; // Xóa nội dung cũ
    userAnswers.forEach((item, index) => {
        const isRight = item.selected === item.correct;
        const div = document.createElement('div');
        div.style.padding = "15px";
        div.style.marginBottom = "10px";
        div.style.borderRadius = "8px";
        div.style.background = "#fff";
        div.style.borderLeft = `8px solid ${isRight ? '#2ecc71' : '#e74c3c'}`;
        div.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)";

        div.innerHTML = `
            <p><strong>Câu ${index + 1}: ${item.question}</strong></p>
            <p style="color: ${isRight ? '#2ecc71' : '#e74c3c'}; margin-top: 5px;">
                ${isRight ? '✓ Đúng' : '✗ Sai'} - Bạn chọn: ${item.selected.toUpperCase()}. ${item.options[item.selected]}
            </p>
            ${!isRight ? `<p style="color: #2ecc71;">➜ Đáp án đúng: ${item.correct.toUpperCase()}. ${item.options[item.correct]}</p>` : ''}
        `;
        reviewContainer.appendChild(div);
    });
}
