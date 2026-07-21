let activeQuizDataset = [...quizData]; // Default dataset from quiz-data.js
let currentFileName = "기본 제공: 설비보전기사 필기 모의고사";
let currentQuizList = [];
let currentIndex = 0;
let userAnswers = [];
let submittedStatus = [];

// DOM Elements
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');
const currentStepEl = document.getElementById('current-step');
const totalStepEl = document.getElementById('total-step');
const progressBarFill = document.getElementById('progress-bar-fill');
const categoryTagEl = document.getElementById('category-tag');
const questionTextEl = document.getElementById('question-text');
const optionsListEl = document.getElementById('options-list');
const explanationBoxEl = document.getElementById('explanation-box');
const explanationTextEl = document.getElementById('explanation-text');
const pointTextEl = document.getElementById('point-text');

const prevBtn = document.getElementById('prev-btn');
const actionBtn = document.getElementById('action-btn');
const restartBtn = document.getElementById('restart-btn');

const finalScoreEl = document.getElementById('final-score');
const correctCountEl = document.getElementById('correct-count');
const wrongCountEl = document.getElementById('wrong-count');
const resultMessageEl = document.getElementById('result-message');
const reviewListEl = document.getElementById('review-list');

// File Upload Elements
const mdFileInput = document.getElementById('md-file-input');
const uploadBtn = document.getElementById('upload-btn');
const dropZone = document.getElementById('drop-zone');
const datasetInfoEl = document.getElementById('dataset-info');

// Initialize Quiz
function initQuiz() {
  if (activeQuizDataset.length === 0) {
    alert("풀 수 있는 문제 데이터가 없습니다. 마크다운 파일을 올바르게 첨부해주세요.");
    return;
  }

  // Shuffle dataset & pick max 10 items (or total count if less than 10)
  const countToPick = Math.min(10, activeQuizDataset.length);
  const shuffled = [...activeQuizDataset].sort(() => 0.5 - Math.random());
  currentQuizList = shuffled.slice(0, countToPick);
  
  currentIndex = 0;
  userAnswers = new Array(currentQuizList.length).fill(null);
  submittedStatus = new Array(currentQuizList.length).fill(false);

  quizScreen.style.display = 'block';
  resultScreen.style.display = 'none';

  totalStepEl.textContent = currentQuizList.length;
  datasetInfoEl.textContent = `📂 ${currentFileName} (총 ${activeQuizDataset.length}문항 중 ${currentQuizList.length}문항 추출)`;

  renderQuestion();
}

// Render Current Question
function renderQuestion() {
  const q = currentQuizList[currentIndex];
  currentStepEl.textContent = currentIndex + 1;
  const progressPercent = ((currentIndex + 1) / currentQuizList.length) * 100;
  progressBarFill.style.width = `${progressPercent}%`;

  categoryTagEl.textContent = q.category || "일반";
  questionTextEl.textContent = `${currentIndex + 1}. ${q.question}`;

  optionsListEl.innerHTML = '';

  q.options.forEach((optText, idx) => {
    const optNum = idx + 1;
    const optionDiv = document.createElement('div');
    optionDiv.className = 'option-item';
    
    if (userAnswers[currentIndex] === optNum) {
      optionDiv.classList.add('selected');
    }

    if (submittedStatus[currentIndex]) {
      if (optNum === q.answer) {
        optionDiv.classList.add('correct');
      } else if (userAnswers[currentIndex] === optNum && optNum !== q.answer) {
        optionDiv.classList.add('wrong');
      }
    } else {
      optionDiv.addEventListener('click', () => selectOption(optNum));
    }

    optionDiv.innerHTML = `
      <div class="option-number">${optNum}</div>
      <div class="option-text">${optText}</div>
    `;
    optionsListEl.appendChild(optionDiv);
  });

  if (submittedStatus[currentIndex]) {
    explanationBoxEl.style.display = 'block';
    explanationTextEl.textContent = q.explanation || "별도의 해설이 제공되지 않았습니다.";
    if (q.point) {
      pointTextEl.style.display = 'block';
      pointTextEl.textContent = `💡 학습 포인트: ${q.point}`;
    } else {
      pointTextEl.style.display = 'none';
    }
  } else {
    explanationBoxEl.style.display = 'none';
  }

  prevBtn.disabled = currentIndex === 0;

  if (submittedStatus[currentIndex]) {
    if (currentIndex === currentQuizList.length - 1) {
      actionBtn.textContent = '결과 보기 🎉';
    } else {
      actionBtn.textContent = '다음 문제 ➡️';
    }
    actionBtn.disabled = false;
  } else {
    actionBtn.textContent = '정답 확인 🔍';
    actionBtn.disabled = userAnswers[currentIndex] === null;
  }
}

// Select Option Handler
function selectOption(optNum) {
  if (submittedStatus[currentIndex]) return;

  userAnswers[currentIndex] = optNum;
  
  const options = optionsListEl.querySelectorAll('.option-item');
  options.forEach((item, idx) => {
    if (idx + 1 === optNum) {
      item.classList.add('selected');
    } else {
      item.classList.remove('selected');
    }
  });

  actionBtn.disabled = false;
}

// Button Actions
actionBtn.addEventListener('click', () => {
  if (!submittedStatus[currentIndex]) {
    submittedStatus[currentIndex] = true;
    renderQuestion();
  } else {
    if (currentIndex < currentQuizList.length - 1) {
      currentIndex++;
      renderQuestion();
    } else {
      showResults();
    }
  }
});

prevBtn.addEventListener('click', () => {
  if (currentIndex > 0) {
    currentIndex--;
    renderQuestion();
  }
});

restartBtn.addEventListener('click', () => {
  initQuiz();
});

// Show Results
function showResults() {
  quizScreen.style.display = 'none';
  resultScreen.style.display = 'block';

  let correctCount = 0;
  reviewListEl.innerHTML = '';

  currentQuizList.forEach((q, idx) => {
    const isCorrect = userAnswers[idx] === q.answer;
    if (isCorrect) correctCount++;

    const item = document.createElement('div');
    item.style.background = 'rgba(15, 23, 42, 0.5)';
    item.style.border = `1px solid ${isCorrect ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`;
    item.style.borderRadius = '12px';
    item.style.padding = '14px 18px';
    item.style.marginBottom = '12px';
    item.style.textAlign = 'left';

    item.innerHTML = `
      <div style="font-weight: 700; font-size: 0.95rem; margin-bottom: 6px; color: ${isCorrect ? '#10b981' : '#ef4444'};">
        Q${idx + 1}. [${isCorrect ? '정답 ⭕' : '오답 ❌'}] (${q.category || '일반'})
      </div>
      <div style="font-size: 0.95rem; font-weight: 600; margin-bottom: 8px;">${q.question}</div>
      <div style="font-size: 0.85rem; color: #cbd5e1;">
        내가 선택한 답: ${userAnswers[idx] ? userAnswers[idx] + '번' : '미선택'} | 
        <span style="color: #10b981; font-weight: 700;">정답: ${q.answer}번</span>
      </div>
      <div style="font-size: 0.85rem; color: #94a3b8; margin-top: 6px; background: rgba(0,0,0,0.2); padding: 8px; border-radius: 6px;">
        💡 해설: ${q.explanation || '해설 없음'}
      </div>
    `;
    reviewListEl.appendChild(item);
  });

  const totalQuestions = currentQuizList.length;
  const wrongCount = totalQuestions - correctCount;
  const score = Math.round((correctCount / totalQuestions) * 100);

  finalScoreEl.textContent = `${score}점`;
  correctCountEl.textContent = `${correctCount}개`;
  wrongCountEl.textContent = `${wrongCount}개`;

  if (score === 100) {
    resultMessageEl.textContent = '🏆 완벽합니다! 모든 문제를 맞추셨습니다!';
  } else if (score >= 60) {
    resultMessageEl.textContent = '🎉 축하합니다! 합격 기준을 달성하셨습니다.';
  } else {
    resultMessageEl.textContent = '📢 조금 더 복습이 필요합니다! 오답 해설을 확인해보세요.';
  }
}

// -------------------------------------------------------------
// Markdown Parser & File Upload Handlers
// -------------------------------------------------------------

function parseMarkdownToQuiz(mdText) {
  const lines = mdText.split('\n');
  const questions = [];
  
  let currentCategory = "일반 과목";
  let currentQuestion = null;

  const circleToNumber = (str) => {
    if (str.includes('①') || str.startsWith('1.') || str.startsWith('1)')) return 1;
    if (str.includes('②') || str.startsWith('2.') || str.startsWith('2)')) return 2;
    if (str.includes('③') || str.startsWith('3.') || str.startsWith('3)')) return 3;
    if (str.includes('④') || str.startsWith('4.') || str.startsWith('4)')) return 4;
    return null;
  };

  const cleanText = (str) => {
    return str.replace(/^[*_\-#\s>]+/, '')
              .replace(/[*_~`]/g, '')
              .trim();
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) continue;

    // Detect Category Header (## 1. 과목명 등)
    if (trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
      currentCategory = cleanText(trimmed);
      continue;
    }

    // Detect Question (### 1. 문제내용 또는 1. 문제내용)
    const questionMatch = trimmed.match(/^(?:###\s*)?(\d+)\.\s+(.*)/);
    if (questionMatch) {
      if (currentQuestion && currentQuestion.options.length >= 2 && currentQuestion.answer) {
        questions.push(currentQuestion);
      }

      currentQuestion = {
        id: parseInt(questionMatch[1], 10),
        category: currentCategory,
        question: questionMatch[2].trim(),
        options: [],
        answer: 1,
        explanation: "",
        point: ""
      };
      continue;
    }

    if (!currentQuestion) continue;

    // Detect Options (①~④ 또는 1.~4.)
    const optionMatch = trimmed.match(/^([①②③④]|\d+[\.\)])\s*(.*)/);
    if (optionMatch) {
      const optNum = circleToNumber(optionMatch[1]);
      let optContent = optionMatch[2].trim();
      
      // Clean inline math or trailing spaces
      optContent = optContent.replace(/\\\$/g, '$');
      currentQuestion.options.push(optContent);
      continue;
    }

    // Detect Answer
    if (trimmed.includes('[정답]') || trimmed.includes('정답:')) {
      const numMatch = trimmed.match(/([①②③④1234])/);
      if (numMatch) {
        currentQuestion.answer = circleToNumber(numMatch[1]) || parseInt(numMatch[1], 10);
      }
      continue;
    }

    // Detect Explanation
    if (trimmed.includes('[상세 해설]') || trimmed.includes('해설:')) {
      let expl = trimmed.replace(/.*\[상세 해설\]\s*/, '').replace(/.*해설:\s*/, '');
      currentQuestion.explanation = expl.trim();
      continue;
    }

    // Detect Point
    if (trimmed.includes('[학습 포인트]') || trimmed.includes('학습 포인트:')) {
      let pt = trimmed.replace(/.*\[학습 포인트\]\s*/, '').replace(/.*학습 포인트:\s*/, '');
      currentQuestion.point = pt.trim();
      continue;
    }

    // Append multi-line explanation
    if (currentQuestion.explanation && !trimmed.startsWith('---') && !trimmed.startsWith('#')) {
      currentQuestion.explanation += ' ' + trimmed;
    }
  }

  // Push last question
  if (currentQuestion && currentQuestion.options.length >= 2 && currentQuestion.answer) {
    questions.push(currentQuestion);
  }

  return questions;
}

// Handle File Input
function handleFileSelect(file) {
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const content = e.target.result;
    const parsedQuestions = parseMarkdownToQuiz(content);

    if (parsedQuestions.length === 0) {
      alert("⚠️ 마크다운 파일에서 문제 형식을 찾을 수 없습니다.\n\n올바른 포맷 예시:\n### 1. 문제 질문\n① 보기1  ② 보기2  ③ 보기3  ④ 보기4\n- **[정답]** ②\n- **[상세 해설]** 설명...");
      return;
    }

    activeQuizDataset = parsedQuestions;
    currentFileName = file.name;
    alert(`🎉 성공! [${file.name}] 파일에서 총 ${parsedQuestions.length}개의 문제를 성공적으로 파싱했습니다!`);
    initQuiz();
  };
  reader.readAsText(file, 'UTF-8');
}

// Event Listeners for File Upload
uploadBtn.addEventListener('click', () => mdFileInput.click());
mdFileInput.addEventListener('change', (e) => handleFileSelect(e.target.files[0]));

// Drag and Drop
dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  if (e.dataTransfer.files.length > 0) {
    handleFileSelect(e.dataTransfer.files[0]);
  }
});

// Run on load
document.addEventListener('DOMContentLoaded', initQuiz);
