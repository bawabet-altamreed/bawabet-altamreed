// ==========================================
// بوابة التمريض
// Admin Panel
// ==========================================

(function () {

    // ==========================================
    // UID حساب الأدمن الجديد
    // ==========================================

    const ADMIN_UID =
        "H4wMJm2ComSSy19ttzb1KxZz7Yu1";


    const loading =
        document.getElementById("loading");

    const accessDenied =
        document.getElementById("accessDenied");

    const adminPanel =
        document.getElementById("adminPanel");


    // ==========================================
    // التحقق من حساب Firebase
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


            // ==================================
            // التحقق من UID الأدمن
            // ==================================

            if (
                user.uid !== ADMIN_UID
            ) {

                showDenied();

                return;

            }


            // ==================================
            // السماح بالدخول
            // ==========================================

            loading.classList.add(
                "hidden"
            );

            adminPanel.classList.remove(
                "hidden"
            );


            loadDashboard();

        }
    );


    // ==========================================
    // رفض الدخول
    // ==========================================

    function showDenied() {

        loading.classList.add(
            "hidden"
        );

        adminPanel.classList.add(
            "hidden"
        );

        accessDenied.classList.remove(
            "hidden"
        );

    }


    // ==========================================
    // التنقل بين الأقسام
    // ==========================================

    window.showSection =
        function (sectionId) {

            document
                .querySelectorAll(".section")
                .forEach(function (section) {

                    section.classList.remove(
                        "active"
                    );

                });


            const section =
                document.getElementById(
                    sectionId
                );


            if (section) {

                section.classList.add(
                    "active"
                );

            }


            // تحميل البيانات عند فتح القسم

            if (
                sectionId === "students"
            ) {

                loadStudents();

            }


            if (
                sectionId === "codes"
            ) {

                loadCodes();

            }


            if (
                sectionId === "results"
            ) {

                loadResults();

            }


            if (
                sectionId === "leaderboard"
            ) {

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


                snapshot.forEach(
                    function (doc) {

                        total++;


                        const student =
                            doc.data();


                        if (
                            student.active === true
                        ) {

                            active++;

                        }


                        if (
                            student.expiresAt
                        ) {

                            let expiry;


                            if (
                                typeof student
                                    .expiresAt
                                    .toDate ===
                                "function"
                            ) {

                                expiry =
                                    student
                                        .expiresAt
                                        .toDate();

                            } else {

                                expiry =
                                    new Date(
                                        student
                                            .expiresAt
                                    );

                            }


                            if (
                                !isNaN(
                                    expiry.getTime()
                                ) &&
                                new Date() >= expiry
                            ) {

                                expired++;

                            }

                        }

                    }
                );


                document.getElementById(
                    "totalStudents"
                ).textContent = total;


                document.getElementById(
                    "activeStudents"
                ).textContent = active;


                document.getElementById(
                    "expiredStudents"
                ).textContent = expired;

            })


            .catch(function (error) {

                console.error(
                    "Dashboard Students Error:",
                    error
                );

            });


        db.collection("results")
            .get()

            .then(function (snapshot) {

                let total = 0;

                let sum = 0;


                snapshot.forEach(
                    function (doc) {

                        total++;


                        const data =
                            doc.data();


                        let score =
                            Number(
                                data.percentage ??
                                data.score ??
                                0
                            );


                        if (
                            !isNaN(score)
                        ) {

                            sum += score;

                        }

                    }
                );


                const average =
                    total > 0
                        ? Math.round(
                            sum / total
                        )
                        : 0;


                document.getElementById(
                    "totalResults"
                ).textContent = total;


                document.getElementById(
                    "averageScore"
                ).textContent =
                    average + "%";

            })


            .catch(function (error) {

                console.error(
                    "Dashboard Results Error:",
                    error
                );

            });

    }


    // ==========================================
    // تحميل الطلاب
    // ==========================================

    let allStudents = [];


    function loadStudents() {

        db.collection("students")
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


                renderStudents(
                    allStudents
                );

            })

            .catch(function (error) {

                console.error(
                    "Students Error:",
                    error
                );

            });

    }


    // ==========================================
    // عرض الطلاب
    // ==========================================

    function renderStudents(
        students
    ) {

        const table =
            document.getElementById(
                "studentsTable"
            );


        table.innerHTML = "";


        students.forEach(
            function (student) {

                const row =
                    document.createElement(
                        "tr"
                    );


                row.innerHTML = `

                    <td>${escapeHtml(student.id)}</td>

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
                            : "⛔ غير نشط"
                        }
                    </td>

                    <td>
                        ${formatDate(
                            student.expiresAt
                        )}
                    </td>

                    <td>
                        ${
                            student.deviceId
                            ? "📱 مرتبط"
                            : "—"
                        }
                    </td>

                `;


                table.appendChild(row);

            }
        );

    }


    // ==========================================
    // بحث الطلاب
    // ==========================================

    document
        .getElementById(
            "studentSearch"
        )
        .addEventListener(
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

                                String(
                                    student.id
                                )
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


                renderStudents(
                    filtered
                );

            }
        );


    // ==========================================
    // إضافة كود جديد
    // ==========================================

    window.createStudentCode =
        function () {

            const code =
                document
                    .getElementById(
                        "newCode"
                    )
                    .value
                    .trim();


            const password =
                document
                    .getElementById(
                        "newPassword"
                    )
                    .value
                    .trim();


            const name =
                document
                    .getElementById(
                        "newName"
                    )
                    .value
                    .trim();


            const grade =
                document
                    .getElementById(
                        "newGrade"
                    )
                    .value;


            const days =
                Number(
                    document
                        .getElementById(
                            "subscriptionDays"
                        )
                        .value
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


            const expiresAt =
                new Date();


            expiresAt.setDate(
                expiresAt.getDate() +
                days
            );


            db.collection("students")
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

                })

                .then(function () {

                    alert(
                        "✅ تم إنشاء كود الاشتراك بنجاح"
                    );


                    document
                        .getElementById(
                            "newCode"
                        )
                        .value = "";


                    document
                        .getElementById(
                            "newPassword"
                        )
                        .value = "";


                    document
                        .getElementById(
                            "newName"
                        )
                        .value = "";


                    loadCodes();

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
    // تحميل الأكواد
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


                snapshot.forEach(
                    function (doc) {

                        const student =
                            doc.data();


                        const row =
                            document.createElement(
                                "tr"
                            );


                        row.innerHTML = `

                            <td>
                                ${escapeHtml(
                                    doc.id
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
                                    student.active === true
                                    ? "✅"
                                    : "⛔"
                                }
                            </td>

                            <td>
                                ${formatDate(
                                    student.expiresAt
                                )}
                            </td>

                            <td>

                                <button
                                    class="admin-btn danger-btn"
                                    onclick="deleteCode('${escapeAttribute(doc.id)}')">

                                    🗑️

                                </button>

                            </td>

                        `;


                        table.appendChild(
                            row
                        );

                    }
                );

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
                    "⚠️ هل أنت متأكد من حذف الكود؟\n\n" +
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
                        "✅ تم حذف الكود"
                    );


                    loadCodes();

                    loadDashboard();

                })

                .catch(function (error) {

                    console.error(
                        "Delete Code Error:",
                        error
                    );


                    alert(
                        "❌ فشل حذف الكود\n\n" +
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


                snapshot.forEach(
                    function (doc) {

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
                                        data.subject ||
                                        "-"
                                    )}
                                </td>

                                <td>
                                    ${escapeHtml(
                                        data.chapter ||
                                        "-"
                                    )}
                                </td>

                                <td>
                                    ${escapeHtml(
                                        String(
                                            data.score ??
                                            "-"
                                        )
                                    )}
                                </td>

                                <td>
                                    ${escapeHtml(
                                        String(
                                            data.percentage ??
                                            "-"
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

                    }
                );


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


                snapshot.forEach(
                    function (doc) {

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
                                        data.grade ||
                                        "-"
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

                    }
                );


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
    // تسجيل خروج الأدمن
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
    // التاريخ
    // ==========================================

    function formatDate(value) {

        if (!value) {

            return "-";

        }


        let date;


        if (
            typeof value.toDate ===
            "function"
        ) {

            date =
                value.toDate();

        } else {

            date =
                new Date(value);

        }


        if (
            isNaN(
                date.getTime()
            )
        ) {

            return "-";

        }


        return date.toLocaleDateString(
            "ar-EG"
        );

    }


    // ==========================================
    // حماية HTML
    // ==========================================

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


    function escapeAttribute(value) {

        return String(value ?? "")
            .replace(
                /\\/g,
                "\\\\"
            )
            .replace(
                /'/g,
                "\\'"
            );

    }

})();
