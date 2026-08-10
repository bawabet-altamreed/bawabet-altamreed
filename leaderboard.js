const leaderboardDiv = document.getElementById("leaderboard");


// ==========================================
// تحميل لوحة المتصدرين حسب الصف
// ==========================================

function loadLeaderboard(grade) {

    leaderboardDiv.innerHTML = "⏳ جاري تحميل البيانات...";


    db.collection("results")
        .where("grade", "==", grade)
        .get()

        .then(function(snapshot) {

            if (snapshot.empty) {

                leaderboardDiv.innerHTML =
                    "❌ لا توجد نتائج لهذا الصف حتى الآن";

                return;
            }


            let students = {};


            // ==========================================
            // تجميع الطلاب
            // ==========================================

            snapshot.forEach(function(doc) {

                let data = doc.data();


                // نستخدم studentCode لو موجود
                // وإلا نستخدم uid
                // وإلا email كحل احتياطي

                let studentId =
                    data.studentCode ||
                    data.uid ||
                    data.email;


                if (!studentId) {
                    return;
                }


                // إنشاء الطالب

                if (!students[studentId]) {

                    students[studentId] = {

                        id: studentId,

                        name: data.name || "طالب",

                        grade: data.grade || grade,

                        chapters: {}

                    };

                }


                // ==========================================
                // أفضل نتيجة لكل Chapter
                // ==========================================

                let chapter =
                    data.chapter || "اختبار";


                let percentage =
                    Number(data.percentage) || 0;


                if (

                    !students[studentId].chapters[chapter] ||

                    percentage >
                    students[studentId].chapters[chapter]

                ) {

                    students[studentId].chapters[chapter] =
                        percentage;

                }

            });


            // ==========================================
            // حساب المتوسط النهائي
            // ==========================================

            let leaderboard = [];


            Object.keys(students).forEach(function(studentId) {

                let student =
                    students[studentId];


                let total = 0;

                let count = 0;


                Object.keys(student.chapters).forEach(function(chapter) {

                    total +=
                        student.chapters[chapter];

                    count++;

                });


                if (count > 0) {

                    student.average =
                        (total / count).toFixed(2);

                    student.count =
                        count;

                    leaderboard.push(student);

                }

            });


            // ==========================================
            // ترتيب الطلاب
            // ==========================================

            leaderboard.sort(function(a, b) {

                return Number(b.average) -
                       Number(a.average);

            });


            // ==========================================
            // عرض النتائج
            // ==========================================

            if (leaderboard.length === 0) {

                leaderboardDiv.innerHTML =
                    "❌ لا توجد نتائج صالحة للعرض";

                return;

            }


            let html = "";


            leaderboard.forEach(function(student, index) {

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
                        ${medal} المركز ${index + 1}
                    </h2>

                    <h3>
                        👨‍🎓 ${student.name}
                    </h3>

                    <p>
                        📚 ${student.grade}
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

            });


            leaderboardDiv.innerHTML = html;

        })


        .catch(function(error) {

            console.error(
                "Leaderboard Error:",
                error
            );


            leaderboardDiv.innerHTML = `

                <div class="card">

                    ❌ حدث خطأ في تحميل لوحة المتصدرين

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
