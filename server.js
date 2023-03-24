const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const logger = require('./logger')
var path = require('path');
const ejs = require('ejs')

// const pgp = require('pg-promise')();
// var config = {
//     user:"postgres",
//     database:"postgres",
//     password:"Zj123789",
//     port:5432};
// const db = pgp(config);

const {Sequelize} = require('sequelize');
const {Todolist}=require("./models/");//!!!重要


const GoogleStrategy = require('passport-google-oauth20').Strategy;

// Allows us to read the body of a request
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));


// Adds our templating engine
app.set('views', path.join(__dirname,'views'));
app.set('view engine', 'ejs')


// Create Todo App

let id = 1
let time = new Date()

function output(req, level, message) {
  logger.log({
    method: req.method,
    path: req.path,
    level: level,
    parameters: req.params,
    body: req.body,
    message: message,
    timestamp: time.toLocaleString()
  })
  
}

// passport.use(new GoogleStrategy({
//     clientID: '232286209035-27s1gnpo5oksnk6vh265gp8sagbk6um3.apps.googleusercontent.com',
//     clientSecret: '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',
//     callbackURL: "http://localhost:5050/auth/google/callback"
//   },
//   function(accessToken, refreshToken, profile, cb) {
//     User.findOrCreate({ googleId: profile.id }, function (err, user) {
//       return cb(err, user);
//     });
//   }
// ));

// This endpoint will run everytime any endpoint on the server is called
app.all('*', (req, res, next) => {
  logger.info({
    method: req.method,
    path: req.path,
    parameters: req.params,
    body: req.body,
    timestamp: time.toLocaleString()
  })
  next()
})

app.get('/', async(req, res) => {
  
  // let todolist = await db.query('SELECT * FROM todolist');
  
  res.send("Welcome to homepage")

  // res.render("webpage",{todolist:todolist});
  // res.send(todolist);
})
// GET: gets all todos
// NOTE: endpoints should always be the resource being retrieved or modified
app.get('/todos', async(req, res) => {
  
    // let todolist = await db.query('SELECT * FROM todolist');

    const todolist = await Todolist.findAll();
    res.render("webpage",{todolist:todolist});

    // res.render("webpage",{todolist:todolist});
    // res.send(todolist);
})

app.post('/todos', async (req, res) => {
    // Add todo to the array
    // Gets the type of whatever argument is passed in

    console.log(typeof(req.body.todo),'\n',req.body.todo)
    if(typeof(req.body.todo) != 'string') {
        output(req, 'error', 'Todo needs to be a string')
        res.status(400).send('Todo must be a string value.')
    } else if(Object.keys(req.body).length > 1){
        output(req, 'error', 'Parameter must have length greater than 1')
        res.status(400).send('Malformed request sent')
    }
    else {
        console.log(req.body)
        // await db.query(`insert into todolist(todo) values($1)`,[req.body.todo]);
        await Todolist.create({
          todo:req.body.todo
        })
        // todoList.push({
        //     id: id++,
        //     todo: req.body.todo,w'q
        //     completed: false
        // })
        // Only one response can be sent back to the client
        res.redirect('/todos');
    }
})

// NOTE: Path parameters are denoted by a /: in front. You do not actually type
// "id", you simply type in the appropriate id number

app.delete('/todos/:id',async (req, res)=> {
    let match = false
    // Failure Case: Client does not provide an ID
    if(req.params.id == "") {
        output(req, 'error', 'Client does not provide an id')
        res.status(400).send('Must provide an id')
    // Failure Case: Client passes in a negative id
    } else if(Number(req.params.id) < 1) {
        output(req, 'error', 'Client passed in a negative id')
        res.status(400).send('Id must be greater than 0')
    } else {
            // Check if the id provided is in the todoList
            // let todoList = await db.query('select * from todolist');
            let todoList = await Todolist.findAll();
        for(let i = 0; i < todoList.length; i++) {
            // Success Case: Loop through array, once we find the id, delete the todo
            if(req.params.id == todoList[i].id) {
              //  await db.query(`delete from todolist where id=${req.params.id}`)
               await Todolist.destroy({
                where:{id:req.params.id}
               })
               match = true
               res.send("Delete successfully!");
                // let deletedItems = todoList.splice(i, 1)

            } 
        }
        if(match != true) {
          // Error: Could not find an ID that matches the id provided
          output(req, 'error', 'No todo found with that id')
          res.status(400).send('No todo found with that id')
        }
        
    }
})

app.put("/todos",async (req, res) => {
    const data = req.body;
    // let todoList = await db.many('select * from todolist');//含有多个对象的数组
    let todoList = await Todolist.findAll();
    const todoChange = todoList.find((f) => f.todo == data.todo); //含对应字符串的对象
   
    if (data.todo == data.update) {
       output(req, 'error', 'No change detected in the todo')
      res.status(400).send("Your requested update cannot be the same as the current todo");
    } else {
      if (todoChange != undefined) {
        let changeIndex = todoList.indexOf(todoChange); //
        // console.log(todoChange,changeIndex,todoList)
        if (data.update != "") {
          // todoList[changeIndex].todo = data.update;
          // todoList[changeIndex].completed = data.completed;
          // await db.none('UPDATE todolist SET todo = $1 WHERE todo=$2',[data.update,todoList[changeIndex].todo]);
          await Todolist.update({todo:data.update},{where:{todo:todoList[changeIndex].todo}})
          res.redirect('/todos');
        } 
        // else if (data.completed != todoList[changeIndex].completed) {
        //   todoList[changeIndex].completed = data.completed;
        //   res.send(todoList[changeIndex]);
        // }
         else {
          res.status(400).send("No change was detected");
        }
      } else {
        res.status(400).send("Todo does not exist. Please check the spelling and try again.");
      }
    }
  })

app.get('/login', (req, res) => {
    res.send('error: Failed to login to Google')
})

// app.get('/auth/google',
//   passport.authenticate('google', { scope: ['profile'] }));

// app.get('/auth/google/callback', 
//   passport.authenticate('google', { failureRedirect: '/login' }),
//   function(req, res) {
//     // Successful authentication, redirect home.
//     res.redirect('/');
//   });

app.listen(5050, ()=> {
    console.log(`Server is running on port 5500`)
})

