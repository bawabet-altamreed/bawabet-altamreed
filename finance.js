// ============================================================
// FINANCE SYSTEM
// بوابة التمريض
// ============================================================


import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";


import {
    getAuth,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


import {
    getFirestore,
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    query,
    orderBy,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// ============================================================
// FIREBASE CONFIG
// ============================================================

const firebaseConfig = {

    apiKey:
        "AIzaSyDLVKbfkhFsTGunLWEJmBN2eGg0tdqePyc",

    authDomain:
        "bawabet-al-tamreed.firebaseapp.com",

    projectId:
        "bawabet-al-tamreed",

    storageBucket:
        "bawabet-al-tamreed.firebasestorage.app",

    messagingSenderId:
        "668697400713",

    appId:
        "1:668697400713:web:ec5611e587dc3d3c237d58"

};


// ============================================================
// FIREBASE
// ============================================================

const app =
    initializeApp(firebaseConfig);


const auth =
    getAuth(app);


const db =
    getFirestore(app);


// ============================================================
// COLLECTIONS
// ============================================================

const revenuesRef =
    collection(
        db,
        "finance_revenues"
    );


const expensesRef =
    collection(
        db,
        "finance_expenses"
    );


// ============================================================
// STATE
// ============================================================

let currentUser = null;

let revenues = [];

let expenses = [];

let currentPeriod = "month";


// ============================================================
// ELEMENTS
// ============================================================

const sections = {

    overview:
        document.getElementById(
            "overviewSection"
        ),

    revenues:
        document.getElementById(
            "revenuesSection"
        ),

    expenses:
        document.getElementById(
            "expensesSection"
        ),

    reports:
        document.getElementById(
            "reportsSection"
        ),

    subscriptions:
        document.getElementById(
            "subscriptionsSection"
        )

};


const navItems =
    document.querySelectorAll(
        ".nav-item"
    );


const pageTitle =
    document.getElementById(
        "pageTitle"
    );


const pageSubtitle =
    document.getElementById(
        "pageSubtitle"
    );


// ============================================================
// AUTH
// ============================================================

onAuthStateChanged(
    auth,
    async (user) => {

        if (!user) {

            window.location.href =
                "finance-login.html";

            return;

        }


        try {

            const accessRef =
                doc(
                    db,
                    "finance_users",
                    user.uid
                );


            const accessSnapshot =
                await getDoc(
                    accessRef
                );


            if (
                !accessSnapshot.exists() ||
                accessSnapshot.data().enabled !== true
            ) {

                await signOut(auth);

                window.location.href =
                    "finance-login.html";

                return;

            }


            currentUser =
                user;


            await initializeFinance();


        } catch (error) {

            console.error(
                "Finance Auth Error:",
                error
            );


            await signOut(auth);


            window.location.href =
                "finance-login.html";

        }

    }
);


// ============================================================
// INITIALIZE
// ============================================================

async function initializeFinance() {

    await loadRevenues();

    await loadExpenses();

    updateDashboard();

    setTodayDate();

}


// ============================================================
// LOAD REVENUES
// ============================================================

async function loadRevenues() {

    try {

        const q =
            query(
                revenuesRef,
                orderBy(
                    "createdAt",
                    "desc"
                )
            );


        const snapshot =
            await getDocs(q);


        revenues = [];


        snapshot.forEach(
            (item) => {

                revenues.push({

                    id:
                        item.id,

                    ...item.data()

                });

            }
        );


        renderRevenues();


    } catch (error) {

        console.error(
            "Load revenues:",
            error
        );


        showToast(
            "تعذر تحميل الإيرادات"
        );

    }

}


// ============================================================
// LOAD EXPENSES
// ============================================================

async function loadExpenses() {

    try {

        const q =
            query(
                expensesRef,
                orderBy(
                    "date",
                    "desc"
                )
            );


        const snapshot =
            await getDocs(q);


        expenses = [];


        snapshot.forEach(
            (item) => {

                expenses.push({

                    id:
                        item.id,

                    ...item.data()

                });

            }
        );


        renderExpenses();


    } catch (error) {

        console.error(
            "Load expenses:",
            error
        );


        showToast(
            "تعذر تحميل المصروفات"
        );

    }

}


// ============================================================
// DATE HELPERS
// ============================================================

function toDate(value) {

    if (!value) {

        return null;

    }


    if (
        typeof value.toDate ===
        "function"
    ) {

        return value.toDate();

    }


    return new Date(value);

}


function isInPeriod(
    date,
    period
) {

    if (!date) {

        return false;

    }


    const now =
        new Date();


    const d =
        new Date(date);


    if (period === "all") {

        return true;

    }


    if (period === "today") {

        return (
            d.getFullYear() ===
                now.getFullYear() &&

            d.getMonth() ===
                now.getMonth() &&

            d.getDate() ===
                now.getDate()
        );

    }


    if (period === "week") {

        const start =
            new Date(now);


        start.setDate(
            now.getDate() -
            now.getDay()
        );


        start.setHours(
            0,
            0,
            0,
            0
        );


        return d >= start;

    }


    if (period === "month") {

        return (
            d.getFullYear() ===
                now.getFullYear() &&

            d.getMonth() ===
                now.getMonth()
        );

    }


    if (period === "year") {

        return (
            d.getFullYear() ===
            now.getFullYear()
        );

    }


    return true;

}


// ============================================================
// MONEY
// ============================================================

function money(value) {

    return (

        Number(value || 0)
            .toLocaleString(
                "ar-EG",
                {
                    maximumFractionDigits:
                        2
                }
            )

        +

        " ج"

    );

}


// ============================================================
// DASHBOARD
// ============================================================

function updateDashboard() {

    const filteredRevenues =
        revenues.filter(
            item =>
                isInPeriod(
                    toDate(
                        item.date ||
                        item.createdAt
                    ),
                    currentPeriod
                )
        );


    const filteredExpenses =
        expenses.filter(
            item =>
                isInPeriod(
                    toDate(
                        item.date ||
                        item.createdAt
                    ),
                    currentPeriod
                )
        );


    const totalRevenue =
        filteredRevenues.reduce(
            (
                total,
                item
            ) =>
                total +
                Number(
                    item.amount || 0
                ),
            0
        );


    const totalExpenses =
        filteredExpenses.reduce(
            (
                total,
                item
            ) =>
                total +
                Number(
                    item.amount || 0
                ),
            0
        );


    const netProfit =
        totalRevenue -
        totalExpenses;


    const profitMargin =
        totalRevenue > 0
            ? (
                netProfit /
                totalRevenue
            ) * 100
            : 0;


    document.getElementById(
        "totalRevenue"
    ).textContent =
        money(totalRevenue);


    document.getElementById(
        "totalExpenses"
    ).textContent =
        money(totalExpenses);


    const profitElement =
        document.getElementById(
            "netProfit"
        );


    profitElement.textContent =
        money(netProfit);


    profitElement.style.color =
        netProfit < 0
            ? "var(--danger)"
            : "var(--success)";


    document.getElementById(
        "profitMargin"
    ).textContent =
        `${profitMargin.toFixed(1)}%`;


    const subscriptionRevenues =
        filteredRevenues.filter(
            item =>
                item.source !==
                "manual"
        );


    document.getElementById(
        "subscriptionCount"
    ).textContent =
        subscriptionRevenues.length;


    const subscriptionRevenueTotal =
        subscriptionRevenues.reduce(
            (
                total,
                item
            ) =>
                total +
                Number(
                    item.amount || 0
                ),
            0
        );


    const average =
        subscriptionRevenues.length > 0
            ? subscriptionRevenueTotal /
              subscriptionRevenues.length
            : 0;


    document.getElementById(
        "averageRevenue"
    ).textContent =
        money(average);


    document.getElementById(
        "expenseCount"
    ).textContent =
        filteredExpenses.length;


    const largestExpense =
        filteredExpenses.reduce(
            (
                max,
                item
            ) =>
                Math.max(
                    max,
                    Number(
                        item.amount || 0
                    )
                ),
            0
        );


    document.getElementById(
        "largestExpense"
    ).textContent =
        money(largestExpense);


    renderRevenueBreakdown();

    renderRecentTransactions();

    renderMonthlyChart();

    updateReports();

    renderSubscriptionAnalytics();

}


// ============================================================
// REVENUE BREAKDOWN
// ============================================================

function renderRevenueBreakdown() {

    const container =
        document.getElementById(
            "revenueBreakdown"
        );


    if (!container) return;


    const map = {};


    revenues
        .filter(
            item =>
                isInPeriod(
                    toDate(
                        item.date ||
                        item.createdAt
                    ),
                    currentPeriod
                )
        )
        .forEach(
            item => {

                const source =
                    item.source ===
                    "manual"

                        ? (
                            item.revenueType ===
                            "subscription"

                                ? "اشتراك يدوي"

                                : "إيراد آخر"
                          )

                        : "اشتراكات تلقائية";


                map[source] =
                    (
                        map[source] ||
                        0
                    ) +
                    Number(
                        item.amount || 0
                    );

            }
        );


    const entries =
        Object.entries(map)
            .sort(
                (a,b) =>
                    b[1] - a[1]
            );


    if (!entries.length) {

        container.innerHTML =
            `
            <div class="transactions-list">
                لا توجد إيرادات
            </div>
            `;

        return;

    }


    const total =
        entries.reduce(
            (
                sum,
                item
            ) =>
                sum +
                item[1],
            0
        );


    container.innerHTML =
        entries
            .map(
                ([source,amount]) => {

                    const percentage =
                        total > 0
                            ? (
                                amount /
                                total
                            ) * 100
                            : 0;


                    return `

                        <div>

                            <div
                                class="breakdown-item">

                                <span
                                    class="breakdown-label">

                                    ${escapeHtml(
                                        source
                                    )}

                                </span>


                                <strong
                                    class="breakdown-value">

                                    ${money(
                                        amount
                                    )}

                                </strong>

                            </div>


                            <div
                                class="breakdown-bar">

                                <span
                                    style="
                                        width:${percentage}%;
                                    ">

                                </span>

                            </div>

                        </div>

                    `;

                }
            )
            .join("");

}


// ============================================================
// RECENT TRANSACTIONS
// ============================================================

function renderRecentTransactions() {

    const container =
        document.getElementById(
            "recentTransactions"
        );


    if (!container) return;


    const combined = [

        ...revenues.map(
            item => ({
                ...item,
                type:
                    "revenue"
            })
        ),

        ...expenses.map(
            item => ({
                ...item,
                type:
                    "expense"
            })
        )

    ];


    combined.sort(
        (a,b) => {

            const dateA =
                toDate(
                    a.date ||
                    a.createdAt
                ) ||
                new Date(0);


            const dateB =
                toDate(
                    b.date ||
                    b.createdAt
                ) ||
                new Date(0);


            return dateB - dateA;

        }
    );


    const latest =
        combined.slice(
            0,
            8
        );


    if (!latest.length) {

        container.innerHTML =
            "لا توجد عمليات بعد.";

        return;

    }


    container.innerHTML =
        latest
            .map(
                item => {

                    const amount =
                        Number(
                            item.amount || 0
                        );


                    const date =
                        toDate(
                            item.date ||
                            item.createdAt
                        );


                    return `

                        <div
                            class="transaction-row">

                            <span>

                                ${
                                    item.type ===
                                    "revenue"

                                        ? "💰"

                                        : "💸"
                                }

                            </span>


                            <div>

                                <strong>

                                    ${
                                        item.type ===
                                        "revenue"

                                            ? "إيراد"

                                            : "مصروف"
                                    }

                                </strong>


                                <small>

                                    ${
                                        formatDate(
                                            date
                                        )
                                    }

                                </small>

                            </div>


                            <strong>

                                ${
                                    item.type ===
                                    "revenue"
                                        ? "+"
                                        : "-"
                                }

                                ${money(
                                    amount
                                )}

                            </strong>

                        </div>

                    `;

                }
            )
            .join("");

}


// ============================================================
// REVENUES TABLE
// ============================================================

function renderRevenues() {

    const tbody =
        document.getElementById(
            "revenuesTableBody"
        );


    if (!tbody) return;


    if (!revenues.length) {

        tbody.innerHTML =
            `
            <tr>

                <td colspan="7">

                    لا توجد إيرادات حتى الآن

                </td>

            </tr>
            `;

        return;

    }


    tbody.innerHTML =
        revenues
            .map(
                item => {

                    const isManual =
                        item.source ===
                        "manual";


                    const sourceBadge =
                        isManual

                            ? `
                                <span
                                    class="
                                        finance-badge
                                        manual
                                    ">

                                    ✏️ يدوي

                                </span>
                              `

                            : `
                                <span
                                    class="
                                        finance-badge
                                        subscription
                                    ">

                                    📦 اشتراك

                                </span>
                              `;


                    return `

                        <tr>

                            <td>

                                ${formatDate(
                                    toDate(
                                        item.date ||
                                        item.createdAt
                                    )
                                )}

                            </td>


                            <td>

                                ${sourceBadge}

                            </td>


                            <td>

                                ${
                                    escapeHtml(
                                        item.studentName ||
                                        item.accountName ||
                                        "—"
                                    )
                                }

                            </td>


                            <td>

                                ${
                                    escapeHtml(
                                        item.plan ||
                                        "—"
                                    )
                                }

                            </td>


                            <td>

                                ${
                                    escapeHtml(
                                        getPaymentMethodName(
                                            item.paymentMethod
                                        )
                                    )
                                }

                            </td>


                            <td>

                                <strong>

                                    ${money(
                                        item.amount
                                    )}

                                </strong>

                            </td>


                            <td>

                                ${
                                    isManual

                                        ? `
                                            <button
                                                class="
                                                    small-btn
                                                    danger-action
                                                "
                                                data-delete-revenue="
                                                    ${item.id}
                                                ">

                                                حذف

                                            </button>
                                          `

                                        : `
                                            <span
                                                style="
                                                    color:
                                                        var(--muted);
                                                    font-size:
                                                        11px;
                                                ">

                                                تلقائي

                                            </span>
                                          `
                                }

                            </td>

                        </tr>

                    `;

                }
            )
            .join("");

}


// ============================================================
// EXPENSES TABLE
// ============================================================

function renderExpenses() {

    const tbody =
        document.getElementById(
            "expensesTableBody"
        );


    if (!tbody) return;


    if (!expenses.length) {

        tbody.innerHTML =
            `
            <tr>

                <td colspan="5">

                    لا توجد مصروفات حتى الآن

                </td>

            </tr>
            `;

        return;

    }


    tbody.innerHTML =
        expenses
            .map(
                item => {

                    return `

                        <tr>

                            <td>

                                ${formatDate(
                                    toDate(
                                        item.date
                                    )
                                )}

                            </td>


                            <td>

                                ${
                                    escapeHtml(
                                        getCategoryName(
                                            item.category
                                        )
                                    )
                                }

                            </td>


                            <td>

                                ${
                                    escapeHtml(
                                        item.description ||
                                        "—"
                                    )
                                }

                            </td>


                            <td>

                                <strong>

                                    ${money(
                                        item.amount
                                    )}

                                </strong>

                            </td>


                            <td>

                                <button
                                    class="small-btn"
                                    data-edit-expense="
                                        ${item.id}
                                    ">

                                    تعديل

                                </button>


                                <button
                                    class="
                                        small-btn
                                        danger-action
                                    "
                                    data-delete-expense="
                                        ${item.id}
                                    ">

                                    حذف

                                </button>

                            </td>

                        </tr>

                    `;

                }
            )
            .join("");

}


// ============================================================
// ADD EXPENSE
// ============================================================

document
    .getElementById(
        "expenseForm"
    )
    .addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            if (!currentUser) return;


            const amount =
                Number(
                    document.getElementById(
                        "expenseAmount"
                    ).value
                );


            const category =
                document.getElementById(
                    "expenseCategory"
                ).value;


            const date =
                document.getElementById(
                    "expenseDate"
                ).value;


            const description =
                document.getElementById(
                    "expenseDescription"
                ).value
                .trim();


            if (
                !amount ||
                amount <= 0 ||
                !category ||
                !date
            ) {

                showToast(
                    "أكمل بيانات المصروف"
                );

                return;

            }


            try {

                await addDoc(
                    expensesRef,
                    {

                        amount,

                        category,

                        date,

                        description,

                        createdBy:
                            currentUser.uid,

                        createdAt:
                            serverTimestamp()

                    }
                );


                closeExpenseModal();


                showToast(
                    "تم إضافة المصروف بنجاح ✅"
                );


                await loadExpenses();

                updateDashboard();


            } catch (error) {

                console.error(
                    "Add Expense:",
                    error
                );


                showToast(
                    "حدث خطأ أثناء حفظ المصروف"
                );

            }

        }
    );


// ============================================================
// DELETE EXPENSE
// ============================================================

document.addEventListener(
    "click",
    async event => {

        const button =
            event.target.closest(
                "[data-delete-expense]"
            );


        if (!button) return;


        const id =
            button.dataset
                .deleteExpense;


        if (
            !confirm(
                "هل أنت متأكد من حذف هذا المصروف؟"
            )
        ) {

            return;

        }


        try {

            await deleteDoc(
                doc(
                    db,
                    "finance_expenses",
                    id
                )
            );


            showToast(
                "تم حذف المصروف"
            );


            await loadExpenses();

            updateDashboard();


        } catch (error) {

            console.error(
                error
            );


            showToast(
                "تعذر حذف المصروف"
            );

        }

    }
);


// ============================================================
// EXPENSE MODAL
// ============================================================

const expenseModal =
    document.getElementById(
        "expenseModal"
    );


document
    .getElementById(
        "addExpenseBtn"
    )
    .addEventListener(
        "click",
        () => {

            document
                .getElementById(
                    "expenseForm"
                )
                .reset();


            document
                .getElementById(
                    "expenseDate"
                )
                .value =
                getTodayString();


            expenseModal
                .classList
                .remove(
                    "hidden"
                );

        }
    );


document
    .getElementById(
        "closeExpenseModal"
    )
    .addEventListener(
        "click",
        closeExpenseModal
    );


document
    .getElementById(
        "cancelExpenseBtn"
    )
    .addEventListener(
        "click",
        closeExpenseModal
    );


function closeExpenseModal() {

    expenseModal
        .classList
        .add(
            "hidden"
        );

}


// ============================================================
// ADD MANUAL REVENUE
// ============================================================

document
    .getElementById(
        "revenueForm"
    )
    .addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            if (!currentUser) return;


            const amount =
                Number(
                    document.getElementById(
                        "revenueAmount"
                    ).value
                );


            const type =
                document.getElementById(
                    "revenueType"
                ).value;


            const date =
                document.getElementById(
                    "revenueDate"
                ).value;


            const paymentMethod =
                document.getElementById(
                    "revenuePaymentMethod"
                ).value;


            const studentName =
                document.getElementById(
                    "revenueStudentName"
                ).value
                .trim();


            const plan =
                document.getElementById(
                    "revenuePlan"
                ).value
                .trim();


            const description =
                document.getElementById(
                    "revenueDescription"
                ).value
                .trim();


            if (
                !amount ||
                amount <= 0 ||
                !date ||
                !paymentMethod
            ) {

                showToast(
                    "أكمل بيانات الإيراد"
                );

                return;

            }


            try {

                await addDoc(
                    revenuesRef,
                    {

                        amount,

                        source:
                            "manual",

                        revenueType:
                            type,

                        studentName:
                            studentName ||
                            null,

                        plan:
                            plan ||
                            (
                                type ===
                                "subscription"

                                    ? "اشتراك"

                                    : "إيراد آخر"
                            ),

                        paymentMethod,

                        description:
                            description ||
                            null,

                        date,

                        createdBy:
                            currentUser.uid,

                        createdAt:
                            serverTimestamp()

                    }
                );


                closeRevenueModal();


                showToast(
                    "تم إضافة الإيراد بنجاح 💰"
                );


                await loadRevenues();

                updateDashboard();


            } catch (error) {

                console.error(
                    "Add Manual Revenue:",
                    error
                );


                showToast(
                    "حدث خطأ أثناء حفظ الإيراد"
                );

            }

        }
    );


// ============================================================
// REVENUE MODAL
// ============================================================

const revenueModal =
    document.getElementById(
        "revenueModal"
    );


document
    .getElementById(
        "addRevenueBtn"
    )
    .addEventListener(
        "click",
        () => {

            document
                .getElementById(
                    "revenueForm"
                )
                .reset();


            document
                .getElementById(
                    "revenueDate"
                )
                .value =
                getTodayString();


            document
                .getElementById(
                    "revenueType"
                ).value =
                "other";


            revenueModal
                .classList
                .remove(
                    "hidden"
                );

        }
    );


document
    .getElementById(
        "closeRevenueModal"
    )
    .addEventListener(
        "click",
        closeRevenueModal
    );


document
    .getElementById(
        "cancelRevenueBtn"
    )
    .addEventListener(
        "click",
        closeRevenueModal
    );


function closeRevenueModal() {

    revenueModal
        .classList
        .add(
            "hidden"
        );

}


// ============================================================
// DELETE MANUAL REVENUE
// ============================================================

document.addEventListener(
    "click",
    async event => {

        const button =
            event.target.closest(
                "[data-delete-revenue]"
            );


        if (!button) return;


        const id =
            button.dataset
                .deleteRevenue;


        if (
            !confirm(
                "هل أنت متأكد من حذف هذا الإيراد اليدوي؟"
            )
        ) {

            return;

        }


        try {

            await deleteDoc(
                doc(
                    db,
                    "finance_revenues",
                    id
                )
            );


            showToast(
                "تم حذف الإيراد"
            );


            await loadRevenues();

            updateDashboard();


        } catch (error) {

            console.error(
                "Delete Revenue:",
                error
            );


            showToast(
                "تعذر حذف الإيراد"
            );

        }

    }
);


// ============================================================
// PERIOD
// ============================================================

document
    .getElementById(
        "overviewPeriod"
    )
    .addEventListener(
        "change",
        event => {

            currentPeriod =
                event.target.value;

            updateDashboard();

        }
    );


// ============================================================
// NAVIGATION
// ============================================================

navItems.forEach(
    item => {

        item.addEventListener(
            "click",
            () => {

                switchSection(
                    item.dataset.section
                );

            }
        );

    }
);


document.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                "[data-section]"
            );


        if (
            button &&
            !button.classList.contains(
                "nav-item"
            )
        ) {

            switchSection(
                button.dataset.section
            );

        }

    }
);


function switchSection(
    section
) {

    navItems.forEach(
        item => {

            item.classList.toggle(
                "active",
                item.dataset.section ===
                section
            );

        }
    );


    Object.values(
        sections
    ).forEach(
        sectionElement => {

            sectionElement
                .classList
                .remove(
                    "active"
                );

        }
    );


    if (
        sections[section]
    ) {

        sections[section]
            .classList
            .add(
                "active"
            );

    }


    const titles = {

        overview: [

            "نظرة عامة",

            "ملخص الوضع المالي للمنصة"

        ],


        revenues: [

            "الإيرادات",

            "جميع الاشتراكات والإيرادات الأخرى"

        ],


        expenses: [

            "المصروفات",

            "إدارة مصروفات المنصة"

        ],


        reports: [

            "التقارير المالية",

            "تحليل شامل لأداء المنصة المالي"

        ],


        subscriptions: [

            "تحليل الاشتراكات",

            "أداء كل باقة اشتراك"

        ]

    };


    if (titles[section]) {

        pageTitle.textContent =
            titles[section][0];


        pageSubtitle.textContent =
            titles[section][1];

    }

}


// ============================================================
// REFRESH
// ============================================================

document
    .getElementById(
        "refreshBtn"
    )
    .addEventListener(
        "click",
        async () => {

            await loadRevenues();

            await loadExpenses();

            updateDashboard();


            showToast(
                "تم تحديث البيانات 🔄"
            );

        }
    );


// ============================================================
// LOGOUT
// ============================================================

document
    .getElementById(
        "logoutBtn"
    )
    .addEventListener(
        "click",
        async () => {

            try {

                await signOut(
                    auth
                );


                sessionStorage.removeItem(
                    "finance_authenticated"
                );


                window.location.href =
                    "finance-login.html";


            } catch (error) {

                console.error(
                    error
                );

            }

        }
    );


// ============================================================
// REPORTS
// ============================================================

function updateReports() {

    const totalRevenue =
        revenues.reduce(
            (
                total,
                item
            ) =>
                total +
                Number(
                    item.amount || 0
                ),
            0
        );


    const totalExpenses =
        expenses.reduce(
            (
                total,
                item
            ) =>
                total +
                Number(
                    item.amount || 0
                ),
            0
        );


    const result =
        totalRevenue -
        totalExpenses;


    document.getElementById(
        "allTimeProfit"
    ).textContent =
        result >= 0
            ? money(result)
            : money(0);


    document.getElementById(
        "allTimeLoss"
    ).textContent =
        result < 0
            ? money(
                Math.abs(result)
              )
            : money(0);


    const months = {};


    revenues.forEach(
        item => {

            const date =
                toDate(
                    item.date ||
                    item.createdAt
                );


            if (!date) return;


            const key =
                `${date.getFullYear()}-${date.getMonth()}`;


            months[key] =
                (
                    months[key] ||
                    0
                ) +
                Number(
                    item.amount || 0
                );

        }
    );


    const best =
        Object.entries(
            months
        )
        .sort(
            (a,b) =>
                b[1] - a[1]
        )[0];


    if (best) {

        const [
            key,
            amount
        ] = best;


        const [
            year,
            month
        ] =
            key.split("-");


        const date =
            new Date(
                Number(year),
                Number(month)
            );


        document.getElementById(
            "bestRevenueMonth"
        ).textContent =
            `${date.toLocaleDateString(
                "ar-EG",
                {
                    month:
                        "long",

                    year:
                        "numeric"
                }
            )} — ${money(
                amount
            )}`;

    }


    const categories = {};


    expenses.forEach(
        item => {

            const category =
                item.category ||
                "other";


            categories[category] =
                (
                    categories[category] ||
                    0
                ) +
                Number(
                    item.amount || 0
                );

        }
    );


    const topCategory =
        Object.entries(
            categories
        )
        .sort(
            (a,b) =>
                b[1] - a[1]
        )[0];


    if (topCategory) {

        document.getElementById(
            "topExpenseCategory"
        ).textContent =
            `${getCategoryName(
                topCategory[0]
            )} — ${money(
                topCategory[1]
            )}`;

    }

}


// ============================================================
// SUBSCRIPTION ANALYTICS
// ============================================================

function renderSubscriptionAnalytics() {

    const container =
        document.getElementById(
            "subscriptionAnalytics"
        );


    if (!container) return;


    const map = {};


    revenues
        .filter(
            item =>
                item.source !==
                "manual" ||
                item.revenueType ===
                "subscription"
        )
        .forEach(
            item => {

                const plan =
                    item.plan ||
                    "غير محدد";


                if (!map[plan]) {

                    map[plan] = {

                        count:
                            0,

                        revenue:
                            0

                    };

                }


                map[plan].count++;

                map[plan].revenue +=
                    Number(
                        item.amount || 0
                    );

            }
        );


    const entries =
        Object.entries(
            map
        );


    if (!entries.length) {

        container.innerHTML =
            `
            <div class="transactions-list">
                لا توجد بيانات اشتراكات
            </div>
            `;

        return;

    }


    container.innerHTML =
        entries
            .map(
                ([plan,data]) => `

                    <div
                        class="report-card">

                        <span>
                            ${escapeHtml(
                                plan
                            )}
                        </span>


                        <strong>

                            ${data.count}

                            اشتراك

                        </strong>


                        <div style="
                            margin-top:10px;
                            color:var(--success);
                            font-weight:700;
                        ">

                            ${money(
                                data.revenue
                            )}

                        </div>

                    </div>

                `
            )
            .join("");

}


// ============================================================
// MONTHLY CHART
// ============================================================

function renderMonthlyChart() {

    const container =
        document.getElementById(
            "monthlyChart"
        );


    if (!container) return;


    const now =
        new Date();


    const months = [];


    for (
        let i = 11;
        i >= 0;
        i--
    ) {

        const date =
            new Date(
                now.getFullYear(),
                now.getMonth() - i,
                1
            );


        const year =
            date.getFullYear();


        const month =
            date.getMonth();


        const revenue =
            revenues
                .filter(
                    item => {

                        const d =
                            toDate(
                                item.date ||
                                item.createdAt
                            );


                        return d &&
                            d.getFullYear() ===
                                year &&
                            d.getMonth() ===
                                month;

                    }
                )
                .reduce(
                    (
                        sum,
                        item
                    ) =>
                        sum +
                        Number(
                            item.amount || 0
                        ),
                    0
                );


        const expense =
            expenses
                .filter(
                    item => {

                        const d =
                            toDate(
                                item.date ||
                                item.createdAt
                            );


                        return d &&
                            d.getFullYear() ===
                                year &&
                            d.getMonth() ===
                                month;

                    }
                )
                .reduce(
                    (
                        sum,
                        item
                    ) =>
                        sum +
                        Number(
                            item.amount || 0
                        ),
                    0
                );


        months.push({

            label:
                date.toLocaleDateString(
                    "ar-EG",
                    {
                        month:
                            "short"
                    }
                ),

            revenue,

            expense

        });

    }


    const max =
        Math.max(
            ...months.map(
                item =>
                    Math.max(
                        item.revenue,
                        item.expense
                    )
            ),
            1
        );


    container.innerHTML = `

        <div style="
            width:100%;
            display:flex;
            align-items:flex-end;
            gap:10px;
            height:230px;
            padding:10px 0;
        ">

            ${months.map(
                item => {

                    const revenueHeight =
                        (
                            item.revenue /
                            max
                        ) * 180;


                    const expenseHeight =
                        (
                            item.expense /
                            max
                        ) * 180;


                    return `

                        <div style="
                            flex:1;
                            height:100%;
                            display:flex;
                            align-items:flex-end;
                            justify-content:center;
                            gap:3px;
                        ">

                            <div
                                title="
                                    إيرادات:
                                    ${money(
                                        item.revenue
                                    )}
                                "
                                style="
                                    width:40%;
                                    max-width:18px;
                                    height:${Math.max(
                                        revenueHeight,
                                        3
                                    )}px;
                                    background:#2563eb;
                                    border-radius:
                                        5px 5px 0 0;
                                ">
                            </div>


                            <div
                                title="
                                    مصروفات:
                                    ${money(
                                        item.expense
                                    )}
                                "
                                style="
                                    width:40%;
                                    max-width:18px;
                                    height:${Math.max(
                                        expenseHeight,
                                        3
                                    )}px;
                                    background:#dc2626;
                                    border-radius:
                                        5px 5px 0 0;
                                ">
                            </div>

                        </div>

                    `;

                }
            ).join("")}

        </div>


        <div style="
            display:flex;
            justify-content:space-between;
            font-size:10px;
            color:var(--muted);
        ">

            ${months.map(
                item =>
                    `<span>
                        ${item.label}
                    </span>`
            ).join("")}

        </div>


        <div style="
            display:flex;
            gap:15px;
            margin-top:12px;
            font-size:11px;
            color:var(--muted);
        ">

            <span>
                🔵 الإيرادات
            </span>

            <span>
                🔴 المصروفات
            </span>

        </div>

    `;

}


// ============================================================
// HELPERS
// ============================================================

function formatDate(
    date
) {

    if (!date) {

        return "—";

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


function getTodayString() {

    const date =
        new Date();


    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        )
        .padStart(
            2,
            "0"
        );


    const day =
        String(
            date.getDate()
        )
        .padStart(
            2,
            "0"
        );


    return `${year}-${month}-${day}`;

}


function setTodayDate() {

    const expenseInput =
        document.getElementById(
            "expenseDate"
        );


    const revenueInput =
        document.getElementById(
            "revenueDate"
        );


    if (expenseInput) {

        expenseInput.value =
            getTodayString();

    }


    if (revenueInput) {

        revenueInput.value =
            getTodayString();

    }

}


function getCategoryName(
    category
) {

    const categories = {

        advertising:
            "إعلانات",

        hosting:
            "استضافة / خدمات",

        software:
            "برامج وأدوات",

        rewards:
            "جوائز",

        design:
            "تصميم",

        equipment:
            "معدات",

        other:
            "أخرى"

    };


    return (
        categories[category] ||
        category ||
        "أخرى"
    );

}


function getPaymentMethodName(
    method
) {

    const methods = {

        manual_transfer:
            "تحويل يدوي",

        cash:
            "نقدي",

        wallet:
            "محفظة إلكترونية",

        bank:
            "تحويل بنكي",

        other:
            "أخرى"

    };


    return (
        methods[method] ||
        method ||
        "غير محدد"
    );

}


function escapeHtml(
    value
) {

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


function showToast(
    message
) {

    const container =
        document.getElementById(
            "toastContainer"
        );


    if (!container) return;


    const toast =
        document.createElement(
            "div"
        );


    toast.className =
        "toast";


    toast.textContent =
        message;


    container.appendChild(
        toast
    );


    setTimeout(
        () => {

            toast.remove();

        },
        3000
    );

}


// ============================================================
// FINANCE REVENUE API
// ============================================================
//
// عند تأكيد اشتراك من نظام الاشتراكات:
//
// await recordFinanceRevenue({
//     amount: 50,
//     studentId: "...",
//     studentName: "...",
//     plan: "شهري",
//     subscriptionId: "...",
//     activatedBy: "..."
// });
//
// ============================================================

export async function recordFinanceRevenue(
    data
) {

    if (!data) {

        throw new Error(
            "Revenue data is required"
        );

    }


    const amount =
        Number(
            data.amount
        );


    if (
        !amount ||
        amount <= 0
    ) {

        throw new Error(
            "Invalid revenue amount"
        );

    }


    const transaction = {

        amount,

        source:
            "subscription",

        revenueType:
            "subscription",

        studentId:
            data.studentId ||
            null,

        studentName:
            data.studentName ||
            null,

        plan:
            data.plan ||
            "غير محدد",

        paymentMethod:
            data.paymentMethod ||
            "manual_transfer",

        subscriptionId:
            data.subscriptionId ||
            null,

        activatedBy:
            data.activatedBy ||
            null,

        date:
            getTodayString(),

        createdAt:
            serverTimestamp()

    };


    return await addDoc(
        revenuesRef,
        transaction
    );

}
