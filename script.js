let audioContext;
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

/* Cursor Sonic Effect */

document.addEventListener("mousemove", function (event) {

    const ripple = document.createElement("div");

    ripple.className = "sonic-ripple";

    ripple.style.left = event.clientX + "px";
    ripple.style.top = event.clientY + "px";

    document.body.appendChild(ripple);

    setTimeout(() => {
        ripple.remove();
    }, 650);

    /* Sonic sound */

    const now = Date.now();

    if (
        soundEnabled &&
        now - lastSoundTime > 120
    ) {

        lastSoundTime = now;

        const oscillator =
            audioContext.createOscillator();

        const gain =
            audioContext.createGain();

        oscillator.type = "sine";

        oscillator.frequency.value = 700;

        gain.gain.setValueAtTime(
            0.025,
            audioContext.currentTime
        );

        gain.gain.exponentialRampToValueAtTime(
            0.001,
            audioContext.currentTime + 0.04
        );

        oscillator.connect(gain);

        gain.connect(audioContext.destination);

        oscillator.start();

        oscillator.stop(
            audioContext.currentTime + 0.04
        );
    }
});

/* Student Database */

const students = {

    "24AD001": {
        name: "Samuvel R",
        department: "Artificial Intelligence & Data Science",
        year: "II Year",
        exam: "Data Structures",
        date: "28-09-2026",
        hall: "Hall 07",
        seat: "B-14"
    },

    "24CS001": {
        name: "Arun Kumar",
        department: "Computer Science & Engineering",
        year: "II Year",
        exam: "Data Structures",
        date: "28-09-2026",
        hall: "Hall 03",
        seat: "A-08"
    },

    "24EC001": {
        name: "Kavin",
        department: "Electronics & Communication Engineering",
        year: "II Year",
        exam: "Digital Electronics",
        date: "29-09-2026",
        hall: "Hall 05",
        seat: "C-12"
    }
};

function searchStudent() {

    const registerNumber =
        document
        .getElementById("registerNumber")
        .value
        .trim()
        .toUpperCase();

    const result =
        document.getElementById("studentDetails");

    if (!registerNumber) {

        result.innerHTML = `
            <div class="not-found">
                Enter a register number.
            </div>
        `;

        return;
    }

    const student =
        students[registerNumber];

    if (!student) {

        result.innerHTML = `
            <div class="not-found">
                ❌ Student not found.
                Please check the register number.
            </div>
        `;

        return;
    }

    result.innerHTML = `

        <div class="student-card">

            <h3>STUDENT LOCATED ✓</h3>

            <div class="detail-row">
                <span>Name</span>
                <span>${student.name}</span>
            </div>

            <div class="detail-row">
                <span>Register Number</span>
                <span>${registerNumber}</span>
            </div>

            <div class="detail-row">
                <span>Department</span>
                <span>${student.department}</span>
            </div>

            <div class="detail-row">
                <span>Year</span>
                <span>${student.year}</span>
            </div>

            <div class="detail-row">
                <span>Exam</span>
                <span>${student.exam}</span>
            </div>

            <div class="detail-row">
                <span>Exam Date</span>
                <span>${student.date}</span>
            </div>

            <div class="detail-row">
                <span>Exam Hall</span>
                <span>${student.hall}</span>
            </div>

            <div class="detail-row">
                <span>Seat Number</span>
                <span>${student.seat}</span>
            </div>

        </div>
    `;
}
