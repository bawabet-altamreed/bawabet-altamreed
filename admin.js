// ==========================================
// بوابة التمريض
// Admin Panel
// إدارة الطلاب والأكواد والنتائج والمحتوى
// الطلاب + أولياء الأمور
// ==========================================

(function () {

    // ==========================================
    // UID الخاص بالأدمن
    // ==========================================

    const ADMIN_UID =
        "H4wMJm2ComSSy19ttzb1KxZz7Yu1";


    // ==========================================
    // عناصر الصفحة
    // ==========================================

    const loading =
        document.getElementById("loading");

    const accessDenied =
        document.getElementById("accessDenied");

    const adminPanel =
        document.getElementById("adminPanel");


    // ==========================================
    // بيانات مؤقتة
    // ==========================================

    let allStudents = [];

    let allContent = [];


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


            if (user.uid !== ADMIN_UID) {

                showDenied();

                return;

            }


            if (loading) {

                loading.classList.add("hidden");

            }

            if (accessDenied) {

                accessDenied.classList.add("hidden");

            }

            if (adminPanel) {

                adminPanel.classList.remove("hidden");

            }


            loadDashboard();

        }
    );


    // ==========================================
    // رفض الدخول
    // ==========================================

    function showDenied() {

        if (loading) {

            loading.classList.add("hidden");

        }

        if (adminPanel) {

            adminPanel.classList.add("hidden");

        }

        if (accessDenied) {

            accessDenied.classList.remove("hidden");

        }

    }


    // ==========================================
    // التنقل بين الأقسام
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


            if (sectionId === "dashboard") {

                loadDashboard();

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


            if (sectionId === "content") {

                loadContent();

            }


            if (sectionId === "notifications") {

                loadNotifications();

            }

        };


    // ==========================================
    // Dashboard
    // ==========================================

    function loadDashboard() {

        // --------------------------------------
        // الطلاب
        // --------------------------------------

        db.collection("students")
            .get()

            .then(function (snapshot) {

                let total = 0;

                let active = 0;

                let expired = 0;


                snapshot.forEach(function (doc) {

                    total++;


                    const student =
                        doc.data();


                    const expiry =
                        getDate(
                            student.expiresAt
                        );


                    if (
                        student.active === true &&
                        (
                            !expiry ||
                            new Date() < expiry
                        )
                    ) {

                        active++;

                    }


                    if (
                        expiry &&
                        new Date() >= expiry
                    ) {

                        expired++;

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

            .catch(function (error) {

                console.error(
                    "Dashboard Students Error:",
                    error
                );

            });


        // --------------------------------------
        // النتائج
        // --------------------------------------

        db.collection("results")
            .get()

            .then(function (snapshot) {

                let total = 0;

                let sum = 0;


                snapshot.forEach(function (doc) {

                    total++;


                    const data =
                        doc.data();


                    let score =
                        Number(
                            data.percentage ??
                            data.score ??
                            0
                        );


                    if (!isNaN(score)) {

                        if (
                            score > 0 &&
                            score <= 1
                        ) {

                            score *= 100;

                        }


                        sum += score;

                    }

                });


                const average =
                    total > 0
                        ? Math.round(
                            sum / total
                        )
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

            .catch(function (error) {

                console.error(
                    "Dashboard Results Error:",
                    error
                );

            });

    }


    // ==========================================
    // الطلاب
    // ==========================================

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


                renderStudents(
                    allStudents
                );

            })

            .catch(function (error) {

                console.error(
                    "Students Error:",
                    error
                );


                const table =
                    document.getElementById(
                        "studentsTable"
                    );


                if (table) {

                    table.innerHTML = `

                        <tr>

                            <td colspan="6">

                                ❌ تعذر تحميل الطلاب

                            </td>

                        </tr>

                    `;

                }


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


        if (!table) {

            return;

        }


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


            const expiry =
                getDate(
                    student.expiresAt
                );


            let status =
                "⛔ متوقف";


            if (
                student.active === true
            ) {

                if (
                    expiry &&
                    new Date() >= expiry
                ) {

                    status =
                        "⛔ منتهي";

                }

                else {

                    status =
                        "✅ نشط";

                }

            }


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
                    ${status}
                </td>

                <td>
                    ${formatDate(
                        student.expiresAt
                    )}
                </td>

                <td>

                    <button
                        class="admin-btn primary-btn"
                        title="عرض التفاصيل"
                        onclick="viewStudent('${escapeAttribute(student.id)}')">

                        👁️

                    </button>


                    <button
                        class="admin-btn primary-btn"
                        title="تعديل"
                        onclick="editStudent('${escapeAttribute(student.id)}')">

                        ✏️

                    </button>


                    <button
                        class="admin-btn success-btn"
                        title="تمديد"
                        onclick="extendStudent('${escapeAttribute(student.id)}')">

                        ⏳

                    </button>


                    <button
                        class="admin-btn"
                        title="تفعيل / إيقاف"
                        onclick="toggleStudent('${escapeAttribute(student.id)}')">

                        ${
                            student.active === true
                                ? "⛔"
                                : "✅"
                        }

                    </button>


                    <button
                        class="admin-btn"
                        title="فك الجهاز"
                        onclick="resetDevice('${escapeAttribute(student.id)}')">

                        📱

                    </button>


                    <button
                        class="admin-btn danger-btn"
                        title="حذف"
                        onclick="deleteCode('${escapeAttribute(student.id)}')">

                        🗑️

                    </button>

                </td>

            `;


            table.appendChild(row);

        });

    }


    // ==========================================
    // البحث عن طالب
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
                    "كلمة مرور الطالب:",
                    student.password || ""
                );


            if (password === null) {

                return;

            }


            db.collection("students")
                .doc(code)
                .update({

                    name:
                        name.trim(),

                    grade:
                        grade.trim(),

                    password:
                        password.trim()

                })

                .then(function () {

                    alert(
                        "✅ تم تعديل بيانات الطالب"
                    );


                    loadStudents();

                    loadCodes();

                    loadDashboard();

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

                            active:
                                true

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

                            active:
                                newStatus

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

                    loadCodes();

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
    // إضافة طالب + ولي أمر
    //
    // الأكواد يتم إدخالها يدويًا
    // ==========================================

    window.createStudentCode =
        function () {

            // --------------------------------------
            // بيانات الطالب
            // --------------------------------------

            const codeElement =
                document.getElementById(
                    "newCode"
                );


            const passwordElement =
                document.getElementById(
                    "newPassword"
                );


            const nameElement =
                document.getElementById(
                    "newName"
                );


            const gradeElement =
                document.getElementById(
                    "newGrade"
                );


            const daysElement =
                document.getElementById(
                    "subscriptionDays"
                );


            // --------------------------------------
            // بيانات ولي الأمر
            // --------------------------------------

            const parentNameElement =
                document.getElementById(
                    "newParentName"
                );


            const parentCodeElement =
                document.getElementById(
                    "newParentCode"
                );


            const parentPasswordElement =
                document.getElementById(
                    "newParentPassword"
                );


            // --------------------------------------
            // التأكد من وجود الحقول
            // --------------------------------------

            if (
                !codeElement ||
                !passwordElement ||
                !nameElement ||
                !gradeElement ||
                !daysElement ||
                !parentNameElement ||
                !parentCodeElement ||
                !parentPasswordElement
            ) {

                alert(
                    "❌ يوجد حقل مفقود في HTML.\n\n" +
                    "تأكد من وجود:\n" +
                    "newCode\n" +
                    "newPassword\n" +
                    "newName\n" +
                    "newGrade\n" +
                    "subscriptionDays\n" +
                    "newParentName\n" +
                    "newParentCode\n" +
                    "newParentPassword"
                );

                return;

            }


            // --------------------------------------
            // قراءة بيانات الطالب
            // --------------------------------------

            const code =
                codeElement.value.trim();


            const password =
                passwordElement.value.trim();


            const name =
                nameElement.value.trim();


            const grade =
                gradeElement.value.trim();


            const days =
                Number(
                    daysElement.value
                );


            // --------------------------------------
            // قراءة بيانات ولي الأمر
            // --------------------------------------

            const parentName =
                parentNameElement.value.trim();


            const parentCode =
                parentCodeElement.value.trim();


            const parentPassword =
                parentPasswordElement.value.trim();


            // --------------------------------------
            // التحقق من بيانات الطالب
            // --------------------------------------

            if (
                !code ||
                !password ||
                !name ||
                !grade
            ) {

                alert(
                    "⚠️ من فضلك أكمل جميع بيانات الطالب"
                );

                return;

            }


            // --------------------------------------
            // التحقق من مدة الاشتراك
            // --------------------------------------

            if (
                !days ||
                days < 1
            ) {

                alert(
                    "❌ مدة الاشتراك غير صحيحة"
                );

                return;

            }


            // --------------------------------------
            // التحقق من بيانات ولي الأمر
            // --------------------------------------

            if (
                !parentName ||
                !parentCode ||
                !parentPassword
            ) {

                alert(
                    "⚠️ من فضلك أكمل جميع بيانات ولي الأمر"
                );

                return;

            }


            // --------------------------------------
            // منع استخدام نفس الكود
            // --------------------------------------

            if (
                code === parentCode
            ) {

                alert(
                    "❌ لا يمكن أن يكون كود الطالب هو نفس كود ولي الأمر"
                );

                return;

            }


            // --------------------------------------
            // حساب تاريخ انتهاء الاشتراك
            // --------------------------------------

            const expiresAt =
                new Date();


            expiresAt.setDate(
                expiresAt.getDate() +
                days
            );


            // --------------------------------------
            // تأكيد الإنشاء
            // --------------------------------------

            const confirmCreate =
                confirm(

                    "👨‍🎓 بيانات الطالب\n\n" +

                    "الاسم: " +
                    name +
                    "\n" +

                    "الكود: " +
                    code +
                    "\n" +

                    "الباسورد: " +
                    password +
                    "\n" +

                    "الصف: " +
                    grade +
                    "\n" +

                    "مدة الاشتراك: " +
                    days +
                    " يوم\n\n" +

                    "👨‍👩‍👦 بيانات ولي الأمر\n\n" +

                    "الاسم: " +
                    parentName +
                    "\n" +

                    "الكود: " +
                    parentCode +
                    "\n" +

                    "الباسورد: " +
                    parentPassword +
                    "\n\n" +

                    "هل تريد إنشاء الحسابين؟"

                );


            if (!confirmCreate) {

                return;

            }


            // --------------------------------------
            // التأكد من عدم وجود الطالب
            // --------------------------------------

            db.collection("students")
                .doc(code)
                .get()

                .then(function (existingStudent) {

                    if (existingStudent.exists) {

                        throw new Error(
                            "❌ كود الطالب موجود بالفعل"
                        );

                    }


                    // --------------------------------------
                    // التأكد من عدم وجود ولي الأمر
                    // --------------------------------------

                    return db.collection("parents")
                        .doc(parentCode)
                        .get();

                })


                .then(function (existingParent) {

                    if (existingParent.exists) {

                        throw new Error(
                            "❌ كود ولي الأمر موجود بالفعل"
                        );

                    }


                    // --------------------------------------
                    // Batch
                    // إنشاء الطالب وولي الأمر معًا
                    // --------------------------------------

                    const batch =
                        db.batch();


                    // --------------------------------------
                    // Student Document
                    // --------------------------------------

                    const studentRef =
                        db.collection("students")
                            .doc(code);


                    batch.set(
                        studentRef,
                        {

                            name:
                                name,

                            password:
                                password,

                            grade:
                                grade,

                            active:
                                true,

                            expiresAt:
                                firebase.firestore
                                    .Timestamp
                                    .fromDate(
                                        expiresAt
                                    ),

                            deviceId:
                                "",

                            createdAt:
                                firebase.firestore
                                    .FieldValue
                                    .serverTimestamp()

                        }
                    );


                    // --------------------------------------
                    // Parent Document
                    // --------------------------------------

                    const parentRef =
                        db.collection("parents")
                            .doc(parentCode);


                    batch.set(
                        parentRef,
                        {

                            parentName:
                                parentName,

                            password:
                                parentPassword,

                            studentCode:
                                code,

                            active:
                                true,

                            createdAt:
                                firebase.firestore
                                    .FieldValue
                                    .serverTimestamp()

                        }
                    );


                    // --------------------------------------
                    // تنفيذ العمليتين معًا
                    // --------------------------------------

                    return batch.commit();

                })


                // --------------------------------------
                // نجاح الإنشاء
                // --------------------------------------

                .then(function () {

                    alert(

                        "✅ تم إنشاء الحسابين بنجاح!\n\n" +

                        "👨‍🎓 الطالب\n" +

                        "الاسم: " +
                        name +
                        "\n" +

                        "الكود: " +
                        code +
                        "\n" +

                        "الباسورد: " +
                        password +
                        "\n\n" +

                        "👨‍👩‍👦 ولي الأمر\n" +

                        "الاسم: " +
                        parentName +
                        "\n" +

                        "الكود: " +
                        parentCode +
                        "\n" +

                        "الباسورد: " +
                        parentPassword

                    );


                    // --------------------------------------
                    // تنظيف بيانات الطالب
                    // --------------------------------------

                    codeElement.value = "";

                    passwordElement.value = "";

                    nameElement.value = "";

                    gradeElement.value = "";

                    daysElement.value = "30";


                    // --------------------------------------
                    // تنظيف بيانات ولي الأمر
                    // --------------------------------------

                    parentNameElement.value = "";

                    parentCodeElement.value = "";

                    parentPasswordElement.value = "";


                    // --------------------------------------
                    // تحديث لوحة الإدارة
                    // --------------------------------------

                    loadCodes();

                    loadStudents();

                    loadDashboard();

                })


                // --------------------------------------
                // الأخطاء
                // --------------------------------------

                .catch(function (error) {

                    console.error(
                        "Create Student + Parent Error:",
                        error
                    );


                    alert(

                        "❌ فشل إنشاء الحساب\n\n" +
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


                if (!table) {

                    return;

                }


                table.innerHTML = "";


                if (snapshot.empty) {

                    table.innerHTML = `

                        <tr>

                            <td colspan="6">

                                📭 لا توجد أكواد

                            </td>

                        </tr>

                    `;

                    return;

                }


                snapshot.forEach(function (doc) {

                    const student =
                        doc.data();


                    const expiry =
                        getDate(
                            student.expiresAt
                        );


                    let status =
                        "⛔ متوقف";


                    if (
                        student.active === true
                    ) {

                        if (
                            expiry &&
                            new Date() >= expiry
                        ) {

                            status =
                                "⛔ منتهي";

                        }

                        else {

                            status =
                                "✅ نشط";

                        }

                    }


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
                            ${status}
                        </td>

                        <td>
                            ${formatDate(
                                student.expiresAt
                            )}
                        </td>

                        <td>

                            <button
                                class="admin-btn primary-btn"
                                title="عرض التفاصيل"
                                onclick="viewStudent('${escapeAttribute(doc.id)}')">

                                👁️

                            </button>


                            <button
                                class="admin-btn primary-btn"
                                title="تعديل"
                                onclick="editStudent('${escapeAttribute(doc.id)}')">

                                ✏️

                            </button>


                            <button
                                class="admin-btn success-btn"
                                title="تمديد"
                                onclick="extendStudent('${escapeAttribute(doc.id)}')">

                                ⏳

                            </button>


                            <button
                                class="admin-btn danger-btn"
                                title="حذف"
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
    // حذف كود / طالب
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
                .get()

                .then(function (studentDoc) {

                    if (!studentDoc.exists) {

                        throw new Error(
                            "الطالب غير موجود"
                        );

                    }


                    const student =
                        studentDoc.data();


                    // ----------------------------------
                    // لو للطالب ولي أمر مرتبط به
                    // نحاول حذف ولي الأمر أيضًا
                    // ----------------------------------

                    return db.collection("parents")
                        .where(
                            "studentCode",
                            "==",
                            code
                        )
                        .get()

                        .then(function (parentsSnapshot) {

                            const batch =
                                db.batch();


                            batch.delete(
                                db.collection("students")
                                    .doc(code)
                            );


                            parentsSnapshot.forEach(
                                function (parentDoc) {

                                    batch.delete(
                                        parentDoc.ref
                                    );

                                }
                            );


                            return batch.commit();

                        });

                })

                .then(function () {

                    alert(
                        "✅ تم حذف الطالب والكود وحساب ولي الأمر المرتبط به"
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

                                <th>
                                    الطالب
                                </th>

                                <th>
                                    المادة
                                </th>

                                <th>
                                    Chapter
                                </th>

                                <th>
                                    الدرجة
                                </th>

                                <th>
                                    النسبة
                                </th>

                                <th>
                                    التاريخ
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                `;


                if (snapshot.empty) {

                    html += `

                        <tr>

                            <td colspan="6">

                                📭 لا توجد نتائج

                            </td>

                        </tr>

                    `;

                }


                snapshot.forEach(function (doc) {

                    const data =
                        doc.data();


                    let percentage =
                        data.percentage;


                    if (
                        percentage !== undefined &&
                        percentage !== null
                    ) {

                        percentage =
                            Number(
                                percentage
                            );


                        if (
                            percentage > 0 &&
                            percentage <= 1
                        ) {

                            percentage *= 100;

                        }

                    }


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

                                ${
                                    percentage !== undefined &&
                                    percentage !== null &&
                                    !isNaN(percentage)

                                    ? escapeHtml(
                                        String(
                                            Math.round(
                                                percentage
                                            )
                                        )
                                    ) + "%"

                                    : "-"

                                }

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


                const table =
                    document.getElementById(
                        "resultsTable"
                    );


                if (table) {

                    table.innerHTML =
                        html;

                }

            })

            .catch(function (error) {

                console.error(
                    "Results Error:",
                    error
                );


                const table =
                    document.getElementById(
                        "resultsTable"
                    );


                if (table) {

                    table.innerHTML = `

                        ❌ تعذر تحميل النتائج

                    `;

                }

            });

    }


    // ==========================================
    // Leaderboard
    // ==========================================

    function loadLeaderboard() {

        db.collection("leaderboard")
            .get()

            .then(function (snapshot) {

                let rows = [];


                snapshot.forEach(function (doc) {

                    rows.push({

                        id:
                            doc.id,

                        ...doc.data()

                    });

                });


                rows.sort(function (a, b) {

                    const scoreA =
                        Number(
                            a.average ??
                            a.score ??
                            0
                        );


                    const scoreB =
                        Number(
                            b.average ??
                            b.score ??
                            0
                        );


                    return scoreB - scoreA;

                });


                let html = `

                    <table>

                        <thead>

                            <tr>

                                <th>
                                    الترتيب
                                </th>

                                <th>
                                    الطالب
                                </th>

                                <th>
                                    الصف
                                </th>

                                <th>
                                    المتوسط
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                `;


                if (!rows.length) {

                    html += `

                        <tr>

                            <td colspan="4">

                                📭 لا توجد بيانات

                            </td>

                        </tr>

                    `;

                }


                rows.forEach(
                    function (data, index) {

                        html += `

                            <tr>

                                <td>

                                    ${
                                        index === 0
                                            ? "🥇"
                                            : index === 1
                                                ? "🥈"
                                                : index === 2
                                                    ? "🥉"
                                                    : index + 1
                                    }

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


                const table =
                    document.getElementById(
                        "leaderboardTable"
                    );


                if (table) {

                    table.innerHTML =
                        html;

                }

            })

            .catch(function (error) {

                console.error(
                    "Leaderboard Error:",
                    error
                );


                const table =
                    document.getElementById(
                        "leaderboardTable"
                    );


                if (table) {

                    table.innerHTML = `

                        ❌ تعذر تحميل لوحة الترتيب

                    `;

                }

            });

    }


    // ==========================================
    // إدارة المحتوى
    // ==========================================

    function loadContent() {

        db.collection("content")
            .orderBy(
                "createdAt",
                "desc"
            )
            .get()

            .then(function (snapshot) {

                allContent = [];


                snapshot.forEach(function (doc) {

                    allContent.push({

                        id:
                            doc.id,

                        ...doc.data()

                    });

                });


                renderContent(
                    allContent
                );

            })

            .catch(function (error) {

                console.error(
                    "Content Error:",
                    error
                );


                const table =
                    document.getElementById(
                        "contentTable"
                    );


                if (table) {

                    table.innerHTML = `

                        <tr>

                            <td colspan="7">

                                ❌ تعذر تحميل المحتوى

                            </td>

                        </tr>

                    `;

                }

            });

    }


    // ==========================================
    // عرض المحتوى
    // ==========================================

    function renderContent(contents) {

        const table =
            document.getElementById(
                "contentTable"
            );


        if (!table) {

            return;

        }


        table.innerHTML = "";


        if (!contents.length) {

            table.innerHTML = `

                <tr>

                    <td colspan="7">

                        📭 لا يوجد محتوى حاليًا

                    </td>

                </tr>

            `;

            return;

        }


        contents.forEach(function (content) {

            const row =
                document.createElement("tr");


            let typeText = "-";


            if (
                content.type === "pdf"
            ) {

                typeText =
                    "📄 PDF";

            }

            else if (
                content.type === "video"
            ) {

                typeText =
                    "🎬 فيديو";

            }

            else if (
                content.type === "quiz"
            ) {

                typeText =
                    "📝 اختبار";

            }

            else if (
                content.type === "chapter"
            ) {

                typeText =
                    "📚 Chapter";

            }


            const status =
                content.active === false
                    ? "⛔ مخفي"
                    : "✅ ظاهر";


            row.innerHTML = `

                <td>
                    ${escapeHtml(
                        content.grade || "-"
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        content.subject || "-"
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        content.chapter || "-"
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        content.title || "-"
                    )}
                </td>

                <td>
                    ${typeText}
                </td>

                <td>
                    ${status}
                </td>

                <td>

                    <button
                        class="admin-btn primary-btn"
                        title="تعديل"
                        onclick="editContent('${escapeAttribute(content.id)}')">

                        ✏️

                    </button>


                    <button
                        class="admin-btn"
                        title="إظهار / إخفاء"
                        onclick="toggleContent('${escapeAttribute(content.id)}')">

                        ${
                            content.active === false
                                ? "👁️"
                                : "⛔"
                        }

                    </button>


                    <button
                        class="admin-btn danger-btn"
                        title="حذف"
                        onclick="deleteContent('${escapeAttribute(content.id)}')">

                        🗑️

                    </button>

                </td>

            `;


            table.appendChild(row);

        });

    }


    // ==========================================
    // إضافة محتوى
    // ==========================================

    window.createContent =
        function () {

            const grade =
                document.getElementById(
                    "contentGrade"
                ).value;


            const subject =
                document.getElementById(
                    "contentSubject"
                ).value;


            const chapter =
                document.getElementById(
                    "contentChapter"
                )
                .value
                .trim();


            const title =
                document.getElementById(
                    "contentTitle"
                )
                .value
                .trim();


            const type =
                document.getElementById(
                    "contentType"
                ).value;


            const url =
                document.getElementById(
                    "contentUrl"
                )
                .value
                .trim();


            if (
                !grade ||
                !subject ||
                !chapter ||
                !title ||
                !type
            ) {

                alert(
                    "⚠️ من فضلك أكمل جميع البيانات"
                );

                return;

            }


            if (
                (
                    type === "pdf" ||
                    type === "video" ||
                    type === "quiz"
                ) &&
                !url
            ) {

                alert(
                    "⚠️ من فضلك أدخل رابط المحتوى"
                );

                return;

            }


            db.collection("content")
                .add({

                    grade:
                        grade,

                    subject:
                        subject,

                    chapter:
                        chapter,

                    title:
                        title,

                    type:
                        type,

                    url:
                        url,

                    active:
                        true,

                    createdAt:
                        firebase.firestore
                            .FieldValue
                            .serverTimestamp()

                })

                .then(function () {

                    alert(
                        "✅ تم إضافة المحتوى بنجاح"
                    );


                    document.getElementById(
                        "contentGrade"
                    ).value = "";


                    document.getElementById(
                        "contentSubject"
                    ).value = "";


                    document.getElementById(
                        "contentChapter"
                    ).value = "";


                    document.getElementById(
                        "contentTitle"
                    ).value = "";


                    document.getElementById(
                        "contentType"
                    ).value = "";


                    document.getElementById(
                        "contentUrl"
                    ).value = "";


                    loadContent();

                })

                .catch(function (error) {

                    console.error(
                        "Create Content Error:",
                        error
                    );


                    alert(
                        "❌ فشل إضافة المحتوى\n\n" +
                        error.message
                    );

                });

        };


    // ==========================================
    // تعديل المحتوى
    // ==========================================

    window.editContent =
        function (id) {

            const content =
                allContent.find(
                    function (item) {

                        return item.id === id;

                    }
                );


            if (!content) {

                alert(
                    "❌ المحتوى غير موجود"
                );

                return;

            }


            const title =
                prompt(
                    "عنوان المحتوى:",
                    content.title || ""
                );


            if (title === null) {

                return;

            }


            const chapter =
                prompt(
                    "Chapter:",
                    content.chapter || ""
                );


            if (chapter === null) {

                return;

            }


            const url =
                prompt(
                    "الرابط:",
                    content.url || ""
                );


            if (url === null) {

                return;

            }


            db.collection("content")
                .doc(id)
                .update({

                    title:
                        title.trim(),

                    chapter:
                        chapter.trim(),

                    url:
                        url.trim()

                })

                .then(function () {

                    alert(
                        "✅ تم تعديل المحتوى"
                    );


                    loadContent();

                })

                .catch(function (error) {

                    console.error(error);


                    alert(
                        "❌ فشل تعديل المحتوى\n\n" +
                        error.message
                    );

                });

        };


    // ==========================================
    // إظهار / إخفاء المحتوى
    // ==========================================

    window.toggleContent =
        function (id) {

            const content =
                allContent.find(
                    function (item) {

                        return item.id === id;

                    }
                );


            if (!content) {

                alert(
                    "❌ المحتوى غير موجود"
                );

                return;

            }


            const newStatus =
                content.active === false;


            db.collection("content")
                .doc(id)
                .update({

                    active:
                        newStatus

                })

                .then(function () {

                    alert(
                        newStatus
                            ? "✅ تم إظهار المحتوى"
                            : "⛔ تم إخفاء المحتوى"
                    );


                    loadContent();

                })

                .catch(function (error) {

                    console.error(error);


                    alert(
                        "❌ فشل تغيير حالة المحتوى\n\n" +
                        error.message
                    );

                });

        };


    // ==========================================
    // حذف المحتوى
    // ==========================================

    window.deleteContent =
        function (id) {

            const content =
                allContent.find(
                    function (item) {

                        return item.id === id;

                    }
                );


            if (!content) {

                alert(
                    "❌ المحتوى غير موجود"
                );

                return;

            }


            if (
                !confirm(
                    "⚠️ هل أنت متأكد من حذف هذا المحتوى؟\n\n" +
                    (
                        content.title ||
                        ""
                    )
                )
            ) {

                return;

            }


            db.collection("content")
                .doc(id)
                .delete()

                .then(function () {

                    alert(
                        "✅ تم حذف المحتوى"
                    );


                    loadContent();

                })

                .catch(function (error) {

                    console.error(error);


                    alert(
                        "❌ فشل حذف المحتوى\n\n" +
                        error.message
                    );

                });

        };


    // ==========================================
    // فلترة المحتوى
    // ==========================================

    function filterContent() {

        const subject =
            document.getElementById(
                "filterSubject"
            ).value;


        const grade =
            document.getElementById(
                "filterGrade"
            ).value;


        const filtered =
            allContent.filter(
                function (content) {

                    const subjectMatch =
                        !subject ||
                        content.subject === subject;


                    const gradeMatch =
                        !grade ||
                        content.grade === grade;


                    return (
                        subjectMatch &&
                        gradeMatch
                    );

                }
            );


        renderContent(
            filtered
        );

    }


    document.addEventListener(
        "change",
        function (event) {

            if (
                event.target.id ===
                "filterSubject"
            ) {

                filterContent();

            }


            if (
                event.target.id ===
                "filterGrade"
            ) {

                filterContent();

            }

        }
    );


    // ==========================================
    // عرض تفاصيل الطالب
    // ==========================================

    window.viewStudent =
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


            let status =
                "⛔ متوقف";


            if (
                student.active === true
            ) {

                if (
                    expiry &&
                    new Date() >= expiry
                ) {

                    status =
                        "⛔ منتهي";

                }

                else {

                    status =
                        "✅ نشط";

                }

            }


            details.innerHTML = `

                <div class="student-info-grid">


                    <div class="student-info">

                        <small>
                            🔑 كود الطالب
                        </small>

                        <strong>
                            ${escapeHtml(
                                student.id
                            )}
                        </strong>

                    </div>


                    <div class="student-info">

                        <small>
                            👨‍🎓 الاسم
                        </small>

                        <strong>
                            ${escapeHtml(
                                student.name || "-"
                            )}
                        </strong>

                    </div>


                    <div class="student-info">

                        <small>
                            🎓 الصف
                        </small>

                        <strong>
                            ${escapeHtml(
                                student.grade || "-"
                            )}
                        </strong>

                    </div>


                    <div class="student-info">

                        <small>
                            📧 البريد الإلكتروني
                        </small>

                        <strong>
                            ${escapeHtml(
                                student.email || "-"
                            )}
                        </strong>

                    </div>


                    <div class="student-info">

                        <small>
                            📊 حالة الاشتراك
                        </small>

                        <strong>
                            ${status}
                        </strong>

                    </div>


                    <div class="student-info">

                        <small>
                            📅 تاريخ الانتهاء
                        </small>

                        <strong>
                            ${formatDate(
                                student.expiresAt
                            )}
                        </strong>

                    </div>


                    <div class="student-info">

                        <small>
                            📱 الجهاز
                        </small>

                        <strong>

                            ${
                                student.deviceId
                                    ? "📱 جهاز مرتبط"
                                    : "❌ لا يوجد جهاز"
                            }

                        </strong>

                    </div>


                    <div class="student-info">

                        <small>
                            📅 تاريخ التسجيل
                        </small>

                        <strong>
                            ${formatDate(
                                student.createdAt
                            )}
                        </strong>

                    </div>


                    <div class="student-info">

                        <small>
                            ⏳ الأيام المتبقية
                        </small>

                        <strong>
                            ${getRemainingDays(
                                student.expiresAt
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
                        onclick="
                            closeStudentModal();
                            editStudent('${escapeAttribute(student.id)}')
                        ">

                        ✏️ تعديل

                    </button>


                    <button
                        class="admin-btn success-btn"
                        onclick="
                            closeStudentModal();
                            extendStudent('${escapeAttribute(student.id)}')
                        ">

                        ⏳ تمديد

                    </button>


                    <button
                        class="admin-btn"
                        onclick="
                            closeStudentModal();
                            toggleStudent('${escapeAttribute(student.id)}')
                        ">

                        ${
                            student.active === true
                                ? "⛔ إيقاف"
                                : "✅ تفعيل"
                        }

                    </button>


                    <button
                        class="admin-btn"
                        onclick="
                            closeStudentModal();
                            resetDevice('${escapeAttribute(student.id)}')
                        ">

                        📱 فك الجهاز

                    </button>


                    <button
                        class="admin-btn danger-btn"
                        onclick="
                            closeStudentModal();
                            deleteCode('${escapeAttribute(student.id)}')
                        ">

                        🗑️ حذف

                    </button>


                </div>

            `;


            modal.classList.remove(
                "hidden"
            );

        };


    // ==========================================
    // إغلاق تفاصيل الطالب
    // ==========================================

    window.closeStudentModal =
        function () {

            const modal =
                document.getElementById(
                    "studentModal"
                );


            if (modal) {

                modal.classList.add(
                    "hidden"
                );

            }

        };


    // ==========================================
    // إغلاق Modal عند الضغط خارجها
    // ==========================================

    document.addEventListener(
        "click",
        function (event) {

            const modal =
                document.getElementById(
                    "studentModal"
                );


            if (
                modal &&
                event.target === modal
            ) {

                closeStudentModal();

            }

        }
    );


    // ==========================================
    // Notifications
    // إدارة الإشعارات
    // ==========================================

    const notificationTargetType =
        document.getElementById(
            "notificationTargetType"
        );


    if (notificationTargetType) {

        notificationTargetType.addEventListener(
            "change",
            function () {

                const targetId =
                    document.getElementById(
                        "notificationTargetId"
                    );


                if (!targetId) {

                    return;

                }


                if (this.value === "all") {

                    targetId.style.display =
                        "none";

                    targetId.value = "";

                }

                else if (this.value === "grade") {

                    targetId.style.display =
                        "block";

                    targetId.placeholder =
                        "مثال: الصف الأول الثانوي التمريض";

                }

                else if (this.value === "student") {

                    targetId.style.display =
                        "block";

                    targetId.placeholder =
                        "اكتب كود الطالب";

                }

            }
        );

    }


    // ==========================================
    // إنشاء إشعار
    // ==========================================

    window.createNotification =
        function () {

            const targetType =
                document.getElementById(
                    "notificationTargetType"
                ).value;


            const targetId =
                document.getElementById(
                    "notificationTargetId"
                ).value
                .trim();


            const title =
                document.getElementById(
                    "notificationTitle"
                ).value
                .trim();


            const message =
                document.getElementById(
                    "notificationMessage"
                ).value
                .trim();


            if (!title || !message) {

                alert(
                    "⚠️ من فضلك اكتب عنوان الإشعار والرسالة"
                );

                return;

            }


            if (
                targetType !== "all" &&
                !targetId
            ) {

                alert(
                    "⚠️ من فضلك حدد الطالب أو الصف"
                );

                return;

            }


            const confirmSend =
                confirm(
                    "🔔 هل تريد إرسال هذا الإشعار؟\n\n" +
                    "العنوان: " +
                    title
                );


            if (!confirmSend) {

                return;

            }


            db.collection("notifications")
                .add({

                    title:
                        title,

                    message:
                        message,

                    targetType:
                        targetType,

                    targetId:
                        targetType === "all"
                            ? ""
                            : targetId,

                    createdAt:
                        firebase.firestore
                            .FieldValue
                            .serverTimestamp()

                })

                .then(function () {

                    alert(
                        "✅ تم إرسال الإشعار بنجاح 🔔"
                    );


                    document.getElementById(
                        "notificationTitle"
                    ).value = "";


                    document.getElementById(
                        "notificationMessage"
                    ).value = "";


                    document.getElementById(
                        "notificationTargetId"
                    ).value = "";


                    document.getElementById(
                        "notificationTargetType"
                    ).value = "all";


                    document.getElementById(
                        "notificationTargetId"
                    ).style.display = "none";


                    loadNotifications();

                })

                .catch(function (error) {

                    console.error(
                        "Create Notification Error:",
                        error
                    );


                    alert(
                        "❌ فشل إرسال الإشعار\n\n" +
                        error.message
                    );

                });

        };


    // ==========================================
    // تحميل الإشعارات
    // ==========================================

    function loadNotifications() {

        db.collection("notifications")
            .orderBy(
                "createdAt",
                "desc"
            )
            .get()

            .then(function (snapshot) {

                const table =
                    document.getElementById(
                        "notificationsTable"
                    );


                if (!table) {

                    return;

                }


                table.innerHTML = "";


                if (snapshot.empty) {

                    table.innerHTML = `

                        <tr>

                            <td colspan="5">

                                📭 لا توجد إشعارات

                            </td>

                        </tr>

                    `;

                    return;

                }


                snapshot.forEach(
                    function (doc) {

                        const data =
                            doc.data();


                        let targetText =
                            "📢 كل الطلاب";


                        if (
                            data.targetType ===
                            "grade"
                        ) {

                            targetText =
                                "🎓 " +
                                (
                                    data.targetId ||
                                    "-"
                                );

                        }


                        else if (
                            data.targetType ===
                            "student"
                        ) {

                            targetText =
                                "👤 " +
                                (
                                    data.targetId ||
                                    "-"
                                );

                        }


                        const row =
                            document.createElement(
                                "tr"
                            );


                        row.innerHTML = `

                            <td>
                                ${escapeHtml(
                                    data.title || "-"
                                )}
                            </td>


                            <td style="
                                max-width:300px;
                                white-space:normal;
                            ">

                                ${escapeHtml(
                                    data.message || "-"
                                )}

                            </td>


                            <td>
                                ${escapeHtml(
                                    targetText
                                )}
                            </td>


                            <td>
                                ${formatDate(
                                    data.createdAt
                                )}
                            </td>


                            <td>

                                <button
                                    class="admin-btn danger-btn"
                                    title="حذف"
                                    onclick="
                                        deleteNotification(
                                            '${escapeAttribute(doc.id)}'
                                        )
                                    ">

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
                    "Notifications Error:",
                    error
                );


                const table =
                    document.getElementById(
                        "notificationsTable"
                    );


                if (table) {

                    table.innerHTML = `

                        <tr>

                            <td colspan="5">

                                ❌ تعذر تحميل الإشعارات

                            </td>

                        </tr>

                    `;

                }

            });

    }


    // ==========================================
    // حذف إشعار
    // ==========================================

    window.deleteNotification =
        function (id) {

            if (
                !confirm(
                    "⚠️ هل أنت متأكد من حذف هذا الإشعار؟"
                )
            ) {

                return;

            }


            db.collection("notifications")
                .doc(id)
                .delete()

                .then(function () {

                    alert(
                        "✅ تم حذف الإشعار"
                    );


                    loadNotifications();

                })

                .catch(function (error) {

                    console.error(
                        "Delete Notification Error:",
                        error
                    );


                    alert(
                        "❌ فشل حذف الإشعار\n\n" +
                        error.message
                    );

                });

        };


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

                })

                .catch(function (error) {

                    console.error(
                        "Logout Error:",
                        error
                    );

                });

        };


    // ==========================================
    // أدوات مساعدة
    // ==========================================

    function setText(id, value) {

        const element =
            document.getElementById(id);


        if (element) {

            element.textContent =
                value;

        }

    }


    // ==========================================
    // تحويل Firebase Timestamp إلى Date
    // ==========================================

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


    // ==========================================
    // تنسيق التاريخ
    // ==========================================

    function formatDate(value) {

        const date =
            getDate(value);


        if (!date) {

            return "-";

        }


        return date.toLocaleDateString(
            "ar-EG",
            {

                year:
                    "numeric",

                month:
                    "2-digit",

                day:
                    "2-digit"

            }
        );

    }


    // ==========================================
    // الأيام المتبقية
    // ==========================================

    function getRemainingDays(value) {

        const expiry =
            getDate(value);


        if (!expiry) {

            return "-";

        }


        const now =
            new Date();


        const difference =
            expiry.getTime() -
            now.getTime();


        if (difference <= 0) {

            return "⛔ منتهي";

        }


        const days =
            Math.ceil(
                difference /
                (
                    1000 *
                    60 *
                    60 *
                    24
                )
            );


        return days + " يوم";

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


    // ==========================================
    // حماية Attributes
    // ==========================================

    function escapeAttribute(value) {

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
        );

    }


})();
