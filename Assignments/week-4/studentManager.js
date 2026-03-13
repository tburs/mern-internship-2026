let students = [];

function addStudent(){
    let name = document.getElementById("name").value;
    let m1 = Number(document.getElementById("mark1").value);
    let m2 = Number(document.getElementById("mark2").value);
    let m3 = Number(document.getElementById("mark3").value);

    let student = { name: name, marks: [m1, m2, m3]  };
    students.push(student);
    displayStudents();

     document.getElementById("name").value = "";
    document.getElementById("mark1").value = "";
    document.getElementById("mark2").value = "";
    document.getElementById("mark3").value = "";
}


function calculateAverageMarks() {
    let list = document.getElementById("studentList");
    list.innerHTML = "";

    for (let student of students){
        let total = 0;
        for (let mark of student.marks) { total += mark;  }

        let average = total / student.marks.length;
        let li = document.createElement("li");

        li.innerHTML = `${student.name}<br> Marks: ${student.marks.join(", ")}<br> Average: ${average.toFixed(1)} `;
        list.appendChild(li);
    }
}


function displayStudents(){
    let list = document.getElementById("studentList");
    list.innerHTML = "";

    for (let student of students) {

        let li = document.createElement("li");
        li.innerHTML = `${student.name}<br>Marks: ${student.marks.join(", ")} `;
        list.appendChild(li);
    }
}