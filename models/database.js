var mongoose=require('mongoose');
mongoose.connect('mongodb://localhost/chat_appx');
var schema=new mongoose.Schema({username:String,password:String});
module.exports=mongoose.model('credentials',schema);
