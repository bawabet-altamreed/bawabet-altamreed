// ==========================================
// بوابة التمريض
// Subscription Guard
// نظام حماية الاشتراك
// ==========================================

// ==========================================
// إعدادات النظام
// ==========================================

const SUBSCRIPTION_CHECK_INTERVAL =
    60 * 1000; // كل دقيقة


let subscriptionGuardStarted = false;

let subscriptionCheckInProgress = false;

let subscriptionLogoutStarted = false;

let subscriptionCheckTimer = null;


// ==========================================
// معرفة الصفحة الحالية
// ==========================================

function getCurrentPage() {

    return window.location.pathname
        .split("/")
        .pop()
        .toLowerCase();

}


// ==========================================
// هل الصفحة صفحة الأدمن؟
// ==========================================

function isAdminPage() {

    const currentPage =
        getCurrentPage();

    return currentPage === "admin.html";

}


// ==========================================
// هل صفحة تسجيل الدخول؟
// ==========================================

function isLoginPage() {

    const currentPage =
        getCurrentPage();

    return currentPage === "login.html";

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
// الحصول على كود الطالب
// ==========================================

function getStudentCode() {

    return localStorage.getItem(
        "studentCode"
    );

}


// ==========================================
// الحصول على كود ولي الأمر
// ==========================================

function getParentCode() {

    return localStorage.getItem(
        "parentCode"
    );

}


// ==========================================
// تحديد بيانات الحساب
// ==========================================

function getAccountSession() {

    const accountType =
        getAccountType();


    // ======================================
    // حساب ولي الأمر
    // ======================================

    if (
        accountType === "parent"
    ) {

        const parentCode =
            getParentCode();


        if (!parentCode) {

            return null;

        }


        return {

            accountType: "parent",

            collection: "parents",

            code: parentCode

        };

    }


    // ======================================
    // حساب الطالب
    // ======================================

    const studentCode =
        getStudentCode();


    if (!studentCode) {

        return null;

    }


    return {

        accountType: "student",

        collection: "students",

        code: studentCode

    };

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

        try {

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

        catch (error) {

            console.error(
                "Subscription Date Error:",
                error
            );

            return null;

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

    if (
        typeof value === "string"
    ) {

        const date =
            new Date(value);


        return isNaN(
            date.getTime()
        )
            ? null
            : date;

    }


    return null;

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
    // تاريخ غير صالح
    // ======================================

    if (!expiry) {

        return null;

    }


    // ======================================
    // مقارنة الوقت الحالي
    // ======================================

    return (
        Date.now() >=
        expiry.getTime()
    );

}


// ==========================================
// إيقاف Timer
// ==========================================

function stopSubscriptionGuardTimer() {

    if (
        subscriptionCheckTimer
    ) {

        clearInterval(
            subscriptionCheckTimer
        );

        subscriptionCheckTimer = null;

    }

}


// ==========================================
// تسجيل الخروج بسبب انتهاء الاشتراك فقط
// ==========================================

function subscriptionLogout(
    message
) {

    // ======================================
    // منع التكرار
    // ======================================

    if (
        subscriptionLogoutStarted
    ) {

        return;

    }


    subscriptionLogoutStarted =
        true;


    // ======================================
    // إيقاف الفحص الدوري
    // ======================================

    stopSubscriptionGuardTimer();


    // ======================================
    // مهم جدًا:
    //
    // لا نحذف deviceId
    //
    // ولا نعمل Firebase signOut هنا.
    //
    // لأن deviceId مرتبط بالحساب.
    // ======================================


    // ======================================
    // حذف بيانات الجلسة فقط
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


    // ======================================
    // رسالة انتهاء الاشتراك
    // ======================================

    if (message) {

        alert(
            message
        );

    }


    // ======================================
    // العودة إلى Login
    // ======================================

    window.location.replace(
        "login.html"
    );

}


// ==========================================
// فحص اشتراك الحساب
// ==========================================

function checkStudentSubscription() {

    // ======================================
    // الأدمن خارج Subscription Guard
    // ======================================

    if (
        isAdminPage()
    ) {

        return;

    }


    // ======================================
    // Login خارج Subscription Guard
    // ======================================

    if (
        isLoginPage()
    ) {

        return;

    }


    // ======================================
    // منع الفحص أثناء Logout
    // ======================================

    if (
        subscriptionLogoutStarted
    ) {

        return;

    }


    // ======================================
    // منع تنفيذ أكثر من طلب Firestore
    // في نفس الوقت
    // ======================================

    if (
        subscriptionCheckInProgress
    ) {

        return;

    }


    // ======================================
    // الحصول على جلسة الحساب
    // ======================================

    const session =
        getAccountSession();


    // ======================================
    // لا توجد جلسة محلية
    //
    // مهم:
    // لا نعمل Logout هنا.
    //
    // auth.js هو المسؤول عن حماية
    // تسجيل الدخول.
    // ======================================

    if (!session) {

        console.warn(
            "🛡️ Subscription Guard: لا توجد جلسة حساب صالحة حاليًا."
        );

        return;

    }


    // ======================================
    // التأكد من وجود Firestore
    // ======================================

    if (
        typeof db === "undefined"
    ) {

        console.error(
            "❌ Subscription Guard: Firebase DB غير متاح."
        );

        return;

    }


    // ======================================
    // بدء الفحص
    // ======================================

    subscriptionCheckInProgress =
        true;


    console.log(
        "🔎 Subscription Guard: جاري فحص الاشتراك...",
        session.accountType,
        session.code
    );


    // ======================================
    // قراءة الحساب من Firestore
    // ======================================

    db.collection(
        session.collection
    )
    .doc(
        session.code
    )
    .get()

    .then(function(doc) {

        // ==================================
        // انتهاء الفحص
        // ==================================

        subscriptionCheckInProgress =
            false;


        // ==================================
        // الحساب غير موجود
        // ==================================

        if (
            !doc.exists
        ) {

            console.error(
                "❌ Subscription Guard: الحساب غير موجود في Firestore."
            );


            /*
             * لا نعمل Logout فورًا.
             *
             * السبب:
             * قد يكون هناك تأخر مؤقت أو مشكلة
             * في البيانات.
             *
             * إعادة الفحص في الدورة القادمة
             * أكثر أمانًا.
             */

            return;

        }


        // ==================================
        // بيانات الحساب
        // ==================================

        const account =
            doc.data();


        // ==================================
        // التحقق من تفعيل الحساب
        // ==================================

        if (
            account.active !== true
        ) {

            subscriptionLogout(
                "⛔ تم إيقاف حسابك من الإدارة."
            );

            return;

        }


        // ==================================
        // التحقق من وجود expiresAt
        // ==================================

        if (
            !account.expiresAt
        ) {

            console.error(
                "⚠️ Subscription Guard: لا يوجد expiresAt للحساب."
            );


            /*
             * لا نعمل Logout تلقائيًا.
             *
             * لأن غياب expiresAt قد يكون بسبب
             * بيانات قديمة أو مشكلة في إنشاء الحساب.
             */

            return;

        }


        // ==================================
        // معرفة حالة الاشتراك
        // ==================================

        const expired =
            isSubscriptionExpired(
                account.expiresAt
            );


        // ==================================
        // التاريخ غير صالح
        // ==================================

        if (
            expired === null
        ) {

            console.error(
                "⚠️ Subscription Guard: تاريخ الاشتراك غير صالح.",
                account.expiresAt
            );


            /*
             * لا Logout.
             */

            return;

        }


        // ==================================
        // الاشتراك منتهي فعلًا
        // ==================================

        if (
            expired === true
        ) {

            subscriptionLogout(
                "⛔ انتهى اشتراكك، يرجى تجديد الاشتراك."
            );

            return;

        }


        // ==================================
        // الاشتراك ساري
        // ==================================

        localStorage.setItem(
            "subscriptionExpiresAt",
            account.expiresAt
        );


        // ==================================
        // حفظ اسم الحساب
        // ==================================

        if (
            session.accountType ===
            "student"
        ) {

            if (
                account.name
            ) {

                localStorage.setItem(
                    "studentName",
                    account.name
                );

            }


            if (
                account.grade
            ) {

                localStorage.setItem(
                    "studentGrade",
                    account.grade
                );

            }

        }


        // ==================================
        // ولي الأمر
        // ==================================

        if (
            session.accountType ===
            "parent"
        ) {

            if (
                account.name
            ) {

                localStorage.setItem(
                    "parentName",
                    account.name
                );

            }

        }


        // ==================================
        // الاشتراك ساري
        // ==================================

        console.log(
            "✅ Subscription Guard: الاشتراك ساري.",
            session.code
        );

    })

    .catch(function(error) {

        // ==================================
        // انتهاء حالة الطلب
        // ==================================

        subscriptionCheckInProgress =
            false;


        // ==================================
        // مهم جدًا:
        //
        // لا Logout عند حدوث Error
        // ==================================

        console.error(
            "⚠️ Subscription Guard Error:",
            error
        );


        /*
         * أمثلة:
         *
         * - انقطاع الإنترنت
         * - Firebase مؤقتًا غير متاح
         * - Timeout
         * - مشكلة في الاتصال
         *
         * لا يجب أن تؤدي هذه الأخطاء
         * إلى طرد الطالب أو ولي الأمر.
         *
         * سيتم إعادة الفحص في الدورة القادمة.
         */

    });

}


// ==========================================
// بدء Subscription Guard
// ==========================================

function startSubscriptionGuard() {

    // ======================================
    // الأدمن
    // ======================================

    if (
        isAdminPage()
    ) {

        console.log(
            "👑 Admin Page: Subscription Guard skipped."
        );

        return;

    }


    // ======================================
    // Login
    // ======================================

    if (
        isLoginPage()
    ) {

        return;

    }


    // ======================================
    // منع التشغيل أكثر من مرة
    // ======================================

    if (
        subscriptionGuardStarted
    ) {

        return;

    }


    subscriptionGuardStarted =
        true;


    // ======================================
    // فحص فوري
    // ======================================

    checkStudentSubscription();


    // ======================================
    // فحص دوري
    // ======================================

    subscriptionCheckTimer =
        setInterval(

            function() {

                checkStudentSubscription();

            },

            SUBSCRIPTION_CHECK_INTERVAL

        );


    console.log(
        "🛡️ Subscription Guard started."
    );

}


// ==========================================
// عند رجوع الصفحة من Background
// ==========================================

document.addEventListener(
    "visibilitychange",
    function() {

        // ==================================
        // الأدمن
        // ==================================

        if (
            isAdminPage()
        ) {

            return;

        }


        // ==================================
        // الصفحة أصبحت مرئية
        // ==================================

        if (
            document.visibilityState ===
            "visible"
        ) {

            checkStudentSubscription();

        }

    }
);


// ==========================================
// عند رجوع الصفحة للتركيز
// ==========================================

window.addEventListener(
    "focus",
    function() {

        // ==================================
        // الأدمن
        // ==================================

        if (
            isAdminPage()
        ) {

            return;

        }


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
