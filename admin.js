// ==========================================================
// بوابة التمريض
// Admin Panel
// لوحة إدارة بوابة التمريض
// ==========================================================


// ==========================================================
// إعدادات الأدمن
// ==========================================================

// UID الخاص بحساب الأدمن المسموح له بالدخول

const ADMIN_UIDS = [

    "H4wMJm2ComSSy19ttzb1KxZz7Yu1"

];


// ==========================================================
// متغيرات عامة
// ==========================================================

let allStudents = [];

let allCodes = [];

let allParents = [];

let allResults = [];

let allContent = [];

let allNotifications = [];

let allLeaderboard = [];

let currentAdmin = null;


// ==========================================================
// تشغيل لوحة الإدارة
// ==========================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeAdmin();

        setupAdminEvents();

    }
);


// ==========================================================
// التحقق من الأدمن
// ==========================================================

function initializeAdmin() {

    const loading =
        document.getElementById("loading");

    const denied =
        document.getElementById("accessDenied");

    const panel =
        document.getElementById("adminPanel");


    firebase.auth().onAuthStateChanged(
        function (user) {

            if (!user) {

                showAccessDenied();

                return;

            }


            currentAdmin = user;


            if (
                !ADMIN_UIDS.includes(user.uid)
            ) {

                console.error(
                    "Unauthorized admin:",
                    user.uid
                );

                showAccessDenied();

                return;

            }


            if (loading) {

                loading.classList.add("hidden");

            }


            if (denied) {

                denied.classList.add("hidden");

            }


            if (panel) {

                panel.classList.remove("hidden");

            }


            loadAdminData();

        }
    );

}


// ==========================================================
// رفض الدخول
// ==========================================================

function showAccessDenied() {

    const loading =
        document.getElementById("loading");

    const denied =
        document.getElementById("accessDenied");

    const panel =
        document.getElementById("adminPanel");


    if (loading) {

        loading.classList.add("hidden");

    }


    if (panel) {

        panel.classList.add("hidden");

    }


    if (denied) {

        denied.classList.remove("hidden");

    }

}


// ==========================================================
// تحميل بيانات لوحة الإدارة
// ==========================================================

function loadAdminData() {

    loadStudents()
        .then(function () {

            return loadCodes();

        })
        .then(function () {

            return loadParents();

        })
        .then(function () {

            return loadResults();

        })
        .then(function () {

            return loadContent();

        })
        .then(function () {

            return loadNotifications();

        })
        .then(function () {

            return loadLeaderboard();

        })
        .then(function () {

            updateDashboard();

        })
        .catch(function (error) {

            console.error(
                "Admin loading error:",
                error
            );

        });

}


// ==========================================================
// التنقل بين الأقسام
// ==========================================================

function showSection(sectionId) {

    const sections =
        document.querySelectorAll(
            ".section"
        );


    sections.forEach(
        function (section) {

            section.classList.remove(
                "active"
            );

        }
    );


    const target =
        document.getElementById(
            sectionId
        );


    if (target) {

        target.classList.add("active");

    }


    if (sectionId === "students") {

        renderStudents();

    }


    if (sectionId === "codes") {

        renderCodes();

    }


    if (sectionId === "parents") {

        renderParents();

    }


    if (sectionId === "results") {

        renderAdminResults();

    }


    if (sectionId === "leaderboard") {

        renderLeaderboard();

    }


    if (sectionId === "content") {

        renderContent();

    }


    if (sectionId === "notifications") {

        renderNotificationsAdmin();

    }

}


// ==========================================================
// إعداد Events
// ==========================================================

function setupAdminEvents() {

    const studentSearch =
        document.getElementById(
            "studentSearch"
        );


    if (studentSearch) {

        studentSearch.addEventListener(
            "input",
            function () {

                renderStudents(
                    this.value
                );

            }
        );

    }


    const filterSubject =
        document.getElementById(
            "filterSubject"
        );


    const filterGrade =
        document.getElementById(
            "filterGrade"
        );


    if (filterSubject) {

        filterSubject.addEventListener(
            "change",
            function () {

                renderContent();

            }
        );

    }


    if (filterGrade) {

        filterGrade.addEventListener(
            "change",
            function () {

                renderContent();

            }
        );

    }


    const notificationTargetType =
        document.getElementById(
            "notificationTargetType"
        );


    if (notificationTargetType) {

        notificationTargetType.addEventListener(
            "change",
            function () {

                const target =
                    document.getElementById(
                        "notificationTargetId"
                    );


                if (!target) {

                    return;

                }


                if (
                    this.value === "all"
                ) {

                    target.style.display =
                        "none";

                    target.value = "";

                }

                else {

                    target.style.display =
                        "block";


                    if (
                        this.value === "grade"
                    ) {

                        target.placeholder =
                            "اكتب الصف مثل: الصف الأول الثانوي التمريض";

                    }

                    else {

                        target.placeholder =
                            "اكتب كود الطالب";

                    }

                }

            }
        );

    }


    const modal =
        document.getElementById(
            "studentModal"
        );


    if (modal) {

        modal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target === modal
                ) {

                    closeStudentModal();

                }

            }
        );

    }

}


// ==========================================================
// تحميل الطلاب
// ==========================================================

function loadStudents() {

    return db.collection("students")
        .get()
        .then(function (snapshot) {

            allStudents = [];


            snapshot.forEach(
                function (doc) {

                    allStudents.push({

                        id: doc.id,

                        ...doc.data()

                    });

                }
            );


            return allStudents;

        });

}


// ==========================================================
// عرض الطلاب
// ==========================================================

function renderStudents(searchText) {

    const table =
        document.getElementById(
            "studentsTable"
        );


    if (!table) {

        return;

    }


    let students =
        [...allStudents];


    const search =
        String(
            searchText || ""
        )
        .trim()
        .toLowerCase();


    if (search) {

        students =
            students.filter(
                function (student) {

                    return (

                        String(
                            student.id || ""
                        )
                        .toLowerCase()
                        .includes(search)

                        ||

                        String(
                            student.name || ""
                        )
                        .toLowerCase()
                        .includes(search)

                        ||

                        String(
                            student.email || ""
                        )
                        .toLowerCase()
                        .includes(search)

                    );

                }
            );

    }


    if (!students.length) {

        table.innerHTML = `

            <tr>

                <td colspan="6">

                    لا يوجد طلاب

                </td>

            </tr>

        `;

        return;

    }


    table.innerHTML =
        students.map(
            function (student) {

                const expiry =
                    getDate(
                        student.expiresAt
                    );


                const active =
                    isStudentActive(
                        student
                    );


                return `

                    <tr>

                        <td>
                            ${escapeHtml(
                                student.id
                            )}
                        </td>


                        <td>
                            ${escapeHtml(
                                student.name || "-"
                            )}
                        </td>


                        <td>
                            ${escapeHtml(
                                student.grade || "-"
                            )}
                        </td>


                        <td>

                            ${
                                active
                                    ? "✅ نشط"
                                    : "⛔ منتهي"
                            }

                        </td>


                        <td>

                            ${
                                expiry
                                    ? formatDate(expiry)
                                    : "-"
                            }

                        </td>


                        <td>

                            <!-- عرض التفاصيل -->

                            <button
                                class="admin-btn primary-btn"
                                title="عرض التفاصيل"
                                onclick="viewStudent('${escapeJs(
                                    student.id
                                )}')">

                                👁️

                            </button>


                            <!-- تفعيل / إيقاف -->

                            <button
                                class="admin-btn warning-btn"
                                title="${
                                    student.active === true
                                        ? "إيقاف الحساب"
                                        : "تفعيل الحساب"
                                }"
                                onclick="toggleStudentStatus('${escapeJs(
                                    student.id
                                )}')">

                                ${
                                    student.active === true
                                        ? "⏸️"
                                        : "▶️"
                                }

                            </button>


                            <!-- تمديد الاشتراك -->

                            <button
                                class="admin-btn success-btn"
                                title="تمديد الاشتراك"
                                onclick="extendStudent('${escapeJs(
                                    student.id
                                )}')">

                                ➕

                            </button>


                            <!-- فك الجهاز -->

                            <button
                                class="admin-btn warning-btn"
                                title="فك الجهاز المرتبط"
                                onclick="unlinkStudentDevice('${escapeJs(
                                    student.id
                                )}')">

                                🔓

                            </button>


                            <!-- تغيير كلمة المرور -->

                            <button
                                class="admin-btn primary-btn"
                                title="تغيير كلمة المرور"
                                onclick="changeStudentPassword('${escapeJs(
                                    student.id
                                )}')">

                                🔑

                            </button>


                            <!-- حذف الطالب -->

                            <button
                                class="admin-btn danger-btn"
                                title="حذف الطالب"
                                onclick="deleteStudent('${escapeJs(
                                    student.id
                                )}')">

                                🗑️

                            </button>

                        </td>

                    </tr>

                `;

            }
        )
        .join("");

}


// ==========================================================
// فك الجهاز المرتبط بالطالب
// ==========================================================

function unlinkStudentDevice(studentCode) {

    const student =
        allStudents.find(
            function (item) {

                return item.id === studentCode;

            }
        );


    if (!student) {

        alert(
            "❌ الطالب غير موجود"
        );

        return;

    }


    const confirmed =
        confirm(
            "🔓 هل تريد فك الجهاز المرتبط بهذا الطالب؟\n\n" +
            (student.name || studentCode) +
            "\n\nسيتمكن الطالب من تسجيل الدخول من جهاز جديد."
        );


    if (!confirmed) {

        return;

    }


    db.collection("students")
        .doc(studentCode)
        .update({

            deviceId: null

        })
        .then(function () {

            student.deviceId = null;


            alert(
                "✅ تم فك الجهاز بنجاح\n\n" +
                "يمكن للطالب الآن تسجيل الدخول من جهاز جديد."
            );

        })
        .catch(function (error) {

            console.error(
                "Unlink device error:",
                error
            );


            alert(
                "❌ تعذر فك الجهاز"
            );

        });

}


// ==========================================================
// عرض تفاصيل الطالب
// ==========================================================

function viewStudent(studentCode) {

    const student =
        allStudents.find(
            function (item) {

                return item.id === studentCode;

            }
        );


    if (!student) {

        alert("❌ الطالب غير موجود");

        return;

    }


    const modal =
        document.getElementById(
            "studentModal"
        );


    const details =
        document.getElementById(
            "studentDetails"
        );


    if (!modal || !details) {

        return;

    }


    const expiry =
        getDate(
            student.expiresAt
        );


    const active =
        isStudentActive(
            student
        );


    const studentResults =
        allResults.filter(
            function (result) {

                return (
                    result.studentCode ===
                    studentCode
                );

            }
        );


    let resultsHtml = "";


    if (!studentResults.length) {

        resultsHtml =
            `<p>📝 لا توجد نتائج حتى الآن.</p>`;

    }

    else {

        resultsHtml = `

            <div class="table-container">

                <table>

                    <thead>

                        <tr>

                            <th>المادة</th>

                            <th>Chapter</th>

                            <th>الدرجة</th>

                            <th>النسبة</th>

                            <th>التاريخ</th>

                        </tr>

                    </thead>

                    <tbody>

                        ${
                            studentResults
                                .slice(0, 10)
                                .map(
                                    function (result) {

                                        return `

                                            <tr>

                                                <td>
                                                    ${escapeHtml(
                                                        result.subject || "-"
                                                    )}
                                                </td>

                                                <td>
                                                    ${escapeHtml(
                                                        result.chapter || "-"
                                                    )}
                                                </td>

                                                <td>
                                                    ${result.score ?? 0}
                                                    /
                                                    ${result.total ?? 0}
                                                </td>

                                                <td>
                                                    ${getPercentage(
                                                        result
                                                    )}%
                                                </td>

                                                <td>
                                                    ${formatDateTime(
                                                        result.createdAt
                                                    )}
                                                </td>

                                            </tr>

                                        `;

                                    }
                                )
                                .join("")
                        }

                    </tbody>

                </table>

            </div>

        `;

    }


    details.innerHTML = `

        <div class="student-info-grid">

            <div class="student-info">

                <small>👨‍🎓 الاسم</small>

                <strong>
                    ${escapeHtml(
                        student.name || "-"
                    )}
                </strong>

            </div>


            <div class="student-info">

                <small>🔑 كود الطالب</small>

                <strong>
                    ${escapeHtml(
                        student.id
                    )}
                </strong>

            </div>


            <div class="student-info">

                <small>🎓 الصف</small>

                <strong>
                    ${escapeHtml(
                        student.grade || "-"
                    )}
                </strong>

            </div>


            <div class="student-info">

                <small>📧 البريد الإلكتروني</small>

                <strong>
                    ${escapeHtml(
                        student.email || "-"
                    )}
                </strong>

            </div>


            <div class="student-info">

                <small>📅 تاريخ الانتهاء</small>

                <strong>
                    ${
                        expiry
                            ? formatDate(expiry)
                            : "-"
                    }
                </strong>

            </div>


            <div class="student-info">

                <small>📊 الحالة</small>

                <strong>
                    ${
                        active
                            ? "✅ نشط"
                            : "⛔ غير نشط"
                    }
                </strong>

            </div>

        </div>


        <h3 class="student-detail-title">

            📝 آخر نتائج الطالب

        </h3>


        ${resultsHtml}

    `;


    modal.classList.remove(
        "hidden"
    );

}


// ==========================================================
// إغلاق تفاصيل الطالب
// ==========================================================

function closeStudentModal() {

    const modal =
        document.getElementById(
            "studentModal"
        );


    if (modal) {

        modal.classList.add(
            "hidden"
        );

    }

}


// ==========================================================
// تفعيل / إيقاف حساب الطالب
// ==========================================================

function toggleStudentStatus(studentCode) {

    const student =
        allStudents.find(
            function (item) {

                return item.id === studentCode;

            }
        );


    if (!student) {

        alert("❌ الطالب غير موجود");

        return;

    }


    const newStatus =
        student.active !== true;


    const actionText =
        newStatus
            ? "تفعيل"
            : "إيقاف";


    const confirmed =
        confirm(
            `⚠️ هل تريد ${actionText} حساب الطالب؟\n\n` +
            `${student.name || studentCode}`
        );


    if (!confirmed) {

        return;

    }


    db.collection("students")
        .doc(studentCode)
        .update({

            active: newStatus

        })
        .then(function () {

            student.active =
                newStatus;


            renderStudents();

            renderCodes();

            updateDashboard();


            alert(
                newStatus
                    ? "✅ تم تفعيل حساب الطالب"
                    : "⏸️ تم إيقاف حساب الطالب"
            );

        })
        .catch(function (error) {

            console.error(error);

            alert(
                "❌ تعذر تغيير حالة الطالب"
            );

        });

}


// ==========================================================
// تغيير كلمة مرور الطالب
// ==========================================================

function changeStudentPassword(studentCode) {

    const student =
        allStudents.find(
            function (item) {

                return item.id === studentCode;

            }
        );


    if (!student) {

        alert("❌ الطالب غير موجود");

        return;

    }


    const newPassword =
        prompt(
            "🔑 اكتب كلمة المرور الجديدة:",
            ""
        );


    if (newPassword === null) {

        return;

    }


    const password =
        String(
            newPassword
        ).trim();


    if (!password) {

        alert(
            "❌ كلمة المرور لا يمكن أن تكون فارغة"
        );

        return;

    }


    if (password.length < 4) {

        alert(
            "❌ كلمة المرور يجب ألا تقل عن 4 أحرف"
        );

        return;

    }


    const confirmed =
        confirm(
            "⚠️ هل تريد تغيير كلمة مرور الطالب؟\n\n" +
            (student.name || studentCode)
        );


    if (!confirmed) {

        return;

    }


    db.collection("students")
        .doc(studentCode)
        .update({

            password: password

        })
        .then(function () {

            student.password =
                password;


            alert(
                "✅ تم تغيير كلمة مرور الطالب بنجاح"
            );

        })
        .catch(function (error) {

            console.error(error);

            alert(
                "❌ تعذر تغيير كلمة المرور"
            );

        });

}


// ==========================================================
// تمديد اشتراك الطالب
// ==========================================================

function extendStudent(studentCode) {

    const student =
        allStudents.find(
            function (item) {

                return item.id === studentCode;

            }
        );


    if (!student) {

        alert("الطالب غير موجود");

        return;

    }


    const daysText =
        prompt(
            "اكتب عدد الأيام المراد إضافتها:",
            "30"
        );


    if (daysText === null) {

        return;

    }


    const days =
        Number(daysText);


    if (
        !Number.isFinite(days) ||
        days <= 0
    ) {

        alert("❌ عدد الأيام غير صحيح");

        return;

    }


    const currentExpiry =
        getDate(
            student.expiresAt
        );


    const now =
        new Date();


    let baseDate =
        currentExpiry &&
        currentExpiry > now
            ? currentExpiry
            : now;


    const newExpiry =
        new Date(baseDate);


    newExpiry.setDate(
        newExpiry.getDate() +
        days
    );


    db.collection("students")
        .doc(studentCode)
        .update({

            expiresAt:
                firebase.firestore.Timestamp.fromDate(
                    newExpiry
                ),

            active: true

        })
        .then(function () {

            student.expiresAt =
                firebase.firestore.Timestamp.fromDate(
                    newExpiry
                );

            student.active = true;


            renderStudents();


            updateDashboard();


            alert(
                "✅ تم تمديد اشتراك الطالب"
            );

        })
        .catch(function (error) {

            console.error(error);

            alert(
                "❌ حدث خطأ أثناء تمديد الاشتراك"
            );

        });

}


// ==========================================================
// حذف طالب
// ==========================================================

function deleteStudent(studentCode) {

    const student =
        allStudents.find(
            function (item) {

                return item.id === studentCode;

            }
        );


    if (!student) {

        return;

    }


    const confirmed =
        confirm(
            "⚠️ هل أنت متأكد من حذف الطالب؟\n\n" +
            (student.name || studentCode) +
            "\n\nسيتم حذف حساب الطالب فقط، ولن يتم حذف نتائج الاختبارات تلقائيًا."
        );


    if (!confirmed) {

        return;

    }


    db.collection("students")
        .doc(studentCode)
        .delete()
        .then(function () {

            allStudents =
                allStudents.filter(
                    function (item) {

                        return (
                            item.id !==
                            studentCode
                        );

                    }
                );


            allCodes =
                allCodes.filter(
                    function (item) {

                        return (
                            item.id !==
                            studentCode
                        );

                    }
                );


            renderStudents();

            renderCodes();

            updateDashboard();


            alert(
                "✅ تم حذف الطالب"
            );

        })
        .catch(function (error) {

            console.error(error);

            alert(
                "❌ تعذر حذف الطالب"
            );

        });

}


// ==========================================================
// تحميل الأكواد
// ==========================================================

function loadCodes() {

    return db.collection("students")
        .get()
        .then(function (snapshot) {

            allCodes = [];


            snapshot.forEach(
                function (doc) {

                    allCodes.push({

                        id: doc.id,

                        ...doc.data()

                    });

                }
            );


            return allCodes;

        });

}


// ==========================================================
// إنشاء كود طالب
// ==========================================================

function createStudentCode() {

    const code =
        getInputValue(
            "newCode"
        );


    const password =
        getInputValue(
            "newPassword"
        );


    const name =
        getInputValue(
            "newName"
        );


    const grade =
        getInputValue(
            "newGrade"
        );


    const days =
        Number(
            getInputValue(
                "subscriptionDays"
            )
        );


    if (!code) {

        alert("❌ اكتب كود الاشتراك");

        return;

    }


    if (!password) {

        alert("❌ اكتب كلمة المرور");

        return;

    }


    if (!name) {

        alert("❌ اكتب اسم الطالب");

        return;

    }


    if (!grade) {

        alert("❌ اختر الصف");

        return;

    }


    if (
        !Number.isFinite(days) ||
        days <= 0
    ) {

        alert("❌ مدة الاشتراك غير صحيحة");

        return;

    }


    const studentRef =
        db.collection("students")
            .doc(code);


    studentRef.get()
        .then(function (doc) {

            if (doc.exists) {

                throw new Error(
                    "EXISTS"
                );

            }


            const expiry =
                new Date();


            expiry.setDate(
                expiry.getDate() +
                days
            );


            return studentRef.set({

                name: name,

                password: password,

                grade: grade,

                active: true,

                expiresAt:
                    firebase.firestore.Timestamp.fromDate(
                        expiry
                    ),

                createdAt:
                    firebase.firestore.FieldValue.serverTimestamp()

            });

        })
        .then(function () {

            alert(
                "✅ تم إنشاء كود الطالب بنجاح"
            );


            clearInputs([

                "newCode",

                "newPassword",

                "newName",

                "newGrade"

            ]);


            return loadStudents();

        })
        .then(function () {

            return loadCodes();

        })
        .then(function () {

            renderStudents();

            renderCodes();

            updateDashboard();

        })
        .catch(function (error) {

            console.error(error);


            if (
                error.message ===
                "EXISTS"
            ) {

                alert(
                    "⚠️ هذا الكود موجود بالفعل"
                );

            }

            else {

                alert(
                    "❌ حدث خطأ أثناء إنشاء كود الطالب"
                );

            }

        });

}


// ==========================================================
// عرض الأكواد
// ==========================================================

function renderCodes() {

    const table =
        document.getElementById(
            "codesTable"
        );


    if (!table) {

        return;

    }


    if (!allCodes.length) {

        table.innerHTML = `

            <tr>

                <td colspan="6">

                    لا توجد أكواد حاليًا

                </td>

            </tr>

        `;

        return;

    }


    table.innerHTML =
        allCodes.map(
            function (student) {

                const expiry =
                    getDate(
                        student.expiresAt
                    );


                const active =
                    isStudentActive(
                        student
                    );


                return `

                    <tr>

                        <td>
                            ${escapeHtml(
                                student.id
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                student.name || "-"
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                student.grade || "-"
                            )}
                        </td>

                        <td>
                            ${
                                active
                                    ? "✅ نشط"
                                    : "⛔ منتهي"
                            }
                        </td>

                        <td>
                            ${
                                expiry
                                    ? formatDate(
                                        expiry
                                    )
                                    : "-"
                            }
                        </td>

                        <td>

                            <button
                                class="admin-btn success-btn"
                                onclick="extendStudent('${escapeJs(
                                    student.id
                                )}')">

                                ➕

                            </button>


                            <button
                                class="admin-btn warning-btn"
                                title="فك الجهاز المرتبط"
                                onclick="unlinkStudentDevice('${escapeJs(
                                    student.id
                                )}')">

                                🔓

                            </button>


                            <button
                                class="admin-btn danger-btn"
                                onclick="deleteStudent('${escapeJs(
                                    student.id
                                )}')">

                                🗑️

                            </button>

                        </td>

                    </tr>

                `;

            }
        )
        .join("");

}


// ==========================================================
// تحميل أولياء الأمور
// ==========================================================

function loadParents() {

    return db.collection("parents")
        .get()
        .then(function (snapshot) {

            allParents = [];


            snapshot.forEach(
                function (doc) {

                    allParents.push({

                        id: doc.id,

                        ...doc.data()

                    });

                }
            );


            return allParents;

        })
        .catch(function (error) {

            console.error(
                "Parents loading error:",
                error
            );


            allParents = [];


            return allParents;

        });

}


// ==========================================================
// إنشاء حساب ولي أمر
// ==========================================================

function createParentCode() {

    const code =
        getInputValue(
            "newParentCode"
        );


    const password =
        getInputValue(
            "newParentPassword"
        );


    const name =
        getInputValue(
            "newParentName"
        );


    const studentCode =
        getInputValue(
            "parentStudentCode"
        );


    const days =
        Number(
            getInputValue(
                "parentSubscriptionDays"
            )
        );


    if (!code) {

        alert(
            "❌ اكتب كود ولي الأمر"
        );

        return;

    }


    if (!password) {

        alert(
            "❌ اكتب كلمة المرور"
        );

        return;

    }


    if (!name) {

        alert(
            "❌ اكتب اسم ولي الأمر"
        );

        return;

    }


    if (!studentCode) {

        alert(
            "❌ اكتب كود الطالب المرتبط"
        );

        return;

    }


    if (
        !Number.isFinite(days) ||
        days <= 0
    ) {

        alert(
            "❌ مدة الاشتراك غير صحيحة"
        );

        return;

    }


    const student =
        allStudents.find(
            function (item) {

                return item.id === studentCode;

            }
        );


    if (!student) {

        alert(
            "❌ كود الطالب غير موجود"
        );

        return;

    }


    const parentRef =
        db.collection("parents")
            .doc(code);


    parentRef.get()
        .then(function (doc) {

            if (doc.exists) {

                throw new Error(
                    "PARENT_EXISTS"
                );

            }


            const expiry =
                new Date();


            expiry.setDate(
                expiry.getDate() +
                days
            );


            return parentRef.set({

                name: name,

                password: password,

                studentCode: studentCode,

                studentName:
                    student.name || "",

                studentGrade:
                    student.grade || "",

                active: true,

                expiresAt:
                    firebase.firestore.Timestamp.fromDate(
                        expiry
                    ),

                createdAt:
                    firebase.firestore.FieldValue.serverTimestamp()

            });

        })
        .then(function () {

            alert(
                "✅ تم إنشاء حساب ولي الأمر"
            );


            clearInputs([

                "newParentCode",

                "newParentPassword",

                "newParentName",

                "parentStudentCode"

            ]);


            return loadParents();

        })
        .then(function () {

            renderParents();

        })
        .catch(function (error) {

            console.error(error);


            if (
                error.message ===
                "PARENT_EXISTS"
            ) {

                alert(
                    "⚠️ كود ولي الأمر موجود بالفعل"
                );

            }

            else {

                alert(
                    "❌ حدث خطأ أثناء إنشاء حساب ولي الأمر"
                );

            }

        });

}


// ==========================================================
// عرض أولياء الأمور
// ==========================================================

function renderParents() {

    const table =
        document.getElementById(
            "parentsTable"
        );


    if (!table) {

        return;

    }


    if (!allParents.length) {

        table.innerHTML = `

            <tr>

                <td colspan="7">

                    لا توجد أكواد أولياء أمور حاليًا

                </td>

            </tr>

        `;

        return;

    }


    table.innerHTML =
        allParents.map(
            function (parent) {

                const expiry =
                    getDate(
                        parent.expiresAt
                    );


                const active =
                    isParentActive(
                        parent
                    );


                return `

                    <tr>

                        <td>
                            ${escapeHtml(
                                parent.id
                            )}
                        </td>


                        <td>
                            ${escapeHtml(
                                parent.name || "-"
                            )}
                        </td>


                        <td>
                            ${escapeHtml(
                                parent.studentName || "-"
                            )}
                        </td>


                        <td>
                            ${escapeHtml(
                                parent.studentCode || "-"
                            )}
                        </td>


                        <td>

                            ${
                                active
                                    ? "✅ نشط"
                                    : "⛔ منتهي"
                            }

                        </td>


                        <td>

                            ${
                                expiry
                                    ? formatDate(
                                        expiry
                                    )
                                    : "-"
                            }

                        </td>


                        <td>

                            <button
                                class="admin-btn primary-btn"
                                title="عرض التفاصيل"
                                onclick="viewParent('${escapeJs(
                                    parent.id
                                )}')">

                                👁️

                            </button>


                            <button
                                class="admin-btn warning-btn"
                                title="${
                                    parent.active === true
                                        ? "إيقاف الحساب"
                                        : "تفعيل الحساب"
                                }"
                                onclick="toggleParentStatus('${escapeJs(
                                    parent.id
                                )}')">

                                ${
                                    parent.active === true
                                        ? "⏸️"
                                        : "▶️"
                                }

                            </button>


                            <button
                                class="admin-btn success-btn"
                                title="تمديد الاشتراك"
                                onclick="extendParent('${escapeJs(
                                    parent.id
                                )}')">

                                ➕

                            </button>


                            <button
                                class="admin-btn primary-btn"
                                title="تغيير كلمة المرور"
                                onclick="changeParentPassword('${escapeJs(
                                    parent.id
                                )}')">

                                🔑

                            </button>


                            <button
                                class="admin-btn danger-btn"
                                title="حذف الطالب"
                                onclick="deleteParent('${escapeJs(
                                    parent.id
                                )}')">

                                🗑️

                            </button>

                        </td>

                    </tr>

                `;

            }
        )
        .join("");

}


// ==========================================================
// عرض تفاصيل ولي الأمر
// ==========================================================

function viewParent(parentCode) {

    const parent =
        allParents.find(
            function (item) {

                return item.id === parentCode;

            }
        );


    if (!parent) {

        alert(
            "❌ ولي الأمر غير موجود"
        );

        return;

    }


    const student =
        allStudents.find(
            function (item) {

                return (
                    item.id ===
                    parent.studentCode
                );

            }
        );


    const expiry =
        getDate(
            parent.expiresAt
        );


    const active =
        isParentActive(
            parent
        );


    const message =
        "👨‍👩‍👦 بيانات ولي الأمر\n\n" +

        "الاسم: " +
        (parent.name || "-") +

        "\nكود ولي الأمر: " +
        (parent.id || "-") +

        "\n\n👨‍🎓 الطالب المرتبط\n\n" +

        "اسم الطالب: " +
        (
            student
                ? student.name
                : parent.studentName || "-"
        ) +

        "\nكود الطالب: " +
        (
            parent.studentCode || "-"
        ) +

        "\nالصف: " +
        (
            student
                ? student.grade
                : parent.studentGrade || "-"
        ) +

        "\n\n📅 تاريخ الانتهاء: " +
        (
            expiry
                ? formatDate(expiry)
                : "-"
        ) +

        "\n📊 الحالة: " +
        (
            active
                ? "✅ نشط"
                : "⛔ غير نشط"
        );


    alert(message);

}


// ==========================================================
// تفعيل / إيقاف حساب ولي الأمر
// ==========================================================

function toggleParentStatus(parentCode) {

    const parent =
        allParents.find(
            function (item) {

                return item.id === parentCode;

            }
        );


    if (!parent) {

        alert(
            "❌ ولي الأمر غير موجود"
        );

        return;

    }


    const newStatus =
        parent.active !== true;


    const actionText =
        newStatus
            ? "تفعيل"
            : "إيقاف";


    const confirmed =
        confirm(
            `⚠️ هل تريد ${actionText} حساب ولي الأمر؟\n\n` +
            `${parent.name || parentCode}`
        );


    if (!confirmed) {

        return;

    }


    db.collection("parents")
        .doc(parentCode)
        .update({

            active: newStatus

        })
        .then(function () {

            parent.active =
                newStatus;


            renderParents();


            alert(
                newStatus
                    ? "✅ تم تفعيل حساب ولي الأمر"
                    : "⏸️ تم إيقاف حساب ولي الأمر"
            );

        })
        .catch(function (error) {

            console.error(error);

            alert(
                "❌ تعذر تغيير حالة ولي الأمر"
            );

        });

}


// ==========================================================
// تغيير كلمة مرور ولي الأمر
// ==========================================================

function changeParentPassword(parentCode) {

    const parent =
        allParents.find(
            function (item) {

                return item.id === parentCode;

            }
        );


    if (!parent) {

        alert(
            "❌ ولي الأمر غير موجود"
        );

        return;

    }


    const newPassword =
        prompt(
            "🔑 اكتب كلمة المرور الجديدة:",
            ""
        );


    if (newPassword === null) {

        return;

    }


    const password =
        String(
            newPassword
        ).trim();


    if (!password) {

        alert(
            "❌ كلمة المرور لا يمكن أن تكون فارغة"
        );

        return;

    }


    if (password.length < 4) {

        alert(
            "❌ كلمة المرور يجب ألا تقل عن 4 أحرف"
        );

        return;

    }


    const confirmed =
        confirm(
            "⚠️ هل تريد تغيير كلمة مرور ولي الأمر؟\n\n" +
            (parent.name || parentCode)
        );


    if (!confirmed) {

        return;

    }


    db.collection("parents")
        .doc(parentCode)
        .update({

            password: password

        })
        .then(function () {

            parent.password =
                password;


            alert(
                "✅ تم تغيير كلمة مرور ولي الأمر بنجاح"
            );

        })
        .catch(function (error) {

            console.error(error);

            alert(
                "❌ تعذر تغيير كلمة المرور"
            );

        });

}


// ==========================================================
// تمديد ولي الأمر
// ==========================================================

function extendParent(parentCode) {

    const parent =
        allParents.find(
            function (item) {

                return item.id === parentCode;

            }
        );


    if (!parent) {

        alert(
            "❌ ولي الأمر غير موجود"
        );

        return;

    }


    const daysText =
        prompt(
            "اكتب عدد الأيام المراد إضافتها:",
            "30"
        );


    if (daysText === null) {

        return;

    }


    const days =
        Number(daysText);


    if (
        !Number.isFinite(days) ||
        days <= 0
    ) {

        alert(
            "❌ عدد الأيام غير صحيح"
        );

        return;

    }


    const expiry =
        getDate(
            parent.expiresAt
        );


    const now =
        new Date();


    const base =
        expiry &&
        expiry > now
            ? expiry
            : now;


    const newExpiry =
        new Date(base);


    newExpiry.setDate(
        newExpiry.getDate() +
        days
    );


    db.collection("parents")
        .doc(parentCode)
        .update({

            active: true,

            expiresAt:
                firebase.firestore.Timestamp.fromDate(
                    newExpiry
                )

        })
        .then(function () {

            alert(
                "✅ تم تمديد اشتراك ولي الأمر"
            );


            return loadParents();

        })
        .then(function () {

            renderParents();

        })
        .catch(function (error) {

            console.error(error);

            alert(
                "❌ تعذر تمديد الاشتراك"
            );

        });

}


// ==========================================================
// حذف ولي الأمر
// ==========================================================

function deleteParent(parentCode) {

    const parent =
        allParents.find(
            function (item) {

                return item.id === parentCode;

            }
        );


    const confirmed =
        confirm(
            "⚠️ هل تريد حذف حساب ولي الأمر؟\n\n" +
            (parent
                ? parent.name
                : parentCode) +
            "\n\nلن يتم حذف الطالب المرتبط."
        );


    if (!confirmed) {

        return;

    }


    db.collection("parents")
        .doc(parentCode)
        .delete()
        .then(function () {

            allParents =
                allParents.filter(
                    function (parent) {

                        return (
                            parent.id !==
                            parentCode
                        );

                    }
                );


            renderParents();


            alert(
                "✅ تم حذف حساب ولي الأمر"
            );

        })
        .catch(function (error) {

            console.error(error);

            alert(
                "❌ تعذر حذف الحساب"
            );

        });

}


// ==========================================================
// تحميل النتائج
// ==========================================================

function loadResults() {

    return db.collection("results")
        .get()
        .then(function (snapshot) {

            allResults = [];


            snapshot.forEach(
                function (doc) {

                    allResults.push({

                        id: doc.id,

                        ...doc.data()

                    });

                }
            );


            allResults.sort(
                function (a, b) {

                    const dateA =
                        getDate(
                            a.createdAt
                        ) || new Date(0);


                    const dateB =
                        getDate(
                            b.createdAt
                        ) || new Date(0);


                    return (
                        dateB.getTime() -
                        dateA.getTime()
                    );

                }
            );


            return allResults;

        });

}


// ==========================================================
// عرض النتائج
// ==========================================================

function renderAdminResults() {

    const container =
        document.getElementById(
            "resultsTable"
        );


    if (!container) {

        return;

    }


    if (!allResults.length) {

        container.innerHTML = `

            <div class="loading">

                📝 لا توجد نتائج حتى الآن

            </div>

        `;

        return;

    }


    container.innerHTML = `

        <table>

            <thead>

                <tr>

                    <th>#</th>

                    <th>الطالب</th>

                    <th>المادة</th>

                    <th>Chapter</th>

                    <th>الدرجة</th>

                    <th>النسبة</th>

                    <th>التاريخ</th>

                </tr>

            </thead>


            <tbody>

                ${
                    allResults
                        .map(
                            function (result, index) {

                                const student =
                                    allStudents.find(
                                        function (item) {

                                            return (
                                                item.id ===
                                                result.studentCode
                                            );

                                        }
                                    );


                                return `

                                    <tr>

                                        <td>
                                            ${index + 1}
                                        </td>


                                        <td>

                                            ${escapeHtml(
                                                student
                                                    ? student.name
                                                    : result.studentCode || "-"
                                            )}

                                            <br>

                                            <small>

                                                ${escapeHtml(
                                                    result.studentCode || ""
                                                )}

                                            </small>

                                        </td>


                                        <td>

                                            ${escapeHtml(
                                                result.subject || "-"
                                            )}

                                        </td>


                                        <td>

                                            ${escapeHtml(
                                                result.chapter || "-"
                                            )}

                                        </td>


                                        <td>

                                            ${result.score ?? 0}
                                            /
                                            ${result.total ?? 0}

                                        </td>


                                        <td>

                                            ${getPercentage(
                                                result
                                            )}%

                                        </td>


                                        <td>

                                            ${formatDateTime(
                                                result.createdAt
                                            )}

                                        </td>

                                    </tr>

                                `;

                            }
                        )
                        .join("")
                }

            </tbody>

        </table>

    `;

}


// ==========================================================
// Leaderboard
// ==========================================================

function loadLeaderboard() {

    const scores = {};


    allResults.forEach(
        function (result) {

            const code =
                result.studentCode;


            if (!code) {

                return;

            }


            const percentage =
                getPercentage(
                    result
                );


            if (!scores[code]) {

                scores[code] = {

                    studentCode:
                        code,

                    totalTests: 0,

                    totalScore: 0,

                    average: 0,

                    bestScore: 0

                };

            }


            scores[code].totalTests++;

            scores[code].totalScore +=
                percentage;


            scores[code].bestScore =
                Math.max(
                    scores[code].bestScore,
                    percentage
                );

        }
    );


    allLeaderboard =
        Object.values(scores);


    allLeaderboard.forEach(
        function (item) {

            item.average =
                Math.round(
                    item.totalScore /
                    item.totalTests
                );


            const student =
                allStudents.find(
                    function (s) {

                        return (
                            s.id ===
                            item.studentCode
                        );

                    }
                );


            item.name =
                student
                    ? student.name
                    : "طالب";


            item.grade =
                student
                    ? student.grade
                    : "-";

        }
    );


    allLeaderboard.sort(
        function (a, b) {

            if (
                b.average !==
                a.average
            ) {

                return (
                    b.average -
                    a.average
                );

            }


            if (
                b.bestScore !==
                a.bestScore
            ) {

                return (
                    b.bestScore -
                    a.bestScore
                );

            }


            return (
                b.totalTests -
                a.totalTests
            );

        }
    );


    allLeaderboard.forEach(
        function (item, index) {

            item.rank =
                index + 1;

        }
    );


    return allLeaderboard;

}


// ==========================================================
// عرض Leaderboard
// ==========================================================

function renderLeaderboard() {

    const container =
        document.getElementById(
            "leaderboardTable"
        );


    if (!container) {

        return;

    }


    if (!allLeaderboard.length) {

        container.innerHTML = `

            <div class="loading">

                🏆 لا توجد بيانات للترتيب حتى الآن

            </div>

        `;

        return;

    }


    container.innerHTML = `

        <table>

            <thead>

                <tr>

                    <th>المركز</th>

                    <th>الطالب</th>

                    <th>الصف</th>

                    <th>الاختبارات</th>

                    <th>المتوسط</th>

                    <th>أفضل نتيجة</th>

                </tr>

            </thead>


            <tbody>

                ${
                    allLeaderboard
                        .map(
                            function (item) {

                                let medal = "";


                                if (
                                    item.rank === 1
                                ) {

                                    medal = "🥇";

                                }

                                else if (
                                    item.rank === 2
                                ) {

                                    medal = "🥈";

                                }

                                else if (
                                    item.rank === 3
                                ) {

                                    medal = "🥉";

                                }


                                return `

                                    <tr>

                                        <td>

                                            ${medal}
                                            ${item.rank}

                                        </td>


                                        <td>

                                            ${escapeHtml(
                                                item.name
                                            )}

                                            <br>

                                            <small>

                                                ${escapeHtml(
                                                    item.studentCode
                                                )}

                                            </small>

                                        </td>


                                        <td>

                                            ${escapeHtml(
                                                item.grade
                                            )}

                                        </td>


                                        <td>

                                            ${item.totalTests}

                                        </td>


                                        <td>

                                            ${item.average}%

                                        </td>


                                        <td>

                                            ${item.bestScore}%

                                        </td>

                                    </tr>

                                `;

                            }
                        )
                        .join("")
                }

            </tbody>

        </table>

    `;

}


// ==========================================================
// تحميل المحتوى
// ==========================================================

function loadContent() {

    return db.collection("content")
        .get()
        .then(function (snapshot) {

            allContent = [];


            snapshot.forEach(
                function (doc) {

                    allContent.push({

                        id: doc.id,

                        ...doc.data()

                    });

                }
            );


            allContent.sort(
                function (a, b) {

                    const dateA =
                        getDate(
                            a.createdAt
                        ) || new Date(0);


                    const dateB =
                        getDate(
                            b.createdAt
                        ) || new Date(0);


                    return (
                        dateB.getTime() -
                        dateA.getTime()
                    );

                }
            );


            return allContent;

        });

}


// ==========================================================
// إنشاء محتوى
// ==========================================================

function createContent() {

    const grade =
        getInputValue(
            "contentGrade"
        );


    const subject =
        getInputValue(
            "contentSubject"
        );


    const chapter =
        getInputValue(
            "contentChapter"
        );


    const title =
        getInputValue(
            "contentTitle"
        );


    const type =
        getInputValue(
            "contentType"
        );


    const url =
        getInputValue(
            "contentUrl"
        );


    if (!grade) {

        alert("❌ اختر الصف");

        return;

    }


    if (!subject) {

        alert("❌ اختر المادة");

        return;

    }


    if (!chapter) {

        alert("❌ اكتب الـ Chapter");

        return;

    }


    if (!title) {

        alert("❌ اكتب عنوان المحتوى");

        return;

    }


    if (!type) {

        alert("❌ اختر نوع المحتوى");

        return;

    }


    if (!url) {

        alert("❌ اكتب الرابط");

        return;

    }


    db.collection("content")
        .add({

            grade: grade,

            subject: subject,

            chapter: chapter,

            title: title,

            type: type,

            url: url,

            active: true,

            createdAt:
                firebase.firestore.FieldValue.serverTimestamp()

        })
        .then(function () {

            alert(
                "✅ تم إضافة المحتوى بنجاح"
            );


            clearInputs([

                "contentGrade",

                "contentChapter",

                "contentTitle",

                "contentType",

                "contentUrl"

            ]);


            return loadContent();

        })
        .then(function () {

            renderContent();

        })
        .catch(function (error) {

            console.error(error);

            alert(
                "❌ تعذر إضافة المحتوى"
            );

        });

}


// ==========================================================
// عرض المحتوى
// ==========================================================

function renderContent() {

    const table =
        document.getElementById(
            "contentTable"
        );


    if (!table) {

        return;

    }


    const filterSubject =
        getInputValue(
            "filterSubject"
        );


    const filterGrade =
        getInputValue(
            "filterGrade"
        );


    let content =
        [...allContent];


    if (filterSubject) {

        content =
            content.filter(
                function (item) {

                    return (
                        item.subject ===
                        filterSubject
                    );

                }
            );

    }


    if (filterGrade) {

        content =
            content.filter(
                function (item) {

                    return (
                        item.grade ===
                        filterGrade
                    );

                }
            );

    }


    if (!content.length) {

        table.innerHTML = `

            <tr>

                <td colspan="7">

                    لا يوجد محتوى

                </td>

            </tr>

        `;

        return;

    }


    table.innerHTML =
        content.map(
            function (item) {

                return `

                    <tr>

                        <td>

                            ${escapeHtml(
                                item.grade || "-"
                            )}

                        </td>


                        <td>

                            ${escapeHtml(
                                item.subject || "-"
                            )}

                        </td>


                        <td>

                            ${escapeHtml(
                                item.chapter || "-"
                            )}

                        </td>


                        <td>

                            ${escapeHtml(
                                item.title || "-"
                            )}

                        </td>


                        <td>

                            ${getContentType(
                                item.type
                            )}

                        </td>


                        <td>

                            ${
                                item.active === false
                                    ? "⛔ مخفي"
                                    : "✅ ظاهر"
                            }

                        </td>


                        <td>

                            <button
                                class="admin-btn success-btn"
                                onclick="toggleContent('${escapeJs(
                                    item.id
                                )}')">

                                ${
                                    item.active === false
                                        ? "👁️"
                                        : "🙈"
                                }

                            </button>


                            <button
                                class="admin-btn danger-btn"
                                onclick="deleteContent('${escapeJs(
                                    item.id
                                )}')">

                                🗑️

                            </button>

                        </td>

                    </tr>

                `;

            }
        )
        .join("");

}


// ==========================================================
// تغيير حالة المحتوى
// ==========================================================

function toggleContent(contentId) {

    const item =
        allContent.find(
            function (content) {

                return content.id === contentId;

            }
        );


    if (!item) {

        return;

    }


    const newState =
        item.active === false;


    db.collection("content")
        .doc(contentId)
        .update({

            active: newState

        })
        .then(function () {

            item.active =
                newState;


            renderContent();


        })
        .catch(function (error) {

            console.error(error);

            alert(
                "❌ تعذر تغيير حالة المحتوى"
            );

        });

}


// ==========================================================
// حذف المحتوى
// ==========================================================

function deleteContent(contentId) {

    const confirmed =
        confirm(
            "⚠️ هل تريد حذف هذا المحتوى؟"
        );


    if (!confirmed) {

        return;

    }


    db.collection("content")
        .doc(contentId)
        .delete()
        .then(function () {

            allContent =
                allContent.filter(
                    function (item) {

                        return (
                            item.id !==
                            contentId
                        );

                    }
                );


            renderContent();


            alert(
                "✅ تم حذف المحتوى"
            );

        })
        .catch(function (error) {

            console.error(error);

            alert(
                "❌ تعذر حذف المحتوى"
            );

        });

}


// ==========================================================
// تحميل الإشعارات
// ==========================================================

function loadNotifications() {

    return db.collection("notifications")
        .get()
        .then(function (snapshot) {

            allNotifications = [];


            snapshot.forEach(
                function (doc) {

                    allNotifications.push({

                        id: doc.id,

                        ...doc.data()

                    });

                }
            );


            allNotifications.sort(
                function (a, b) {

                    const dateA =
                        getDate(
                            a.createdAt
                        ) || new Date(0);


                    const dateB =
                        getDate(
                            b.createdAt
                        ) || new Date(0);


                    return (
                        dateB.getTime() -
                        dateA.getTime()
                    );

                }
            );


            return allNotifications;

        });

}


// ==========================================================
// إنشاء إشعار
// ==========================================================

function createNotification() {

    const targetType =
        getInputValue(
            "notificationTargetType"
        );


    const targetId =
        getInputValue(
            "notificationTargetId"
        );


    const title =
        getInputValue(
            "notificationTitle"
        );


    const message =
        getInputValue(
            "notificationMessage"
        );


    if (!targetType) {

        alert(
            "❌ اختر نوع الإشعار"
        );

        return;

    }


    if (
        targetType !== "all" &&
        !targetId
    ) {

        alert(
            "❌ اكتب الهدف"
        );

        return;

    }


    if (!title) {

        alert(
            "❌ اكتب عنوان الإشعار"
        );

        return;

    }


    if (!message) {

        alert(
            "❌ اكتب رسالة الإشعار"
        );

        return;

    }


    db.collection("notifications")
        .add({

            targetType:
                targetType,

            targetId:
                targetType === "all"
                    ? ""
                    : targetId,

            title:
                title,

            message:
                message,

            createdAt:
                firebase.firestore.FieldValue.serverTimestamp(),

            createdBy:
                currentAdmin
                    ? currentAdmin.uid
                    : ""

        })
        .then(function () {

            alert(
                "✅ تم إرسال الإشعار بنجاح"
            );


            clearInputs([

                "notificationTargetId",

                "notificationTitle",

                "notificationMessage"

            ]);


            const targetTypeElement =
                document.getElementById(
                    "notificationTargetType"
                );


            if (targetTypeElement) {

                targetTypeElement.value =
                    "all";

            }


            const targetInput =
                document.getElementById(
                    "notificationTargetId"
                );


            if (targetInput) {

                targetInput.style.display =
                    "none";

            }


            return loadNotifications();

        })
        .then(function () {

            renderNotificationsAdmin();

        })
        .catch(function (error) {

            console.error(error);

            alert(
                "❌ تعذر إرسال الإشعار"
            );

        });

}


// ==========================================================
// عرض الإشعارات
// ==========================================================

function renderNotificationsAdmin() {

    const table =
        document.getElementById(
            "notificationsTable"
        );


    if (!table) {

        return;

    }


    if (!allNotifications.length) {

        table.innerHTML = `

            <tr>

                <td colspan="5">

                    🔕 لا توجد إشعارات

                </td>

            </tr>

        `;

        return;

    }


    table.innerHTML =
        allNotifications.map(
            function (notification) {

                return `

                    <tr>

                        <td>

                            ${escapeHtml(
                                notification.title ||
                                "-"
                            )}

                        </td>


                        <td>

                            ${escapeHtml(
                                notification.message ||
                                "-"
                            )}

                        </td>


                        <td>

                            ${getNotificationTarget(
                                notification
                            )}

                        </td>


                        <td>

                            ${formatDateTime(
                                notification.createdAt
                            )}

                        </td>


                        <td>

                            <button
                                class="admin-btn danger-btn"
                                onclick="deleteNotification('${escapeJs(
                                    notification.id
                                )}')">

                                🗑️

                            </button>

                        </td>

                    </tr>

                `;

            }
        )
        .join("");

}


// ==========================================================
// تحديد هدف الإشعار
// ==========================================================

function getNotificationTarget(
    notification
) {

    const type =
        notification.targetType ||
        "all";


    if (type === "all") {

        return "📢 كل الطلاب";

    }


    if (type === "grade") {

        return (
            "🎓 " +
            escapeHtml(
                notification.targetId ||
                "-"
            )
        );

    }


    if (type === "student") {

        return (
            "👤 " +
            escapeHtml(
                notification.targetId ||
                "-"
            )
        );

    }


    return "-";

}


// ==========================================================
// حذف إشعار
// ==========================================================

function deleteNotification(
    notificationId
) {

    const confirmed =
        confirm(
            "⚠️ هل تريد حذف هذا الإشعار؟"
        );


    if (!confirmed) {

        return;

    }


    db.collection("notifications")
        .doc(notificationId)
        .delete()
        .then(function () {

            allNotifications =
                allNotifications.filter(
                    function (item) {

                        return (
                            item.id !==
                            notificationId
                        );

                    }
                );


            renderNotificationsAdmin();


            alert(
                "✅ تم حذف الإشعار"
            );

        })
        .catch(function (error) {

            console.error(error);

            alert(
                "❌ تعذر حذف الإشعار"
            );

        });

}


// ==========================================================
// Dashboard Statistics
// ==========================================================

function updateDashboard() {

    const totalStudents =
        allStudents.length;


    const activeStudents =
        allStudents.filter(
            function (student) {

                return isStudentActive(
                    student
                );

            }
        ).length;


    const expiredStudents =
        totalStudents -
        activeStudents;


    const totalResults =
        allResults.length;


    let average =
        0;


    if (totalResults > 0) {

        let sum = 0;


        allResults.forEach(
            function (result) {

                sum +=
                    getPercentage(
                        result
                    );

            }
        );


        average =
            Math.round(
                sum /
                totalResults
            );

    }


    setText(
        "totalStudents",
        totalStudents
    );


    setText(
        "activeStudents",
        activeStudents
    );


    setText(
        "expiredStudents",
        expiredStudents
    );


    setText(
        "totalResults",
        totalResults
    );


    setText(
        "averageScore",
        average + "%"
    );

}


// ==========================================================
// حالة الطالب
// ==========================================================

function isStudentActive(
    student
) {

    if (
        student.active !== true
    ) {

        return false;

    }


    const expiry =
        getDate(
            student.expiresAt
        );


    if (!expiry) {

        return false;

    }


    return (
        new Date() <
        expiry
    );

}


// ==========================================================
// حالة ولي الأمر
// ==========================================================

function isParentActive(
    parent
) {

    if (
        parent.active !== true
    ) {

        return false;

    }


    const expiry =
        getDate(
            parent.expiresAt
        );


    if (!expiry) {

        return false;

    }


    return (
        new Date() <
        expiry
    );

}


// ==========================================================
// نوع المحتوى
// ==========================================================

function getContentType(type) {

    switch (type) {

        case "pdf":

            return "📄 PDF";


        case "video":

            return "🎬 فيديو";


        case "quiz":

            return "📝 اختبار";


        case "chapter":

            return "📚 Chapter";


        default:

            return escapeHtml(
                type || "-"
            );

    }

}


// ==========================================================
// حساب النسبة
// ==========================================================

function getPercentage(data) {

    if (
        data.percentage !== undefined &&
        data.percentage !== null
    ) {

        const value =
            Number(
                data.percentage
            );


        return isNaN(value)
            ? 0
            : Math.round(value);

    }


    const score =
        Number(
            data.score
        );


    const total =
        Number(
            data.total
        );


    if (
        total > 0 &&
        !isNaN(score)
    ) {

        return Math.round(
            (score / total) *
            100
        );

    }


    return 0;

}


// ==========================================================
// التاريخ
// ==========================================================

function getDate(value) {

    if (!value) {

        return null;

    }


    if (
        typeof value.toDate ===
        "function"
    ) {

        return value.toDate();

    }


    if (
        value.seconds !== undefined
    ) {

        return new Date(
            value.seconds * 1000
        );

    }


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


// ==========================================================
// تنسيق التاريخ
// ==========================================================

function formatDate(value) {

    const date =
        getDate(value);


    if (!date) {

        return "-";

    }


    return date.toLocaleDateString(
        "ar-EG",
        {

            year: "numeric",

            month: "2-digit",

            day: "2-digit"

        }
    );

}


// ==========================================================
// تنسيق التاريخ والوقت
// ==========================================================

function formatDateTime(value) {

    const date =
        getDate(value);


    if (!date) {

        return "-";

    }


    return date.toLocaleString(
        "ar-EG",
        {

            year: "numeric",

            month: "2-digit",

            day: "2-digit",

            hour: "2-digit",

            minute: "2-digit"

        }
    );

}


// ==========================================================
// قراءة Input
// ==========================================================

function getInputValue(id) {

    const element =
        document.getElementById(id);


    if (!element) {

        return "";

    }


    return String(
        element.value || ""
    ).trim();

}


// ==========================================================
// مسح Inputs
// ==========================================================

function clearInputs(ids) {

    ids.forEach(
        function (id) {

            const element =
                document.getElementById(id);


            if (element) {

                element.value = "";

            }

        }
    );

}


// ==========================================================
// تغيير النص
// ==========================================================

function setText(id, value) {

    const element =
        document.getElementById(id);


    if (element) {

        element.textContent =
            value;

    }

}


// ==========================================================
// حماية HTML
// ==========================================================

function escapeHtml(value) {

    return String(
        value ?? ""
    )

    .replace(
        /&/g,
        "&amp;"
    )

    .replace(
        /</g,
        "&lt;"
    )

    .replace(
        />/g,
        "&gt;"
    )

    .replace(
        /"/g,
        "&quot;"
    )

    .replace(
        /'/g,
        "&#039;"
    );

}


// ==========================================================
// حماية JavaScript
// ==========================================================

function escapeJs(value) {

    return String(
        value ?? ""
    )

    .replace(
        /\\/g,
        "\\\\"
    )

    .replace(
        /'/g,
        "\\'"
    )

    .replace(
        /"/g,
        '\\"'
    )

    .replace(
        /\r?\n/g,
        "\\n"
    );

}


// ==========================================================
// تسجيل خروج الأدمن
// ==========================================================

function logoutAdmin() {

    firebase.auth()
        .signOut()
        .then(function () {

            window.location.replace(
                "index.html"
            );

        })
        .catch(function (error) {

            console.error(error);

            alert(
                "❌ حدث خطأ أثناء تسجيل الخروج"
            );

        });

}
