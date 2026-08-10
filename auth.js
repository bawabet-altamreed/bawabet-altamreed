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
    // جلب بيانات الطالب
    // ===============================

    db.collection("students")
        .doc(studentCode)
        .get()

        .then(function (doc) {

            if (!doc.exists) {

                logoutStudent();

                return;
            }


            const student = doc.data();


            // ===============================
            // التحقق من تفعيل الاشتراك
            // ===============================

            if (student.active !== true) {

                alert("❌ هذا الاشتراك غير مفعل");

                logoutStudent();

                return;
            }


            // ===============================
            // التحقق من تاريخ الانتهاء
            // ===============================

            if (student.expiresAt) {

                let expireDate;


                // Firebase Timestamp

                if (
                    typeof student.expiresAt.toDate === "function"
                ) {

                    expireDate =
                        student.expiresAt.toDate();

                }

                // تاريخ نصي

                else {

                    expireDate =
                        new Date(student.expiresAt);

                }


                // تاريخ غير صحيح

                if (isNaN(expireDate.getTime())) {

                    console.error(
                        "تاريخ انتهاء غير صحيح:",
                        student.expiresAt
                    );

                    return;
                }


                const now = new Date();


                // الاشتراك منتهي

                if (now >= expireDate) {

                    alert(
                        "❌ انتهى اشتراكك.\n\nيرجى تجديد الاشتراك."
                    );

                    logoutStudent();

                    return;
                }

            }


            // ===============================
            // حفظ بيانات الطالب
            // ===============================

            localStorage.setItem(
                "studentName",
                student.name || ""
            );

            localStorage.setItem(
                "studentGrade",
                student.grade || ""
            );


            // ===============================
            // التحقق من الجهاز
            // ===============================

            const deviceId =
                localStorage.getItem("deviceId");


            if (
                student.deviceId &&
                student.deviceId !== "null" &&
                student.deviceId !== "" &&
                deviceId &&
                student.deviceId !== deviceId
            ) {

                alert(
                    "❌ هذا الاشتراك مستخدم على جهاز آخر."
                );

                logoutStudent();

                return;
            }


            console.log(
                "✅ تم التحقق من الاشتراك:",
                studentCode
            );

        })


        .catch(function (error) {

            console.error(
                "Subscription Check Error:",
                error
            );

            alert(
                "❌ حدث خطأ في التحقق من الاشتراك.\n\n" +
                error.message
            );

        });


    // ===============================
    // تسجيل خروج الطالب
    // ===============================

    function logoutStudent() {

        localStorage.removeItem("studentCode");

        localStorage.removeItem("studentName");

        localStorage.removeItem("studentGrade");

        window.location.href = "login.html";
    }

})();
