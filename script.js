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

// Sound & Vibration Trigger
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
        osc.stop(audioCtx.currentTime + 0.2);
    } catch (e) {}

    if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
    }
}

// Check Session & Badges on load
window.addEventListener('load', () => {
    const savedUser = JSON.parse(localStorage.getItem('current_user'));
    
    if (savedUser) {
        const introScreen = document.getElementById('intro-screen');
        if (introScreen) introScreen.classList.add('hidden');
        showMainApp(savedUser);
    } else {
        typeWriter();
    }
    loadNews();
    checkNotificationBadges();
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

    if (sectionId === 'news') {
        const navBadge = document.getElementById('badge-news-nav');
        const mobileBadge = document.getElementById('badge-news-mobile');
        if (navBadge) navBadge.classList.add('hidden');
        if (mobileBadge) mobileBadge.classList.add('hidden');
    }
}

// Registration Submit
const regForm = document.getElementById('register-form');
if (regForm) {
    regForm.addEventListener('submit', function(e) {
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

        let studentsList = JSON.parse(localStorage.getItem('platform_students')) || [];
        studentsList.push(studentData);
        localStorage.setItem('platform_students', JSON.stringify(studentsList));
        localStorage.setItem('current_user', JSON.stringify(studentData));

        const introScreen = document.getElementById('intro-screen');
        if (introScreen) introScreen.classList.add('hidden');
        showMainApp(studentData);
    });
}

function checkNotificationBadges() {
    const currentUser = JSON.parse(localStorage.getItem('current_user'));
    if (!currentUser) return;

    const studentsList = JSON.parse(localStorage.getItem('platform_students')) || [];
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

    let studentsList = JSON.parse(localStorage.getItem('platform_students')) || [];
    const myData = studentsList.find(st => st.phone === currentUser.phone);
    if (myData) {
        const replyBox = document.getElementById('user-reply-box');
        if (replyBox) replyBox.textContent = myData.adminReply || 'لا يوجد رد بعد.';
        myData.hasNewReply = false;
        localStorage.setItem('platform_students', JSON.stringify(studentsList));
    }
}

function closeUserAccountModal() { 
    const modal = document.getElementById('user-account-modal');
    if (modal) modal.classList.add('hidden'); 
}

function logoutUser() { localStorage.removeItem('current_user'); location.reload(); }

const studentForm = document.getElementById('student-msg-form');
if (studentForm) {
    studentForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const msgText = document.getElementById('student-msg-text').value;
        const currentUser = JSON.parse(localStorage.getItem('current_user'));

        if (!currentUser) return;

        let studentsList = JSON.parse(localStorage.getItem('platform_students')) || [];
        studentsList = studentsList.map(st => {
            if (st.phone === currentUser.phone) st.message = msgText;
            return st;
        });

        localStorage.setItem('platform_students', JSON.stringify(studentsList));
        alert('تم إرسال الرسالة للأدمن!');
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

function replyToStudent(phone) {
    const replyText = prompt("أدخل رد الأدمن/المستر للطالب:");
    if (!replyText) return;

    let studentsList = JSON.parse(localStorage.getItem('platform_students')) || [];
    studentsList = studentsList.map(st => {
        if (st.phone === phone) {
            st.adminReply = replyText;
            st.hasNewReply = true;
        }
        return st;
    });

    localStorage.setItem('platform_students', JSON.stringify(studentsList));
    triggerNotificationAlert();
    loadDashboardData();
}

function deleteStudentData(phone) {
    if (!confirm('هل تريد حذف هذه الرسالة/الطالب؟')) return;

    let studentsList = JSON.parse(localStorage.getItem('platform_students')) || [];
    studentsList = studentsList.filter(st => st.phone !== phone);

    localStorage.setItem('platform_students', JSON.stringify(studentsList));
    loadDashboardData();
}

function loadDashboardData() {
    const studentsList = JSON.parse(localStorage.getItem('platform_students')) || [];
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
                <button onclick="deleteStudentData('${st.phone}')" class="px-2 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded font-bold text-[11px]">حذف</button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

// النشر الشامل وإدارة المرفقات للأقسام المختلفة
async function publishNews() {
    const textInput = document.getElementById('admin-news-input');
    const linkInput = document.getElementById('admin-news-link');
    const fileInput = document.getElementById('admin-news-file');
    const targetSection = document.getElementById('admin-target-section') ? document.getElementById('admin-target-section').value : 'news';

    const text = textInput ? textInput.value.trim() : '';
    const link = linkInput ? linkInput.value.trim() : '';
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

    if (!text && !link && !fileData) {
        alert('يرجى كتابة نص، إضافة رابط، أو اختيار ملف للنشر!');
        return;
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
        date: formattedDate
    };

    let newsList = JSON.parse(localStorage.getItem('platform_news')) || [];
    newsList.unshift(newsItem);
    localStorage.setItem('platform_news', JSON.stringify(newsList));

    if (textInput) textInput.value = '';
    if (linkInput) linkInput.value = '';
    if (fileInput) fileInput.value = '';

    const navBadge = document.getElementById('badge-news-nav');
    const mobileBadge = document.getElementById('badge-news-mobile');
    if (navBadge) navBadge.classList.remove('hidden');
    if (mobileBadge) mobileBadge.classList.remove('hidden');
    
    triggerNotificationAlert();
    alert('تم نشر المحتوى بنجاح في القسم المختار!');
    loadNews();
}

function loadNews(filterKeyword = '') {
    const defaultNews = [{
        id: 1,
        section: "news",
        text: "مرحباً بكم في منصة مستر أشرف بسيوني الرسمية.",
        link: "",
        fileData: "",
        fileType: "",
        date: "تنويه عام"
    }];

    const rawNewsList = JSON.parse(localStorage.getItem('platform_news')) || defaultNews;
    const sections = ['news', 'courses', 'pdfs', 'quizzes'];

    sections.forEach(sec => {
        const container = document.getElementById(`${sec}-container`);
        if (!container) return;

        let filteredItems = rawNewsList.filter(item => {
            const matchesSection = (item.section || 'news') === sec;
            const itemText = (typeof item === 'object' ? item.text : item) || '';
            const matchesSearch = itemText.toLowerCase().includes(filterKeyword.toLowerCase());
            return matchesSection && matchesSearch;
        });

        if (filteredItems.length === 0) {
            container.innerHTML = `<p class="text-xs text-slate-500 py-3 text-center">لا يوجد محتوى متوفر حالياً في هذا القسم.</p>`;
            return;
        }

        container.innerHTML = filteredItems.map(item => {
            const isObject = typeof item === 'object' && item !== null;
            const text = isObject ? item.text : item;
            const link = isObject ? item.link : '';
            const fileData = isObject ? item.fileData : '';
            const fileType = isObject ? item.fileType : '';
            const date = isObject ? (item.date || '') : '';

            let mediaHTML = '';
            if (fileData) {
                if (fileType.startsWith('image/')) {
                    mediaHTML = `
                        <div class="rounded-lg overflow-hidden border border-slate-700 max-h-72 my-2">
                            <img src="${fileData}" alt="صورة مرفقة" class="w-full h-full object-cover" />
                        </div>
                    `;
                } else if (fileType.startsWith('video/')) {
                    mediaHTML = `
                        <div class="rounded-lg overflow-hidden border border-slate-700 my-2">
                            <video src="${fileData}" controls class="w-full max-h-72 bg-black"></video>
                        </div>
                    `;
                } else if (fileType === 'application/pdf') {
                    mediaHTML = `
                        <div class="my-2">
                            <a href="${fileData}" download="attachment_${item.id || Date.now()}.pdf" class="inline-flex items-center gap-2 p-2.5 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg text-xs font-bold hover:bg-red-500/20">
                                📄 تحميل ملف الـ PDF المرفق
                            </a>
                        </div>
                    `;
                }
            }

            return `
                <div class="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-right">
                    ${date ? `<div class="text-[10px] text-amber-400/80 font-mono">📅 ${date}</div>` : ''}
                    ${text ? `<p class="font-bold text-xs text-slate-100">📌 ${text}</p>` : ''}
                    ${mediaHTML}
                    ${link ? `
                        <div class="pt-1">
                            <a href="${link}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300 underline">
                                🔗 اضغط هنا لفتح الرابط / المرفق
                            </a>
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
    });
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
