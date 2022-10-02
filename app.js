//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const app = express();
const _ = require("lodash");

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
mongoose.connect(
  "mongodb+srv://admin:RLv2mu4SWQnmGogw@cluster0.x1qpyod.mongodb.net/todolistDB",
  {
    useNewUrlParser: true,
  }
);
const itemSchema = mongoose.Schema({
  name: String,
});
const Item = mongoose.model("item", itemSchema);
const item1 = new Item({
  name: "sport",
});
const item2 = new Item({
  name: "football",
});
const item3 = new Item({
  name: "tennis",
});
const defaultItem = [item1, item2, item3];
const listSchema = {
  name: String,
  items: [itemSchema],
};
const List = mongoose.model("List", listSchema);
// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];
const day = date.getDate();
app.get("/", function (req, res) {
  Item.find({}, function (err, foundItems) {
    if (foundItems.length == 0) {
      Item.insertMany(defaultItem, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("successufuly added to database");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: day, newListItems: foundItems });
    }
  });
});

app.get("/:listCustomName", function (req, res) {
  const customListName = _.capitalize(req.params.listCustomName);
  List.findOne({ name: customListName }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItem,
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      }
    }
  });
});
app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  console.log(listName);
  const item = new Item({
    name: itemName,
  });
  if (listName === day) {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, function (err, foundList) {
      console.log(foundList);
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});
// RLv2mu4SWQnmGogw
app.post("/delete", function (req, res) {
  const checkItemId = req.body.check;
  const listName = req.body.listName;
  if (listName === day) {
    Item.findByIdAndRemove(checkItemId, function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("succussefuly deleted");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkItemId } } },
      function (err) {
        if (!err) {
          res.redirect("/" + listName);
        }
      }
    );
  }
});
// app.get("/work", function (req, res) {
//   res.render("list", { listTitle: "Work List", newListItems: workItems });
// });

app.get("/about", function (req, res) {
  res.render("about");
});
let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}
app.listen(port);

app.listen(port, function () {
  console.log("Server started successufuly");
});
