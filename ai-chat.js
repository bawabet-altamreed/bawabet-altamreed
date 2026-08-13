// ==========================================
// BAWABET AL TAMREED AI CHAT
// ==========================================


// ==========================================
// CONFIG
// ==========================================

const AI_API_URL =
    "https://bawabet-ai-chat.bawabet-altamreed-chat.workers.dev/";


// ==========================================
// DAILY LIMIT
// ==========================================

const DAILY_AI_LIMIT = 10;


// ==========================================
// ELEMENTS
// ==========================================

const chatMessages =
    document.getElementById("chatMessages");

const messageInput =
    document.getElementById("messageInput");

const sendBtn =
    document.getElementById("sendBtn");

const newChatBtn =
    document.getElementById("newChatBtn");

const typingIndicator =
    document.getElementById("typingIndicator");

const charCount =
    document.getElementById("charCount");

const dailyLimitCard =
    document.getElementById("dailyLimitCard");

const dailyLimitNumber =
    document.getElementById("dailyLimitNumber");

const dailyLimitText =
    document.getElementById("dailyLimitText");

const dailyProgressBar =
    document.getElementById("dailyProgressBar");


// ==========================================
// STUDENT CODE
// ==========================================

function getStudentCode() {

    const localCode =
        localStorage.getItem("studentCode");

    if (localCode) {
        return localCode;
    }


    const sessionCode =
        sessionStorage.getItem("studentCode");

    if (sessionCode) {
        return sessionCode;
    }


    return "TEST001";
}


// ==========================================
// DAILY USAGE KEY
// ==========================================

function getDailyUsageKey() {

    const studentCode =
        getStudentCode();

    const today =
        new Date().toISOString().slice(0, 10);

    return `bawabet_ai_usage_${studentCode}_${today}`;

}


// ==========================================
// GET DAILY USAGE
// ==========================================

function getDailyUsage() {

    const key =
        getDailyUsageKey();

    const saved =
        localStorage.getItem(key);

    const count =
        parseInt(saved, 10);

    if (Number.isNaN(count)) {
        return 0;
    }

    return Math.max(
        0,
        count
    );

}


// ==========================================
// INCREASE DAILY USAGE
// ==========================================

function increaseDailyUsage() {

    const key =
        getDailyUsageKey();

    const current =
        getDailyUsage();

    localStorage.setItem(
        key,
        String(
            Math.min(
                DAILY_AI_LIMIT,
                current + 1
            )
        )
    );

}


// ==========================================
// UPDATE DAILY LIMIT UI
// ==========================================

function updateDailyLimitDisplay() {

    const used =
        getDailyUsage();

    const remaining =
        Math.max(
            0,
            DAILY_AI_LIMIT - used
        );

    const percentage =
        Math.min(
            100,
            (used / DAILY_AI_LIMIT) * 100
        );


    // ======================================
    // NUMBER
    // ======================================

    dailyLimitNumber.textContent =
        `${remaining} / ${DAILY_AI_LIMIT}`;


    // ======================================
    // TEXT
    // ======================================

    if (remaining <= 0) {

        dailyLimitText.textContent =
            "انتهت أسئلتك المجانية اليوم. تتجدد غدًا ❤️";

    } else if (remaining <= 3) {

        dailyLimitText.textContent =
            `⚠️ متبقي ${remaining} أسئلة فقط اليوم`;

    } else {

        dailyLimitText.textContent =
            `متبقي ${remaining} أسئلة اليوم`;

    }


    // ======================================
    // PROGRESS
    // ======================================

    dailyProgressBar.style.width =
        `${percentage}%`;


    // ======================================
    // CARD STATE
    // ======================================

    dailyLimitCard.classList.remove(
        "warning",
        "danger"
    );


    if (remaining <= 0) {

        dailyLimitCard.classList.add(
            "danger"
        );

    } else if (remaining <= 3) {

        dailyLimitCard.classList.add(
            "warning"
        );

    }


    // ======================================
    // DISABLE CHAT
    // ======================================

    if (remaining <= 0) {

        messageInput.disabled =
            true;

        sendBtn.disabled =
            true;

        messageInput.placeholder =
            "انتهت أسئلتك اليوم ❤️";

    } else {

        messageInput.disabled =
            false;

        sendBtn.disabled =
            false;

        messageInput.placeholder =
            "اكتب سؤالك هنا...";

    }

}


// ==========================================
// SHOW DAILY LIMIT MESSAGE
// ==========================================

function showDailyLimitMessage() {

    addMessage(
        `⛔ وصلت للحد المجاني اليومي.

مسموح لك بـ ${DAILY_AI_LIMIT} أسئلة يوميًا.

أسئلتك ستتجدد تلقائيًا غدًا ❤️`,
        "ai",
        false
    );

}


// ==========================================
// SEND MESSAGE
// ==========================================

async function sendMessage() {

    const question =
        messageInput.value.trim();


    if (!question) {
        return;
    }


    // ======================================
    // CHECK DAILY LIMIT
    // ======================================

    if (
        getDailyUsage() >=
        DAILY_AI_LIMIT
    ) {

        showDailyLimitMessage();

        updateDailyLimitDisplay();

        return;

    }


    if (question.length > 4000) {

        alert(
            "السؤال طويل جدًا. الحد الأقصى 4000 حرف."
        );

        return;
    }


    const studentCode =
        getStudentCode();


    // ======================================
    // REMOVE WELCOME
    // ======================================

    const welcome =
        document.querySelector(
            ".welcome-message"
        );

    if (welcome) {
        welcome.remove();
    }


    // ======================================
    // USER MESSAGE
    // ======================================

    addMessage(
        question,
        "user"
    );


    // ======================================
    // CLEAR INPUT
    // ======================================

    messageInput.value = "";

    updateCharacterCount();

    autoResize();


    // ======================================
    // LOADING
    // ======================================

    setLoading(true);


    try {

        const response =
            await fetch(
                AI_API_URL,
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        studentCode,
                        question

                    })

                }
            );


        let data;

        try {

            data =
                await response.json();

        } catch {

            throw new Error(
                "تعذر قراءة استجابة الخادم."
            );

        }


        // ==================================
        // ERROR
        // ==================================

        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data?.error ||
                "حدث خطأ أثناء الحصول على الإجابة."
            );

        }


        // ==================================
        // AI MESSAGE
        // ==================================

        addMessage(
            data.reply,
            "ai"
        );


        // ==================================
        // COUNT SUCCESSFUL QUESTION
        // ==================================

        increaseDailyUsage();

        updateDailyLimitDisplay();


    } catch (error) {

        console.error(
            "AI Chat Error:",
            error
        );


        addMessage(
            "❌ حصلت مشكلة أثناء الاتصال بالمساعد. حاول مرة أخرى بعد قليل.",
            "ai",
            false
        );

    } finally {

        setLoading(false);

        updateDailyLimitDisplay();

    }

}


// ==========================================
// ADD MESSAGE
// ==========================================

function addMessage(
    text,
    type,
    allowCopy = true
) {

    const message =
        document.createElement("div");

    message.className =
        `message ${type}`;


    const avatar =
        document.createElement("div");

    avatar.className =
        "message-avatar";

    avatar.textContent =
        type === "ai"
            ? "🤖"
            : "👨‍🎓";


    const content =
        document.createElement("div");

    content.className =
        "message-content";


    const bubble =
        document.createElement("div");

    bubble.className =
        "message-bubble";


    if (type === "ai") {

        bubble.innerHTML =
            formatAIResponse(text);

    } else {

        bubble.textContent =
            text;

    }


    content.appendChild(
        bubble
    );


    // ======================================
    // COPY
    // ======================================

    if (
        type === "ai" &&
        allowCopy
    ) {

        const copyBtn =
            document.createElement("button");

        copyBtn.className =
            "copy-btn";

        copyBtn.textContent =
            "📋 نسخ الإجابة";


        copyBtn.addEventListener(
            "click",
            async () => {

                try {

                    await navigator.clipboard.writeText(
                        text
                    );

                    copyBtn.textContent =
                        "✅ تم النسخ";

                    setTimeout(() => {

                        copyBtn.textContent =
                            "📋 نسخ الإجابة";

                    }, 1500);

                } catch {

                    copyBtn.textContent =
                        "❌ تعذر النسخ";

                }

            }
        );


        content.appendChild(
            copyBtn
        );

    }


    message.appendChild(
        avatar
    );

    message.appendChild(
        content
    );


    chatMessages.appendChild(
        message
    );


    scrollToBottom();

}


// ==========================================
// FORMAT AI RESPONSE
// ==========================================

function formatAIResponse(text) {

    if (!text) {
        return "";
    }


    let escaped =
        escapeHTML(text);


    escaped =
        escaped.replace(
            /\*\*(.*?)\*\*/g,
            "<strong>$1</strong>"
        );


    escaped =
        escaped.replace(
            /^[-•]\s+(.*)$/gm,
            "<li>$1</li>"
        );


    escaped =
        escaped.replace(
            /(<li>.*<\/li>)/gs,
            "<ul>$1</ul>"
        );


    escaped =
        escaped.replace(
            /\n/g,
            "<br>"
        );


    return escaped;

}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text;

    return div.innerHTML;

}


// ==========================================
// LOADING
// ==========================================

function setLoading(isLoading) {

    if (isLoading) {

        typingIndicator
            .classList
            .remove("hidden");

        sendBtn.disabled =
            true;

        messageInput.disabled =
            true;

        scrollToBottom();

    } else {

        typingIndicator
            .classList
            .add("hidden");

        messageInput.disabled =
            false;

        sendBtn.disabled =
            false;

        messageInput.focus();

        updateDailyLimitDisplay();

    }

}


// ==========================================
// SCROLL
// ==========================================

function scrollToBottom() {

    setTimeout(() => {

        window.scrollTo({

            top:
                document.body.scrollHeight,

            behavior:
                "smooth"

        });

    }, 50);

}


// ==========================================
// CHARACTER COUNT
// ==========================================

function updateCharacterCount() {

    charCount.textContent =
        `${messageInput.value.length} / 4000`;

}


// ==========================================
// AUTO RESIZE
// ==========================================

function autoResize() {

    messageInput.style.height =
        "auto";


    messageInput.style.height =
        Math.min(
            messageInput.scrollHeight,
            150
        ) + "px";

}


// ==========================================
// NEW CHAT
// ==========================================

function newChat() {

    const confirmed =
        confirm(
            "هل تريد بدء محادثة جديدة؟"
        );


    if (!confirmed) {
        return;
    }


    chatMessages.innerHTML = `

        <div class="welcome-message">

            <div class="welcome-icon">
                🩺
            </div>

            <h2>
                محادثة جديدة 👋
            </h2>

            <p>
                ابدأ سؤالك وأنا جاهز أساعدك.
            </p>

        </div>

    `;

}


// ==========================================
// SUGGESTIONS
// ==========================================

function setupSuggestions() {

    document
        .querySelectorAll(
            ".suggestion-btn"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    if (
                        getDailyUsage() >=
                        DAILY_AI_LIMIT
                    ) {

                        showDailyLimitMessage();

                        return;

                    }


                    messageInput.value =
                        button.textContent
                            .replace(
                                /^[^\s]+\s*/,
                                ""
                            )
                            .trim();

                    updateCharacterCount();

                    autoResize();

                    messageInput.focus();

                }
            );

        });

}


// ==========================================
// ENTER KEY
// ==========================================

messageInput.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            sendMessage();

        }

    }
);


// ==========================================
// INPUT EVENTS
// ==========================================

messageInput.addEventListener(
    "input",
    () => {

        updateCharacterCount();

        autoResize();

    }
);


// ==========================================
// SEND BUTTON
// ==========================================

sendBtn.addEventListener(
    "click",
    sendMessage
);


// ==========================================
// NEW CHAT BUTTON
// ==========================================

newChatBtn.addEventListener(
    "click",
    newChat
);


// ==========================================
// INITIALIZE
// ==========================================

setupSuggestions();

updateCharacterCount();

updateDailyLimitDisplay();
