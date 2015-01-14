//modules
var http=require('http');
var express=require('express');
var app=express();
var multer=require('multer');
var server=http.createServer(app);
var io=require('socket.io').listen(server);

//mongoose.model
var credentials=require('./models/database');

//configuration
app.use(express.static(__dirname+'/public'));
app.use(multer({dest:'./public/images'}));
//routing
app.get('/',function(req,res){
   res.sendFile(__dirname+'/public/html/homepage.html');
});
app.get('/register',function(req,res){

    res.sendFile(__dirname+'/public/html/register.html');
});
app.post('/register',function(req,res){
 
credentials.create({username:req.body.username,password:req.body.password},function(err){
  if(err)
    res.end("database error");
  else
    { 
      console.log("new user registered with username : "+req.body.username);
      res.redirect('/');
    }
  });
});
//uploading images after login
app.get('/upload',function(req,res){
      res.sendFile(__dirname+'/public/html/upload.html');
});
//renedering images
app.get('/allimages',function(req,res){

});
app.post('/upload',function(req,res){
      res.sendFile(__dirname+'/public/html/chatpage.html');
});
app.post('/check',function(req,res){
credentials.findOne({'username':req.body.username,'password':req.body.password},function(err,details){
   if(err)
    res.end(err);
   else
    if(details){ 
     console.log("found a user with username:"+details.username+ "  and password: "+details.password)
     res.sendFile(__dirname+'/public/html/chatpage.html');
            }
    else{
     console.log("not found");
     res.redirect("/register");}
});

 
});
io.sockets.on('connection',function(socket){
   socket.nickname="";
socket.on('new message',function(data){
   
   io.sockets.emit('message',data+socket.nickname);
});
});


server.listen(3000,function(){
  console.log("server running on port 3000");
//  credentials.find({},function(err,details){console.log(details);});
});
