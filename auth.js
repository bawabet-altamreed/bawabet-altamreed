 // ===============================
// بوابة التمريض
// Authentication / Session Guard
// حماية جلسة الطالب وولي الأمر
// ===============================

(function () {

    "use strict";


    // ==================================
    // الصفحة الحالية
    // ==================================

    const currentPage =
        window.location.pathname
            .split("/")
            .pop()
            .toLowerCase();


    // ==================================
    // الصفحات المستثناة
    // ==================================

    if (
        currentPage === "login.html" ||
        currentPage === "admin.html"
    ) {

        return;

    }


    // ==================================
    // نوع الحساب
    // ==================================

    const accountType =
        localStorage.getItem(
            "accountType"
        );


    // ==================================
    // تحديد بيانات الجلسة
    // ==================================

    let accountCode = null;

    let collectionName = null;


    // ==================================
    // حساب ولي الأمر
    // ==================================

    if (
        accountType === "parent"
    ) {

        accountCode =
            localStorage.getItem(
                "parentCode"
            );

        collectionName =
            "parents";

    }


    // ==================================
    // حساب الطالب
    // ==================================

    else {

        accountCode =
            localStorage.getItem(
                "studentCode"
            );

        collectionName =
            "students";

    }


    // ==================================
    // لا توجد جلسة
    // ==================================

    if (!accountCode) {

        redirectToLogin(
            "⛔ لا توجد جلسة تسجيل دخول."
        );

        return;

    }


    // ==================================
    // التأكد من Firebase
    // ==================================

    if (
        typeof db === "undefined"
    ) {

        console.error(
            "❌ Auth: Firebase DB غير متاح."
        );

        /*
         * لا نعمل Logout.
         *
         * لو Firebase لم يتم تحميله بعد،
         * الصفحة لا يجب أن تمسح الجلسة.
         */

        return;

    }


    // ==================================
    // التحقق من الحساب في Firestore
    // ==================================

    db.collection(
        collectionName
    )
    .doc(
        accountCode
    )
    .get()

    .then(function (doc) {

        // ==================================
        // الحساب غير موجود
        // ==================================

        if (
            !doc.exists
        ) {

            console.error(
                "❌ Auth: الحساب غير موجود.",
                accountCode
            );


            /*
             * الحساب غير موجود فعليًا.
             * هنا فقط ننهي الجلسة.
             */

            logoutSession(
                "❌ لم يتم العثور على بيانات حسابك."
            );

            return;

        }


        // ==================================
        // بيانات الحساب
        // ==================================

        const account =
            doc.data();


        // ==================================
        // التحقق من حالة الحساب
        // ==================================

        if (
            account.active !== true
        ) {

            logoutSession(
                "⛔ تم إيقاف حسابك من الإدارة."
            );

            return;

        }


        // ==================================
        // حفظ بيانات الطالب
        // ==================================

        if (
            accountType !== "parent"
        ) {

            localStorage.setItem(
                "studentName",
                account.name || ""
            );

            localStorage.setItem(
                "studentGrade",
                account.grade || ""
            );

        }


        // ==================================
        // حفظ بيانات ولي الأمر
        // ==================================

        if (
            accountType === "parent"
        ) {

            localStorage.setItem(
                "parentName",
                account.name || ""
            );

        }


        // ==================================
        // ملاحظة مهمة:
        //
        // لا نتحقق من expiresAt هنا.
        //
        // Subscription Guard هو المسؤول
        // عن الاشتراك.
        // ==================================


        // ==================================
        // التحقق من الجهاز
        // ==================================

        const deviceId =
            localStorage.getItem(
                "deviceId"
            );


        // ==================================
        // الجهاز غير موجود محليًا
        // ==================================

        if (
            !deviceId
        ) {

            console.warn(
                "⚠️ Auth: deviceId غير موجود على الجهاز."
            );

            /*
             * لا نعمل Logout هنا.
             *
             * لأن deviceId قد يتم إنشاؤه
             * في login.js أو ملف آخر.
             */

        }


        // ==================================
        // الجهاز مربوط بحساب آخر
        // ==================================

        if (
            account.deviceId &&
            account.deviceId !== "null" &&
            account.deviceId !== "" &&
            deviceId &&
            account.deviceId !== deviceId
        ) {

            logoutSession(
                "❌ هذا الحساب مرتبط بجهاز آخر."
            );

            return;

        }


        // ==================================
        // الجلسة سليمة
        // ==================================

        console.log(
            "✅ Auth: تم التحقق من جلسة الحساب.",
            accountCode
        );

    })

    .catch(function (error) {

        // ==================================
        // خطأ في Firestore
        // ==================================

        console.error(
            "⚠️ Auth Firestore Error:",
            error
        );


        /*
         * مهم جدًا:
         *
         * لا Logout عند حدوث خطأ اتصال.
         *
         * لأن الخطأ قد يكون:
         *
         * - انقطاع الإنترنت
         * - Firebase غير متاح مؤقتًا
         * - Timeout
         * - مشكلة شبكة
         *
         * والجلسة المحلية تظل محفوظة.
         */

    });


    // ==================================
    // تسجيل الخروج المحلي
    // ==================================

    function logoutSession(message) {

        // ==================================
        // مسح بيانات الجلسة فقط
        // ==================================

        localStorage.removeItem(
            "studentCode"
        );

        localStorage.removeItem(
            "studentName"
        );

        localStorage.removeItem(
            "studentGrade"
        );

        localStorage.removeItem(
            "parentCode"
        );

        localStorage.removeItem(
            "parentName"
        );

        localStorage.removeItem(
            "accountType"
        );

        localStorage.removeItem(
            "subscriptionExpiresAt"
        );


        // ==================================
        // مهم جدًا:
        //
        // لا نحذف deviceId
        // ==================================


        // ==================================
        // رسالة للمستخدم
        // ==================================

        if (message) {

            alert(
                message
            );

        }


        // ==================================
        // العودة إلى Login
        // ==================================

        window.location.replace(
            "login.html"
        );

    }


    // ==================================
    // تحويل إلى Login
    // ==================================

    function redirectToLogin(message) {

        if (message) {

            alert(
                message
            );

        }


        window.location.replace(
            "login.html"
        );

    }

})();
