//modules
var http=require('http');
var express=require('express');
//var session = require('express-session');
var cookieParser=require('cookie-parser');
var app=express();
var multer=require('multer');
var server=http.createServer(app);
var io=require('socket.io').listen(server);
var passport=require('passport');
var FacebookStrategy=require('passport-facebook').Strategy;
var GoogleStrategy=require('passport-google').Strategy;
var list=[];var i=0;

//mongoose.model
var credentials=require('./models/database');

//configuration
//app.use(session({secret:'gosh'}));
app.use(cookieParser());
app.use(express.static(__dirname+'/public'));
app.use(multer({dest:'./public/images'}));
app.use(passport.initialize());
app.use(passport.session());
//strategies/////////////////////////////
////////////////////////////////facebook strategy
passport.use(new FacebookStrategy({
     clientID:'882848881746289',
     clientSecret:'76e868a0599fde96aa5bd03c9b140084',
     callbackURL:"http://localhost:3000/facebook/callback"
     },function(accessToken, refreshToken, profile, done){
    process.nextTick(function(){
             console.log(profile);
             return done(null,profile);
                  });
}));
///////////////////////////////google login//
passport.use(new GoogleStrategy({
    returnURL: 'http://localhost:3000/google/callback',
    realm: 'http://localhost:3000/'
  },function(identifier,profile,done){
    console.log(profile);
    return;
    //done(err, user);
}));

///////////////////////////////
passport.serializeUser(function(user, done) {
  done(null, user);
});
 
passport.deserializeUser(function(user, done) {
  done(null, user);
});
///////////////////////////////fb
app.get('/facebook/callback',
  passport.authenticate('facebook', {
    
    failureRedirect: '/loginFailure',
    
  }),function(req, res) {
    // Successful authentication, redirect home.
   // console.log("req.user"+req.user.username);
   res.sendFile(__dirname+'/public/html/chatpagenew.html');
  });
app.get('/auth/facebook',passport.authenticate('facebook'));
//////////////////////////////////////////gogle
app.get('/auth/google', passport.authenticate('google'));
app.get('/google/callback', 
  passport.authenticate('google', { successRedirect: '/loginSuccess',
                                    failureRedirect: '/loginFailure' }));

/////////////////////////////////////////////
////////////////////////////////////////
app.get('/loginSuccess',function(req,res){
 //req.session.username=req.user;
console.log("success"+req.user);
 res.sendFile(__dirname+'/public/html/chatpagenew.html');
});
app.get('/loginFailure',function(req,res){
 res.end("failed");
});
//////////////////////////////////////

//routing
app.get('/',function(req,res){
   
  // res.cookie('userN','sairam lets c ');
   //console.log(req.cookies);
   res.sendFile(__dirname+'/public/html/homepage.html');
});

app.get('/login',function(req,res){
    res.sendFile(__dirname+'/public/html/indexlogin.html');
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
      console.log("hello this is"+req.cookies.chatName);
      res.sendFile(__dirname+'/public/html/upload.html');
});
//renedering images

app.get('/allimages',function(req,res){

});
app.post('/upload',function(req,res){
      
      res.sendFile(__dirname+'/public/html/chatpagenew.html');
});
app.post('/check',function(req,res){
  //console.log("hello nithin "+req.cookies.userN);
credentials.findOne({'username':req.body.username,'password':req.body.password},function(err,details){
   if(err)
    res.end(err);
   else
    if(details){
     //req.session.username=details.username;
     res.cookie('chatName',details.username);
     //console.log(req.session.username);
     console.log("found a user with username:"+details.username+ "  and password: "+details.password);
     
     
     res.sendFile(__dirname+'/public/html/chatpagenew.html');
            }
    else{
     console.log("not found");
     res.redirect("/register");}
});

 
});
io.sockets.on('connection',function(socket){
   var ca= socket.request.headers.cookie.split(';');
   ca=ca[ca.length-1];
  ca= ca.substring(10)
   socket.nickname=ca
   console.log("nickname"+socket.nickname);
   list=[];
   credentials.find({},function(err,details){
      if (err) 
	 console.log(err);
      else console.log(details);
       for ( var x=0;x<details.length;x++)
         {
	     list.push(details[x].username);
	     console.log(details[x].username);
        }
       
       socket.emit('listofusers',list);
  
   });
   
   
socket.on('new message',function(from,to,data){
   
   io.sockets.emit('message',from,to,data);
});
});


server.listen(3000,function(){
  console.log("server running on port 3000");
//  credentials.find({},function(err,details){console.log(details);});
});
