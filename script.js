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
let userAnswers = [];
let currentQuiz = 0;
let score = 0;
let isAnswered = false;

// --- 2. TRỘN MẢNG (SHUFFLE) ---
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
        statusText.innerText = "Lỗi: Không tải được dữ liệu questions.json!";
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
    
    // Cập nhật giao diện số câu & tiến trình
    currentCountSpan.innerText = currentQuiz + 1;
    totalCountSpan.innerText = quizData.length;
    progressBar.style.width = `${(currentQuiz / quizData.length) * 100}%`;

    // Hiển thị nội dung từ cấu trúc JSON của bạn
    questionEl.innerText = currentQuizData.question;
    a_text.innerText = currentQuizData.options.a;
    b_text.innerText = currentQuizData.options.b;
    c_text.innerText = currentQuizData.options.c;
    d_text.innerText = currentQuizData.options.d;

    // Reset trạng thái các ô chọn
    answerEls.forEach(el => {
        el.checked = false;
        el.disabled = false;
        const li = el.parentElement;
        li.style.background = "#fff";
        li.style.borderColor = "#eee";
        li.style.color = "#333";
    });
}

// --- 5. CHẤM ĐIỂM TỨC THÌ (MƯỢT MÀ) ---
answerEls.forEach(el => {
    el.addEventListener('click', function() {
        if (isAnswered) return;
        isAnswered = true;

        const selectedAnswer = this.id; // a, b, c, d
        const correctAnswer = quizData[currentQuiz].answer.toLowerCase();
        
        const selectedLi = this.parentElement;
        const correctLi = document.getElementById(correctAnswer).parentElement;

        // Lưu kết quả làm bài
        userAnswers.push({
            question: quizData[currentQuiz].question,
            selected: selectedAnswer,
            correct: correctAnswer,
            options: quizData[currentQuiz].options
        });

        // Xử lý đổi màu bằng RequestAnimationFrame để tránh lag
        requestAnimationFrame(() => {
            if (selectedAnswer === correctAnswer) {
                selectedLi.style.background = "#d4edda"; // Xanh nhạt
                selectedLi.style.borderColor = "#28a745";
                score++;
                liveScoreSpan.innerText = score;
            } else {
                selectedLi.style.background = "#f8d7da"; // Đỏ nhạt
                selectedLi.style.borderColor = "#dc3545";
                correctLi.style.background = "#d4edda"; // Hiện đáp án đúng
                correctLi.style.borderColor = "#28a745";
            }
            
            // Khóa các ô còn lại và hiện nút Tiếp tục
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

// --- 6. KẾT QUẢ: CHỈ HIỂN THỊ CÂU SAI ---
function showFinalResults() {
    quizScreen.classList.add('hidden');
    resultScreen.classList.remove('hidden');
    document.getElementById('final-score').innerText = `${score}/${quizData.length}`;
    
    const fragment = document.createDocumentFragment();
    const title = document.createElement('h3');
    title.innerText = "Xem lại các câu làm chưa đúng:";
    title.style.marginBottom = "15px";
    fragment.appendChild(title);

    let hasWrong = false;
    userAnswers.forEach((item, index) => {
        // Chỉ thêm vào danh sách nếu làm SAI
        if (item.selected !== item.correct) {
            hasWrong = true;
            const div = document.createElement('div');
            div.className = "review-item";
            div.style.cssText = "padding:15px; margin-bottom:12px; background:#fff5f5; border-left:5px solid #e74c3c; border-radius:8px; border: 1px solid #fbd3d3;";
            
            div.innerHTML = `
                <p style="margin-bottom:8px;"><strong>Câu ${index + 1}:</strong> ${item.question}</p>
                <p style="color:#c53030; font-weight:bold;">Bạn chọn: ${item.selected.toUpperCase()}. ${item.options[item.selected]}</p>
                <p style="color:#276749; font-weight:bold;">Đáp án đúng: ${item.correct.toUpperCase()}. ${item.options[item.correct]}</p>
            `;
            fragment.appendChild(div);
        }
    });

    if(!hasWrong) {
        const p = document.createElement('p');
        p.innerText = "Rất tốt! Bạn không làm sai câu nào.";
        p.style.cssText = "color:green; font-weight:bold; font-size:1.2rem;";
        fragment.appendChild(p);
    }

    reviewContainer.innerHTML = "";
    reviewContainer.appendChild(fragment);
}
