//to connect to mongoDB
const mongoose = require("mongoose")

//to connect to mongoDB and also check using nodemon if it has connected
//Database name: ChaiUser
mongoose.connect("mongodb://localhost:27017/ChaiUser")
.then(()=>{
    console.log("mongodb connected");
})
//catch an error if i doesn't connect
.catch(()=>{
    console.log("failed to connect");
})

//the format in which the login information will be saved in database
const LogInSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    }
})

//create a new collection and add the format to the collection itself
const collection = new mongoose.model("LogInCollection", LogInSchema)

//so that index.js also has access
module.exports = collection

// Define the to-do list item schema
const TodoSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LogInCollection', // Reference to the user who created the to-do item
        required: true
    },
    task: {
        type: String,
        required: true
    },
   description:{
        type: String
   }
})
// Create the to-do list item model
const Todo = mongoose.model('Todo', TodoSchema);

module.exports = { collection, Todo};