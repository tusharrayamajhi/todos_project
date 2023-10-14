const express = require("express");
const app = express();
const bcrypt = require('bcrypt');
const path = require("path");
const {v4 :uuidv4} = require('uuid');
const date = require('date-and-time');
app.set("view engine","ejs");
app.use(express.static(path.join(__dirname,"public/css")));
app.use(express.static(path.join(__dirname,"public/js")));
app.use(express.static(path.join(__dirname,"public/include")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get("/",(req,res)=>{
    res.render("index");
});


let users = [
    // {
    //     username:"tushar",
    //     password:123,
    //     id:uuidv4(),
    //     todos:[
    //         {
    //             id: uuidv4(),
    //             title:"Eat",
    //             des:"eat dal bhat",
    //             date:date.format(new Date(), 'YYYY/MM/DD HH:mm:ss'),
        
    //         },
    //         {
    //             id:uuidv4(),
    //             title:"read",
    //             des:"reading a books",
    //             date:date.format(new Date(), 'YYYY/MM/DD HH:mm:ss'),
    //         }
    //     ]
    // },
    // {
    //     username:"delta",
    //     password:234,
    //     id:uuidv4(),
    //     todos:[
    //         {
    //             id: uuidv4(),
    //             title:"Eat",
    //             des:"eat dal bhat",
    //             date:date.format(new Date(), 'YYYY/MM/DD HH:mm:ss'),
        
    //         },
    //         {
    //             id:uuidv4(),
    //             title:"cook",
    //             des:"cooking foods",
    //             date:date.format(new Date(), 'YYYY/MM/DD HH:mm:ss'),
    //         }
    //     ]
    // },
    // {
    //     username:"saugat",
    //     password:345,
    //     id:uuidv4(),
    //     todos:[
    //         {
    //             id: uuidv4(),
    //             title:"Eat",
    //             des:"eat dal bhat",
    //             date:date.format(new Date(), 'YYYY/MM/DD HH:mm:ss'),
        
    //         },
    //         {
    //             id:uuidv4(),
    //             title:"read",
    //             des:"reading a newpaper",
    //             date:date.format(new Date(), 'YYYY/MM/DD HH:mm:ss'),
    //         }
    //     ]
    // },
    // {
    //     username:"manish",
    //     password:556,
    //     id:uuidv4(),
    //     todos:[
    //         {
    //             id: uuidv4(),
    //             title:"Eat",
    //             des:"eat pizza",
    //             date:date.format(new Date(), 'YYYY/MM/DD HH:mm:ss'),
        
    //         },
    //         {
    //             id:uuidv4(),
    //             title:"movies",
    //             des:"watching movies",
    //             date:date.format(new Date(), 'YYYY/MM/DD HH:mm:ss'),
    //         }
    //     ]
    // }
]




app.get("/login",(req,res)=>{
    res.render("login",{invalid:""});
});
app.post("/login",async  (req,res)=>{
    // let {username,password} = req.body;
    // let userfound = false;
    // let id;
    // let oldpassword;
    let user = users.find((p)=>p.username == req.body.username);
    // for(let user of users){
    //     if(user.username == username){
    //         userfound = true;
    //         id = user.id;
    //         oldpassword = user.password;
    //         break;
    //     }
    // }
    if(user == null){
        let invalid = "username or password is wrong";
        res.render("login",{invalid});
        return;
    }
    // try {
        if(await bcrypt.compare(req.body.password, user.password)){
            res.redirect(`${user.username}/${user.id}`);
        } else{
            res.render("login",{invalid:"username or passoword is wrong"});
        }
    // } catch (error) {
    //     console.log(error);
    // }

    
});
app.get("/:username/:id",(req,res)=>{
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
app.post("/update/:username/:todoid/:userid",(req,res)=>{
    let {username,todoid,userid } = req.params;
    let user = users.find((p)=>userid === p.id);
    let todo = user.todos;
    let work = todo.find((p)=>todoid === p.id);
    work.title = req.body.title;
    work.des = req.body.des;
    res.redirect(`/${username}/${userid}`);
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
    res.redirect(`/${username}/${userid}`);
});


app.get("/delete/:username/:userid/:todoid",(req,res)=>{
    let {username,userid,todoid} = req.params;
    let user = users.find((p)=>userid == p.id);
    user.todos = user.todos.filter((p)=>todoid != p.id);
    res.redirect(`/${username}/${userid}`);
})
app.listen("3000",()=>{
    console.log("server is running");
});
