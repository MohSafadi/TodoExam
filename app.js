const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const _ = require("lodash");
const mongoose = require("mongoose");

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
mongoose.set('strictQuery', false)
mongoose.connect("mongodb+srv://<admin-safadi>:<Safadi95>@clustername.mongodb.net/TodoListExam");

const itemsSchema = {
    name: String
};
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Welcome to the todolist"
});

const item2 = new Item({
    name: "<--- Hit the box to delete"
});

const item3 = new Item({
    name: "Hit the + to add new item"
})

const defaultItems = [item1, item2, item3];

const listsSchema = {
    name: String,
    items: [itemsSchema]
};
const List = mongoose.model("List", listsSchema);

app.get("/", function (req, res) {

    Item.find({}, function (err, foundItems) {

        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, function (err) {
                if (!err) {
                    console.log("Default Items Inserted");
                    res.redirect("/");
                };
            });

        } else {
            res.render("list", { listTitle: "Today", foundItems: foundItems });
        };
    });
});

app.post("/", function (req, res) {
    const newItem = req.body.newItem;
    const listName = req.body.listName;

    const item = new Item({
        name: newItem
    });

    if (listName === "Today") {
        item.save();
        res.redirect("/");
    } else {
        List.findOne({ name: listName }, function (err, foundList) {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        });
    };
});


app.get("/:newCustomList", function (req, res) {
    const newCustomList = _.capitalize(req.params.newCustomList);

    List.findOne({ name: newCustomList }, function (err, foundList) {
        if (!err) {
            if (foundList) {
                console.log("List Found");
                res.render("list", { listTitle: foundList.name, foundItems: foundList.items })
            } else {
                List.create({ name: newCustomList, items: defaultItems });
                console.log("list not found, creating new list");
                res.redirect("/" + newCustomList);

            }
        }
    })
});

app.post("/delete", function (req, res) {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today") {
        Item.deleteOne({ _id: checkedItemId }, function (err) {
            if (!err) {
                console.log(`Item with ID: ${checkedItemId} is deleted`);
                res.redirect("/");
            };
        });
    } else {
        List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } }, function (err) {
            if (!err) {
                res.redirect("/" + listName);
            };
        });
    };

});

app.listen(3000, function (req, res) {
    console.log("Online on Port 3000");
});