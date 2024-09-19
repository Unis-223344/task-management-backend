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
            employeePassWord:  passWord,
        }
        const postData = await employeeDatabase.insertOne(employeeData)
        response.status(201).json(postData)
        
    } catch (e) {
        console.log(`Error at post superAdmins : ${e.message}`)
    }
})

app.post("/employee-emails-data", async (request,response) =>{
    try {
        const insertManyData = await employeeDatabase.insertMany(employeesLoginCred)
        response.status(201).json(insertManyData)
    } catch (e) {
        console.log(`Error at post superAdmins : ${e.message}`)
    }
})

const additionalData = dataBase.collection("Employees Additional Data")
app.post("/employeeDataAdd", async (request,response) =>{
    try {
        const insertManyData = await additionalData.insertMany(data)
        response.status(201).json(insertManyData)
    } catch (e) {
        console.log(`Error at post employeeDataAdd : ${e.message}`)
    }
})

app.get("/employeeDataAdd", async (request,response) =>{
    try {
        const findData = await additionalData.find().toArray()
        response.status(200).json(findData)
    } catch (e) {
        console.log(`Error at get employeeDataAdd : ${e.message}`)
    }
})

app.post("/employeesLoginPost", async (request,response) =>{
    try {
        const {gmail, employeePassWord} = request.body
        const employeesData = await employeeDatabase.find().toArray();
        let userCheck;
        for (let char of employeesData){
            if (char.email === gmail && char.passWord === employeePassWord){
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

const taskDataBase = dataBase.collection("Task Assign Database")
app.post("/taskAssignPost", async (request,response)=>{
    try {
        const { taskNumber1,
            employeeId1,
            taskDiscription1,
            pdfFile1,
            taskCreateTime1,
            taskAssignedTime1,
            assignedStatus1,
            completeDateTime1,
            completeStatus1,
            employeeComment1,
            managerComment1} = request.body
        const postTask = {
            taskNumber:taskNumber1,
            employeeId:employeeId1,
            taskDiscription:taskDiscription1,
            pdfFile:pdfFile1,
            taskCreateTime:taskCreateTime1,
            taskAssignedTime:taskAssignedTime1,
            assignedStatus:assignedStatus1,
            completeDateTime:completeDateTime1,
            completeStatus:completeStatus1,
            employeeComment:employeeComment1,
            managerComment:managerComment1
        }

        const postData = await taskDataBase.insertOne(postTask)
        response.status(201).json(postData)
        
    } catch (e) {
        console.log(`Error at post tasks : ${e.message}`)
    }
} )


app.get('/tasksData', async (request, response) => {
    try {
        const allTasks = await taskDataBase.find().toArray()
        response.send(allTasks)
    } catch (error) {
        response.status(500).send({ message: error.message })
    }
})


