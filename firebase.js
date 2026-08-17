// ===============================
// Firebase Configuration
// بوابة التمريض
// ===============================

const firebaseConfig = {
    apiKey: "AIzaSyDLVKbfkhFsTGunLWEJmBN2eGg0tdqePyc",
    authDomain: "bawabet-al-tamreed.firebaseapp.com",
    projectId: "bawabet-al-tamreed",
    storageBucket: "bawabet-al-tamreed.firebasestorage.app",
    messagingSenderId: "668697400713",
    appId: "1:668697400713:web:ec5611e587dc3d3c237d58"
};


// ===============================
// Initialize Firebase
// ===============================

firebase.initializeApp(firebaseConfig);


// ===============================
// Firestore
// ===============================

const db = firebase.firestore();


// ===============================
// Subscription Guard
// تحميل نظام حماية الاشتراك مركزيًا
// ===============================

(function () {

    // ==================================
    // الصفحات المستثناة من الحماية
    // ==================================

    const publicPages = [

        // صفحة تسجيل الدخول
        "login.html",

        // لوحة الإدارة
        // لا علاقة لها باشتراك الطلاب
        "admin.html"

    ];


    // ==================================
    // اسم الصفحة الحالية
    // ==================================

    const currentPage =
        window.location.pathname
            .split("/")
            .pop()
            .toLowerCase();


    // ==================================
    // إذا كانت الصفحة مستثناة
    // لا نحمل Subscription Guard
    // ==================================

    if (
        publicPages.includes(
            currentPage
        )
    ) {

        console.log(
            "🛡️ Subscription Guard skipped:",
            currentPage
        );

        return;
    }


    // ==================================
    // تحميل Subscription Guard
    // ==================================

    const script =
        document.createElement("script");


    script.src =
        "subscription-guard.js";


    script.defer = true;


    document.head.appendChild(
        script
    );

})();
