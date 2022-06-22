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

app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems) {

    if(err) {
      console.log(err);
    } else {
      //insert default data only if the database is empty
      if(foundItems.length===0) {

        Item.insertMany(defaultItems, function(err) {
          if(err) {
            console.log(err);
          } else {
            console.log("Items successfully added");
          }
        });
        res.redirect("/");
      } else {
        res.render("list", {listTitle: "Today", newListItems: foundItems});
      }
    }

  });

});

app.post("/", function(req, res){

  //stores user input
  const itemName = req.body.newItem;

  const item = new Item ({
    name: itemName
  });

  //save the user input item
  item.save();

  //redirect the user back to the home route
  res.redirect("/");


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
