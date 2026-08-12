// =====================================================
// 🩺 بوابة التمريض
// 🎮 GAMING ACHIEVEMENTS SYSTEM
// =====================================================


// =====================================================
// STUDENT CODE
// =====================================================

const achievementStudentCode =
    localStorage.getItem("studentCode");


// =====================================================
// DATA
// =====================================================

let currentStudent = null;

let allResults = [];

let achievements = [];

let leaderboardData = [];


// =====================================================
// LOGIN CHECK
// =====================================================

if (!achievementStudentCode) {

    window.location.replace("login.html");

} else {

    loadAchievements();

}


// =====================================================
// LOAD EVERYTHING
// =====================================================

async function loadAchievements() {

    try {

        if (
            typeof db === "undefined" ||
            !db
        ) {

            throw new Error(
                "Firebase Firestore غير جاهز"
            );

        }


        await loadStudentData();

        await loadStudentResults();

        calculateAchievements();

        await calculateLeaderboard();

        renderPage();

    }

    catch (error) {

        console.error(
            "❌ Achievements Error:",
            error
        );

        showError(
            error.message
        );

    }

}


// =====================================================
// STUDENT DATA
// =====================================================

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
            "بيانات الطالب غير موجودة"
        );

    }


    currentStudent =
        studentDoc.data();

}


// =====================================================
// STUDENT RESULTS
// =====================================================

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


// =====================================================
// CALCULATE ACHIEVEMENTS
// =====================================================

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
                    function (
                        sum,
                        value
                    ) {

                        return sum + value;

                    },
                    0
                ) / totalTests

            )

            : 0;


    const excellentTests =
        percentages.filter(
            value => value >= 85
        ).length;


    const perfectTests =
        percentages.filter(
            value => value === 100
        ).length;


    const passedTests =
        percentages.filter(
            value => value >= 50
        ).length;


    const chapters =
        getChapters();


    // =================================================
    // 🎯 FIRST TEST
    // =================================================

    if (totalTests >= 1) {

        addAchievement(
            "🎯",
            "أول خطوة",
            "أكملت أول اختبار لك داخل بوابة التمريض.",
            "unlocked",
            "bronze"
        );

    }


    // =================================================
    // 🔥 3 TESTS
    // =================================================

    if (totalTests >= 3) {

        addAchievement(
            "🔥",
            "بداية قوية",
            "أكملت 3 اختبارات وبدأت طريق التفوق.",
            "unlocked",
            "bronze"
        );

    }


    // =================================================
    // 📚 5 TESTS
    // =================================================

    if (totalTests >= 5) {

        addAchievement(
            "📚",
            "محب المعرفة",
            "أكملت 5 اختبارات داخل المنصة.",
            "unlocked",
            "silver"
        );

    }


    // =================================================
    // 🚀 10 TESTS
    // =================================================

    if (totalTests >= 10) {

        addAchievement(
            "🚀",
            "طالب نشيط",
            "أكملت 10 اختبارات.",
            "unlocked",
            "silver"
        );

    }


    // =================================================
    // 👑 20 TESTS
    // =================================================

    if (totalTests >= 20) {

        addAchievement(
            "👑",
            "أسطورة الاختبارات",
            "أكملت 20 اختبارًا داخل المنصة.",
            "unlocked",
            "gold"
        );

    }


    // =================================================
    // ✅ FIRST PASS
    // =================================================

    if (passedTests >= 1) {

        addAchievement(
            "✅",
            "أول نجاح",
            "اجتزت أول اختبار لك بنجاح.",
            "unlocked",
            "bronze"
        );

    }


    // =================================================
    // 🌟 EXCELLENT
    // =================================================

    if (excellentTests >= 1) {

        addAchievement(
            "🌟",
            "ممتاز",
            "حصلت على 85% أو أكثر في أحد الاختبارات.",
            "unlocked",
            "silver"
        );

    }


    // =================================================
    // 🏅 5 EXCELLENT
    // =================================================

    if (excellentTests >= 5) {

        addAchievement(
            "🏅",
            "متفوق",
            "حصلت على 85% أو أكثر في 5 اختبارات.",
            "unlocked",
            "gold"
        );

    }


    // =================================================
    // 💯 PERFECT
    // =================================================

    if (perfectTests >= 1) {

        addAchievement(
            "💯",
            "الدرجة الكاملة",
            "حصلت على 100% في أحد الاختبارات.",
            "unlocked",
            "gold"
        );

    }


    // =================================================
    // 📈 AVERAGE 70
    // =================================================

    if (average >= 70) {

        addAchievement(
            "📈",
            "في الطريق الصحيح",
            "وصل متوسط درجاتك إلى 70% أو أكثر.",
            "unlocked",
            "silver"
        );

    }


    // =================================================
    // 🏆 AVERAGE 85
    // =================================================

    if (average >= 85) {

        addAchievement(
            "🏆",
            "المتفوق",
            "وصل متوسط درجاتك إلى 85% أو أكثر.",
            "unlocked",
            "gold"
        );

    }


    // =================================================
    // 📖 3 CHAPTERS
    // =================================================

    if (chapters.size >= 3) {

        addAchievement(
            "📖",
            "مستكشف المنهج",
            "اختبرت نفسك في 3 Chapters مختلفة.",
            "unlocked",
            "silver"
        );

    }


    // =================================================
    // 🧠 5 CHAPTERS
    // =================================================

    if (chapters.size >= 5) {

        addAchievement(
            "🧠",
            "عاشق التمريض",
            "اختبرت نفسك في 5 Chapters مختلفة.",
            "unlocked",
            "gold"
        );

    }


    // =================================================
    // LOCKED
    // =================================================

    addLockedAchievements(
        totalTests,
        average,
        perfectTests,
        chapters.size
    );

}


// =====================================================
// ADD ACHIEVEMENT
// =====================================================

function addAchievement(
    icon,
    title,
    description,
    type,
    tier
) {

    achievements.push({

        icon,

        title,

        description,

        type,

        tier

    });

}


// =====================================================
// LOCKED ACHIEVEMENTS
// =====================================================

function addLockedAchievements(
    totalTests,
    average,
    perfectTests,
    chapters
) {


    if (totalTests < 3) {

        addAchievement(
            "🔥",
            "بداية قوية",
            "أكمل 3 اختبارات لفتح هذا الإنجاز.",
            "locked",
            "bronze"
        );

    }


    if (totalTests < 5) {

        addAchievement(
            "📚",
            "محب المعرفة",
            "أكمل 5 اختبارات لفتح هذا الإنجاز.",
            "locked",
            "silver"
        );

    }


    if (totalTests < 10) {

        addAchievement(
            "🚀",
            "طالب نشيط",
            "أكمل 10 اختبارات لفتح هذا الإنجاز.",
            "locked",
            "silver"
        );

    }


    if (totalTests < 20) {

        addAchievement(
            "👑",
            "أسطورة الاختبارات",
            "أكمل 20 اختبارًا لفتح هذا الإنجاز.",
            "locked",
            "gold"
        );

    }


    if (perfectTests < 1) {

        addAchievement(
            "💯",
            "الدرجة الكاملة",
            "احصل على 100% في أحد الاختبارات.",
            "locked",
            "gold"
        );

    }


    if (average < 85) {

        addAchievement(
            "🏆",
            "المتفوق",
            "ارفع متوسط درجاتك إلى 85% أو أكثر.",
            "locked",
            "gold"
        );

    }


    if (chapters < 5) {

        addAchievement(
            "🧠",
            "عاشق التمريض",
            "اختبر نفسك في 5 Chapters مختلفة.",
            "locked",
            "gold"
        );

    }

}


// =====================================================
// XP SYSTEM
// =====================================================

function calculateXP() {

    const totalTests =
        allResults.length;


    const percentages =
        allResults.map(
            getPercentage
        );


    let xp = 0;


    // -----------------------------------------------
    // XP من الاختبارات
    // -----------------------------------------------

    xp +=
        totalTests * 20;


    // -----------------------------------------------
    // XP من الدرجات
    // -----------------------------------------------

    percentages.forEach(
        function (percentage) {

            xp +=
                Math.round(
                    percentage / 2
                );

        }
    );


    // -----------------------------------------------
    // XP من الإنجازات
    // -----------------------------------------------

    const unlocked =
        achievements.filter(
            achievement =>
                achievement.type ===
                "unlocked"
        ).length;


    xp +=
        unlocked * 50;


    return xp;

}


// =====================================================
// LEVEL SYSTEM
// =====================================================

function calculateLevel(xp) {

    const level =
        Math.floor(
            xp / 100
        ) + 1;


    const currentXP =
        xp % 100;


    const nextXP =
        100;


    return {

        level,

        currentXP,

        nextXP

    };

}


// =====================================================
// TIER SYSTEM
// =====================================================

function calculateTier(xp) {

    if (xp >= 1000) {

        return {
            name: "GOLD",
            icon: "🥇",
            className: "gold"
        };

    }


    if (xp >= 500) {

        return {
            name: "SILVER",
            icon: "🥈",
            className: "silver"
        };

    }


    return {
        name: "BRONZE",
        icon: "🥉",
        className: "bronze"
    };

}


// =====================================================
// LEADERBOARD
// =====================================================

async function calculateLeaderboard() {

    leaderboardData = [];


    const studentsSnapshot =
        await db
            .collection("students")
            .get();


    const resultsSnapshot =
        await db
            .collection("results")
            .get();


    const studentMap = {};


    studentsSnapshot.forEach(
        function (doc) {

            const data =
                doc.data();


            studentMap[doc.id] = {

                code: doc.id,

                name:
                    data.name ||
                    "طالب",

                grade:
                    data.grade ||
                    "-",

                tests: 0,

                totalScore: 0,

                average: 0

            };

        }
    );


    resultsSnapshot.forEach(
        function (doc) {

            const result =
                doc.data();


            const code =
                result.studentCode;


            if (
                !studentMap[code]
            ) {

                studentMap[code] = {

                    code,

                    name: "طالب",

                    grade: "-",

                    tests: 0,

                    totalScore: 0,

                    average: 0

                };

            }


            const percentage =
                getPercentage(
                    result
                );


            studentMap[code].tests++;

            studentMap[code].totalScore +=
                percentage;

        }
    );


    Object.values(
        studentMap
    ).forEach(
        function (student) {

            if (
                student.tests > 0
            ) {

                student.average =
                    Math.round(
                        student.totalScore /
                        student.tests
                    );

            }

        }
    );


    leaderboardData =
        Object.values(
            studentMap
        )
        .filter(
            student =>
                student.tests > 0
        )
        .sort(
            function (a, b) {

                if (
                    b.average !==
                    a.average
                ) {

                    return (
                        b.average -
                        a.average
                    );

                }


                return (
                    b.tests -
                    a.tests
                );

            }
        );


}


// =====================================================
// GET CHAPTERS
// =====================================================

function getChapters() {

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


    return chapters;

}


// =====================================================
// RENDER PAGE
// =====================================================

function renderPage() {

    const percentages =
        allResults.map(
            getPercentage
        );


    const totalTests =
        allResults.length;


    const average =
        totalTests > 0

            ? Math.round(

                percentages.reduce(
                    (
                        sum,
                        value
                    ) =>
                        sum + value,
                    0
                ) / totalTests

            )

            : 0;


    const chapters =
        getChapters();


    // =================================================
    // XP
    // =================================================

    const xp =
        calculateXP();


    const level =
        calculateLevel(
            xp
        );


    const tier =
        calculateTier(
            xp
        );


    // =================================================
    // STUDENT
    // =================================================

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
        "studentLevel",
        level.level
    );


    setText(
        "currentXP",
        level.currentXP
    );


    setText(
        "nextXP",
        level.nextXP
    );


    setText(
        "xpRemaining",

        (
            level.nextXP -
            level.currentXP
        ) +
        " XP للمستوى التالي"

    );


    // =================================================
    // TIER
    // =================================================

    const rankBadge =
        document.getElementById(
            "rankBadge"
        );


    if (rankBadge) {

        rankBadge.className =
            "rank-badge " +
            tier.className;


        rankBadge.textContent =
            tier.icon +
            " " +
            tier.name;

    }


    // =================================================
    // XP BAR
    // =================================================

    const xpFill =
        document.getElementById(
            "xpFill"
        );


    if (xpFill) {

        xpFill.style.width =
            level.currentXP +
            "%";

    }


    // =================================================
    // STATS
    // =================================================

    setText(
        "testsCount",
        totalTests
    );


    setText(
        "averageScore",
        average + "%"
    );


    const unlockedCount =
        achievements.filter(
            achievement =>
                achievement.type ===
                "unlocked"
        ).length;


    setText(
        "badgesCount",
        unlockedCount
    );


    setText(
        "chaptersCount",
        chapters.size
    );


    setText(
        "achievementUnlockedCount",
        unlockedCount
    );


    setText(
        "achievementTotalCount",
        achievements.length
    );


    // =================================================
    // PROGRESS
    // =================================================

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


    setText(
        "progressText",

        totalTests +
        " / 10 اختبارات"

    );


    const progressFill =
        document.getElementById(
            "progressFill"
        );


    if (progressFill) {

        progressFill.style.width =
            progress + "%";

    }


    // =================================================
    // LEVEL CARDS
    // =================================================

    updateLevelCards(
        tier
    );


    // =================================================
    // LEADERBOARD RANK
    // =================================================

    const rank =
        leaderboardData.findIndex(
            student =>
                student.code ===
                achievementStudentCode
        ) + 1;


    setText(
        "leaderboardRank",

        rank > 0
            ? "#" + rank
            : "-"
    );


    // =================================================
    // ACHIEVEMENTS
    // =================================================

    renderAchievements();


    // =================================================
    // MOTIVATION
    // =================================================

    renderMotivation(
        totalTests,
        average,
        xp,
        level.level
    );


    // =================================================
    // WELCOME
    // =================================================

    setText(

        "welcomeAchievement",

        "👋 أهلاً بك " +

        (
            currentStudent.name ||
            "طالبنا العزيز"
        ) +

        " — استمر في التقدم واصنع إنجازاتك!"

    );

}


// =====================================================
// LEVEL CARDS
// =====================================================

function updateLevelCards(tier) {

    const bronze =
        document.getElementById(
            "bronzeLevel"
        );


    const silver =
        document.getElementById(
            "silverLevel"
        );


    const gold =
        document.getElementById(
            "goldLevel"
        );


    if (bronze) {

        bronze.classList.remove(
            "active"
        );

    }


    if (silver) {

        silver.classList.remove(
            "active"
        );

    }


    if (gold) {

        gold.classList.remove(
            "active"
        );

    }


    if (
        tier.className ===
        "bronze"
    ) {

        bronze?.classList.add(
            "active"
        );

    }


    if (
        tier.className ===
        "silver"
    ) {

        bronze?.classList.add(
            "active"
        );

        silver?.classList.add(
            "active"
        );

    }


    if (
        tier.className ===
        "gold"
    ) {

        bronze?.classList.add(
            "active"
        );

        silver?.classList.add(
            "active"
        );

        gold?.classList.add(
            "active"
        );

    }

}


// =====================================================
// RENDER ACHIEVEMENTS
// =====================================================

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

                <br><br>

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
                    ${achievement.tier || ""}
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


// =====================================================
// MOTIVATION
// =====================================================

function renderMotivation(
    totalTests,
    average,
    xp,
    level
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
            "ابدأ أول اختبار واحصل على أول XP وأول إنجاز لك.";

    }

    else if (average >= 90) {

        title =
            "👑 أداء أسطوري!";

        message =
            "مستواك استثنائي! استمر في المنافسة للوصول إلى قمة الـ Leaderboard.";

    }

    else if (average >= 85) {

        title =
            "🏆 أنت من النخبة!";

        message =
            "أداؤك رائع جدًا. حافظ على مستواك واجمع المزيد من XP.";

    }

    else if (average >= 70) {

        title =
            "🔥 أنت في الطريق الصحيح!";

        message =
            "استمر في حل الاختبارات وستقترب من المستوى التالي.";

    }

    else {

        title =
            "💪 كل اختبار فرصة جديدة!";

        message =
            "راجع الـ Chapters وحاول رفع متوسطك في الاختبار القادم.";

    }


    container.innerHTML = `

        <div>

            <h2>
                ${title}
            </h2>

            <p>
                ${message}
            </p>

            <small>
                ⚡ لديك الآن ${xp} XP — المستوى ${level}
            </small>

        </div>

    `;

}


// =====================================================
// GET PERCENTAGE
// =====================================================

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


// =====================================================
// DATE
// =====================================================

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


// =====================================================
// SET TEXT
// =====================================================

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


// =====================================================
// ESCAPE HTML
// =====================================================

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


// =====================================================
// ERROR
// =====================================================

function showError(
    errorMessage
) {

    const container =
        document.getElementById(
            "badgesContainer"
        );


    if (!container) {

        return;

    }


    container.innerHTML = `

        <div class="achievement-error">

            ❌ حدث خطأ أثناء تحميل بيانات الإنجازات

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
