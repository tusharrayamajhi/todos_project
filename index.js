const express = require("express");
const app = express();
const bcrypt = require('bcrypt');
const methooverride = require("method-override");
const path = require("path");
const {v4 :uuidv4} = require('uuid');
const date = require('date-and-time');
app.set("view engine","ejs");
app.use(express.static(path.join(__dirname,"/public/css")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methooverride("_method"));


app.get("/",(req,res)=>{
    res.render("index");
});
let users = [
    
]

app.get("/login",(req,res)=>{
    res.render("login",{invalid:""});
});
app.post("/login",async  (req,res)=>{
    let user = users.find((p)=>p.username == req.body.username);
    if(user == null){
        let invalid = "username or password is wrong";
        res.render("login",{invalid});
        return;
    }
        if(await bcrypt.compare(req.body.password, user.password)){
            res.redirect(`/profile/${user.username}/${user.id}`);
        } else{
            res.render("login",{invalid:"username or passoword is wrong"});
        }
});
app.get("/profile/:username/:id",(req,res)=>{
    let user = users.find((p)=> req.params.id === p.id);
    let {username,id} =req.params;
    let todo = user.todos;
    res.render("profile",{username,id,todo});
})
app.get("/register",(req,res)=>{
    res.render("newuser",{invalid:""});
})

app.post("/new",async (req,res)=>{
    let {username,password} = req.body;
    if(users.some(user =>username === user.username)){
        res.render("newuser",{invalid:"user already exit"});
    }else{
        let id = uuidv4();
        let todos =[];
        const salt = await bcrypt.genSalt();
        const hashpassword = await bcrypt.hash(password,salt);
        users.push({username:username,password:hashpassword,id:id,todos:todos});
        res.render("login",{invalid:""});
    }
})
app.get("/edit/:username/:userid/:todoid",(req,res)=>{
    let {username,userid,todoid} = req.params;
    let user = users.find((p)=>userid === p.id);
    let todos =user.todos;
    for(let work of todos){
        if(work.id == todoid){
            res.render("edit",{username,work,userid});
        }
    }
});
app.patch("/update/:username/:todoid/:userid",(req,res)=>{
    let {username,todoid,userid } = req.params;
    let user = users.find((p)=>userid === p.id);
    let todo = user.todos;
    let work = todo.find((p)=>todoid === p.id);
    work.title = req.body.title;
    work.des = req.body.des;
    res.redirect(`/profile/${username}/${userid}`);
})
app.get("/:username/add/:userid",(req,res)=>{
    let {username,userid} = req.params;
    res.render("add",{username,userid});
});
app.post("/add/addtask/:username/:userid",(req,res)=>{
    let {username,userid} =req.params
    let user = users.find((p)=>userid == p.id);
    let task = {
        id:uuidv4(),
        title:req.body.title,
        des:req.body.des,
        date:date.format(new Date(), 'YYYY/MM/DD HH:mm:ss'),
    }
    user.todos.push(task);
    res.redirect(`/profile/${username}/${userid}`);
});
app.delete("/delete/:username/:userid/:todoid",(req,res)=>{
    let {username,userid,todoid} = req.params;
    let user = users.find((p)=>userid == p.id);
    user.todos = user.todos.filter((p)=>todoid != p.id);
    res.redirect(`/profile/${username}/${userid}`);
})
app.listen("3000",()=>{
    console.log("server is running");
});

