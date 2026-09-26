/* =========================================================
   SMART EXAM HALL SYSTEM
   AUTOMATIC ALLOCATION ENGINE
   ========================================================= */

let examData = {
    totalStudents: 0,
    totalDepartments: 0,
    totalHalls: 0,
    departments: [],
    students: [],
    halls: []
};


/* =========================================================
   BASIC HELPERS
   ========================================================= */

function $(selector) {
    return document.querySelector(selector);
}

function $$(selector) {
    return [...document.querySelectorAll(selector)];
}

function getValue(...selectors) {
    for (const selector of selectors) {
        const el = document.querySelector(selector);

        if (el && el.value !== undefined) {
            return el.value.trim();
        }
    }

    return "";
}

function numberValue(...selectors) {
    const value = parseInt(getValue(...selectors), 10);
    return Number.isFinite(value) ? value : 0;
}


/* =========================================================
   REGISTER NUMBER GENERATOR
   ========================================================= */

function makeDepartmentCode(name, index) {

    if (!name) {
        return `DEP${index + 1}`;
    }

    let clean = name
        .toUpperCase()
        .replace(/[^A-Z0-9 ]/g, "")
        .trim();

    const words = clean.split(/\s+/).filter(Boolean);

    let code = "";

    if (words.length >= 2) {
        code = words
            .map(word => word[0])
            .join("")
            .substring(0, 3);
    } else {
        code = clean.substring(0, 3);
    }

    if (code.length < 2) {
        code = `D${index + 1}`;
    }

    return code;
}


function generateRegisterNumber(code, number) {
    return `${code}${String(number).padStart(3, "0")}`;
}


/* =========================================================
   CREATE STUDENTS
   ========================================================= */

function createStudents() {

    examData.students = [];

    examData.departments.forEach((department, deptIndex) => {

        const code = department.code;

        for (let i = 1; i <= department.studentCount; i++) {

            examData.students.push({
                id: `${code}-${i}`,

                registerNumber:
                    generateRegisterNumber(code, i),

                department:
                    department.name,

                departmentCode:
                    code,

                subject:
                    department.subject,

                departmentIndex:
                    deptIndex,

                hall: null,
                bench: null,
                seat: null
            });
        }
    });

    examData.totalStudents =
        examData.students.length;
}


/* =========================================================
   SHUFFLE
   ========================================================= */

function shuffle(array) {

    const arr = [...array];

    for (let i = arr.length - 1; i > 0; i--) {

        const j =
            Math.floor(Math.random() * (i + 1));

        [arr[i], arr[j]] =
            [arr[j], arr[i]];
    }

    return arr;
}


/* =========================================================
   ALLOCATION
   =========================================================

   RULE:

   One bench = maximum 2 students.

   Same department should NOT sit together
   whenever another department is available.

   Example:

   BTECH + EEE
   BTECH + ECE
   EEE + CSE

   instead of:

   BTECH + BTECH
*/


function allocateStudents() {

    examData.halls = [];

    if (!examData.students.length) {
        return;
    }

    const totalHalls =
        Math.max(1, examData.totalHalls);

    /*
       Create department queues
    */

    const queues =
        examData.departments.map(dept => {

            return shuffle(
                examData.students.filter(
                    student =>
                        student.departmentIndex ===
                        dept.index
                )
            );

        });


    /*
       Total benches required
    */

    const totalBenches =
        Math.ceil(
            examData.students.length / 2
        );


    /*
       Spread benches across halls
    */

    const benchesPerHall =
        Math.ceil(
            totalBenches / totalHalls
        );


    let studentPointer = 0;


    for (
        let hallIndex = 0;
        hallIndex < totalHalls;
        hallIndex++
    ) {

        const hall = {

            number: hallIndex + 1,

            benches: []
        };


        for (
            let benchIndex = 0;

            benchIndex < benchesPerHall &&
            studentPointer <
            examData.students.length;

            benchIndex++
        ) {

            /*
               Get first student
            */

            let firstStudent =
                getNextStudentDifferentFrom(
                    null,
                    queues
                );


            if (!firstStudent) {
                break;
            }


            /*
               Remove first student
            */

            removeStudentFromQueues(
                firstStudent,
                queues
            );


            /*
               Find second student
               from DIFFERENT department
            */

            let secondStudent =
                getNextStudentDifferentFrom(
                    firstStudent.departmentIndex,
                    queues
                );


            /*
               If different department isn't
               available, use any remaining student.
            */

            if (!secondStudent) {

                secondStudent =
                    getAnyRemainingStudent(
                        queues
                    );
            }


            if (secondStudent) {

                removeStudentFromQueues(
                    secondStudent,
                    queues
                );
            }


            const bench = {

                number:
                    benchIndex + 1,

                seats: [

                    firstStudent || null,

                    secondStudent || null

                ]
            };


            /*
               Assign location
            */

            if (firstStudent) {

                firstStudent.hall =
                    hall.number;

                firstStudent.bench =
                    bench.number;

                firstStudent.seat =
                    "A";
            }


            if (secondStudent) {

                secondStudent.hall =
                    hall.number;

                secondStudent.bench =
                    bench.number;

                secondStudent.seat =
                    "B";
            }


            hall.benches.push(bench);

            studentPointer +=
                firstStudent ? 1 : 0;

            studentPointer +=
                secondStudent ? 1 : 0;
        }


        if (hall.benches.length) {
            examData.halls.push(hall);
        }
    }
}


/* =========================================================
   FIND NEXT DIFFERENT DEPARTMENT
   ========================================================= */

function getNextStudentDifferentFrom(
    departmentIndex,
    queues
) {

    for (
        let i = 0;
        i < queues.length;
        i++
    ) {

        if (
            departmentIndex !== null &&
            i === departmentIndex
        ) {
            continue;
        }

        if (queues[i].length > 0) {

            return queues[i][0];
        }
    }

    return null;
}


/* =========================================================
   ANY REMAINING STUDENT
   ========================================================= */

function getAnyRemainingStudent(queues) {

    for (const queue of queues) {

        if (queue.length > 0) {
            return queue[0];
        }
    }

    return null;
}


/* =========================================================
   REMOVE STUDENT
   ========================================================= */

function removeStudentFromQueues(
    student,
    queues
) {

    if (!student) {
        return;
    }

    const queue =
        queues[student.departmentIndex];

    if (!queue) {
        return;
    }

    const index =
        queue.findIndex(
            item =>
                item.id === student.id
        );

    if (index !== -1) {
        queue.splice(index, 1);
    }
}


/* =========================================================
   READ DEPARTMENT DATA
   =========================================================

   Supports common input naming styles.

   Department boxes can contain:

   .department-name
   .dept-name
   input[name="departmentName"]

   .student-count
   .dept-count
   input[name="studentCount"]

   .subject
   .dept-subject
   input[name="subject"]
*/


function readDepartments() {

    const departments = [];

    const boxes =
        $$(".department-box, .department-card, .dept-box, [data-department]");


    /*
       If department boxes exist
    */

    if (boxes.length) {

        boxes.forEach((box, index) => {

            const nameInput =
                box.querySelector(
                    ".department-name, .dept-name, input[name='departmentName'], input[name='department']"
                );

            const countInput =
                box.querySelector(
                    ".student-count, .dept-count, input[name='studentCount'], input[name='students']"
                );

            const subjectInput =
                box.querySelector(
                    ".subject, .dept-subject, input[name='subject']"
                );


            const name =
                nameInput?.value.trim() ||
                `Department ${index + 1}`;

            const count =
                parseInt(
                    countInput?.value || "0",
                    10
                ) || 0;

            const subject =
                subjectInput?.value.trim() ||
                "EXAM SUBJECT";


            departments.push({

                index,

                name,

                studentCount:
                    count,

                subject,

                code:
                    makeDepartmentCode(
                        name,
                        index
                    )
            });

        });

        return departments;
    }


    /*
       Alternative: separate inputs
       using data-department-index
    */

    const names =
        $$("[data-department-name]");

    if (names.length) {

        names.forEach((nameInput, index) => {

            const countInput =
                document.querySelector(
                    `[data-student-count="${index}"]`
                );

            const subjectInput =
                document.querySelector(
                    `[data-subject="${index}"]`
                );


            const name =
                nameInput.value.trim() ||
                `Department ${index + 1}`;

            const count =
                parseInt(
                    countInput?.value || "0",
                    10
                ) || 0;

            const subject =
                subjectInput?.value.trim() ||
                "EXAM SUBJECT";


            departments.push({

                index,

                name,

                studentCount:
                    count,

                subject,

                code:
                    makeDepartmentCode(
                        name,
                        index
                    )
            });
        });
    }


    return departments;
}


/* =========================================================
   START ALLOCATION
   ========================================================= */

function startAllocation() {

    const totalHalls =
        numberValue(
            "#totalHalls",
            "#numberOfHalls",
            "#numHalls",
            "[name='totalHalls']",
            "[name='halls']"
        );


    const totalDepartments =
        numberValue(
            "#totalDepartments",
            "#numberOfDepartments",
            "#numDepartments",
            "[name='totalDepartments']",
            "[name='departments']"
        );


    examData.totalHalls =
        totalHalls || 1;

    examData.totalDepartments =
        totalDepartments ||
        readDepartments().length;


    examData.departments =
        readDepartments();


    /*
       Fix indexes
    */

    examData.departments =
        examData.departments.map(
            (dept, index) => ({
                ...dept,
                index,

                code:
                    makeDepartmentCode(
                        dept.name,
                        index
                    )
            })
        );


    if (!examData.departments.length) {

        alert(
            "Please enter at least one department."
        );

        return;
    }


    const totalStudents =
        examData.departments.reduce(
            (sum, dept) =>
                sum + dept.studentCount,
            0
        );


    if (totalStudents <= 0) {

        alert(
            "Please enter student count for the departments."
        );

        return;
    }


    /*
       Create students
    */

    createStudents();


    /*
       Allocate halls
    */

    allocateStudents();


    /*
       Render
    */

    renderArrangement();


    /*
       Show arrangement section
    */

    showArrangementSection();
}


/* =========================================================
   ARRANGEMENT HTML
   ========================================================= */

function renderArrangement() {

    const container =
        $(
            "#arrangementContainer"
        ) ||
        $(
            "#arrangement"
        ) ||
        $(
            "#hallArrangement"
        ) ||
        $(
            ".arrangement-container"
        );


    if (!container) {

        console.warn(
            "Arrangement container not found."
        );

        return;
    }


    let html = "";


    html += `

        <div class="allocation-summary">

            <div class="summary-item">
                <span>TOTAL STUDENTS</span>
                <strong>
                    ${examData.students.length}
                </strong>
            </div>

            <div class="summary-item">
                <span>DEPARTMENTS</span>
                <strong>
                    ${examData.departments.length}
                </strong>
            </div>

            <div class="summary-item">
                <span>EXAM HALLS</span>
                <strong>
                    ${examData.halls.length}
                </strong>
            </div>

        </div>


        <div class="search-panel">

            <div class="search-title">
                FIND STUDENT BY REGISTER NUMBER
            </div>

            <div class="search-row">

                <input
                    type="text"
                    id="studentSearch"
                    placeholder="Enter Register Number e.g. BTE005"
                    autocomplete="off"
                >

                <button
                    type="button"
                    id="studentSearchBtn"
                    class="search-btn"
                >
                    SEARCH
                </button>

            </div>

            <div
                id="searchResult"
                class="search-result"
            ></div>

        </div>


        <div
            id="hallLayout"
            class="hall-layout"
        >
    `;


    examData.halls.forEach(
        hall => {

            html += `

                <div
                    class="exam-hall-card"
                    data-hall="${hall.number}"
                >

                    <div class="hall-header">

                        <div>

                            <h2>
                                EXAM HALL ${hall.number}
                            </h2>

                        </div>

                        <span class="hall-status">
                            ● ACTIVE
                        </span>

                    </div>

            `;


            hall.benches.forEach(
                bench => {

                    const seatA =
                        bench.seats[0];

                    const seatB =
                        bench.seats[1];


                    const departmentNames = [
                        seatA?.department,
                        seatB?.department
                    ]
                        .filter(Boolean)
                        .filter(
                            (value, index, arr) =>
                                arr.indexOf(value) === index
                        );


                    const subjects = [
                        seatA?.subject,
                        seatB?.subject
                    ]
                        .filter(Boolean)
                        .filter(
                            (value, index, arr) =>
                                arr.indexOf(value) === index
                        );


                    html += `

                        <div
                            class="bench-block"
                            data-bench="${bench.number}"
                        >

                            <div class="bench-title">

                                BENCH ${bench.number}

                                •
                                ${departmentNames.join(" + ")}

                                •
                                ${subjects.join(" + ")}

                            </div>


                            <div class="seat-row">

                                ${renderSeat(
                                    seatA,
                                    "A"
                                )}

                                ${renderSeat(
                                    seatB,
                                    "B"
                                )}

                            </div>

                        </div>

                    `;
                }
            );


            html += `
                </div>
            `;
        }
    );


    html += `
        </div>
    `;


    container.innerHTML = html;


    setupSearch();
}


/* =========================================================
   RENDER SINGLE SEAT
   ========================================================= */

function renderSeat(
    student,
    seat
) {

    if (!student) {

        return `

            <div
                class="seat-card empty-seat"
            >

                <div class="seat-label">
                    SEAT ${seat}
                </div>

                <div class="empty-text">
                    EMPTY / SINGLE
                </div>

            </div>

        `;
    }


    return `

        <div
            class="seat-card student-seat"
            id="seat-${student.registerNumber}"
            data-register="${student.registerNumber.toUpperCase()}"
            data-student="${student.id}"
        >

            <div class="seat-label">
                SEAT ${seat}
            </div>


            <div class="register-number">

                REG:
                ${student.registerNumber}

            </div>


            <div class="student-department">

                ${student.department}

            </div>


            <div class="student-subject">

                ${student.subject}

            </div>

        </div>

    `;
}


/* =========================================================
   SEARCH
   ========================================================= */

function setupSearch() {

    const input =
        $("#studentSearch");

    const button =
        $("#studentSearchBtn");


    if (!input) {
        return;
    }


    function performSearch() {

        const query =
            input.value
                .trim()
                .toUpperCase();


        clearSearchHighlight();


        if (!query) {

            showSearchMessage(
                ""
            );

            return;
        }


        /*
           Register number only
        */

        const student =
            examData.students.find(
                item =>
                    item.registerNumber
                        .toUpperCase() ===
                    query
            );


        if (!student) {

            showSearchMessage(`

                <div class="search-not-found">

                    <strong>
                        STUDENT NOT FOUND
                    </strong>

                    <span>
                        Check the register number
                    </span>

                </div>

            `);

            return;
        }


        /*
           Highlight exact seat
        */

        const seat =
            document.getElementById(
                `seat-${student.registerNumber}`
            );


        if (seat) {

            seat.classList.add(
                "search-highlight"
            );


            /*
               Scroll to student
            */

            setTimeout(() => {

                seat.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

            }, 100);
        }


        /*
           Show result
        */

        showSearchMessage(`

            <div class="search-found">

                <div class="found-title">
                    STUDENT FOUND
                </div>


                <div class="found-grid">

                    <div>
                        <span>HALL</span>
                        <strong>
                            EXAM HALL ${student.hall}
                        </strong>
                    </div>


                    <div>
                        <span>BENCH</span>
                        <strong>
                            BENCH ${student.bench}
                        </strong>
                    </div>


                    <div>
                        <span>SEAT</span>
                        <strong>
                            SEAT ${student.seat}
                        </strong>
                    </div>


                    <div>
                        <span>REGISTER NUMBER</span>
                        <strong>
                            ${student.registerNumber}
                        </strong>
                    </div>


                    <div>
                        <span>DEPARTMENT</span>
                        <strong>
                            ${student.department}
                        </strong>
                    </div>


                    <div>
                        <span>EXAM SUBJECT</span>
                        <strong>
                            ${student.subject}
                        </strong>
                    </div>

                </div>

            </div>

        `);
    }


    if (button) {

        button.addEventListener(
            "click",
            performSearch
        );
    }


    input.addEventListener(
        "keydown",
        event => {

            if (event.key === "Enter") {
                performSearch();
            }
        }
    );


    input.addEventListener(
        "input",
        () => {

            if (!input.value.trim()) {

                clearSearchHighlight();

                showSearchMessage("");
            }
        }
    );
}


/* =========================================================
   CLEAR SEARCH
   ========================================================= */

function clearSearchHighlight() {

    $$(".search-highlight")
        .forEach(element => {

            element.classList.remove(
                "search-highlight"
            );
        });
}


/* =========================================================
   SEARCH MESSAGE
   ========================================================= */

function showSearchMessage(html) {

    const result =
        $("#searchResult");

    if (result) {
        result.innerHTML = html;
    }
}


/* =========================================================
   SHOW ARRANGEMENT SECTION
   ========================================================= */

function showArrangementSection() {

    const arrangement =
        $(
            "#arrangementSection"
        ) ||
        $(
            "#arrangementContainer"
        ) ||
        $(
            "#arrangement"
        );


    if (!arrangement) {
        return;
    }


    arrangement.classList.add(
        "active"
    );


    arrangement.style.display =
        "block";


    setTimeout(() => {

        arrangement.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }, 150);
}


/* =========================================================
   SONIC CURSOR
   ========================================================= */

function setupSonicCursor() {

    let lastTime = 0;


    document.addEventListener(
        "mousemove",
        event => {

            const now =
                Date.now();


            /*
               Don't create too many circles
            */

            if (
                now - lastTime < 80
            ) {
                return;
            }


            lastTime = now;


            const ripple =
                document.createElement(
                    "span"
                );


            ripple.className =
                "sonic-ripple";


            ripple.style.left =
                `${event.clientX}px`;


            ripple.style.top =
                `${event.clientY}px`;


            document.body.appendChild(
                ripple
            );


            setTimeout(() => {

                ripple.remove();

            }, 650);
        }
    );
}


/* =========================================================
   BUTTON AUTO DETECTION
   ========================================================= */

function setupAllocationButtons() {

    const possibleButtons = [

        "#createExamSetup",

        "#createSetup",

        "#generateArrangement",

        "#allocateStudents",

        "#generateAllocation",

        ".create-exam-btn",

        ".generate-btn",

        "[data-action='allocate']",

        "[data-action='generate']"

    ];


    possibleButtons.forEach(
        selector => {

            $$(selector).forEach(
                button => {

                    if (
                        button.dataset
                            .allocationReady
                    ) {
                        return;
                    }


                    button.dataset
                        .allocationReady =
                        "true";


                    button.addEventListener(
                        "click",
                        event => {

                            event.preventDefault();

                            startAllocation();

                        }
                    );
                }
            );
        }
    );
}


/* =========================================================
   WIZARD NEXT / BACK
   ========================================================= */

function setupWizard() {

    const steps =
        $$(".wizard-step");

    if (!steps.length) {
        return;
    }


    let currentStep = 0;


    function showStep(index) {

        if (
            index < 0 ||
            index >= steps.length
        ) {
            return;
        }


        currentStep = index;


        steps.forEach(
            (step, i) => {

                step.classList.toggle(
                    "active",
                    i === currentStep
                );

            }
        );


        const progress =
            $$(".progress-step");


        progress.forEach(
            (item, i) => {

                item.classList.toggle(
                    "active",
                    i === currentStep
                );


                item.classList.toggle(
                    "completed",
                    i < currentStep
                );
            }
        );


        $$(".progress-line")
            .forEach(
                (line, i) => {

                    line.classList.toggle(
                        "completed",
                        i < currentStep
                    );
                }
            );


        /*
           BACK
        */

        $$(".back-btn")
            .forEach(button => {

                button.style.visibility =
                    currentStep === 0
                        ? "hidden"
                        : "visible";
            });
    }


    $$(".next-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    if (
                        currentStep <
                        steps.length - 1
                    ) {

                        showStep(
                            currentStep + 1
                        );

                    }
                }
            );
        });


    $$(".back-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    if (
                        currentStep > 0
                    ) {

                        showStep(
                            currentStep - 1
                        );

                    }
                }
            );
        });


    showStep(0);
}


/* =========================================================
   AUTO INITIALIZATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        console.log(
            "SMART EXAM HALL SYSTEM ONLINE"
        );


        setupWizard();


        setupAllocationButtons();


        setupSonicCursor();

    }
);


/* =========================================================
   GLOBAL FUNCTION
   ========================================================= */

window.startExamAllocation =
    startAllocation;

window.generateArrangement =
    startAllocation;

window.searchStudent =
    function(registerNumber) {

        const input =
            $("#studentSearch");

        if (!input) {
            return;
        }

        input.value =
            registerNumber;

        input.dispatchEvent(
            new KeyboardEvent(
                "keydown",
                {
                    key: "Enter"
                }
            )
        );
    };
