//start express.js
const express = require("express")
//session haandling, so new info is saved, when user is logged in
const session = require("express-session")
const app = express()
//for the path template const
const path = require("path")
//for render to work
const hbs = require("hbs")
//to use functions such fucntions as addMany
const { collection, Todo } = require("./mongodb")
//to be able to override n delete
const methodOverride = require('method-override')


//css
app.use(express.static(path.join(__dirname, '../public')));

//to tell the program where the files that are used are
const TPath = path.join(__dirname,'../templates')

//to connect everything
app.use(express.json())
//defining that we are using hbs
app.set("view engine", "hbs")
app.set("views", TPath)
app.use(express.urlencoded({extended:false}))

// So the app can start a session, after the user is logged in
app.use(session({
    secret: '123',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
}));

// request n response, getting the login and signup pages
app.get("/",(req,res)=>{
    res.render("intro")
})
app.get("/login",(req,res)=>{
    res.render("login")
})
app.get("/signup",(req,res)=>{
    res.render("signup")
})
app.get("/aboutus",(req,res)=>{
    res.render("aboutus")
})

//characterizes the action in sing up form
// async is used to get the data 
app.post("/signup",async (req,res)=>{
     const data = {
        name : req.body.name,
        password : req.body.password
     }
     // await is used to make the user wait until the js inserts all the data into the collection
     await collection.insertMany([data])

    //a response of sending the user to the login page happens after the request has been completed
     res.render("login")
})

//characterizes actions in the login form
app.post("/login",async (req,res)=>{
try {
    //checks if there is a username in the database that is equal to the one the user has entered 
    const check = await collection.findOne({name:req.body.name})
    //if username checks out, password is checked
    if(check && check.password === req.body.password){
        //we get user id (used for a session), user gets sent to the list page 
        req.session.userId = check._id; 
         // Fetch the todos after login
      const userId = req.session.userId;
      const todos = await Todo.find({ userId });
      // Render the todos immediately after login
      res.render("todos", { todos });
       }
       //if the password doesn't match, the user is sent this message
       else{
        res.send("You have entered the wrong details!")
       }
} 
//if nothing matches the info. in the collection, this message is displayed
catch{
    res.send("An error has occured")
}
})


//to create new list itmes we need the entered title, description and id
app.post("/todo", async (req, res) => {
    const userId = req.session.userId; 
    const task = req.body.task;
    const description = req.body.description;

    //if user is not logged in
    if (!userId) {
        return res.status(401).send('Unauthorized'); 
    }
//new element is created n saved into database
    const todo = new Todo({ userId, task, description });
    await todo.save();

    res.redirect('/todos'); 
});

//checks if user is logged in, if not, user is sent to login
function isLoggedIn(req, res, next) {
    if (req.session.userId) {
        next();
    } else {
        res.redirect('/login'); 
    }
}

// Display list items, find items using user id
app.get("/todos", isLoggedIn, async (req, res) => {
    const userId = req.session.userId; 

    const todos = await Todo.find({ userId });

    //display the found elements
    res.render("todos", { todos }); 
});

// To end the session user needs to log out
app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
        }
        //after logginf out the user is redirected to the main page
        res.redirect('intro'); 
    });
});

// Getting main page
app.get("/intro",(req,res)=>{
    res.render("intro")
})

// override is used to be able to delete items
app.use(methodOverride('_method'));

// delete list elements using item and user ids
app.delete("/todo/:id", isLoggedIn, async (req, res) => {
    const userId = req.session.userId; 
    const todoId = req.params.id;

    try {
        // find the item and delete it
        await Todo.findOneAndDelete({ _id: todoId, userId: userId });
        res.redirect('/todos'); 
    } catch (error) {
        console.error(error);
        res.status(500).send('Error occured');
    }
});

//to check using nodemon that the port is connected
app.listen(3000,()=>{
    console.log("PORT connected");
}) 
