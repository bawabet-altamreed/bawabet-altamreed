// ==========================================
// 🩺 بوابة التمريض
// نظام الإنجازات
// ==========================================


// ==========================================
// الحصول على كود الطالب
// ==========================================

const studentCode =
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

if (!studentCode) {

    window.location.replace("login.html");

} else {

    loadAchievements();

}


// ==========================================
// تحميل البيانات
// ==========================================

async function loadAchievements() {

    try {

        await loadStudentData();

        await loadStudentResults();

        calculateAchievements();

        renderPage();

    }

    catch (error) {

        console.error(
            "Achievements Error:",
            error
        );

        showError();

    }

}


// ==========================================
// بيانات الطالب
// ==========================================

async function loadStudentData() {

    const studentDoc =
        await db
            .collection("students")
            .doc(studentCode)
            .get();


    if (!studentDoc.exists) {

        throw new Error(
            "بيانات الطالب غير موجودة"
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
                studentCode
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


    allResults.sort(
        function (a, b) {

            const dateA =
                getDate(a.createdAt)
                || new Date(0);

            const dateB =
                getDate(b.createdAt)
                || new Date(0);


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


    const average =
        totalTests > 0

            ? Math.round(
                percentages.reduce(
                    function (sum, value) {

                        return sum + value;

                    },
                    0
                ) / totalTests
            )

            : 0;


    const highest =
        totalTests > 0

            ? Math.max(
                ...percentages
            )

            : 0;


    const excellentTests =
        percentages.filter(
            function (value) {

                return value >= 85;

            }
        ).length;


    const perfectTests =
        percentages.filter(
            function (value) {

                return value === 100;

            }
        ).length;


    const passedTests =
        percentages.filter(
            function (value) {

                return value >= 50;

            }
        ).length;


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
    // أول اختبار
    // ======================================

    if (totalTests >= 1) {

        addAchievement({

            icon: "🎯",

            title: "أول خطوة",

            description:
                "أكملت أول اختبار لك داخل بوابة التمريض.",

            type: "unlocked"

        });

    }


    // ======================================
    // 3 اختبارات
    // ======================================

    if (totalTests >= 3) {

        addAchievement({

            icon: "🔥",

            title: "بداية قوية",

            description:
                "أكملت 3 اختبارات وبدأت طريق التفوق.",

            type: "unlocked"

        });

    }


    // ======================================
    // 5 اختبارات
    // ======================================

    if (totalTests >= 5) {

        addAchievement({

            icon: "📚",

            title: "محب المعرفة",

            description:
                "أكملت 5 اختبارات داخل المنصة.",

            type: "unlocked"

        });

    }


    // ======================================
    // 10 اختبارات
    // ======================================

    if (totalTests >= 10) {

        addAchievement({

            icon: "🚀",

            title: "طالب نشيط",

            description:
                "أكملت 10 اختبارات.",

            type: "unlocked"

        });

    }


    // ======================================
    // 20 اختبار
    // ======================================

    if (totalTests >= 20) {

        addAchievement({

            icon: "👑",

            title: "أسطورة الاختبارات",

            description:
                "أكملت 20 اختبارًا داخل المنصة.",

            type: "unlocked"

        });

    }


    // ======================================
    // نجاح أول اختبار
    // ======================================

    if (passedTests >= 1) {

        addAchievement({

            icon: "✅",

            title: "أول نجاح",

            description:
                "اجتزت أول اختبار لك بنجاح.",

            type: "unlocked"

        });

    }


    // ======================================
    // اختبار ممتاز
    // ======================================

    if (excellentTests >= 1) {

        addAchievement({

            icon: "🌟",

            title: "ممتاز",

            description:
                "حصلت على 85% أو أكثر في أحد الاختبارات.",

            type: "unlocked"

        });

    }


    // ======================================
    // 5 اختبارات ممتازة
    // ======================================

    if (excellentTests >= 5) {

        addAchievement({

            icon: "🏅",

            title: "متفوق",

            description:
                "حصلت على 85% أو أكثر في 5 اختبارات.",

            type: "unlocked"

        });

    }


    // ======================================
    // الدرجة الكاملة
    // ======================================

    if (perfectTests >= 1) {

        addAchievement({

            icon: "💯",

            title: "الدرجة الكاملة",

            description:
                "حصلت على 100% في أحد الاختبارات.",

            type: "unlocked"

        });

    }


    // ======================================
    // متوسط 70
    // ======================================

    if (average >= 70) {

        addAchievement({

            icon: "📈",

            title: "في الطريق الصحيح",

            description:
                "وصل متوسط درجاتك إلى 70% أو أكثر.",

            type: "unlocked"

        });

    }


    // ======================================
    // متوسط 85
    // ======================================

    if (average >= 85) {

        addAchievement({

            icon: "🏆",

            title: "المتفوق",

            description:
                "وصل متوسط درجاتك إلى 85% أو أكثر.",

            type: "unlocked"

        });

    }


    // ======================================
    // أكثر من Chapter
    // ======================================

    if (chapters.size >= 3) {

        addAchievement({

            icon: "📖",

            title: "مستكشف المنهج",

            description:
                "اختبرت نفسك في 3 Chapters مختلفة.",

            type: "unlocked"

        });

    }


    // ======================================
    // إنهاء 5 Chapters
    // ======================================

    if (chapters.size >= 5) {

        addAchievement({

            icon: "🧠",

            title: "عاشق التمريض",

            description:
                "اختبرت نفسك في 5 Chapters مختلفة.",

            type: "unlocked"

        });

    }


    // ======================================
    // الإنجازات المقفولة
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

function addAchievement(data) {

    achievements.push(data);

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


    if (totalTests < 3) {

        achievements.push({

            icon: "🔥",

            title: "بداية قوية",

            description:
                "أكمل 3 اختبارات لفتح هذا الإنجاز.",

            type: "locked"

        });

    }


    if (totalTests < 5) {

        achievements.push({

            icon: "📚",

            title: "محب المعرفة",

            description:
                "أكمل 5 اختبارات لفتح هذا الإنجاز.",

            type: "locked"

        });

    }


    if (totalTests < 10) {

        achievements.push({

            icon: "🚀",

            title: "طالب نشيط",

            description:
                "أكمل 10 اختبارات لفتح هذا الإنجاز.",

            type: "locked"

        });

    }


    if (perfectTests < 1) {

        achievements.push({

            icon: "💯",

            title: "الدرجة الكاملة",

            description:
                "احصل على 100% في أحد الاختبارات.",

            type: "locked"

        });

    }


    if (average < 85) {

        achievements.push({

            icon: "🏆",

            title: "المتفوق",

            description:
                "ارفع متوسط درجاتك إلى 85% أو أكثر.",

            type: "locked"

        });

    }


    if (chapters < 5) {

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

    const percentages =
        allResults.map(
            function (result) {

                return getPercentage(
                    result
                );

            }
        );


    const totalTests =
        allResults.length;


    const average =
        totalTests > 0

            ? Math.round(
                percentages.reduce(
                    function (sum, value) {

                        return sum + value;

                    },
                    0
                ) / totalTests
            )

            : 0;


    const chapters =
        new Set();


    allResults.forEach(
        function (result) {

            if (result.chapter) {

                chapters.add(
                    String(
                        result.chapter
                    ).trim()
                );

            }

        }
    );


    // ======================================
    // بيانات الطالب
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
        studentCode
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
    // الإحصائيات
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
    // مستوى التقدم
    // ======================================

    const progress =
        Math.min(
            100,
            Math.round(
                (
                    totalTests / 10
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


    if (progressFill) {

        progressFill.style.width =
            progress + "%";

    }


    // ======================================
    // عرض الإنجازات
    // ======================================

    renderAchievements();


    // ======================================
    // رسالة تحفيزية
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


    if (!achievements.length) {

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


    if (totalTests === 0) {

        title =
            "🚀 حان وقت البداية!";

        message =
            "ابدأ أول اختبار وافتح أول إنجاز لك.";

    }

    else if (average >= 90) {

        title =
            "👑 أداء استثنائي!";

        message =
            "مستواك ممتاز جدًا، استمر بنفس القوة.";

    }

    else if (average >= 85) {

        title =
            "🏆 أنت متفوق!";

        message =
            "أداؤك رائع، حاول الحفاظ على مستواك.";

    }

    else if (average >= 70) {

        title =
            "🔥 أنت في الطريق الصحيح!";

        message =
            "استمر في حل الاختبارات وستصل لمستوى أعلى.";

    }

    else if (average >= 50) {

        title =
            "💪 استمر ولا تستسلم!";

        message =
            "كل اختبار جديد فرصة لتحسين مستواك.";

    }

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
// حماية النصوص
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
// عرض الخطأ
// ==========================================

function showError() {

    const container =
        document.getElementById(
            "badgesContainer"
        );


    if (container) {

        container.innerHTML = `

            <div class="achievement-error">

                ❌ حدث خطأ أثناء تحميل إنجازاتك

                <br><br>

                حاول تحديث الصفحة مرة أخرى.

            </div>

        `;

    }

}
