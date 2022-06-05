const express = require("express");
const {ObjectId} = require('mongodb')
const app = express();
const { connectToDB, getDB } = require("./db.js");

app.set("port", process.env.PORT || 5000);

app.use(express.json());

//db connection
let db;
connectToDB((err) => {
  if (err) {
    console.log(err);
    process.exit(1);
  }

  app.listen(app.get("port"), () => {
    console.log("Server is running on port", app.get("port"));
  });
  db = getDB();
});

app.get("/books", (req, res) => {
  /***
   * Pagination
   */

  //current page
  const page = req.query.page || 0;
  const booksPerPage = 3;
  let books = [];
  db.collection("books")
    .find()
    .sort({ author: 1 })
    .skip(page * booksPerPage)
    .limit(booksPerPage)
    .forEach((book) => books.push(book))
    .then(() => res.status(200).json(books));
});

app.get('/books/:id',(req,res)=>{
  const {id} = req.params;
  if(ObjectId.isValid(id)){
    db.collection('books')
     .findOne({_id:ObjectId(id)})
     .then(doc=>res.status(200).json(doc))
     .catch(err=> res.status(500).json({error:'Could not find book'}));

  }else{
    res.status(500).json({error:"Not a valid id"});
  }
})

app.post('/books',(req,res)=>{
 const book =  req.body;
 //console.log(book)

 db.collection('books')
  .insertOne(book)
  .then(result=>{
    res.status(201).json(result)
  })
  .catch(err=>{
    res.status(500).json({err:'Could not create a new document'})
  })

})

app.delete('/books/:id',(req,res)=>{
  const {id} = req.params;
  if(ObjectId.isValid(id)){
    db.collection('books')
      .deleteOne({_id:ObjectId(id)})
      .then(result=>{
        res.status(200).json(result);
      })
      .catch(err=>{
        res.status(404).json({error:'Could not delete the given document'})
      });
  }else{
    res.status(500).json({error:'Not a valid doc id'})
  }

})

app.patch('/books/:id',(req,res)=>{
  const {id} = req.params;
  const updatedBook = req.body;
  if(ObjectId.isValid(id)){
    db.collection('books')
      .updateOne({_id:ObjectId(id)},{$set:updatedBook})
      .then(result=>{
        res.status(200).json(result);
      })
      .catch(err=>{
        res.status(500).json({error:'Could not update the given document'})
      });
  }else{
    res.status(500).json({error:'Not a valid doc id'})
  }
  
})