// ==========================================
// 🤖 مساعد بوابة التمريض
// AI Chat
// ==========================================


// ==========================================
// العناصر
// ==========================================

const chatMessages =
    document.getElementById(
        "chatMessages"
    );


const messageInput =
    document.getElementById(
        "messageInput"
    );


const sendButton =
    document.getElementById(
        "sendButton"
    );


// ==========================================
// سجل المحادثة
// ==========================================

let chatHistory = [];


// ==========================================
// إرسال الرسالة
// ==========================================

async function sendMessage() {

    const message =
        messageInput.value.trim();


    if (!message) {

        return;

    }


    // ======================================
    // عرض رسالة الطالب
    // ======================================

    addUserMessage(
        message
    );


    messageInput.value = "";


    autoResize();


    sendButton.disabled = true;


    // ======================================
    // إضافة للسجل
    // ======================================

    chatHistory.push({

        role: "user",

        content: message

    });


    // ======================================
    // Loading
    // ======================================

    const typing =
        addTyping();


    try {

        /*
         *
         * هنا هنربط الـ Backend
         *
         * مثال:
         *
         * const response = await fetch(
         *
         *     "YOUR_BACKEND_URL",
         *
         *     {
         *
         *         method: "POST",
         *
         *         headers: {
         *
         *             "Content-Type":
         *                 "application/json"
         *         },
         *
         *         body: JSON.stringify({
         *
         *             message: message,
         *
         *             history:
         *                 chatHistory
         *
         *         })
         *
         *     }
         *
         * );
         *
         */


        // مؤقتًا
        await new Promise(
            function(resolve) {

                setTimeout(
                    resolve,
                    900
                );

            }
        );


        removeTyping(
            typing
        );


        addAIMessage(

            "🔥 الواجهة شغالة تمام يا بطل!\n\n" +

            "دلوقتي باقي خطوة ربط المساعد الحقيقي بالـAI API، " +

            "وبعدها هتقدر تسألني وأنا أرد عليك فعليًا 🤖🩺"

        );


    }

    catch (error) {

        console.error(
            "AI Error:",
            error
        );


        removeTyping(
            typing
        );


        addAIMessage(

            "❌ حصل خطأ أثناء الاتصال بالمساعد. حاول مرة أخرى."

        );

    }


    finally {

        sendButton.disabled =
            false;

        messageInput.focus();

    }

}


// ==========================================
// زر الإرسال
// ==========================================

sendButton.addEventListener(
    "click",
    sendMessage
);


// ==========================================
// Enter
// ==========================================

messageInput.addEventListener(
    "keydown",
    function(event) {

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
// إضافة رسالة الطالب
// ==========================================

function addUserMessage(
    message
) {

    const wrapper =
        document.createElement(
            "div"
        );


    wrapper.className =
        "message user-message";


    wrapper.innerHTML = `

        <div class="message-avatar">
            👨‍🎓
        </div>

        <div class="message-content">

            <p>
                ${escapeHtml(message)}
            </p>

        </div>

    `;


    chatMessages.appendChild(
        wrapper
    );


    scrollToBottom();

}


// ==========================================
// إضافة رسالة AI
// ==========================================

function addAIMessage(
    message
) {

    const wrapper =
        document.createElement(
            "div"
        );


    wrapper.className =
        "message ai-message";


    wrapper.innerHTML = `

        <div class="message-avatar">
            🤖
        </div>

        <div class="message-content">

            <strong>
                مساعد بوابة التمريض
            </strong>

            ${formatAIMessage(message)}

        </div>

    `;


    chatMessages.appendChild(
        wrapper
    );


    chatHistory.push({

        role: "assistant",

        content: message

    });


    scrollToBottom();

}


// ==========================================
// تنسيق رسالة AI
// ==========================================

function formatAIMessage(
    message
) {

    const safe =
        escapeHtml(
            message
        );


    return safe
        .split("\n")
        .map(
            function(line) {

                return `<p>${line || "&nbsp;"}</p>`;

            }
        )
        .join("");

}


// ==========================================
// Loading
// ==========================================

function addTyping() {

    const wrapper =
        document.createElement(
            "div"
        );


    wrapper.className =
        "message ai-message";


    wrapper.innerHTML = `

        <div class="message-avatar">
            🤖
        </div>

        <div class="message-content">

            <strong>
                مساعد بوابة التمريض
            </strong>

            <div class="typing">

                <span></span>
                <span></span>
                <span></span>

            </div>

        </div>

    `;


    chatMessages.appendChild(
        wrapper
    );


    scrollToBottom();


    return wrapper;

}


// ==========================================
// حذف Loading
// ==========================================

function removeTyping(
    element
) {

    if (element) {

        element.remove();

    }

}


// ==========================================
// الاقتراحات
// ==========================================

function useSuggestion(
    text
) {

    messageInput.value =
        text;


    autoResize();


    messageInput.focus();

}


// ==========================================
// Scroll
// ==========================================

function scrollToBottom() {

    chatMessages.scrollTop =
        chatMessages.scrollHeight;

}


// ==========================================
// Auto Resize
// ==========================================

function autoResize() {

    messageInput.style.height =
        "auto";


    messageInput.style.height =
        Math.min(
            messageInput.scrollHeight,
            130
        ) + "px";

}


messageInput.addEventListener(
    "input",
    autoResize
);


// ==========================================
// حماية النص
// ==========================================

function escapeHtml(
    value
) {

    return String(
        value ?? ""
    )

    .replace(
        /&/g,
        "&amp;"
    )

    .replace(
        /</g,
        "&lt;"
    )

    .replace(
        />/g,
        "&gt;"
    )

    .replace(
        /"/g,
        "&quot;"
    )

    .replace(
        /'/g,
        "&#039;"
    );

}
