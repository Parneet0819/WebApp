import User from '../models/user';
import Config from '../config/config';
import Course from '../models/courses';
import errorCodes from '../logs/err_codes';
import Comments from '../models/comments';
import config from '../config/config';


export default class CommentsController {
 

//---------------------------------------------------------------------
  // add comments
//-----------------------------------------------------------------------
addComment = (req,res) => {

  var my_comments = []
 
  //checking for course id
  if(!req.body.course_id){
   return res.json({
    'success':false,
    'err_code': errorCodes.ServerErrors['INVALID_COURSE_ID'],
    'message':'Missing Course Id!'
   })
  } 
 
  if(req.body.comments.length == 0){
   return res.json({
    'success':false,
    'err_code': errorCodes.ServerErrors['EMPTY_COMMENT'],
    'message':'Comment field can not be Empty!'
   })
  }
 
  if(req.body.comments){
   if(req.body.comments.length > 0){
    for (let index = 0; index < req.body.comments.length; index++) {
     const comments_obj = req.body.comments[index];
     const c_content = comments_obj.comment_content;
     const c_author = comments_obj.comment_author;
     const now = new Date();
     if (!comments_obj.comment_created_at ) {
      comments_obj.comment_created_at = now;
      comments_obj.comment_updated_at = now;
 
     }
     my_comments.push({comment_content:c_content,comment_author:c_author,
      comment_created_at:comments_obj.comment_created_at,comment_updated_at: comments_obj.comment_updated_at})
     
    }
   }
 
  }
  Comments.findOne({course_id:req.body.course_id})
  .exec((err, obj)=>{
   if(err){
    return res.json({
     'success':false,
     'err_code': errorCodes.ServerErrors['COMMENTS_NOT_FOUND'],
     'message':'Comments Not Found'
    })
   }
   if(obj == null){
     const comments_obj = new Comments({
       course_id: req.body.course_id,
       comments:my_comments
      })
     
      //saving category data 
      comments_obj.save((err, obj) => {
       if(err){
           return res.json({
           'success': false,
           'err_code': errorCodes.ServerErrors['DATA_SAVING_ERR'],
           'message': 'data is not saved',
           "err" :err
           });
       } 
       else{
        res.json({
         'success':true,
         'data':obj
        })
       }
     })// comment obj
   }
   else{
     Comments.findOneAndUpdate({_id:obj.id},{
       $push: {
         comments:my_comments
         } ,
     },{new:true})
  .exec((err, my_obj)=>{
   if(err){
    return res.json({
     'success':false,
     'err_code': errorCodes.ServerErrors['COMMENTS_NOT_FOUND'],
     'message':'Comments Not Found'
    })
   }
   if(my_obj == null){
     return res.json({
       'success':false,
       'err_code': errorCodes.ServerErrors['COMMENTS_NOT_FOUND'],
       'message':'Comments Not Found'
      })
   }
   else{
     res.json({
       'success':true,
       'data':my_obj
      })
   }
   })
 }
 
 })
 
 
 
 
 }//addcomment

//---------------------------------------------------------------------
  // get comments
//---------------------------------------------------------------------

getComments = (req,res) => {

  Comments.find({})
 .populate({
  path:'comments.comment_author',
  model:'User'
  
})
.populate({
 path:'comments.replies.reply_author',
 model:'User',

})
 .exec((err, obj)=>{
  if(err){
   return res.json({
    'success':false,
    'err_code': errorCodes.ServerErrors['COMMENTS_NOT_FOUND'],
    'message':'Comments Not Found'
   })
  }
  if(obj == null){
    return res.json({
      'success':false,
      'err_code': errorCodes.ServerErrors['EMPTY_DATA'],
      'message':'Comments Not Found'
     })
  }
  else{
   res.json({
    'success':true,
    'data':obj,
    
   })
  }

 })//main exec

}//get comments

//---------------------------------------------------------------------
  // get particular comment
//---------------------------------------------------------------------

getParticularComment = (req,res) => {

  Comments.findOne({course_id:req.body.courseid})
 .populate({
  path:'comments.comment_author',
  model:'User',
  
})
.populate({
 path:'comments.replies.reply_author',
 model:'User',

})
 .exec((err, obj)=>{
  if(err){
   return res.json({
    'success':false,
    'err_code': errorCodes.ServerErrors['COMMENTS_NOT_FOUND'],
    'message':'Comments Not Found'
   })
  }
  if(obj == null){
    res.json({
      'success':false,
      'message':'No Comments Added Yet',
      'err_code': errorCodes.ServerErrors['EMPTY_DATA']

     })
  }
  else{
   res.json({
    'success':true,
    'data':obj,
    'count':obj.comments.count
   })
  }
  
 })
}// get particular comment

//---------------------------------------------------------------------
  // delete particular comment
//---------------------------------------------------------------------

deleteParticularComment = (req,res) => {

  Comments.findOne({_id:req.body.id})
  .exec((err, obj)=>{
   if(err){
    return res.json({
     'success':false,
     'err_code': errorCodes.ServerErrors['COMMENTS_NOT_FOUND'],
     'message':'Comments Not Found'
    })
   }
   if(obj == null){
     return res.json({
       'success':false,
       'err_code': errorCodes.ServerErrors['COMMENTS_NOT_FOUND'],
       'message':'Comments Not Found'
      })
   }
   if(obj != null){
     Comments.findOneAndUpdate({ _id: req.body.id }, { "$pull": { "comments": { "_id": req.body.commentId } }}, { safe: true}, 
     function(err, myObj) {
       if(err){
         return res.json({
          'success':false,
          'err_code': errorCodes.ServerErrors['COMMENTS_NOT_FOUND'],
          'message':'Comments Not Found'
         })
       }
       if(myObj == null){
         return res.json({
           'success':false,
           'err_code': errorCodes.ServerErrors['COMMENTS_NOT_FOUND'],
           'message':'Comments Not Found'
          })
       }
     
       else{
         res.json({
        'success':true,
        'message':'Comment Deleted Succesfully'
      })
      }
       
     })
   }
   // else{
   //  res.json({
   //   'success':true,
   //   'message':'Comment Deleted Succesfully'
   //  })
   // }
  })//main exec
 
 }//delete particular comment


//---------------------------------------------------------------------
  // edit particular comment
//---------------------------------------------------------------------
editComment = (req,res) =>{

  const now = new Date();

  Comments.findOneAndUpdate({ _id: req.body.id, 'comments._id': req.body.commentid }, {
    $set: {
        'comments.$.comment_content': req.body.comment_content,
        'comments.$.comment_created_at':now,
        'comments.$.comment_updated_at':now
    }
}, { new: true })
    .exec((err, updateComment) => {

      if(err){
        return res.json({
          'success':false,
          'err_code': errorCodes.ServerErrors['UNABLE_TO_UPDATE'],
          'message':'Unable to update the comment'
         })
      }
      if(updateComment == null){
        res.json({
          'success':false,
          'message':'Id not found',
          'err_code': errorCodes.ServerErrors['INVALID_COURSE_ID']

         })
      }
      else{
      res.json({
        'success': true,
        'message': 'Comment updated successfully',
        'data': updateComment
        });
      }
  });
  
}//editComment

//---------------------------------------------------------------------
  // add reply to particular comment
//---------------------------------------------------------------------
addReplyToComment = (req,res) =>{
  
  const now = new Date();

  Comments.findOneAndUpdate({ _id: req.body.id, 'comments._id': req.body.commentid }, {

    $push: {
        'comments.$.replies':{
          'reply_content':req.body.reply_content,
          'reply_author':req.body.reply_author,
          'reply_created_at':now,
          'reply_updated_at':now
        } ,
        
    }
})
.exec((err, updateCommentReply) => {

  if(err){
    return res.json({
      'success':false,
      'err_code': errorCodes.ServerErrors['UNABLE_TO_UPDATE'],
      'message':'Unable to update the comment'
     })
  }
  else{
  res.json({
    'success': true,
    'message': 'Comment Reply added successfully',
    'data': updateCommentReply
    });
  }
  });

}//add reply to particular comment

//---------------------------------------------------------------------
  // edit reply to particular comment
//---------------------------------------------------------------------
editCommentReply = (req,res) =>{
  const now = new Date();

  Comments.findOneAndUpdate({ '_id':req.body.id,'comments._id': req.body.commentid ,'comments.replies._id': req.body.replyid}, {

    $set: {
      'comments.0.replies.0.reply_content':req.body.reply_content,
        // 'reply_created_at':now,
        // 'reply_updated_at':now
      // } 
        
    },
})
.exec((err, updateCommentReply) => {

  if(err){
    return res.json({
      'success':false,
      'err_code': errorCodes.ServerErrors['UNABLE_TO_UPDATE'],
      'message':'Unable to update the comment'
     })
  }
  else{
  res.json({
    'success': true,
    'message': 'Comment Reply updated successfully',
    'data': updateCommentReply
    });
  }
  });
}

deleteCommentReply = (req,res) =>{
  Comments.findOneAndUpdate({_id:req.body.id,'comments._id':req.body.commentid}, {
    $pull:  { 
      "comments.$.replies": {
          _id:req.body.replyid
      } 
  }
  })
.exec((err, removeReply) => {

  if(err){
    return res.json({
      'success':false,
      'err_code': errorCodes.ServerErrors['UNABLE_TO_UPDATE'],
      'message':'Unable to delete the comment'
     })
  }
  else{
  res.json({
    'success': true,
    'message': 'Comment Reply removed successfully',
    });
  }
});
}

}//CommentsController