/* =========================================================
   SMART EXAM HALL ALLOCATION SYSTEM
   Main JavaScript Controller
   ========================================================= */


/* ---------------------------------------------------------
   AUDIO / SONIC EFFECT
   --------------------------------------------------------- */

let audioContext = null;
let soundEnabled = false;
let lastSoundTime = 0;

document.addEventListener("click", function () {

    if (!audioContext) {

        audioContext = new (
            window.AudioContext ||
            window.webkitAudioContext
        )();

        soundEnabled = true;
    }

});


document.addEventListener("mousemove", function (event) {

    /* Cursor Sonic Ripple */

    const ripple = document.createElement("div");

    ripple.className = "sonic-ripple";

    ripple.style.left = event.clientX + "px";
    ripple.style.top = event.clientY + "px";

    document.body.appendChild(ripple);

    setTimeout(() => {
        ripple.remove();
    }, 650);


    /* Small Sonic Sound */

    const now = Date.now();

    if (
        soundEnabled &&
        audioContext &&
        now - lastSoundTime > 150
    ) {

        lastSoundTime = now;

        try {

            const oscillator =
                audioContext.createOscillator();

            const gain =
                audioContext.createGain();

            oscillator.type = "sine";

            oscillator.frequency.value = 700;

            gain.gain.setValueAtTime(
                0.018,
                audioContext.currentTime
            );

            gain.gain.exponentialRampToValueAtTime(
                0.001,
                audioContext.currentTime + 0.035
            );

            oscillator.connect(gain);

            gain.connect(
                audioContext.destination
            );

            oscillator.start();

            oscillator.stop(
                audioContext.currentTime + 0.035
            );

        } catch (error) {

            console.log(
                "Audio unavailable"
            );

        }

    }

});


/* ---------------------------------------------------------
   SYSTEM DATA
   --------------------------------------------------------- */

let examData = {

    students: 0,

    departments: [],

    halls: [],

    allocationGenerated: false

};


/* ---------------------------------------------------------
   PAGE LOAD
   --------------------------------------------------------- */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadSavedSetup();

    }
);


/* ---------------------------------------------------------
   CREATE EXAM SETUP
   --------------------------------------------------------- */

function createExamSetup() {

    const studentInput =
        document.getElementById(
            "studentCount"
        );

    const departmentInput =
        document.getElementById(
            "departmentCount"
        );

    const hallInput =
        document.getElementById(
            "hallCount"
        );


    const students =
        parseInt(
            studentInput.value
        );

    const departmentCount =
        parseInt(
            departmentInput.value
        );

    const hallCount =
        parseInt(
            hallInput.value
        );


    /* Validation */

    if (
        !students ||
        !departmentCount ||
        !hallCount
    ) {

        alert(
            "Please enter all examination setup values."
        );

        return;
    }


    if (students < 1) {

        alert(
            "Student count must be at least 1."
        );

        return;
    }


    if (departmentCount < 1) {

        alert(
            "Department count must be at least 1."
        );

        return;
    }


    if (hallCount < 1) {

        alert(
            "Hall count must be at least 1."
        );

        return;
    }


    if (departmentCount > students) {

        alert(
            "Departments cannot be greater than students."
        );

        return;
    }


    /* Create empty departments */

    examData.students = students;

    examData.departments = [];

    examData.halls = [];

    examData.allocationGenerated = false;


    for (
        let i = 1;
        i <= departmentCount;
        i++
    ) {

        examData.departments.push({

            id: i,

            name:
                "Department " +
                String(i).padStart(2, "0")

        });

    }


    /* Create empty halls */

    for (
        let i = 1;
        i <= hallCount;
        i++
    ) {

        examData.halls.push({

            id: i,

            name:
                "Hall " +
                String(i).padStart(2, "0"),

            capacity: 40

        });

    }


    saveSetup();

    showConfiguration();

}


/* ---------------------------------------------------------
   SHOW CONFIGURATION
   --------------------------------------------------------- */

function showConfiguration() {

    const setupScreen =
        document.getElementById(
            "setupScreen"
        );

    const configurationScreen =
        document.getElementById(
            "configurationScreen"
        );

    const dashboardScreen =
        document.getElementById(
            "dashboardScreen"
        );


    setupScreen.classList.add(
        "hidden"
    );

    dashboardScreen.classList.add(
        "hidden"
    );

    configurationScreen.classList.remove(
        "hidden"
    );


    /* Summary */

    document.getElementById(
        "summaryStudents"
    ).textContent =
        examData.students;


    document.getElementById(
        "summaryDepartments"
    ).textContent =
        examData.departments.length;


    document.getElementById(
        "summaryHalls"
    ).textContent =
        examData.halls.length;


    createDepartmentInputs();

    createHallInputs();

}


/* ---------------------------------------------------------
   DEPARTMENT INPUTS
   --------------------------------------------------------- */

function createDepartmentInputs() {

    const container =
        document.getElementById(
            "departmentInputs"
        );


    container.innerHTML = "";


    examData.departments.forEach(
        function (department) {

            const wrapper =
                document.createElement(
                    "div"
                );

            wrapper.className =
                "dynamic-input";


            wrapper.innerHTML = `

                <span>
                    DEPT ${String(
                        department.id
                    ).padStart(2, "0")}
                </span>

                <input
                    type="text"
                    class="department-name"
                    data-id="${department.id}"
                    value="${department.name}"
                    placeholder="Enter department name"
                >

            `;


            container.appendChild(
                wrapper
            );

        }
    );

}


/* ---------------------------------------------------------
   HALL INPUTS
   --------------------------------------------------------- */

function createHallInputs() {

    const container =
        document.getElementById(
            "hallInputs"
        );


    container.innerHTML = "";


    examData.halls.forEach(
        function (hall) {

            const wrapper =
                document.createElement(
                    "div"
                );

            wrapper.className =
                "hall-row";


            wrapper.innerHTML = `

                <div class="hall-number">
                    HALL ${String(
                        hall.id
                    ).padStart(2, "0")}
                </div>

                <input
                    type="text"
                    class="hall-name-input"
                    data-id="${hall.id}"
                    value="${hall.name}"
                    placeholder="Hall name"
                >

                <input
                    type="number"
                    class="hall-capacity-input"
                    data-id="${hall.id}"
                    value="${hall.capacity}"
                    min="1"
                    placeholder="Capacity"
                >

            `;


            container.appendChild(
                wrapper
            );

        }
    );

}


/* ---------------------------------------------------------
   GENERATE ALLOCATION
   --------------------------------------------------------- */

function generateAllocation() {

    /* Read department names */

    const departmentInputs =
        document.querySelectorAll(
            ".department-name"
        );


    const hallNameInputs =
        document.querySelectorAll(
            ".hall-name-input"
        );


    const hallCapacityInputs =
        document.querySelectorAll(
            ".hall-capacity-input"
        );


    let departmentNames =
        [];


    departmentInputs.forEach(
        function (input) {

            const name =
                input.value.trim();


            if (!name) {

                alert(
                    "Please enter all department names."
                );

                return;

            }


            departmentNames.push(
                name
            );

        }
    );


    if (
        departmentNames.length !==
        examData.departments.length
    ) {

        return;

    }


    /* Update departments */

    examData.departments =
        examData.departments.map(
            function (
                department,
                index
            ) {

                return {

                    id: department.id,

                    name:
                        departmentNames[index]

                };

            }
        );


    /* Update halls */

    let hallError = false;


    examData.halls =
        examData.halls.map(
            function (
                hall,
                index
            ) {

                const name =
                    hallNameInputs[index]
                    .value
                    .trim();


                const capacity =
                    parseInt(
                        hallCapacityInputs[index]
                        .value
                    );


                if (
                    !name ||
                    !capacity ||
                    capacity < 1
                ) {

                    hallError = true;

                }


                return {

                    id: hall.id,

                    name: name,

                    capacity: capacity

                };

            }
        );


    if (hallError) {

        alert(
            "Please enter valid hall names and capacities."
        );

        return;

    }


    /* Capacity validation */

    const totalCapacity =
        examData.halls.reduce(
            function (
                total,
                hall
            ) {

                return (
                    total +
                    hall.capacity
                );

            },
            0
        );


    if (
        totalCapacity <
        examData.students
    ) {

        alert(
            "Total hall capacity (" +
            totalCapacity +
            ") is less than total students (" +
            examData.students +
            "). Please increase hall capacity."
        );

        return;

    }


    /* Allocation completed */

    examData.allocationGenerated =
        true;


    saveSetup();

    showDashboard();

}


/* ---------------------------------------------------------
   SHOW DASHBOARD
   --------------------------------------------------------- */

function showDashboard() {

    document
        .getElementById(
            "setupScreen"
        )
        .classList.add("hidden");


    document
        .getElementById(
            "configurationScreen"
        )
        .classList.add("hidden");


    document
        .getElementById(
            "dashboardScreen"
        )
        .classList.remove("hidden");


    /* Statistics */

    document.getElementById(
        "totalStudentsDisplay"
    ).textContent =
        examData.students;


    document.getElementById(
        "totalDepartmentsDisplay"
    ).textContent =
        examData.departments.length;


    document.getElementById(
        "totalHallsDisplay"
    ).textContent =
        examData.halls.length;


    document.getElementById(
        "allocationDisplay"
    ).textContent =
        "READY";


    createHallDashboard();

    createDepartmentDashboard();

}


/* ---------------------------------------------------------
   HALL DASHBOARD
   --------------------------------------------------------- */

function createHallDashboard() {

    const container =
        document.getElementById(
            "hallDashboard"
        );


    container.innerHTML = "";


    examData.halls.forEach(
        function (hall) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "hall";


            card.innerHTML = `

                <div class="hall-name">
                    ${escapeHTML(
                        hall.name
                    )}
                </div>

                <div class="hall-capacity">
                    Capacity: ${hall.capacity} seats
                </div>

                <div class="hall-status">
                    ● ALLOCATION READY
                </div>

            `;


            container.appendChild(
                card
            );

        }
    );

}


/* ---------------------------------------------------------
   DEPARTMENT DASHBOARD
   --------------------------------------------------------- */

function createDepartmentDashboard() {

    const container =
        document.getElementById(
            "departmentDashboard"
        );


    container.innerHTML = "";


    examData.departments.forEach(
        function (department) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "department-card";


            card.innerHTML = `

                <h4>
                    ${escapeHTML(
                        department.name
                    )}
                </h4>

                <p>
                    Department configured
                </p>

            `;


            container.appendChild(
                card
            );

        }
    );

}


/* ---------------------------------------------------------
   STUDENT LOCATOR
   --------------------------------------------------------- */

function searchStudent() {

    const input =
        document.getElementById(
            "registerNumber"
        );


    const result =
        document.getElementById(
            "studentDetails"
        );


    const registerNumber =
        input.value
        .trim()
        .toUpperCase();


    if (!registerNumber) {

        result.innerHTML = `

            <div class="not-found">
                Enter a register number.
            </div>

        `;

        return;

    }


    /*
       Demo student locator.

       Later this section will be connected
       to the complete student database.
    */

    const demoStudents = {

        "24AD001": {

            name: "Samuvel R",

            department:
                "Artificial Intelligence & Data Science",

            year: "II Year",

            exam: "Data Structures",

            date: "28-09-2026",

            hall: "Hall 01",

            seat: "A-12"

        },

        "24CS001": {

            name: "Arun Kumar",

            department:
                "Computer Science & Engineering",

            year: "II Year",

            exam: "Data Structures",

            date: "28-09-2026",

            hall: "Hall 02",

            seat: "B-08"

        },

        "24EC001": {

            name: "Kavin",

            department:
                "Electronics & Communication Engineering",

            year: "II Year",

            exam: "Digital Electronics",

            date: "29-09-2026",

            hall: "Hall 03",

            seat: "C-12"

        }

    };


    const student =
        demoStudents[
            registerNumber
        ];


    if (!student) {

        result.innerHTML = `

            <div class="not-found">

                ❌ Student not found.

                <br><br>

                Please check the register number.

            </div>

        `;

        return;

    }


    result.innerHTML = `

        <div class="student-card">

            <h3>
                STUDENT LOCATED ✓
            </h3>

            <div class="detail-row">
                <span>Name</span>
                <span>
                    ${escapeHTML(
                        student.name
                    )}
                </span>
            </div>

            <div class="detail-row">
                <span>Register Number</span>
                <span>
                    ${escapeHTML(
                        registerNumber
                    )}
                </span>
            </div>

            <div class="detail-row">
                <span>Department</span>
                <span>
                    ${escapeHTML(
                        student.department
                    )}
                </span>
            </div>

            <div class="detail-row">
                <span>Year</span>
                <span>
                    ${escapeHTML(
                        student.year
                    )}
                </span>
            </div>

            <div class="detail-row">
                <span>Exam</span>
                <span>
                    ${escapeHTML(
                        student.exam
                    )}
                </span>
            </div>

            <div class="detail-row">
                <span>Exam Date</span>
                <span>
                    ${escapeHTML(
                        student.date
                    )}
                </span>
            </div>

            <div class="detail-row">
                <span>Exam Hall</span>
                <span>
                    ${escapeHTML(
                        student.hall
                    )}
                </span>
            </div>

            <div class="detail-row">
                <span>Seat Number</span>
                <span>
                    ${escapeHTML(
                        student.seat
                    )}
                </span>
            </div>

        </div>

    `;

}


/* ---------------------------------------------------------
   BACK TO SETUP
   --------------------------------------------------------- */

function backToSetup() {

    document
        .getElementById(
            "configurationScreen"
        )
        .classList.add("hidden");


    document
        .getElementById(
            "dashboardScreen"
        )
        .classList.add("hidden");


    document
        .getElementById(
            "setupScreen"
        )
        .classList.remove("hidden");

}


/* ---------------------------------------------------------
   NEW EXAM SETUP
   --------------------------------------------------------- */

function newExamSetup() {

    if (
        !confirm(
            "Start a new examination setup?"
        )
    ) {

        return;

    }


    localStorage.removeItem(
        "smartExamSetup"
    );


    examData = {

        students: 0,

        departments: [],

        halls: [],

        allocationGenerated: false

    };


    document.getElementById(
        "studentCount"
    ).value = "";


    document.getElementById(
        "departmentCount"
    ).value = "";


    document.getElementById(
        "hallCount"
    ).value = "";


    backToSetup();

}


/* ---------------------------------------------------------
   SAVE DATA
   --------------------------------------------------------- */

function saveSetup() {

    localStorage.setItem(
        "smartExamSetup",
        JSON.stringify(
            examData
        )
    );

}


/* ---------------------------------------------------------
   LOAD SAVED DATA
   --------------------------------------------------------- */

function loadSavedSetup() {

    const saved =
        localStorage.getItem(
            "smartExamSetup"
        );


    if (!saved) {

        return;

    }


    try {

        examData =
            JSON.parse(saved);


        if (
            examData.allocationGenerated
        ) {

            showDashboard();

        } else if (
            examData.students > 0
        ) {

            showConfiguration();

        }

    } catch (error) {

        console.log(
            "Saved setup could not be loaded."
        );

    }

}


/* ---------------------------------------------------------
   SECURITY HELPER
   --------------------------------------------------------- */

function escapeHTML(value) {

    return String(value)
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
