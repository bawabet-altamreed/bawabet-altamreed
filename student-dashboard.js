// ==========================================
// بوابة التمريض
// لوحة الطالب
// ==========================================

const studentCode = localStorage.getItem("studentCode");


// ==========================================
// التحقق من تسجيل الدخول
// ==========================================

if (!studentCode) {

    window.location.replace("login.html");

}


// ==========================================
// تحميل لوحة الطالب
// ==========================================

function loadStudentDashboard() {

    db.collection("students")
        .doc(studentCode)
        .get()

        .then(function(studentDoc) {

            if (!studentDoc.exists) {

                throw new Error(
                    "بيانات الطالب غير موجودة"
                );

            }


            const student = studentDoc.data();


            // ==================================
            // بيانات الطالب
            // ==================================

            document.getElementById(
                "studentInfo"
            ).innerHTML = `

                <h3>
                    👨‍🎓 الاسم:
                    ${student.name || "غير محدد"}
                </h3>

                <p>
                    📚 الصف:
                    ${student.grade || "غير محدد"}
                </p>

                <p>
                    🔑 كود الاشتراك:
                    ${studentCode}
                </p>

            `;


            // ==================================
            // نتائج الطالب
            // ==================================

            return db.collection("results")
                .where(
                    "studentCode",
                    "==",
                    studentCode
                )
                .get();

        })

        .then(function(snapshot) {

            if (snapshot.empty) {

                document.getElementById(
                    "results"
                ).innerHTML =
                    "❌ لم يتم عمل أي اختبارات حتى الآن";

                document.getElementById(
                    "average"
                ).innerHTML = `
                    <h1>⭐ 0%</h1>
                    <p>عدد الاختبارات: 0</p>
                `;

                return;

            }


            // ==================================
            // أفضل نتيجة لكل Chapter
            // ==================================

            const chapters = {};


            snapshot.forEach(function(doc) {

                const data = doc.data();

                const chapter =
                    data.chapter || doc.id;


                if (
                    !chapters[chapter] ||
                    Number(data.percentage) >
                    Number(
                        chapters[chapter].percentage
                    )
                ) {

                    chapters[chapter] = data;

                }

            });


            // ==================================
            // حساب المتوسط النهائي
            // ==================================

            let totalPercentage = 0;

            let testCount = 0;

            let html = "";


            Object.keys(chapters).forEach(
                function(chapter) {

                    const data =
                        chapters[chapter];


                    const percentage =
                        Number(data.percentage) || 0;


                    totalPercentage +=
                        percentage;


                    testCount++;


                    html += `

                        <div class="card">

                            <h3>
                                📘 ${chapter}
                            </h3>

                            <p>
                                المادة:
                                ${data.subject || "-"}
                            </p>

                            <p>
                                الدرجة:
                                ${data.score || 0}/${data.total || 0}
                            </p>

                            <p>
                                ⭐ النسبة:
                                ${percentage}%
                            </p>

                        </div>

                    `;

                }
            );


            // ==================================
            // عرض النتائج
            // ==================================

            document.getElementById(
                "results"
            ).innerHTML = html;


            // ==================================
            // المتوسط النهائي
            // ==================================

            const average =
                (
                    totalPercentage /
                    testCount
                ).toFixed(2);


            document.getElementById(
                "average"
            ).innerHTML = `

                <h1>
                    ⭐ ${average}%
                </h1>

                <p>
                    عدد الاختبارات:
                    ${testCount}
                </p>

            `;

        })

        .catch(function(error) {

            console.error(
                "Student Dashboard:",
                error
            );

            document.getElementById(
                "studentInfo"
            ).innerHTML =
                "❌ حدث خطأ أثناء تحميل البيانات";

        });

}


// ==========================================
// تشغيل اللوحة
// ==========================================

loadStudentDashboard();
