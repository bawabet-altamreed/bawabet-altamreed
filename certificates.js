// ==========================================
// بوابة التمريض
// نظام الشهادات
// ==========================================


// ==========================================
// بيانات الطالب
// ==========================================

const studentCode =
    localStorage.getItem("studentCode");


// ==========================================
// التحقق من تسجيل الدخول
// ==========================================

if (!studentCode) {

    window.location.replace(
        "login.html"
    );

}


// ==========================================
// عناصر الصفحة
// ==========================================

const loading =
    document.getElementById(
        "loading"
    );


const certificatesContainer =
    document.getElementById(
        "certificates"
    );


// ==========================================
// تحميل الشهادات
// ==========================================

function loadCertificates() {


    db.collection("results")

        .where(
            "studentCode",
            "==",
            studentCode
        )

        .get()


        .then(function(snapshot) {


            // ==================================
            // إخفاء التحميل
            // ==================================

            loading.style.display =
                "none";


            certificatesContainer.innerHTML =
                "";


            // ==================================
            // مصفوفة الشهادات
            // ==================================

            const certificates = [];


            // ==================================
            // قراءة النتائج
            // ==================================

            snapshot.forEach(
                function(doc) {


                    const data =
                        doc.data();


                    const percentage =
                        Number(
                            data.percentage ||
                            0
                        );


                    // ==============================
                    // شرط الشهادة
                    // ==============================

                    if (
                        percentage >= 90
                    ) {


                        certificates.push({

                            id:
                                doc.id,

                            subject:
                                data.subject ||
                                "المادة",

                            chapter:
                                data.chapter ||
                                "Chapter",

                            score:
                                Number(
                                    data.score ||
                                    0
                                ),

                            total:
                                Number(
                                    data.total ||
                                    0
                                ),

                            percentage:
                                percentage,

                            date:
                                data.date ||
                                null

                        });


                    }

                }
            );


            // ==================================
            // لا توجد شهادات
            // ==================================

            if (
                certificates.length === 0
            ) {


                certificatesContainer.innerHTML = `

                    <div style="
                        text-align:center;
                        padding:30px 10px;
                    ">

                        <h2>
                            📭 لا توجد شهادات حتى الآن
                        </h2>

                        <p>
                            احصل على 90% أو أكثر
                            في اختبار أي Chapter
                            للحصول على شهادة.
                        </p>

                    </div>

                `;


                return;

            }


            // ==================================
            // ترتيب الشهادات
            // ==================================

            certificates.sort(
                function(a,b) {

                    return (
                        b.percentage -
                        a.percentage
                    );

                }
            );


            // ==================================
            // عرض الشهادات
            // ==================================

            certificates.forEach(
                function(cert) {


                    let dateText =
                        "غير محدد";


                    // ==================================
                    // تحويل تاريخ Firestore
                    // ==================================

                    if (
                        cert.date &&
                        cert.date.toDate
                    ) {

                        dateText =
                            cert.date
                                .toDate()
                                .toLocaleDateString(
                                    "ar-EG"
                                );

                    }


                    // ==================================
                    // إنشاء الكارت
                    // ==================================

                    const card =
                        document.createElement(
                            "div"
                        );


                    card.style.cssText = `

                        background:#f3f7fa;

                        padding:20px;

                        margin:15px 0;

                        border-radius:12px;

                        border-right:
                            5px solid #2196f3;

                    `;


                    // ==================================
                    // محتوى الكارت
                    // ==================================

                    card.innerHTML = `

                        <h2>
                            🏆
                            ${cert.subject}
                        </h2>

                        <h3>
                            ${cert.chapter}
                        </h3>

                        <p>
                            الدرجة:
                            ${cert.score}
                            /
                            ${cert.total}
                        </p>

                        <p>
                            النسبة:
                            <strong>
                                ${cert.percentage}%
                            </strong>
                        </p>

                        <p>
                            تاريخ الحصول:
                            ${dateText}
                        </p>

                        <button
                            class="certificate-btn"
                            data-id="${cert.id}"
                        >
                            🏆 عرض الشهادة
                        </button>

                    `;


                    // ==================================
                    // زر عرض الشهادة
                    // ==================================

                    const button =
                        card.querySelector(
                            ".certificate-btn"
                        );


                    button.addEventListener(
                        "click",
                        function() {

                            openCertificate(
                                cert.id
                            );

                        }
                    );


                    // ==================================
                    // إضافة الكارت
                    // ==================================

                    certificatesContainer
                        .appendChild(card);


                }
            );


        })


        // ======================================
        // خطأ التحميل
        // ======================================

        .catch(function(error) {


            console.error(
                "Certificates Error:",
                error
            );


            loading.style.display =
                "none";


            certificatesContainer.innerHTML = `

                <div style="
                    text-align:center;
                    padding:30px;
                ">

                    <h2>
                        ❌ حدث خطأ
                    </h2>

                    <p>
                        تعذر تحميل الشهادات.
                    </p>

                </div>

            `;


        });

}


// ==========================================
// فتح الشهادة
// ==========================================

function openCertificate(
    resultId
) {


    window.location.href =
        "certificate.html?id=" +
        encodeURIComponent(
            resultId
        );

}


// ==========================================
// تشغيل النظام
// ==========================================

loadCertificates();
