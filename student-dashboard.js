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

let allContent = [];


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

            return loadAvailableContent();

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


    // ==================================
    // الاشتراك متوقف
    // ==================================

    if (
        currentStudent.active !== true
    ) {

        status =
            "⛔ الاشتراك متوقف";

        className +=
            " subscription-stopped";

    }


    // ==================================
    // لا يوجد تاريخ انتهاء
    // ==================================

    else if (!expiry) {

        status =
            "⚠️ لا يوجد تاريخ انتهاء";

    }


    // ==================================
    // الاشتراك منتهي
    // ==================================

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


    // ==================================
    // الاشتراك نشط
    // ==================================

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
                            ? formatDate(expiry)
                            : "-"
                    }

                </strong>

            </p>


            <p>

                ⏳ ${remainingText}

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


            // ==================================
            // عرض النتائج
            // ==================================

            renderResults();

            renderLatestResults();

            calculateStatistics();

            renderProgress();

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

                        <th>#</th>

                        <th>المادة</th>

                        <th>Chapter</th>

                        <th>الدرجة</th>

                        <th>النسبة</th>

                        <th>التاريخ</th>

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

                        <th>المادة</th>

                        <th>Chapter</th>

                        <th>النتيجة</th>

                        <th>التاريخ</th>

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
// تحميل المواد المتاحة حسب الصف
// ==========================================

function loadAvailableContent() {

    allContent = [];


    // ==================================
    // الصف الثاني الثانوي التمريض
    // ==================================

    if (
        currentStudent.grade ===
        "الصف الثاني الثانوي التمريض"
    ) {

        allContent = [

            {
                id: "community-health",

                name:
                    "Community Health Nursing",

                icon: "🏥",

                url:
                    "community-health.html"

            },


            {
                id: "surgery",

                name:
                    "General Surgery",

                icon: "🩺",

                url:
                    "surgery.html"

            },


            {
                id: "medical-surgical",

                name:
                    "Medical-Surgical Nursing",

                icon: "⚕️",

                url:
                    "medical-surgical.html"

            },


            {
                id: "internal-medicine",

                name:
                    "Internal Medicine",

                icon: "💊",

                url:
                    "internal-medicine.html"

            }

        ];

    }


    // ==================================
    // الصف الأول الثانوي التمريض
    // ==================================

    else if (
        currentStudent.grade ===
        "الصف الأول الثانوي التمريض"
    ) {

        allContent = [

            {
                id: "anatomy",

                name:
                    "Anatomy",

                icon: "🫀",

                url:
                    "anatomy.html"

            },


            {
                id: "fundamental",

                name:
                    "Fundamentals of Nursing",

                icon: "👩‍⚕️",

                url:
                    "fundamental.html"

            }

        ];

    }


    // ==================================
    // عرض المواد
    // ==================================

    renderSubjects();

}


// ==========================================
// عرض المواد
// ==========================================

function renderSubjects() {

    const container =
        document.getElementById(
            "subjects"
        );


    if (!container) {

        return;

    }


    // ==================================
    // لا توجد مواد
    // ==================================

    if (!allContent.length) {

        setText(
            "totalSubjects",
            0
        );


        container.innerHTML = `

            <div class="empty-state">

                📚 لا يوجد محتوى متاح لك حاليًا

            </div>

        `;

        return;

    }


    // ==================================
    // عدد المواد
    // ==================================

    setText(
        "totalSubjects",
        allContent.length
    );


    // ==================================
    // إنشاء الكروت
    // ==================================

    let html = `

        <div class="subjects-grid">

    `;


    allContent.forEach(
        function (content) {

            html += `

                <div class="subject-card">

                    <div
                        style="
                            font-size: 35px;
                            margin-bottom: 10px;
                        "
                    >

                        ${content.icon || "📚"}

                    </div>


                    <h3>

                        ${escapeHtml(
                            content.name ||
                            "مادة دراسية"
                        )}

                    </h3>


                    <p class="subject-count">

                        📖 محتوى المادة متاح

                    </p>


                    <a
                        href="${escapeHtml(
                            content.url
                        )}"
                        style="
                            display: block;
                            margin-top: 12px;
                            padding: 10px;
                            background: #1976d2;
                            color: white;
                            text-decoration: none;
                            border-radius: 10px;
                            text-align: center;
                        "
                    >

                        دخول المادة →

                    </a>

                </div>

            `;

        }
    );


    html += `

        </div>

    `;


    container.innerHTML = html;

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


    // Firebase Timestamp

    if (
        typeof value.toDate ===
        "function"
    ) {

        return value.toDate();

    }


    // JavaScript Date

    if (
        value instanceof Date
    ) {

        return isNaN(
            value.getTime()
        )
            ? null
            : value;

    }


    // String / Number

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


    const subjects =
        document.getElementById(
            "subjects"
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


    if (subjects) {

        subjects.innerHTML =
            "❌ تعذر تحميل المواد";

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
