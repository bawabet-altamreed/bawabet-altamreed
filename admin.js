// ==========================================
// بوابة التمريض
// Admin Panel
// إدارة الطلاب والأكواد
// ==========================================

(function () {

    const ADMIN_UID =
        "H4wMJm2ComSSy19ttzb1KxZz7Yu1";


    const loading =
        document.getElementById("loading");

    const accessDenied =
        document.getElementById("accessDenied");

    const adminPanel =
        document.getElementById("adminPanel");


    // ==========================================
    // حماية لوحة الإدارة
    // ==========================================

    firebase.auth().onAuthStateChanged(
        function (user) {

            if (!user) {

                showDenied();

                return;

            }


            console.log(
                "Firebase UID:",
                user.uid
            );


            if (
                user.uid !== ADMIN_UID
            ) {

                showDenied();

                return;

            }


            loading.classList.add("hidden");

            adminPanel.classList.remove("hidden");

            loadDashboard();

        }
    );


    // ==========================================
    // رفض الدخول
    // ==========================================

    function showDenied() {

        loading.classList.add("hidden");

        adminPanel.classList.add("hidden");

        accessDenied.classList.remove("hidden");

    }


    // ==========================================
    // التنقل
    // ==========================================

    window.showSection =
        function (sectionId) {

            document
                .querySelectorAll(".section")
                .forEach(function (section) {

                    section.classList.remove("active");

                });


            const section =
                document.getElementById(sectionId);


            if (section) {

                section.classList.add("active");

            }


            if (sectionId === "students") {
                loadStudents();
            }

            if (sectionId === "codes") {
                loadCodes();
            }

            if (sectionId === "results") {
                loadResults();
            }

            if (sectionId === "leaderboard") {
                loadLeaderboard();
            }

        };


    // ==========================================
    // Dashboard
    // ==========================================

    function loadDashboard() {

        db.collection("students")
            .get()

            .then(function (snapshot) {

                let total = 0;
                let active = 0;
                let expired = 0;


                snapshot.forEach(function (doc) {

                    total++;

                    const student = doc.data();


                    if (student.active === true) {
                        active++;
                    }


                    if (student.expiresAt) {

                        const expiry =
                            getDate(student.expiresAt);


                        if (
                            expiry &&
                            new Date() >= expiry
                        ) {

                            expired++;

                        }

                    }

                });


                setText(
                    "totalStudents",
                    total
                );

                setText(
                    "activeStudents",
                    active
                );

                setText(
                    "expiredStudents",
                    expired
                );

            })
            .catch(console.error);


        db.collection("results")
            .get()

            .then(function (snapshot) {

                let total = 0;
                let sum = 0;


                snapshot.forEach(function (doc) {

                    total++;

                    const data = doc.data();


                    const score =
                        Number(
                            data.percentage ??
                            data.score ??
                            0
                        );


                    if (!isNaN(score)) {
                        sum += score;
                    }

                });


                const average =
                    total > 0
                        ? Math.round(sum / total)
                        : 0;


                setText(
                    "totalResults",
                    total
                );

                setText(
                    "averageScore",
                    average + "%"
                );

            })
            .catch(console.error);

    }


    // ==========================================
    // الطلاب
    // ==========================================

    let allStudents = [];


    function loadStudents() {

        db.collection("students")
            .get()

            .then(function (snapshot) {

                allStudents = [];


                snapshot.forEach(function (doc) {

                    allStudents.push({

                        id: doc.id,

                        ...doc.data()

                    });

                });


                renderStudents(allStudents);

            })

            .catch(function (error) {

                console.error(
                    "Students Error:",
                    error
                );

                alert(
                    "❌ تعذر تحميل الطلاب"
                );

            });

    }


    // ==========================================
    // عرض الطلاب
    // ==========================================

    function renderStudents(students) {

        const table =
            document.getElementById(
                "studentsTable"
            );


        table.innerHTML = "";


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


        students.forEach(function (student) {

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    ${escapeHtml(student.id)}
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
                        student.active === true
                        ? "✅ نشط"
                        : "⛔ متوقف"
                    }
                </td>

                <td>
                    ${formatDate(
                        student.expiresAt
                    )}
                </td>

                <td>

                    <button
                        class="admin-btn primary-btn"
                        onclick="editStudent('${escapeAttribute(student.id)}')">

                        ✏️

                    </button>

                    <button
                        class="admin-btn success-btn"
                        onclick="extendStudent('${escapeAttribute(student.id)}')">

                        ⏳

                    </button>

                    <button
                        class="admin-btn"
                        onclick="toggleStudent('${escapeAttribute(student.id)}')">

                        ${
                            student.active === true
                            ? "⛔"
                            : "✅"
                        }

                    </button>

                    <button
                        class="admin-btn"
                        onclick="resetDevice('${escapeAttribute(student.id)}')">

                        📱

                    </button>

                    <button
                        class="admin-btn danger-btn"
                        onclick="deleteCode('${escapeAttribute(student.id)}')">

                        🗑️

                    </button>

                </td>

            `;


            table.appendChild(row);

        });

    }


    // ==========================================
    // البحث
    // ==========================================

    const searchInput =
        document.getElementById(
            "studentSearch"
        );


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            function () {

                const value =
                    this.value
                        .trim()
                        .toLowerCase();


                const filtered =
                    allStudents.filter(
                        function (student) {

                            return (

                                String(student.id)
                                    .toLowerCase()
                                    .includes(value)

                                ||

                                String(
                                    student.name || ""
                                )
                                .toLowerCase()
                                .includes(value)

                                ||

                                String(
                                    student.email || ""
                                )
                                .toLowerCase()
                                .includes(value)

                            );

                        }
                    );


                renderStudents(filtered);

            }
        );

    }


    // ==========================================
    // تعديل الطالب
    // ==========================================

    window.editStudent =
        function (code) {

            const student =
                allStudents.find(
                    function (item) {
                        return item.id === code;
                    }
                );


            if (!student) {

                alert(
                    "❌ الطالب غير موجود"
                );

                return;

            }


            const name =
                prompt(
                    "اسم الطالب:",
                    student.name || ""
                );


            if (name === null) {
                return;
            }


            const grade =
                prompt(
                    "الصف:",
                    student.grade || ""
                );


            if (grade === null) {
                return;
            }


            const password =
                prompt(
                    "كلمة المرور:",
                    student.password || ""
                );


            if (password === null) {
                return;
            }


            db.collection("students")
                .doc(code)
                .update({

                    name: name.trim(),

                    grade: grade.trim(),

                    password: password.trim()

                })

                .then(function () {

                    alert(
                        "✅ تم تعديل بيانات الطالب"
                    );

                    loadStudents();

                    loadCodes();

                })

                .catch(function (error) {

                    console.error(error);

                    alert(
                        "❌ فشل تعديل البيانات\n\n" +
                        error.message
                    );

                });

        };


    // ==========================================
    // تمديد الاشتراك
    // ==========================================

    window.extendStudent =
        function (code) {

            const days =
                prompt(
                    "عدد الأيام التي تريد إضافتها:",
                    "30"
                );


            if (days === null) {
                return;
            }


            const numberOfDays =
                Number(days);


            if (
                !numberOfDays ||
                numberOfDays < 1
            ) {

                alert(
                    "❌ أدخل عدد أيام صحيح"
                );

                return;

            }


            db.collection("students")
                .doc(code)
                .get()

                .then(function (doc) {

                    if (!doc.exists) {

                        throw new Error(
                            "الطالب غير موجود"
                        );

                    }


                    const student =
                        doc.data();


                    let currentExpiry =
                        getDate(
                            student.expiresAt
                        );


                    if (
                        !currentExpiry ||
                        currentExpiry < new Date()
                    ) {

                        currentExpiry =
                            new Date();

                    }


                    currentExpiry.setDate(
                        currentExpiry.getDate() +
                        numberOfDays
                    );


                    return db.collection("students")
                        .doc(code)
                        .update({

                            expiresAt:
                                firebase.firestore
                                    .Timestamp
                                    .fromDate(
                                        currentExpiry
                                    ),

                            active: true

                        });

                })

                .then(function () {

                    alert(
                        "✅ تم تمديد الاشتراك بنجاح"
                    );

                    loadStudents();

                    loadCodes();

                    loadDashboard();

                })

                .catch(function (error) {

                    console.error(error);

                    alert(
                        "❌ فشل تمديد الاشتراك\n\n" +
                        error.message
                    );

                });

        };


    // ==========================================
    // تفعيل / إيقاف الطالب
    // ==========================================

    window.toggleStudent =
        function (code) {

            db.collection("students")
                .doc(code)
                .get()

                .then(function (doc) {

                    if (!doc.exists) {

                        throw new Error(
                            "الطالب غير موجود"
                        );

                    }


                    const student =
                        doc.data();


                    const newStatus =
                        student.active !== true;


                    return db.collection("students")
                        .doc(code)
                        .update({

                            active: newStatus

                        });

                })

                .then(function () {

                    alert(
                        "✅ تم تغيير حالة الطالب"
                    );

                    loadStudents();

                    loadCodes();

                    loadDashboard();

                })

                .catch(function (error) {

                    console.error(error);

                    alert(
                        "❌ فشل تغيير حالة الطالب\n\n" +
                        error.message
                    );

                });

        };


    // ==========================================
    // فك الجهاز
    // ==========================================

    window.resetDevice =
        function (code) {

            if (
                !confirm(
                    "📱 هل تريد فك الجهاز المرتبط بهذا الطالب؟"
                )
            ) {

                return;

            }


            db.collection("students")
                .doc(code)
                .update({

                    deviceId: ""

                })

                .then(function () {

                    alert(
                        "✅ تم فك الجهاز بنجاح"
                    );

                    loadStudents();

                })

                .catch(function (error) {

                    console.error(error);

                    alert(
                        "❌ فشل فك الجهاز\n\n" +
                        error.message
                    );

                });

        };


    // ==========================================
    // إضافة كود
    // ==========================================

    window.createStudentCode =
        function () {

            const code =
                document.getElementById(
                    "newCode"
                )
                .value
                .trim();


            const password =
                document.getElementById(
                    "newPassword"
                )
                .value
                .trim();


            const name =
                document.getElementById(
                    "newName"
                )
                .value
                .trim();


            const grade =
                document.getElementById(
                    "newGrade"
                )
                .value;


            const days =
                Number(
                    document.getElementById(
                        "subscriptionDays"
                    ).value
                );


            if (
                !code ||
                !password ||
                !name ||
                !grade
            ) {

                alert(
                    "⚠️ من فضلك أكمل جميع البيانات"
                );

                return;

            }


            if (!days || days < 1) {

                alert(
                    "❌ مدة الاشتراك غير صحيحة"
                );

                return;

            }


            db.collection("students")
                .doc(code)
                .get()

                .then(function (existing) {

                    if (existing.exists) {

                        throw new Error(
                            "هذا الكود موجود بالفعل"
                        );

                    }


                    const expiresAt =
                        new Date();


                    expiresAt.setDate(
                        expiresAt.getDate() +
                        days
                    );


                    return db.collection("students")
                        .doc(code)
                        .set({

                            name: name,

                            password: password,

                            grade: grade,

                            active: true,

                            expiresAt:
                                firebase.firestore
                                    .Timestamp
                                    .fromDate(
                                        expiresAt
                                    ),

                            deviceId: "",

                            createdAt:
                                firebase.firestore
                                    .FieldValue
                                    .serverTimestamp()

                        });

                })

                .then(function () {

                    alert(
                        "✅ تم إنشاء كود الاشتراك بنجاح"
                    );


                    document.getElementById(
                        "newCode"
                    ).value = "";


                    document.getElementById(
                        "newPassword"
                    ).value = "";


                    document.getElementById(
                        "newName"
                    ).value = "";


                    loadCodes();

                    loadStudents();

                    loadDashboard();

                })

                .catch(function (error) {

                    console.error(
                        "Create Code Error:",
                        error
                    );


                    alert(
                        "❌ فشل إنشاء الكود\n\n" +
                        error.message
                    );

                });

        };


    // ==========================================
    // الأكواد
    // ==========================================

    function loadCodes() {

        db.collection("students")
            .get()

            .then(function (snapshot) {

                const table =
                    document.getElementById(
                        "codesTable"
                    );


                table.innerHTML = "";


                snapshot.forEach(function (doc) {

                    const student =
                        doc.data();


                    const row =
                        document.createElement("tr");


                    row.innerHTML = `

                        <td>
                            ${escapeHtml(doc.id)}
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
                                student.active === true
                                ? "✅ نشط"
                                : "⛔ متوقف"
                            }
                        </td>

                        <td>
                            ${formatDate(
                                student.expiresAt
                            )}
                        </td>

                        <td>

    <button
        class="admin-btn primary-btn"
        onclick="viewStudent('${escapeAttribute(student.id)}')">

        👁️

    </button>

    <button
        class="admin-btn primary-btn"
        onclick="editStudent('${escapeAttribute(student.id)}')">

        ✏️

    </button>

                            <button
                                class="admin-btn success-btn"
                                onclick="extendStudent('${escapeAttribute(doc.id)}')">

                                ⏳

                            </button>

                            <button
                                class="admin-btn danger-btn"
                                onclick="deleteCode('${escapeAttribute(doc.id)}')">

                                🗑️

                            </button>

                        </td>

                    `;


                    table.appendChild(row);

                });

            })

            .catch(function (error) {

                console.error(
                    "Codes Error:",
                    error
                );

            });

    }


    // ==========================================
    // حذف كود
    // ==========================================

    window.deleteCode =
        function (code) {

            if (
                !confirm(
                    "⚠️ هل أنت متأكد من حذف الطالب والكود؟\n\n" +
                    code
                )
            ) {

                return;

            }


            db.collection("students")
                .doc(code)
                .delete()

                .then(function () {

                    alert(
                        "✅ تم حذف الطالب والكود"
                    );

                    loadCodes();

                    loadStudents();

                    loadDashboard();

                })

                .catch(function (error) {

                    console.error(error);

                    alert(
                        "❌ فشل الحذف\n\n" +
                        error.message
                    );

                });

        };


    // ==========================================
    // النتائج
    // ==========================================

    function loadResults() {

        db.collection("results")
            .orderBy(
                "createdAt",
                "desc"
            )
            .limit(100)
            .get()

            .then(function (snapshot) {

                let html = `

                    <table>

                    <thead>

                    <tr>

                        <th>الطالب</th>
                        <th>المادة</th>
                        <th>Chapter</th>
                        <th>الدرجة</th>
                        <th>النسبة</th>
                        <th>التاريخ</th>

                    </tr>

                    </thead>

                    <tbody>

                `;


                snapshot.forEach(function (doc) {

                    const data =
                        doc.data();


                    html += `

                        <tr>

                            <td>
                                ${escapeHtml(
                                    data.studentName ||
                                    data.name ||
                                    data.studentCode ||
                                    "-"
                                )}
                            </td>

                            <td>
                                ${escapeHtml(
                                    data.subject || "-"
                                )}
                            </td>

                            <td>
                                ${escapeHtml(
                                    data.chapter || "-"
                                )}
                            </td>

                            <td>
                                ${escapeHtml(
                                    String(
                                        data.score ?? "-"
                                    )
                                )}
                            </td>

                            <td>
                                ${escapeHtml(
                                    String(
                                        data.percentage ?? "-"
                                    )
                                )}%
                            </td>

                            <td>
                                ${formatDate(
                                    data.createdAt
                                )}
                            </td>

                        </tr>

                    `;

                });


                html += `

                    </tbody>

                    </table>

                `;


                document.getElementById(
                    "resultsTable"
                ).innerHTML = html;

            })

            .catch(function (error) {

                console.error(
                    "Results Error:",
                    error
                );


                document.getElementById(
                    "resultsTable"
                ).innerHTML =
                    "❌ تعذر تحميل النتائج";

            });

    }


    // ==========================================
    // Leaderboard
    // ==========================================

    function loadLeaderboard() {

        db.collection("leaderboard")
            .get()

            .then(function (snapshot) {

                let html = `

                    <table>

                    <thead>

                    <tr>

                        <th>الترتيب</th>
                        <th>الطالب</th>
                        <th>الصف</th>
                        <th>المتوسط</th>

                    </tr>

                    </thead>

                    <tbody>

                `;


                let position = 1;


                snapshot.forEach(function (doc) {

                    const data =
                        doc.data();


                    html += `

                        <tr>

                            <td>
                                ${position++}
                            </td>

                            <td>
                                ${escapeHtml(
                                    data.name ||
                                    data.studentName ||
                                    "-"
                                )}
                            </td>

                            <td>
                                ${escapeHtml(
                                    data.grade || "-"
                                )}
                            </td>

                            <td>
                                ${escapeHtml(
                                    String(
                                        data.average ??
                                        data.score ??
                                        "-"
                                    )
                                )}
                            </td>

                        </tr>

                    `;

                });


                html += `

                    </tbody>

                    </table>

                `;


                document.getElementById(
                    "leaderboardTable"
                ).innerHTML = html;

            })

            .catch(function (error) {

                console.error(
                    "Leaderboard Error:",
                    error
                );

            });

    }


    // ==========================================
    // تسجيل الخروج
    // ==========================================

    window.logoutAdmin =
        function () {

            firebase.auth()
                .signOut()
                .then(function () {

                    window.location.href =
                        "admin-login.html";

                });

        };


    // ==========================================
    // أدوات مساعدة
    // ==========================================

    function setText(id, value) {

        const element =
            document.getElementById(id);


        if (element) {
            element.textContent = value;
        }

    }


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


    function escapeHtml(value) {

        return String(
            value ?? ""
        )
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    }


    function escapeAttribute(value) {

        return String(value ?? "")
            .replace(/\\/g, "\\\\")
            .replace(/'/g, "\\'");

    }

    /* ==========================================
عرض تفاصيل الطالب
========================================== */

window.viewStudent = function (code) {

const student = allStudents.find(
    function (item) {
        return item.id === code;
    }
);

if (!student) {

    alert("❌ الطالب غير موجود");

    return;
}

const modal =
    document.getElementById("studentModal");

const details =
    document.getElementById("studentDetails");

const expiry =
    getDate(student.expiresAt);

let status = "⛔ متوقف";

if (student.active === true) {

    if (
        expiry &&
        new Date() >= expiry
    ) {

        status = "⛔ منتهي";

    } else {

        status = "✅ نشط";

    }

}

details.innerHTML = `

    <div class="student-info-grid">

        <div class="student-info">

            <small>🔑 كود الطالب</small>

            <strong>
                ${escapeHtml(student.id)}
            </strong>

        </div>


        <div class="student-info">

            <small>👨‍🎓 الاسم</small>

            <strong>
                ${escapeHtml(
                    student.name || "-"
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

            <small>📊 حالة الاشتراك</small>

            <strong>
                ${status}
            </strong>

        </div>


        <div class="student-info">

            <small>📅 تاريخ الانتهاء</small>

            <strong>
                ${formatDate(
                    student.expiresAt
                )}
            </strong>

        </div>


        <div class="student-info">

            <small>📱 الجهاز</small>

            <strong>
                ${
                    student.deviceId
                        ? "📱 جهاز مرتبط"
                        : "❌ لا يوجد جهاز"
                }
            </strong>

        </div>


        <div class="student-info">

            <small>📅 تاريخ التسجيل</small>

            <strong>
                ${formatDate(
                    student.createdAt
                )}
            </strong>

        </div>

    </div>


    <h3 class="student-detail-title">
        ⚙️ إجراءات الطالب
    </h3>


    <div style="
        display:flex;
        gap:10px;
        flex-wrap:wrap;
    ">

        <button
            class="admin-btn primary-btn"
            onclick="closeStudentModal(); editStudent('${escapeAttribute(student.id)}')">

            ✏️ تعديل

        </button>


        <button
            class="admin-btn success-btn"
            onclick="closeStudentModal(); extendStudent('${escapeAttribute(student.id)}')">

            ⏳ تمديد

        </button>


        <button
            class="admin-btn danger-btn"
            onclick="closeStudentModal(); deleteCode('${escapeAttribute(student.id)}')">

            🗑️ حذف

        </button>

    </div>

`;

modal.classList.remove("hidden");

};

/* ==========================================
إغلاق التفاصيل
========================================== */

window.closeStudentModal = function () {

const modal =
    document.getElementById("studentModal");

if (modal) {

    modal.classList.add("hidden");

}

};

/* إغلاق عند الضغط خارج النافذة */

document.addEventListener(
"click",
function (event) {

    const modal =
        document.getElementById("studentModal");

    if (
        modal &&
        event.target === modal
    ) {

        closeStudentModal();

    }

}

);
})();
