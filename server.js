const express = require('express');
const app = express()
const {MongoClient} = require('mongodb');
const bodyParser = require("body-parser")
const cors = require("cors")
const jwt = require("jsonwebtoken")

app.use(express.json());
app.use(bodyParser.json())
app.use(cors())
 
const uri ="mongodb+srv://gangadharalothula7702:UnisTask123@task.1ryzd.mongodb.net/"
const client = new MongoClient(uri);
 
const serverDb = async ()=>{
    try{
        await client.connect();
        app.listen(4000, ()=>{
            console.log("Server Runing at PORT:4000 and DB connected");
        })
    }catch(e){
        console.log(`error in intialization of server and mongodb ${e.message}`)
    }
}

serverDb()

const authenticateToken = (request, response, next) => {
    let jwtToken;
    const authHeader = request.headers["authorization"];
    if (authHeader !== undefined) {
      jwtToken = authHeader.split(" ")[1];
    }
    if (jwtToken === undefined) {
      response.status(401);
      response.send("Invalid JWT Token");
    } else {
      jwt.verify(jwtToken, "TaskSecretToken", async (error, payload) => {
        if (error) {
          response.status(401);
          response.send("Invalid JWT Token");
        } else {
          next();
        }
      });
    }
  };

const dataBase = client.db("Task")
const employeeDatabase = dataBase.collection("Employees Data")

app.post("/employee-emails", async (request,response) =>{
    try {
        const { email, passWord } = request.body;
        const employeeData = {
            employeEmail: email,
            employeePassWord:  passWord
        }
        const postData = await employeeDatabase.insertOne(employeeData)
        response.status(201).json(postData)
        
    } catch (e) {
        console.log(`Error at post superAdmins : ${e.message}`)
    }
})

app.post("/employeesLoginPost", async (request,response) =>{
    try {
        const {gmail, employeePassWord} = request.body
        const employeesData = await employeeDatabase.find().toArray();
        let userCheck;
        for (let char of employeesData){
            if (char.employeEmail === gmail && char.employeePassWord === employeePassWord){
                userCheck = "User Successfully loged"
            }
        }
        if (userCheck === undefined){
            response.status(400)
            response.send("U R username and password is incorrect")
        }else{
            const payload = {employeEmail:gmail}
            const jwtToken = jwt.sign(payload,"TaskSecretToken")
            response.status(200)
            response.send({jwtToken})
        }
    } catch (e) {
        console.log(`Error at post superAdmins Login : ${e.message}`)
    }
})

const taskDataBase = dataBase.collection("Task Database")
app.post("/taskPost", authenticateToken, async (request,response)=>{
    try {
        const { selectedDomain1,
            taskNumber1,
            taskPara1,
            pdfFile1,
            assignedTime1,
            workCompleteDt1,
            employeeComment1,
            managerComment1 } = request.body
        const postTask = {
            selectedDomain: selectedDomain1,
            taskNumber: taskNumber1,
            taskPara: taskPara1,
            pdfFile: pdfFile1,
            createTime: new Date().toLocaleString(),
            assignedTime: assignedTime1,
            workCompleteDt: workCompleteDt1,
            employeeComment: employeeComment1,
            managerComment: managerComment1,
        }

        const postData = await taskDataBase.insertOne(postTask)
        response.status(201).json(postData)
        
    } catch (e) {
        console.log(`Error at post tasks : ${e.message}`)
    }
} )

app.get('/tasksData', authenticateToken, async (request, response) => {
    try {
        const allTasks = await taskDataBase.find().toArray()
        response.send(allTasks)
    } catch (error) {
        response.status(500).send({ message: error.message })
    }
})


