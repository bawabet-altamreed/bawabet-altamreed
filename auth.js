// ===============================
// بوابة التمريض
// حماية صفحات الطلاب
// ===============================

(function () {

    const studentCode = localStorage.getItem("studentCode");

    // ===============================
    // التحقق من تسجيل الدخول
    // ===============================

    if (!studentCode) {

        window.location.href = "login.html";

        return;

    }


    // ===============================
    // التحقق من الاشتراك
    // ===============================

    db.collection("students")
        .doc(studentCode)
        .get()

        .then(function (doc) {

            if (!doc.exists) {

                localStorage.removeItem("studentCode");
                localStorage.removeItem("studentName");
                localStorage.removeItem("studentGrade");

                window.location.href = "login.html";

                return;

            }


            const student = doc.data();


            // ===============================
            // التحقق من التفعيل
            // ===============================

            if (student.active !== true) {

                alert("❌ هذا الاشتراك غير مفعل");

                localStorage.removeItem("studentCode");
                localStorage.removeItem("studentName");
                localStorage.removeItem("studentGrade");

                window.location.href = "login.html";

                return;

            }


            // ===============================
            // التحقق من تاريخ الانتهاء
            // ===============================

            if (student.expiresAt) {

                let expireDate;


                if (
                    student.expiresAt &&
                    typeof student.expiresAt.toDate === "function"
                ) {

                    expireDate = student.expiresAt.toDate();

                } else {

                    expireDate = new Date(student.expiresAt);

                }


                if (
                    isNaN(expireDate.getTime())
                ) {

                    console.log(
                        "Invalid expiresAt:",
                        student.expiresAt
                    );

                    return;

                }


                const now = new Date();


                if (now >= expireDate) {

                    alert(
                        "❌ انتهى اشتراكك.\nيرجى تجديد الاشتراك."
                    );


                    localStorage.removeItem("studentCode");
                    localStorage.removeItem("studentName");
                    localStorage.removeItem("studentGrade");

                    window.location.href = "login.html";

                    return;

                }

            }

        })

        .catch(function (error) {

            console.error(
                "Subscription Check Error:",
                error
            );

            alert(
                "❌ حدث خطأ في التحقق من الاشتراك"
            );

        });

})();
