var express = require("express");
var app = express();
var port = 8000;
var bp = require("body-parser");
var path = require("path");
var session = require("express-session");

app.use(express.static(path.join(__dirname, "/views")));
app.use(bp.json())
app.use(session({ secret: "boo" }));
app.use(bp.urlencoded({extended:true}));
app.set("views", path.join(__dirname, "/views"));
app.set("view engine", "ejs");

var mongoose = require("mongoose")
var Schema = mongoose.Schema;

var MessageSchema = new mongoose.Schema({
    name: String,
    message: String,
    comments: [{type: Schema.Types.ObjectId, ref: 'Comment'}]
}, { timestamps: true, usePushEach: true})

var CommentSchema = new mongoose.Schema({
    _message: { type: Schema.Types.ObjectId, ref: 'Message' },
    name: String,
    comment: String,
}, { timestamps: true, usePushEach: true });

mongoose.model("Message", MessageSchema)
mongoose.model("Comment", CommentSchema)
var Message = mongoose.model('Message')
var Comment = mongoose.model('Comment')
mongoose.connect("mongodb://localhost/messageBoard")

app.get("/", function (req, res) {
    Message.find({})
        .populate('comments')
        .exec(function (err, messages) {
            res.render('index', { messages: messages });
        });

})

app.post("/process", function(req, res){
    Message.create({
        name: req.body.name,
        message: req.body.message}, function(err, message){
            res.redirect("/")
        })
})

app.post("/processcomment/:id", function(req, res){
    Message.findOne({_id: req.params.id}, function(err, message){
        // data from form on the front end
        var comment = new Comment(req.body);
        //  set the reference like this:
        comment.message = message._id;
        // now save both to the DB
        comment.save(function(err){
            message.comments.push(comment);
            message.save(function(err){
                    if(err) {
                        console.log('Error');
                    } else {
                        res.redirect('/');
                    }
                });
         });
    });
 });

app.listen(port, function () {
    console.log("listening on port 8000")
})