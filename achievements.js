// ==========================================
// 🩺 بوابة التمريض
// نظام الإنجازات
// ==========================================


// ==========================================
// الحصول على كود الطالب
// ==========================================

const achievementStudentCode =
    localStorage.getItem("studentCode");


// ==========================================
// البيانات
// ==========================================

let currentStudent = null;

let allResults = [];

let achievements = [];


// ==========================================
// التحقق من تسجيل الدخول
// ==========================================

if (!achievementStudentCode) {

    window.location.replace("login.html");

} else {

    loadAchievements();

}


// ==========================================
// تحميل البيانات
// ==========================================

async function loadAchievements() {

    try {

        console.log(
            "🏆 بدء تحميل الإنجازات"
        );


        console.log(
            "🔑 Student Code:",
            achievementStudentCode
        );


        console.log(
            "🔥 Firebase DB:",
            db
        );


        // ======================================
        // التأكد من وجود كود الطالب
        // ======================================

        if (!achievementStudentCode) {

            throw new Error(
                "لم يتم العثور على studentCode في localStorage"
            );

        }


        // ======================================
        // التأكد من Firebase
        // ======================================

        if (
            typeof db === "undefined" ||
            !db
        ) {

            throw new Error(
                "Firebase Firestore (db) غير جاهز"
            );

        }


        // ======================================
        // تحميل بيانات الطالب
        // ======================================

        await loadStudentData();


        console.log(
            "✅ تم تحميل بيانات الطالب:",
            currentStudent
        );


        // ======================================
        // تحميل النتائج
        // ======================================

        await loadStudentResults();


        console.log(
            "✅ تم تحميل النتائج:",
            allResults.length
        );


        // ======================================
        // حساب الإنجازات
        // ======================================

        calculateAchievements();


        console.log(
            "🏆 الإنجازات:",
            achievements
        );


        // ======================================
        // عرض الصفحة
        // ======================================

        renderPage();


        console.log(
            "✅ تم تحميل صفحة الإنجازات بالكامل"
        );

    }

    catch (error) {

        console.error(
            "❌ Achievements Error:",
            error
        );


        console.error(
            "❌ Error Message:",
            error.message
        );


        showError(
            error.message
        );

    }

}


// ==========================================
// بيانات الطالب
// ==========================================

async function loadStudentData() {

    const studentDoc =
        await db
            .collection("students")
            .doc(
                achievementStudentCode
            )
            .get();


    if (!studentDoc.exists) {

        throw new Error(
            "بيانات الطالب غير موجودة في students"
        );

    }


    currentStudent =
        studentDoc.data();

}


// ==========================================
// نتائج الطالب
// ==========================================

async function loadStudentResults() {

    const snapshot =
        await db
            .collection("results")
            .where(
                "studentCode",
                "==",
                achievementStudentCode
            )
            .get();


    allResults = [];


    snapshot.forEach(
        function (doc) {

            allResults.push({

                id: doc.id,

                ...doc.data()

            });

        }
    );


    // ======================================
    // ترتيب النتائج من الأحدث للأقدم
    // ======================================

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

}


// ==========================================
// حساب الإنجازات
// ==========================================

function calculateAchievements() {

    achievements = [];


    const totalTests =
        allResults.length;


    const percentages =
        allResults.map(
            function (result) {

                return getPercentage(
                    result
                );

            }
        );


    // ======================================
    // المتوسط
    // ======================================

    const average =
        totalTests > 0

            ? Math.round(

                percentages.reduce(
                    function (
                        sum,
                        value
                    ) {

                        return (
                            sum + value
                        );

                    },
                    0
                ) / totalTests

            )

            : 0;


    // ======================================
    // أعلى درجة
    // ======================================

    const highest =
        totalTests > 0

            ? Math.max(
                ...percentages
            )

            : 0;


    // ======================================
    // عدد الاختبارات الممتازة
    // ======================================

    const excellentTests =
        percentages.filter(
            function (value) {

                return value >= 85;

            }
        ).length;


    // ======================================
    // عدد الدرجات الكاملة
    // ======================================

    const perfectTests =
        percentages.filter(
            function (value) {

                return value === 100;

            }
        ).length;


    // ======================================
    // عدد الاختبارات الناجحة
    // ======================================

    const passedTests =
        percentages.filter(
            function (value) {

                return value >= 50;

            }
        ).length;


    // ======================================
    // Chapters المختلفة
    // ======================================

    const chapters =
        new Set();


    allResults.forEach(
        function (result) {

            if (
                result.chapter
            ) {

                chapters.add(
                    String(
                        result.chapter
                    ).trim()
                );

            }

        }
    );


    // ======================================
    // 🎯 أول اختبار
    // ======================================

    if (
        totalTests >= 1
    ) {

        addAchievement({

            icon: "🎯",

            title: "أول خطوة",

            description:
                "أكملت أول اختبار لك داخل بوابة التمريض.",

            type: "unlocked"

        });

    }


    // ======================================
    // 🔥 3 اختبارات
    // ======================================

    if (
        totalTests >= 3
    ) {

        addAchievement({

            icon: "🔥",

            title: "بداية قوية",

            description:
                "أكملت 3 اختبارات وبدأت طريق التفوق.",

            type: "unlocked"

        });

    }


    // ======================================
    // 📚 5 اختبارات
    // ======================================

    if (
        totalTests >= 5
    ) {

        addAchievement({

            icon: "📚",

            title: "محب المعرفة",

            description:
                "أكملت 5 اختبارات داخل المنصة.",

            type: "unlocked"

        });

    }


    // ======================================
    // 🚀 10 اختبارات
    // ======================================

    if (
        totalTests >= 10
    ) {

        addAchievement({

            icon: "🚀",

            title: "طالب نشيط",

            description:
                "أكملت 10 اختبارات.",

            type: "unlocked"

        });

    }


    // ======================================
    // 👑 20 اختبار
    // ======================================

    if (
        totalTests >= 20
    ) {

        addAchievement({

            icon: "👑",

            title: "أسطورة الاختبارات",

            description:
                "أكملت 20 اختبارًا داخل المنصة.",

            type: "unlocked"

        });

    }


    // ======================================
    // ✅ أول نجاح
    // ======================================

    if (
        passedTests >= 1
    ) {

        addAchievement({

            icon: "✅",

            title: "أول نجاح",

            description:
                "اجتزت أول اختبار لك بنجاح.",

            type: "unlocked"

        });

    }


    // ======================================
    // 🌟 اختبار ممتاز
    // ======================================

    if (
        excellentTests >= 1
    ) {

        addAchievement({

            icon: "🌟",

            title: "ممتاز",

            description:
                "حصلت على 85% أو أكثر في أحد الاختبارات.",

            type: "unlocked"

        });

    }


    // ======================================
    // 🏅 5 اختبارات ممتازة
    // ======================================

    if (
        excellentTests >= 5
    ) {

        addAchievement({

            icon: "🏅",

            title: "متفوق",

            description:
                "حصلت على 85% أو أكثر في 5 اختبارات.",

            type: "unlocked"

        });

    }


    // ======================================
    // 💯 الدرجة الكاملة
    // ======================================

    if (
        perfectTests >= 1
    ) {

        addAchievement({

            icon: "💯",

            title: "الدرجة الكاملة",

            description:
                "حصلت على 100% في أحد الاختبارات.",

            type: "unlocked"

        });

    }


    // ======================================
    // 📈 متوسط 70
    // ======================================

    if (
        average >= 70
    ) {

        addAchievement({

            icon: "📈",

            title: "في الطريق الصحيح",

            description:
                "وصل متوسط درجاتك إلى 70% أو أكثر.",

            type: "unlocked"

        });

    }


    // ======================================
    // 🏆 متوسط 85
    // ======================================

    if (
        average >= 85
    ) {

        addAchievement({

            icon: "🏆",

            title: "المتفوق",

            description:
                "وصل متوسط درجاتك إلى 85% أو أكثر.",

            type: "unlocked"

        });

    }


    // ======================================
    // 📖 3 Chapters
    // ======================================

    if (
        chapters.size >= 3
    ) {

        addAchievement({

            icon: "📖",

            title: "مستكشف المنهج",

            description:
                "اختبرت نفسك في 3 Chapters مختلفة.",

            type: "unlocked"

        });

    }


    // ======================================
    // 🧠 5 Chapters
    // ======================================

    if (
        chapters.size >= 5
    ) {

        addAchievement({

            icon: "🧠",

            title: "عاشق التمريض",

            description:
                "اختبرت نفسك في 5 Chapters مختلفة.",

            type: "unlocked"

        });

    }


    // ======================================
    // 🔒 الإنجازات المقفولة
    // ======================================

    addLockedAchievements(

        totalTests,

        average,

        perfectTests,

        chapters.size

    );

}


// ==========================================
// إضافة إنجاز
// ==========================================

function addAchievement(
    data
) {

    achievements.push(
        data
    );

}


// ==========================================
// الإنجازات المقفولة
// ==========================================

function addLockedAchievements(
    totalTests,
    average,
    perfectTests,
    chapters
) {


    // ======================================
    // 🔥 3 اختبارات
    // ======================================

    if (
        totalTests < 3
    ) {

        achievements.push({

            icon: "🔥",

            title: "بداية قوية",

            description:
                "أكمل 3 اختبارات لفتح هذا الإنجاز.",

            type: "locked"

        });

    }


    // ======================================
    // 📚 5 اختبارات
    // ======================================

    if (
        totalTests < 5
    ) {

        achievements.push({

            icon: "📚",

            title: "محب المعرفة",

            description:
                "أكمل 5 اختبارات لفتح هذا الإنجاز.",

            type: "locked"

        });

    }


    // ======================================
    // 🚀 10 اختبارات
    // ======================================

    if (
        totalTests < 10
    ) {

        achievements.push({

            icon: "🚀",

            title: "طالب نشيط",

            description:
                "أكمل 10 اختبارات لفتح هذا الإنجاز.",

            type: "locked"

        });

    }


    // ======================================
    // 💯 الدرجة الكاملة
    // ======================================

    if (
        perfectTests < 1
    ) {

        achievements.push({

            icon: "💯",

            title: "الدرجة الكاملة",

            description:
                "احصل على 100% في أحد الاختبارات.",

            type: "locked"

        });

    }


    // ======================================
    // 🏆 المتفوق
    // ======================================

    if (
        average < 85
    ) {

        achievements.push({

            icon: "🏆",

            title: "المتفوق",

            description:
                "ارفع متوسط درجاتك إلى 85% أو أكثر.",

            type: "locked"

        });

    }


    // ======================================
    // 🧠 عاشق التمريض
    // ======================================

    if (
        chapters < 5
    ) {

        achievements.push({

            icon: "🧠",

            title: "عاشق التمريض",

            description:
                "اختبر نفسك في 5 Chapters مختلفة.",

            type: "locked"

        });

    }

}


// ==========================================
// عرض الصفحة
// ==========================================

function renderPage() {

    // ======================================
    // النسب
    // ======================================

    const percentages =
        allResults.map(
            function (result) {

                return getPercentage(
                    result
                );

            }
        );


    // ======================================
    // عدد الاختبارات
    // ======================================

    const totalTests =
        allResults.length;


    // ======================================
    // المتوسط
    // ======================================

    const average =
        totalTests > 0

            ? Math.round(

                percentages.reduce(
                    function (
                        sum,
                        value
                    ) {

                        return (
                            sum + value
                        );

                    },
                    0
                ) / totalTests

            )

            : 0;


    // ======================================
    // Chapters
    // ======================================

    const chapters =
        new Set();


    allResults.forEach(
        function (result) {

            if (
                result.chapter
            ) {

                chapters.add(
                    String(
                        result.chapter
                    ).trim()
                );

            }

        }
    );


    // ======================================
    // 👨‍🎓 بيانات الطالب
    // ======================================

    setText(
        "studentName",
        currentStudent.name ||
        "طالبنا العزيز"
    );


    setText(
        "studentGrade",
        currentStudent.grade ||
        "-"
    );


    setText(
        "studentCode",
        achievementStudentCode
    );


    setText(
        "welcomeAchievement",

        "👋 أهلاً بك " +

        (
            currentStudent.name ||
            "طالبنا العزيز"
        ) +

        " — استمر في التقدم!"
    );


    // ======================================
    // 📊 الإحصائيات
    // ======================================

    setText(
        "testsCount",
        totalTests
    );


    setText(
        "averageScore",
        average + "%"
    );


    setText(
        "badgesCount",

        achievements.filter(
            function (achievement) {

                return (
                    achievement.type ===
                    "unlocked"
                );

            }
        ).length

    );


    setText(
        "chaptersCount",
        chapters.size
    );


    // ======================================
    // 📈 مستوى التقدم
    // ======================================

    const progress =
        Math.min(

            100,

            Math.round(

                (
                    totalTests /
                    10
                ) * 100

            )

        );


    setText(
        "progressPercentage",
        progress + "%"
    );


    const progressFill =
        document.getElementById(
            "progressFill"
        );


    if (
        progressFill
    ) {

        progressFill.style.width =
            progress + "%";

    }


    // ======================================
    // 🏆 عرض الإنجازات
    // ======================================

    renderAchievements();


    // ======================================
    // 💬 رسالة تحفيزية
    // ======================================

    renderMotivation(
        totalTests,
        average
    );

}


// ==========================================
// عرض الشارات
// ==========================================

function renderAchievements() {

    const container =
        document.getElementById(
            "badgesContainer"
        );


    if (!container) {

        return;

    }


    if (
        !achievements.length
    ) {

        container.innerHTML = `

            <div class="achievement-empty">

                🏆

                <br>

                ابدأ أول اختبار لفتح أول إنجاز لك!

            </div>

        `;

        return;

    }


    let html = "";


    achievements.forEach(
        function (achievement) {

            const locked =
                achievement.type ===
                "locked";


            html += `

                <div class="
                    achievement-badge
                    ${locked ? "locked" : "unlocked"}
                ">

                    <div class="badge-icon">

                        ${
                            locked
                                ? "🔒"
                                : achievement.icon
                        }

                    </div>


                    <div class="badge-content">

                        <h3>

                            ${
                                escapeHtml(
                                    achievement.title
                                )
                            }

                        </h3>


                        <p>

                            ${
                                escapeHtml(
                                    achievement.description
                                )
                            }

                        </p>


                        <span class="badge-status">

                            ${
                                locked
                                    ? "🔒 مقفول"
                                    : "✅ تم فتحه"
                            }

                        </span>

                    </div>

                </div>

            `;

        }
    );


    container.innerHTML =
        html;

}


// ==========================================
// رسالة تحفيزية
// ==========================================

function renderMotivation(
    totalTests,
    average
) {

    const container =
        document.getElementById(
            "motivationCard"
        );


    if (!container) {

        return;

    }


    let title = "";

    let message = "";


    // ======================================
    // لا توجد اختبارات
    // ======================================

    if (
        totalTests === 0
    ) {

        title =
            "🚀 حان وقت البداية!";

        message =
            "ابدأ أول اختبار وافتح أول إنجاز لك.";

    }


    // ======================================
    // 90+
    // ======================================

    else if (
        average >= 90
    ) {

        title =
            "👑 أداء استثنائي!";

        message =
            "مستواك ممتاز جدًا، استمر بنفس القوة.";

    }


    // ======================================
    // 85+
    // ======================================

    else if (
        average >= 85
    ) {

        title =
            "🏆 أنت متفوق!";

        message =
            "أداؤك رائع، حاول الحفاظ على مستواك.";

    }


    // ======================================
    // 70+
    // ======================================

    else if (
        average >= 70
    ) {

        title =
            "🔥 أنت في الطريق الصحيح!";

        message =
            "استمر في حل الاختبارات وستصل لمستوى أعلى.";

    }


    // ======================================
    // 50+
    // ======================================

    else if (
        average >= 50
    ) {

        title =
            "💪 استمر ولا تستسلم!";

        message =
            "كل اختبار جديد فرصة لتحسين مستواك.";

    }


    // ======================================
    // أقل من 50
    // ======================================

    else {

        title =
            "📚 وقت المراجعة!";

        message =
            "راجع الـ Chapters وحاول مرة أخرى.";

    }


    container.innerHTML = `

        <div>

            <h2>

                ${title}

            </h2>


            <p>

                ${message}

            </p>

        </div>

    `;

}


// ==========================================
// حساب النسبة
// ==========================================

function getPercentage(
    data
) {

    // ======================================
    // إذا كانت النسبة محفوظة
    // ======================================

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

            : Math.round(
                value
            );

    }


    // ======================================
    // حساب النسبة من الدرجة
    // ======================================

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

            (
                score /
                total
            ) * 100

        );

    }


    return 0;

}


// ==========================================
// التاريخ
// ==========================================

function getDate(
    value
) {

    if (!value) {

        return null;

    }


    // ======================================
    // Firestore Timestamp
    // ======================================

    if (
        typeof value.toDate ===
        "function"
    ) {

        return value.toDate();

    }


    // ======================================
    // JavaScript Date
    // ======================================

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


    if (
        element
    ) {

        element.textContent =
            value;

    }

}


// ==========================================
// حماية النصوص
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
// عرض الخطأ
// ==========================================

function showError(
    errorMessage
) {

    const container =
        document.getElementById(
            "badgesContainer"
        );


    if (
        container
    ) {

        container.innerHTML = `

            <div class="achievement-error">

                ❌ حدث خطأ أثناء تحميل إنجازاتك

                <br><br>

                حاول تحديث الصفحة مرة أخرى.

                <br><br>

                <small
                    style="
                        direction:ltr;
                        display:block;
                        opacity:.7;
                        word-break:break-word;
                    "
                >

                    ${
                        escapeHtml(
                            errorMessage ||
                            "Unknown Error"
                        )
                    }

                </small>

            </div>

        `;

    }

}
