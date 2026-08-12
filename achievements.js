// ==========================================
// بوابة التمريض
// Achievements System
// نظام الإنجازات
// ==========================================


// ==========================================
// بيانات الطالب
// ==========================================

const achievementStudentCode =
    localStorage.getItem("studentCode");


let achievementStudent = null;

let achievementResults = [];

let achievementLeaderboard = [];


// ==========================================
// فتح Achievements
// ==========================================

window.openAchievements =
    function () {

        const modal =
            document.getElementById(
                "achievementsModal"
            );


        if (!achievementStudentCode) {

            alert(
                "❌ يجب تسجيل الدخول أولاً"
            );

            window.location.href =
                "login.html";

            return;

        }


        if (modal) {

            modal.classList.remove(
                "hidden"
            );

        }


        loadAchievements();

    };


// ==========================================
// إغلاق Achievements
// ==========================================

window.closeAchievements =
    function () {

        const modal =
            document.getElementById(
                "achievementsModal"
            );


        if (modal) {

            modal.classList.add(
                "hidden"
            );

        }

    };


// ==========================================
// تحميل البيانات
// ==========================================

function loadAchievements() {

    Promise.all([

        loadAchievementStudent(),

        loadAchievementResults(),

        loadAchievementLeaderboard()

    ])

    .then(function () {

        calculateAchievements();

    })

    .catch(function (error) {

        console.error(
            "Achievements Error:",
            error
        );


        const list =
            document.getElementById(
                "achievementsList"
            );


        if (list) {

            list.innerHTML = `

                <div class="notification-empty">

                    ❌ تعذر تحميل الإنجازات

                </div>

            `;

        }

    });

}


// ==========================================
// بيانات الطالب
// ==========================================

function loadAchievementStudent() {

    return db.collection("students")

        .doc(achievementStudentCode)

        .get()

        .then(function (doc) {

            if (!doc.exists) {

                throw new Error(
                    "بيانات الطالب غير موجودة"
                );

            }


            achievementStudent =
                doc.data();

        });

}


// ==========================================
// نتائج الطالب
// ==========================================

function loadAchievementResults() {

    return db.collection("results")

        .where(
            "studentCode",
            "==",
            achievementStudentCode
        )

        .get()

        .then(function (snapshot) {

            achievementResults = [];


            snapshot.forEach(
                function (doc) {

                    achievementResults.push({

                        id:
                            doc.id,

                        ...doc.data()

                    });

                }
            );

        });

}


// ==========================================
// Leaderboard
// ==========================================

function loadAchievementLeaderboard() {

    return db.collection("leaderboard")

        .get()

        .then(function (snapshot) {

            achievementLeaderboard = [];


            snapshot.forEach(
                function (doc) {

                    achievementLeaderboard.push({

                        id:
                            doc.id,

                        ...doc.data()

                    });

                }
            );

        });

}


// ==========================================
// حساب الإنجازات
// ==========================================

function calculateAchievements() {

    const results =
        achievementResults;


    const totalTests =
        results.length;


    const percentages =
        results.map(
            function (result) {

                return getAchievementPercentage(
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


    const perfectTests =
        percentages.filter(
            function (value) {

                return value >= 100;

            }
        ).length;


    const passedTests =
        percentages.filter(
            function (value) {

                return value >= 50;

            }
        ).length;


    // ======================================
    // Chapters
    // ======================================

    const chapters =
        new Set();


    results.forEach(
        function (result) {

            if (result.chapter) {

                const key =
                    (
                        result.subject ||
                        ""
                    )
                    +
                    "|"
                    +
                    result.chapter;

                chapters.add(key);

            }

        }
    );


    const chapterCount =
        chapters.size;


    // ======================================
    // أعلى نتيجة
    // ======================================

    const highestScore =
        percentages.length

            ? Math.max(
                ...percentages
            )

            : 0;


    // ======================================
    // الترتيب
    // ======================================

    const ranking =
        getStudentRanking();


    // ======================================
    // إنجازات الطالب
    // ======================================

    const achievements = [];


    // 1
    achievements.push({

        id:
            "first_test",

        icon:
            "🎯",

        title:
            "أول خطوة",

        description:
            "عملت أول اختبار على المنصة",

        unlocked:
            totalTests >= 1

    });


    // 2
    achievements.push({

        id:
            "five_tests",

        icon:
            "📝",

        title:
            "محب الاختبارات",

        description:
            "أكملت 5 اختبارات",

        unlocked:
            totalTests >= 5

    });


    // 3
    achievements.push({

        id:
            "ten_tests",

        icon:
            "🔥",

        title:
            "مدمن الاختبارات",

        description:
            "أكملت 10 اختبارات",

        unlocked:
            totalTests >= 10

    });


    // 4
    achievements.push({

        id:
            "perfect",

        icon:
            "💯",

        title:
            "الدرجة الكاملة",

        description:
            "حصلت على 100% في اختبار",

        unlocked:
            perfectTests >= 1

    });


    // 5
    achievements.push({

        id:
            "excellent",

        icon:
            "🧠",

        title:
            "الطالب الممتاز",

        description:
            "متوسطك 85% أو أكثر",

        unlocked:
            average >= 85

    });


    // 6
    achievements.push({

        id:
            "strong_start",

        icon:
            "🚀",

        title:
            "بداية قوية",

        description:
            "حصلت على 80% أو أكثر في أول اختبار",

        unlocked:
            totalTests >= 1 &&
            getAchievementPercentage(
                results[0]
            ) >= 80

    });


    // 7
    achievements.push({

        id:
            "explorer",

        icon:
            "📚",

        title:
            "مستكشف المحتوى",

        description:
            "أنهيت 3 Chapters مختلفة",

        unlocked:
            chapterCount >= 3

    });


    // 8
    achievements.push({

        id:
            "encyclopedia",

        icon:
            "📖",

        title:
            "موسوعة التمريض",

        description:
            "أنهيت 5 Chapters مختلفة",

        unlocked:
            chapterCount >= 5

    });


    // 9
    achievements.push({

        id:
            "top10",

        icon:
            "🏆",

        title:
            "Top 10",

        description:
            "دخلت ضمن أول 10 طلاب",

        unlocked:
            ranking > 0 &&
            ranking <= 10

    });


    // 10
    achievements.push({

        id:
            "third",

        icon:
            "🥉",

        title:
            "المركز الثالث",

        description:
            "وصلت للمركز الثالث",

        unlocked:
            ranking === 3

    });


    // 11
    achievements.push({

        id:
            "second",

        icon:
            "🥈",

        title:
            "المركز الثاني",

        description:
            "وصلت للمركز الثاني",

        unlocked:
            ranking === 2

    });


    // 12
    achievements.push({

        id:
            "first",

        icon:
            "🥇",

        title:
            "ملك الـLeaderboard",

        description:
            "وصلت للمركز الأول",

        unlocked:
            ranking === 1

    });


    // 13
    achievements.push({

        id:
            "consistent",

        icon:
            "💪",

        title:
            "المثابر",

        description:
            "عملت 3 اختبارات في نفس اليوم",

        unlocked:
            hasThreeTestsSameDay()

    });


    // 14
    achievements.push({

        id:
            "no_fail",

        icon:
            "⚡",

        title:
            "بلا هزيمة",

        description:
            "نجحت في 5 اختبارات على الأقل",

        unlocked:
            passedTests >= 5

    });


    // ======================================
    // عرض
    // ======================================

    renderAchievementStats(
        totalTests,
        chapterCount,
        average,
        achievements
    );


    renderAchievementList(
        achievements
    );

}


// ==========================================
// ترتيب الطالب
// ==========================================

function getStudentRanking() {

    if (
        !achievementLeaderboard.length
    ) {

        return 0;

    }


    const rows =
        achievementLeaderboard
            .map(
                function (student) {

                    return {

                        id:
                            student.id,

                        code:
                            student.studentCode ||
                            student.code ||
                            student.id,

                        score:
                            Number(
                                student.average ??
                                student.score ??
                                0
                            )

                    };

                }
            );


    rows.sort(
        function (a, b) {

            return b.score - a.score;

        }
    );


    const index =
        rows.findIndex(
            function (student) {

                return (

                    student.code ===
                    achievementStudentCode

                    ||

                    student.id ===
                    achievementStudentCode

                );

            }
        );


    return index >= 0
        ? index + 1
        : 0;

}


// ==========================================
// 3 اختبارات في نفس اليوم
// ==========================================

function hasThreeTestsSameDay() {

    const dates = {};


    achievementResults.forEach(
        function (result) {

            const date =
                getAchievementDate(
                    result.createdAt
                );


            if (!date) {

                return;

            }


            const key =
                date.getFullYear()
                +
                "-"
                +
                date.getMonth()
                +
                "-"
                +
                date.getDate();


            dates[key] =
                (dates[key] || 0) + 1;

        }
    );


    return Object.values(dates)
        .some(
            function (count) {

                return count >= 3;

            }
        );

}


// ==========================================
// عرض الإحصائيات
// ==========================================

function renderAchievementStats(
    totalTests,
    chapterCount,
    average,
    achievements
) {

    const unlocked =
        achievements.filter(
            function (item) {

                return item.unlocked;

            }
        ).length;


    setAchievementText(
        "achievementCount",
        unlocked
    );


    setAchievementText(
        "achievementTests",
        totalTests
    );


    setAchievementText(
        "achievementChapters",
        chapterCount
    );


    setAchievementText(
        "achievementAverage",
        average + "%"
    );


    const name =
        achievementStudent &&
        achievementStudent.name

            ? achievementStudent.name

            : "طالبنا العزيز";


    setAchievementText(
        "achievementsStudentName",
        "👋 " + name
    );

}


// ==========================================
// عرض الإنجازات
// ==========================================

function renderAchievementList(
    achievements
) {

    const container =
        document.getElementById(
            "achievementsList"
        );


    if (!container) {

        return;

    }


    let html = "";


    achievements.forEach(
        function (achievement) {

            html += `

                <div class="
                    achievement-item
                    ${
                        achievement.unlocked
                            ? "unlocked"
                            : "locked"
                    }
                ">

                    <div class="achievement-icon">

                        ${
                            achievement.icon
                        }

                    </div>


                    <div class="achievement-info">

                        <h3>

                            ${
                                escapeAchievementHtml(
                                    achievement.title
                                )
                            }

                        </h3>


                        <p>

                            ${
                                escapeAchievementHtml(
                                    achievement.description
                                )
                            }

                        </p>


                        <div class="achievement-status">

                            ${
                                achievement.unlocked

                                    ? "🏆 تم فتح الإنجاز"

                                    : "🔒 لم يتم فتحه بعد"

                            }

                        </div>

                    </div>

                </div>

            `;

        }
    );


    container.innerHTML =
        html;

}


// ==========================================
// حساب النسبة
// ==========================================

function getAchievementPercentage(
    data
) {

    if (
        data.percentage !== undefined &&
        data.percentage !== null
    ) {

        let value =
            Number(
                data.percentage
            );


        if (
            value > 0 &&
            value <= 1
        ) {

            value *= 100;

        }


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
            ) *
            100
        );

    }


    return 0;

}


// ==========================================
// التاريخ
// ==========================================

function getAchievementDate(value) {

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


    return isNaN(
        date.getTime()
    )
        ? null
        : date;

}


// ==========================================
// تغيير النص
// ==========================================

function setAchievementText(
    id,
    value
) {

    const element =
        document.getElementById(id);


    if (element) {

        element.textContent =
            value;

    }

}


// ==========================================
// حماية النص
// ==========================================

function escapeAchievementHtml(
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
// إغلاق عند الضغط خارج النافذة
// ==========================================

document.addEventListener(
    "click",
    function (event) {

        const modal =
            document.getElementById(
                "achievementsModal"
            );


        const box =
            document.querySelector(
                ".achievements-box"
            );


        if (
            modal &&
            !modal.classList.contains(
                "hidden"
            ) &&
            event.target === modal
        ) {

            closeAchievements();

        }

    }
);
