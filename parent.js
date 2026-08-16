// ==========================================
// بوابة التمريض
// Parent Dashboard
// لوحة ولي الأمر
// ==========================================


// ==========================================
// بيانات تسجيل الدخول
// ==========================================

const accountType =
    localStorage.getItem("accountType");

const parentCode =
    localStorage.getItem("parentCode");

const studentCode =
    localStorage.getItem("studentCode");


// ==========================================
// Device ID
// ==========================================

// استخدام نفس Device ID الموجود إن كان موجودًا
let deviceId =
    localStorage.getItem("deviceId");


// إنشاء Device ID جديد إذا لم يكن موجودًا
if (!deviceId) {

    if (
        typeof crypto !== "undefined" &&
        typeof crypto.randomUUID === "function"
    ) {

        deviceId =
            crypto.randomUUID();

    }

    else {

        deviceId =
            "device-" +
            Date.now() +
            "-" +
            Math.random()
                .toString(36)
                .substring(2, 15);

    }


    localStorage.setItem(
        "deviceId",
        deviceId
    );

}


// ==========================================
// التحقق من الدخول
// ==========================================

if (
    accountType !== "parent" ||
    !parentCode ||
    !studentCode
) {

    window.location.replace(
        "login.html"
    );

}


// ==========================================
// البيانات
// ==========================================

let parentData = null;

let studentData = null;

let allResults = [];

let allNotifications = [];


// ==========================================
// تشغيل لوحة ولي الأمر
// ==========================================

loadParentDashboard();


// ==========================================
// تحميل Dashboard
// ==========================================

function loadParentDashboard() {

    loadParentData()

        .then(function () {

            return loadStudentData();

        })

        .then(function () {

            return loadStudentResults();

        })

        .then(function () {

            return loadParentNotifications();

        })

        .catch(function (error) {

            console.error(
                "Parent Dashboard Error:",
                error
            );

            showError();

        });

}


// ==========================================
// تحميل بيانات ولي الأمر
// ==========================================

function loadParentData() {

    return db.collection("parents")

        .doc(parentCode)

        .get()

        .then(function (doc) {

            if (!doc.exists) {

                throw new Error(
                    "بيانات ولي الأمر غير موجودة"
                );

            }


            parentData =
                doc.data();


            // ==================================
            // تحديث Device ID لولي الأمر
            // ==================================

            return db.collection("parents")
                .doc(parentCode)
                .update({

                    deviceId:
                        deviceId,

                    lastDeviceUpdate:
                        firebase.firestore.FieldValue
                            .serverTimestamp()

                })

                .catch(function (error) {

                    console.error(
                        "Parent Device ID Error:",
                        error
                    );

                    // لا نوقف Dashboard
                    // إذا فشل تحديث Device ID

                })

                .then(function () {

                    renderParentWelcome();

                });

        });

}


// ==========================================
// الترحيب
// ==========================================

function renderParentWelcome() {

    const element =
        document.getElementById(
            "welcomeParent"
        );


    if (!element) {

        return;

    }


    element.textContent =
        "👋 أهلاً بك " +
        (
            parentData.name ||
            "ولي الأمر"
        );

}


// ==========================================
// تحميل بيانات الطالب
// ==========================================

function loadStudentData() {

    return db.collection("students")

        .doc(studentCode)

        .get()

        .then(function (doc) {

            if (!doc.exists) {

                throw new Error(
                    "بيانات الطالب غير موجودة"
                );

            }


            studentData =
                doc.data();

        });

}


// ==========================================
// تحميل النتائج
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


            snapshot.forEach(
                function (doc) {

                    allResults.push({

                        id: doc.id,

                        ...doc.data()

                    });

                }
            );


            // ==============================
            // ترتيب الأحدث أولاً
            // ==============================

            allResults.sort(
                function (a, b) {

                    const dateA =
                        getDate(
                            a.createdAt
                        ) ||
                        new Date(0);


                    const dateB =
                        getDate(
                            b.createdAt
                        ) ||
                        new Date(0);


                    return (
                        dateB.getTime() -
                        dateA.getTime()
                    );

                }
            );


            // ==================================
            // مهم جدًا
            // حساب مستوى الطالب بعد تحميل النتائج
            // ==================================

            renderStudentLevel();


            // ==================================
            // باقي الإحصائيات
            // ==================================

            renderStatistics();

            renderSubjects();

            renderWeakPoints();

            renderLatestTests();

            renderMonthlyReport();

        });

}


// ==========================================
// مستوى الطالب
// ==========================================

function renderStudentLevel() {

    const average =
        calculateAverage(
            allResults
        );


    setText(
        "studentLevel",
        average + "%"
    );


    let text;


    if (average >= 90) {

        text =
            "🏆 مستوى ممتاز جدًا";

    }

    else if (average >= 85) {

        text =
            "🌟 مستوى ممتاز";

    }

    else if (average >= 75) {

        text =
            "👍 مستوى جيد جدًا";

    }

    else if (average >= 65) {

        text =
            "🙂 مستوى جيد";

    }

    else if (average >= 50) {

        text =
            "⚠️ يحتاج إلى تحسين";

    }

    else {

        text =
            "🚨 يحتاج إلى متابعة";

    }


    setText(
        "studentLevelText",
        text
    );

}


// ==========================================
// الإحصائيات
// ==========================================

function renderStatistics() {

    const total =
        allResults.length;


    const average =
        calculateAverage(
            allResults
        );


    const passed =
        allResults.filter(
            function (result) {

                return (
                    getPercentage(result) >=
                    50
                );

            }
        ).length;


    const successRate =
        total > 0
            ? Math.round(
                (passed / total) * 100
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
        "successRate",
        successRate + "%"
    );

}


// ==========================================
// المواد
// ==========================================

function renderSubjects() {

    const container =
        document.getElementById(
            "subjects"
        );


    if (!container) {

        return;

    }


    if (!allResults.length) {

        container.innerHTML =
            `<div class="empty">
                📝 لا توجد نتائج حتى الآن
            </div>`;

        return;

    }


    const subjects = {};


    allResults.forEach(
        function (result) {

            const subject =
                result.subject ||
                "غير محدد";


            if (!subjects[subject]) {

                subjects[subject] = {

                    total: 0,

                    sum: 0

                };

            }


            subjects[subject].total++;

            subjects[subject].sum +=
                getPercentage(result);

        }
    );


    let html = "";


    Object.keys(subjects)
        .forEach(
            function (subject) {

                const average =
                    Math.round(
                        subjects[subject].sum /
                        subjects[subject].total
                    );


                html += `

                    <div class="subject-item">

                        <div class="subject-header">

                            <strong>

                                ${escapeHtml(
                                    subject
                                )}

                            </strong>

                            <strong>

                                ${average}%

                            </strong>

                        </div>


                        <div class="subject-bar">

                            <div
                                class="subject-fill"
                                style="width:${average}%"
                            ></div>

                        </div>

                    </div>

                `;

            }
        );


    container.innerHTML =
        html;

}


// ==========================================
// نقاط الضعف
// ==========================================

function renderWeakPoints() {

    const container =
        document.getElementById(
            "weakPoints"
        );


    if (!container) {

        return;

    }


    if (!allResults.length) {

        container.innerHTML =
            `<div class="empty">
                لا توجد بيانات كافية للتحليل
            </div>`;

        return;

    }


    // ======================================
    // تحليل Chapters
    // ======================================

    const chapters = {};


    allResults.forEach(
        function (result) {

            const subject =
                result.subject ||
                "غير محدد";


            const chapter =
                result.chapter ||
                "غير محدد";


            const key =
                subject +
                "|||" +
                chapter;


            if (!chapters[key]) {

                chapters[key] = {

                    subject:
                        subject,

                    chapter:
                        chapter,

                    total:
                        0,

                    sum:
                        0

                };

            }


            chapters[key].total++;

            chapters[key].sum +=
                getPercentage(result);

        }
    );


    const weak =
        Object.values(chapters)

            .map(
                function (item) {

                    return {

                        ...item,

                        average:
                            Math.round(
                                item.sum /
                                item.total
                            )

                    };

                }
            )

            .filter(
                function (item) {

                    return item.average < 70;

                }
            )

            .sort(
                function (a, b) {

                    return (
                        a.average -
                        b.average
                    );

                }
            )

            .slice(0, 5);


    if (!weak.length) {

        container.innerHTML = `

            <div class="empty">

                🎉 لا توجد نقاط ضعف واضحة حاليًا

            </div>

        `;

        return;

    }


    let html = "";


    weak.forEach(
        function (item) {

            html += `

                <div class="weak-point">

                    <strong>

                        ⚠️ ${escapeHtml(
                            item.subject
                        )}

                    </strong>

                    <div>

                        ${escapeHtml(
                            item.chapter
                        )}

                    </div>

                    <div>

                        متوسط الأداء:

                        <strong>

                            ${item.average}%

                        </strong>

                    </div>

                    <small>

                        يحتاج إلى مراجعة

                    </small>

                </div>

            `;

        }
    );


    container.innerHTML =
        html;

}


// ==========================================
// آخر الاختبارات
// ==========================================

function renderLatestTests() {

    const container =
        document.getElementById(
            "latestTests"
        );


    if (!container) {

        return;

    }


    if (!allResults.length) {

        container.innerHTML =
            `<div class="empty">
                لا توجد اختبارات حتى الآن
            </div>`;

        return;

    }


    const latest =
        allResults.slice(
            0,
            5
        );


    let html = "";


    latest.forEach(
        function (result) {

            const percentage =
                getPercentage(
                    result
                );


            const score =
                result.score ?? 0;


            const total =
                result.total ?? 0;


            html += `

                <div class="notification-item">

                    <div class="notification-title">

                        📝

                        ${escapeHtml(
                            result.subject ||
                            "اختبار"
                        )}

                    </div>


                    <div>

                        ${escapeHtml(
                            result.chapter ||
                            ""
                        )}

                    </div>


                    <div>

                        النتيجة:

                        <strong>

                            ${score}/${total}

                            (${percentage}%)

                        </strong>

                    </div>


                    <div class="notification-time">

                        🕒

                        ${formatDateTime(
                            result.createdAt
                        )}

                    </div>

                </div>

            `;

        }
    );


    container.innerHTML =
        html;

}


// ==========================================
// التطور
// ==========================================

function calculateImprovement() {

    const now =
        new Date();


    const currentMonth =
        now.getMonth();


    const currentYear =
        now.getFullYear();


    const currentResults =
        allResults.filter(
            function (result) {

                const date =
                    getDate(
                        result.createdAt
                    );


                if (!date) {

                    return false;

                }


                return (
                    date.getMonth() ===
                    currentMonth &&
                    date.getFullYear() ===
                    currentYear
                );

            }
        );


    // ======================================
    // الشهر السابق
    // ======================================

    const previousDate =
        new Date(
            currentYear,
            currentMonth - 1,
            1
        );


    const previousMonth =
        previousDate.getMonth();


    const previousYear =
        previousDate.getFullYear();


    const previousResults =
        allResults.filter(
            function (result) {

                const date =
                    getDate(
                        result.createdAt
                    );


                if (!date) {

                    return false;

                }


                return (
                    date.getMonth() ===
                    previousMonth &&
                    date.getFullYear() ===
                    previousYear
                );

            }
        );


    const currentAverage =
        calculateAverage(
            currentResults
        );


    const previousAverage =
        calculateAverage(
            previousResults
        );


    if (!previousResults.length) {

        return {

            value: 0,

            hasPrevious: false

        };

    }


    return {

        value:
            currentAverage -
            previousAverage,

        hasPrevious: true

    };

}


// ==========================================
// التقرير الشهري
// ==========================================

function renderMonthlyReport() {

    const now =
        new Date();


    const monthName =
        now.toLocaleDateString(
            "ar-EG",
            {
                month:
                    "long",

                year:
                    "numeric"
            }
        );


    setText(
        "reportTitle",
        "تقرير " +
        (
            studentData.name ||
            "الطالب"
        ) +
        " — " +
        monthName
    );


    // ======================================
    // نتائج الشهر الحالي
    // ======================================

    const currentResults =
        getCurrentMonthResults();


    const tests =
        currentResults.length;


    const average =
        calculateAverage(
            currentResults
        );


    const passed =
        currentResults.filter(
            function (result) {

                return (
                    getPercentage(result) >=
                    50
                );

            }
        ).length;


    const success =
        tests > 0
            ? Math.round(
                (passed / tests) * 100
            )
            : 0;


    setText(
        "reportTests",
        tests
    );


    setText(
        "reportAverage",
        average + "%"
    );


    setText(
        "reportSuccess",
        success + "%"
    );


    // ======================================
    // أقوى مادة
    // ======================================

    const subjectData =
        calculateSubjectAverages(
            currentResults.length
                ? currentResults
                : allResults
        );


    const subjects =
        Object.entries(
            subjectData
        );


    subjects.sort(
        function (a, b) {

            return (
                b[1] -
                a[1]
            );

        }
    );


    setText(
        "bestSubject",
        subjects.length
            ? subjects[0][0] +
              " — " +
              subjects[0][1] +
              "%"
            : "-"
    );


    // ======================================
    // أضعف Chapter
    // ======================================

    const weakest =
        findWeakestChapter(
            currentResults.length
                ? currentResults
                : allResults
        );


    setText(
        "weakestPoint",
        weakest
            ? weakest.subject +
              " / " +
              weakest.chapter +
              " — " +
              weakest.average +
              "%"
            : "-"
    );


    // ======================================
    // التطور
    // ======================================

    const improvement =
        calculateImprovement();


    if (
        !improvement.hasPrevious
    ) {

        setText(
            "reportImprovement",
            "لا توجد مقارنة"
        );


        setText(
            "improvement",
            "—"
        );


        setText(
            "improvementText",
            "لا توجد نتائج للشهر السابق"
        );


        return;

    }


    const value =
        improvement.value;


    const formatted =
        (
            value >= 0
                ? "+"
                : ""
        ) +
        value +
        "%";


    setText(
        "reportImprovement",
        formatted
    );


    setText(
        "improvement",
        formatted
    );


    setText(
        "improvementText",

        value > 0

            ? "📈 تحسن عن الشهر السابق"

            : value < 0

                ? "📉 تراجع عن الشهر السابق"

                : "➖ لا يوجد تغيير"

    );

}


// ==========================================
// نتائج الشهر الحالي
// ==========================================

function getCurrentMonthResults() {

    const now =
        new Date();


    return allResults.filter(
        function (result) {

            const date =
                getDate(
                    result.createdAt
                );


            if (!date) {

                return false;

            }


            return (
                date.getMonth() ===
                now.getMonth() &&

                date.getFullYear() ===
                now.getFullYear()
            );

        }
    );

}


// ==========================================
// حساب متوسط المادة
// ==========================================

function calculateSubjectAverages(
    results
) {

    const subjects = {};


    results.forEach(
        function (result) {

            const subject =
                result.subject ||
                "غير محدد";


            if (!subjects[subject]) {

                subjects[subject] = {

                    sum: 0,

                    count: 0

                };

            }


            subjects[subject].sum +=
                getPercentage(
                    result
                );


            subjects[subject].count++;

        }
    );


    const output = {};


    Object.keys(subjects)
        .forEach(
            function (subject) {

                output[subject] =
                    Math.round(
                        subjects[subject].sum /
                        subjects[subject].count
                    );

            }
        );


    return output;

}


// ==========================================
// أضعف Chapter
// ==========================================

function findWeakestChapter(
    results
) {

    if (!results.length) {

        return null;

    }


    const chapters = {};


    results.forEach(
        function (result) {

            const subject =
                result.subject ||
                "غير محدد";


            const chapter =
                result.chapter ||
                "غير محدد";


            const key =
                subject +
                "|||" +
                chapter;


            if (!chapters[key]) {

                chapters[key] = {

                    subject:
                        subject,

                    chapter:
                        chapter,

                    sum:
                        0,

                    count:
                        0

                };

            }


            chapters[key].sum +=
                getPercentage(
                    result
                );


            chapters[key].count++;

        }
    );


    const list =
        Object.values(
            chapters
        );


    list.forEach(
        function (item) {

            item.average =
                Math.round(
                    item.sum /
                    item.count
                );

        }
    );


    list.sort(
        function (a, b) {

            return (
                a.average -
                b.average
            );

        }
    );


    return list[0] || null;

}


// ==========================================
// تحميل إشعارات الطالب
// ==========================================

function loadParentNotifications() {

    return db.collection("notifications")

        .orderBy(
            "createdAt",
            "desc"
        )

        .limit(50)

        .get()

        .then(function (snapshot) {

            allNotifications = [];


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

                        id:
                            doc.id,

                        ...notification

                    });

                }
            );


            renderNotifications();

        })

        .catch(function (error) {

            console.error(
                "Notifications Error:",
                error
            );


            const container =
                document.getElementById(
                    "notifications"
                );


            if (container) {

                container.innerHTML = `

                    <div class="empty">

                        🔕 لا توجد إشعارات

                    </div>

                `;

            }

        });

}


// ==========================================
// هل الإشعار خاص بالطالب؟
// ==========================================

function notificationIsForStudent(
    notification
) {

    const targetType =
        notification.targetType ||
        "all";


    // للجميع

    if (
        targetType === "all"
    ) {

        return true;

    }


    // طالب محدد

    if (
        targetType === "student"
    ) {

        return (
            notification.targetId ===
            studentCode
        );

    }


    // صف محدد

    if (
        targetType === "grade"
    ) {

        return (
            String(
                notification.targetId
            ) ===
            String(
                studentData.grade
            )
        );

    }


    return false;

}


// ==========================================
// عرض الإشعارات
// ==========================================

function renderNotifications() {

    const container =
        document.getElementById(
            "notifications"
        );


    if (!container) {

        return;

    }


    if (!allNotifications.length) {

        container.innerHTML = `

            <div class="empty">

                🔕 لا توجد إشعارات حاليًا

            </div>

        `;

        return;

    }


    let html = "";


    allNotifications.forEach(
        function (notification) {

            html += `

                <div class="notification-item">

                    <div class="notification-title">

                        ${escapeHtml(
                            notification.title ||
                            "إشعار جديد"
                        )}

                    </div>


                    <div class="notification-message">

                        ${escapeHtml(
                            notification.message ||
                            ""
                        )}

                    </div>


                    <div class="notification-time">

                        🕒

                        ${formatDateTime(
                            notification.createdAt
                        )}

                    </div>

                </div>

            `;

        }
    );


    container.innerHTML =
        html;

}


// ==========================================
// حساب المتوسط
// ==========================================

function calculateAverage(
    results
) {

    if (!results.length) {

        return 0;

    }


    let sum = 0;


    results.forEach(
        function (result) {

            sum +=
                getPercentage(
                    result
                );

        }
    );


    return Math.round(
        sum / results.length
    );

}


// ==========================================
// حساب النسبة
// ==========================================

function getPercentage(
    data
) {

    if (
        data.percentage !==
        undefined &&
        data.percentage !==
        null
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
            (score / total) *
            100
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


    if (
        value.seconds !== undefined
    ) {

        return new Date(
            value.seconds * 1000
        );

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
// تنسيق التاريخ والوقت
// ==========================================

function formatDateTime(
    value
) {

    const date =
        getDate(value);


    if (!date) {

        return "-";

    }


    return date.toLocaleString(
        "ar-EG",
        {

            year:
                "numeric",

            month:
                "2-digit",

            day:
                "2-digit",

            hour:
                "2-digit",

            minute:
                "2-digit"

        }
    );

}


// ==========================================
// تغيير النص
// ==========================================

function setText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.textContent =
            value;

    }

}


// ==========================================
// حماية HTML
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


// ==========================================
// تسجيل الخروج
// ==========================================

const logoutButton =
    document.getElementById(
        "logoutBtn"
    );


if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        function () {

            localStorage.removeItem(
                "accountType"
            );

            localStorage.removeItem(
                "parentCode"
            );

            localStorage.removeItem(
                "studentCode"
            );

            localStorage.removeItem(
                "parentName"
            );

            localStorage.removeItem(
                "deviceId"
            );


            firebase.auth()
                .signOut()
                .finally(
                    function () {

                        window.location.replace(
                            "login.html"
                        );

                    }
                );

        }
    );

}


// ==========================================
// عرض الأخطاء
// ==========================================

function showError() {

    const elements = [

        "subjects",

        "weakPoints",

        "latestTests",

        "notifications"

    ];


    elements.forEach(
        function (id) {

            const element =
                document.getElementById(
                    id
                );


            if (element) {

                element.innerHTML = `

                    <div class="empty">

                        ❌ حدث خطأ أثناء تحميل البيانات

                    </div>

                `;

            }

        }
    );

}
