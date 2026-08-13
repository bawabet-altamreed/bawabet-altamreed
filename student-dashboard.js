// ==========================================
// بوابة التمريض
// Student Dashboard
// لوحة الطالب
// ==========================================


// ==========================================
// الحصول على كود الطالب
// ==========================================

const studentCode =
    localStorage.getItem("studentCode");


// ==========================================
// بيانات عامة
// ==========================================

let currentStudent = null;

let allResults = [];

// ==========================================
// Notifications
// نظام الإشعارات
// ==========================================

let allNotifications = [];

let readNotifications = new Set();

// ==========================================
// التحقق من تسجيل الدخول
// ==========================================

if (!studentCode) {

    window.location.replace("login.html");

} else {

    loadStudentDashboard();

}


// ==========================================
// تحميل لوحة الطالب
// ==========================================

function loadStudentDashboard() {

    loadStudentData()

        .then(function () {

            return loadStudentResults();

        })

        .then(function () {

            return loadStudentNotifications();

        })

        .catch(function (error) {

            console.error(
                "Student Dashboard Error:",
                error
            );

            showError();

        });

}


// ==========================================
// تحميل بيانات الطالب
// ==========================================

function loadStudentData() {

    return db.collection("students")
        .doc(studentCode)
        .get()

        .then(function (studentDoc) {

            if (!studentDoc.exists) {

                throw new Error(
                    "بيانات الطالب غير موجودة"
                );

            }


            currentStudent =
                studentDoc.data();


            renderStudentInfo();

            renderSubscription();

            renderWelcome();

        });

}


// ==========================================
// عرض الترحيب
// ==========================================

function renderWelcome() {

    const element =
        document.getElementById(
            "welcomeName"
        );


    if (!element) {
        return;
    }


    element.textContent =
        "👋 أهلاً بك " +
        (
            currentStudent.name ||
            "طالبنا العزيز"
        );

}


// ==========================================
// بيانات الطالب
// ==========================================

function renderStudentInfo() {

    const container =
        document.getElementById(
            "studentInfo"
        );


    if (!container) {
        return;
    }


    container.innerHTML = `

        <div class="student-info-grid">


            <div class="student-info-item">

                <small>
                    👨‍🎓 الاسم
                </small>

                <strong>
                    ${escapeHtml(
                        currentStudent.name ||
                        "غير محدد"
                    )}
                </strong>

            </div>


            <div class="student-info-item">

                <small>
                    🎓 الصف
                </small>

                <strong>
                    ${escapeHtml(
                        currentStudent.grade ||
                        "غير محدد"
                    )}
                </strong>

            </div>


            <div class="student-info-item">

                <small>
                    🔑 كود الاشتراك
                </small>

                <strong>
                    ${escapeHtml(
                        studentCode
                    )}
                </strong>

            </div>


            <div class="student-info-item">

                <small>
                    📧 البريد الإلكتروني
                </small>

                <strong>
                    ${escapeHtml(
                        currentStudent.email ||
                        "غير محدد"
                    )}
                </strong>

            </div>


        </div>

    `;

}


// ==========================================
// حالة الاشتراك
// ==========================================

function renderSubscription() {

    const container =
        document.getElementById(
            "subscriptionInfo"
        );


    if (!container) {
        return;
    }


    const expiry =
        getDate(
            currentStudent.expiresAt
        );


    let status = "";

    let className =
        "subscription-box";


    let remainingText = "";


    if (
        currentStudent.active !== true
    ) {

        status =
            "⛔ الاشتراك متوقف";

        className +=
            " subscription-stopped";

    }

    else if (
        !expiry
    ) {

        status =
            "⚠️ لا يوجد تاريخ انتهاء";

    }

    else if (
        new Date() >= expiry
    ) {

        status =
            "⛔ الاشتراك منتهي";

        className +=
            " subscription-expired";

        remainingText =
            "انتهت مدة الاشتراك";

    }

    else {

        status =
            "✅ الاشتراك نشط";

        className +=
            " subscription-active";


        const now =
            new Date();


        const difference =
            expiry.getTime() -
            now.getTime();


        const days =
            Math.ceil(
                difference /
                (1000 * 60 * 60 * 24)
            );


        remainingText =
            `متبقي ${days} يوم`;

    }


    container.innerHTML = `

        <div class="${className}">

            <div class="subscription-status">

                ${status}

            </div>


            <p>

                📅 تاريخ الانتهاء:

                <strong>

                    ${
                        expiry
                            ? formatDate(
                                expiry
                            )
                            : "-"
                    }

                </strong>

            </p>


            <p>

                ⏳

                ${remainingText}

            </p>

        </div>

    `;

}


// ==========================================
// تحميل جميع نتائج الطالب
// ==========================================

function loadStudentResults() {

    return db.collection("results")

        .where(
            "studentCode",
            "==",
            studentCode
        )

        .get()

        .then(function (snapshot) {

            allResults = [];


            snapshot.forEach(function (doc) {

                const data =
                    doc.data();


                allResults.push({

                    id: doc.id,

                    ...data

                });

            });


            // ==================================
            // ترتيب النتائج من الأحدث للأقدم
            // ==================================

            allResults.sort(
                function (a, b) {

                    const dateA =
                        getDate(
                            a.createdAt
                        ) || new Date(0);


                    const dateB =
                        getDate(
                            b.createdAt
                        ) || new Date(0);


                    return (
                        dateB.getTime() -
                        dateA.getTime()
                    );

                }
            );


            renderResults();

renderLatestResults();

calculateStatistics();

renderProgress();

loadStudentCertificates();

        });

}


// ==========================================
// جميع النتائج
// ==========================================

function renderResults() {

    const container =
        document.getElementById(
            "results"
        );


    if (!container) {
        return;
    }


    if (!allResults.length) {

        container.innerHTML = `

            <div class="empty-state">

                📝 لم يتم عمل أي اختبارات حتى الآن

            </div>

        `;

        return;

    }


    let html = `

        <div class="results-container">

            <table class="results-table">

                <thead>

                    <tr>

                        <th>
                            #
                        </th>

                        <th>
                            المادة
                        </th>

                        <th>
                            Chapter
                        </th>

                        <th>
                            الدرجة
                        </th>

                        <th>
                            النسبة
                        </th>

                        <th>
                            التاريخ
                        </th>

                    </tr>

                </thead>

                <tbody>

    `;


    allResults.forEach(
        function (data, index) {

            const percentage =
                getPercentage(data);


            const score =
                data.score ?? 0;


            const total =
                data.total ?? 0;


            const passed =
                percentage >= 50;


            html += `

                <tr>

                    <td>

                        ${index + 1}

                    </td>


                    <td>

                        ${escapeHtml(
                            data.subject ||
                            "-"
                        )}

                    </td>


                    <td>

                        ${escapeHtml(
                            data.chapter ||
                            "-"
                        )}

                    </td>


                    <td>

                        ${escapeHtml(
                            String(score)
                        )}

                        /

                        ${escapeHtml(
                            String(total)
                        )}

                    </td>


                    <td class="${
                        passed
                            ? "pass"
                            : "fail"
                    }">

                        ${percentage}%

                    </td>


                    <td>

                        ${formatDateTime(
                            data.createdAt
                        )}

                    </td>

                </tr>

            `;

        }
    );


    html += `

                </tbody>

            </table>

        </div>

    `;


    container.innerHTML = html;

}


// ==========================================
// آخر النتائج
// ==========================================

function renderLatestResults() {

    const container =
        document.getElementById(
            "latestResults"
        );


    if (!container) {
        return;
    }


    if (!allResults.length) {

        container.innerHTML = `

            <div class="empty-state">

                لا توجد نتائج حتى الآن

            </div>

        `;

        return;

    }


    const latest =
        allResults.slice(0, 5);


    let html = `

        <div class="results-container">

            <table class="results-table">

                <thead>

                    <tr>

                        <th>
                            المادة
                        </th>

                        <th>
                            Chapter
                        </th>

                        <th>
                            النتيجة
                        </th>

                        <th>
                            التاريخ
                        </th>

                    </tr>

                </thead>

                <tbody>

    `;


    latest.forEach(
        function (data) {

            const percentage =
                getPercentage(data);


            const passed =
                percentage >= 50;


            html += `

                <tr>

                    <td>

                        ${escapeHtml(
                            data.subject ||
                            "-"
                        )}

                    </td>


                    <td>

                        ${escapeHtml(
                            data.chapter ||
                            "-"
                        )}

                    </td>


                    <td class="${
                        passed
                            ? "pass"
                            : "fail"
                    }">

                        ${percentage}%

                    </td>


                    <td>

                        ${formatDateTime(
                            data.createdAt
                        )}

                    </td>

                </tr>

            `;

        }
    );


    html += `

                </tbody>

            </table>

        </div>

    `;


    container.innerHTML = html;

}


// ==========================================
// الإحصائيات
// ==========================================

function calculateStatistics() {

    const total =
        allResults.length;


    let sum = 0;

    let passed = 0;


    allResults.forEach(
        function (result) {

            const percentage =
                getPercentage(result);


            sum += percentage;


            if (percentage >= 50) {

                passed++;

            }

        }
    );


    const average =
        total > 0
            ? Math.round(
                sum / total
            )
            : 0;


    setText(
        "totalTests",
        total
    );


    setText(
        "averageScore",
        average + "%"
    );


    setText(
        "passedTests",
        passed
    );

}


// ==========================================
// التقدم في الاختبارات
// ==========================================

function renderProgress() {

    const container =
        document.getElementById(
            "progress"
        );


    if (!container) {
        return;
    }


    const total =
        allResults.length;


    if (!total) {

        container.innerHTML = `

            <div class="empty-state">

                📈 لم تبدأ الاختبارات بعد

            </div>

        `;

        return;

    }


    let passed = 0;

    let excellent = 0;

    let weak = 0;


    allResults.forEach(
        function (result) {

            const percentage =
                getPercentage(result);


            if (percentage >= 50) {

                passed++;

            }


            if (percentage >= 85) {

                excellent++;

            }


            if (percentage < 50) {

                weak++;

            }

        }
    );


    const successRate =
        Math.round(
            (passed / total) * 100
        );


    const excellentRate =
        Math.round(
            (excellent / total) * 100
        );


    const weakRate =
        Math.round(
            (weak / total) * 100
        );


    container.innerHTML = `

        <div class="progress-box">

            <div class="progress-title">

                <span>
                    نسبة اجتياز الاختبارات
                </span>

                <span>
                    ${successRate}%
                </span>

            </div>


            <div class="progress-bar">

                <div
                    class="progress-fill"
                    style="width:${successRate}%">

                </div>

            </div>

        </div>


        <div class="progress-box">

            <div class="progress-title">

                <span>
                    الاختبارات الممتازة
                </span>

                <span>
                    ${excellentRate}%
                </span>

            </div>


            <div class="progress-bar">

                <div
                    class="progress-fill"
                    style="width:${excellentRate}%">

                </div>

            </div>

        </div>


        <div class="progress-box">

            <div class="progress-title">

                <span>
                    الاختبارات التي تحتاج مراجعة
                </span>

                <span>
                    ${weakRate}%
                </span>

            </div>


            <div class="progress-bar">

                <div
                    class="progress-fill"
                    style="width:${weakRate}%">

                </div>

            </div>

        </div>

    `;

}


// ==========================================
// حساب النسبة
// ==========================================

function getPercentage(data) {

    if (
        data.percentage !== undefined &&
        data.percentage !== null
    ) {

        const value =
            Number(
                data.percentage
            );


        return isNaN(value)
            ? 0
            : Math.round(value);

    }


    const score =
        Number(
            data.score
        );


    const total =
        Number(
            data.total
        );


    if (
        total > 0 &&
        !isNaN(score)
    ) {

        return Math.round(
            (score / total) * 100
        );

    }


    return 0;

}


// ==========================================
// التاريخ
// ==========================================

function getDate(value) {

    if (!value) {

        return null;

    }


    if (
        typeof value.toDate ===
        "function"
    ) {

        return value.toDate();

    }


    const date =
        new Date(value);


    if (
        isNaN(
            date.getTime()
        )
    ) {

        return null;

    }


    return date;

}


// ==========================================
// تنسيق التاريخ
// ==========================================

function formatDate(value) {

    const date =
        getDate(value);


    if (!date) {

        return "-";

    }


    return date.toLocaleDateString(
        "ar-EG",
        {
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        }
    );

}


// ==========================================
// تنسيق التاريخ والوقت
// ==========================================

function formatDateTime(value) {

    const date =
        getDate(value);


    if (!date) {

        return "-";

    }


    return date.toLocaleString(
        "ar-EG",
        {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


// ==========================================
// تغيير النص
// ==========================================

function setText(id, value) {

    const element =
        document.getElementById(id);


    if (element) {

        element.textContent =
            value;

    }

}


// ==========================================
// حماية عرض النصوص
// ==========================================

function escapeHtml(value) {

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


// ==========================================
// عرض الأخطاء
// ==========================================

function showError() {

    const studentInfo =
        document.getElementById(
            "studentInfo"
        );


    const subscription =
        document.getElementById(
            "subscriptionInfo"
        );


    const progress =
        document.getElementById(
            "progress"
        );


    const latest =
        document.getElementById(
            "latestResults"
        );


    const results =
        document.getElementById(
            "results"
        );


    if (studentInfo) {

        studentInfo.innerHTML =
            "❌ حدث خطأ أثناء تحميل بيانات الطالب";

    }


    if (subscription) {

        subscription.innerHTML =
            "❌ تعذر تحميل حالة الاشتراك";

    }


    if (progress) {

        progress.innerHTML =
            "❌ تعذر حساب التقدم";

    }


    if (latest) {

        latest.innerHTML =
            "❌ تعذر تحميل آخر النتائج";

    }


    if (results) {

        results.innerHTML =
            "❌ تعذر تحميل النتائج";

    }

}

// ==========================================
// تحميل إشعارات الطالب
// ==========================================

function loadStudentNotifications() {

    return db.collection("notifications")

        .orderBy(
            "createdAt",
            "desc"
        )

        .limit(50)

        .get()

        .then(function (snapshot) {

            allNotifications = [];

            readNotifications =
                new Set(
                    JSON.parse(
                        localStorage.getItem(
                            "readNotifications_" +
                            studentCode
                        ) || "[]"
                    )
                );


            snapshot.forEach(
                function (doc) {

                    const notification =
                        doc.data();


                    if (
                        !notificationIsForStudent(
                            notification
                        )
                    ) {

                        return;

                    }


                    allNotifications.push({

                        id: doc.id,

                        ...notification

                    });

                }
            );


            renderNotifications();

            updateNotificationBadge();

        })

        .catch(function (error) {

            console.error(
                "Notifications Error:",
                error
            );


            const list =
                document.getElementById(
                    "notificationList"
                );


            if (list) {

                list.innerHTML = `

                    <div class="notification-empty">

                        ❌ تعذر تحميل الإشعارات

                    </div>

                `;

            }

        });

}


// ==========================================
// هل الإشعار موجه للطالب؟
// ==========================================

function notificationIsForStudent(
    notification
) {

    const targetType =
        notification.targetType ||
        "all";


    // ======================================
    // للجميع
    // ======================================

    if (
        targetType === "all"
    ) {

        return true;

    }


    // ======================================
    // لطالب محدد
    // ======================================

    if (
        targetType === "student"
    ) {

        return (
            notification.targetId ===
            studentCode
        );

    }


    // ======================================
    // لصف محدد
    // ======================================

    if (
        targetType === "grade"
    ) {

        return (
            String(
                notification.targetId
            ) ===
            String(
                currentStudent.grade
            )
        );

    }


    return false;

}


// ==========================================
// عرض الإشعارات
// ==========================================

function renderNotifications() {

    const list =
        document.getElementById(
            "notificationList"
        );


    if (!list) {

        return;

    }


    if (
        !allNotifications.length
    ) {

        list.innerHTML = `

            <div class="notification-empty">

                🔕 لا توجد إشعارات حاليًا

            </div>

        `;

        return;

    }


    let html = "";


    allNotifications.forEach(
        function (notification) {

            const isRead =
                readNotifications.has(
                    notification.id
                );


            html += `

                <div

                    class="
                        notification-item
                        ${
                            isRead
                                ? ""
                                : "unread"
                        }
                    "

                    data-id="${escapeHtml(
                        notification.id
                    )}"

                >

                    <div class="notification-title">

                        ${
                            escapeHtml(
                                notification.title ||
                                "إشعار جديد"
                            )
                        }

                    </div>


                    <div class="notification-message">

                        ${
                            escapeHtml(
                                notification.message ||
                                ""
                            )
                        }

                    </div>


                    <div class="notification-time">

                        🕒

                        ${
                            formatDateTime(
                                notification.createdAt
                            )
                        }

                    </div>

                </div>

            `;

        }
    );


    list.innerHTML = html;


    // ======================================
    // الضغط على إشعار
    // ======================================

    const items =
        list.querySelectorAll(
            ".notification-item"
        );


    items.forEach(
        function (item) {

            item.addEventListener(
                "click",
                function () {

                    const id =
                        item.dataset.id;


                    markNotificationAsRead(
                        id
                    );

                }
            );

        }
    );

}


// ==========================================
// تحديد إشعار كمقروء
// ==========================================

function markNotificationAsRead(
    notificationId
) {

    readNotifications.add(
        notificationId
    );


    saveReadNotifications();


    renderNotifications();

    updateNotificationBadge();

}


// ==========================================
// تحديد كل الإشعارات كمقروءة
// ==========================================

function markAllNotificationsAsRead() {

    allNotifications.forEach(
        function (notification) {

            readNotifications.add(
                notification.id
            );

        }
    );


    saveReadNotifications();

    renderNotifications();

    updateNotificationBadge();

}


// ==========================================
// حفظ الإشعارات المقروءة
// ==========================================

function saveReadNotifications() {

    localStorage.setItem(

        "readNotifications_" +
        studentCode,

        JSON.stringify(
            Array.from(
                readNotifications
            )
        )

    );

}


// ==========================================
// تحديث Badge
// ==========================================

function updateNotificationBadge() {

    const badge =
        document.getElementById(
            "notificationBadge"
        );


    if (!badge) {

        return;

    }


    const unreadCount =
        allNotifications.filter(
            function (notification) {

                return !readNotifications.has(
                    notification.id
                );

            }
        ).length;


    if (
        unreadCount <= 0
    ) {

        badge.style.display =
            "none";

        return;

    }


    badge.style.display =
        "flex";


    badge.textContent =
        unreadCount > 99
            ? "99+"
            : unreadCount;

}


// ==========================================
// فتح وإغلاق قائمة الإشعارات
// ==========================================

function setupNotificationUI() {

    const button =
        document.getElementById(
            "notificationButton"
        );


    const dropdown =
        document.getElementById(
            "notificationDropdown"
        );


    const markAllButton =
        document.getElementById(
            "markAllNotifications"
        );


    if (
        !button ||
        !dropdown
    ) {

        return;

    }


    button.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();


            dropdown.style.display =
                dropdown.style.display ===
                "none"

                    ? "block"

                    : "none";

        }
    );


    if (markAllButton) {

        markAllButton.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();

                markAllNotificationsAsRead();

            }
        );

    }


    document.addEventListener(
        "click",
        function (event) {

            if (
                !dropdown.contains(
                    event.target
                ) &&
                event.target !== button
            ) {

                dropdown.style.display =
                    "none";

            }

        }
    );

}


// ==========================================
// تشغيل نظام الإشعارات
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        setupNotificationUI();

    }
);

// ==========================================
// Certificates System
// نظام الشهادات
// ==========================================

let studentCertificates = [];


// ==========================================
// تحميل شهادات الطالب
// ==========================================

function loadStudentCertificates() {

    if (!studentCode) {
        return;
    }


    db.collection("certificates")

        .where(
            "studentCode",
            "==",
            studentCode
        )

        .get()

        .then(function (snapshot) {

            studentCertificates = [];


            snapshot.forEach(
                function (doc) {

                    studentCertificates.push({

                        id:
                            doc.id,

                        ...doc.data()

                    });

                }
            );


            renderCertificates();

        })

        .catch(function (error) {

            console.error(
                "Certificates Error:",
                error
            );


            const container =
                document.getElementById(
                    "certificates"
                );


            if (container) {

                container.innerHTML = `

                    <div class="empty-state">

                        ❌ تعذر تحميل الشهادات

                    </div>

                `;

            }

        });

}


// ==========================================
// التحقق من أهلية Chapter 1
// ==========================================

function checkChapterOneCertificate() {

    const eligibleResult =
        allResults.find(
            function (result) {

                return (

                    result.subject ===
                        "General Surgery"

                    &&

                    result.chapter ===
                        "Chapter 1"

                    &&

                    Number(
                        getPercentage(result)
                    ) >= 70

                );

            }
        );


    return eligibleResult || null;

}


// ==========================================
// إنشاء Certificate ID
// ==========================================

function generateCertificateId() {

    const random =
        Math.random()
            .toString(36)
            .substring(2, 8)
            .toUpperCase();


    const year =
        new Date()
            .getFullYear();


    return (
        "NURS-" +
        year +
        "-" +
        random
    );

}


// ==========================================
// إنشاء شهادة Chapter 1
// ==========================================

function createChapterOneCertificate(
    result
) {

    if (!result) {

        return Promise.reject(
            new Error(
                "Student is not eligible"
            )
        );

    }


    // ======================================
    // منع إنشاء شهادة مكررة
    // ======================================

    const existing =
        studentCertificates.find(
            function (certificate) {

                return (

                    certificate.studentCode ===
                        studentCode

                    &&

                    certificate.subject ===
                        "General Surgery"

                    &&

                    certificate.chapter ===
                        "Chapter 1"

                );

            }
        );


    if (existing) {

        return Promise.resolve(
            existing
        );

    }


    const certificateId =
        generateCertificateId();


    const certificateData = {

        certificateId:
            certificateId,

        studentCode:
            studentCode,

        studentName:
            currentStudent.name ||
            studentName ||
            "",

        grade:
            currentStudent.grade ||
            studentGrade ||
            "",

        type:
            "chapter",

        subject:
            "General Surgery",

        chapter:
            "Chapter 1",

        title:
            "Certificate of Completion",

        score:
            Number(
                result.percentage
            ),

        status:
            "valid",

        issuedAt:
            firebase.firestore
                .FieldValue
                .serverTimestamp()

    };


    return db.collection(
        "certificates"
    )

    .add(certificateData)

    .then(function (doc) {

        return {

            id:
                doc.id,

            ...certificateData

        };

    });

}


// ==========================================
// عرض الشهادات
// ==========================================

function renderCertificates() {

    const container =
        document.getElementById(
            "certificates"
        );


    if (!container) {
        return;
    }


    const chapterOneResult =
        checkChapterOneCertificate();


    // ======================================
    // لو عنده شهادة بالفعل
    // ======================================

    const chapterOneCertificate =
        studentCertificates.find(
            function (certificate) {

                return (

                    certificate.subject ===
                        "General Surgery"

                    &&

                    certificate.chapter ===
                        "Chapter 1"

                );

            }
        );


    if (chapterOneCertificate) {

        container.innerHTML = `

            <div class="subscription-box subscription-active">

                <div class="subscription-status">

                    🎓 شهادة مكتسبة

                </div>

                <p>

                    <strong>
                        General Surgery
                    </strong>

                    -

                    Chapter 1

                </p>

                <p>

                    📊 الدرجة:

                    <strong>
                        ${chapterOneCertificate.score}%
                    </strong>

                </p>

                <p>

                    🔐 رقم الشهادة:

                    <strong>
                        ${escapeHtml(
                            chapterOneCertificate.certificateId
                        )}
                    </strong>

                </p>

                <a
                    class="button-link"
                    href="certificate.html?id=${encodeURIComponent(
                        chapterOneCertificate.certificateId
                    )}"
                    target="_blank">

                    🎓 عرض الشهادة

                </a>

            </div>

        `;

        return;

    }


    // ======================================
    // الطالب مؤهل لكن لم تنشأ الشهادة
    // ======================================

    if (chapterOneResult) {

        container.innerHTML = `

            <div class="subscription-box subscription-active">

                <div class="subscription-status">

                    🏆 أنت مؤهل للشهادة!

                </div>

                <p>

                    مبروك! لقد اجتزت

                    <strong>
                        General Surgery - Chapter 1
                    </strong>

                    بنسبة

                    <strong>
                        ${getPercentage(
                            chapterOneResult
                        )}%
                    </strong>

                </p>

                <button
                    class="button-link"
                    type="button"
                    onclick="issueChapterOneCertificate()">

                    🎓 إصدار الشهادة

                </button>

            </div>

        `;

        return;

    }


    // ======================================
    // غير مؤهل
    // ======================================

    container.innerHTML = `

        <div class="empty-state">

            🎓 لا توجد شهادات مكتسبة حتى الآن

            <br><br>

            أكمل اختبار

            <strong>
                General Surgery - Chapter 1
            </strong>

            بنسبة

            <strong>
                70%
            </strong>

            أو أكثر للحصول على الشهادة.

        </div>

    `;

}


// ==========================================
// إصدار الشهادة
// ==========================================

function issueChapterOneCertificate() {

    const result =
        checkChapterOneCertificate();


    if (!result) {

        alert(
            "❌ أنت غير مؤهل للحصول على الشهادة."
        );

        return;

    }


    const button =
        event?.target;


    if (button) {

        button.disabled =
            true;

        button.textContent =
            "⏳ جاري إصدار الشهادة...";

    }


    createChapterOneCertificate(
        result
    )

    .then(function (certificate) {

        studentCertificates.push(
            certificate
        );


        renderCertificates();


        alert(
            "🎉 تم إصدار الشهادة بنجاح!"
        );

    })

    .catch(function (error) {

        console.error(
            "Issue Certificate Error:",
            error
        );


        alert(
            "❌ حدث خطأ أثناء إصدار الشهادة."
        );

        renderCertificates();

    });

}
