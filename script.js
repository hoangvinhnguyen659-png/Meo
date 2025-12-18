// 1. Khai báo biến toàn cục
let quizData = []; 
let currentQuiz = 0;
let score = 0;
let userQuestions = []; 
let wrongAnswers = [];

// 2. Lấy các phần tử DOM
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
const submitBtn = document.getElementById('submit');

const progressBar = document.getElementById('progress-bar');
const currentCountEl = document.getElementById('current-count');
const totalCountEl = document.getElementById('total-count');
const liveScoreEl = document.getElementById('live-score');

// 3. TẢI DỮ LIỆU TỪ FILE JSON NGOÀI
async function loadQuestions() {
    try {
        // Đảm bảo file questions.json nằm cùng thư mục
        const response = await fetch('questions.json');
        if (!response.ok) throw new Error('Không thể tải file dữ liệu');
        
        quizData = await response.json();
        
        // Cập nhật giao diện khi tải xong
        statusText.innerText = "Dữ liệu đã sẵn sàng!";
        setupOptions.classList.remove('hidden');
    } catch (error) {
        statusText.style.color = "red";
        statusText.innerText = "Lỗi: Không tìm thấy hoặc lỗi định dạng file questions.json!";
        console.error("Lỗi Fetch:", error);
    }
}

// Gọi hàm tải dữ liệu ngay khi mở trang
loadQuestions();

// 4. BẮT ĐẦU LÀM BÀI
startBtn.addEventListener('click', () => {
    // Xử lý trộn câu hỏi nếu người dùng tích chọn
    if (shuffleCheckbox.checked) {
        userQuestions = [...quizData].sort(() => Math.random() - 0.5);
    } else {
        userQuestions = [...quizData];
    }
    
    loadingScreen.classList.add('hidden');
    quizScreen.classList.remove('hidden');
    loadQuiz();
});

// 5. HIỂN THỊ CÂU HỎI
function loadQuiz() {
    deselectAnswers();
    resetLabelColors();
    submitBtn.disabled = true;
    submitBtn.innerText = "Tiếp tục »";

    const currentQuizData = userQuestions[currentQuiz];

    // Đổ dữ liệu vào giao diện
    questionEl.innerText = `Câu ${currentQuiz + 1}: ${currentQuizData.question}`;
    document.getElementById('a_text').innerText = currentQuizData.options.a;
    document.getElementById('b_text').innerText = currentQuizData.options.b;
    document.getElementById('c_text').innerText = currentQuizData.options.c;
    document.getElementById('d_text').innerText = currentQuizData.options.d;

    // Cập nhật thanh tiến trình và chỉ số
    const progressPercent = (currentQuiz / userQuestions.length) * 100;
    progressBar.style.width = `${progressPercent}%`;
    currentCountEl.innerText = currentQuiz + 1;
    totalCountEl.innerText = userQuestions.length;
    liveScoreEl.innerText = score;
}

// 6. XỬ LÝ LỰA CHỌN
answerEls.forEach(el => {
    el.addEventListener('change', () => {
        submitBtn.disabled = false; // Chỉ cho phép nhấn "Tiếp tục" khi đã chọn
    });
});

function deselectAnswers() {
    answerEls.forEach(el => el.checked = false);
}

function resetLabelColors() {
    optionLabels.forEach(label => label.classList.remove('correct', 'wrong'));
}

function getSelected() {
    let answer;
    answerEls.forEach(el => {
        if (el.checked) answer = el.id;
    });
    return answer;
}

// 7. KIỂM TRA ĐÁP ÁN VÀ CHUYỂN CÂU
submitBtn.addEventListener('click', () => {
    const answer = getSelected();
    
    if (answer) {
        const currentQuizData = userQuestions[currentQuiz];
        const selectedLabel = document.getElementById(`label-${answer}`);
        const correctLabel = document.getElementById(`label-${currentQuizData.answer}`);

        // Logic kiểm tra Đúng/Sai
        if (answer === currentQuizData.answer) {
            score++;
            selectedLabel.classList.add('correct');
        } else {
            selectedLabel.classList.add('wrong');
            correctLabel.classList.add('correct'); // Gợi ý đáp án đúng cho người dùng
            
            // Lưu vào danh sách câu sai để xem lại sau
            wrongAnswers.push({
                q: currentQuizData.question,
                userAns: currentQuizData.options[answer],
                correctAns: currentQuizData.options[currentQuizData.answer]
            });
        }

        // Vô hiệu hóa nút để tránh bấm liên tục
        submitBtn.disabled = true;

        // Đợi 600ms (hiệu ứng màu sắc) rồi mới chuyển câu
        setTimeout(() => {
            currentQuiz++;
            if (currentQuiz < userQuestions.length) {
                loadQuiz();
            } else {
                showResults();
            }
        }, 600);
    }
});

// 8. HIỂN THỊ KẾT QUẢ CUỐI CÙNG
function showResults() {
    quizScreen.classList.add('hidden');
    resultScreen.classList.remove('hidden');
    
    progressBar.style.width = `100%`;
    document.getElementById('final-score').innerText = `${score} / ${userQuestions.length}`;

    // Hiệu ứng pháo hoa nếu đạt trên 80% câu đúng
    if (score / userQuestions.length >= 0.8) {
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 }
        });
    }

    // Hiển thị danh sách câu sai để ôn tập
    const reviewContainer = document.getElementById('review-container');
    if (wrongAnswers.length > 0) {
        reviewContainer.innerHTML = wrongAnswers.map((item, index) => `
            <div style="margin-bottom: 15px; padding: 12px; border-left: 4px solid var(--error); background: #fff5f5; border-radius: 8px;">
                <p><strong>Câu ${index + 1}:</strong> ${item.q}</p>
                <p style="color: var(--error);">✘ Bạn chọn: ${item.userAns}</p>
                <p style="color: var(--success);">✔ Đáp án đúng: ${item.correctAns}</p>
            </div>
        `).join('');
    } else {
        reviewContainer.innerHTML = "<p style='text-align:center; color: var(--success); font-weight:bold;'>Tuyệt vời! Bạn đã trả lời đúng tất cả các câu hỏi.</p>";
    }
}
