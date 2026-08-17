// ==========================================================
// بوابة التمريض
// ADMIN PANEL V2
// ==========================================================

// ==========================================================
// ADMIN SETTINGS
// ==========================================================

const ADMIN_UIDS = [
    "H4wMJm2ComSSy19ttzb1KxZz7Yu1"
];


// ==========================================================
// GLOBAL DATA
// ==========================================================

let allStudents = [];
let allCodes = [];
let allParents = [];
let allResults = [];
let allContent = [];
let allNotifications = [];
let allLeaderboard = [];

let currentAdmin = null;
let currentStudent = null;
let currentParent = null;


// ==========================================================
// DOM READY
// ==========================================================

document.addEventListener("DOMContentLoaded", function () {

    initializeAdmin();

    setupAdminEvents();

    injectAdminModals();

});


// ==========================================================
// ADMIN AUTH
// ==========================================================

function initializeAdmin() {

    const loading = document.getElementById("loading");
    const denied = document.getElementById("accessDenied");
    const panel = document.getElementById("adminPanel");

    firebase.auth().onAuthStateChanged(function (user) {

        if (!user) {

            showAccessDenied();

            return;

        }

        currentAdmin = user;

        if (!ADMIN_UIDS.includes(user.uid)) {

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

    });

}


// ==========================================================
// ACCESS DENIED
// ==========================================================

function showAccessDenied() {

    const loading = document.getElementById("loading");
    const denied = document.getElementById("accessDenied");
    const panel = document.getElementById("adminPanel");

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
// LOAD ALL ADMIN DATA
// ==========================================================

function loadAdminData() {

    Promise.all([

        loadStudents(),
        loadParents(),
        loadResults(),
        loadContent(),
        loadNotifications()

    ])
    .then(function () {

        loadCodes();

        calculateLeaderboard();

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
// NAVIGATION
// ==========================================================

function showSection(sectionId) {

    const sections =
        document.querySelectorAll(".section");

    sections.forEach(function (section) {

        section.classList.remove("active");

    });

    const target =
        document.getElementById(sectionId);

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
// EVENTS
// ==========================================================

function setupAdminEvents() {

    const studentSearch =
        document.getElementById("studentSearch");

    if (studentSearch) {

        studentSearch.addEventListener(
            "input",
            function () {

                renderStudents(this.value);

            }
        );

    }


    const filterSubject =
        document.getElementById("filterSubject");

    const filterGrade =
        document.getElementById("filterGrade");

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

                if (this.value === "all") {

                    target.style.display = "none";
                    target.value = "";

                } else {

                    target.style.display = "block";

                    if (this.value === "grade") {

                        target.placeholder =
                            "اكتب الصف مثل: الصف الأول الثانوي التمريض";

                    } else {

                        target.placeholder =
                            "اكتب كود الطالب";

                    }

                }

            }
        );

    }

}


// ==========================================================
// STUDENTS
// ==========================================================

function loadStudents() {

    return db.collection("students")
        .get()
        .then(function (snapshot) {

            allStudents = [];

            snapshot.forEach(function (doc) {

                allStudents.push({
                    id: doc.id,
                    ...doc.data()
                });

            });

            return allStudents;

        });

}


// ==========================================================
// RENDER STUDENTS
// ==========================================================

function renderStudents(searchText) {

    const table =
        document.getElementById("studentsTable");

    if (!table) {
        return;
    }

    let students = [...allStudents];

    const search =
        String(searchText || "")
            .trim()
            .toLowerCase();

    if (search) {

        students = students.filter(function (student) {

            return (

                String(student.id || "")
                    .toLowerCase()
                    .includes(search)

                ||

                String(student.name || "")
                    .toLowerCase()
                    .includes(search)

                ||

                String(student.email || "")
                    .toLowerCase()
                    .includes(search)

                ||

                String(student.grade || "")
                    .toLowerCase()
                    .includes(search)

            );

        });

    }

    if (!students.length) {

        table.innerHTML = `
            <tr>
                <td colspan="7">
                    لا يوجد طلاب
                </td>
            </tr>
        `;

        return;

    }

    table.innerHTML =
        students.map(function (student) {

            const active =
                isStudentActive(student);

            const expiry =
                getDate(student.expiresAt);

            return `

                <tr>

                    <td>
                        ${escapeHtml(student.id)}
                    </td>

                    <td>
                        ${escapeHtml(student.name || "-")}
                    </td>

                    <td>
                        ${escapeHtml(student.grade || "-")}
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
                        ${
                            student.deviceId
                                ? "📱 مرتبط"
                                : "📵 غير مرتبط"
                        }
                    </td>

                    <td class="admin-actions">

                        <button
                            class="admin-btn primary-btn"
                            title="التفاصيل"
                            onclick="openStudentManager('${escapeJs(student.id)}')">
                            👁️
                        </button>

                        <button
                            class="admin-btn primary-btn"
                            title="تعديل"
                            onclick="editStudent('${escapeJs(student.id)}')">
                            ✏️
                        </button>

                        <button
                            class="admin-btn warning-btn"
                            title="الجهاز"
                            onclick="manageStudentDevice('${escapeJs(student.id)}')">
                            📱
                        </button>

                        <button
                            class="admin-btn warning-btn"
                            title="${
                                student.active === true
                                    ? "إيقاف"
                                    : "تفعيل"
                            }"
                            onclick="toggleStudentStatus('${escapeJs(student.id)}')">
                            ${
                                student.active === true
                                    ? "⏸️"
                                    : "▶️"
                            }
                        </button>

                        <button
                            class="admin-btn success-btn"
                            title="تمديد"
                            onclick="extendStudent('${escapeJs(student.id)}')">
                            ➕
                        </button>

                        <button
                            class="admin-btn primary-btn"
                            title="تغيير كلمة المرور"
                            onclick="changeStudentPassword('${escapeJs(student.id)}')">
                            🔑
                        </button>

                        <button
                            class="admin-btn danger-btn"
                            title="حذف"
                            onclick="deleteStudent('${escapeJs(student.id)}')">
                            🗑️
                        </button>

                    </td>

                </tr>

            `;

        }).join("");

}


// ==========================================================
// STUDENT FULL MANAGEMENT
// ==========================================================

function openStudentManager(studentCode) {

    const student =
        allStudents.find(function (item) {

            return item.id === studentCode;

        });

    if (!student) {

        alert("❌ الطالب غير موجود");

        return;

    }

    currentStudent = student;

    const expiry =
        getDate(student.expiresAt);

    const created =
        getDate(student.createdAt);

    const results =
        allResults.filter(function (result) {

            return result.studentCode === studentCode;

        });

    const average =
        calculateStudentAverage(results);

    const best =
        calculateBestScore(results);

    const days =
        getRemainingDays(expiry);

    const modal =
        document.getElementById("studentManagerModal");

    const body =
        document.getElementById("studentManagerBody");

    if (!modal || !body) {
        return;
    }

    body.innerHTML = `

        <div class="admin-modal-header">

            <div>
                <h2>👨‍🎓 إدارة الطالب</h2>
                <p>
                    ${escapeHtml(student.name || "-")}
                </p>
            </div>

            <button
                class="modal-close"
                onclick="closeAdminModal('studentManagerModal')">
                ✕
            </button>

        </div>


        <div class="admin-info-grid">

            ${adminInfo(
                "👨‍🎓 الاسم",
                student.name || "-"
            )}

            ${adminInfo(
                "🔑 الكود",
                student.id
            )}

            ${adminInfo(
                "🎓 الصف",
                student.grade || "-"
            )}

            ${adminInfo(
                "📧 البريد",
                student.email || "-"
            )}

            ${adminInfo(
                "📅 تاريخ الإنشاء",
                created ? formatDateTime(created) : "-"
            )}

            ${adminInfo(
                "📅 تاريخ الانتهاء",
                expiry ? formatDate(expiry) : "-"
            )}

            ${adminInfo(
                "⏳ الأيام المتبقية",
                days >= 0
                    ? days + " يوم"
                    : "منتهي"
            )}

            ${adminInfo(
                "📊 حالة الحساب",
                isStudentActive(student)
                    ? "✅ نشط"
                    : "⛔ غير نشط"
            )}

            ${adminInfo(
                "📱 الجهاز المرتبط",
                student.deviceId
                    ? "✅ نعم"
                    : "❌ لا"
            )}

            ${adminInfo(
                "Device ID",
                student.deviceId || "غير مرتبط"
            )}

            ${adminInfo(
                "📝 عدد الاختبارات",
                results.length
            )}

            ${adminInfo(
                "📊 المتوسط",
                average + "%"
            )}

            ${adminInfo(
                "🏆 أفضل نتيجة",
                best + "%"
            )}

        </div>


        <div class="admin-management-actions">

            <button
                class="admin-btn primary-btn"
                onclick="editStudent('${escapeJs(student.id)}')">
                ✏️ تعديل البيانات
            </button>

            <button
                class="admin-btn warning-btn"
                onclick="manageStudentDevice('${escapeJs(student.id)}')">
                📱 إدارة الجهاز
            </button>

            <button
                class="admin-btn ${
                    student.active === true
                        ? "warning-btn"
                        : "success-btn"
                }"
                onclick="toggleStudentStatus('${escapeJs(student.id)}')">
                ${
                    student.active === true
                        ? "⏸️ إيقاف"
                        : "▶️ تفعيل"
                }
            </button>

            <button
                class="admin-btn success-btn"
                onclick="extendStudent('${escapeJs(student.id)}')">
                ➕ تمديد
            </button>

            <button
                class="admin-btn primary-btn"
                onclick="changeStudentPassword('${escapeJs(student.id)}')">
                🔑 تغيير كلمة المرور
            </button>

            <button
                class="admin-btn danger-btn"
                onclick="deleteStudent('${escapeJs(student.id)}')">
                🗑️ حذف
            </button>

        </div>


        <div class="admin-subsection">

            <h3>📝 آخر النتائج</h3>

            ${
                renderStudentResultsHtml(
                    results
                )
            }

        </div>

    `;

    modal.classList.remove("hidden");

}


// ==========================================================
// STUDENT RESULTS
// ==========================================================

function renderStudentResultsHtml(results) {

    if (!results.length) {

        return `
            <div class="admin-empty">
                📝 لا توجد نتائج حتى الآن
            </div>
        `;

    }

    return `

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
                        results
                            .slice(0, 10)
                            .map(function (result) {

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
                                            ${getPercentage(result)}%
                                        </td>

                                        <td>
                                            ${formatDateTime(
                                                result.createdAt
                                            )}
                                        </td>

                                    </tr>

                                `;

                            })
                            .join("")
                    }

                </tbody>

            </table>

        </div>

    `;

}


// ==========================================================
// EDIT STUDENT
// ==========================================================

function editStudent(studentCode) {

    const student =
        allStudents.find(function (item) {

            return item.id === studentCode;

        });

    if (!student) {
        return;
    }

    const modal =
        document.getElementById("editStudentModal");

    const body =
        document.getElementById("editStudentBody");

    if (!modal || !body) {
        return;
    }

    body.innerHTML = `

        <div class="admin-modal-header">

            <h2>✏️ تعديل بيانات الطالب</h2>

            <button
                class="modal-close"
                onclick="closeAdminModal('editStudentModal')">
                ✕
            </button>

        </div>

        <div class="admin-form-grid">

            <div>
                <label>اسم الطالب</label>

                <input
                    id="editStudentName"
                    value="${escapeHtml(student.name || "")}"
                >
            </div>

            <div>
                <label>الصف</label>

                <input
                    id="editStudentGrade"
                    value="${escapeHtml(student.grade || "")}"
                >
            </div>

            <div>
                <label>البريد الإلكتروني</label>

                <input
                    id="editStudentEmail"
                    value="${escapeHtml(student.email || "")}"
                >
            </div>

        </div>

        <div class="admin-modal-actions">

            <button
                class="admin-btn success-btn"
                onclick="saveStudentEdit('${escapeJs(student.id)}')">
                💾 حفظ التعديلات
            </button>

            <button
                class="admin-btn secondary-btn"
                onclick="closeAdminModal('editStudentModal')">
                إلغاء
            </button>

        </div>

    `;

    modal.classList.remove("hidden");

}


// ==========================================================
// SAVE STUDENT EDIT
// ==========================================================

function saveStudentEdit(studentCode) {

    const name =
        getInputValue("editStudentName");

    const grade =
        getInputValue("editStudentGrade");

    const email =
        getInputValue("editStudentEmail");

    if (!name) {

        alert("❌ اسم الطالب مطلوب");

        return;

    }

    if (!grade) {

        alert("❌ الصف مطلوب");

        return;

    }

    db.collection("students")
        .doc(studentCode)
        .update({

            name: name,
            grade: grade,
            email: email

        })
        .then(function () {

            const student =
                allStudents.find(function (item) {

                    return item.id === studentCode;

                });

            if (student) {

                student.name = name;
                student.grade = grade;
                student.email = email;

            }

            closeAdminModal("editStudentModal");

            renderStudents();

            updateDashboard();

            if (currentStudent &&
                currentStudent.id === studentCode) {

                openStudentManager(studentCode);

            }

            alert("✅ تم تعديل بيانات الطالب");

        })
        .catch(function (error) {

            console.error(error);

            alert(
                "❌ تعذر تعديل بيانات الطالب"
            );

        });

}


// ==========================================================
// DEVICE MANAGEMENT
// ==========================================================

function manageStudentDevice(studentCode) {

    const student =
        allStudents.find(function (item) {

            return item.id === studentCode;

        });

    if (!student) {
        return;
    }

    const device =
        student.deviceId || "";

    const action =
        prompt(
            "📱 إدارة جهاز الطالب\n\n" +
            "Device ID الحالي:\n" +
            (device || "غير مرتبط") +
            "\n\n" +
            "اكتب Device ID جديد لربطه، أو اكتب REMOVE لفك الجهاز:",
            ""
        );

    if (action === null) {
        return;
    }

    const value =
        String(action).trim();

    if (
        value.toUpperCase() === "REMOVE" ||
        value === ""
    ) {

        if (!device) {

            alert("ℹ️ لا يوجد جهاز مرتبط");

            return;

        }

        unlinkStudentDevice(studentCode);

        return;

    }

    db.collection("students")
        .doc(studentCode)
        .update({

            deviceId: value

        })
        .then(function () {

            student.deviceId = value;

            renderStudents();

            if (
                currentStudent &&
                currentStudent.id === studentCode
            ) {

                openStudentManager(studentCode);

            }

            alert(
                "✅ تم تحديث الجهاز المرتبط"
            );

        })
        .catch(function (error) {

            console.error(error);

            alert(
                "❌ تعذر تحديث الجهاز"
            );

        });

}


// ==========================================================
// UNLINK DEVICE
// ==========================================================

function unlinkStudentDevice(studentCode) {

    const student =
        allStudents.find(function (item) {

            return item.id === studentCode;

        });

    if (!student) {

        alert("❌ الطالب غير موجود");

        return;

    }

    if (!student.deviceId) {

        alert(
            "ℹ️ لا يوجد جهاز مرتبط بهذا الطالب"
        );

        return;

    }

    const confirmed =
        confirm(
            "📱 هل تريد فك الجهاز المرتبط؟\n\n" +
            "الطالب: " +
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

            renderStudents();

            if (
                currentStudent &&
                currentStudent.id === studentCode
            ) {

                openStudentManager(studentCode);

            }

            alert(
                "✅ تم فك الجهاز بنجاح"
            );

        })
        .catch(function (error) {

            console.error(error);

            alert(
                "❌ تعذر فك الجهاز"
            );

        });

}


// ==========================================================
// STUDENT STATUS
// ==========================================================

function toggleStudentStatus(studentCode) {

    const student =
        allStudents.find(function (item) {

            return item.id === studentCode;

        });

    if (!student) {
        return;
    }

    const newStatus =
        student.active !== true;

    const action =
        newStatus
            ? "تفعيل"
            : "إيقاف";

    if (
        !confirm(
            `⚠️ هل تريد ${action} حساب الطالب؟\n\n` +
            `${student.name || studentCode}`
        )
    ) {
        return;
    }

    db.collection("students")
        .doc(studentCode)
        .update({

            active: newStatus

        })
        .then(function () {

            student.active = newStatus;

            renderStudents();

            renderCodes();

            updateDashboard();

            if (
                currentStudent &&
                currentStudent.id === studentCode
            ) {

                openStudentManager(studentCode);

            }

            alert(
                newStatus
                    ? "✅ تم تفعيل الحساب"
                    : "⏸️ تم إيقاف الحساب"
            );

        })
        .catch(function (error) {

            console.error(error);

            alert(
                "❌ تعذر تغيير حالة الحساب"
            );

        });

}


// ==========================================================
// EXTEND STUDENT
// ==========================================================

function extendStudent(studentCode) {

    const student =
        allStudents.find(function (item) {

            return item.id === studentCode;

        });

    if (!student) {
        return;
    }

    const daysText =
        prompt(
            "➕ اكتب عدد الأيام المراد إضافتها:",
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
        getDate(student.expiresAt);

    const now =
        new Date();

    const base =
        currentExpiry &&
        currentExpiry > now
            ? currentExpiry
            : now;

    const newExpiry =
        new Date(base);

    newExpiry.setDate(
        newExpiry.getDate() + days
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

            if (
                currentStudent &&
                currentStudent.id === studentCode
            ) {

                openStudentManager(studentCode);

            }

            alert(
                "✅ تم تمديد الاشتراك حتى " +
                formatDate(newExpiry)
            );

        })
        .catch(function (error) {

            console.error(error);

            alert(
                "❌ تعذر تمديد الاشتراك"
            );

        });

}


// ==========================================================
// CHANGE STUDENT PASSWORD
// ==========================================================

function changeStudentPassword(studentCode) {

    const student =
        allStudents.find(function (item) {

            return item.id === studentCode;

        });

    if (!student) {
        return;
    }

    const password =
        prompt(
            "🔑 اكتب كلمة المرور الجديدة:",
            ""
        );

    if (password === null) {
        return;
    }

    const newPassword =
        String(password).trim();

    if (!newPassword) {

        alert(
            "❌ كلمة المرور لا يمكن أن تكون فارغة"
        );

        return;

    }

    if (newPassword.length < 4) {

        alert(
            "❌ كلمة المرور يجب ألا تقل عن 4 أحرف"
        );

        return;

    }

    if (
        !confirm(
            "⚠️ هل تريد تغيير كلمة مرور الطالب؟"
        )
    ) {
        return;
    }

    db.collection("students")
        .doc(studentCode)
        .update({

            password: newPassword

        })
        .then(function () {

            student.password =
                newPassword;

            alert(
                "✅ تم تغيير كلمة المرور"
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
// DELETE STUDENT
// ==========================================================

function deleteStudent(studentCode) {

    const student =
        allStudents.find(function (item) {

            return item.id === studentCode;

        });

    if (!student) {
        return;
    }

    if (
        !confirm(
            "⚠️ هل أنت متأكد من حذف الطالب؟\n\n" +
            `${student.name || studentCode}\n\n` +
            "سيتم حذف حساب الطالب فقط."
        )
    ) {
        return;
    }

    db.collection("students")
        .doc(studentCode)
        .delete()
        .then(function () {

            allStudents =
                allStudents.filter(function (item) {

                    return item.id !== studentCode;

                });

            allCodes =
                allCodes.filter(function (item) {

                    return item.id !== studentCode;

                });

            closeAdminModal(
                "studentManagerModal"
            );

            renderStudents();

            renderCodes();

            updateDashboard();

            alert("✅ تم حذف الطالب");

        })
        .catch(function (error) {

            console.error(error);

            alert(
                "❌ تعذر حذف الطالب"
            );

        });

}


// ==========================================================
// CODES
// ==========================================================

function loadCodes() {

    allCodes = [...allStudents];

    return allCodes;

}


function createStudentCode() {

    const code =
        getInputValue("newCode");

    const password =
        getInputValue("newPassword");

    const name =
        getInputValue("newName");

    const grade =
        getInputValue("newGrade");

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

                throw new Error("EXISTS");

            }

            const expiry =
                new Date();

            expiry.setDate(
                expiry.getDate() + days
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
                    firebase.firestore.FieldValue
                        .serverTimestamp()

            });

        })
        .then(function () {

            alert(
                "✅ تم إنشاء كود الطالب"
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

            loadCodes();

            updateDashboard();

            renderStudents();

            renderCodes();

        })
        .catch(function (error) {

            console.error(error);

            if (
                error.message === "EXISTS"
            ) {

                alert(
                    "⚠️ هذا الكود موجود بالفعل"
                );

            } else {

                alert(
                    "❌ حدث خطأ أثناء إنشاء الكود"
                );

            }

        });

}


function renderCodes() {

    const table =
        document.getElementById("codesTable");

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
        allCodes.map(function (student) {

            const active =
                isStudentActive(student);

            const expiry =
                getDate(student.expiresAt);

            return `

                <tr>

                    <td>
                        ${escapeHtml(student.id)}
                    </td>

                    <td>
                        ${escapeHtml(student.name || "-")}
                    </td>

                    <td>
                        ${escapeHtml(student.grade || "-")}
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

                        <button
                            class="admin-btn success-btn"
                            onclick="extendStudent('${escapeJs(student.id)}')">
                            ➕
                        </button>

                        <button
                            class="admin-btn warning-btn"
                            onclick="manageStudentDevice('${escapeJs(student.id)}')">
                            📱
                        </button>

                        <button
                            class="admin-btn danger-btn"
                            onclick="deleteStudent('${escapeJs(student.id)}')">
                            🗑️
                        </button>

                    </td>

                </tr>

            `;

        }).join("");

}


// ==========================================================
// PARENTS
// ==========================================================

function loadParents() {

    return db.collection("parents")
        .get()
        .then(function (snapshot) {

            allParents = [];

            snapshot.forEach(function (doc) {

                allParents.push({
                    id: doc.id,
                    ...doc.data()
                });

            });

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
// CREATE PARENT
// ==========================================================

function createParentCode() {

    const code =
        getInputValue("newParentCode");

    const password =
        getInputValue("newParentPassword");

    const name =
        getInputValue("newParentName");

    const studentCode =
        getInputValue("parentStudentCode");

    const days =
        Number(
            getInputValue(
                "parentSubscriptionDays"
            )
        );

    if (!code) {
        alert("❌ اكتب كود ولي الأمر");
        return;
    }

    if (!password) {
        alert("❌ اكتب كلمة المرور");
        return;
    }

    if (!name) {
        alert("❌ اكتب اسم ولي الأمر");
        return;
    }

    if (!studentCode) {
        alert("❌ اكتب كود الطالب المرتبط");
        return;
    }

    if (
        !Number.isFinite(days) ||
        days <= 0
    ) {
        alert("❌ مدة الاشتراك غير صحيحة");
        return;
    }

    const student =
        allStudents.find(function (item) {

            return item.id === studentCode;

        });

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
                expiry.getDate() + days
            );

            return parentRef.set({

                name: name,
                password: password,
                studentCode: studentCode,
                studentName: student.name || "",
                studentGrade: student.grade || "",
                active: true,

                expiresAt:
                    firebase.firestore.Timestamp
                        .fromDate(expiry),

                createdAt:
                    firebase.firestore.FieldValue
                        .serverTimestamp()

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

            updateDashboard();

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

            } else {

                alert(
                    "❌ حدث خطأ أثناء إنشاء الحساب"
                );

            }

        });

}


// ==========================================================
// RENDER PARENTS
// ==========================================================

function renderParents() {

    const table =
        document.getElementById("parentsTable");

    if (!table) {
        return;
    }

    if (!allParents.length) {

        table.innerHTML = `
            <tr>
                <td colspan="8">
                    لا توجد حسابات أولياء أمور
                </td>
            </tr>
        `;

        return;

    }

    table.innerHTML =
        allParents.map(function (parent) {

            const expiry =
                getDate(parent.expiresAt);

            const active =
                isParentActive(parent);

            return `

                <tr>

                    <td>
                        ${escapeHtml(parent.id)}
                    </td>

                    <td>
                        ${escapeHtml(parent.name || "-")}
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
                        ${escapeHtml(
                            parent.studentGrade || "-"
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

                        <button
                            class="admin-btn primary-btn"
                            title="التفاصيل"
                            onclick="openParentManager('${escapeJs(parent.id)}')">
                            👁️
                        </button>

                        <button
                            class="admin-btn primary-btn"
                            title="تعديل"
                            onclick="editParent('${escapeJs(parent.id)}')">
                            ✏️
                        </button>

                        <button
                            class="admin-btn warning-btn"
                            onclick="toggleParentStatus('${escapeJs(parent.id)}')">
                            ${
                                parent.active === true
                                    ? "⏸️"
                                    : "▶️"
                            }
                        </button>

                        <button
                            class="admin-btn success-btn"
                            onclick="extendParent('${escapeJs(parent.id)}')">
                            ➕
                        </button>

                        <button
                            class="admin-btn primary-btn"
                            onclick="changeParentPassword('${escapeJs(parent.id)}')">
                            🔑
                        </button>

                        <button
                            class="admin-btn danger-btn"
                            onclick="deleteParent('${escapeJs(parent.id)}')">
                            🗑️
                        </button>

                    </td>

                </tr>

            `;

        }).join("");

}


// ==========================================================
// PARENT FULL MANAGEMENT
// ==========================================================

function openParentManager(parentCode) {

    const parent =
        allParents.find(function (item) {

            return item.id === parentCode;

        });

    if (!parent) {

        alert(
            "❌ ولي الأمر غير موجود"
        );

        return;

    }

    currentParent = parent;

    const student =
        allStudents.find(function (item) {

            return item.id === parent.studentCode;

        });

    const expiry =
        getDate(parent.expiresAt);

    const days =
        getRemainingDays(expiry);

    const modal =
        document.getElementById(
            "parentManagerModal"
        );

    const body =
        document.getElementById(
            "parentManagerBody"
        );

    if (!modal || !body) {
        return;
    }

    body.innerHTML = `

        <div class="admin-modal-header">

            <div>

                <h2>👨‍👩‍👦 إدارة ولي الأمر</h2>

                <p>
                    ${escapeHtml(parent.name || "-")}
                </p>

            </div>

            <button
                class="modal-close"
                onclick="closeAdminModal('parentManagerModal')">
                ✕
            </button>

        </div>


        <div class="admin-info-grid">

            ${adminInfo(
                "👤 الاسم",
                parent.name || "-"
            )}

            ${adminInfo(
                "🔑 كود ولي الأمر",
                parent.id
            )}

            ${adminInfo(
                "👨‍🎓 الطالب المرتبط",
                student
                    ? student.name
                    : parent.studentName || "-"
            )}

            ${adminInfo(
                "🔑 كود الطالب",
                parent.studentCode || "-"
            )}

            ${adminInfo(
                "🎓 الصف",
                student
                    ? student.grade
                    : parent.studentGrade || "-"
            )}

            ${adminInfo(
                "📅 تاريخ الانتهاء",
                expiry
                    ? formatDate(expiry)
                    : "-"
            )}

            ${adminInfo(
                "⏳ الأيام المتبقية",
                days >= 0
                    ? days + " يوم"
                    : "منتهي"
            )}

            ${adminInfo(
                "📊 الحالة",
                isParentActive(parent)
                    ? "✅ نشط"
                    : "⛔ غير نشط"
            )}

        </div>


        <div class="admin-management-actions">

            <button
                class="admin-btn primary-btn"
                onclick="editParent('${escapeJs(parent.id)}')">
                ✏️ تعديل الحساب
            </button>

            <button
                class="admin-btn success-btn"
                onclick="extendParent('${escapeJs(parent.id)}')">
                ➕ تمديد
            </button>

            <button
                class="admin-btn warning-btn"
                onclick="toggleParentStatus('${escapeJs(parent.id)}')">
                ${
                    parent.active === true
                        ? "⏸️ إيقاف"
                        : "▶️ تفعيل"
                }
            </button>

            <button
                class="admin-btn primary-btn"
                onclick="changeParentPassword('${escapeJs(parent.id)}')">
                🔑 تغيير كلمة المرور
            </button>

            <button
                class="admin-btn danger-btn"
                onclick="deleteParent('${escapeJs(parent.id)}')">
                🗑️ حذف
            </button>

        </div>

    `;

    modal.classList.remove("hidden");

}


// ==========================================================
// EDIT PARENT
// ==========================================================

function editParent(parentCode) {

    const parent =
        allParents.find(function (item) {

            return item.id === parentCode;

        });

    if (!parent) {
        return;
    }

    const modal =
        document.getElementById(
            "editParentModal"
        );

    const body =
        document.getElementById(
            "editParentBody"
        );

    if (!modal || !body) {
        return;
    }

    body.innerHTML = `

        <div class="admin-modal-header">

            <h2>✏️ تعديل حساب ولي الأمر</h2>

            <button
                class="modal-close"
                onclick="closeAdminModal('editParentModal')">
                ✕
            </button>

        </div>


        <div class="admin-form-grid">

            <div>

                <label>اسم ولي الأمر</label>

                <input
                    id="editParentName"
                    value="${escapeHtml(
                        parent.name || ""
                    )}"
                >

            </div>


            <div>

                <label>كود الطالب المرتبط</label>

                <input
                    id="editParentStudentCode"
                    value="${escapeHtml(
                        parent.studentCode || ""
                    )}"
                >

            </div>

        </div>


        <div class="admin-modal-actions">

            <button
                class="admin-btn success-btn"
                onclick="saveParentEdit('${escapeJs(parent.id)}')">
                💾 حفظ
            </button>

            <button
                class="admin-btn secondary-btn"
                onclick="closeAdminModal('editParentModal')">
                إلغاء
            </button>

        </div>

    `;

    modal.classList.remove("hidden");

}


// ==========================================================
// SAVE PARENT
// ==========================================================

function saveParentEdit(parentCode) {

    const name =
        getInputValue("editParentName");

    const studentCode =
        getInputValue(
            "editParentStudentCode"
        );

    if (!name) {

        alert(
            "❌ اسم ولي الأمر مطلوب"
        );

        return;

    }

    const student =
        allStudents.find(function (item) {

            return item.id === studentCode;

        });

    if (!student) {

        alert(
            "❌ كود الطالب غير موجود"
        );

        return;

    }

    db.collection("parents")
        .doc(parentCode)
        .update({

            name: name,

            studentCode: studentCode,

            studentName:
                student.name || "",

            studentGrade:
                student.grade || ""

        })
        .then(function () {

            const parent =
                allParents.find(function (item) {

                    return item.id === parentCode;

                });

            if (parent) {

                parent.name = name;

                parent.studentCode =
                    studentCode;

                parent.studentName =
                    student.name || "";

                parent.studentGrade =
                    student.grade || "";

            }

            closeAdminModal(
                "editParentModal"
            );

            renderParents();

            if (
                currentParent &&
                currentParent.id === parentCode
            ) {

                openParentManager(parentCode);

            }

            alert(
                "✅ تم تعديل حساب ولي الأمر"
            );

        })
        .catch(function (error) {

            console.error(error);

            alert(
                "❌ تعذر تعديل الحساب"
            );

        });

}


// ==========================================================
// PARENT STATUS
// ==========================================================

function toggleParentStatus(parentCode) {

    const parent =
        allParents.find(function (item) {

            return item.id === parentCode;

        });

    if (!parent) {
        return;
    }

    const newStatus =
        parent.active !== true;

    const action =
        newStatus
            ? "تفعيل"
            : "إيقاف";

    if (
        !confirm(
            `⚠️ هل تريد ${action} حساب ولي الأمر؟`
        )
    ) {
        return;
    }

    db.collection("parents")
        .doc(parentCode)
        .update({

            active: newStatus

        })
        .then(function () {

            parent.active = newStatus;

            renderParents();

            updateDashboard();

            if (
                currentParent &&
                currentParent.id === parentCode
            ) {

                openParentManager(parentCode);

            }

            alert(
                newStatus
                    ? "✅ تم تفعيل الحساب"
                    : "⏸️ تم إيقاف الحساب"
            );

        })
        .catch(function (error) {

            console.error(error);

            alert(
                "❌ تعذر تغيير حالة الحساب"
            );

        });

}


// ==========================================================
// EXTEND PARENT
// ==========================================================

function extendParent(parentCode) {

    const parent =
        allParents.find(function (item) {

            return item.id === parentCode;

        });

    if (!parent) {
        return;
    }

    const text =
        prompt(
            "➕ عدد الأيام المراد إضافتها:",
            "30"
        );

    if (text === null) {
        return;
    }

    const days =
        Number(text);

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
        getDate(parent.expiresAt);

    const now =
        new Date();

    const base =
        expiry && expiry > now
            ? expiry
            : now;

    const newExpiry =
        new Date(base);

    newExpiry.setDate(
        newExpiry.getDate() + days
    );

    db.collection("parents")
        .doc(parentCode)
        .update({

            active: true,

            expiresAt:
                firebase.firestore.Timestamp
                    .fromDate(newExpiry)

        })
        .then(function () {

            parent.active = true;

            parent.expiresAt =
                firebase.firestore.Timestamp
                    .fromDate(newExpiry);

            renderParents();

            updateDashboard();

            if (
                currentParent &&
                currentParent.id === parentCode
            ) {

                openParentManager(parentCode);

            }

            alert(
                "✅ تم تمديد الاشتراك"
            );

        })
        .catch(function (error) {

            console.error(error);

            alert(
                "❌ تعذر تمديد الاشتراك"
            );

        });

}


// ==========================================================
// CHANGE PARENT PASSWORD
// ==========================================================

function changeParentPassword(parentCode) {

    const parent =
        allParents.find(function (item) {

            return item.id === parentCode;

        });

    if (!parent) {
        return;
    }

    const password =
        prompt(
            "🔑 كلمة المرور الجديدة:",
            ""
        );

    if (password === null) {
        return;
    }

    const newPassword =
        String(password).trim();

    if (
        newPassword.length < 4
    ) {

        alert(
            "❌ كلمة المرور يجب ألا تقل عن 4 أحرف"
        );

        return;

    }

    db.collection("parents")
        .doc(parentCode)
        .update({

            password: newPassword

        })
        .then(function () {

            parent.password =
                newPassword;

            alert(
                "✅ تم تغيير كلمة المرور"
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
// DELETE PARENT
// ==========================================================

function deleteParent(parentCode) {

    const parent =
        allParents.find(function (item) {

            return item.id === parentCode;

        });

    if (
        !confirm(
            "⚠️ هل تريد حذف حساب ولي الأمر؟\n\n" +
            (
                parent
                    ? parent.name
                    : parentCode
            ) +
            "\n\nلن يتم حذف الطالب."
        )
    ) {
        return;
    }

    db.collection("parents")
        .doc(parentCode)
        .delete()
        .then(function () {

            allParents =
                allParents.filter(function (item) {

                    return item.id !== parentCode;

                });

            closeAdminModal(
                "parentManagerModal"
            );

            renderParents();

            updateDashboard();

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
// RESULTS
// ==========================================================

function loadResults() {

    return db.collection("results")
        .get()
        .then(function (snapshot) {

            allResults = [];

            snapshot.forEach(function (doc) {

                allResults.push({

                    id: doc.id,

                    ...doc.data()

                });

            });

            allResults.sort(function (a, b) {

                const dateA =
                    getDate(a.createdAt)
                    || new Date(0);

                const dateB =
                    getDate(b.createdAt)
                    || new Date(0);

                return (
                    dateB.getTime() -
                    dateA.getTime()
                );

            });

            return allResults;

        });

}


// ==========================================================
// RESULTS STATISTICS
// ==========================================================

function calculateResultsStatistics() {

    const count =
        allResults.length;

    let sum = 0;

    let highest = 0;

    allResults.forEach(function (result) {

        const percentage =
            getPercentage(result);

        sum += percentage;

        highest =
            Math.max(
                highest,
                percentage
            );

    });

    const average =
        count
            ? Math.round(sum / count)
            : 0;

    return {

        count: count,

        average: average,

        highest: highest

    };

}


// ==========================================================
// RENDER RESULTS
// ==========================================================

function renderAdminResults() {

    const container =
        document.getElementById(
            "resultsTable"
        );

    if (!container) {
        return;
    }

    const stats =
        calculateResultsStatistics();

    const studentsWithResults =
        new Set(
            allResults.map(function (r) {

                return r.studentCode;

            })
        ).size;

    let html = `

        <div class="admin-stat-grid">

            <div class="admin-stat-card">

                <span>📝 عدد الاختبارات</span>

                <strong>
                    ${stats.count}
                </strong>

            </div>


            <div class="admin-stat-card">

                <span>📊 متوسط الدرجات</span>

                <strong>
                    ${stats.average}%
                </strong>

            </div>


            <div class="admin-stat-card">

                <span>🏆 أعلى نتيجة</span>

                <strong>
                    ${stats.highest}%
                </strong>

            </div>


            <div class="admin-stat-card">

                <span>👨‍🎓 الطلاب المشاركون</span>

                <strong>
                    ${studentsWithResults}
                </strong>

            </div>

        </div>

    `;

    if (!allResults.length) {

        html += `
            <div class="admin-empty">
                📝 لا توجد نتائج حتى الآن
            </div>
        `;

        container.innerHTML = html;

        return;

    }

    html += `

        <div class="table-container">

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
                            .map(function (result, index) {

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
                                            ${getPercentage(result)}%
                                        </td>

                                        <td>
                                            ${formatDateTime(
                                                result.createdAt
                                            )}
                                        </td>

                                    </tr>

                                `;

                            })
                            .join("")
                    }

                </tbody>

            </table>

        </div>

    `;

    container.innerHTML = html;

}


// ==========================================================
// LEADERBOARD
// ==========================================================

function calculateLeaderboard() {

    const scores = {};

    allResults.forEach(function (result) {

        const code =
            result.studentCode;

        if (!code) {
            return;
        }

        if (!scores[code]) {

            scores[code] = {

                studentCode: code,

                totalTests: 0,

                totalScore: 0,

                average: 0,

                bestScore: 0

            };

        }

        const percentage =
            getPercentage(result);

        scores[code].totalTests++;

        scores[code].totalScore +=
            percentage;

        scores[code].bestScore =
            Math.max(
                scores[code].bestScore,
                percentage
            );

    });

    allLeaderboard =
        Object.values(scores);

    allLeaderboard.forEach(function (item) {

        item.average =
            item.totalTests
                ? Math.round(
                    item.totalScore /
                    item.totalTests
                )
                : 0;

        const student =
            allStudents.find(function (s) {

                return s.id === item.studentCode;

            });

        item.name =
            student
                ? student.name
                : "طالب";

        item.grade =
            student
                ? student.grade
                : "-";

    });

    sortLeaderboard();

    allLeaderboard.forEach(
        function (item, index) {

            item.rank =
                index + 1;

        }
    );

    return allLeaderboard;

}


// ==========================================================
// SORT LEADERBOARD
// ==========================================================

function sortLeaderboard() {

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

}


// ==========================================================
// LEADERBOARD FILTER
// ==========================================================

function filterLeaderboard() {

    const grade =
        getInputValue(
            "leaderboardGrade"
        );

    const subject =
        getInputValue(
            "leaderboardSubject"
        );

    const monthly =
        getInputValue(
            "leaderboardPeriod"
        ) === "monthly";

    let results =
        [...allResults];

    if (grade) {

        results =
            results.filter(function (result) {

                const student =
                    allStudents.find(
                        function (s) {

                            return (
                                s.id ===
                                result.studentCode
                            );

                        }
                    );

                return (
                    student &&
                    student.grade === grade
                );

            });

    }

    if (subject) {

        results =
            results.filter(function (result) {

                return (
                    result.subject ===
                    subject
                );

            });

    }

    if (monthly) {

        const now =
            new Date();

        const month =
            now.getMonth();

        const year =
            now.getFullYear();

        results =
            results.filter(function (result) {

                const date =
                    getDate(result.createdAt);

                if (!date) {
                    return false;
                }

                return (
                    date.getMonth() === month &&
                    date.getFullYear() === year
                );

            });

    }

    const scores = {};

    results.forEach(function (result) {

        const code =
            result.studentCode;

        if (!code) {
            return;
        }

        if (!scores[code]) {

            scores[code] = {

                studentCode: code,

                totalTests: 0,

                totalScore: 0,

                average: 0,

                bestScore: 0

            };

        }

        const percentage =
            getPercentage(result);

        scores[code].totalTests++;

        scores[code].totalScore +=
            percentage;

        scores[code].bestScore =
            Math.max(
                scores[code].bestScore,
                percentage
            );

    });

    allLeaderboard =
        Object.values(scores);

    allLeaderboard.forEach(function (item) {

        item.average =
            item.totalTests
                ? Math.round(
                    item.totalScore /
                    item.totalTests
                )
                : 0;

        const student =
            allStudents.find(function (s) {

                return s.id === item.studentCode;

            });

        item.name =
            student
                ? student.name
                : "طالب";

        item.grade =
            student
                ? student.grade
                : "-";

    });

    sortLeaderboard();

    allLeaderboard.forEach(
        function (item, index) {

            item.rank =
                index + 1;

        }
    );

    renderLeaderboard();

}


// ==========================================================
// RENDER LEADERBOARD
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
            <div class="admin-empty">
                🏆 لا توجد بيانات للترتيب
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
                        .map(function (item) {

                            let medal = "";

                            if (
                                item.rank === 1
                            ) {

                                medal = "🥇";

                            } else if (
                                item.rank === 2
                            ) {

                                medal = "🥈";

                            } else if (
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

                        })
                        .join("")
                }

            </tbody>

        </table>

    `;

}


// ==========================================================
// CONTENT
// ==========================================================

function loadContent() {

    return db.collection("content")
        .get()
        .then(function (snapshot) {

            allContent = [];

            snapshot.forEach(function (doc) {

                allContent.push({

                    id: doc.id,

                    ...doc.data()

                });

            });

            allContent.sort(function (a, b) {

                const dateA =
                    getDate(a.createdAt)
                    || new Date(0);

                const dateB =
                    getDate(b.createdAt)
                    || new Date(0);

                return (
                    dateB.getTime() -
                    dateA.getTime()
                );

            });

            return allContent;

        });

}


// ==========================================================
// CREATE CONTENT
// ==========================================================

function createContent() {

    const grade =
        getInputValue("contentGrade");

    const subject =
        getInputValue("contentSubject");

    const chapter =
        getInputValue("contentChapter");

    const title =
        getInputValue("contentTitle");

    const type =
        getInputValue("contentType");

    const url =
        getInputValue("contentUrl");

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

            grade,
            subject,
            chapter,
            title,
            type,
            url,

            active: true,

            createdAt:
                firebase.firestore.FieldValue
                    .serverTimestamp()

        })
        .then(function () {

            alert(
                "✅ تم إضافة المحتوى"
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

            updateDashboard();

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
// RENDER CONTENT
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
        getInputValue("filterSubject");

    const filterGrade =
        getInputValue("filterGrade");

    let content =
        [...allContent];

    if (filterSubject) {

        content =
            content.filter(function (item) {

                return (
                    item.subject ===
                    filterSubject
                );

            });

    }

    if (filterGrade) {

        content =
            content.filter(function (item) {

                return (
                    item.grade ===
                    filterGrade
                );

            });

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
        content.map(function (item) {

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
                        ${getContentType(item.type)}
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
                            onclick="toggleContent('${escapeJs(item.id)}')">
                            ${
                                item.active === false
                                    ? "👁️"
                                    : "🙈"
                            }
                        </button>

                        <button
                            class="admin-btn danger-btn"
                            onclick="deleteContent('${escapeJs(item.id)}')">
                            🗑️
                        </button>

                    </td>

                </tr>

            `;

        }).join("");

}


// ==========================================================
// TOGGLE CONTENT
// ==========================================================

function toggleContent(contentId) {

    const item =
        allContent.find(function (content) {

            return content.id === contentId;

        });

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

            item.active = newState;

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
// DELETE CONTENT
// ==========================================================

function deleteContent(contentId) {

    if (
        !confirm(
            "⚠️ هل تريد حذف هذا المحتوى؟"
        )
    ) {
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

            updateDashboard();

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
// NOTIFICATIONS
// ==========================================================

function loadNotifications() {

    return db.collection("notifications")
        .get()
        .then(function (snapshot) {

            allNotifications = [];

            snapshot.forEach(function (doc) {

                allNotifications.push({

                    id: doc.id,

                    ...doc.data()

                });

            });

            allNotifications.sort(function (a, b) {

                const dateA =
                    getDate(a.createdAt)
                    || new Date(0);

                const dateB =
                    getDate(b.createdAt)
                    || new Date(0);

                return (
                    dateB.getTime() -
                    dateA.getTime()
                );

            });

            return allNotifications;

        });

}


// ==========================================================
// CREATE NOTIFICATION
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

            targetType,

            targetId:
                targetType === "all"
                    ? ""
                    : targetId,

            title,

            message,

            createdAt:
                firebase.firestore.FieldValue
                    .serverTimestamp(),

            createdBy:
                currentAdmin
                    ? currentAdmin.uid
                    : ""

        })
        .then(function () {

            alert(
                "✅ تم إرسال الإشعار"
            );

            clearInputs([
                "notificationTargetId",
                "notificationTitle",
                "notificationMessage"
            ]);

            return loadNotifications();

        })
        .then(function () {

            updateDashboard();

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
// RENDER NOTIFICATIONS
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
                                notification.title || "-"
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                notification.message || "-"
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
                                onclick="deleteNotification('${escapeJs(notification.id)}')">
                                🗑️
                            </button>

                        </td>

                    </tr>

                `;

            }
        ).join("");

}


function getNotificationTarget(notification) {

    const type =
        notification.targetType || "all";

    if (type === "all") {
        return "📢 كل الطلاب";
    }

    if (type === "grade") {

        return (
            "🎓 " +
            escapeHtml(
                notification.targetId || "-"
            )
        );

    }

    if (type === "student") {

        return (
            "👤 " +
            escapeHtml(
                notification.targetId || "-"
            )
        );

    }

    return "-";

}


function deleteNotification(notificationId) {

    if (
        !confirm(
            "⚠️ هل تريد حذف هذا الإشعار؟"
        )
    ) {
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

            updateDashboard();

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
// DASHBOARD
// ==========================================================

function updateDashboard() {

    const totalStudents =
        allStudents.length;

    const activeStudents =
        allStudents.filter(function (student) {

            return isStudentActive(student);

        }).length;

    const expiredStudents =
        totalStudents -
        activeStudents;

    const totalResults =
        allResults.length;

    const resultsStats =
        calculateResultsStatistics();

    const totalParents =
        allParents.length;

    const totalContent =
        allContent.length;

    const totalNotifications =
        allNotifications.length;

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
        resultsStats.average + "%"
    );

    setText(
        "totalParents",
        totalParents
    );

    setText(
        "totalContent",
        totalContent
    );

    setText(
        "totalNotifications",
        totalNotifications
    );

}


// ==========================================================
// STUDENT HELPERS
// ==========================================================

function calculateStudentAverage(results) {

    if (!results.length) {
        return 0;
    }

    let sum = 0;

    results.forEach(function (result) {

        sum += getPercentage(result);

    });

    return Math.round(
        sum / results.length
    );

}


function calculateBestScore(results) {

    if (!results.length) {
        return 0;
    }

    let best = 0;

    results.forEach(function (result) {

        best =
            Math.max(
                best,
                getPercentage(result)
            );

    });

    return best;

}


function getRemainingDays(date) {

    if (!date) {
        return -1;
    }

    const now =
        new Date();

    const difference =
        date.getTime() -
        now.getTime();

    if (difference <= 0) {
        return 0;
    }

    return Math.ceil(
        difference /
        (1000 * 60 * 60 * 24)
    );

}


// ==========================================================
// STATUS
// ==========================================================

function isStudentActive(student) {

    if (
        student.active !== true
    ) {
        return false;
    }

    const expiry =
        getDate(student.expiresAt);

    if (!expiry) {
        return false;
    }

    return new Date() < expiry;

}


function isParentActive(parent) {

    if (
        parent.active !== true
    ) {
        return false;
    }

    const expiry =
        getDate(parent.expiresAt);

    if (!expiry) {
        return false;
    }

    return new Date() < expiry;

}


// ==========================================================
// CONTENT TYPE
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
// PERCENTAGE
// ==========================================================

function getPercentage(data) {

    if (
        data.percentage !== undefined &&
        data.percentage !== null
    ) {

        const value =
            Number(data.percentage);

        return isNaN(value)
            ? 0
            : Math.round(value);

    }

    const score =
        Number(data.score);

    const total =
        Number(data.total);

    if (
        total > 0 &&
        !isNaN(score)
    ) {

        return Math.round(
            (score / total) * 100
        );

    }

    return 0;

}


// ==========================================================
// DATE
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
        isNaN(date.getTime())
    ) {

        return null;

    }

    return date;

}


// ==========================================================
// DATE FORMAT
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
// INPUT
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


function clearInputs(ids) {

    ids.forEach(function (id) {

        const element =
            document.getElementById(id);

        if (element) {
            element.value = "";
        }

    });

}


// ==========================================================
// TEXT
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
// HTML SECURITY
// ==========================================================

function escapeHtml(value) {

    return String(value ?? "")

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
// JS SECURITY
// ==========================================================

function escapeJs(value) {

    return String(value ?? "")

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
// ADMIN INFO COMPONENT
// ==========================================================

function adminInfo(label, value) {

    return `

        <div class="admin-info-card">

            <span>
                ${escapeHtml(label)}
            </span>

            <strong>
                ${escapeHtml(value)}
            </strong>

        </div>

    `;

}


// ==========================================================
// ADMIN MODALS
// ==========================================================

function injectAdminModals() {

    if (
        document.getElementById(
            "studentManagerModal"
        )
    ) {
        return;
    }

    document.body.insertAdjacentHTML(
        "beforeend",
        `

        <!-- STUDENT MANAGER -->

        <div
            id="studentManagerModal"
            class="admin-modal hidden">

            <div class="admin-modal-content">

                <div
                    id="studentManagerBody">
                </div>

            </div>

        </div>


        <!-- EDIT STUDENT -->

        <div
            id="editStudentModal"
            class="admin-modal hidden">

            <div class="admin-modal-content">

                <div
                    id="editStudentBody">
                </div>

            </div>

        </div>


        <!-- PARENT MANAGER -->

        <div
            id="parentManagerModal"
            class="admin-modal hidden">

            <div class="admin-modal-content">

                <div
                    id="parentManagerBody">
                </div>

            </div>

        </div>


        <!-- EDIT PARENT -->

        <div
            id="editParentModal"
            class="admin-modal hidden">

            <div class="admin-modal-content">

                <div
                    id="editParentBody">
                </div>

            </div>

        </div>

        `
    );


    document
        .querySelectorAll(".admin-modal")
        .forEach(function (modal) {

            modal.addEventListener(
                "click",
                function (event) {

                    if (
                        event.target === modal
                    ) {

                        modal.classList.add(
                            "hidden"
                        );

                    }

                }
            );

        });

}


// ==========================================================
// CLOSE MODAL
// ==========================================================

function closeAdminModal(id) {

    const modal =
        document.getElementById(id);

    if (modal) {

        modal.classList.add(
            "hidden"
        );

    }

}


// ==========================================================
// LOGOUT
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
