const leaderboardDiv =
    document.getElementById("leaderboard");


// ==========================================
// تنظيف اسم الصف
// ==========================================

function cleanGrade(grade) {

    return String(grade || "")
        .replace(/\s+/g, " ")
        .trim();

}


// ==========================================
// تحميل لوحة المتصدرين حسب الصف
// ==========================================

function loadLeaderboard(grade) {

    leaderboardDiv.innerHTML =
        "⏳ جاري تحميل البيانات...";


    const selectedGrade =
        cleanGrade(grade);


    // ==========================================
    // قراءة جميع النتائج
    // ==========================================

    db.collection("results")
        .get()

        .then(function(snapshot) {

            if (snapshot.empty) {

                leaderboardDiv.innerHTML =
                    "❌ لا توجد نتائج حتى الآن";

                return;

            }


            let students = {};


            // ==========================================
            // قراءة النتائج
            // ==========================================

            snapshot.forEach(function(doc) {

                const data = doc.data();


                // توحيد الصف
                const resultGrade =
                    cleanGrade(data.grade);


                // تجاهل نتائج الصفوف الأخرى
                if (resultGrade !== selectedGrade) {
                    return;
                }


                // ======================================
                // تحديد الطالب
                // ======================================

                const studentId =
                    data.studentCode ||
                    data.uid ||
                    data.email;


                if (!studentId) {
                    return;
                }


                // ======================================
                // إنشاء الطالب
                // ======================================

                if (!students[studentId]) {

                    students[studentId] = {

                        id: studentId,

                        name:
                            data.name ||
                            "طالب",

                        grade:
                            resultGrade,

                        totalPercentage: 0,

                        count: 0

                    };

                }


                // ======================================
                // درجة الاختبار
                // ======================================

                const percentage =
                    Number(data.percentage) || 0;


                // ======================================
                // حساب كل محاولة
                // ======================================

                students[studentId]
                    .totalPercentage += percentage;


                students[studentId]
                    .count++;


            });


            // ==========================================
            // حساب المتوسط النهائي
            // ==========================================

            let leaderboard = [];


            Object.keys(students)
                .forEach(function(studentId) {

                    const student =
                        students[studentId];


                    if (student.count > 0) {

                        student.average =
                            (
                                student.totalPercentage /
                                student.count
                            ).toFixed(2);


                        leaderboard.push(
                            student
                        );

                    }

                });


            // ==========================================
            // لا توجد نتائج لهذا الصف
            // ==========================================

            if (leaderboard.length === 0) {

                leaderboardDiv.innerHTML =
                    "❌ لا توجد نتائج لهذا الصف حتى الآن";

                return;

            }


            // ==========================================
            // ترتيب الطلاب
            // ==========================================

            leaderboard.sort(
                function(a, b) {

                    return Number(b.average) -
                           Number(a.average);

                }
            );


            // ==========================================
            // عرض النتائج
            // ==========================================

            let html = "";


            leaderboard.forEach(
                function(student, index) {

                    let medal = "🏅";


                    if (index === 0) {

                        medal = "🥇";

                    }

                    else if (index === 1) {

                        medal = "🥈";

                    }

                    else if (index === 2) {

                        medal = "🥉";

                    }


                    html += `

                    <div class="card leaderboard-card">

                        <h2>
                            ${medal}
                            المركز ${index + 1}
                        </h2>

                        <h3>
                            👨‍🎓
                            ${student.name}
                        </h3>

                        <p>
                            📚
                            ${student.grade}
                        </p>

                        <div class="leader-score">

                            ⭐ المتوسط النهائي

                            <br>

                            <b>
                                ${student.average}%
                            </b>

                        </div>

                        <p>
                            📝 عدد الاختبارات:
                            ${student.count}
                        </p>

                    </div>

                    `;

                }
            );


            leaderboardDiv.innerHTML =
                html;

        })


        .catch(function(error) {

            console.error(
                "Leaderboard Error:",
                error
            );


            leaderboardDiv.innerHTML = `

                <div class="card">

                    ❌ حدث خطأ في تحميل
                    لوحة المتصدرين

                    <br><br>

                    <small>
                        ${error.message}
                    </small>

                </div>

            `;

        });

}


// ==========================================
// الصف الثاني افتراضيًا
// ==========================================

loadLeaderboard(
    "الصف الثاني الثانوي التمريض"
);
