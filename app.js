//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//create the mongoose conneciton with todolistDB
mongoose.connect("mongodb://localhost:27017/todolistDB");

//create a mongoose Schema
const itemSchema = {
  name: String
};

//create mongoose model
const Item = mongoose.model("Item", itemSchema);

const item1 = new Item ({
  name: "Wash cats"
});

const item2 = new Item ({
  name: "Chop wood"
});

const item3 = new Item ({
  name: "Water Cucumbers"
});

const defaultItems = [item1, item2, item3];

Item.insertMany(defaultItems, function(err) {
  if(err) {
    console.log(err);
  } else {
    console.log("Items successfully added");
  }
});



app.get("/", function(req, res) {

  res.render("list", {listTitle: "Today", newListItems: items});

});

app.post("/", function(req, res){

  const item = req.body.newItem;

  if (req.body.list === "Work") {
    workItems.push(item);
    res.redirect("/work");
  } else {
    items.push(item);
    res.redirect("/");
  }
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
