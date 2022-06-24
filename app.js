//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//create the mongoose conneciton with todolistDB
mongoose.connect('mongodb://localhost:27017/todolistDB');

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

//for the custom list
const listSchema = {
  name: String,
  items: [itemSchema]
}

//model for the custom list
const List = mongoose.model("List", listSchema);

//stores the default items for the list
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
  //stores the list item
  const listName = req.body.list;

  //create an item for the default list
  const item = new Item ({
    name: itemName
  });

  //if the current list is the default list,
  //save the list and redirrect back to the home route
  if(listName === "Today"){
    item.save();
    res.redirect("/");
    //else if the list is custom, find the custom list by name
    //and push the item into the custom list
    //save the list and redirect  back to the custom list
  } else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function(req, res){
  const checkedItemID = req.body.checkbox;
  //list name form list.ejs
  const listName = req.body.listName;

  //checking if we are deleting data from
  //the default or custom list
  if(listName === "Today") {
    Item.findByIdAndRemove(checkedItemID, function(err){
      //if no errors, remove an item with that ID
      if(!err){
        console.log(checkedItemID + " has been removed");
        //redirrect once removed from mongodb
        res.redirect("/");
      }
    });
  //else if custom list
  } else {
    //finding an item from the cutsom list
    //and updating it

    //1st parameter: find what we want to update
    //updating the custom list
    //2nd parameter: data to be updated
    //pulling the item with the checked item ID
    //3rd parameter: callback that returns the found list of no errors
    List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemID}}}, function(err, foundList){
      if(!err){
        //redirect to the custom list
        //once the item is deleted
        res.redirect("/" + listName);
      }
    });
  }
});

app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);

  if (req.params.customListName == "favicon.ico") return;

  List.findOne({name: customListName}, function(err, foundList){
    if(!err){
      if(!foundList) {
        //create a new list item
        //for the custom list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save(function(){
          res.redirect("/"+customListName);
        });
      } else{
        //path to show the existing list
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });
});


app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port==null || port==""){
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started successfully");
});
