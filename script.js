/* =========================================================
   SMART EXAM HALL ALLOCATION SYSTEM
   MAIN JAVASCRIPT ENGINE
========================================================= */


/* =========================================================
   GLOBAL DATA
========================================================= */

let examData = {
    students: 0,
    departments: [],
    halls: [],
    studentList: [],
    allocationGenerated: false
};


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    loadSavedSetup();

    setupCursorEffect();

});


/* =========================================================
   SONIC CURSOR EFFECT
========================================================= */

let audioContext = null;

function playSonicSound() {

    try {

        if (!audioContext) {
            audioContext = new (
                window.AudioContext ||
                window.webkitAudioContext
            )();
        }

        const oscillator =
            audioContext.createOscillator();

        const gain =
            audioContext.createGain();

        oscillator.type = "sine";

        oscillator.frequency.setValueAtTime(
            520,
            audioContext.currentTime
        );

        oscillator.frequency.exponentialRampToValueAtTime(
            180,
            audioContext.currentTime + 0.10
        );

        gain.gain.setValueAtTime(
            0.035,
            audioContext.currentTime
        );

        gain.gain.exponentialRampToValueAtTime(
            0.001,
            audioContext.currentTime + 0.10
        );

        oscillator.connect(gain);
        gain.connect(audioContext.destination);

        oscillator.start();

        oscillator.stop(
            audioContext.currentTime + 0.10
        );

    } catch (error) {
        console.log("Audio unavailable");
    }
}


function setupCursorEffect() {

    document.addEventListener("click", (event) => {

        playSonicSound();

        const ripple =
            document.createElement("div");

        ripple.className = "sonic-ripple";

        ripple.style.left =
            event.clientX + "px";

        ripple.style.top =
            event.clientY + "px";

        document.body.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);

    });

}


/* =========================================================
   STEP 1
   CREATE EXAM SETUP
========================================================= */

function createExamSetup() {

    const studentCount =
        parseInt(
            document.getElementById("studentCount").value
        );

    const departmentCount =
        parseInt(
            document.getElementById("departmentCount").value
        );

    const hallCount =
        parseInt(
            document.getElementById("hallCount").value
        );


    if (
        !studentCount ||
        !departmentCount ||
        !hallCount
    ) {

        alert(
            "Please enter student, department and hall counts."
        );

        return;
    }


    if (
        studentCount < 1 ||
        departmentCount < 1 ||
        hallCount < 1
    ) {

        alert(
            "All values must be greater than zero."
        );

        return;
    }


    if (departmentCount > studentCount) {

        alert(
            "Number of departments cannot exceed number of students."
        );

        return;
    }


    examData.students =
        studentCount;


    examData.departments =
        [];

    examData.halls =
        [];

    examData.studentList =
        [];

    examData.allocationGenerated =
        false;


    for (
        let i = 1;
        i <= departmentCount;
        i++
    ) {

        examData.departments.push({

            id: i,

            name:
                `Department ${i}`

        });

    }


    for (
        let i = 1;
        i <= hallCount;
        i++
    ) {

        examData.halls.push({

            id: i,

            name:
                `Hall ${String(i).padStart(2, "0")}`,

            capacity:
                Math.ceil(
                    studentCount / hallCount
                ) + 2

        });

    }


    saveSetup();

    showConfiguration();

}


/* =========================================================
   STEP 1.5
   CONFIGURATION SCREEN
========================================================= */

function showConfiguration() {

    hideAllScreens();

    document
        .getElementById("configurationScreen")
        .classList.remove("hidden");


    document
        .getElementById("summaryStudents")
        .textContent =
        examData.students;


    document
        .getElementById("summaryDepartments")
        .textContent =
        examData.departments.length;


    document
        .getElementById("summaryHalls")
        .textContent =
        examData.halls.length;


    createDepartmentInputs();

    createHallInputs();

}


/* =========================================================
   DEPARTMENT INPUTS
========================================================= */

function createDepartmentInputs() {

    const container =
        document.getElementById(
            "departmentInputs"
        );

    container.innerHTML = "";


    examData.departments.forEach(
        (department, index) => {

            const wrapper =
                document.createElement("div");

            wrapper.className =
                "dynamic-field";


            wrapper.innerHTML = `

                <label>
                    DEPARTMENT ${index + 1}
                </label>

                <input
                    type="text"
                    id="department-${index}"
                    value="${escapeHTML(
                        department.name
                    )}"
                    placeholder="Example: AI & DS"
                >

            `;


            container.appendChild(wrapper);

        }
    );

}


/* =========================================================
   HALL INPUTS
========================================================= */

function createHallInputs() {

    const container =
        document.getElementById(
            "hallInputs"
        );

    container.innerHTML = "";


    examData.halls.forEach(
        (hall, index) => {

            const wrapper =
                document.createElement("div");

            wrapper.className =
                "hall-field";


            wrapper.innerHTML = `

                <label>
                    EXAM HALL ${index + 1}
                </label>

                <div class="hall-field-grid">

                    <input
                        type="text"
                        id="hall-name-${index}"
                        value="${escapeHTML(
                            hall.name
                        )}"
                        placeholder="Hall Name"
                    >

                    <input
                        type="number"
                        id="hall-capacity-${index}"
                        value="${hall.capacity}"
                        min="1"
                        placeholder="Seats"
                    >

                </div>

            `;


            container.appendChild(wrapper);

        }
    );

}


/* =========================================================
   GENERATE ALLOCATION
   MOVE TO STEP 2
========================================================= */

function generateAllocation() {

    let totalCapacity = 0;


    examData.departments =
        examData.departments.map(
            (department, index) => {

                const input =
                    document.getElementById(
                        `department-${index}`
                    );

                const name =
                    input.value.trim();


                return {

                    id:
                        index + 1,

                    name:
                        name ||
                        `Department ${index + 1}`

                };

            }
        );


    examData.halls =
        examData.halls.map(
            (hall, index) => {

                const nameInput =
                    document.getElementById(
                        `hall-name-${index}`
                    );

                const capacityInput =
                    document.getElementById(
                        `hall-capacity-${index}`
                    );


                const name =
                    nameInput.value.trim() ||
                    `Hall ${String(
                        index + 1
                    ).padStart(2, "0")}`;


                const capacity =
                    parseInt(
                        capacityInput.value
                    );


                if (!capacity || capacity < 1) {

                    alert(
                        `${name}: Please enter a valid capacity.`
                    );

                }


                totalCapacity +=
                    capacity || 0;


                return {

                    id:
                        index + 1,

                    name:
                        name,

                    capacity:
                        capacity || 0

                };

            }
        );


    if (
        totalCapacity <
        examData.students
    ) {

        alert(
            `Hall capacity is not enough.\n\n` +
            `Students: ${examData.students}\n` +
            `Available seats: ${totalCapacity}\n\n` +
            `Please increase hall capacity.`
        );

        return;
    }


    saveSetup();

    showAllocationScreen();

}


/* =========================================================
   STEP 2 SCREEN
========================================================= */

function showAllocationScreen() {

    hideAllScreens();

    document
        .getElementById("allocationScreen")
        .classList.remove("hidden");


    document
        .getElementById(
            "allocationStudentCount"
        )
        .textContent =
        examData.students;


    document
        .getElementById(
            "allocationDepartmentCount"
        )
        .textContent =
        examData.departments.length;


    document
        .getElementById(
            "allocationHallCount"
        )
        .textContent =
        examData.halls.length;


    const totalBenches =
        examData.halls.reduce(
            (total, hall) => {

                return total +
                    Math.ceil(
                        hall.capacity / 2
                    );

            },
            0
        );


    document
        .getElementById(
            "allocationBenchCount"
        )
        .textContent =
        totalBenches;


    createStudentEntryTable();

}


/* =========================================================
   STUDENT ENTRY TABLE
========================================================= */

function createStudentEntryTable() {

    const tbody =
        document.getElementById(
            "studentEntryBody"
        );

    tbody.innerHTML = "";


    for (
        let i = 0;
        i < examData.students;
        i++
    ) {

        const student =
            examData.studentList[i];


        const row =
            document.createElement("tr");


        let departmentOptions = "";

        examData.departments.forEach(
            (department) => {

                const selected =
                    student &&
                    student.department ===
                    department.name
                        ? "selected"
                        : "";


                departmentOptions += `

                    <option
                        value="${escapeHTML(
                            department.name
                        )}"
                        ${selected}
                    >
                        ${escapeHTML(
                            department.name
                        )}
                    </option>

                `;

            }
        );


        row.innerHTML = `

            <td>
                ${i + 1}
            </td>

            <td>

                <input
                    type="text"
                    class="student-name"
                    data-index="${i}"
                    value="${student
                        ? escapeHTML(student.name)
                        : ""}"
                    placeholder="Student Name"
                >

            </td>

            <td>

                <input
                    type="text"
                    class="student-register"
                    data-index="${i}"
                    value="${student
                        ? escapeHTML(student.register)
                        : ""}"
                    placeholder="Register No"
                >

            </td>

            <td>

                <select
                    class="student-department"
                    data-index="${i}"
                >

                    ${departmentOptions}

                </select>

            </td>

            <td>

                <input
                    type="text"
                    class="student-year"
                    data-index="${i}"
                    value="${student
                        ? escapeHTML(student.year)
                        : "II Year"}"
                    placeholder="II Year"
                >

            </td>

            <td>

                <input
                    type="text"
                    class="student-exam"
                    data-index="${i}"
                    value="${student
                        ? escapeHTML(student.exam)
                        : "End Semester Examination"}"
                    placeholder="Exam"
                >

            </td>

            <td>

                <input
                    type="date"
                    class="student-date"
                    data-index="${i}"
                    value="${student
                        ? student.examDate
                        : "2026-09-28"}"
                >

            </td>

        `;


        tbody.appendChild(row);

    }

}


/* =========================================================
   GENERATE DEMO STUDENTS
========================================================= */

function generateDemoStudents() {

    const students = [];

    const departmentCount =
        examData.departments.length;


    for (
        let i = 0;
        i < examData.students;
        i++
    ) {

        const departmentIndex =
            i % departmentCount;


        const department =
            examData.departments[
                departmentIndex
            ];


        const shortCode =
            getDepartmentCode(
                department.name
            );


        students.push({

            id:
                i + 1,

            name:
                generateStudentName(i),

            register:
                `24${shortCode}${String(
                    i + 1
                ).padStart(3, "0")}`,

            department:
                department.name,

            year:
                "II Year",

            exam:
                "End Semester Examination",

            examDate:
                "2026-09-28",

            hall:
                "",

            bench:
                "",

            seat:
                "",

            seatIndex:
                -1

        });

    }


    examData.studentList =
        students;


    saveSetup();

    createStudentEntryTable();


    alert(
        "Demo student data generated successfully!"
    );

}


/* =========================================================
   STUDENT NAME GENERATOR
========================================================= */

function generateStudentName(index) {

    const firstNames = [

        "Samuvel",
        "Arun",
        "Kavin",
        "Vignesh",
        "Praveen",
        "Dinesh",
        "Rahul",
        "Sanjay",
        "Ajay",
        "Harish",
        "Vijay",
        "Gokul",
        "Surya",
        "Manoj",
        "Ashwin",
        "Naveen",
        "Bala",
        "Karthik",
        "Rohit",
        "Dharshan"

    ];


    const lastNames = [

        "R",
        "Kumar",
        "Raj",
        "S",
        "M",
        "Prakash",
        "K",
        "B",
        "P",
        "V"

    ];


    return (
        firstNames[index % firstNames.length]
        +
        " "
        +
        lastNames[
            index % lastNames.length
        ]
    );

}


/* =========================================================
   DEPARTMENT CODE
========================================================= */

function getDepartmentCode(name) {

    const value =
        name
            .toUpperCase()
            .replace(/[^A-Z]/g, "");


    if (value.includes("ARTIFICIAL")) {
        return "AD";
    }

    if (value.includes("AI")) {
        return "AD";
    }

    if (value.includes("COMPUTER")) {
        return "CS";
    }

    if (value.includes("CSE")) {
        return "CS";
    }

    if (value.includes("ELECTRONIC")) {
        return "EC";
    }

    if (value.includes("ECE")) {
        return "EC";
    }

    if (value.includes("ELECTRICAL")) {
        return "EE";
    }

    if (value.includes("EEE")) {
        return "EE";
    }

    if (value.includes("MECHANICAL")) {
        return "ME";
    }

    if (value.includes("CIVIL")) {
        return "CE";
    }


    return value.substring(0, 2) || "ST";

}


/* =========================================================
   READ STUDENT TABLE
========================================================= */

function readStudentTable() {

    const students = [];

    const names =
        document.querySelectorAll(
            ".student-name"
        );

    const registers =
        document.querySelectorAll(
            ".student-register"
        );

    const departments =
        document.querySelectorAll(
            ".student-department"
        );

    const years =
        document.querySelectorAll(
            ".student-year"
        );

    const exams =
        document.querySelectorAll(
            ".student-exam"
        );

    const dates =
        document.querySelectorAll(
            ".student-date"
        );


    for (
        let i = 0;
        i < examData.students;
        i++
    ) {

        const name =
            names[i].value.trim();

        const register =
            registers[i].value.trim();

        const department =
            departments[i].value;

        const year =
            years[i].value.trim() ||
            "II Year";

        const exam =
            exams[i].value.trim() ||
            "End Semester Examination";

        const examDate =
            dates[i].value ||
            "2026-09-28";


        if (!name || !register) {

            alert(
                `Please enter Name and Register Number for student ${i + 1}.`
            );

            return null;
        }


        students.push({

            id:
                i + 1,

            name:
                name,

            register:
                register,

            department:
                department,

            year:
                year,

            exam:
                exam,

            examDate:
                examDate,

            hall:
                "",

            bench:
                "",

            seat:
                "",

            seatIndex:
                -1

        });

    }


    return students;

}


/* =========================================================
   SMART SEATING GENERATION
========================================================= */

function generateSmartSeating() {

    const students =
        readStudentTable();


    if (!students) {
        return;
    }


    examData.studentList =
        students;


    /*
       STEP 1
       Group students by department
    */

    const departmentPools = {};


    examData.departments.forEach(
        (department) => {

            departmentPools[
                department.name
            ] = [];

        }
    );


    students.forEach(
        (student) => {

            if (
                !departmentPools[
                    student.department
                ]
            ) {

                departmentPools[
                    student.department
                ] = [];

            }


            departmentPools[
                student.department
            ].push(student);

        }
    );


    /*
       STEP 2
       Create mixed student order
    */

    const orderedStudents =
        createMixedStudentOrder(
            departmentPools
        );


    /*
       STEP 3
       Reset hall allocation
    */

    examData.halls.forEach(
        (hall) => {

            hall.allocatedStudents = [];

            hall.benches = [];

        }
    );


    /*
       STEP 4
       Allocate across halls
    */

    let studentIndex = 0;


    for (
        let h = 0;
        h < examData.halls.length;
        h++
    ) {

        const hall =
            examData.halls[h];


        const seatCapacity =
            hall.capacity;


        const benchCount =
            Math.ceil(
                seatCapacity / 2
            );


        for (
            let b = 0;
            b < benchCount;
            b++
        ) {

            if (
                studentIndex >=
                orderedStudents.length
            ) {
                break;
            }


            const bench = {

                number:
                    b + 1,

                left:
                    null,

                right:
                    null

            };


            /*
               LEFT SEAT
            */

            if (
                studentIndex <
                orderedStudents.length
            ) {

                const student =
                    orderedStudents[
                        studentIndex
                    ];


                assignStudentSeat(
                    student,
                    hall,
                    bench,
                    "LEFT"
                );


                bench.left =
                    student;


                hall.allocatedStudents.push(
                    student
                );


                studentIndex++;

            }


            /*
               RIGHT SEAT

               Try to select a different
               department than LEFT.
            */

            if (
                studentIndex <
                orderedStudents.length
            ) {

                let rightIndex =
                    findDifferentDepartmentStudent(
                        orderedStudents,
                        studentIndex,
                        bench.left
                    );


                if (
                    rightIndex !== -1
                ) {

                    [
                        orderedStudents[
                            studentIndex
                        ],

                        orderedStudents[
                            rightIndex
                        ]

                    ] =
                    [
                        orderedStudents[
                            rightIndex
                        ],

                        orderedStudents[
                            studentIndex
                        ]

                    ];

                }


                const student =
                    orderedStudents[
                        studentIndex
                    ];


                /*
                   Only add if hall has another seat.
                */

                const usedSeats =
                    b * 2 + 1;


                if (
                    usedSeats <
                    seatCapacity
                ) {

                    assignStudentSeat(
                        student,
                        hall,
                        bench,
                        "RIGHT"
                    );


                    bench.right =
                        student;


                    hall.allocatedStudents.push(
                        student
                    );


                    studentIndex++;

                }

            }


            hall.benches.push(
                bench
            );

        }

    }


    if (
        studentIndex <
        orderedStudents.length
    ) {

        alert(
            "Not enough hall capacity for all students."
        );

        return;
    }


    examData.allocationGenerated =
        true;


    saveSetup();

    renderSeatingResult();


    document
        .getElementById(
            "continueToLocator"
        )
        .classList.remove("hidden");


    document
        .getElementById(
            "seatingResult"
        )
        .scrollIntoView({
            behavior: "smooth"
        });

}


/* =========================================================
   MIX DEPARTMENTS
========================================================= */

function createMixedStudentOrder(
    departmentPools
) {

    const result = [];

    const departmentNames =
        Object.keys(
            departmentPools
        );


    let lastDepartment = null;


    while (true) {

        let available =
            departmentNames.filter(
                (department) =>
                    departmentPools[
                        department
                    ].length > 0
            );


        if (
            available.length === 0
        ) {
            break;
        }


        /*
           Sort by remaining count.
           This keeps distribution balanced.
        */

        available.sort(
            (a, b) =>
                departmentPools[b].length -
                departmentPools[a].length
        );


        let selected =
            available.find(
                (department) =>
                    department !==
                    lastDepartment
            );


        if (!selected) {
            selected = available[0];
        }


        const student =
            departmentPools[
                selected
            ].shift();


        result.push(student);


        lastDepartment =
            selected;

    }


    return result;

}


/* =========================================================
   FIND DIFFERENT DEPARTMENT
========================================================= */

function findDifferentDepartmentStudent(
    students,
    startIndex,
    leftStudent
) {

    if (!leftStudent) {
        return -1;
    }


    for (
        let i = startIndex;
        i < students.length;
        i++
    ) {

        if (
            students[i].department !==
            leftStudent.department
        ) {

            return i;

        }

    }


    return -1;

}


/* =========================================================
   ASSIGN SEAT
========================================================= */

function assignStudentSeat(
    student,
    hall,
    bench,
    seat
) {

    student.hall =
        hall.name;

    student.bench =
        `Bench ${String(
            bench.number
        ).padStart(2, "0")}`;

    student.seat =
        seat;

    student.seatIndex =
        bench.number;

}


/* =========================================================
   RENDER SEATING RESULT
========================================================= */

function renderSeatingResult() {

    const container =
        document.getElementById(
            "seatingResult"
        );


    let html = `

        <div class="seating-result-title">

            <h3>
                🪑 Generated Seating Arrangement
            </h3>

            <span>
                ALLOCATION COMPLETE
            </span>

        </div>

    `;


    examData.halls.forEach(
        (hall) => {

            if (
                !hall.benches ||
                hall.benches.length === 0
            ) {
                return;
            }


            const occupied =
                hall.allocatedStudents.length;


            html += `

                <div class="hall-seating-card">

                    <div class="hall-seating-header">

                        <h3>
                            🏫 ${escapeHTML(
                                hall.name
                            )}
                        </h3>

                        <div class="hall-capacity">

                            ${occupied}
                            /
                            ${hall.capacity}
                            SEATS OCCUPIED

                        </div>

                    </div>


                    <div class="front-board">

                        FRONT / BOARD

                    </div>


                    <div class="bench-grid">

            `;


            hall.benches.forEach(
                (bench) => {

                    html += `

                        <div class="bench-card">

                            <div class="bench-number">

                                BENCH
                                ${String(
                                    bench.number
                                ).padStart(2, "0")}

                            </div>


                            <div class="seat-row">


                                <div class="seat">

                                    <div class="seat-label">
                                        LEFT SEAT
                                    </div>

                                    ${
                                        bench.left
                                        ?

                                        `

                                        <div class="seat-name">

                                            ${escapeHTML(
                                                bench.left.name
                                            )}

                                        </div>

                                        <div class="seat-reg">

                                            ${escapeHTML(
                                                bench.left.register
                                            )}

                                        </div>

                                        `

                                        :

                                        `

                                        <div class="empty-seat">
                                            EMPTY
                                        </div>

                                        `
                                    }

                                </div>



                                <div class="seat">

                                    <div class="seat-label">
                                        RIGHT SEAT
                                    </div>

                                    ${
                                        bench.right
                                        ?

                                        `

                                        <div class="seat-name">

                                            ${escapeHTML(
                                                bench.right.name
                                            )}

                                        </div>

                                        <div class="seat-reg">

                                            ${escapeHTML(
                                                bench.right.register
                                            )}

                                        </div>

                                        `

                                        :

                                        `

                                        <div class="empty-seat">
                                            EMPTY
                                        </div>

                                        `
                                    }

                                </div>


                            </div>

                        </div>

                    `;

                }
            );


            html += `

                    </div>

                </div>

            `;

        }
    );


    container.innerHTML =
        html;

}


/* =========================================================
   STEP 3
========================================================= */

function openStudentLocator() {

    showDashboard();

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


/* =========================================================
   SHOW DASHBOARD
========================================================= */

function showDashboard() {

    hideAllScreens();

    document
        .getElementById(
            "dashboardScreen"
        )
        .classList.remove("hidden");


    document
        .getElementById(
            "totalStudentsDisplay"
        )
        .textContent =
        examData.students;


    document
        .getElementById(
            "totalDepartmentsDisplay"
        )
        .textContent =
        examData.departments.length;


    document
        .getElementById(
            "totalHallsDisplay"
        )
        .textContent =
        examData.halls.length;


    document
        .getElementById(
            "allocationDisplay"
        )
        .textContent =
        examData.allocationGenerated
            ? "ALLOCATED"
            : "READY";


    renderHallDashboard();

    renderDepartmentDashboard();

}


/* =========================================================
   SEARCH KEY
========================================================= */

function handleSearchKey(event) {

    if (
        event.key === "Enter"
    ) {

        searchStudent();

    }

}


/* =========================================================
   STUDENT SEARCH
========================================================= */

function searchStudent() {

    const input =
        document.getElementById(
            "registerNumber"
        );


    const query =
        input.value.trim().toLowerCase();


    const details =
        document.getElementById(
            "studentDetails"
        );


    if (!query) {

        details.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    🔎
                </div>

                <p>
                    Enter student name or register number.
                </p>

            </div>

        `;

        document
            .getElementById(
                "studentHallMap"
            )
            .innerHTML = `

                <div class="empty-state">

                    <div class="empty-icon">
                        🏫
                    </div>

                    <p>
                        Search a student to display
                        their exact hall, bench and seat.
                    </p>

                </div>

            `;

        return;
    }


    const matches =
        examData.studentList.filter(
            (student) => {

                const name =
                    student.name
                        .toLowerCase();

                const register =
                    student.register
                        .toLowerCase();


                return (
                    name.includes(query) ||
                    register.includes(query)
                );

            }
        );


    if (
        matches.length === 0
    ) {

        details.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    ❌
                </div>

                <p>
                    Student not found.
                </p>

            </div>

        `;

        document
            .getElementById(
                "studentHallMap"
            )
            .innerHTML = `

                <div class="empty-state">

                    <div class="empty-icon">
                        🏫
                    </div>

                    <p>
                        No hall location available.
                    </p>

                </div>

            `;

        return;
    }


    /*
       If multiple names match,
       show all results.
    */

    let html = `

        <div class="student-result">

    `;


    matches.forEach(
        (student) => {

            html += `

                <div class="detail-box">

                    <span>
                        STUDENT NAME
                    </span>

                    <strong>
                        ${escapeHTML(
                            student.name
                        )}
                    </strong>

                </div>


                <div class="detail-box">

                    <span>
                        REGISTER NUMBER
                    </span>

                    <strong>
                        ${escapeHTML(
                            student.register
                        )}
                    </strong>

                </div>


                <div class="detail-box">

                    <span>
                        DEPARTMENT
                    </span>

                    <strong>
                        ${escapeHTML(
                            student.department
                        )}
                    </strong>

                </div>


                <div class="detail-box">

                    <span>
                        YEAR
                    </span>

                    <strong>
                        ${escapeHTML(
                            student.year
                        )}
                    </strong>

                </div>


                <div class="detail-box">

                    <span>
                        EXAM
                    </span>

                    <strong>
                        ${escapeHTML(
                            student.exam
                        )}
                    </strong>

                </div>


                <div class="detail-box">

                    <span>
                        EXAM DATE
                    </span>

                    <strong>
                        ${formatDate(
                            student.examDate
                        )}
                    </strong>

                </div>


                <div class="location-banner">

                    <div>

                        <div class="location-main">

                            🏫
                            ${escapeHTML(
                                student.hall
                            )}

                        </div>

                        <div class="location-sub">

                            Exact examination location

                        </div>

                    </div>


                    <div>

                        <div class="location-main">

                            🪑
                            ${escapeHTML(
                                student.bench
                            )}

                        </div>

                        <div class="location-sub">

                            ${escapeHTML(
                                student.seat
                            )} SEAT

                        </div>

                    </div>

                </div>

            `;

        }
    );


    html += `

        </div>

    `;


    details.innerHTML =
        html;


    /*
       Show hall map
       for first matched student.
    */

    renderHallMap(
        matches[0]
    );


    details.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
    });

}


/* =========================================================
   HALL MAP
========================================================= */

function renderHallMap(
    selectedStudent
) {

    const container =
        document.getElementById(
            "studentHallMap"
        );


    const hall =
        examData.halls.find(
            (item) =>
                item.name ===
                selectedStudent.hall
        );


    if (!hall) {

        container.innerHTML = `

            <div class="empty-state">
                Hall information unavailable.
            </div>

        `;

        return;
    }


    let html = `

        <div class="hall-map">

            <div class="map-title">

                <h3>
                    ${escapeHTML(
                        hall.name
                    )}
                </h3>

                <p>
                    STUDENT SEAT LOCATION
                </p>

            </div>


            <div class="map-front">

                FRONT / BOARD

            </div>


            <div class="map-bench-grid">

    `;


    hall.benches.forEach(
        (bench) => {

            html += `

                <div class="map-bench">

                    <div class="map-bench-number">

                        BENCH
                        ${String(
                            bench.number
                        ).padStart(2, "0")}

                    </div>

            `;


            if (bench.left) {

                const isSelected =
                    bench.left.register ===
                    selectedStudent.register;


                html += `

                    <div class="map-seat
                        ${isSelected
                            ? "highlight"
                            : ""}">

                        LEFT

                        <br>

                        ${escapeHTML(
                            bench.left.register
                        )}

                    </div>

                `;

            } else {

                html += `

                    <div class="map-seat">

                        LEFT
                        <br>
                        EMPTY

                    </div>

                `;

            }


            if (bench.right) {

                const isSelected =
                    bench.right.register ===
                    selectedStudent.register;


                html += `

                    <div class="map-seat
                        ${isSelected
                            ? "highlight"
                            : ""}">

                        RIGHT

                        <br>

                        ${escapeHTML(
                            bench.right.register
                        )}

                    </div>

                `;

            } else {

                html += `

                    <div class="map-seat">

                        RIGHT
                        <br>
                        EMPTY

                    </div>

                `;

            }


            html += `

                </div>

            `;

        }
    );


    html += `

            </div>

        </div>

    `;


    container.innerHTML =
        html;

}


/* =========================================================
   HALL DASHBOARD
========================================================= */

function renderHallDashboard() {

    const container =
        document.getElementById(
            "hallDashboard"
        );


    let html = "";


    examData.halls.forEach(
        (hall) => {

            const occupied =
                hall.allocatedStudents
                    ? hall.allocatedStudents.length
                    : 0;


            const percentage =
                hall.capacity > 0
                    ? Math.min(
                        100,
                        Math.round(
                            (
                                occupied /
                                hall.capacity
                            ) * 100
                        )
                    )
                    : 0;


            html += `

                <div class="hall-card">

                    <h4>
                        🏫 ${escapeHTML(
                            hall.name
                        )}
                    </h4>

                    <p>
                        ${occupied}
                        /
                        ${hall.capacity}
                        seats occupied
                    </p>

                    <div class="hall-progress">

                        <div
                            class="hall-progress-bar"
                            style="
                                width:${percentage}%;
                            "
                        ></div>

                    </div>

                </div>

            `;

        }
    );


    container.innerHTML =
        html;

}


/* =========================================================
   DEPARTMENT DASHBOARD
========================================================= */

function renderDepartmentDashboard() {

    const container =
        document.getElementById(
            "departmentDashboard"
        );


    let html = "";


    examData.departments.forEach(
        (department) => {

            const count =
                examData.studentList.filter(
                    (student) =>
                        student.department ===
                        department.name
                ).length;


            html += `

                <div class="department-card">

                    <h4>
                        ${escapeHTML(
                            department.name
                        )}
                    </h4>

                    <span>

                        ${count}
                        students allocated

                    </span>

                </div>

            `;

        }
    );


    container.innerHTML =
        html;

}


/* =========================================================
   BACK TO SETUP
========================================================= */

function backToSetup() {

    hideAllScreens();

    document
        .getElementById(
            "setupScreen"
        )
        .classList.remove("hidden");

}


/* =========================================================
   NEW EXAM SETUP
========================================================= */

function newExamSetup() {

    if (
        confirm(
            "Start a new examination setup?"
        )
    ) {

        examData = {

            students: 0,

            departments: [],

            halls: [],

            studentList: [],

            allocationGenerated: false

        };


        localStorage.removeItem(
            "smartExamData"
        );


        document
            .getElementById(
                "studentCount"
            )
            .value = "";


        document
            .getElementById(
                "departmentCount"
            )
            .value = "";


        document
            .getElementById(
                "hallCount"
            )
            .value = "";


        backToSetup();

    }

}


/* =========================================================
   HIDE ALL SCREENS
========================================================= */

function hideAllScreens() {

    const screens = [

        "setupScreen",

        "configurationScreen",

        "allocationScreen",

        "dashboardScreen"

    ];


    screens.forEach(
        (id) => {

            const element =
                document.getElementById(id);


            if (element) {

                element.classList.add(
                    "hidden"
                );

            }

        }
    );

}


/* =========================================================
   SAVE LOCAL DATA
========================================================= */

function saveSetup() {

    localStorage.setItem(

        "smartExamData",

        JSON.stringify(
            examData
        )

    );

}


/* =========================================================
   LOAD LOCAL DATA
========================================================= */

function loadSavedSetup() {

    try {

        const saved =
            localStorage.getItem(
                "smartExamData"
            );


        if (!saved) {
            return;
        }


        const parsed =
            JSON.parse(saved);


        if (
            !parsed ||
            !parsed.students
        ) {

            return;

        }


        examData =
            parsed;


        /*
           If allocation already exists,
           open Step 3.
        */

        if (
            examData.allocationGenerated &&
            examData.studentList &&
            examData.studentList.length
        ) {

            showDashboard();

        }

    } catch (error) {

        console.log(
            "Saved data could not be loaded."
        );

    }

}


/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(dateString) {

    if (!dateString) {
        return "-";
    }


    const date =
        new Date(
            dateString +
            "T00:00:00"
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return dateString;

    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

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
