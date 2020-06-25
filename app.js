//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ =require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-yongyuan:test123@cluster0-ziele.mongodb.net/todoListDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const itemSchema = {
  name: String,
};
const item = mongoose.model("items", itemSchema);

const item1 = new item({
  name: "Weclome to my todoList",
})
const item2 = new item({
  name: "This is a website",
})
const item3 = new item({
  name: "you can add items",
})

const defaultItems = [item1, item2, item3];

const listSchema={
  name:String,
  items:[itemSchema]
};
const list=mongoose.model("list",listSchema);



app.get("/", function(req, res) {

  item.find({}, function(err, foundItems) {
    //if db is empty and insert the default items
    if (foundItems.length === 0) {
      item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Insert Sucessfully");
        }
      });
      //to redirect to home rounte and goes to else-statement
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems
      });
    }
  });


});

app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName=req.body.list;
  const item4 = new item({
    name: itemName
  });
  if(listName==="Today"){
  item4.save();
  res.redirect("/");
}else{
  list.findOne({name:listName},function(err,foundList){

    foundList.items.push(item4);
    foundList.save();
    res.redirect("/" + listName);
  });
}
});

app.post("/delete",function(req,res){

  const checkedItemID=req.body.checkbox;
   const listName=req.body.listName;
   if(listName==="Today"){
  //remove item by its ID
  item.findByIdAndRemove(checkedItemID,function(err){
    if(err){
      console.log(err)
    }else{
      console.log("Delete Sucessfully");
    }
  })
  res.redirect("/");
}else{
  //findOneAndUpdate()
  list.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemID}}},function(err,foundList){
    if(!err){
      res.redirect("/"+listName);
    }

  })
}
})

app.get("/:customListName",function(req,res){
  const customListName=_.capitalize(req.params.customListName);

list.findOne({name:customListName},function(err,foundList){
  if(!err){
    if(!foundList){
    //create newListItems
    const list1 =new list({
      name:customListName,
      items:defaultItems
    });
    list1.save();
    //redirect to cureent route
    res.redirect("/"+customListName);
  }else{
    // show an existing list
    res.render("list", {
      listTitle:foundList.name,
      newListItems: foundList.items
    });
  }
}


})

})

app.get("/about", function(req, res) {
  res.render("about");
});
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started");
});
