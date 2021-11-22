import * as mongoose from 'mongoose';

const commentsSchema = new mongoose.Schema({

 course_id: {
  type: mongoose.Schema.Types.ObjectId, 
  ref: 'Course'
},
comments:[{
 comment_content:String,
 comment_author: {
  type: mongoose.Schema.ObjectId, 
  ref: 'User'
 },
 comment_likes:{
  type:Number,
  default:0
 },
 comment_created_at: Date,
 comment_updated_at: Date  , 

replies:[{
reply_content:String,
reply_author: {
 type: mongoose.Schema.ObjectId, 
 ref: 'User'
},
reply_likes:{type:Number,
default:0},
reply_created_at: Date,
reply_updated_at: Date, 
}]
}],
created_at: Date,
updated_at: Date 
   
})

commentsSchema.pre('save', function(next) {
    
 const comments = this;
 const now = new Date();

 comments.updated_at = now;

 if (!comments.created_at) {
  comments.created_at = now;
 }
 
 next();
});

const Comments = mongoose.model('Comments', commentsSchema);

export default Comments;
