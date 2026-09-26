/* =========================================================
   🔥 FUTURISTIC STUDENT LOCATOR
   ========================================================= */

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


    /* EMPTY SEARCH */

    if (!registerNumber) {

        result.innerHTML = `
            <div class="not-found">
                ⚠️ ENTER REGISTER NUMBER
            </div>
        `;

        input.focus();

        return;
    }


    /* SCANNING EFFECT */

    result.innerHTML = `
        <div class="search-scanning">
            <div style="font-size:22px;margin-bottom:8px;">
                ◉
            </div>

            SCANNING STUDENT DATABASE...

            <div style="
                margin-top:8px;
                font-size:10px;
                color:#6f8aa5;
            ">
                SEARCH ID : ${escapeHTML(registerNumber)}
            </div>
        </div>
    `;


    /* Small delay for futuristic scan effect */

    setTimeout(function () {

        const demoStudents = {

            "24AD001": {

                name:
                    "Samuvel R",

                department:
                    "Artificial Intelligence & Data Science",

                year:
                    "II Year",

                exam:
                    "Data Structures",

                date:
                    "28-09-2026",

                hall:
                    "Hall 01",

                seat:
                    "A-12"
            },


            "24CS001": {

                name:
                    "Arun Kumar",

                department:
                    "Computer Science & Engineering",

                year:
                    "II Year",

                exam:
                    "Data Structures",

                date:
                    "28-09-2026",

                hall:
                    "Hall 02",

                seat:
                    "B-08"
            },


            "24EC001": {

                name:
                    "Kavin",

                department:
                    "Electronics & Communication Engineering",

                year:
                    "II Year",

                exam:
                    "Digital Electronics",

                date:
                    "29-09-2026",

                hall:
                    "Hall 03",

                seat:
                    "C-12"
            }

        };


        const student =
            demoStudents[
                registerNumber
            ];


        /* NOT FOUND */

        if (!student) {

            result.innerHTML = `
                <div class="not-found">

                    ❌ STUDENT NOT FOUND

                    <br><br>

                    <span style="
                        font-size:11px;
                        color:#71869e;
                    ">
                        Register Number:
                        ${escapeHTML(registerNumber)}
                    </span>

                </div>
            `;

            return;
        }


        /* SUCCESS */

        result.innerHTML = `

            <div class="student-card search-success">

                <h3>
                    ● STUDENT LOCATED ✓
                </h3>


                <div class="detail-row">

                    <span>
                        Name
                    </span>

                    <span>
                        ${escapeHTML(
                            student.name
                        )}
                    </span>

                </div>


                <div class="detail-row">

                    <span>
                        Register Number
                    </span>

                    <span>
                        ${escapeHTML(
                            registerNumber
                        )}
                    </span>

                </div>


                <div class="detail-row">

                    <span>
                        Department
                    </span>

                    <span>
                        ${escapeHTML(
                            student.department
                        )}
                    </span>

                </div>


                <div class="detail-row">

                    <span>
                        Year
                    </span>

                    <span>
                        ${escapeHTML(
                            student.year
                        )}
                    </span>

                </div>


                <div class="detail-row">

                    <span>
                        Exam
                    </span>

                    <span>
                        ${escapeHTML(
                            student.exam
                        )}
                    </span>

                </div>


                <div class="detail-row">

                    <span>
                        Exam Date
                    </span>

                    <span>
                        ${escapeHTML(
                            student.date
                        )}
                    </span>

                </div>


                <div class="detail-row">

                    <span>
                        Exam Hall
                    </span>

                    <span>
                        ${escapeHTML(
                            student.hall
                        )}
                    </span>

                </div>


                <div class="detail-row">

                    <span>
                        Seat Number
                    </span>

                    <span>
                        ${escapeHTML(
                            student.seat
                        )}
                    </span>

                </div>


                <div style="
                    margin-top:15px;
                    padding:10px;
                    text-align:center;
                    color:#00ffb0;
                    font-size:10px;
                    letter-spacing:1.5px;
                    border:1px solid rgba(0,255,157,0.15);
                    border-radius:8px;
                    background:rgba(0,255,157,0.035);
                ">
                    ✓ LOCATION VERIFIED
                </div>

            </div>

        `;


        /* AUTO SCROLL TO RESULT */

        setTimeout(function () {

            result.scrollIntoView({
                behavior: "smooth",
                block: "nearest"
            });

        }, 100);


    }, 650);

}
