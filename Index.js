const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const storage = require('node-persist');

// parse JSON request body
app.use(bodyParser.json());

// storage
(async () => {
  await storage.init();
})();

// POST endpoint to add a new student
app.post('/students', async (req, res) => {
  const { studentID, studentName, GPA } = req.body;

  // new student object
  const newStudent = { studentID, studentName, GPA };

  // node-persist
  await storage.setItem(studentID, newStudent);

  res.status(201).json(newStudent);
});

// endpoint to retrieve all students
app.get('/students', async (req, res) => {
  // all student data from node-persist
  const studentIDs = await storage.keys();
  const students = await Promise.all(studentIDs.map((studentID) => storage.getItem(studentID)));

  res.json(students);
});

// endpoint to retrieve the topper among the class
app.get('/topper', async (req, res) => {
  // all student data from node-persist
  const studentIDs = await storage.keys();
  const students = await Promise.all(studentIDs.map((studentID) => storage.getItem(studentID)));

  if (students.length === 0) {
    
    res.json({});
  } else {
    //  the student with the highest GPA
    let topper = students[0];
    for (const student of students) {
      if (student.GPA > topper.GPA) {
        topper = student;
      }
    }

    // Return the ID and name of the topper
    const { studentID, studentName } = topper;
    res.json({ studentID, studentName });
  }
});

// GET endpoint to retrieve data of a particular student by ID
app.get('/students/:studentID', async (req, res) => {
  const studentID = req.params.studentID;

  // Retrieve the student data by ID from node-persist
  const student = await storage.getItem(studentID);

  if (!student) {
    // If the student with the given ID doesn't exist, return a 404 response
    res.status(404).json({ error: 'Student not found' });
  } else {
    // If the student exists, return the student's data
    res.json(student);
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
