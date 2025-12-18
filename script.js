// 1. KHAI BÁO BIẾN
let quizData = []; 
let currentQuiz = 0;
let score = 0;
let userQuestions = []; 
let wrongAnswers = [];

// 2. LẤY CÁC PHẦN TỬ DOM
const loadingScreen = document.getElementById('loading-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');
const statusText = document.getElementById('status-text');
const setupOptions = document.getElementById('setup-options');
const startBtn = document.getElementById('start-btn');
const shuffleCheckbox = document.getElementById('shuffle-checkbox');

const questionEl = document.getElementById('question');
const answerEls = document.querySelectorAll('.answer');
const optionLabels = document.querySelectorAll('.option-item');
const progressBar = document.getElementById('progress-bar');
const currentCountEl = document.getElementById('current-count');
const totalCountEl = document.getElementById('total-count');
const liveScoreEl = document.getElementById('live-score');

// 3. TẢI DỮ LIỆU TỪ FILE JSON NGOÀI
async function loadQuestions() {
    try {
        const response = await fetch('questions.json');
        if (!response.ok) throw new Error('Không thể tải file dữ liệu');
        quizData = await response.json();
        
        statusText.innerText = "Dữ liệu đã sẵn sàng!";
        setupOptions.classList.remove('hidden');
    } catch (error) {
        statusText.style.color = "red";
        statusText.innerText = "Lỗi: Không tìm thấy file questions.json!";
        console.error(error);
    }
}

loadQuestions();

// 4. BẮT ĐẦU THI
startBtn.addEventListener('click', () => {
    // Trộn đề nếu checkbox được tích
    userQuestions = shuffleCheckbox.checked ? [...quizData].sort(() => Math.random() - 0.5) : [...quizData];
    
    loadingScreen.classList.add('hidden');
    quizScreen.classList.remove('hidden');
    loadQuiz();
});

// 5. HIỂN THỊ CÂU HỎI
function loadQuiz() {
    deselectAnswers();
    resetLabelColors();
    enableOptions(); // Mở khóa cho câu mới

    const currentQuizData = userQuestions[currentQuiz];

    questionEl.innerText = `Câu ${currentQuiz + 1}: ${currentQuizData.question}`;
    document.getElementById('a_text').innerText = currentQuizData.options.a;
    document.getElementById('b_text').innerText = currentQuizData.options.b;
    document.getElementById('c_text').innerText = currentQuizData.options.c;
    document.getElementById('d_text').innerText = currentQuizData.options.d;

    // Cập nhật thanh tiến trình & số liệu
    const progressPercent = (currentQuiz / userQuestions.length) * 100;
    progressBar.style.width = `${progressPercent}%`;
    currentCountEl.innerText = currentQuiz + 1;
    totalCountEl.innerText = userQuestions.length;
    liveScoreEl.innerText = score;
}

// 6. PHẢN HỒI TỨC THÌ KHI CHỌN ĐÁP ÁN
answerEls.forEach(el => {
    el.addEventListener('change', () => {
        const answer = el.id; // Lấy đáp án người dùng vừa chọn (a, b, c, hoặc d)
        const currentQuizData = userQuestions[currentQuiz];
        
        const selectedLabel = document.getElementById(`label-${answer}`);
        const correctLabel = document.getElementById(`label-${currentQuizData.answer}`);

        // KHÓA CÁC ĐÁP ÁN KHÁC (Chống chọn lại khi đang hiện kết quả)
        disableOptions();

        // HIỂN THỊ MÀU XANH/ĐỎ NGAY LẬP TỨC
        if (answer === currentQuizData.answer) {
            score++;
            selectedLabel.classList.add('correct');
        } else {
            selectedLabel.classList.add('wrong');
            correctLabel.classList.add('correct'); // Gợi ý đáp án đúng
            
            wrongAnswers.push({
                q: currentQuizData.question,
                userAns: currentQuizData.options[answer],
                correctAns: currentQuizData.options[currentQuizData.answer]
            });
        }

        // TỰ ĐỘNG CHUYỂN CÂU SAU 1 GIÂY (Để học sinh kịp nhìn đáp án)
        setTimeout(() => {
            currentQuiz++;
            if (currentQuiz < userQuestions.length) {
                loadQuiz();
            } else {
                showResults();
            }
        }, 1000); 
    });
});

// 7. CÁC HÀM HỖ TRỢ GIAO DIỆN
function deselectAnswers() {
    answerEls.forEach(el => el.checked = false);
}

function resetLabelColors() {
    optionLabels.forEach(label => label.classList.remove('correct', 'wrong'));
}

function disableOptions() {
    answerEls.forEach(el => {
        el.disabled = true;
        el.parentElement.style.pointerEvents = 'none'; // Khóa click
    });
}

function enableOptions() {
    answerEls.forEach(el => {
        el.disabled = false;
        el.parentElement.style.pointerEvents = 'auto'; // Mở click
    });
}

// 8. HIỂN THỊ KẾT QUẢ & PHÁO HOA
function showResults() {
    quizScreen.classList.add('hidden');
    resultScreen.classList.remove('hidden');
    progressBar.style.width = `100%`;
    document.getElementById('final-score').innerText = `${score} / ${userQuestions.length}`;

    // Bắn pháo hoa nếu đạt trên 80%
    if (score / userQuestions.length >= 0.8) {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    }

    // Hiển thị danh sách câu sai
    const reviewContainer = document.getElementById('review-container');
    if (wrongAnswers.length > 0) {
        reviewContainer.innerHTML = wrongAnswers.map((item, index) => `
            <div style="margin-bottom: 12px; padding: 12px; border-left: 4px solid var(--error); background: #fff5f5; border-radius: 8px;">
                <p><strong>Câu hỏi:</strong> ${item.q}</p>
                <p style="color: var(--error);">✘ Bạn chọn: ${item.userAns}</p>
                <p style="color: var(--success);">✔ Đúng là: ${item.correctAns}</p>
            </div>
        `).join('');
    } else {
        reviewContainer.innerHTML = "<p style='color: var(--success); font-weight:bold;'>Bạn thật xuất sắc, không sai câu nào!</p>";
    }
}
