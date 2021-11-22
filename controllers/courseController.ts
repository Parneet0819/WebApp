import User from '../models/user';
import Categories from '../models/categories';
import Config from '../config/config';
import Course from '../models/courses';
import errorCodes from '../logs/err_codes';
import CourseSection from '../models/course_section';
import config from '../config/config';

const PlaylistSummary      = require('youtube-playlist-summary')
const getYotubePlaylistId  = require('get-youtube-playlist-id')
var youtubeThumbnail       = require('youtube-thumbnail');
const getVideoId           = require('get-video-id');
var YouTube                 = require('youtube-node');


export default class CourseController {

    model = Course
    arr_cat = [];

  //---------------------------------------------------------------------
    // add the course
   //-----------------------------------------------------------------------

   addCourse = (req,res) => {

    //variable
    var url_check; 
    var tags_arr = []
    var VID;
    var userName;
    var videoTitle;
    var titleCourse;
    var imagePreview;
    var youTube = new YouTube();
    youTube.setKey('AIzaSyCHQtNWoJOMVm3e6xaZ8mK_Sx1bYcyoxcs');

    if(!req.body.video_link){
        
        return res.json({
            'success':false,
            'err_code': errorCodes.ServerErrors['MISSING_VIDEO_LINK'],
            'message':'Video link cannot be empty'

        })
    }
    if(!req.body.course_title){
        return res.json({
            'success':false,
            'err_code': errorCodes.ServerErrors['MISSING_COURSE_TITLE'],
            'message':'Course title cannot be empty'

        })
    }
   
    // playlist config
    const playlist_credentails = {
        GOOGLE_API_KEY: Config.GOOGLE_API_KEY, 
        PLAYLIST_ITEM_KEY: Config.PLAYLIST_ITEM_KEY, 
   } 
   
    const ps = new PlaylistSummary(playlist_credentails)
    var match_playlist_url  = req.body.video_link.match(/.*&?list=.*/g)   

    //checking for video url link 
    if(req.body.video_link ){
        var titleCourse = req.body.course_title;
         if(match_playlist_url!= null){
            
             match_playlist_url.forEach(element => {
             url_check = element;
         });
         
         var  playlistUrl = getYotubePlaylistId(url_check)
         const PLAY_LIST_ID = playlistUrl
         var courses = []
         var coursename = req.body.course_title;
         coursename = coursename.replace(/\s/g , "-");

        // getting playlist data
        ps.getPlaylistItems(PLAY_LIST_ID)
             
            .then((data) => {
                const obj = new Course({
                    video_link: req.body.video_link,
                    playlist_url: PLAY_LIST_ID,
                    course_title:req.body.course_title,
                    course_meta_category:req.body.course_meta_category,
                    course_sub_category:req.body.course_sub_category,
                    cat_id : req.body.cat_id,
                    course_name:coursename.toLowerCase(),
                    user:req.body.user,
                    permalink:'course='+coursename.toLowerCase()

                });

                //saving data in course schema 
                obj.save((err, result) => {
                    if(err){
                        return res.json({
                            'success': false,
                            'err_code': errorCodes.ServerErrors['DATA_SAVING_ERR'],
                            'message': 'data is not saved',
                            "err" :err
                        });
                    } 
                    if(data.items.length > 0){
                    //looping playlist array of objects
                    for (let index = 0; index < data.items.length; index++) {

                             var playlist_url  = data.items[index].videoUrl;
                             var  title = data.items[index].title;
                             var video_id = data.items[index].videoId;
                             var thumbnail =  youtubeThumbnail(playlist_url).high.url;
                             var embed_link = playlist_url.replace((/\/watch\?v=/),(/embed/));

                            var video_desc =  data.items[index].description
                             var regExp = /.*(\s((\w.*|[(|0-9]?[0-9]):([0-5]?[0-9]):([0-5]?[0-9])|([0-5]?[0-9]):([0-5]?[0-9]))).*/g
                             var time_regex_output = video_desc.match(regExp);
                             
                             if(time_regex_output == null || time_regex_output == ""){
                                 time_regex_output =[]
                             }

                             var desc_data =data.items[index].description.split('\n');
                            if(desc_data.length > 0){
                                desc_data = desc_data.filter(function(item) {
                                return item !== "";
                                  }).map(function(item) {
                                  return item.replace(/""/g,'');
                                  });
                            }   
                            
                            if(time_regex_output.length > 0){
                             time_regex_output = time_regex_output.filter(function(item) {
                                 return item !== "\n";
                               }).map(function(item) {
                                 return item.replace(/\n/g,'');
                               });
                            }
                            if(time_regex_output.length > 0){
                               time_regex_output = time_regex_output.filter(function(item) {
                                 return item !== "Lecture Outline";
                               }).map(function(item) {
                                 return item.replace("Lecture Outline",'');
                               });
                            }
                              
                             courses.push({video_title:title,video_description: data.items[index].description.split('\n').join('<br>'),
                                 video_id:video_id,video_embed_link:embed_link,video_thumbnail:thumbnail,video_timestamp:time_regex_output,
                                //  channel_link : 'https://www.youtube.com/channel/'+data.channelId,
                                //  channel_title: data.channelTitle
                             })

                             //pushing playlist course details 
                             
                         }//for loop 
                         videoTitle = data.items[0].title;
                         VID = data.items[0].videoId;
                         if(courses.length > 0){
                         imagePreview = courses[0].video_thumbnail;
                        }     
                    }
                         this.model.findOneAndUpdate({_id:result._id},{$push:
                             {'course_details':courses
                             
                         }})
                         .populate('user')
                         .exec((err, updatedData) =>{

                            Course.findOneAndUpdate({_id:result._id} ,{image_preview: courses[0].video_thumbnail,uid:updatedData.user.uid})
                            .populate('user')

                            .exec((err, result1) => {

                            if(result1 == null){
                                return res.json({
                                    'success': false,
                                    'message': 'Reocrd not found!',
                                });
                            }
                         
                             if(err){
                                 return res.json({
                                 'success': false,
                                 'err_code': errorCodes.ServerErrors['DATA_SAVING_ERR'],
                                 'message': 'data is not saved',
                                 "err" :err
                                 });
                             }
                             if(courses.length > 0){

                                courses.forEach(course => {
   
                                youTube.getById(course.video_id, function(error, rst) {
                                   if (error) {
                                     console.log(error);
                                   }
                                   else {
                                       if(rst != null){
                                           rst.items.forEach(item_result => {
                                               if( course.video_id.toString() == item_result.id ){
                                                   if(item_result.snippet.tags != null){
                                                       tags_arr = []
                                                       item_result.snippet.tags.forEach(elem => {
                                                           tags_arr.push(elem)
                                                       });
                                                   }
                                                   Course.findOneAndUpdate({'course_details.video_id':course.video_id},{'$set':{'course_details.$.channel_title':item_result.snippet.channelTitle,'course_details.$.channel_link':'https://www.youtube.com/channel/'+item_result.snippet.channelId,'course_details.$.video_tag':tags_arr}})
                                                       .exec((err, up_result) => {
                                                               if(up_result == null){
                                                                   return res.json({
                                                                       'success': false,
                                                                       'message': 'Record not found!',
                                                                   });
                                                               }
                                                               if(err){
                                                                   return res.json({
                                                                       'success': false,
                                                                       'err_code': errorCodes.ServerErrors['DATA_SAVING_ERR'],
                                                                       'message': 'data is not saved',
                                                                       "err" :err
                                                                   });
                                                               }
                                                               return
                                                           })
                                                       }
                                                   });
                                   
                                               }
                                           }
                                       })
                                   })
                                  }
                                  var cTitle = titleCourse.replace(/^\s+|\s+$/g, '');

                                //   var message = {
                                //     app_id: config.ONE_SIGNAL_APP_ID,
                                //     headings: {"en": cTitle},
                                //     subtitle:{"en":VID +" ("+updatedData.user.uid+")" },

                                //     contents: {
                                //         "en": videoTitle,
                                //     },
                                //     //include_player_ids: ["2bb51271-f7a4-4a52-a79d-357573da81f9"],
                                //     included_segments: ["Subscribed Users"],
                                //     data: { "ID": VID, "udid": updatedData.user.uid ,"user":req.body.user},
                                //     big_picture: imagePreview,
                                //     large_icon: imagePreview,
                                //     small_icon: imagePreview
                                // };
                                // sendNotification(message);
    
                             res.json({
                                 'success' : true,
                                 'data':result1
                                 
                             })

                            })
                            
                         })//updatedData
                       
                     })
                 })
             }
             else{
                 var thumbnail = youtubeThumbnail(req.body.video_link).high;
                 var videoID =  getVideoId(req.body.video_link).id  
                 var coursename = req.body.course_title;
                 coursename = coursename.replace(/\s/g , "-");

                 const obj = new Course({
                     video_link: req.body.video_link,
                     course_title: req.body.course_title,
                     course_meta_category: req.body.course_meta_category,
                     course_sub_category: req.body.course_sub_category,
                     cat_id : req.body.cat_id,
                     course_name:coursename.toLowerCase(),
                     user:req.body.user,
                     permalink:'course='+coursename.toLowerCase()

                 });
 
                     //saving category data 
                     obj.save((err, main_obj) => {
                         if(err){
                             return res.json({
                             'success': false,
                             'err_code': errorCodes.ServerErrors['DATA_SAVING_ERR'],
                             'message': 'data is not saved',
                             "err" :err
                             });
                         } 

                       var youTube = new YouTube();
                       youTube.setKey('AIzaSyCHQtNWoJOMVm3e6xaZ8mK_Sx1bYcyoxcs');
       
                       youTube.getById(videoID, function(error, result) {
                         if (error) {
                           console.log(error);
                         }
                         else {
                           
                           var embed = 'https://www.youtube.com/embed/'+videoID
                           console.log(JSON.stringify(result, null, 2));
                             result.items.forEach(element => {
                                if(element.snippet.tags != null){
                               element.snippet.tags.forEach(element => {
                                 tags_arr.push(element)
                               });
                            }
                       
                             var embed = 'https://www.youtube.com/embed/'+videoID
 
                             var video_desc =  element.snippet.description
                             var regExp = /.*(\s((\w.*|[(|0-9]?[0-9]):([0-5]?[0-9]):([0-5]?[0-9])|([0-5]?[0-9]):([0-5]?[0-9]))).*/g
                             var time_regex_output = video_desc.match(regExp);
                             
                             if(time_regex_output == null || time_regex_output == ""){
                                 time_regex_output =[]
                             }
                             if(time_regex_output.length > 0){
                             time_regex_output = time_regex_output.filter(function(item) {
                                 return item !== "\n";
                               }).map(function(item) {
                                 return item.replace(/\n/g,'');
                               });
                            }
                                if(time_regex_output.length > 0){
                               time_regex_output = time_regex_output.filter(function(item) {
                                 return item !== "Lecture Outline";
                               }).map(function(item) {
                                 return item.replace("Lecture Outline",'');
                               });
                            }                                   
                            videoTitle = element.snippet.title;
                            imagePreview = element.snippet.thumbnails.high.url;

                             Course.findOneAndUpdate({_id:main_obj._id} , 
                                {$push:{'course_details':{
                                 video_description: element.snippet.description.split('\n').join('\n<br/>\n'),
                                 video_title:element.snippet.title,
                                 video_tag:tags_arr,
                                 video_id:videoID,
                                 video_embed_link:embed,
                                 video_thumbnail:element.snippet.thumbnails.high.url,
                                 video_timestamp:time_regex_output,
                                 channel_link:'https://www.youtube.com/channel/'+element.snippet.channelId,
                                 channel_title:element.snippet.channelTitle
 
 
                             }},
                            })

                            .populate('user')

                             .exec((err, result) => {

                                Course.findOneAndUpdate({_id:result._id},{'$set':{image_preview: element.snippet.thumbnails.high.url,uid:result.user.uid}})
                                .populate('user')

                                .exec((err, result1) => {
                                    if(result1 == null){
                                        return res.json({
                                            'success': false,
                                            'message': 'Reocrd not found!',
                                        });
                                    }
                                    // var cTitle = titleCourse.replace(/^\s+|\s+$/g, '');

                                    // var message = {
                                    //     app_id: config.ONE_SIGNAL_APP_ID,
                                    //     headings: {"en": cTitle},
                                    //      subtitle:{"en":videoID +" ("+result.user.uid+")" },
                                    //     contents: {
                                    //         "en": videoTitle  
                                    //     },
                                    //     included_segments: ["Subscribed Users"],
                                    //     data: { "ID": videoID, "udid": result.user.uid ,"user":req.body.user},
                                    //     big_picture: imagePreview,
                                    //     large_icon: imagePreview,
                                    //     small_icon: imagePreview
                                    //     //include_player_ids: ["2bb51271-f7a4-4a52-a79d-357573da81f9"]
                                         
                                    // };
                                    // sendNotification(message);
                                    res.json({
                                        'success' :true,
                                        'data':result1
                                     })
                                })
                                 
                                
 
                             })//result
 
                          })//fetch video Info
 
                     }//course data
                 })
             })//main obj
         }
     }

}//function bracket

//---------------------------------------------------------------------
    // get the course by id
//-----------------------------------------------------------------------
   getCourseByCId = (req, res) =>{
   
    var arr = []
    this.model.findOne({'course_details._id':req.body.id})
    .populate('user')

    .exec((err, data)=>{
        if(data!= null){
        data.course_details.forEach(element => {
            if (element._id.toString() == req.body.id) {
                arr.push({_id:element._id,video_timestamp:element.video_timestamp,video_description:element.video_description,
                    video_id:element.video_id,video_title:element.video_title,video_embed_link:element.video_embed_link,video_thumbnail:element.video_thumbnail,channel_title:element.channel_title,channel_link:element.channel_link})
                }
            });
        }
        if(err) {
          return (err);
        }
        res.json({
            'success':true,
            'data':arr,
            'user_data':data

        })
    })
}//getCourseById

//---------------------------------------------------------------------
    // get all  courses
//---------------------------------------------------------------------
getCourses = (req,res) =>{

    const perPage = parseInt(req.query.currentPage || 9 )
    const page = parseInt(req.query.page || 1); // Page 
   
    Course.countDocuments().exec(function(err, count) {
        if(err) {
            return res.status(400).json({
                'success': false,
                'err':err,
                'message':'Error Occured'
            });
        }
        Course.find({}).skip((perPage * page) - perPage).sort({fav_count:-1})
        .limit(perPage)
        .populate('user')
        .exec(function(err, courses) {
        
            if(courses == null){
                return res.status(400).json({
                    'success': false,
                    'err_code': errorCodes.ServerErrors['COURSE_NOT_FOUND'],
                    'message':'Course not Found!'
                })
            }

            if (err) { 
                return res.status(400).json({
                    'success': false,
                    'err':err,
                    'message':'Error Occured'
                });
            }
            res.json({
                'success':true,
                'obj':courses,
                'pages': Math.ceil(count / perPage),
                'currentPage': page,
                'perPage':perPage
            })
        })
    })
}//getCourses

//---------------------------------------------------------------------
    // getting next and prev course 
//-----------------------------------------------------------------------
getNextPrevCourse = (req,res) =>{
    
    var course_obj = []
    var prev_course = []
    
    this.model.find({'course_details._id':req.body.id})
    .exec((err ,result) =>{
        if(err){
            return res.json({
                'success':false,
                err:err
            })
        }
        if(result == null){
         
            return res.json({
                'success':false,
                message:'Record not found'

            })
        }
        if(result != null){
       
            for (let index1 = 0; index1 < result.length; index1++) {           
                if(result[index1].course_details.length > 0){
                    for (let index = 0; index < result[index1].course_details.length; index++) {
                        if(req.body.id == result[index1].course_details[index]._id   ){
                            var prev_idx = index1 -1 < 0 ?  0 : index -1;
                            var next_idx = Math.min(result[index1].course_details.length-1, index +1); 
                            course_obj.push({video_title:result[index1].course_details[next_idx].video_title, _id:result[index1].course_details[next_idx]._id,video_id:result[index1].course_details[next_idx].video_id,video_description:result[index1].course_details[next_idx].video_description,channel_title:result[index1].course_details[next_idx].channel_title, channel_link:result[index1].course_details[next_idx].channel_link,video_embed_link:result[index1].course_details[next_idx].video_embed_link,video_timestamp:result[index1].course_details[next_idx].video_timestamp,video_thumbnail:result[index1].course_details[next_idx].video_thumbnail},{video_title:result[index1].course_details[prev_idx].video_title,video_id:result[index1].course_details[prev_idx].video_id, _id:result[index1].course_details[prev_idx]._id,video_description:result[index1].course_details[prev_idx].video_description,channel_title:result[index1].course_details[prev_idx].channel_title,channel_link:result[index1].course_details[prev_idx].channel_link,video_thumbnail:result[index1].course_details[prev_idx].video_thumbnail,video_embed_link:result[index1].course_details[prev_idx].video_embed_link,video_timestamp:result[index1].course_details[prev_idx].video_timestamp})
                            if(next_idx == Math.min(result[index1].course_details.length-1) ){
                                course_obj = []
                                prev_idx = next_idx -1 < 0 ?  0 : next_idx -1;
                                prev_course.push({video_title:result[index1].course_details[prev_idx].video_title, _id:result[index1].course_details[prev_idx]._id,video_id:result[index1].course_details[prev_idx].video_id,video_description:result[index1].course_details[prev_idx].video_description,channel_title:result[index1].course_details[prev_idx].channel_title, channel_link:result[index1].course_details[prev_idx].channel_link,video_embed_link:result[index1].course_details[prev_idx].video_embed_link,video_timestamp:result[index1].course_details[prev_idx].video_timestamp,video_thumbnail:result[index1].course_details[prev_idx].video_thumbnail})
                            }
                        }
                       
                                                  
                    }
                }
            }
            if(course_obj.length > 0){
                course_obj = course_obj.filter( function (item ) {
                    if(item._id){
                        return item._id.toString() !== req.body.id

                    }
                });
            }
            res.json({
                'success':true,
                'course_obj':course_obj,
                'prev_course':prev_course
            })
        }
       
    })
}

//---------------------------------------------------------------------
    // remove duplicates function
//-----------------------------------------------------------------------
   removeDuplicates = (originalArray, prop) =>{
    var newArray = [];
    var lookupObject  = {};

    for(var i in originalArray) {
       lookupObject[originalArray[i][prop]] = originalArray[i];
    }

    for(i in lookupObject) {
        newArray.push(lookupObject[i]);
    }
     return newArray;

}//removeDuplicates

//---------------------------------------------------------------------
    // get the course by id
//-----------------------------------------------------------------------
updateCourseById = (req, res) =>{

    var newArr = []
    var videoTitle;
    var videoId;
    var imageView;

    this.model.findOneAndUpdate({'course_details._id':req.body.id 
    } ,{$set:{'course_details.$.video_title':req.body.video_title ,
    'course_details.$.video_embed_link':req.body.video_embed_link,
    'course_details.$.video_timestamp':req.body.video_timestamp.split('\n') }})
    
    .exec((err, data)=>{
   
        if(err) {
            return (err);
        }

        this.model.findOne({'course_details._id':req.body.id })
        .exec((err, data1)=>{

            if(data1 != null){
                if(data1.course_details.length > 0){
                    videoTitle = data1.course_details[0].video_title;
                    if(req.body.video_id){
                        videoId =  req.body.video_id
                    }
                    else{
                        videoId =  data1.course_details[0].video_id;
                        imageView = data1.image_preview;
                        
                    }

                data1.course_details.forEach(element => {

                if(element._id.toString() == req.body.id){

                    var filtered = element.video_timestamp.filter(function (el) {
                        return el != null;
                      });
                      if(filtered.length > 0){
                    for (var i = 0; i < filtered.length; i++) {
                        
                       if(filtered[i].length > 0 ){
                            newArr.push(filtered[i])
                       }
                    }
                    }

                }
            });
        }
            this.model.findOneAndUpdate({'course_details._id':req.body.id },{$set:{
            'course_details.$.video_timestamp':newArr }})
            .populate('user')
            .exec((err, data1)=>{

                if(err) {
                    return (err);
                }
                // var cTitle = data1.course_title.replace(/^\s+|\s+$/g, '');

                // var message = {
                //     app_id: config.ONE_SIGNAL_APP_ID,
                //     headings: {"en":"Course Updated:"+cTitle},
                //     subtitle:{"en":videoId +" ("+data1.user.uid+")" },
                //     contents: {
                //         "en":videoTitle,
                //     },
                //     //include_player_ids: ["2bb51271-f7a4-4a52-a79d-357573da81f9"],
                //     included_segments: ["Subscribed Users"],
                //     data: { "ID": videoId, "udid": data1.user.uid ,"user":data1.user.name},
                //     big_picture: imageView,
                //     large_icon: imageView,
                //     small_icon: imageView
                // };
                // sendNotification(message);
                res.json({
                    'success':true,
                    'message':'updated succesfully'
                })
            })
        }
        })
    
    })


}//updateCourseById

//---------------------------------------------------------------------  
    // Delete Reference by id
//---------------------------------------------------------------------  
deleteCourseById = (req, res) => {
    this.model.update({}, { 
        $pull: { course_details: { _id: req.body.id } } }, { safe: true, multi: true }, (err, obj) => {
      if (obj == null) {
        return res.status(500).json({
          'success': false,
          'err_code': err,
          'message': 'Invalid User Id'
        });
      }
      if (err) {
        return res.status(400).json({
          'success': false,
          'err_code': err,
          'message': 'record not deleted',
          'err': err
        });
      }
      res.status(200).json({
        'success': true,
        'message': 'deleted Successfully'
      });
    });

}//deleteCourseById

//---------------------------------------------------------------------
  // get courses
//---------------------------------------------------------------------
getSelectedCourses = (req,res) =>{

    var arr = []
    //query for getting the whole document sections 
    this.model.find({_id:req.body.id})
    .populate('user')

    //getting section data 
    .exec((err, course) => {
        if(err){
            return res.json({
                'success': false,
                'message': 'Error ',
                "err" :err
            })
        }
        if(course.length == 0){
            return res.json({
                'success': false,
                'message': 'No record Found ',
                "err" :err
            })
        }
        if(course.length > 0){
            for (let index = 0; index < course.length; index++) {
                if( req.body.ids != undefined){

                    for (let index2 = 0; index2 < req.body.ids.length; index2++) {
                        for (let j = 0; j < course[index].course_details.length; j++) {
                            const element = course[index].course_details[j]._id;
                            const element3 = course[index].course_details[j].video_title;
                            const element4 = course[index].course_details[j].video_thumbnail;
                            const element5 = course[index].course_details[j].video_embed_link;
                            const element6 = course[index].course_details[j].video_id;
                            const element7 = course[index].course_details[j].video_description;
                            const element8= course[index].course_details[j].channel_link;
                            const element9= course[index].course_details[j].channel_title;

                            const element1 = req.body.ids[index2];
                        if(element._id.toString() == element1){
                        arr.push({_id: element,video_title:element3,video_thumbnail:element4,video_embed_link:element5,video_id:element6,video_description:element7,channel_title:element9,channel_link:element8})
                        }
                    }
                }
                }
            }    
        }
        res.json({
            'success':true,
            'obj':arr,
            'data':course

        })
    }); // main exec 

 }//get course by id

 //---------------------------------------------------------------------
    // edit course name 
//-----------------------------------------------------------------------
editCourseName = (req,res) => {
    if(req.body.course_name){
        req.body.course_name = req.body.course_name.trim()
        req.body.course_name = req.body.course_name.replace(/\s/g , "-");
        req.body.course_name = req.body.course_name.toLowerCase();
    }

    this.model.findOneAndUpdate({"_id":req.body.id}, {"course_name" : req.body.course_name})
    .exec((err, data)=>{
   
        if(err) {
            return (err);
        }
        if(data ==null){
            return res.json({
                'suucess' : false,
                'message' : 'data not found',
                             
            })
        }
        res.json({
            'success' : true,
            'message':'updated user succesfully!'
        })
    })


}//editCourseName

 //---------------------------------------------------------------------
    // add single or mutiple video in course
//-----------------------------------------------------------------------
addVideoInCourse = (req,res) => {

    //variable
    var url_check; 
    var tags_arr = []
    var VID;
    var courseTitle;
    var imageIcon;
    var vTitle;
    var youTube = new YouTube();
    youTube.setKey('AIzaSyCHQtNWoJOMVm3e6xaZ8mK_Sx1bYcyoxcs');

    if(!req.body.video_link){
        return res.json({
            'success':false,
            'err_code': errorCodes.ServerErrors['MISSING_VIDEO_LINK'],
            'message':'Video link cannot be empty'

        })
    }
     
    // playlist config
    const playlist_credentails = {
        GOOGLE_API_KEY: Config.GOOGLE_API_KEY, 
        PLAYLIST_ITEM_KEY: Config.PLAYLIST_ITEM_KEY
    } 
   
    const ps = new PlaylistSummary(playlist_credentails)
    var match_playlist_url  = req.body.video_link.match(/.*&?list=.*/g)   

    //checking for video url link 
    if(req.body.video_link ){
        if(match_playlist_url!= null){
            
            match_playlist_url.forEach(element => {
             url_check = element;
         });
       
        var  playlistUrl = getYotubePlaylistId(url_check)
        const PLAY_LIST_ID = playlistUrl
         var arr = []
         var creator;

        // getting playlist data
        ps.getPlaylistItems(PLAY_LIST_ID)
             
            .then((data) => {
                this.model.findOne({_id:req.body.id})
                .populate('user')

                    .exec((err, dataaa) =>{
                        if(dataaa != null){

                            courseTitle = dataaa.course_title;
                            if(dataaa.user!= null){
                            creator = dataaa.user.name;
                            }
                            }
                        if(err){
                            return res.json({
                                'success': false,
                                'err_code': errorCodes.ServerErrors['DATA_SAVING_ERR'],
                                'message': 'data is not saved',
                                "err" :err
                            });
                        } 
                        if(dataaa.course_details.length > 0){
                            if(data.items.length > 0){
                            for (let index = 0; index < data.items.length; index++) {
                                var playlist_url  = data.items[index].videoUrl;

                                var video_desc =  data.items[index].description
                                var regExp = /.*(\s((\w.*|[(|0-9]?[0-9]):([0-5]?[0-9]):([0-5]?[0-9])|([0-5]?[0-9]):([0-5]?[0-9]))).*/g
                                var time_regex_output = video_desc.match(regExp);
                                
                                if(time_regex_output == null || time_regex_output == ""){
                                    time_regex_output =[]
                                }
                                if(time_regex_output.length > 0){
                                time_regex_output = time_regex_output.filter(function(item) {
                                    return item !== "\n";
                                  }).map(function(item) {
                                    return item.replace(/\n/g,'');
                                  });
                                }

                                if(time_regex_output.length > 0){
                                  time_regex_output = time_regex_output.filter(function(item) {
                                    return item !== "Lecture Outline";
                                  }).map(function(item) {
                                    return item.replace("Lecture Outline",'');
                                  });
                                }
                               
                                arr.push({ video_description:data.items[index].description ,
                                    video_title: data.items[index].title.toString() ,
                                    video_id:data.items[index].videoId.toString() ,
                                    video_embed_link:playlist_url.replace((/\/watch\?v=/),(/embed/)),
                                    video_thumbnail:youtubeThumbnail(playlist_url).high.url,video_timestamp:time_regex_output,
                                    // channel_title:data.channelTitle, channel_link:'https://www.youtube.com/channel/'+data.channelId
                                })
                                                              
                                }
                                vTitle = data.items[0].title;
                                if(arr.length > 0){
                                imageIcon = arr[0].video_thumbnail;
                                }
                            }
                                
                            }
                            if(dataaa != null){
                            if(dataaa.course_details.length > 0){
                            for (let index = 0; index < dataaa.course_details.length; index++) {
                                const element = dataaa.course_details[index].video_id;
                                arr = arr.filter(function( obj ) {
                                    return obj.video_id !== dataaa.course_details[index].video_id;
                                }); 
                            }
                            VID = dataaa.course_details[0].video_id;

                        }
                    }
                           
                            if(arr.length == 0){
                                return res.json({
                                    'success':false,
                                    'message':'video already exists in course, Try another!'
                                })
                            }
                                                       

                              if(arr.length > 0){
                                    this.model.findOneAndUpdate({_id:req.body.id},{$push:
                                    {'course_details':arr
                                       
                                    
                                }})
                                .exec((err, updatedData) =>{
                                    if(err){
                                        return res.json({
                                            'success': false,
                                            'err_code': errorCodes.ServerErrors['DATA_SAVING_ERR'],
                                            'message': 'data is not saved',
                                            "err" :err
                                        });
                                    }
                                    if(arr.length > 0){

                                        arr.forEach(course => {
           
                                        youTube.getById(course.video_id, function(error, rst) {
                                           if (error) {
                                             console.log(error);
                                           }
                                           else {
                                               if(rst != null){
                                                   rst.items.forEach(item_result => {
                                                       if( course.video_id.toString() == item_result.id ){
                                                           if(item_result.snippet.tags != null){
                                                               tags_arr = []
                                                               item_result.snippet.tags.forEach(elem => {
                                                                   tags_arr.push(elem)
                                                               });
                                                           }
                                                           Course.findOneAndUpdate({'course_details.video_id':course.video_id},{'$set':{'course_details.$.channel_title':item_result.snippet.channelTitle,'course_details.$.channel_link':'https://www.youtube.com/channel/'+item_result.snippet.channelId,'course_details.$.video_tag':tags_arr}})
                                                               .exec((err, up_result) => {
                                                                       if(up_result == null){
                                                                           return res.json({
                                                                               'success': false,
                                                                               'message': 'Record not found!',
                                                                           });
                                                                       }
                                                                       if(err){
                                                                           return res.json({
                                                                               'success': false,
                                                                               'err_code': errorCodes.ServerErrors['DATA_SAVING_ERR'],
                                                                               'message': 'data is not saved',
                                                                               "err" :err
                                                                           });
                                                                       }
                                                                       return
                                                                   })
                                                               }
                                                           });
                                           
                                                       }
                                                   }
                                               })
                                           })
                                          }
                                        //   var cTitle = courseTitle.replace(/^\s+|\s+$/g, '');
                                        //   var message = {
                                        //     app_id: config.ONE_SIGNAL_APP_ID,
                                        //     headings: {"en": cTitle},
                                        //     subtitle:{"en":VID +" ("+dataaa.user.uid+")" },
        
                                        //     contents: {
                                        //         "en": vTitle,
                                        //     },
                                        //     //include_player_ids: ["2bb51271-f7a4-4a52-a79d-357573da81f9"],
                                        //     included_segments: ["Subscribed Users"],
                                        //     data: { "ID": VID, "udid": dataaa.user.uid,"user":creator },
                                        //     big_picture: imageIcon,
                                        //     large_icon: imageIcon,
                                        //     small_icon: imageIcon
                                        // };
                                        // sendNotification(message);
                                    res.json({
                                        'success' :true
                                    })
                                })//updatedData

                              }

                        })
       
                    })//course obj
                
        } //match playlist url check

        else {
            var tags_arr = []
            var time_arr = []
            var bool_one = 0
            var courseTitle;
            var vTitle;
            var VID;
            var thumbnail = youtubeThumbnail(req.body.video_link).high;
            var videoID =  getVideoId(req.body.video_link).id  

            this.model.findOne({_id:req.body.id})
            .populate('user')
            .exec((err,main_obj)=> {
                if(err){
                    return res.json({
                        'success':false,
                        'err':err
                    })
                }  

            if(main_obj != null){
                courseTitle = main_obj.course_title;
                if(main_obj.user != null){
                    creator = main_obj.user.name;

                }
                if(main_obj.course_details.length > 0){
                 main_obj.course_details.forEach(element => {
                    if(element.video_id == videoID){
                        bool_one = 1
                    }
                });
            }
            }

                if(bool_one == 1){
                    return res.json({
                        'success':false,
                        'message':'video already exists in course, Try another!'
                    })
                }
            

                var youTube = new YouTube();
                youTube.setKey('AIzaSyCHQtNWoJOMVm3e6xaZ8mK_Sx1bYcyoxcs');

               
                youTube.getById(videoID, function(error, result) {
                  if (error) {
                    console.log(error);
                  }
                  else {
                    
                    var embed = 'https://www.youtube.com/embed/'+videoID
                    //console.log(JSON.stringify(result, null, 2));
                    result.items.forEach(element => {
                        if(element.snippet.tags != null ){
                            element.snippet.tags.forEach(element => {
                                tags_arr.push(element)
                            });
                        }

                        var video_desc =  element.snippet.description
                        var regExp = /.*(\s((\w.*|[(|0-9]?[0-9]):([0-5]?[0-9]):([0-5]?[0-9])|([0-5]?[0-9]):([0-5]?[0-9]))).*/g
                        var time_regex_output = video_desc.match(regExp);
                        
                        if(time_regex_output == null || time_regex_output == ""){
                            time_regex_output =[]
                        }
                        if(time_regex_output.length > 0){
                        time_regex_output = time_regex_output.filter(function(item) {
                            return item !== "\n";
                          }).map(function(item) {
                            return item.replace(/\n/g,'');
                          });
                        }
                        if(time_regex_output.length > 0){
                          time_regex_output = time_regex_output.filter(function(item) {
                            return item !== "Lecture Outline";
                          }).map(function(item) {
                            return item.replace("Lecture Outline",'');
                          });
                        }
                       
                            vTitle = element.snippet.title;
                            VID = videoID;
                            imageIcon = element.snippet.thumbnails.high.url;
                            Course.findOneAndUpdate({_id:main_obj._id} , {$push:{'course_details':{
                             video_description:element.snippet.description,
                             video_title:element.snippet.title,
                             video_tag:tags_arr,
                             video_id:videoID,
                             video_embed_link:embed,
                             video_thumbnail:element.snippet.thumbnails.high.url,
                             video_timestamp:time_regex_output,
                             channel_title:element.snippet.channelTitle,
                             channel_link:'https://www.youtube.com/channel/'+element.snippet.channelId

                         }}})
                         .exec((err, result) => {

                            if(err){
                                return res.json({
                                    'success': false,
                                    'err_code': errorCodes.ServerErrors['DATA_SAVING_ERR'],
                                    'message': 'data is not saved',
                                    "err" :err
                                });
                            } 
                            User.findOne({_id:main_obj.user})
                            .exec((err, user) => {

                                if(err){
                                    return res.json({
                                        'success': false,
                                        'err_code': errorCodes.ServerErrors['DATA_SAVING_ERR'],
                                        'message': 'data is not saved',
                                        "err" :err
                                    });
                                } 
                                // var cTitle = courseTitle.replace(/^\s+|\s+$/g, '');
                                // var message = {
                                //     app_id: config.ONE_SIGNAL_APP_ID,
                                //     headings: {"en": cTitle},
                                //     subtitle:{"en":VID +" ("+user.uid+")" },
                                //     contents: {
                                //         "en": vTitle,
                                //     },
                                //     //include_player_ids: ["2bb51271-f7a4-4a52-a79d-357573da81f9"],
                                //     included_segments: ["Subscribed Users"],
                                //     data: { "ID": VID, "udid": user.uid,"user":creator },
                                //     big_picture: imageIcon,
                                //     large_icon: imageIcon,
                                //     small_icon: imageIcon
                                // };
                                // sendNotification(message);
                            res.json({
                                'success' :true
                                // 'data':result
                            })
                        })

                        })//result  
                    })
                  
                  }
                
                // });
            // }
                })//main obj
          
            })//else
        }

    }//if video link check

}//addVideoInCourse

//---------------------------------------------------------------------
    // update the postion of the course with id  
//---------------------------------------------------------------------
updateCoursePosition= (req, res) => {
    var obj_id;
    var data = []

    for(let j = 0; j < req.body._id.length; j++) {
      obj_id = req.body._id[j]
    }

    this.model.findOne({_id:req.body._id[0]})  
    .exec((err, obj1) => {

        if(req.body._course_details.length > 0){
        for (let index = 0; index < req.body._course_details.length; index++) {
            if(  obj1.course_details.length > 0){
                for (let index1 = 0; index1 <  obj1.course_details.length; index1++) {
                    const element = obj1.course_details[index1];
                    if(element._id == req.body._course_details[index]){
                        data.push({_id:element._id ,video_description:element.video_description,video_title:
                         element.video_title,video_thumbnail:element.video_thumbnail,
                         video_id:element.video_id,video_timestamp:element.video_timestamp,video_tag:element.video_tag,channel_title:element.channel_title,channel_link:element.channel_link})
                    }
                
                }
                            
            }
        }
       
        if (err) {
            return (err);
        }  

        this.model.findOneAndUpdate({_id:req.body._id[0]},{$set: {'course_details':data}},{new:true})
        .exec((err, obj) => {

            if (err) {
                return (err);
            }

            res.json({
                'success': true,
                'message':'updated succesfully'
                });
            })
        }
        else{
            return res.json({'success':false})
        }    
    });
    
}//updateCoursePosition

//---------------------------------------------------------------------
    // edit course thumbnail
//-----------------------------------------------------------------------
updateCourseThumbnail = (req,res) => {
    if(req.body.image_preview == null || req.body.image_preview == '' ||req.body.image_preview == undefined ){
        req.body.image_preview =  "../images/default.jpg"
    }
        this.model.findOneAndUpdate({'_id':req.body.id},{$set:{'image_preview':req.body.image_preview }})
        .exec((err, obj) =>{
            if(err){
                return res.status(400).json({
                'success': false,
                'err_code': errorCodes.ServerErrors['INVALID_USER_ID'],
                'message': 'Failed to get the data!',
                "err" :err
                });
            } 
            if(obj == null ){
                return res.status(400).json({
                    'success': false,
                    'err_code': errorCodes.ServerErrors['USER_NOT_FOUND'],
                    'message': 'No record Found!',
                });
            }
            res.json({
                'success' : true,
                'message' :'Video Thumbnail Updated sucessfully!'
            })
        })
}

//---------------------------------------------------------------------
    // paginate the courses
//---------------------------------------------------------------------
getPaginationData = (req,res) => {
    const perPage = parseInt(req.query.currentPage )
    const page = parseInt(req.query.page); // Page 
   
    Course.countDocuments().exec(function(err, count) {
      
       if(err) {
         return (err);
       }
   
       Course.find({}).skip((perPage * page) - perPage)

     .limit(perPage)
        .exec((err, courses)=>{

         if (err) { 
              return res.status(400).json({
              'success': false,
              'err_code':err,
              'message':'Result not Found'
              });
          }
          res.json({
            'success':true,
            pages: Math.ceil(count / perPage),
            'courses':courses ,
            currentPage: page,
        })

        })

    })
   
   
}//getPaginationData

//---------------------------------------------------------------------
    // getting courses according to category 
//-----------------------------------------------------------------------
getCourseByCategoryName = (req,res)=> {
    var perPage = parseInt(req.body.perPage || 4)
    const page = parseInt(req.body.page || 1); // Page 
    Categories.findOne({'name' :req.body.name})
    .exec((err ,result) =>{
        if(err){
            return res.json({
                'success':false,
                err:err
            })
        }
        if(result == null){
            return res.json({
                'success':false,
                message:'Record not found'

            })
        }
        if(result != null){
            this.model.find({'cat_id':result._id})
            .exec((err ,obj1) =>{
                if(err){
                    return res.json({
                        'success':false,
                        err:err
                    })
                }
                if(obj1 == null){
                    return res.json({
                        'success':false,
                        message:'Record not found'
            
                    })
                }
                this.model.find({'cat_id':result._id}).skip((perPage * page) - perPage).sort({fav_count:-1})
                .limit(perPage)
                .populate('user')

                .exec((err ,obj) =>{
                    if(err){
                        return res.json({
                            'success':false,
                            err:err
                        })
                    }
                    if(obj == null){
                        return res.json({
                            'success':false,
                            message:'Record not found'
                
                        })
                    }
                    var count = obj1.length;
                    if(obj != null){
                        return res.json({
                            'success':  true,
                            'data':obj,
                            'count':count,
                            'currentPage': page,
                            'pages': Math.ceil(count / perPage),
                            'perPage':perPage

                        })
                    }
                })
    
            })
        }
    })
}//getCourseByCategoryName

//---------------------------------------------------------------------
    // getting courses according to subcategory 
//-----------------------------------------------------------------------
getCourseBySubCategoryName = (req,res)=> {
    var perPage = parseInt(req.body.perPage || 4)
    const page = parseInt(req.body.page || 1); // Page 
    Categories.findOne({'sub_categories.name' :req.body.name})
    .exec((err ,result) =>{
        if(err){
            return res.json({
                'success':false,
                err:err
            })
        }
        if(result == null){
         
            return res.json({
                'success':false,
                message:'Record not found'

            })
        }
        if(result != null){
            var arr = []
            if(result.sub_categories.length > 0){
                result.sub_categories.forEach(element => {
                    if(element.name == req.body.name){
                        arr.push({id:element.id,name:element.name,meta_id:result._id})
                    }
                });
            }
            this.model.find({'cat_id':result._id}).sort({fav_count:-1})
            .populate('user')
            .exec((err ,obj1) =>{
                if(err){
                    return res.json({
                        'success':false,
                        err:err
                    })
                }
                if(obj1 == null){
                    return res.json({
                        'success':false,
                        message:'Record not found'
            
                    })
                }

                if(obj1 != null){
                    var sub_cat_arr = []
                    if(obj1.length > 0){
                        var videoId ;

                        obj1.forEach(element => {
                            if(element.course_details.length > 0){
                                videoId = element.course_details[0].video_id;
                            }
                            if(element.course_sub_category == arr[0].id){
                                sub_cat_arr.push({_id:element._id,video_id:videoId,video_link:element.video_link,course_name:element.course_name,uid:element.uid,user:element.user.name,fav:element.favorite_bool,cat_id:element.cat_id,image_preview:element.image_preview,course_title:element.course_title,course_meta_category:element.course_meta_category,course_sub_category:element.course_sub_category})
                            }
                        });
                    }
                    var count = sub_cat_arr.length;
                    res.json({
                        'success':true,
                        'sub_cat_data':sub_cat_arr,
                        'count':count,
                        'currentPage': page,
                        'pages': Math.ceil(count / perPage),
                        'perPage':perPage
                    })
                }
               
            })
        }
    })
}//getCourseBySubCategoryName

//---------------------------------------------------------------------
    // editDescForCourse
//-----------------------------------------------------------------------
editDescForCourse = (req,res) => {
    if(req.body.video_description){
        req.body.video_description = req.body.video_description.replace(/\n/g, "<br>")
       
    }
    this.model.findOneAndUpdate({'course_details._id':req.body.id} ,{$set:{'course_details.$.video_description':req.body.video_description}})
    .exec((err ,result) =>{
        if(err){
            return res.json({
                'success':false,
                err:err
            })
        }
        if(result == null){
            return res.json({
                'success':false,
                message:'Record not found'

            })
        }
        res.json({
            'success' :true,
            'message':'Desccription updated succesfully!'
        })
    })
}

//---------------------------------------------------------------------
    // get the list of courses
//-----------------------------------------------------------------------
deleteCourse = (req,res) => {
    this.model.findOneAndRemove({_id:req.body.id})
    .exec((err, obj) =>{
        if(obj == null){
            
            return res.status(400).json({
                'success': false,
                'message':'Invalid course Id!'
                });
            }
            if(err){
                return res.status(404).json({
                    'success': false,
                    'err':err,
                    'message':'Failed! Result not Found'
                    });
            }
            if(obj != null){
                res.json({
                    'success':true,
                    'message':'Course deleted successfully!'
                })
            }
    })
}//deleteCourse

//---------------------------------------------------------------------
 // get course id with video id
//-----------------------------------------------------------------------
getCourseIdByVideoId =(req,res) =>{
    var data = []
    this.model.findOne({'course_details.video_id':req.body.video_id})
    .exec((err ,result) =>{
        if(err){
            return res.json({
                'success':false,
                err:err
            })
        }
        if(result == null){
            return res.json({
                'success':false,
                message:'Record not found'

            })
        }
        if(result != null){
            if( result.course_details.length > 0){
                result.course_details.forEach(element => {
                if(element.video_id == req.body.video_id){
                    data.push({_id:element._id,video_id:element.video_id,video_desc:element.video_description,channel_link:element.channel_link,channel_title:element.channel_title})
                }
                });
            }
            res.json({
                'success' :true,
                'data': data
            })
          
        }
       
    })
}//getCourseIdByVideoId

   //---------------------------------------------------------------------
    // get course  according to requested meta category 
//---------------------------------------------------------------------
getCourseMetaCategory =(req,res) => {
 this.model.find(
    {course_meta_category: req.body.course_meta_category},
     
   )
 .exec((err,obj)=>{
     if(err){
         return res.json({
             'success':false,
             'err':err
         })
     }
     res.json({
         'success':true,
         'data':obj
     })

 })
}//getCourseCategory

//---------------------------------------------------------------------
    // edit the course name
//---------------------------------------------------------------------
updateCourseName = (req,res)=> {
    this.model.findOneAndUpdate({
        _id:req.body.id
    },{
        course_title:req.body.course_title
    })
    .exec((err, obj)=>{
        if(err){
            return res.json({
                'success':false,
                'err':err
            })
        }
        res.json({
            'suucess':true,
            'message': 'updated succesfully'
        })
    })

}//updateCourseName

//---------------------------------------------------------------------
    // getting timestamp for a particular video
//---------------------------------------------------------------------
getTimestampsForVideo = (req,res) => {
   
    var timestamp = []
    var time_stamp = []
    var time_data = []
    var bool = false
   
    this.model.findOne({
    $or: [
  
        { 'course_details.video_id':req.query.video_id  },
        {'course_details.video_id':req.body.video_id}
      ]})
    .exec((err, obj) => {
        if(obj == null) {
            return res.status(400).json({
                'success': false,
                'message':'Invalid video Id!'
                });
            }
            if(err){
                return res.status(404).json({
                    'success': false,
                    'err':err,
                    'message':'Failed! Result not Found'
                    });
            }
            if(obj!= null){

                if(obj.course_details.length> 0){
                    obj.course_details.forEach(element => {
                        if(element.video_id == req.query.video_id ||element.video_id == req.body.video_id ){
                            // if(element.video_timestamp.length == 0){
                            // bool = true
                            // }
                            if(element.video_timestamp.length > 0 ){
                                bool = false
                                    timestamp.push({timestamp_details:element.video_timestamp})
                             
                            }
                        
                        }
                    });
                
                }
                if(timestamp.length> 0){
                    var regExp = /((([0-9]?[0-9]):([0-5]?[0-9]):([0-5]?[0-9])|([0-5]?[0-9]):([0-5]?[0-9])))/g
                    timestamp.forEach(element => {
                        element.timestamp_details.forEach(element1 => {
                            var match_elem =  element1.match(regExp)
                            if(match_elem!= null){
                                time_stamp.push(match_elem.toString())
                                time_data.push({time:match_elem.toString()})
                            }
                         
                        });
                        
                        });
                    
                
                }
            // if(bool == true) {
            //     return res.status(200).json({
            //         'success': false,
            //         'message':'No Timestamp Present!',
            //         'data' : timestamp,
            //         'time_stamp':time_stamp,
            //         'time_data':time_data
            //         });
            // }  
            // else{
                res.json({
                    'success':true,
                    'data' : timestamp,
                    'time_stamp':time_stamp,
                    'time_data':time_data
                })
            // }
           
        }
    })
}//getTimestampsForVideo

//---------------------------------------------------------
  //getCourseDetails
//----------------------------------------------------------
getCourseDetails = (req,res) =>{
   
    var section_arr = []
    var videoId = []
    var nonsection = []

    var courseName ;
    var Udid;
    var Fav;
    var userName;

    Course.findOne({
      $or: [
      { 'course_name': req.query.course },
      {'course_details.video_id':req.query.video_id}
      ]
      }).where({uid:req.query.uid})
      .populate('user')
      .exec((err, data)=>{
          if(data != null){
            courseName = data.course_name;
            Udid = data.uid;
            Fav = data.favorite_bool;
            if(data.user != null){
                userName = data.user.name;
              }
            CourseSection.find({complete_course_id:data._id})
            .populate({
                path:'complete_course_id',
                model:'Course'
            })
         
          .exec((err, course_sections) =>{
          if(err){
          return res.json({
             'err':err,
             'success':false
          })
        }
          if(course_sections == null || course_sections.length == 0){
            if(data != null){
              data.course_details.forEach( function (element ,index ) {
                //if(!req.query.video_id ){
                if(index == 0){
                  section_arr.push(element)
                  videoId.push(element.video_id)
                }
               // }

              });
            }
            nonsection.push(data)
            return res.json({'success':true,'section':"no",'nonsections':nonsection  ,'favorite_bool':Fav,'userName':userName,'video_id':videoId[0]})
          }
          if(course_sections != null){
            if(!req.query.video_id || req.query.video_id){
                var test = []
                course_sections.forEach(section_data => {
                    section_data.course_section.forEach(courses =>{
                        courses.course_details.forEach(c_ids => {
                            section_data.complete_course_id.course_details.forEach(data1 => {
                                
                                if(data1._id == c_ids.course_id){
                                    
                                    c_ids.title = data1.video_title
        
                                    courses.course_details.push( {course_id:data1._id ,
                                         _id:c_ids._id ,video_title:c_ids.title,
                                         video_description:data1.video_description,
                                         video_embed_link:data1.video_embed_link,
                                         video_thumbnail:data1.video_thumbnail,
                                         video_id:data1.video_id,
                                         video_timestamp:data1.video_timestamp,
                                         channel_title:data1.channel_title,
                                         channel_link:data1.channel_link})
                                       
                                    courses.course_details = this.removeDuplicates( courses.course_details, "_id");

                                
                                }//if match id
                                if(data.course_details.length > 0){
                                    for( var i= 0 ; i< data.course_details.length; i++){
                                         if(c_ids.course_id.toString() == data.course_details[i]._id ){
                                            data.course_details.splice(i, 1);
                                            data.course_details = this.removeDuplicates(data.course_details , '_id');
                                            section_data.course_section = section_data.course_section.push({'section_name':"Others"});
                                            section_data.course_section = this.removeDuplicates(section_data.course_section , 'section_name');
                                            if(section_data.course_section.length > 0){
                                            section_data.course_section.forEach(myObj => {
                                                if(myObj.section_name == "Others"){
                                                    if(data.course_details.length > 0){
                                                        for (let indeex = 0; indeex < data.course_details.length; indeex++) {
                                                            myObj.course_details.push({"_id":data.course_details[indeex]._id,
                                                               "video_title" : data.course_details[indeex].video_title,
                                                                "video_description" : data.course_details[indeex].video_description,
                                                                "video_thumbnail":data.course_details[indeex].video_thumbnail,
                                                                "channel_title":data.course_details[indeex].channel_title,
                                                                "channel_link":data.course_details[indeex].channel_link,
                                                                "video_embed_link":data.course_details[indeex].video_embed_link,
                                                                'video_id':data.course_details[indeex].video_id,'course_id':data.course_details[indeex]._id})                                                      
                                                            }
                                                        
                                                }
                                                else{
                                                   section_data.course_section = section_data.course_section.filter(item=>item.section_name !="Others" );
                                                }
                                            }
                                            
                                            });
                                        }
                                                                                   
                                        }
    
    
                                    }
    
                                    }
                               
                            });// course id
                          
                        })//course details id
        
                    })//course section data
                    
                  section_data = course_sections;

                })
            }
            res.json(
                { 'success':true,'section':"yes",
               'video_id':videoId[0],
               'data':course_sections,
               'favorite_bool':Fav,
               'course_name':courseName,
               'uid':Udid,
               'userName':userName
           })
          }
          
          })
          
        }
        else{
        } 
          
      })
}//getCourseData
//---------------------------------------------------------
  //edit the course (empty fields)
//----------------------------------------------------------
editEmptyCourseFields = (req,res) =>{
    var youTube = new YouTube();
    var users = [];

    youTube.setKey('AIzaSyCHQtNWoJOMVm3e6xaZ8mK_Sx1bYcyoxcs');
    this.model.findOne(
          { 'course_name': req.query.course },
      ).where({uid:req.query.uid})
    .exec((err, obj) =>{
        if(err){
            return res.json({
                'success':false,
                'err':err
            })
        }
        if(obj == null){
            res.json({
                'success':false,
                'message':'Record not found!'
            })
        }
        if(obj != null){
            if(obj.course_details.length > 0){
                for (let index = 0; index < obj.course_details.length; index++) {
                    const element = obj.course_details[index];
                    youTube.getById(element.video_id, function(error, result) {
                      if (error) {
                        return error;
                        }
                        else {
                            if(result!= null){
                                result.items.forEach(element_obj => {
                                    if(element_obj.id  == obj.course_details[index].video_id){
                                        Course.findOneAndUpdate({'course_details._id':obj.course_details[index]._id},{$set:{'course_details.$.channel_link':'https://www.youtube.com/channel/'+element_obj.snippet.channelId,
                                        'course_details.$.channel_title':element_obj.snippet.channelTitle}})
                                        .exec((err, obj_data) =>{
                                            if (err) throw err;
                                                users.push(obj_data);
                                            return
                                        })
                                    
                                    }
                                })
                            }
                               
                        }
                    
                    })
                }
            }
            res.json({'success':"true" ,'message':'Data updated successfully!'});

        }
    })  
}//editEmptyCourseFields
getSubCatList = (req,res) =>{
    var sub_arr = []

    if(!req.body.cat_id){
        return res.json({
            'success':false,
            'message':'ID not provided',
            'err_code': errorCodes.ServerErrors['INVALID_USER_ID'],

        })
    }
    Course.find({cat_id:req.body.cat_id})
    .populate('cat_id')
    .populate('user')

.exec((err, courses_cat) => {
    if (err) return (err);
    if (courses_cat == null) {
        if (err) {
            return res.json({
            'success':false,
            'message':"No data found!",
            'err_code': errorCodes.ServerErrors['USER_DOES_NOT_EXISTS'],

        });
    }

    }
    if (courses_cat.length > 0) {

        //loopthrough the courses to get categories
        courses_cat.forEach(element => {

            if (element.cat_id != null) {

                if (parseInt(element.cat_id.id) == parseInt(element.course_meta_category)) {
                    element.cat_id.sub_categories.forEach(elem => {
                        if (parseInt(elem.id) == parseInt(element.course_sub_category)) {
                            sub_arr.push({_id:element._id,cat_id:element.cat_id._id,course_title:element.course_title,course_name:element.course_name,uid:element.uid,creator:element.user.name, meta_cat_id: element.cat_id.id, sub_id: elem.id, sub_name: elem.name })
                            sub_arr = this.removeDuplicates(sub_arr, "sub_name");
                       
                        }

                    });
                }
            }
           
        }); //courses_cat

    } //if
    res.status(200).json({
        'success':true,
        'data':sub_arr
    })
})


}

sortByLatestCourses = (req,res) =>{
    const perPage = parseInt(req.query.currentPage || 10 )
    const page = parseInt(req.query.page || 1); // Page 
   
    Course.countDocuments().exec(function(err, count) {
      
       if(err) {
         return (err);
       }
       if(count != null){
       Course.find({user:req.body.user}).skip((perPage * page) - perPage).sort({"_id": -1})

     .limit(perPage)
    .exec((err, course_data) => {
        if (err) return (err);
        if (course_data == null) {
            if (err) {
                return res.json({
                'success':false,
                'message':"No data found!",
                'err_code': errorCodes.ServerErrors['USER_DOES_NOT_EXISTS'],
    
            });
        }
    }
        if(course_data != null){
            res.json({
                'success':true,
                'obj':course_data,
                pages: Math.ceil(count / perPage),
                currentPage: page
            })
        }
    })
}
else{
    res.json({
        'success':false,
        'obj':'Data not present'
    })
}
    })

}

sortBytOldestCourses = (req,res) =>{
    const perPage = parseInt(req.query.currentPage ||10 )
    const page = parseInt(req.query.page ||1 ); // Page 
   
    Course.countDocuments().exec(function(err, count) {
      
       if(err) {
         return (err);
       }
       if(count != null){
   
       Course.find({user:req.body.user}).skip((perPage * page) - perPage).sort({"_id": 1})

     .limit(perPage)
        .exec((err, courses)=>{

         if (err) { 
              return res.status(400).json({
              'success': false,
              'err_code':err,
              'message':'Result not Found'
              });
          }
          if(courses != null){
          res.json({
            'success':true,
            pages: Math.ceil(count / perPage),
            'obj':courses ,
            currentPage: page
        })
    }

        })
    }
    else{
        res.json({
            'success':false,
            'obj':'Data not present'
        })
    }
    })
}

//---------------------------------------------------------------------
    // post google video 
//---------------------------------------------------------------------
postGoogleVideo = (req,res) =>{
    var myarr = []
    if(!req.body.video_link){
        return res.json({
            'success':false,
            'err_code': errorCodes.ServerErrors['MISSING_VIDEO_LINK'],
            'message':'Video link cannot be empty'

        })
    }
    if(!req.body.course_title){
        return res.json({
            'success':false,
            'err_code': errorCodes.ServerErrors['MISSING_COURSE_TITLE'],
            'message':'Course title cannot be empty'

        })
    }
    if(!req.body.image_preview){
        return res.json({
            'success':false,
            'err_code': errorCodes.ServerErrors['MISSING_COURSE_IMAGE'],
            'message':'Course image cannot be empty'

        })
    }
    if(req.body.image_preview){
        var imgRegex = /http(s)?:\/\/(.*)\.(jpe?g|png|bmp)$/gi;
        var imageViewRegex = new RegExp(imgRegex);
        if (req.body.image_preview.match(imageViewRegex)) {
           
        } else {
            return res.json({
                'success':false,
                'err_code': errorCodes.ServerErrors['INVALID_IMAGE_URL'],
                'message':'Invalid Image Url'
    
            })
        }
        
    }
    if(req.body.video_link){

        var googleDriveReg = /http(s)?:\/\/drive.google.com.*/gi;
        var googlePhotoReg = /http(s)?:\/\/lh3.googleusercontent.com.*/gi;
        var kplisLinkRegex = /http(s)?:\/\/app.klipse.co\/embed\/video\/.*/gi;

        var driveRegex = new RegExp(googleDriveReg);
        var photosRegex = new RegExp(googlePhotoReg);
        var kplisRegex = new RegExp(kplisLinkRegex);

        if (req.body.video_link.match(driveRegex)) {
            var parts = req.body.video_link.match(/\/d\/(.+)\//);

            if (parts == null || parts.length < 2) {
              return 
            } else {
              const videoUrl = "https://drive.google.com/uc?export=view&id="+parts[1];

              Course.findOne({
                $or: [
                { 'course_title': req.body.course_title },
                {'video_link':videoUrl}]
                })
                .exec((err, data)=>{
            
                    if(data == null){
                        var coursename = req.body.course_title;
                        coursename = coursename.replace(/\s/g , "-");
                        const obj = new Course({
                            video_link: videoUrl,
                            course_title: req.body.course_title,
                            course_meta_category: req.body.course_meta_category,
                            course_sub_category: req.body.course_sub_category,
                            cat_id : req.body.cat_id,
                            course_name:coursename.toLowerCase(),
                            user:req.body.user,
                            image_preview:req.body.image_preview,
                            g_course:"true"

                    
                        });
                        //saving category data 
                        obj.save((err, main_obj) => {
                            if(err){
                                return res.json({
                                'success': false,
                                'err_code': errorCodes.ServerErrors['DATA_SAVING_ERR'],
                                'message': 'data is not saved',
                                "err" :err
                                });
                            } 
                            if(main_obj!= null){
                               
                                Course.findOneAndUpdate({_id:main_obj._id},
                                     {$push:{'course_details':{video_id:parts[1],video_thumbnail:req.body.image_preview,
                                        video_description: "...",
                                        video_title:main_obj.course_title,
                                        video_embed_link:main_obj.video_link,
                                        channel_link:"",
                                        channel_title:""
                                        }}})
                                .populate('user')
                                .exec((err, result)=>{
                                    if(err){
                                        return res.json({
                                        'success': false,
                                        'err_code': errorCodes.ServerErrors['DATA_SAVING_ERR'],
                                        'message': 'data is not saved',
                                        "err" :err
                                        });
                                    }
                                    if(result == null){
                                        return res.json({
                                            'success': false,
                                            'err_code': errorCodes.ServerErrors['USER_DOES_NOT_EXISTS'],
                                            'message': 'Not Found'
                                        });
                                    }
                                    if(result != null){
                                        if(result.user != null){
                                            Course.findOneAndUpdate({_id:main_obj._id},{uid:result.user.uid }
                                               )
                                            .populate('user')
                                            .exec((err, data)=>{

                                                if(err){
                                                    return res.json({
                                                    'success': false,
                                                    'err_code': errorCodes.ServerErrors['DATA_SAVING_ERR'],
                                                    'message': 'data is not saved',
                                                    "err" :err
                                                    });
                                                }
                                                if(data == null){
                                                    return res.json({
                                                        'success': false,
                                                        'err_code': errorCodes.ServerErrors['USER_DOES_NOT_EXISTS'],
                                                        'message': 'Not Found'
                                                    
                                                    });
                                                }
                                                res.json({
                                                    'success': true,
                                                    'data':data
                                                })
                                            })
                                        }
                                        else{
                                            return res.json({
                                                'success': false,
                                                'err_code': errorCodes.ServerErrors['USER_DOES_NOT_EXISTS'],
                                                'message': 'Not Found'
                                            }); 
                                        }
                                    }
                                })
                          //  }//else
                        }//main obj
                            
                        })
                }
                else {
                    if(data != null){
                        if(data.course_title == req.body.course_title){
                            return res.json({
                                'success' : false,
                                'err_code': errorCodes.ServerErrors['ALREADY_TAKEN'],
                                'message':'Course Name Already Taken '
                            }) 
                        }
                        else {
                            return res.json({
                                'success' : false,
                                'err_code': errorCodes.ServerErrors['ALREADY_EXISTS'],
                                'message':'Course Already Exists'
                            })
                        }
                        
                    }
                    
                }
   
            })
            }
        }
        else if(req.body.video_link.match(photosRegex)){
            console.log("Successful google photos match");
        }
        else if(req.body.video_link.match(kplisRegex)){
            var parts = req.body.video_link.match(/video\/(.+)/);
            if (parts == null || parts.length < 2) {
                return
            } else {
                const url = "https://app.klipse.co/embed/video/" + parts[1];

                Course.findOne({
                    $or: [
                    { 'course_title': req.body.course_title },
                    {'video_link':url}]
                    })
                    .exec((err, data)=>{
                
                        if(data == null){
                            var coursename = req.body.course_title;
                            coursename = coursename.replace(/\s/g , "-");
                            const obj = new Course({
                                video_link: url,
                                course_title: req.body.course_title,
                                course_meta_category: req.body.course_meta_category,
                                course_sub_category: req.body.course_sub_category,
                                cat_id : req.body.cat_id,
                                course_name:coursename.toLowerCase(),
                                user:req.body.user,
                                image_preview:req.body.image_preview,
                                kplis_course:"true"
                        
                            });
                            //saving category data 
                            obj.save((err, main_obj) => {
                                if(err){
                                    return res.json({
                                    'success': false,
                                    'err_code': errorCodes.ServerErrors['DATA_SAVING_ERR'],
                                    'message': 'data is not saved',
                                    "err" :err
                                    });
                                } 
                                if(main_obj!= null){
                                   
                                    Course.findOneAndUpdate({_id:main_obj._id},
                                         {$push:{'course_details':{video_id:parts[1],video_thumbnail:req.body.image_preview,
                                            video_description: "...",
                                            video_title:main_obj.course_title,
                                            video_embed_link:main_obj.video_link,
                                            channel_link:"",
                                            channel_title:""
                                            }}})
                                    .populate('user')
                                    .exec((err, result)=>{
                                        if(err){
                                            return res.json({
                                            'success': false,
                                            'err_code': errorCodes.ServerErrors['DATA_SAVING_ERR'],
                                            'message': 'data is not saved',
                                            "err" :err
                                            });
                                        }
                                        if(result == null){
                                            return res.json({
                                                'success': false,
                                                'err_code': errorCodes.ServerErrors['USER_DOES_NOT_EXISTS'],
                                                'message': 'Not Found'
                                            });
                                        }
                                        if(result != null){
                                            if(result.user != null){
                                                Course.findOneAndUpdate({_id:main_obj._id},{uid:result.user.uid }
                                                   )
                                                .populate('user')
                                                .exec((err, data)=>{
    
                                                    if(err){
                                                        return res.json({
                                                        'success': false,
                                                        'err_code': errorCodes.ServerErrors['DATA_SAVING_ERR'],
                                                        'message': 'data is not saved',
                                                        "err" :err
                                                        });
                                                    }
                                                    if(data == null){
                                                        return res.json({
                                                            'success': false,
                                                            'err_code': errorCodes.ServerErrors['USER_DOES_NOT_EXISTS'],
                                                            'message': 'Not Found'
                                                        
                                                        });
                                                    }
                                                    res.json({
                                                        'success': true,
                                                        'data':data
                                                    })
                                                })
                                            }
                                            else{
                                                return res.json({
                                                    'success': false,
                                                    'err_code': errorCodes.ServerErrors['USER_DOES_NOT_EXISTS'],
                                                    'message': 'Not Found'
                                                }); 
                                            }
                                        }
                                    })
                                // }//else
                            }//main obj
                                
                            })
                    }
                    else {
                        if(data != null){
                            if(data.course_title == req.body.course_title){
                                return res.json({
                                    'success' : false,
                                    'err_code': errorCodes.ServerErrors['ALREADY_TAKEN'],
                                    'message':'Course Name Already Taken '
                                }) 
                            }
                            else {
                                return res.json({
                                    'success' : false,
                                    'err_code': errorCodes.ServerErrors['ALREADY_EXISTS'],
                                    'message':'Course Already Exists'
                                })
                            }
                            
                        }
                        
                    }
       
                })
            }
            
        }
        else {
            console.log("No match");
        }
    }

}

addMoreKplisCourse = (req,res) =>{
    if(!req.body.id){
        return res.json({
            'success':false,
            'err_code': errorCodes.ServerErrors['INVALID_USER_ID'],
            'message':'ID cannot be empty'

        })
    }
    if(!req.body.course_details){
        return res.json({
            'success':false,
            'err_code': errorCodes.ServerErrors['MISSING_COURSE_DATA'],
            'message':'Course Details cannot be empty'

        })
    }
    if(req.body.course_details){
       this.model.findOneAndUpdate({_id:req.body.id},{$push:{course_details:req.body.course_details}})
       .populate('user')
       .exec((err, result)=>{
           if(err){
               return res.json({
               'success': false,
               'err_code': errorCodes.ServerErrors['DATA_SAVING_ERR'],
               'message': 'data is not saved',
               "err" :err
               });
           }
           if(result == null){
               return res.json({
                   'success': false,
                   'err_code': errorCodes.ServerErrors['USER_DOES_NOT_EXISTS'],
                   'message': 'Not Found'
               });
           }
           res.json({
               'success':true,
               'data':result
           })
        })
    }
    else{
        return res.json({
            'success': false,
            'err_code': errorCodes.ServerErrors['USER_DOES_NOT_EXISTS'],
            'message': 'Not Found'
        });
    }
}


addGoogleVideo = (req,res) =>{

    if(!req.body.id){
        return res.json({
            'success':false,
            'err_code': errorCodes.ServerErrors['INVALID_USER_ID'],
            'message':'ID cannot be empty'

        })
    }
    if(!req.body.course_details){
        return res.json({
            'success':false,
            'err_code': errorCodes.ServerErrors['MISSING_COURSE_DATA'],
            'message':'Course Details cannot be empty'

        })
    }
    if(req.body.course_details){
       this.model.findOneAndUpdate({_id:req.body.id},{$push:{course_details:req.body.course_details}})
       .populate('user')
       .exec((err, result)=>{
           if(err){
               return res.json({
               'success': false,
               'err_code': errorCodes.ServerErrors['DATA_SAVING_ERR'],
               'message': 'data is not saved',
               "err" :err
               });
           }
           if(result == null){
               return res.json({
                   'success': false,
                   'err_code': errorCodes.ServerErrors['USER_DOES_NOT_EXISTS'],
                   'message': 'Not Found'
               });
           }
           res.json({
               'success':true,
               'data':result
           })
        })
    }
    else{
        return res.json({
            'success': false,
            'err_code': errorCodes.ServerErrors['USER_DOES_NOT_EXISTS'],
            'message': 'Not Found'
        });
    }
}

addGoogleeVideo = (req,res) =>{

    if(!req.body.id){
        return res.json({
            'success':false,
            'err_code': errorCodes.ServerErrors['INVALID_USER_ID'],
            'message':'ID cannot be empty'

        })
    }
    if(!req.body.course_details){
        return res.json({
            'success':false,
            'err_code': errorCodes.ServerErrors['MISSING_COURSE_DATA'],
            'message':'Course Details cannot be empty'

        })
    }
    if(req.body.course_details){
       this.model.findOneAndUpdate({_id:req.body.id},{$push:{course_details:req.body.course_details}})
       .populate('user')
       .exec((err, result)=>{
           if(err){
               return res.json({
               'success': false,
               'err_code': errorCodes.ServerErrors['DATA_SAVING_ERR'],
               'message': 'data is not saved',
               "err" :err
               });
           }
           if(result == null){
               return res.json({
                   'success': false,
                   'err_code': errorCodes.ServerErrors['USER_DOES_NOT_EXISTS'],
                   'message': 'Not Found'
               });
           }
           res.json({
               'success':true,
               'data':result
           })
        })
    }
    else{
        return res.json({
            'success': false,
            'err_code': errorCodes.ServerErrors['USER_DOES_NOT_EXISTS'],
            'message': 'Not Found'
        });
    }
}

sortByFavorites = (req,res) => {

    var perPage = parseInt(req.query.currentPage || 10)
    const page = parseInt(req.query.page || 1); // Page 

    Course.countDocuments().exec(function(err, count) {
        if (err) return (err);
            if(count != null){
                Course.find({}).skip((perPage * page) - perPage).sort({'fav_count':-1})
                    .limit(perPage)

                .exec((err, courses) => {
                    if (err) return (err);
                    if(courses != null){
                        res.json({
                            'success':true,
                            'obj':courses,
                            'pages': Math.ceil(count / perPage),
                            'currentPage':page
                        })
                    }
                })
            }
            else{
                res.json({
                    'success':false,
                    'obj':'Data not found'
                })
            }
        })

    }

}//CourseController

function sendNotification(message: { app_id: string; contents: { en: string; };included_segments: string[]; }) {
    // throw new Error('Function not implemented.');
    var headers = {
     "Content-Type": "application/json; charset=utf-8",
     "Authorization": "Basic ZmNhYWYyMTAtYmQzMC00NTU3LWEzMzctZDg0M2EzMjcxOTdl"
 };
 
 var options = {
     host: "onesignal.com",
     port: 443,
     path: "/api/v1/notifications",
     method: "POST",
     headers: headers
 };
 
 var https = require('https');
 var req = https.request(options, function(res) {
     res.on('data', function(data) {
         //console.log("Response:");
        // console.log(JSON.parse(data));
     });
 });
 
 req.on('error', function(e) {
     console.log("ERROR:");
     console.log(e);
 });
 
 req.write(JSON.stringify(message));
 req.end();
 }
 
 