// ==========================================
// بوابة التمريض - لوحة الطالب
// ==========================================

const studentCode = localStorage.getItem("studentCode");

const studentInfo = document.getElementById("studentInfo");
const resultsDiv = document.getElementById("results");
const averageDiv = document.getElementById("average");


// ==========================================
// التحقق من الكود
// ==========================================

if (!studentCode) {

    window.location.replace("login.html");

} else {

    loadDashboard();

}


// ==========================================
// تحميل لوحة الطالب
// ==========================================

async function loadDashboard() {

    try {

        // ==================================
        // التأكد من وجود Anonymous Auth
        // ==================================

        if (!firebase.auth().currentUser) {

            await firebase.auth().signInAnonymously();

        }


        // ==================================
        // جلب بيانات الطالب
        // ==================================

        const studentDoc = await db
            .collection("students")
            .doc(studentCode)
            .get();


        if (!studentDoc.exists) {

            throw new Error(
                "بيانات الطالب غير موجودة"
            );

        }


        const student = studentDoc.data();


        // ==================================
        // عرض بيانات الطالب
        // ==================================

        studentInfo.innerHTML = `

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
        // جلب نتائج الطالب
        // ==================================

        const resultsSnapshot = await db
            .collection("results")
            .where(
                "studentCode",
                "==",
                studentCode
            )
            .get();


        // ==================================
        // لا توجد نتائج
        // ==================================

        if (resultsSnapshot.empty) {

            resultsDiv.innerHTML =
                "❌ لم يتم عمل أي اختبارات حتى الآن";

            averageDiv.innerHTML =
                "<h1>⭐ 0%</h1>";

            return;

        }


        // ==================================
        // أفضل نتيجة لكل Chapter
        // ==================================

        const bestResults = {};


        resultsSnapshot.forEach(function(doc) {

            const data = doc.data();

            const chapter =
                data.chapter || doc.id;


            if (
                !bestResults[chapter] ||
                Number(data.percentage) >
                Number(
                    bestResults[chapter].percentage
                )
            ) {

                bestResults[chapter] = data;

            }

        });


        // ==================================
        // حساب المتوسط
        // ==================================

        let total = 0;

        let count = 0;

        let html = "";


        Object.values(bestResults)
            .forEach(function(data) {

                const percentage =
                    Number(data.percentage) || 0;


                total += percentage;

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

        resultsDiv.innerHTML = html;


        // ==================================
        // المتوسط النهائي
        // ==================================

        const average =
            (total / count).toFixed(2);


        averageDiv.innerHTML = `

            <h1>
                ⭐ ${average}%
            </h1>

            <p>
                عدد الاختبارات:
                ${count}
            </p>

        `;

    }


    catch (error) {

        console.error(
            "Dashboard Error:",
            error
        );


        studentInfo.innerHTML =
            "❌ حدث خطأ أثناء تحميل البيانات";


        resultsDiv.innerHTML =
            "❌ تعذر تحميل النتائج";


        averageDiv.innerHTML =
            "❌ تعذر حساب المتوسط";

    }

}
