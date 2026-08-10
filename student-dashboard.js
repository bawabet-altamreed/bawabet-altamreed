// ==========================================
// لوحة الطالب
// ==========================================

const studentCode =
    localStorage.getItem("studentCode");


// ==========================================
// التحقق من تسجيل الدخول
// ==========================================

if (!studentCode) {

    window.location.href = "login.html";

}


// ==========================================
// تحميل بيانات الطالب
// ==========================================

function loadStudentDashboard() {

    db.collection("students")
        .doc(studentCode)
        .get()

        .then(function(doc) {

            if (!doc.exists) {

                document.getElementById(
                    "studentInfo"
                ).innerHTML =
                    "❌ بيانات الطالب غير موجودة";

                return;

            }


            const student =
                doc.data();


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
            // تحميل النتائج
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

            if (!snapshot) {
                return;
            }


            if (snapshot.empty) {

                document.getElementById(
                    "results"
                ).innerHTML =
                    "❌ لم يتم عمل أي اختبارات حتى الآن";

                document.getElementById(
                    "average"
                ).innerHTML =
                    "0%";

                return;

            }


            // ==================================
            // أفضل نتيجة لكل Chapter
            // ==================================

            let bestResults = {};


            snapshot.forEach(function(doc) {

                const data =
                    doc.data();


                const chapter =
                    data.chapter || doc.id;


                if (
                    !bestResults[chapter] ||
                    Number(data.percentage) >
                    Number(
                        bestResults[chapter].percentage
                    )
                ) {

                    bestResults[chapter] =
                        data;

                }

            });


            // ==================================
            // حساب المتوسط النهائي
            // ==================================

            let totalPercentage = 0;

            let count = 0;

            let html = "";


            Object.values(bestResults)
                .forEach(function(data) {

                    const percentage =
                        Number(
                            data.percentage
                        ) || 0;


                    totalPercentage +=
                        percentage;

                    count++;


                    html += `

                        <div class="card">

                            <h3>
                                📘 ${data.chapter || "اختبار"}
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

                });


            // ==================================
            // عرض النتائج
            // ==================================

            document.getElementById(
                "results"
            ).innerHTML =
                html;


            // ==================================
            // المتوسط النهائي
            // ==================================

            const average =
                (
                    totalPercentage /
                    count
                ).toFixed(2);


            document.getElementById(
                "average"
            ).innerHTML = `

                <h1>
                    ⭐ ${average}%
                </h1>

                <p>
                    عدد الاختبارات:
                    ${count}
                </p>

            `;

        })


        .catch(function(error) {

            console.error(
                "Student Dashboard Error:",
                error
            );


            document.getElementById(
                "studentInfo"
            ).innerHTML =
                "❌ حدث خطأ أثناء تحميل البيانات";

        });

}


// ==========================================
// تشغيل لوحة الطالب
// ==========================================

loadStudentDashboard();
