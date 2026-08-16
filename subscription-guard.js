// ==========================================
// بوابة التمريض
// Subscription Guard
// حماية الاشتراك وتسجيل الخروج التلقائي
// ==========================================


// ==========================================
// إعدادات النظام
// ==========================================

const SUBSCRIPTION_CHECK_INTERVAL =
    60 * 1000; // كل دقيقة


let subscriptionGuardRunning = false;

let subscriptionLogoutStarted = false;

let subscriptionCheckTimer = null;


// ==========================================
// الحصول على كود الطالب
// ==========================================

function getLoggedStudentCode() {

    return localStorage.getItem(
        "studentCode"
    );

}


// ==========================================
// الحصول على نوع الحساب
// ==========================================

function getAccountType() {

    return localStorage.getItem(
        "accountType"
    );

}


// ==========================================
// تحويل التاريخ إلى Date
// ==========================================

function parseSubscriptionDate(value) {

    if (!value) {

        return null;

    }


    // ======================================
    // Firebase Timestamp
    // ======================================

    if (
        typeof value.toDate ===
        "function"
    ) {

        const date =
            value.toDate();


        if (
            date instanceof Date &&
            !isNaN(
                date.getTime()
            )
        ) {

            return date;

        }

    }


    // ======================================
    // JavaScript Date
    // ======================================

    if (
        value instanceof Date
    ) {

        return isNaN(
            value.getTime()
        )
            ? null
            : value;

    }


    // ======================================
    // Timestamp بالمللي ثانية
    // ======================================

    if (
        typeof value === "number"
    ) {

        const date =
            new Date(value);


        return isNaN(
            date.getTime()
        )
            ? null
            : date;

    }


    // ======================================
    // String
    // ======================================

    const date =
        new Date(value);


    if (
        isNaN(
            date.getTime()
        )
    ) {

        return null;

    }


    return date;

}


// ==========================================
// التحقق من انتهاء الاشتراك
// ==========================================

function isSubscriptionExpired(
    expiresAt
) {

    const expiry =
        parseSubscriptionDate(
            expiresAt
        );


    // ======================================
    // تاريخ غير موجود أو غير صالح
    // ======================================

    if (!expiry) {

        return true;

    }


    // ======================================
    // مقارنة الوقت الحالي
    // ======================================

    return (
        new Date().getTime() >=
        expiry.getTime()
    );

}


// ==========================================
// مسح بيانات جلسة الطالب
// ==========================================

function clearStudentSession() {

    // ======================================
    // بيانات الطالب
    // ======================================

    localStorage.removeItem(
        "studentCode"
    );

    localStorage.removeItem(
        "studentName"
    );

    localStorage.removeItem(
        "studentGrade"
    );


    // ======================================
    // بيانات ولي الأمر
    // ======================================

    localStorage.removeItem(
        "parentCode"
    );

    localStorage.removeItem(
        "parentName"
    );


    // ======================================
    // نوع الحساب
    // ======================================

    localStorage.removeItem(
        "accountType"
    );


    // ======================================
    // بيانات الاشتراك المؤقتة
    // ======================================

    localStorage.removeItem(
        "subscriptionExpiresAt"
    );

}


// ==========================================
// تسجيل الخروج النهائي
// ==========================================

function subscriptionLogout(
    message
) {

    // ======================================
    // منع تكرار Logout
    // ======================================

    if (
        subscriptionLogoutStarted
    ) {

        return;

    }


    subscriptionLogoutStarted =
        true;


    // ======================================
    // إيقاف Timer
    // ======================================

    if (
        subscriptionCheckTimer
    ) {

        clearInterval(
            subscriptionCheckTimer
        );

        subscriptionCheckTimer =
            null;

    }


    // ======================================
    // مسح الجلسة
    // ======================================

    clearStudentSession();


    // ======================================
    // Firebase Logout
    // ======================================

    let signOutPromise =
        Promise.resolve();


    try {

        if (
            typeof firebase !==
            "undefined" &&

            firebase.auth &&
            firebase.auth()
                .currentUser
        ) {

            signOutPromise =
                firebase.auth()
                    .signOut();

        }

    }

    catch (error) {

        console.error(
            "Firebase Sign Out Error:",
            error
        );

    }


    // ======================================
    // بعد تسجيل الخروج
    // ======================================

    signOutPromise
        .catch(function(error) {

            console.error(
                "Firebase Sign Out Error:",
                error
            );

        })
        .finally(function() {


            // ==================================
            // رسالة للطالب
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

        });

}


// ==========================================
// التحقق من اشتراك الطالب
// ==========================================

function checkStudentSubscription() {

    // ======================================
    // منع التحقق المتكرر أثناء Logout
    // ======================================

    if (
        subscriptionLogoutStarted
    ) {

        return;

    }


    // ======================================
    // الحصول على نوع الحساب
    // ======================================

    const accountType =
        getAccountType();


    // ======================================
    // إذا كانت الصفحة Login
    // لا نحتاج Guard
    // ======================================

    const currentPage =
        window.location.pathname
            .split("/")
            .pop()
            .toLowerCase();


    if (
        currentPage ===
        "login.html"
    ) {

        return;

    }


    // ======================================
    // لا يوجد Student Code
    // ======================================

    const studentCode =
        getLoggedStudentCode();


    if (!studentCode) {

        subscriptionLogout(
            "⛔ انتهت جلسة تسجيل الدخول، يرجى تسجيل الدخول مرة أخرى."
        );

        return;

    }


    // ======================================
    // التأكد من Firebase
    // ======================================

    if (
        typeof db ===
        "undefined"
    ) {

        console.error(
            "Subscription Guard: Firebase DB غير متاح."
        );

        return;

    }


    // ======================================
    // تحديد Collection
    // ======================================

    let collectionName =
        "students";

    let documentCode =
        studentCode;


    // ======================================
    // حساب ولي الأمر
    // ======================================

    if (
        accountType ===
        "parent"
    ) {

        const parentCode =
            localStorage.getItem(
                "parentCode"
            );


        if (
            parentCode
        ) {

            collectionName =
                "parents";

            documentCode =
                parentCode;

        }

    }


    // ======================================
    // الحصول على بيانات الحساب
    // ======================================

    db.collection(
        collectionName
    )
    .doc(
        documentCode
    )
    .get()

    .then(function(doc) {


        // ==================================
        // الحساب غير موجود
        // ==================================

        if (
            !doc.exists
        ) {

            subscriptionLogout(
                "❌ لم يتم العثور على بيانات حسابك."
            );

            return;

        }


        const account =
            doc.data();


        // ==================================
        // الحساب غير مفعل
        // ==================================

        if (
            account.active !== true
        ) {

            subscriptionLogout(
                "⛔ تم إيقاف اشتراكك من الإدارة."
            );

            return;

        }


        // ==================================
        // التحقق من تاريخ الانتهاء
        // ==================================

        if (
            !account.expiresAt
        ) {

            subscriptionLogout(
                "⚠️ لا يوجد تاريخ انتهاء صالح لاشتراكك."
            );

            return;

        }


        // ==================================
        // الاشتراك منتهي
        // ==================================

        if (
            isSubscriptionExpired(
                account.expiresAt
            )
        ) {

            subscriptionLogout(
                "⛔ انتهى اشتراكك، يرجى تجديد الاشتراك."
            );

            return;

        }


        // ==================================
        // الاشتراك ساري
        // ==================================

        subscriptionGuardRunning =
            true;


        console.log(
            "✅ Subscription Guard: الاشتراك ساري."
        );

    })

    .catch(function(error) {

        console.error(
            "Subscription Guard Error:",
            error
        );

    });

}


// ==========================================
// بدء Subscription Guard
// ==========================================

function startSubscriptionGuard() {

    // ======================================
    // منع تشغيل النظام أكثر من مرة
    // ======================================

    if (
        subscriptionGuardRunning
    ) {

        return;

    }


    // ======================================
    // تجاهل صفحة Login
    // ======================================

    const currentPage =
        window.location.pathname
            .split("/")
            .pop()
            .toLowerCase();


    if (
        currentPage ===
        "login.html"
    ) {

        return;

    }


    // ======================================
    // تحقق فوري
    // ======================================

    checkStudentSubscription();


    // ======================================
    // تحقق دوري كل دقيقة
    // ======================================

    subscriptionCheckTimer =
        setInterval(
            function() {

                checkStudentSubscription();

            },
            SUBSCRIPTION_CHECK_INTERVAL
        );


    subscriptionGuardRunning =
        true;

}


// ==========================================
// عند رجوع الطالب للصفحة
// ==========================================

document.addEventListener(
    "visibilitychange",
    function() {

        if (
            document.visibilityState ===
            "visible"
        ) {

            checkStudentSubscription();

        }

    }
);


// ==========================================
// عند رجوع الصفحة من Background
// ==========================================

window.addEventListener(
    "focus",
    function() {

        checkStudentSubscription();

    }
);


// ==========================================
// تشغيل النظام بعد تحميل الصفحة
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        startSubscriptionGuard();

    }
);
