import User from '../models/user';
import Course from '../models/courses';
import Favorites from '../models/favorites';
import errorCodes from '../logs/err_codes';
const session = require('express-session');

export default class FavoriteCourseController  {
    model = Favorites;

//---------------------------------------------------------
    // add fav courses 
//-----------------------------------------------------------
addFavCourse = (req,res) =>{

    this.model.findOne({course_id:req.body.course_id})
    .exec((err, object)=>{
        if(object != null && req.body.course_id == object.course_id && req.body.user == object.user){
            return res.status(200).json({
                'success': false,
                'err_code': errorCodes.ServerErrors['ALREADY_EXISTS'],
                'message': 'Course Already Exists',
              
            });
        }
        if(err){
            if (err) {
                return res.status(400).json({
                    'success': false,
                    'err_code': errorCodes.ServerErrors['DATA_SAVING_ERR'],
                    'message': 'Failed',
                    err:err
                });
            }
        }
        if(object == null || object != null){
            const obj = new Favorites({
            user:req.body.user,
            course_id:req.body.course_id,
            favorite_bool:true
            });

        //saving data in course schema 
        obj.save((err, result) => {

    // check for error
        if (err) {
            return res.status(400).json({
                'success': false,
                'err_code': errorCodes.ServerErrors['DATA_SAVING_ERR'],
                'message': 'data is not saved',
                err:err
            });
        }
        if(result != null){
            Course.findOneAndUpdate({_id:req.body.course_id},{favorite_bool:true})
            .populate('course_id')
            .exec((err, resp)=>{
                // check for error
                if (err) {
                    return res.status(400).json({
                        'success': false,
                        'err_code': errorCodes.ServerErrors['DATA_SAVING_ERR'],
                        'message': 'data is not saved',
                        err:err
                    });
                }
              

                if(resp != null){
                    var counter = parseInt(resp.fav_count) + 1
                    Course.findOneAndUpdate({_id:req.body.course_id},{$set:{fav_count:counter}})
                    .exec((err, respp)=>{
                        // check for error
                        if (err) {
                            return res.status(400).json({
                                'success': false,
                                'err_code': errorCodes.ServerErrors['DATA_SAVING_ERR'],
                                'message': 'data is not saved',
                                err:err
                            });
                        }
                        res.status(200).json({
                            'success': true,
                            'data': result,
                            'message':'Favorite added succesfully'
                        });
                   
                    })
                }
               
            })
        }

    });//result
}
})
}//addFavCourse


//---------------------------------------------------------
    // un-favorite courses 
//-----------------------------------------------------------
unFavCourse = (req,res) =>{  
    this.model.findOneAndRemove({_id:req.body.id})

    .exec((err, result) =>{
        // check for error
        if (err) {
            return res.status(400).json({
                'success': false,
                'err_code': errorCodes.ServerErrors['DATA_SAVING_ERR'],
                'message': 'data is not saved',
                err:err
            });
        }
        if(result == null){
            return res.status(200).json({
                'success': false,
                'err_code': errorCodes.ServerErrors['INVALID_USER_ID'],
                'message': 'Record does not exists',
             
            }); 
        }
        if(result != null){
            Course.findOneAndUpdate({_id:result.course_id},{favorite_bool:false})

            .exec((err, rst) =>{

                if(rst == null){
                    return res.json({
                     'success': false,
                     'message':'Record Not Found'
                    }) 
         
                 }
                 res.status(200).json({
                     'success': true,
                     'message':'Favorite removed succesfully'
                 });
            })
        }
       

    });//result

}//unFavCourse


//---------------------------------------------------------
  // get all fav courses
//----------------------------------------------------------
getFavCourses = (req,res) => {
    var arr = []
    this.model.find({user:req.body.user},{favorite_bool:true})
    .populate('course_id')
    .populate('user')
    .exec((err, result) =>{
        if (err) {
            return res.status(400).json({
                'success': false,
                'message': 'Err Occurred',
                err:err
            });
        }

        if(result == null){
            return res.json({
                'success':false,
                'err_code': errorCodes.ServerErrors['EMPTY_DATA'],
                'message':'No favorite found!'
            })     
        }
        if(result != null && result.length > 0){
            for (let index = 0; index < result.length; index++) {
                const course_detail = result[index].course_id;
                const user_name = result[index].user.name;
                if(course_detail != null && user_name!= null){
                arr.push({_id:course_detail._id,fav_count:course_detail.fav_count,fav_id:result[index]._id,uid:course_detail.uid,course_title:course_detail.course_title,video_link:course_detail.video_link,user:user_name ,image_preview:course_detail.image_preview,favorite_bool:result[index].favorite_bool,course_name:course_detail.course_name,course_details:course_detail.course_details})

                }

            }
            arr =  arr.sort((a, b) => b.fav_count - a.fav_count);

        }

        res.status(200).json({
            'success': true,
            'data': arr
            
        });
    });
}//getFavCourses

//---------------------------------------------------------
  // get the id for favorite course
//----------------------------------------------------------
getFavId = (req,res) =>{
    this.model.findOne({course_id:req.body.course_id},{user:req.body.user})
    .exec((err, result)=>{
        if (err) {
            return res.status(400).json({
                'success': false,
                'err_code': errorCodes.ServerErrors['DATA_SAVING_ERR'],
                'message': 'data is not saved',
                err:err
            });
            
        }
        if(result == null){
            return res.status(200).json({
                'success': false,
                'err_code': errorCodes.ServerErrors['INVALID_USER_ID'],
                'message': 'Record does not exists',
             
            }); 
        }
        res.status(200).json({
            'success': true,
            'data': result
            
        });
    })
}//getFavId

}