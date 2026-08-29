// Typing effect
const typingTextElement = document.getElementById('typing-text');
const fullText = "Mr. Ashraf Bassiouny: An Expert Teacher in English";
let charIndex = 0;

function typeWriter() {
    if (typingTextElement && charIndex < fullText.length) {
        typingTextElement.textContent += fullText.charAt(charIndex);
        charIndex++;
        setTimeout(typeWriter, 35);
    } else {
        const regBox = document.getElementById('registration-box');
        if (regBox) regBox.classList.remove('hidden');
    }
}

// Sound & Vibration Effects
function playClickSound() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
    } catch (e) {}

    if (navigator.vibrate) {
        navigator.vibrate(40);
    }
}

function triggerNotificationAlert() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.value = 587.33;
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
    } catch (e) {}

    if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
    }
}

document.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
        playClickSound();
    }
});

// Check Session & Load Cloud Data on load
window.addEventListener('load', async () => {
    const savedUser = JSON.parse(localStorage.getItem('current_user'));
    
    if (savedUser) {
        const introScreen = document.getElementById('intro-screen');
        if (introScreen) introScreen.classList.add('hidden');
        showMainApp(savedUser);
    } else {
        typeWriter();
    }
    await fetchCloudData();
    checkSectionBadges();
});

// Theme Toggle Mechanism
function toggleTheme() {
    const body = document.getElementById('app-body');
    const themeBtnText = document.getElementById('theme-btn-text');
    if (!body || !themeBtnText) return;

    if (body.classList.contains('theme-dark')) {
        body.classList.remove('theme-dark');
        body.classList.add('theme-light');
        themeBtnText.textContent = '☀️ الفاتح';
    } else {
        body.classList.remove('theme-light');
        body.classList.add('theme-dark');
        themeBtnText.textContent = '🌙 الداكن';
    }
}

function showMainApp(user) {
    const navUser = document.getElementById('nav-user-name');
    if (navUser) navUser.textContent = user.name.split(' ')[0];
    const mainApp = document.getElementById('main-app');
    if (mainApp) {
        mainApp.classList.remove('hidden');
        setTimeout(() => mainApp.classList.remove('opacity-0'), 50);
    }
}

// Gender Choice
let selectedGender = 'male';
function setGenderChoice(gender) {
    selectedGender = gender;
    const btnMale = document.getElementById('btn-gender-male');
    const btnFemale = document.getElementById('btn-gender-female');
    if (btnMale) btnMale.classList.toggle('active-male', gender === 'male');
    if (btnFemale) btnFemale.classList.toggle('active-female', gender === 'female');
}

function showSection(sectionId) {
    document.querySelectorAll('.app-section').forEach(sec => sec.classList.add('hidden'));
    const activeSection = document.getElementById(sectionId);
    if (activeSection) activeSection.classList.remove('hidden');

    localStorage.setItem(`unviewed_${sectionId}`, 'false');
    const badgeNav = document.getElementById(`badge-${sectionId}-nav`);
    const badgeMob = document.getElementById(`badge-${sectionId}-mobile`);
    if (badgeNav) badgeNav.classList.add('hidden');
    if (badgeMob) badgeMob.classList.add('hidden');
}

// Registration Submit (Cloud Integrated)
const regForm = document.getElementById('register-form');
if (regForm) {
    regForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const studentData = {
            id: Date.now(),
            name: document.getElementById('reg-name').value,
            phone: document.getElementById('reg-phone').value,
            grade: document.getElementById('reg-grade').value,
            school: document.getElementById('reg-school').value,
            pass: document.getElementById('reg-pass').value,
            gender: selectedGender,
            message: 'عضو مُسجّل بالمنصة',
            adminReply: 'أهلاً بك في المنصة'
        };

        // حفظ الطالب سحابياً
        await addStudentToCloud(studentData);
        localStorage.setItem('current_user', JSON.stringify(studentData));

        const introScreen = document.getElementById('intro-screen');
        if (introScreen) introScreen.classList.add('hidden');
        showMainApp(studentData);
    });
}

function checkSectionBadges() {
    const sections = ['news', 'courses', 'pdfs', 'quizzes'];
    sections.forEach(sec => {
        const hasUnviewed = localStorage.getItem(`unviewed_${sec}`) === 'true';
        if (hasUnviewed) {
            const badgeMob = document.getElementById(`badge-${sec}-mobile`);
            if (badgeMob) badgeMob.classList.remove('hidden');
        }
    });

    const currentUser = JSON.parse(localStorage.getItem('current_user'));
    if (!currentUser) return;
    const studentsList = window.cloudStudentsList || [];
    const myData = studentsList.find(st => st.phone === currentUser.phone);
    if (myData && myData.hasNewReply) {
        const userNav = document.getElementById('badge-user-nav');
        const userMobile = document.getElementById('badge-user-mobile');
        if (userNav) userNav.classList.remove('hidden');
        if (userMobile) userMobile.classList.remove('hidden');
    }
}

function openUserAccountModal() {
    const currentUser = JSON.parse(localStorage.getItem('current_user'));
    if (!currentUser) return;

    const modal = document.getElementById('user-account-modal');
    if (modal) modal.classList.remove('hidden');
    
    const userNav = document.getElementById('badge-user-nav');
    const userMobile = document.getElementById('badge-user-mobile');
    if (userNav) userNav.classList.add('hidden');
    if (userMobile) userMobile.classList.add('hidden');

    const infoCard = document.getElementById('user-info-card');
    if (infoCard) {
        infoCard.innerHTML = `
            <p class="font-bold text-slate-100">${currentUser.name}</p>
            <p class="text-amber-400 font-semibold">${currentUser.grade}</p>
            <p class="text-slate-400 text-[11px]">${currentUser.school}</p>
        `;
    }

    let studentsList = window.cloudStudentsList || [];
    const myData = studentsList.find(st => st.phone === currentUser.phone);
    if (myData) {
        const replyBox = document.getElementById('user-reply-box');
        if (replyBox) replyBox.textContent = myData.adminReply || 'لا يوجد رد بعد.';
        myData.hasNewReply = false;
        updateCloudStudents(studentsList);
    }
}

function closeUserAccountModal() { 
    const modal = document.getElementById('user-account-modal');
    if (modal) modal.classList.add('hidden'); 
}

function logoutUser() { 
    localStorage.removeItem('current_user'); 
    location.reload(); 
}

const studentForm = document.getElementById('student-msg-form');
if (studentForm) {
    studentForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const msgText = document.getElementById('student-msg-text').value;
        const currentUser = JSON.parse(localStorage.getItem('current_user'));
        if (!currentUser) return;

        let studentsList = window.cloudStudentsList || [];
        studentsList = studentsList.map(st => {
            if (st.phone === currentUser.phone) st.message = msgText;
            return st;
        });

        await updateCloudStudents(studentsList);
        alert('تم إرسال الرسالة للأدمن سحابياً!');
        document.getElementById('student-msg-text').value = '';
    });
}

function openAdminModal() { 
    const modal = document.getElementById('admin-modal');
    if (modal) modal.classList.remove('hidden'); 
}

function closeAdminModal() { 
    const modal = document.getElementById('admin-modal');
    const adminAuth = document.getElementById('admin-auth');
    const adminContent = document.getElementById('admin-dashboard-content');
    if (modal) modal.classList.add('hidden'); 
    if (adminAuth) adminAuth.classList.remove('hidden');
    if (adminContent) adminContent.classList.add('hidden');
}

function verifyAdminPass() {
    const inputPass = document.getElementById('admin-pass-input');
    if (inputPass && inputPass.value === '1122334455') {
        const adminAuth = document.getElementById('admin-auth');
        const adminContent = document.getElementById('admin-dashboard-content');
        if (adminAuth) adminAuth.classList.add('hidden');
        if (adminContent) adminContent.classList.remove('hidden');
        loadDashboardData();
    } else {
        alert('كلمة السر خاطئة!');
    }
}

async function replyToStudent(phone) {
    const replyText = prompt("أدخل رد الأدمن/المستر للطالب:");
    if (!replyText) return;

    let studentsList = window.cloudStudentsList || [];
    studentsList = studentsList.map(st => {
        if (st.phone === phone) {
            st.adminReply = replyText;
            st.hasNewReply = true;
        }
        return st;
    });

    await updateCloudStudents(studentsList);
    triggerNotificationAlert();
    loadDashboardData();
}

async function deleteStudentData(phone) {
    const pass = prompt("أدخل كلمة مرور الأدمن لتأكيد حذف العضو:");
    if (pass !== '1122334455') {
        if (pass !== null) alert('كلمة مرور الأدمن خاطئة!');
        return;
    }

    let studentsList = window.cloudStudentsList || [];
    studentsList = studentsList.filter(st => st.phone !== phone);
    await updateCloudStudents(studentsList);
    loadDashboardData();
    alert('تم حذف العضو سحابياً بنجاح.');
}

async function deleteNewsItem(itemId) {
    const pass = prompt("أدخل كلمة مرور الأدمن لحذف هذا المحتوى:");
    if (pass !== '1122334455') {
        if (pass !== null) alert('كلمة مرور الأدمن خاطئة!');
        return;
    }

    let newsList = window.cloudNewsList || [];
    newsList = newsList.filter(item => item.id !== itemId);
    await updateCloudNews(newsList);
    loadNews();
    alert('تم حذف المحتوى من السيرفر بنجاح.');
}

function loadDashboardData() {
    const studentsList = window.cloudStudentsList || [];
    const tableBody = document.getElementById('admin-table-body');
    if (!tableBody) return;
    tableBody.innerHTML = '';

    studentsList.forEach(st => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="p-2.5 font-bold">${st.name}</td>
            <td class="p-2.5 text-amber-400">${st.grade || 'عام'}</td>
            <td class="p-2.5 font-mono" dir="ltr">${st.phone}</td>
            <td class="p-2.5">${st.message}</td>
            <td class="p-2.5 text-amber-400 font-bold">${st.adminReply || '-'}</td>
            <td class="p-2.5 flex justify-center gap-1">
                <button onclick="replyToStudent('${st.phone}')" class="px-2 py-1 bg-amber-400 text-slate-950 rounded font-bold text-[11px]">رد</button>
                <button onclick="deleteStudentData('${st.phone}')" class="px-2 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded font-bold text-[11px]">حذف العضو</button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

// نشر محتوى سحابياً للجميع
async function publishNews() {
    const targetSection = document.getElementById('admin-target-section').value;
    const textInput = document.getElementById('admin-news-input');
    const linkInput = document.getElementById('admin-news-link');
    const fileInput = document.getElementById('admin-news-file');
    
    const quizDataInput = document.getElementById('admin-quiz-data');
    const quizTimerInput = document.getElementById('admin-quiz-timer');

    const text = textInput ? textInput.value.trim() : '';
    const link = linkInput ? linkInput.value.trim() : '';
    const quizRaw = quizDataInput && targetSection === 'quizzes' ? quizDataInput.value.trim() : '';
    const timerMinutes = quizTimerInput && targetSection === 'quizzes' ? parseInt(quizTimerInput.value) || 0 : 0;

    let fileData = "";
    let fileType = "";

    if (fileInput && fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        fileType = file.type;
        fileData = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(file);
        });
    }

    if (!text && !link && !fileData && !quizRaw) {
        alert('يرجى إدخال بيانات أو أسئلة للنشر!');
        return;
    }

    let parsedQuestions = [];
    if (targetSection === 'quizzes' && quizRaw) {
        const lines = quizRaw.split('\n').filter(l => l.trim() !== '');
        let currentQ = null;
        
        lines.forEach(line => {
            line = line.trim();
            if (line.startsWith('س:') || line.startsWith('Q:') || line.startsWith('السؤال:')) {
                if (currentQ) parsedQuestions.push(currentQ);
                currentQ = { question: line.replace(/^(س:|Q:|السؤال:)\s*/, ''), options: [], correctAnswer: '' };
            } else if (line.startsWith('أ)') || line.startsWith('ب)') || line.startsWith('ج)') || line.startsWith('د)') || line.startsWith('a)') || line.startsWith('b)') || line.startsWith('c)') || line.startsWith('d)') || line.startsWith('-')) {
                if (currentQ) currentQ.options.push(line.replace(/^[أ-دa-d\-)]+\s*/, ''));
            } else if (line.startsWith('الإجابة:') || line.startsWith('Ans:')) {
                if (currentQ) currentQ.correctAnswer = line.replace(/^(الإجابة:|Ans:)\s*/, '').trim();
            }
        });
        if (currentQ) parsedQuestions.push(currentQ);
    }

    const now = new Date();
    const formattedDate = now.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' }) + 
                          ' - ' + now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

    const newsItem = {
        id: Date.now(),
        section: targetSection,
        text: text,
        link: link,
        fileData: fileData,
        fileType: fileType,
        questions: parsedQuestions,
        timerMinutes: timerMinutes,
        date: formattedDate
    };

    let newsList = window.cloudNewsList || [];
    newsList.unshift(newsItem);
    await updateCloudNews(newsList);

    localStorage.setItem(`unviewed_${targetSection}`, 'true');

    if (textInput) textInput.value = '';
    if (linkInput) linkInput.value = '';
    if (fileInput) fileInput.value = '';
    if (quizDataInput) quizDataInput.value = '';
    if (quizTimerInput) quizTimerInput.value = '';

    triggerNotificationAlert();
    alert('تم النشر سحابياً وتحديث المنصة لجميع الطلاب بنجاح!');
    loadNews();
    checkSectionBadges();
}

// عرض المحتوى سحابياً والبحث
function loadNews(filterKeyword = '') {
    const rawNewsList = window.cloudNewsList || [];
    const sections = ['news', 'courses', 'pdfs', 'quizzes'];

    sections.forEach(sec => {
        const container = document.getElementById(`${sec}-container`);
        if (!container) return;

        let filteredItems = rawNewsList.filter(item => {
            const matchesSection = (item.section || 'news') === sec;
            const itemText = (item.text || '') + (item.date || '');
            const matchesSearch = itemText.toLowerCase().includes(filterKeyword.toLowerCase());
            return matchesSection && matchesSearch;
        });

        if (filteredItems.length === 0) {
            container.innerHTML = `<p class="text-xs text-slate-500 py-3 text-center">لا يوجد محتوى أو اختبارات متوفرة حالياً في هذا القسم.</p>`;
            return;
        }

        container.innerHTML = filteredItems.map(item => {
            const text = item.text || '';
            const link = item.link || '';
            const fileData = item.fileData || '';
            const fileType = item.fileType || '';
            const date = item.date || '';
            const questions = item.questions || [];
            const timerMin = item.timerMinutes || 0;

            let mediaHTML = '';
            if (fileData) {
                if (fileType.startsWith('image/')) {
                    mediaHTML = `<div class="rounded-lg overflow-hidden border border-slate-700 max-h-72 my-2"><img src="${fileData}" alt="صورة" class="w-full h-full object-cover"/></div>`;
                } else if (fileType.startsWith('video/')) {
                    mediaHTML = `<div class="rounded-lg overflow-hidden border border-slate-700 my-2"><video src="${fileData}" controls class="w-full max-h-72 bg-black"></video></div>`;
                } else if (fileType === 'application/pdf') {
                    mediaHTML = `<div class="my-2"><a href="${fileData}" download="file.pdf" class="inline-flex items-center gap-2 p-2.5 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg text-xs font-bold">📄 تحميل ملف الـ PDF</a></div>`;
                }
            }

            let quizHTML = '';
            if (sec === 'quizzes' && questions.length > 0) {
                quizHTML = `
                    <div id="quiz-wrapper-${item.id}" class="mt-4 p-4 bg-slate-950 rounded-xl border border-amber-400/30 space-y-4">
                        ${timerMin > 0 ? `<div id="timer-${item.id}" class="text-red-400 font-bold text-center text-xs bg-red-500/10 p-2 rounded-lg border border-red-500/20">⏳ متبقي على إغلاق الامتحان: ${timerMin}:00</div>` : ''}
                        <div id="quiz-questions-${item.id}" class="space-y-4">
                            ${questions.map((q, qIdx) => `
                                <div class="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-2">
                                    <p class="font-bold text-slate-100">س${qIdx + 1}: ${q.question}</p>
                                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        ${q.options.map((opt) => `
                                            <label class="flex items-center gap-2 p-2 rounded bg-slate-800 border border-slate-700 cursor-pointer hover:border-amber-400 text-slate-300">
                                                <input type="radio" name="q-${item.id}-${qIdx}" value="${opt}" class="accent-amber-400">
                                                <span>${opt}</span>
                                            </label>
                                        `).join('')}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        <button onclick="submitQuiz(${item.id})" class="w-full py-2.5 bg-amber-400 text-slate-950 font-bold rounded-xl hover:bg-amber-300">إرسال الإجابات وعرض النتيجة</button>
                        <div id="quiz-result-${item.id}" class="hidden p-3 rounded-xl bg-slate-900 border border-slate-700 text-center font-bold"></div>
                    </div>
                `;

                if (timerMin > 0) {
                    let totalSeconds = timerMin * 60;
                    const timerInterval = setInterval(() => {
                        totalSeconds--;
                        const m = Math.floor(totalSeconds / 60);
                        const s = totalSeconds % 60;
                        const timerEl = document.getElementById(`timer-${item.id}`);
                        if (timerEl) {
                            timerEl.textContent = `⏳ متبقي على إغلاق الامتحان: ${m}:${s < 10 ? '0' : ''}${s}`;
                        }
                        if (totalSeconds <= 0) {
                            clearInterval(timerInterval);
                            const quizWrap = document.getElementById(`quiz-wrapper-${item.id}`);
                            if (quizWrap) quizWrap.innerHTML = `<p class="text-red-400 text-center font-bold p-4 bg-red-500/10 rounded-xl">انتهى وقت الامتحان وتم إغلاقه تلقائياً.</p>`;
                        }
                    }, 1000);
                }
            }

            return `
                <div class="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-right relative">
                    <div class="flex justify-between items-center text-[10px] text-amber-400/80 font-mono">
                        <span>📅 ${date}</span>
                        <button onclick="deleteNewsItem(${item.id})" class="text-red-400 hover:underline font-bold">🗑️ حذف المحتوى</button>
                    </div>
                    ${text ? `<p class="font-bold text-xs text-slate-100">📌 ${text}</p>` : ''}
                    ${mediaHTML}
                    ${link ? `<div class="pt-1"><a href="${link}" target="_blank" rel="noopener" class="text-xs font-bold text-amber-400 underline">🔗 رابط مباشر / مرفق</a></div>` : ''}
                    ${quizHTML}
                </div>
            `;
        }).join('');
    });
}

function submitQuiz(itemId) {
    const rawNewsList = window.cloudNewsList || [];
    const item = rawNewsList.find(n => n.id === itemId);
    if (!item || !item.questions) return;

    let score = 0;
    const questions = item.questions;

    questions.forEach((q, qIdx) => {
        const selected = document.querySelector(`input[name="q-${itemId}-${qIdx}"]:checked`);
        if (selected && selected.value.trim() === q.correctAnswer.trim()) {
            score++;
        }
    });

    const resultBox = document.getElementById(`quiz-result-${itemId}`);
    if (resultBox) {
        resultBox.classList.remove('hidden');
        resultBox.innerHTML = `🎉 نتيجة الاختبار: ${score} من ${questions.length} (${Math.round((score/questions.length)*100)}%)`;
    }
}

function handleSearch() {
    const searchVal = document.getElementById('search-input')?.value.trim() || '';
    loadNews(searchVal);
}

// البصمة للأدمن
async function registerAdminBiometrics() {
    if (!window.PublicKeyCredential) {
        alert("متصفحك لا يدعم تفعيل البصمة.");
        return;
    }
    try {
        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);
        const credential = await navigator.credentials.create({
            publicKey: {
                challenge: challenge,
                rp: { name: "منصة مستر أشرف بسيوني" },
                user: { id: Uint8Array.from("ADMIN_ID", c => c.charCodeAt(0)), name: "admin", displayName: "Mr. Ashraf Bassiouny" },
                pubKeyCredParams: [{ alg: -7, type: "public-key" }],
                authenticatorSelection: { authenticatorAttachment: "platform" },
                timeout: 60000
            }
        });
        if (credential) {
            localStorage.setItem('admin_biometric_enabled', 'true');
            alert('تم ربط بصمة الجهاز بنجاح!');
        }
    } catch (err) { alert('تعذر إعداد البصمة.'); }
}

async function loginWithBiometrics() {
    if (!localStorage.getItem('admin_biometric_enabled')) {
        alert('قم بالدخول بكلمة السر أولاً ثم اضغط على تفعيل البصمة.');
        return;
    }
    try {
        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);
        const assertion = await navigator.credentials.get({ publicKey: { challenge: challenge, timeout: 60000 } });
        if (assertion) {
            const adminAuth = document.getElementById('admin-auth');
            const adminContent = document.getElementById('admin-dashboard-content');
            if (adminAuth) adminAuth.classList.add('hidden');
            if (adminContent) adminContent.classList.remove('hidden');
            loadDashboardData();
        }
    } catch (err) { alert('فشل التحقق من البصمة.'); }
}

// ==========================================
// نظام السحابة الحقيقي عبر GitHub API (أخبار، اختبارات، وطلاب)
// ==========================================
const GITHUB_CONFIG = {
    owner: "Ashraf-bassiouni",
    repo: "Ashraf-bassiouni",
    token: "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",
    newsFile: "news.json",
    studentsFile: "students.json"
};

window.cloudNewsList = [];
window.cloudStudentsList = [];

// جلب البيانات من السحابة عند فتح المنصة
async function fetchCloudData() {
    try {
        // جلب الأخبار والمحتوى
        const newsUrl = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.newsFile}`;
        const newsRes = await fetch(newsUrl, { headers: { 'Authorization': `token ${GITHUB_CONFIG.token}` } });
        if (newsRes.ok) {
            const data = await newsRes.json();
            window.cloudNewsList = JSON.parse(decodeURIComponent(escape(atob(data.content))));
        }

        // جلب بيانات الطلاب والردود
        const studentsUrl = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.studentsFile}`;
        const studentsRes = await fetch(studentsUrl, { headers: { 'Authorization': `token ${GITHUB_CONFIG.token}` } });
        if (studentsRes.ok) {
            const data = await studentsRes.json();
            window.cloudStudentsList = JSON.parse(decodeURIComponent(escape(atob(data.content))));
        }

        loadNews();
        checkSectionBadges();
    } catch (err) {
        console.error("خطأ في جلب البيانات من السحابة:", err);
    }
}

// تحديث ملف الأخبار سحابياً
async function updateCloudNews(newNewsArray) {
    const url = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.newsFile}`;
    try {
        const res = await fetch(url, { headers: { 'Authorization': `token ${GITHUB_CONFIG.token}` } });
        let sha = '';
        if (res.ok) {
            const fileData = await res.json();
            sha = fileData.sha;
        }

        await fetch(url, {
            method: 'PUT',
            headers: { 'Authorization': `token ${GITHUB_CONFIG.token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: "Update news via cloud portal",
                content: btoa(unescape(encodeURIComponent(JSON.stringify(newNewsArray)))),
                sha: sha
            })
        });
        window.cloudNewsList = newNewsArray;
    } catch (err) {
        console.error("فشل تحديث الأخبار سحابياً:", err);
    }
}

// تحديث ملف الطلاب والردود سحابياً
async function updateCloudStudents(newStudentsArray) {
    const url = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.studentsFile}`;
    try {
        const res = await fetch(url, { headers: { 'Authorization': `token ${GITHUB_CONFIG.token}` } });
        let sha = '';
        if (res.ok) {
            const fileData = await res.json();
            sha = fileData.sha;
        }

        await fetch(url, {
            method: 'PUT',
            headers: { 'Authorization': `token ${GITHUB_CONFIG.token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: "Update students and replies via cloud portal",
                content: btoa(unescape(encodeURIComponent(JSON.stringify(newStudentsArray)))),
                sha: sha
            })
        });
        window.cloudStudentsList = newStudentsArray;
    } catch (err) {
        console.error("فشل تحديث بيانات الطلاب سحابياً:", err);
    }
}

// إضافة طالب جديد للسحابة مباشرة
async function addStudentToCloud(studentData) {
    let students = window.cloudStudentsList || [];
    students.push(studentData);
    await updateCloudStudents(students);
}
