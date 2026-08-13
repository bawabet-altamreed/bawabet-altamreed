// ==========================================
// بوابة التمريض
// General Surgery - Chapter 1
// ==========================================


// ==========================================
// بيانات الطالب
// ==========================================

const studentCode =
localStorage.getItem("studentCode");

const studentName =
localStorage.getItem("studentName");

const studentGrade =
localStorage.getItem("studentGrade");


// ==========================================
// التحقق من تسجيل الدخول
// ==========================================

if (!studentCode) {

    window.location.replace("login.html");

}


// ==========================================
// الأسئلة
// ==========================================

const questions = [

{
question:"1- Inflammation is the body's reaction against:",
answers:[
"A) Internal hormones",
"B) Any external stimulus",
"C) Lack of sleep",
"D) High blood pressure"
],
correct:1
},

{
question:"2- The most common inflammation in surgery is:",
answers:[
"A) Viral inflammation",
"B) Fungal inflammation",
"C) Bacterial inflammation",
"D) Allergic inflammation"
],
correct:2
},

{
question:"3- Which of the following is NOT a type of bacterial inflammation?",
answers:[
"A) Acute inflammation",
"B) Chronic inflammation",
"C) Specific inflammation",
"D) Congenital inflammation"
],
correct:3
},

{
question:"4- Tuberculosis is an example of:",
answers:[
"A) Non-specific inflammation",
"B) Specific inflammation",
"C) Viral inflammation",
"D) Chemical inflammation"
],
correct:1
},

{
question:"5- Which of the following is a non-specific inflammation?",
answers:[
"A) Tetanus",
"B) Tuberculosis",
"C) Abscess",
"D) Erysipelas"
],
correct:2
},

{
question:"6- An abscess is:",
answers:[
"A) Collection of blood under the skin",
"B) Collection of pus under the skin or in an organ",
"C) Bone infection",
"D) Burn of the skin"
],
correct:1
},

{
question:"7- Carbuncle is:",
answers:[
"A) A group of boils",
"B) A skin allergy",
"C) A burn",
"D) A fracture"
],
correct:0
},

{
question:"8- Cellulitis usually does NOT lead directly to:",
answers:[
"A) Formation of an abscess",
"B) Blood poisoning",
"C) Skin burn",
"D) Spread of microbes"
],
correct:2
},

{
question:"9- Inflammation of wounds after operations usually appears on:",
answers:[
"A) First day",
"B) Second day",
"C) Third or fifth day",
"D) Tenth day"
],
correct:2
},

{
question:"10- Which of the following is a local symptom of inflammation?",
answers:[
"A) Increased pulse",
"B) Sweating",
"C) Pain at the site of inflammation",
"D) Chills"
],
correct:2
}

];


// ==========================================
// متغيرات الاختبار
// ==========================================

let currentQuestion = 0;

let score = 0;

let answered = false;

let timeLeft = 420;

let timerInterval;


// ==========================================
// عناصر الصفحة
// ==========================================

const question =
document.getElementById("question");

const answers =
document.getElementById("answers");

const nextBtn =
document.getElementById("nextBtn");

const timer =
document.getElementById("timer");


// ==========================================
// تحميل السؤال
// ==========================================

function loadQuestion(){

    answered = false;

    answers.innerHTML = "";

    question.innerHTML =
    questions[currentQuestion].question;


    document.getElementById(
        "questionNumber"
    ).innerHTML =
    "السؤال " +
    (currentQuestion + 1) +
    " / " +
    questions.length;


    document.getElementById(
        "progressFill"
    ).style.width =
    ((currentQuestion + 1) /
    questions.length) * 100 + "%";


    questions[currentQuestion]
    .answers
    .forEach(function(answer,index){

        let button =
        document.createElement("button");


        button.innerHTML = answer;

        button.className =
        "quiz-answer";


        button.onclick =
        function(){

            if(answered) return;

            answered = true;


            let buttons =
            document.querySelectorAll(
                "#answers button"
            );


            buttons.forEach(
                function(btn){

                    btn.disabled = true;

                }
            );


            if(
                index ===
                questions[currentQuestion].correct
            ){

                score++;

                button.style.background =
                "green";

                button.style.color =
                "#fff";

            }

            else{

                button.style.background =
                "red";

                button.style.color =
                "#fff";


                buttons[
                    questions[currentQuestion].correct
                ].style.background =
                "green";


                buttons[
                    questions[currentQuestion].correct
                ].style.color =
                "#fff";

            }

        };


        answers.appendChild(button);

    });

}


// ==========================================
// زر التالي
// ==========================================

nextBtn.onclick =
function(){

    if(!answered){

        alert(
            "من فضلك اختر إجابة أولاً"
        );

        return;

    }


    currentQuestion++;


    if(
        currentQuestion <
        questions.length
    ){

        loadQuestion();

    }

    else{

        clearInterval(
            timerInterval
        );


        let percentage =
        Math.round(
            (score /
            questions.length) * 100
        );


        saveResult(
            percentage
        );

    }

};


// ==========================================
// حفظ النتيجة
// ==========================================

function saveResult(percentage){

    if(!studentCode){

        alert(
            "❌ يجب تسجيل الدخول أولاً"
        );

        window.location.href =
        "login.html";

        return;

    }


    // ======================================
    // تنظيف اسم الصف
    // ======================================

    const cleanGrade =
    (studentGrade || "")
    .replace(/\s+/g," ")
    .trim();


    // ======================================
    // حفظ النتيجة
    // ======================================

    db.collection("results")
    .add({

        studentCode:
        studentCode,

        name:
        studentName || "",

        grade:
        cleanGrade,

        subject:
        "General Surgery",

        chapter:
        "Chapter 1",

        score:
        score,

        total:
        questions.length,

        percentage:
        percentage,

        date:
        firebase.firestore
        .FieldValue
        .serverTimestamp()

    })


    .then(function(){

        showResult(
            percentage
        );

    })


    .catch(function(error){

        console.error(
            "Save Result Error:",
            error
        );


        alert(
            "❌ حدث خطأ أثناء حفظ النتيجة"
        );

    });

}


// ==========================================
// عرض النتيجة
// ==========================================

function showResult(percentage){

    question.innerHTML =
    "🎉 انتهى الاختبار";


    answers.innerHTML = `

        <h2>
            درجتك:
            ${score} /
            ${questions.length}
        </h2>

        <h2>
            النسبة:
            ${percentage}%
        </h2>

        <h3>

        ${
            percentage >= 50

            ?

            "🎉 مبروك لقد نجحت"

            :

            "❌ حاول مرة أخرى"
        }

        </h3>

    `;


    nextBtn.innerHTML =
    "إعادة الاختبار";


    nextBtn.onclick =
    function(){

        location.reload();

    };

}


// ==========================================
// المؤقت
// ==========================================

function startTimer(){

    timerInterval =
    setInterval(function(){

        let minutes =
        Math.floor(
            timeLeft / 60
        );


        let seconds =
        timeLeft % 60;


        if(seconds < 10){

            seconds =
            "0" + seconds;

        }


        timer.innerHTML =
        "⏱️ الوقت: " +
        minutes +
        ":" +
        seconds;


        timeLeft--;


        if(timeLeft < 0){

            clearInterval(
                timerInterval
            );


            let percentage =
            Math.round(
                (score /
                questions.length) * 100
            );


            saveResult(
                percentage
            );

        }

    },1000);

}


// ==========================================
// تشغيل الاختبار
// ==========================================

loadQuestion();

startTimer();
