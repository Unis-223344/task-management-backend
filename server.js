const express = require('express');
const app = express()
const {MongoClient} = require('mongodb');
const bodyParser = require("body-parser")
const cors = require("cors")
const jwt = require("jsonwebtoken")
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');

app.use(express.json());
app.use(bodyParser.json())
app.use(cors())

 
const uri ="mongodb+srv://gangadharalothula7702:UnisTask123@task.1ryzd.mongodb.net/"
const client = new MongoClient(uri);
 
const serverDb = async ()=>{
    try{
        await client.connect();
        app.listen(4000, ()=>{
            console.log("Server Runing at PORT:4001 and DB connected");
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
            response.status(400).json("Incorrect Credentials")
        }else{
            const payload = {employeEmail:gmail}
            const jwtToken = jwt.sign(payload,"TaskSecretToken")
            response.status(200)
            response.send({jwtToken,gmail})
        }
    } catch (e) {
        console.log(`Error at post superAdmins Login : ${e.message}`)
    }
})

const taskDataBase = dataBase.collection("Task Assign Database")
app.post("/taskAssignPost",  async (request,response)=>{
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
            taskNumber: uuidv4(),
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
        const getTask = await taskDataBase.find({employeeId:employeeId1}).toArray()
        response.status(201).json(getTask)
        
    } catch (e) {
        console.log(`Error at post tasks : ${e.message}`)
    }
} )


app.post('/tasksData', async (request, response) => {
    try {
        const allTasks = await taskDataBase.find({employeeId:request.body.empId}).toArray()
        response.status(201).json(allTasks)
    } catch (error) {
        response.status(500).send({ message: error.message })
    }
})


app.get('/getAllTasks', async (request, response) =>{
    try {
        const employeeTaskData = await taskDataBase.find().toArray()
        response.status(201).json(employeeTaskData)
    } catch (e) {
        console.log(`Error getting employee tasks ${e.message}`)
    }
})



app.put("/updateTaskAssigned", async (request, response) => {
    try {
        const {idNum,taskNum, taskAssignedTime3, assignedStatus3} = request.body 
        const updateTask = await taskDataBase.updateOne(
            {taskNumber: taskNum},
            {
                $set: {           
                    taskAssignedTime: taskAssignedTime3,
                    assignedStatus: assignedStatus3
                }
            })
        const getTask = await taskDataBase.find({employeeId:idNum}).toArray()
        response.status(201).json(getTask)
        
    } catch (error) {
        response.json({ message: "Error updating task" })
    }
})


app.put("/updateTaskAssigned2", async (request,response)=>{
    try {
        const {idNum,taskNum, taskDiscription1, pdfFile1, managerComment1} = request.body
        const updateOneTaskEmp = await taskDataBase.updateOne(
            {taskNumber: taskNum},
            {
                $set: {                
                    taskDiscription: taskDiscription1,             
                    pdfFile: pdfFile1,
                    managerComment:managerComment1,
                }
            })
        const getTask = await taskDataBase.find({employeeId:idNum}).toArray()
        response.status(201).json(getTask)
    } catch (e) {
        console.log(`Error updating task ${e.message}`)
    }
})


app.delete("/oneTaskDelete", async (request,response) =>{
    try {
        const {idNum, taskNum} = request.body
        const deleteResponse = await taskDataBase.deleteOne({taskNumber:taskNum})
        const getTask = await taskDataBase.find({employeeId:idNum}).toArray()
        response.status(201).json(getTask)
    } catch (e) {
        console.log(`Error at Deleting Task ${e.message}`)
    }
})


app.post("/EmployeeDetails", async (request,response) =>{
    try {
        const {email} =  request.body
        const employeeDetails = await additionalData.findOne({gmailId:email})
        response.status(201).json(employeeDetails)
    } catch (e) {
        console.log(`Error at getting employee details ${e.message}`)
    }
})

app.put("/EmployeeDetailsUpdate", async (request,response) =>{
    try {
        const {email, mobileNumber1, skillSet2} = request.body
        const updateEmployeeDetails = await additionalData.updateOne(
            {gmailId: email},
            {
                $set: {                      
                    mobileNumber:mobileNumber1,
                    skillSet:skillSet2
                }
            })
            response.status(201).json(updateEmployeeDetails)
    } catch (e) {
        console.log(`Error updating employee details ${e.message}`)
    }
})


app.post("/getEmployeeAllTasks", async (request,response) =>{
    try {
        const {emplId} = request.body
        const employeeAllTasks = await taskDataBase.find({employeeId:emplId}).toArray()
        response.status(201).json(employeeAllTasks)
    } catch (e) {
        console.log(`Error at getting employee all tasks ${e.message}`)
    }
})


app.put("/updateCreateStatus", async (request,response) =>{
    try {
        const {idNum,taskId2, completedTime2, status2, empComment2} = request.body
        const updateTaskCompleteStatus = await taskDataBase.updateOne(
            {taskNumber: taskId2}, 
            {$set: {completeDateTime: completedTime2, 
                completeStatus: status2, 
                employeeComment: empComment2}
            })
        const getTask = await taskDataBase.find({employeeId:idNum}).toArray()
        response.status(201).json(getTask)
    } catch (e) {
        console.log(`Error at updating employee workstatus : ${e.message}`)
    }
})

const adminDatabase = dataBase.collection("Admin Login Credentials")

app.post("/superAdminCredential", async (request,response) =>{
    try {
        const { name, passWord2 } = request.body;
        const adminData = {
            userName: name,
            adminPassWord:  passWord2,
        }
        const postAdminData = await adminDatabase.insertOne(adminData)
        response.status(201).json(postAdminData)
        
    } catch (e) {
        console.log(`Error at post superAdmins credentials : ${e.message}`)
    }
})





app.post("/superAdminLogin", async (request,response) =>{
    try {
        const {name, passWord2} = request.body
        const adminsLoginData = await adminDatabase.find().toArray();
        let adminCheck;
        for (let char of adminsLoginData){
            if (char.userName === name && char.adminPassWord === passWord2){
                adminCheck = "Admin Successfully loged"
            }
        }
        if (adminCheck === undefined){
            response.status(400).json("U R username and password is incorrect")
        }else{
            const payload = {userName:name}
            const jwtToken = jwt.sign(payload,"AdminSecretToken")
            response.status(200)
            response.send({jwtToken,name})
        }
    } catch (e) {
        console.log(`Error at super admin login : ${e.message}`)
    }
});