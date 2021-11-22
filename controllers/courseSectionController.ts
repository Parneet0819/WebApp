import CourseSection from '../models/course_section';
import errorCodes from '../logs/err_codes';

import Course from '../models/courses';

export default class CourseSectionController {

    model = CourseSection;
    courses = Course;

//---------------------------------------------------------------------
    // add the section to playlist
//---------------------------------------------------------------------
    addCourseSection = (req,res) => {
        
        var course_section = []
        var course_ids = []
      
        for(var i = 0; i<req.body.course_section.length; i++) {
           
            var sectionName = req.body.course_section[i].section_name
            
            if(req.body.course_section[i].course_details){
                course_ids = []
                for(var j=0;j<req.body.course_section[i].course_details.length; j++){
                    var idd = req.body.course_section[i].course_details[j].course_id
                    course_ids.push({course_id:idd})

                }//nested for loop 

                course_section.push({section_name:sectionName ,course_details:course_ids})
           
            }//if

        }//main for loop 
   
        // checking for user existence
        this.model.findOne({ complete_course_id: req.body.complete_course_id })
        
        .exec((err, user) => {
            if (err) { return console.error(err); }
            
            if (user) {
              
                this.model.findOneAndUpdate({_id:req.body.id},{$set:{'course_section':course_section ,complete_course_id:req.body.complete_course_id}})
                .exec((err, result) =>{
                    if(err){
                        return res.json({
                            'success':false,
                            'error': err
                        })
                    }
                    res.json({
                        'success':true,
                        'data':result
                    })
                })
            } 
            else{

                //adding the Section object
                const obj = new CourseSection({
                    course_section:course_section,
                    complete_course_id :req.body.complete_course_id
                });

                //saving course section data 
                obj.save((err, course_section) => {
                    if(err){
                        return res.json({
                            'success': false,
                            'err_code': errorCodes.ServerErrors['DATA_SAVING_ERR'],
                            'message': 'data is not saved',
                            "err" :err
                        });
                    }
     
                    res.json({
                        'success': true,
                        'data': course_section
                    });
                });//course section obj 
            
            }//else

        });//exec

    }//add course section

//---------------------------------------------------------------------
    // get all section courses data
//---------------------------------------------------------------------
    getCourseSectionList = (req,res) => {

       //query for getting the whole document sections 
        this.model.find({})

        .populate({
            path:'complete_course_id',
            select:'course_details',
           
        })
     
        //getting section data 
        .exec((err, course_sections) => {
            if(err){
                return res.json({
                    'success': false,
                    'message': 'Error ',
                    "err" :err
                })
            }
            if(course_sections.length == 0){
                return res.json({
                    'success': false,
                    'message': 'No record Found ',
                    "err" :err
                })
            }
            //looping through response 
            course_sections.forEach(section_data => {
                section_data.course_section.forEach(courses =>{
                    courses.course_details.forEach(c_ids => {
                        section_data.complete_course_id.course_details.forEach(data => {
                            
                            if(data._id == c_ids.course_id){
                                
                                c_ids.title = data.video_title

                                courses.course_details.push( {course_id:data._id , _id:c_ids._id ,video_title:c_ids.title,video_description:data.video_description,video_embed_link:data.video_embed_link,video_thumbnail:data.video_thumbnail,video_id:data.video_id,video_timestamp:data.video_timestamp})
                                   
                                courses.course_details = this.removeDuplicates( courses.course_details, "_id");

                                // console.log("=== courses.course_details", courses.course_details)
                            
                            }//if match id
                           
                        });// course id
                      
                    })//course details id

                })//course section data
                
              section_data = course_sections
                
            })//course response data loop
            res.json({
                'success':true,
                'data':course_sections
            })
        }); // main exec 

    }//getCourseSectionList   

//---------------------------------------------------------------------
  // get particular section video
//--------------------------------------------------------------------- 
getParticularSection = (req,res) =>{
    var section_videos = []

    this.model.findOne({'course_section._id':req.params.id})
    .exec((err, obj)=>{
        if(obj== null){
            return res.status(500).json({
                'success' : false,
                'message': 'Invalid User Id'

            })
        }
        if(obj != null){
            obj.course_section.forEach(element => {
                if(element._id == req.params.id){
                        Course.findOne({'_id':obj.complete_course_id})
                        .exec((err, obj1)=>{
                            if(obj1== null){
                                return res.status(500).json({
                                    'success' : false,
                                    'message': 'Invalid User Id'
                    
                                })
                            }
                            if(obj1 != null){
                                obj1.course_details.forEach(elm => {
                                    element.course_details.forEach(element1 => {
                                        if(elm._id == element1.course_id){
                                        section_videos.push({_id:element1._id,course_id:elm._id,video_title:elm.video_title,video_thumbnail:elm.video_thumbnail,video_embed_link:elm.video_embed_link,video_id:elm.video_id})

                                        }
                                    });
                                });
                                return res.json({
                                    'success':true,
                                    'obj':section_videos
                                })
                            }
                   
                    });//course exec

                }//if
                
            });//obj for loop 
           
        }//obj

    })//exec

}//getParticularSection

//---------------------------------------------------------------------
    // get requested section
//-----------------------------------------------------------------------
getRequestedSection = (req,res) =>{
    var courseId = req.body.course_id;
    var result ;
    var arr = []
    var section_arr = []
    const perPage = parseInt(req.body.currentPage || 6 )
    const page = parseInt(req.body.page || 1); // Page 
    var offset = (page - 1) * perPage;

    this.model.find({complete_course_id:req.body.complete_course_id})
    .populate({
        path:'complete_course_id',
        select:'course_details'
    })
    .populate({
        path: 'complete_course_id',
        populate: {
            path: 'user',
            model: 'User'
        }
    })
 
    //getting section data 
    .exec((err, course_sections) => {
        if(err){
            return res.json({
                'success': false,
                'message': 'Error ',
                "err" :err
            })
        }
        if(course_sections.length == 0){
            return res.json({
                'success': false,
                'message': 'No record Found ',
                "err" :err
            })
        }
        if(course_sections.length > 0){
            course_sections.forEach(section_data => {
                if( section_data.course_section.length> 0){
                    result =  section_data.course_section.filter(courses =>{
                        var y =  courses.course_details.filter(c_ids => {
                            if(c_ids.course_id == courseId)  {
                                return arr.push(courses._id)
                            }
                        })
                        return arr
                    })
                }
                 
            })      
        }  
        if(arr.length > 0){
            this.model.findOne({'course_section._id':arr[0]})
            .populate({
                path:'complete_course_id',
                select:'course_details'
            })
            //getting section data 
            .exec((err, section) => {
                if(err){
                    return res.json({
                        'success': false,
                        'message': 'Error ',
                        "err" :err
                    })
                }
                if(section.length == 0){
                    return res.json({
                        'success': false,
                        'message': 'No record Found ',
                        "err" :err
                    })
                }
                if(section!= null){
                    if( section.course_section.length > 0){
                        section.course_section.forEach(courses =>{
                            if(courses._id.toString() == arr[0].toString())  {
                                if( section.complete_course_id.course_details.length > 0){
                                    section.complete_course_id.course_details.forEach(data => {
                                        courses.course_details.forEach(function (c_ids ,index) {
                                            if(c_ids.course_id == data._id){
                                                return  section_arr.push({_id:data._id,video_title:data.video_title,video_description:data.video_description,video_thumbnail:data.video_thumbnail,video_id:data.video_id,video_embed_url:data.video_embed_url,channel_link:data.channel_link,channel_title:data.channel_title,video_timestamp:data.video_timestamp})
                                            }//if match id
                                        
                                        })//course details id
                                
                                    });// course id
                                }
                            }
                          
                        })//course section data
                    }
                }
                var paginatedItems = section_arr.slice(offset).slice(0, perPage);
                var total_pages = Math.ceil(section_arr.length / perPage);


                res.json({
                    'success':true,
                    'page': page,
                    'per_page': perPage,
                    'pre_page': page - 1 ? page - 1 : null,
                    'next_page': (total_pages > page) ? page + 1 : null,
                    'total': section_arr.length,
                    'total_pages': total_pages,
                    'obj':paginatedItems
                })  
            })
           
        }      
    })
}

//---------------------------------------------------------------------
    // update the postion of the section with id  
//---------------------------------------------------------------------
updateSectionPosition= (req, res) => {
    var obj_id;
    var data = []
    var course_ids = []

    for(let j = 0; j < req.body._id.length; j++) {
      obj_id = req.body._id[j]
    }
    this.model.findOne({'course_section._id':req.body._id[0]})  
    .exec((err, obj1) => {
        if (err) {
            return (err);
        } 
        if(obj1 != null){
      if(obj1.course_section.length > 0){
        for(var i = 0; i<obj1.course_section.length; i++) {
           
            // course_section = []
            var sectionName = obj1.course_section[i].section_name
            var _id = obj1.course_section[i]._id
            if(obj1.course_section[i].course_details.length > 0){
             

                    for (let index = 0; index < req.body.course_ids.length; index++) {
                        for(var j=0;j<obj1.course_section[i].course_details.length; j++){
                            var idd = obj1.course_section[i].course_details[j].course_id
                            var __id = obj1.course_section[i].course_details[j]._id
                            if(_id == req.body._id[0]){
                                data.push(_id)
                            if(idd == req.body.course_ids[index].toString()) {
                                course_ids.push({_id:__id , course_id:req.body.course_ids[index] })
        
                      
                            }
                        }
                    }
                   
                }//nested for loop 

           
            }//if

        }//main for loop 
    }
    this.model.findOneAndUpdate({'course_section._id':data[0]},{$set: {'course_section.$.course_details':course_ids}},{new:true})
    .exec((err, data) => {

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
        return res.json({
            'success': false
        });
    }  
   
 })
    
}//updateCoursePosition

//---------------------------------------------------------------------
    // remove duplicates (Custom Function)
//---------------------------------------------------------------------
    removeDuplicates = (originalArray, prop) => {
        
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
    // get the particular section with id 
//---------------------------------------------------------------------
    getSingleCourseSection = (req,res) =>{
       //query for getting the whole document sections 
       this.model.find({_id:req.body.id})

       .populate({
           path:'complete_course_id',
           select:'course_details',
       })
    
       //getting section data 
       .exec((err, course_sections) => {
           if(err){
               return res.json({
                   'success': false,
                   'message': 'Error ',
                   "err" :err
               })
           }
           if(course_sections.length == 0){
               return res.json({
                   'success': false,
                   'message': 'No record Found ',
                   "err" :err
               })
           }
           //looping through response 
           course_sections.forEach(section_data => {
               section_data.course_section.forEach(courses =>{
                   courses.course_details.forEach(c_ids => {
                       section_data.complete_course_id.course_details.forEach(data => {
                           
                           if(data._id == c_ids.course_id){
                               
                               c_ids.title = data.video_title
                               // console.log("==true" , c_ids.title )

                               courses.course_details.push( {course_id:data._id , _id:c_ids._id ,video_title:c_ids.title,video_description:data.video_description,video_embed_link:data.video_embed_link,video_thumbnail:data.video_thumbnail,video_id:data.video_id,video_timestamp:data.video_timestamp})
                                  
                               courses.course_details = this.removeDuplicates( courses.course_details, "_id");

                           
                           }//if match id
                          
                       });// course id
                     
                   })//course details id

               })//course section data
               
             section_data = course_sections
               
           })//course response data loop
           res.json({
               'success':true,
               'data':course_sections
           })
       }); // main exec 
 
    }//get course by id

//---------------------------------------------------------------------
  // get the particular section with course id 
//---------------------------------------------------------------------
getSectionWithCourseId = (req,res) =>{
    
    var list = req.query.list
    this.model.find({complete_course_id:list})

    .populate({
        path:'complete_course_id',
        select:'course_details',
    })
    .populate({
        path: 'complete_course_id',
        populate: {
            path: 'user',
            model: 'User'
        }
    })

    //getting section data 
    .exec((err, course_sections) => {
        if(err){
            return res.json({
                'success': false,
                'message': 'Error ',
                "err" :err
            })
        }
        if(course_sections.length == 0){
            return res.json({
                'success': false,
                'message': 'No record Found ',
                "err" :err
            })
        }
        //looping through response 
        course_sections.forEach(section_data => {
            section_data.course_section.forEach(courses =>{
                courses.course_details.forEach(c_ids => {
                    section_data.complete_course_id.course_details.forEach(data => {
                        
                        if(data._id == c_ids.course_id){
                            
                            c_ids.title = data.video_title

                            courses.course_details.push( {course_id:data._id , _id:c_ids._id ,video_title:c_ids.title,video_description:data.video_description,video_embed_link:data.video_embed_link,video_thumbnail:data.video_thumbnail,video_id:data.video_id,video_timestamp:data.video_timestamp})
                               
                            courses.course_details = this.removeDuplicates( courses.course_details, "_id");

                        
                        }//if match id
                       
                    });// course id
                  
                })//course details id

            })//course section data
            
          section_data = course_sections
            
        })//course response data loop
        res.json({
            'success':true,
            'data':course_sections
        })
    }); // main exec 

 }//getSectionWithCourseId

 //---------------------------------------------------------------------
  // get the particular section with course id (req in body)
//---------------------------------------------------------------------
getSectionWithCoId = (req,res) =>{

    this.model.find({complete_course_id:req.body.complete_course_id})

    .populate({
        path:'complete_course_id',
        select:'course_details',
    })

    .populate({
        path: 'complete_course_id',
        populate: {
            path: 'user',
            model: 'User'
        }
    })
 
    //getting section data 
    .exec((err, course_sections) => {
        if(err){
            return res.json({
                'success': false,
                'message': 'Error ',
                "err" :err
            })
        }
        if(course_sections.length == 0){
            return res.json({
                'success': false,
                'message': 'No record Found ',
                "err" :err
            })
        }
        //looping through response 

        if(course_sections.length > 0){
            course_sections.forEach(section_data => {
                if( section_data.complete_course_id.course_details.length > 0){
              section_data.complete_course_id.course_details.forEach(data => {
                if( section_data.course_section.length> 0){
                section_data.course_section.forEach(courses =>{
                    courses.course_details.forEach(c_ids => {
                            
                        if(c_ids.course_id == data._id)  {
                            c_ids.title = data.video_title
                            courses.course_details = courses.course_details.push( {course_id:data._id,_id:c_ids._id ,video_title:c_ids.title,video_description:data.video_description,video_embed_link:data.video_embed_link,video_thumbnail:data.video_thumbnail,video_id:data.video_id,video_timestamp:data.video_timestamp,channel_link:data.channel_link,channel_title:data.channel_title})
    
                        }//if match id
                           
                        });// course id
                        courses.course_details = this.removeDuplicates( courses.course_details, "_id");
    
                      
                    })//course details id
                }
    
                })//course section data
            }
                
              section_data = course_sections
                
            })//course response data loop
        }
        res.json({
            'success':true,
            'data':course_sections
        })
    }); // main exec 

 }//getSectionWithCId

//---------------------------------------------------------------------
  // update the section
//---------------------------------------------------------------------
    updateSectionData = (req, res) => {

        if(req.body.id){
            this.model.update({ "course_section._id": req.body.id },
            { "$set": {'course_section.$.section_name':req.body.section_name 
            }},
            {multi: true}
            )
            .exec((err, update_section) => {
            
                if (err) {
                return console.error(err);
                }

                this.model.findOne({'course_section._id':req.body.id})
            
                .exec((err, result) => {
                    if (err) {
                        return console.error(err);
                    }
            
                    this.model.findOneAndUpdate( {'course_section.course_details.course_id':req.body.course_id},{ 
                    $pull: { 'course_section.$.course_details': { course_id: req.body.course_id } } },
                    { new:true}, (err, data) => {
                        if (err) {
                            return console.error(err);

                        }
            
                        if(req.body.course_id){
                            this.model.update({ 'course_section._id': req.body.id },
                            {'$push': {
                                "course_section.$.course_details": {
                                'course_id': req.body.course_id,
                                }
                            }},
                            {multi: true}
                            )
                            .exec((err, updated_section) => {
                                if (err) {
                                    return console.error(err);
                                }
                            });
                        }//if

                    })//data exec
            
                    res.json({
                        'success': true,
                        'message': 'Section updated succesfully',
                        'data': update_section
                    });

                })//resul exec
            
            })// update_section exec

        }//main if 

        if(req.body.main_id){
            var course_section = []
            var course_ids = []
          
            for(var i = 0; i<req.body.course_section.length; i++) {
               
                var sectionName = req.body.course_section[i].section_name
                
                if(req.body.course_section[i].course_details){
                    course_ids = []

                    for(var j=0;j<req.body.course_section[i].course_details.length; j++){
                        var idd = req.body.course_section[i].course_details[j].course_id
                        course_ids.push({course_id:idd})
    
                    }//nested for loop 
    
                    course_section.push({section_name:sectionName ,course_details:course_ids})
               
                }//if
            }
        
    
            // }//main for loop
            this.model.findOneAndUpdate({_id:req.body.main_id} , { $push: {'course_section':course_section 
        }},
        {multi: true})
        .exec((err, add_section) => {
            
            if (err) {
            return console.error(err);
            }
            res.json({
                'success':true,
                "message":'data added succesfully!'
            })
        })

        }

    } //updateSectionData

  //---------------------------------------------------------------------
  // remove the course video from section
//--------------------------------------------------------------------- 
removeSectionVideo = (req,res) => {

    this.model.findOneAndUpdate( {'course_section.course_details.course_id':req.body.course_id},{ 
        $pull: { 'course_section.$.course_details': { course_id: req.body.course_id } } }, { new:true}, (err, obj) => {
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
}  

//---------------------------------------------------------------------
  // remove the complete one course section 
//--------------------------------------------------------------------- 
removeSection = (req,res) => {

    this.model.findOneAndUpdate( {'_id':req.body.id},{ 
        $pull: { 'course_section': { _id: req.body.idd } } }, { new:true}, (err, obj) => {
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

}  //removeSection

//---------------------------------------------------------------------
  // get Courses
//--------------------------------------------------------------------- 
getCourses = (req,res) =>{

    Course.findOne({_id:req.body.id})
    .populate('user')

    .exec((err, obj) => {
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
            'data': obj
        });
    })

}// getCourses

//---------------------------------------------------------------------
  // delete the section video and course video 
//--------------------------------------------------------------------- 
deleteSectionAndCourseVideo = (req,res) => {
    this.model.findOne({ 'complete_course_id': req.body.id })
    .exec((err, obj) => {
        obj.course_section.forEach(element => {

            element.course_details.forEach(element1 => {

                if(element1.course_id == req.body.course_id){
                    this.model.update( 
                        {'course_section.course_details.course_id':req.body.course_id}, 
                         {"$pull":{"course_section.$.course_details":{course_id:req.body.course_id}}}, 
                        {"multi": true})                       
                        .exec((err, view_res) => {
                        if(err){
                           return res.status(400).json({
                            'success': false,
                            'err_code': err,
                            'message': 'record not deleted',
                            'err': err
                            });  
                        }
                    })
                }
                    
            });
        });
        Course.findOneAndUpdate({_id:req.body.id},
            {"$pull":{"course_details":{_id:req.body.course_id}}}, 
            {"new": true})
            .exec((err,obj1) => {
                 
                if (err) {
                    return res.status(400).json({
                        'success': false,
                        'err_code': err,
                        'message': 'record not deleted',
                        'err': err
                    });
                }
                res.json({
                    'success':true,
                    'message':'deleted succesfully'
                })
            })
        })

    }

}//CourseSection Controller    