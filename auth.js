// ===============================
// بوابة التمريض
// حماية صفحات الطلاب
// ===============================

const studentCode = localStorage.getItem("studentCode");

// ===============================
// التحقق من تسجيل الدخول
// ===============================

if (!studentCode) {

    window.location.href = "login.html";

}


// ===============================
// التحقق من الاشتراك
// ===============================

if (studentCode) {

    db.collection("students")
        .doc(studentCode)
        .get()

        .then(function(doc) {

            if (!doc.exists) {

                localStorage.clear();

                window.location.href = "login.html";

                return;

            }

            const student = doc.data();

            // الاشتراك غير مفعل
            if (student.active !== true) {

                alert("❌ هذا الاشتراك غير مفعل");

                localStorage.clear();

                window.location.href = "login.html";

                return;

            }

            // ===============================
            // التحقق من تاريخ انتهاء الاشتراك
            // ===============================

            if (student.expiresAt) {

                let expireDate;

                // لو التاريخ Timestamp
                if (student.expiresAt.toDate) {

                    expireDate = student.expiresAt.toDate();

                }

                // لو التاريخ نص
                else {

                    expireDate = new Date(student.expiresAt);

                }

                const now = new Date();

                if (now >= expireDate) {

                    alert("❌ انتهى اشتراكك.\nيرجى تجديد الاشتراك.");

                    localStorage.clear();

                    window.location.href = "login.html";

                    return;

                }

            }

        })

        .catch(function(error) {

            console.log("Auth Error:", error);

            alert("❌ حدث خطأ في التحقق من الاشتراك");

            window.location.href = "login.html";

        });

}
