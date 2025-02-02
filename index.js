const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = 80;
const HOST = '0.0.0.0'; 

// Middleware
app.use(cors());
app.use(bodyParser.json());

app.use(express.static("public"));

// إعداد اتصال قاعدة البيانات
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "mydb",
});

// الاتصال بقاعدة البيانات
db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("Connected to MySQL database");
  }
});

// API لإضافة مشروع جديد
app.post("/projects", (req, res) => {
  const { projectCode, projectName, projectDescription } = req.body;
  const sql = "INSERT INTO projects (code, name, description) VALUES (?, ?, ?)";
  db.query(
    sql,
    [projectCode, projectName, projectDescription],
    (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error inserting project");
      } else {
        res.send("Project added successfully");
      }
    }
  );
});

// API لإضافة المخاطر
app.post("/risks", (req, res) => {
  const { riskName, focusOfImpact, suddenness, frequency, effectiveness } =
    req.body;
  const sql =
    "INSERT INTO risks (name, focus_of_impact, suddenness, frequency, effectiveness) VALUES (?, ?, ?, ?, ?)";
  db.query(
    sql,
    [riskName, focusOfImpact, suddenness, frequency, effectiveness],
    (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error inserting risk");
      } else {
        res.send("Risk added successfully");
      }
    }
  );
});

// بدء تشغيل الخادم
app.listen(PORT, HOST, () => {
    console.log(`Server running at http://${HOST}:${PORT}`);
});
app.get("/analyze-risks", (req, res) => {
  const sql = "SELECT * FROM risks";
  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error fetching risks");
    } else {
      // حساب RFH وRFV
      const analysis = results.map((risk) => {
        const RFH =
          risk.focus_of_impact *
          risk.suddenness *
          risk.frequency *
          (1 - risk.effectiveness);
        return { ...risk, RFH };
      });
      res.json(analysis);
    }
  });
});
