'use strict';

import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as mongoose from 'mongoose';
import * as path from 'path';
import config from './config/config'
import setRoutes from './routes';
import User from './models/user';
import Course from './models/courses';
import Categories from './models/categories';
import errorCodes from './logs/err_codes';
import Favorites from './models/favorites'
import CourseSection from './models/course_section';

const engine             = require('ejs-mate');
const url                = require('url');
const session            = require('express-session');
const favicon            = require('serve-favicon');
var UAParser = require('ua-parser-js');

// express framework initialization
const app = express();

//set port
app.set('port', (process.env.PORT ||8080));

//join public directory 
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
app.use('/', express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname,'js')));
app.use('/images', express.static(path.join(__dirname, 'images')));

// data format specification (in json)
app.use(bodyParser.json({limit: '1gb'}));
app.use(bodyParser.urlencoded( {limit: '1gb',extended: true }));
app.use(bodyParser.json());
var sess; // global session, NOT recommended

// initialize express-session to allow us track the logged-in user across sessions.
app.use(session({secret: 'ssshhhhh',saveUninitialized: true,resave: true}));

mongoose.set('useFindAndModify', false);

// set the view
app.engine('ejs', engine);
app.set('view engine', 'ejs');

// database connection
mongoose.connect(config.db_prod,{useUnifiedTopology: true , useNewUrlParser: true });
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');

setRoutes(app);

/**
 * Handles the course pagination/navigation
 * @param req
 * @param res
 * @param next
 */
//---------------------------------------------------------------------
  // home page
//---------------------------------------------------------------------
app.get('/', function(req, res , next) {

    paginate(req, res, next);
  
  })//home page route
  
  // the next method param is passed as well
  function checkForMobile(req, res, next) {
    // check to see if the caller is a mobile device
    var isMobile = isCallerMobile(req);
  
    if (isMobile) {
      console.log("Going mobile");
    //   res.redirect('/mobile');
    } else {
        console.log("------else---")
      // if we didn't detect mobile, call the next method, which will eventually call the desktop route
      return next();
    }
  }
  function isCallerMobile(req) {
    var ua = req.headers['user-agent'].toLowerCase(),
      isMobile = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(ua) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(ua.substr(0, 4));
  
    return !!isMobile;
  }
  //---------------------------------------------------------------------
    // dashboard page
  //---------------------------------------------------------------------
  app.get('/dashboard', function(req, res,next) {
   
    paginate(req,res,next)
  
  })//dashboard route
  
   
  function paginate(req, res, next) {

    var arr = []
    var sub_categories = []
    var sub_arr = []
    sess = req.session;
    var isMobile = isCallerMobile(req);

    var perPage = parseInt(req.query.currentPage || 9)
    const page = parseInt(req.query.page || 1); // Page 

    Course.countDocuments().exec(function(err, count) {
        if (err) return next(err);

        Course.find({g_course:'false'}).skip((perPage * page) - perPage).sort({'fav_count':-1})
            .limit(perPage)
            .populate('cat_id')

        .exec((err, courses_cat) => {
            if (err) return next(err);

            if (courses_cat == null) {
                if (err) return next(err);

            }
            if (courses_cat.length > 0) {

                //loopthrough the courses to get categories
                courses_cat.forEach(element => {
                    sub_categories = []

                    if (element.cat_id != null) {

                        if (parseInt(element.cat_id.id) == parseInt(element.course_meta_category)) {
                            element.cat_id.sub_categories.forEach(elem => {
                                if (parseInt(elem.id) == parseInt(element.course_sub_category)) {
                                    sub_arr.push({ id: element.cat_id.id, sub_id: elem.id, sub_name: elem.name })
                                    sub_arr = removeDuplicates(sub_arr, "sub_name");
                                    arr.push({
                                        _id: element.cat_id._id,
                                        id: element.cat_id.id,
                                        name: element.cat_id.name,
                                        sub_categories: sub_categories,
                                        uid:element.uid,
                                        course_name:element.course_name
                                    })

                                }

                            });
                        }
                    }
                }); //courses_cat

            } //if  

            //removing duplicates
            let filter_arr = arr.reduce(function(acc, curr) {
                let findIndex = acc.findIndex(function(item) {
                    return item.id === curr.id

                })
                if (findIndex === -1) {
                    acc.push(curr)

                } else {

                }
                return acc
            }, [])

            filter_arr.forEach(elem => {
                sub_arr.forEach(element => {
                    if (elem.id == element.id) {
                        elem.sub_categories.push({ sub_id: element.sub_id, sub_name: element.sub_name })
                    }

                });

            });
            Categories.find({}).exec((err, cat_data) => {
                if (err) return next(err);

                if (sess.user && sess.email == "Admin") {

                    //finding the categories for course
                    Course.find({g_course:'false'}).skip((perPage * page) - perPage).sort({'fav_count':-1})
                        .limit(perPage)
                        .populate('cat_id')

                    .exec((err, courses) => {
                        if (err) return next(err);

                        if (courses == null) {
                            if (err) return next(err);

                        } else {
                          User.findOne({_id:sess.user})
                          .exec((err, user_data) => {
                              if (err) return next(err);
  
                              if (user_data == null) {
                                  if (err) return next(err);
  
                              }
                              if(isMobile){
                                res.render('mobile-ui/home', {
                                  'categories': filter_arr,
                                  'user': sess.user,
                                  'isLoggedIn': true,
                                  'allcategories': cat_data,
                                  currentPage: page,
                                  pages: Math.ceil(count / perPage),
                                  'courses': courses,
                                  'role': sess.email,
                                  'user_info':user_data
                              })
                              }
                              else{
                            res.render('dashboard', {
                                'categories': filter_arr,
                                'user': sess.user,
                                'isLoggedIn': true,
                                'allcategories': cat_data,
                                currentPage: page,
                                pages: Math.ceil(count / perPage),
                                'courses': courses,
                                'role': sess.email,
                                'user_info':user_data
                            })
                          }
                          })
                        }

                    })
                } else if (sess.user && sess.email == "Creator") {

                    Course.find({g_course:"false",
                            $or: [
                              {},
                                { user: sess.user }, { favorite_bool: true }
                            ]
                        }).skip((perPage * page) - perPage).sort({'fav_count':-1})
                        .limit(perPage)
                        .populate('cat_id')

                    .exec((err, courses) => {
                        if (err) return next(err);

                        if (courses == null) {
                            if (err) return next(err);

                        } else {
                          User.findOne({_id:sess.user})
                          .exec((err, user_data) => {
                              if (err) return next(err);
  
                              if (user_data == null) {
                                  if (err) return next(err);
  
                              }
                              if(isMobile){res.render('mobile-ui/home', {
                                'categories': filter_arr,
                                'user': sess.user,
                                'isLoggedIn': true,
                                'allcategories': cat_data,
                                currentPage: page,
                                pages: Math.ceil(count / perPage),
                                'courses': courses,
                                'role': sess.email,
                                'user_info':user_data
                            })}
                              else{res.render('dashboard', {
                                'categories': filter_arr,
                                'user': sess.user,
                                'isLoggedIn': true,
                                'allcategories': cat_data,
                                currentPage: page,
                                pages: Math.ceil(count / perPage),
                                'courses': courses,
                                'role': sess.email,
                                'user_info':user_data
                            })}
                            
                          })
                        }

                    })
                } else if (sess.user && sess.email == "Normal User") {
                    Course.find({g_course:"false",
                            $or: [
                                {},
                                { user: sess.user }
                            ]
                        }).skip((perPage * page) - perPage).sort({'fav_count':-1})
                        .limit(perPage)
                        .populate('cat_id')

                    .exec((err, courses) => {
                        if (err) return next(err);

                        if (courses == null) {
                            if (err) return next(err);

                        } else {
                          User.findOne({_id:sess.user})
                          .exec((err, user_data) => {
                              if (err) return next(err);
  
                              if (user_data == null) {
                                  if (err) return next(err);
  
                              }
                              if(isMobile){
                               return res.render('mobile-ui/home', {
                                  'categories': filter_arr,
                                  'user': sess.user,
                                  'isLoggedIn': true,
                                  'allcategories': cat_data,
                                  currentPage: page,
                                  pages: Math.ceil(count / perPage),
                                  'courses': courses,
                                  'role': sess.email,
                                  'user_info':user_data
                              })
                              }
                              else{
                                return res.render('dashboard', {
                                  'categories': filter_arr,
                                  'user': sess.user,
                                  'isLoggedIn': true,
                                  'allcategories': cat_data,
                                  currentPage: page,
                                  pages: Math.ceil(count / perPage),
                                  'courses': courses,
                                  'role': sess.email,
                                  'user_info':user_data
                              })
                              }
                            
                          })
                        }


                    })
                } else {
                    Course.find({g_course:"false"}).skip((perPage * page) - perPage).sort({'fav_count':-1})
                        .limit(perPage)
                        .populate('cat_id')

                    .exec((err, courses) => {
                        if (err) return next(err);

                        if (courses == null) {
                            if (err) return next(err);

                        } else {
                          if(isMobile){
                          res.render('mobile-ui/home', {
                            'categories': filter_arr,
                            'user': sess.user,
                            'isLoggedIn': false,
                            'allcategories': cat_data,
                            currentPage: page,
                            pages: Math.ceil(count / perPage),
                            'courses': courses
                        })}
                          else{
                            res.render('home-page', {
                              'categories': filter_arr,
                              'user': sess.user,
                              'isLoggedIn': false,
                              'allcategories': cat_data,
                              currentPage: page,
                              pages: Math.ceil(count / perPage),
                              'courses': courses
                          })
                          }
                           
                        }


                    })
                }

            })

        })

    }); //courses


}

app.get('/courses', function(req, res, next) {
  var arr = []
  var sub_categories = []
  var sub_arr = []
  sess = req.session;

  // var perPage = parseInt(req.query.currentPage || 10)
  // const page = parseInt(req.query.page || 1); // Page
  Course.countDocuments().exec(function(err, count) {
  if (err) return next(err);
  
  // Course.find({}).skip((perPage * page) - perPage)
  // .limit(perPage)
  Course.find({g_course:"false"})
  .populate('cat_id')
  .exec((err, courses_cat)=>{
  if (err) return next(err);
  if(courses_cat == null){
  if (err) return next(err);
  }
  if(courses_cat.length > 0){
  //loopthrough the courses to get categories
  courses_cat.forEach(element => {
  sub_categories = []
  if(element.cat_id != null){
  if(parseInt(element.cat_id.id) == parseInt(element.course_meta_category) ){
  element.cat_id.sub_categories.forEach(elem => {
  if(parseInt(elem.id) == parseInt(element.course_sub_category ) ){
  sub_arr.push({id:element.cat_id.id, sub_id:elem.id,sub_name:elem.name})
  sub_arr = removeDuplicates( sub_arr, "sub_name");
  arr.push({_id:element.cat_id._id,
  id:element.cat_id.id,name:element.cat_id.name ,sub_categories:sub_categories,
  uid:element.uid,
  course_name:element.course_name})
  }
  });
  }
  }
  });//courses_cat
  }//if
  //removing duplicates
  let filter_arr = arr.reduce(function(acc, curr) {
  let findIndex = acc.findIndex(function(item) {
  return item.id === curr.id
  })
  if (findIndex === -1) {
  acc.push(curr)
  }
  else{
  }
  return acc
  }, [])
  filter_arr.forEach(elem => {
  sub_arr.forEach(element => {
  if(elem.id == element.id){
  elem.sub_categories.push({sub_id:element.sub_id,sub_name:element.sub_name})
  }
  });
  });
  Categories.find({}).exec((err,cat_data) =>{
  if (err) return next(err);
  if(sess.user && sess.email == "Admin"){
  //finding the categories for course
  // Course.find({}).skip((perPage * page) - perPage)
  // .limit(perPage)
  Course.find({g_course:"false"})
  .populate('cat_id')
  .exec((err, courses)=>{
  if (err) return next(err);
  
  if(courses == null){
  if (err) return next(err);
  }
  else{
  User.findOne({_id:sess.user})
  .exec((err, user_data) => {
  if (err) return next(err);
  
  if (user_data == null) {
  if (err) return next(err);
  
  }
  res.render('courses', {'user_info':user_data,'categories':filter_arr , 'user':sess.user, 'isLoggedIn':true,'allcategories':cat_data
  ,'courses':courses ,'role':sess.email})
  })
  }
  })
  }
  else if(sess.user && sess.email == "Creator"){
  
  Course.find({g_course:"false",
  $or: [
  {},
  {user:sess.user },{favorite_bool:true}
  ]})
  // .skip((perPage * page) - perPage)
  // .limit(perPage)
  .populate('cat_id')
  
  .exec((err, courses)=>{
  if (err) return next(err);
  
  if(courses == null){
  if (err) return next(err);
  
  }
  else{
  User.findOne({_id:sess.user})
  .exec((err, user_data) => {
  if (err) return next(err);
  
  if (user_data == null) {
  if (err) return next(err);
  
  }
  res.render('courses', {'user_info':user_data,'categories':filter_arr , 'user':sess.user, 'isLoggedIn':true,'allcategories':cat_data,
  'courses':courses ,'role':sess.email})
  })
  }
  })
  }
  else if(sess.user && sess.email == "Normal User"){
  Course.find({
  $or: [
  {},
  {user:sess.user }
  ]
  })
  // .skip((perPage * page) - perPage)
  // .limit(perPage)
  .populate('cat_id')
  .exec((err, courses)=>{
  if (err) return next(err);
  if(courses == null){
  if (err) return next(err);
  }
  else{
  User.findOne({_id:sess.user})
  .exec((err, user_data) => {
  if (err) return next(err);
  
  if (user_data == null) {
  if (err) return next(err);
  
  }
  res.render('courses', {'user_info':user_data,'categories':filter_arr , 'user':sess.user, 'isLoggedIn':true,'allcategories':cat_data,
  'courses':courses,'role':sess.email })
  })
  }
  })
  }
  else{
  Course.find({g_course:"false"})
  // .skip((perPage * page) - perPage)
  // .limit(perPage)
  .populate('cat_id')
  .exec((err, courses)=>{
  if (err) return next(err);
  if(courses == null){
  if (err) return next(err);
  }
  else{
  res.render('courses', {'categories':filter_arr ,'user': sess.user,'isLoggedIn':false,'allcategories':cat_data,
  'courses':courses })
  }
  })
  }
  })
  
  })
  });//courses
  })
  app.get('/privacyPolicy', function(req, res ) {
    return res.render('privacy')
  })
//---------------------------------------------------------------------
  // view courses route (future reference )
//---------------------------------------------------------------------
app.get('/view_course', function(req, res) {
  
  var arr                   = []
  var timestamp_arr         = []
  var arr_data              = []
  var sub_categories        = []
  var sub_arr               = []
  var one_section           = []
  var section_timestamp     = []
  var desc_arr              = []
  var timestamp_data_arr    = [] 
  var video_tag_arr         = []   
  var desc                  = []

  sess  = req.session;

  if(sess.email) {
  
  
    if(req.query.uid && req.query.course || req.query.uid && req.query.course&&  req.query.video_id &&req.query.timestamp || req.query.uid && req.query.course&&  req.query.video_id ||req.query.uid && req.query.timestamp || req.query.uid && req.query.video_id){
     Course.find({g_course:"false"})
     .populate('cat_id')
     .populate('user')
   
     .exec((err, courses)=>{
       if(err) {
         return (err);
       }
    if(courses.length > 0){
       //loopthrough the courses to get categories
       courses.forEach(element => {
         sub_categories = []
         if(element.cat_id !== null){
         
         if(parseInt(element.cat_id.id) == parseInt(element.course_meta_category) ){
             element.cat_id.sub_categories.forEach(elem => {
                 if(parseInt(elem.id) == parseInt(element.course_sub_category )   ){
                     sub_arr.push({id:element.cat_id.id, sub_id:elem.id,sub_name:elem.name})
                      sub_arr = removeDuplicates( sub_arr, "sub_name");
   
                     arr_data.push({_id:element.cat_id._id,
                     id:element.cat_id.id,name:element.cat_id.name ,sub_categories:sub_categories,
                     uid:element.uid,
                     course_name:element.course_name})
                     
                 }
     
             });  
         }  
       }      
     });//obj loop
   }
     //removing duplicates
     let filter_arr = arr_data.reduce(function(acc, curr) {
         let findIndex = acc.findIndex(function(item) {
         return item.id === curr.id
         
         })
         if (findIndex === -1) {
             acc.push(curr)
         
         }
         else{
         
         }
         return acc
         }, [])
   
         filter_arr.forEach(elem => {
             sub_arr.forEach(element => {
                 if(elem.id == element.id){
                     elem.sub_categories.push({sub_id:element.sub_id,sub_name:element.sub_name})
                 }
                 
             });
             
         });
   
       Categories.find({})
       .exec((err, categories)=>{
         if(err) {
           return (err);
         }
   
         Course.findOne({g_course:"false",
          $or: [
  
            { 'course_name': req.query.course },
            {'course_details.video_id':req.query.video_id}
          ]
        }).where({'uid':req.query.uid}) 
          .exec((err, courses) => {
            var count = courses.course_details.length

           if (err) {
             return (err);
           }
   
           Categories.findOne({id:courses.course_meta_category})
           .exec((err, course_cat) => {
          
             if (err) {
               return (err);
             }
             if (course_cat == null) {
               console.log("====course category is null====")
 
               return ;
             }
             Categories.findOne({_id:course_cat._id})
             .exec((err, category) => {
   
               if (err) {
                 return (err);
               }
 
               if (category == null) {
               console.log("====course category is null====")
 
               return ;
             }
   
               CourseSection.find({complete_course_id:courses._id})
       
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
                 if(course_sections.length > 0){
                   course_sections.forEach(element => {
                     if(element.course_section.length == 0){
                       CourseSection.findOneAndRemove({_id:element._id})
                       .exec((err, course_sections) => {
                         if(err){
                           return res.json({
                             'success': false,
                             'message': 'Error ',
                             "err" :err
                           })
                         }
                     })
                   }
                   });
                  
                 }
                 if(course_sections.length == 0){
   
           if(courses.course_details.length > 0){
                         
              courses.course_details.forEach(c_details => {
             if(c_details.video_id == req.query.video_id){
               courses.course_details.pop({_id:c_details._id})
   
               for (let index = 0; index <  c_details.video_timestamp.length; index++) {
                 const element =  c_details.video_timestamp[index];
                 timestamp_data_arr.push(element)
               }
               
               if(c_details.video_tag.length > 0){
                 c_details.video_tag.forEach(element1 => {
                   video_tag_arr.push(element1)
                 });
               }
               courses.course_details= courses.course_details.unshift({_id:c_details._id ,video_title:c_details.video_title,video_description:c_details.video_description,video_embed_link:c_details.video_embed_link,video_thumbnail:c_details.video_thumbnail,video_timestamp:timestamp_data_arr,video_tag:video_tag_arr})
               
             }
             arr.push(c_details.video_id)
       
         });//course loop
   
           //checking for timestamp data
           if(courses.course_details[0].video_timestamp.length > 0){
   
             courses.course_details[0].video_timestamp.forEach(timestamp_data => {
                   
               var regExp = /((([0-9]?[0-9]):([0-5]?[0-9]):([0-5]?[0-9])|([0-5]?[0-9]):([0-5]?[0-9])))/g
   
               var letter_regex =  /[a-zA-Z](.*)[a-zA-Z\?/!@]/g;
                   
               var match_elem =  timestamp_data.match(regExp)
               
               var match_lettr = timestamp_data.match(letter_regex)
               
               timestamp_arr.push({time:match_elem , title:match_lettr})
   
             });//for timestamp
               
           }//if timestamp
           
         }//courses length if
           
     
             one_section.push({video_id:null})
             courses.course_details.forEach(c_details => {
   
               desc_arr.push({_id:c_details._id, v_desc:c_details.video_description})
   
             });
             var course_title = courses.course_title.trim();
             var video_title = courses.course_details[0].video_title.trim();
   
               return res.render('view_course_login' ,{'count':count,'course_title':course_title,'video_title':video_title,'meta_video_id':courses.course_details[0].video_id,'meta_video_desc':courses.course_details[0].video_description.substring(0,100),'meta_video_thumbnail':courses.course_details[0].video_thumbnail, 'meta_video_title':courses.course_details[0].video_title,'data':courses, 'desc_arr':desc_arr[0],'categories':categories,'category':filter_arr,'timestamp_arr' :timestamp_arr, 'video' :arr ,'section_boolean':1, 'section_timestamp':section_timestamp,'first_section':one_section,'cat_name':category});
             }
             else {
               one_section = []
               desc_arr = []
               if(course_sections.length > 0 ){
   
               //looping through response 
               course_sections.forEach(section_data => {
                 section_data.course_section.forEach(courses =>{
                   courses.course_details.forEach(c_ids => {
                     section_data.complete_course_id.course_details.forEach(data => {
                               
                       if(data._id == c_ids.course_id){
                         c_ids.title = data.video_title
                         courses.course_details.push( {course_id:data._id , _id:c_ids._id ,video_title:c_ids.title,video_description:data.video_description,video_embed_link:data.video_embed_link,video_thumbnail:data.video_thumbnail,video_id:data.video_id,video_timestamp:data.video_timestamp})
                         courses.course_details = removeDuplicates( courses.course_details, "_id");
   
                       }//if match id
   
                                             
                     });// course id
                       
                   })//course details id
   
                 })//course section data
                 
               section_data = course_sections
   
             })//course response data loop
             
             if(course_sections.length > 0){
               // removing the duplicate course's
                  for( var index=0; index<course_sections.length; index++){
                   for (let index1 = 0; index1 < course_sections[index].course_section.length; index1++) {
   
                       for (let index11 = 0; index11 < course_sections[index].course_section[index1].course_details.length; index11++) {
                         const element1 =  course_sections[index].course_section[index1].course_details[index11].course_id.toString();
                          for( var i= 0 ; i< courses.course_details.length;  i++){
   
                         if( (courses.course_details[i]._id.toString() == element1)){
                       //  courses.course_details = removeDuplicates(courses.course_details , '_id')
                           courses.course_details.splice(i, 1);
                          courses.course_details = removeDuplicates(courses.course_details , '_id')
   
                     }
                   }
                  }
               }
             }
           }
            // if(course_sections.length > 0){
             for (let index = 0; index < course_sections.length; index++) {
   
             for (let index1 = 0; index1 < course_sections[index].course_section.length; index1++) {
               for (let index2 = 0; index2 < course_sections[index].course_section[index1].course_details.length; index2++) {
                 if(req.query.video_id){
                   const element =  course_sections[index].course_section[index1].course_details[index2];
   
                   if(course_sections[index].course_section[index1].course_details[index2].video_id == req.query.video_id){
   
   
                     if(course_sections[index].course_section[index1].course_details[index2].video_timestamp.length > 0){
   
                     course_sections[index].course_section[index1].course_details[index2].video_timestamp.forEach(timestamp_data => {
                         
                     var regexExp = /((([0-9]?[0-9]):([0-5]?[0-9]):([0-5]?[0-9])|([0-5]?[0-9]):([0-5]?[0-9])))/g
         
                     var lettr_regex =  /[a-zA-Z](.*)[a-zA-Z\?/!@]/g;
                         
                     var match_element =  timestamp_data.match(regexExp)
                     
                     var match_letter = timestamp_data.match(lettr_regex)
                     
                     section_timestamp.push({time:match_element , title:match_letter})
                     timestamp_arr.push({time:match_element , title:match_letter})
                      section_timestamp = removeDuplicates(section_timestamp , 'time')
                      timestamp_arr = removeDuplicates(timestamp_arr , 'time')
   
                   });//for timestamp
                     
                 }
                
   
                   one_section.push({video_title:element.video_title,video_id:element.video_id,video_embed_link:element.video_embed_link,video_desc:element.video_description})
   
                   }
   
                   else if(course_sections[index].course_section[index1].course_details[index2].video_id!= req.query.video_id){
                     courses.course_details.forEach(element => {
                       if(element.video_id == req.query.video_id){
   
                         if(element.video_timestamp.length > 0){
                           element.video_timestamp.forEach(timestamp_data => {
                             
                       
                           var regexExp = /((([0-9]?[0-9]):([0-5]?[0-9]):([0-5]?[0-9])|([0-5]?[0-9]):([0-5]?[0-9])))/g
         
                           var lettr_regex =  /[a-zA-Z](.*)[a-zA-Z\?/!@]/g;
                               
                           var match_element =  timestamp_data.match(regexExp)
                           
                           var match_letter = timestamp_data.match(lettr_regex)
                           
                           section_timestamp.push({time:match_element , title:match_letter})
                           timestamp_arr.push({time:match_element , title:match_letter})
                            section_timestamp = removeDuplicates(section_timestamp , 'time')
                            timestamp_arr = removeDuplicates(timestamp_arr , 'time')
                           });
                         }
                        
                         one_section.push({video_title:element.video_title,video_id:element.video_id,video_embed_link:element.video_embed_link,video_desc:element.video_description})
   
                       }
                     });
                   }
                 }
                 else{
                 const element =  course_sections[index].course_section[index1].course_details[index2];
                 const element1 =  course_sections[index].course_section[index1].course_details[index2];
                 const element2 =  course_sections[index].course_section[index1].course_details[index2]
                 const element3 =  course_sections[index].course_section[index1].course_details[index2]
                 if(element3.video_description != null){
                   element3.video_description = element3.video_description
                 }
   
                 if(course_sections[index].course_section[index1].course_details[index2].video_timestamp.length > 0){
   
                   course_sections[index].course_section[index1].course_details[index2].video_timestamp.forEach(timestamp_data => {
                         
                     var regexExp = /((([0-9]?[0-9]):([0-5]?[0-9]):([0-5]?[0-9])|([0-5]?[0-9]):([0-5]?[0-9])))/g
         
                     var lettr_regex =  /[a-zA-Z](.*)[a-zA-Z\?/!@]/g;
                         
                     var match_element =  timestamp_data.match(regexExp)
                     
                     var match_letter = timestamp_data.match(lettr_regex)
                     
                     section_timestamp.push({time:match_element , title:match_letter})
             
                   });//for timestamp
   
   
                 }//if timestamp
   
                 one_section.push({video_title:element.video_title,video_id:element1.video_id,video_embed_link:element2.video_embed_link,video_desc:element3.video_description})
                 desc_arr.push({_id:element._id, v_desc:element.video_description})
               }
               }
   
             }
               
             }
           }
           var course_title = courses.course_title.trim();
           var video_title = one_section[0].video_title.trim();

           return res.render('view_course_login' ,{'count':count,'course_title':course_title,'video_title':video_title,'meta_video_id':one_section[0].video_id,'meta_video_title':one_section[0].video_title,'meta_video_desc':one_section[0].video_desc.substring(0,100),'meta_video_thumbnail':one_section[0].video_thumbnail,'course_sections':course_sections,'desc_arr':desc_arr[0],'categories':categories,'data':courses, 'timestamp_arr' :timestamp_arr,'category': filter_arr, 'video' :arr ,'section_boolean':0, 'section_timestamp':section_timestamp,'first_section':one_section[0],'cat_name':category});
   
           }
             
         }); // main exec 
   
       })// courses
     });
     });
         
     }); //courses categories
    });
   }
   else if(req.query.course && req.query.video_id && req.query.timestamp||req.query.course && req.query.video_id  || req.query.course && req.query.timestamp  ){
   Course.find({g_course:"false"})
   .populate('cat_id')
   .populate('user')
 
   .exec((err, courses)=>{
     if(err) {
       return (err);
     }
  if(courses.length > 0){
     //loopthrough the courses to get categories
     courses.forEach(element => {
       sub_categories = []
       if(element.cat_id !== null){
       
       if(parseInt(element.cat_id.id) == parseInt(element.course_meta_category) ){
           element.cat_id.sub_categories.forEach(elem => {
               if(parseInt(elem.id) == parseInt(element.course_sub_category )   ){
                   sub_arr.push({id:element.cat_id.id, sub_id:elem.id,sub_name:elem.name})
                    sub_arr = removeDuplicates( sub_arr, "sub_name");
 
                   arr_data.push({_id:element.cat_id._id,
                   id:element.cat_id.id,name:element.cat_id.name ,sub_categories:sub_categories})
                   
               }
   
           });  
       }  
     }      
   });//obj loop
 }
   //removing duplicates
   let filter_arr = arr_data.reduce(function(acc, curr) {
       let findIndex = acc.findIndex(function(item) {
       return item.id === curr.id
       
       })
       if (findIndex === -1) {
           acc.push(curr)
       
       }
       else{
       
       }
       return acc
       }, [])
 
       filter_arr.forEach(elem => {
           sub_arr.forEach(element => {
               if(elem.id == element.id){
                   elem.sub_categories.push({sub_id:element.sub_id,sub_name:element.sub_name})
               }
               
           });
           
       });
 
     Categories.find({})
     .exec((err, categories)=>{
       if(err) {
         return (err);
       }
 
       Course.findOne({g_course:"false",
        'course_name': req.query.course         
      }).where({'course_details.video_id':req.query.video_id})     
        .exec((err, courses) => {
          var count = courses.course_details.length

         if (err) {
           return (err);
         }
 
         Categories.findOne({id:courses.course_meta_category})
         .exec((err, course_cat) => {
        
           if (err) {
             return (err);
           }
           if (course_cat == null) {
             console.log("====course category is null====")

             return ;
           }
           Categories.findOne({_id:course_cat._id})
           .exec((err, category) => {
 
             if (err) {
               return (err);
             }

             if (category == null) {
             console.log("====course category is null====")

             return ;
           }
 
             CourseSection.find({complete_course_id:courses._id})
     
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
               if(course_sections.length > 0){
                 course_sections.forEach(element => {
                   if(element.course_section.length == 0){
                     CourseSection.findOneAndRemove({_id:element._id})
                     .exec((err, course_sections) => {
                       if(err){
                         return res.json({
                           'success': false,
                           'message': 'Error ',
                           "err" :err
                         })
                       }
                   })
                 }
                 });
                
               }
               if(course_sections.length == 0){
 
         if(courses.course_details.length > 0){
                       
         //   courses.course_details.forEach(c_details => {
         //     arr.push(c_details.video_id)
       
         // });//course loop
         courses.course_details.forEach(c_details => {
           if(c_details.video_id == req.query.video_id){
             courses.course_details.pop({_id:c_details._id})
 
             for (let index = 0; index <  c_details.video_timestamp.length; index++) {
               const element =  c_details.video_timestamp[index];
               timestamp_data_arr.push(element)
             }
             
             if(c_details.video_tag.length > 0){
               c_details.video_tag.forEach(element1 => {
                 video_tag_arr.push(element1)
               });
             }
             // timestamp_data_arr =  timestamp_data_arr.filter((value,index)=>timestamp_data_arr.indexOf(value)!== index)
             courses.course_details= courses.course_details.unshift({_id:c_details._id ,video_title:c_details.video_title,video_description:c_details.video_description,video_embed_link:c_details.video_embed_link,video_thumbnail:c_details.video_thumbnail,video_timestamp:timestamp_data_arr,video_tag:video_tag_arr})
             
           }
           arr.push(c_details.video_id)
     
       });//course loop
        //  arr.push(req.query.video_id)
 
         //checking for timestamp data
         if(courses.course_details[0].video_timestamp.length > 0){
 
           courses.course_details[0].video_timestamp.forEach(timestamp_data => {
                 
             var regExp = /((([0-9]?[0-9]):([0-5]?[0-9]):([0-5]?[0-9])|([0-5]?[0-9]):([0-5]?[0-9])))/g
 
             var letter_regex =  /[a-zA-Z](.*)[a-zA-Z\?/!@]/g;
                 
             var match_elem =  timestamp_data.match(regExp)
             
             var match_lettr = timestamp_data.match(letter_regex)
             
             timestamp_arr.push({time:match_elem , title:match_lettr})
             // timestamp_arr = removeDuplicates( timestamp_arr, "time");
 
           });//for timestamp
             
         }//if timestamp
         
       }//courses length if
         
   
           one_section.push({video_id:null})
           courses.course_details.forEach(c_details => {
 
             desc_arr.push({_id:c_details._id, v_desc:c_details.video_description})
 
           });
           var course_title = courses.course_title.trim();
           var video_title = courses.course_details[0].video_title.trim();

             return res.render('view_course_login' ,{'count':count,'course_title':course_title,'video_title':video_title,'meta_video_id':courses.course_details[0].video_id,'meta_video_desc':courses.course_details[0].video_description.substring(0,100),'meta_video_thumbnail':courses.course_details[0].video_thumbnail, 'meta_video_title':courses.course_details[0].video_title,'data':courses, 'desc_arr':desc_arr[0],'categories':categories,'category':filter_arr,'timestamp_arr' :timestamp_arr, 'video' :arr ,'section_boolean':1, 'section_timestamp':section_timestamp,'first_section':one_section,'cat_name':category});
           }
           else {
             one_section = []
             desc_arr = []
             if(course_sections.length > 0 ){
 
             //looping through response 
             course_sections.forEach(section_data => {
               section_data.course_section.forEach(courses =>{
                 courses.course_details.forEach(c_ids => {
                   section_data.complete_course_id.course_details.forEach(data => {
                             
                     if(data._id == c_ids.course_id){
                       c_ids.title = data.video_title
                       courses.course_details.push( {course_id:data._id , _id:c_ids._id ,video_title:c_ids.title,video_description:data.video_description,video_embed_link:data.video_embed_link,video_thumbnail:data.video_thumbnail,video_id:data.video_id,video_timestamp:data.video_timestamp})
                       courses.course_details = removeDuplicates( courses.course_details, "_id");
 
                     }//if match id
 
                                           
                   });// course id
                     
                 })//course details id
 
               })//course section data
               
             section_data = course_sections
 
           })//course response data loop
 
             // removing the duplicate course's
                for( var index=0; index<course_sections.length; index++){
                 for (let index1 = 0; index1 < course_sections[index].course_section.length; index1++) {
 
                     for (let index11 = 0; index11 < course_sections[index].course_section[index1].course_details.length; index11++) {
                       const element1 =  course_sections[index].course_section[index1].course_details[index11].course_id.toString();
                        for( var i= 0 ; i< courses.course_details.length;  i++){
 
                       if( (courses.course_details[i]._id.toString() == element1)){
                     //  courses.course_details = removeDuplicates(courses.course_details , '_id')
                         courses.course_details.splice(i, 1);
                        courses.course_details = removeDuplicates(courses.course_details , '_id')
 
                   }
                 }
             }
           }
         }
 
           for (let index = 0; index < course_sections.length; index++) {
 
           for (let index1 = 0; index1 < course_sections[index].course_section.length; index1++) {
             for (let index2 = 0; index2 < course_sections[index].course_section[index1].course_details.length; index2++) {
               if(req.query.video_id){
                 const element =  course_sections[index].course_section[index1].course_details[index2];
 
                 if(course_sections[index].course_section[index1].course_details[index2].video_id == req.query.video_id){
 
 
                   if(course_sections[index].course_section[index1].course_details[index2].video_timestamp.length > 0){
 
                   course_sections[index].course_section[index1].course_details[index2].video_timestamp.forEach(timestamp_data => {
                       
                   var regexExp = /((([0-9]?[0-9]):([0-5]?[0-9]):([0-5]?[0-9])|([0-5]?[0-9]):([0-5]?[0-9])))/g
       
                   var lettr_regex =  /[a-zA-Z](.*)[a-zA-Z\?/!@]/g;
                       
                   var match_element =  timestamp_data.match(regexExp)
                   
                   var match_letter = timestamp_data.match(lettr_regex)
                   
                   section_timestamp.push({time:match_element , title:match_letter})
                   timestamp_arr.push({time:match_element , title:match_letter})
                    section_timestamp = removeDuplicates(section_timestamp , 'time')
                    timestamp_arr = removeDuplicates(timestamp_arr , 'time')
 
                 });//for timestamp
                   
               }
 
                 one_section.push({video_title:element.video_title,video_id:element.video_id,video_embed_link:element.video_embed_link,video_desc:element.video_description})
 
                 }
 
                 else if(course_sections[index].course_section[index1].course_details[index2].video_id!= req.query.video_id){
                   courses.course_details.forEach(element => {
                     if(element.video_id == req.query.video_id){
 
                       if(element.video_timestamp.length > 0){
                         element.video_timestamp.forEach(timestamp_data => {
                           
                     
                         var regexExp = /((([0-9]?[0-9]):([0-5]?[0-9]):([0-5]?[0-9])|([0-5]?[0-9]):([0-5]?[0-9])))/g
       
                         var lettr_regex =  /[a-zA-Z](.*)[a-zA-Z\?/!@]/g;
                             
                         var match_element =  timestamp_data.match(regexExp)
                         
                         var match_letter = timestamp_data.match(lettr_regex)
                         
                         section_timestamp.push({time:match_element , title:match_letter})
                         timestamp_arr.push({time:match_element , title:match_letter})
                          section_timestamp = removeDuplicates(section_timestamp , 'time')
                          timestamp_arr = removeDuplicates(timestamp_arr , 'time')
                         });
                       }
                      
                       one_section.push({video_title:element.video_title,video_id:element.video_id,video_embed_link:element.video_embed_link,video_desc:element.video_description})
 
                     }
                   });
                 }
               }
               else{
               const element =  course_sections[index].course_section[index1].course_details[index2];
               const element1 =  course_sections[index].course_section[index1].course_details[index2];
               const element2 =  course_sections[index].course_section[index1].course_details[index2]
               const element3 =  course_sections[index].course_section[index1].course_details[index2]
               if(element3.video_description != null){
                 element3.video_description = element3.video_description
               }
 
               if(course_sections[index].course_section[index1].course_details[index2].video_timestamp.length > 0){
 
                 course_sections[index].course_section[index1].course_details[index2].video_timestamp.forEach(timestamp_data => {
                       
                   var regexExp = /((([0-9]?[0-9]):([0-5]?[0-9]):([0-5]?[0-9])|([0-5]?[0-9]):([0-5]?[0-9])))/g
       
                   var lettr_regex =  /[a-zA-Z](.*)[a-zA-Z\?/!@]/g;
                       
                   var match_element =  timestamp_data.match(regexExp)
                   
                   var match_letter = timestamp_data.match(lettr_regex)
                   
                   section_timestamp.push({time:match_element , title:match_letter})
           
                 });//for timestamp
 
 
               }//if timestamp
 
               one_section.push({video_title:element.video_title,video_id:element1.video_id,video_embed_link:element2.video_embed_link,video_desc:element3.video_description})
               desc_arr.push({_id:element._id, v_desc:element.video_description})
             }
             }
 
           }
             
           }
         }
         var course_title = courses.course_title.trim();
         var video_title = one_section[0].video_title.trim();

         return res.render('view_course_login' ,{'count':count,'course_title':course_title,'video_title':video_title,'meta_video_id':one_section[0].video_id,'meta_video_title':one_section[0].video_title,'meta_video_desc':one_section[0].video_desc.substring(0,100),'meta_video_thumbnail':one_section[0].video_thumbnail,'course_sections':course_sections,'desc_arr':desc_arr[0],'categories':categories,'data':courses, 'timestamp_arr' :timestamp_arr,'category': filter_arr, 'video' :arr ,'section_boolean':0, 'section_timestamp':section_timestamp,'first_section':one_section[0],'cat_name':category});
 
         }
           
       }); // main exec 
 
     })// courses
   });
   });
       
   }); //courses categories
  });
 }

else if(req.query.course  ){
 Course.find({g_course:"false"})
 .populate('cat_id')
 .populate('user')

 .exec((err, courses)=>{
   if(err) {
     return (err);
   }
if(courses.length > 0){
   //loopthrough the courses to get categories
   courses.forEach(element => {
     sub_categories = []
     if(element.cat_id !== null){
     
     if(parseInt(element.cat_id.id) == parseInt(element.course_meta_category) ){
         element.cat_id.sub_categories.forEach(elem => {
             if(parseInt(elem.id) == parseInt(element.course_sub_category )   ){
                 sub_arr.push({id:element.cat_id.id, sub_id:elem.id,sub_name:elem.name})
                  sub_arr = removeDuplicates( sub_arr, "sub_name");

                 arr_data.push({_id:element.cat_id._id,
                 id:element.cat_id.id,name:element.cat_id.name ,sub_categories:sub_categories,
                 uid:element.uid,
                 course_name:element.course_name})
                 
             }
 
         });  
     }  
   }      
 });//obj loop
}
 //removing duplicates
 let filter_arr = arr_data.reduce(function(acc, curr) {
     let findIndex = acc.findIndex(function(item) {
     return item.id === curr.id
     
     })
     if (findIndex === -1) {
         acc.push(curr)
     
     }
     else{
     
     }
     return acc
     }, [])

     filter_arr.forEach(elem => {
         sub_arr.forEach(element => {
             if(elem.id == element.id){
                 elem.sub_categories.push({sub_id:element.sub_id,sub_name:element.sub_name})
             }
             
         });
         
     });

   Categories.find({})
   .exec((err, categories)=>{
     if(err) {
       return (err);
     }

     Course.findOne({
      'course_name': req.query.course         
    })   
      .exec((err, courses) => {
        var count = courses.course_details.length

       if (err) {
         return (err);
       }

       Categories.findOne({id:courses.course_meta_category})
       .exec((err, course_cat) => {
      
         if (err) {
           return (err);
         }
         if (course_cat == null) {
           console.log("====course category is null====")

           return ;
         }
         Categories.findOne({_id:course_cat._id})
         .exec((err, category) => {

           if (err) {
             return (err);
           }

           if (category == null) {
           console.log("====course category is null====")

           return ;
         }

           CourseSection.find({complete_course_id:courses._id})
   
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
             if(course_sections.length > 0){
               course_sections.forEach(element => {
                 if(element.course_section.length == 0){
                   CourseSection.findOneAndRemove({_id:element._id})
                   .exec((err, course_sections) => {
                     if(err){
                       return res.json({
                         'success': false,
                         'message': 'Error ',
                         "err" :err
                       })
                     }
                 })
               }
               });
              
             }
             if(course_sections.length == 0){

       if(courses.course_details.length > 0){
                     
       //   courses.course_details.forEach(c_details => {
       //     arr.push(c_details.video_id)
     
       // });//course loop
       courses.course_details.forEach(c_details => {
         if(c_details.video_id == req.query.video_id){
           courses.course_details.pop({_id:c_details._id})

           for (let index = 0; index <  c_details.video_timestamp.length; index++) {
             const element =  c_details.video_timestamp[index];
             timestamp_data_arr.push(element)
           }
           
           if(c_details.video_tag.length > 0){
             c_details.video_tag.forEach(element1 => {
               video_tag_arr.push(element1)
             });
           }
           // timestamp_data_arr =  timestamp_data_arr.filter((value,index)=>timestamp_data_arr.indexOf(value)!== index)
           courses.course_details= courses.course_details.unshift({_id:c_details._id ,video_title:c_details.video_title,video_description:c_details.video_description,video_embed_link:c_details.video_embed_link,video_thumbnail:c_details.video_thumbnail,video_timestamp:timestamp_data_arr,video_tag:video_tag_arr})
           
         }
         arr.push(c_details.video_id)
   
     });//course loop
      //  arr.push(req.query.video_id)

       //checking for timestamp data
       if(courses.course_details[0].video_timestamp.length > 0){

         courses.course_details[0].video_timestamp.forEach(timestamp_data => {
               
           var regExp = /((([0-9]?[0-9]):([0-5]?[0-9]):([0-5]?[0-9])|([0-5]?[0-9]):([0-5]?[0-9])))/g

           var letter_regex =  /[a-zA-Z](.*)[a-zA-Z\?/!@]/g;
               
           var match_elem =  timestamp_data.match(regExp)
           
           var match_lettr = timestamp_data.match(letter_regex)
           
           timestamp_arr.push({time:match_elem , title:match_lettr})
           // timestamp_arr = removeDuplicates( timestamp_arr, "time");

         });//for timestamp
           
       }//if timestamp
       
     }//courses length if
       
 
         one_section.push({video_id:null})
         courses.course_details.forEach(c_details => {

           desc_arr.push({_id:c_details._id, v_desc:c_details.video_description})

         });
         var course_title = courses.course_title.trim();
          // course_title = course_title.replace(/\s/g , "-");
          var video_title = courses.course_details[0].video_title.trim();
          //  video_title = video_title.replace(/\s/g , "-");

           return res.render('view_course_login' ,{'count':count,'course_title':course_title,'video_title':video_title,'meta_video_id':courses.course_details[0].video_id,'meta_video_desc':courses.course_details[0].video_description.substring(0,100),'meta_video_thumbnail':courses.course_details[0].video_thumbnail, 'meta_video_title':courses.course_details[0].video_title,'data':courses, 'desc_arr':desc_arr[0],'categories':categories,'category':filter_arr,'timestamp_arr' :timestamp_arr, 'video' :arr ,'section_boolean':1, 'section_timestamp':section_timestamp,'first_section':one_section,'cat_name':category});
         }
         else {
           one_section = []
           desc_arr = []
           if(course_sections.length > 0 ){

           //looping through response 
           course_sections.forEach(section_data => {
             section_data.course_section.forEach(courses =>{
               courses.course_details.forEach(c_ids => {
                 section_data.complete_course_id.course_details.forEach(data => {
                           
                   if(data._id == c_ids.course_id){
                     c_ids.title = data.video_title
                     courses.course_details.push( {course_id:data._id , _id:c_ids._id ,video_title:c_ids.title,video_description:data.video_description,video_embed_link:data.video_embed_link,video_thumbnail:data.video_thumbnail,video_id:data.video_id,video_timestamp:data.video_timestamp})
                     courses.course_details = removeDuplicates( courses.course_details, "_id");

                   }//if match id

                                         
                 });// course id
                   
               })//course details id

             })//course section data
             
           section_data = course_sections

         })//course response data loop

           // removing the duplicate course's
              for( var index=0; index<course_sections.length; index++){
               for (let index1 = 0; index1 < course_sections[index].course_section.length; index1++) {

                   for (let index11 = 0; index11 < course_sections[index].course_section[index1].course_details.length; index11++) {
                     const element1 =  course_sections[index].course_section[index1].course_details[index11].course_id.toString();
                      for( var i= 0 ; i< courses.course_details.length;  i++){

                     if( (courses.course_details[i]._id.toString() == element1)){
                   //  courses.course_details = removeDuplicates(courses.course_details , '_id')
                       courses.course_details.splice(i, 1);
                      courses.course_details = removeDuplicates(courses.course_details , '_id')

                 }
               }
           }
         }
       }

         for (let index = 0; index < course_sections.length; index++) {

         for (let index1 = 0; index1 < course_sections[index].course_section.length; index1++) {
           for (let index2 = 0; index2 < course_sections[index].course_section[index1].course_details.length; index2++) {
             if(req.query.video_id){
               const element =  course_sections[index].course_section[index1].course_details[index2];

               if(course_sections[index].course_section[index1].course_details[index2].video_id == req.query.video_id){


                 if(course_sections[index].course_section[index1].course_details[index2].video_timestamp.length > 0){

                 course_sections[index].course_section[index1].course_details[index2].video_timestamp.forEach(timestamp_data => {
                     
                 var regexExp = /((([0-9]?[0-9]):([0-5]?[0-9]):([0-5]?[0-9])|([0-5]?[0-9]):([0-5]?[0-9])))/g
     
                 var lettr_regex =  /[a-zA-Z](.*)[a-zA-Z\?/!@]/g;
                     
                 var match_element =  timestamp_data.match(regexExp)
                 
                 var match_letter = timestamp_data.match(lettr_regex)
                 
                 section_timestamp.push({time:match_element , title:match_letter})
                 timestamp_arr.push({time:match_element , title:match_letter})
                  section_timestamp = removeDuplicates(section_timestamp , 'time')
                  timestamp_arr = removeDuplicates(timestamp_arr , 'time')

               });//for timestamp
                 
             }

               one_section.push({video_title:element.video_title,video_id:element.video_id,video_embed_link:element.video_embed_link,video_desc:element.video_description})

               }

               else if(course_sections[index].course_section[index1].course_details[index2].video_id!= req.query.video_id){
                 courses.course_details.forEach(element => {
                   if(element.video_id == req.query.video_id){

                     if(element.video_timestamp.length > 0){
                       element.video_timestamp.forEach(timestamp_data => {
                         
                   
                       var regexExp = /((([0-9]?[0-9]):([0-5]?[0-9]):([0-5]?[0-9])|([0-5]?[0-9]):([0-5]?[0-9])))/g
     
                       var lettr_regex =  /[a-zA-Z](.*)[a-zA-Z\?/!@]/g;
                           
                       var match_element =  timestamp_data.match(regexExp)
                       
                       var match_letter = timestamp_data.match(lettr_regex)
                       
                       section_timestamp.push({time:match_element , title:match_letter})
                       timestamp_arr.push({time:match_element , title:match_letter})
                        section_timestamp = removeDuplicates(section_timestamp , 'time')
                        timestamp_arr = removeDuplicates(timestamp_arr , 'time')
                       });
                     }
                    
                     one_section.push({video_title:element.video_title,video_id:element.video_id,video_embed_link:element.video_embed_link,video_desc:element.video_description})

                   }
                 });
               }
             }
             else{
             const element =  course_sections[index].course_section[index1].course_details[index2];
             const element1 =  course_sections[index].course_section[index1].course_details[index2];
             const element2 =  course_sections[index].course_section[index1].course_details[index2]
             const element3 =  course_sections[index].course_section[index1].course_details[index2]
             if(element3.video_description != null){
               element3.video_description = element3.video_description
             }

             if(course_sections[index].course_section[index1].course_details[index2].video_timestamp.length > 0){

               course_sections[index].course_section[index1].course_details[index2].video_timestamp.forEach(timestamp_data => {
                     
                 var regexExp = /((([0-9]?[0-9]):([0-5]?[0-9]):([0-5]?[0-9])|([0-5]?[0-9]):([0-5]?[0-9])))/g
     
                 var lettr_regex =  /[a-zA-Z](.*)[a-zA-Z\?/!@]/g;
                     
                 var match_element =  timestamp_data.match(regexExp)
                 
                 var match_letter = timestamp_data.match(lettr_regex)
                 
                 section_timestamp.push({time:match_element , title:match_letter})
         
               });//for timestamp


             }//if timestamp

             one_section.push({video_title:element.video_title,video_id:element1.video_id,video_embed_link:element2.video_embed_link,video_desc:element3.video_description})
             desc_arr.push({_id:element._id, v_desc:element.video_description})
           }
           }

         }
           
         }
       }
       var course_title = courses.course_title.trim();
      //  course_title = course_title.replace(/\s/g , "-");
       var video_title = one_section[0].video_title.trim();
        // video_title = video_title.replace(/\s/g , "-");

       return res.render('view_course_login' ,{'count':count,'course_title':course_title,'video_title':video_title,'meta_video_id':one_section[0].video_id,'meta_video_title':one_section[0].video_title,'meta_video_desc':one_section[0].video_desc.substring(0,100),'meta_video_thumbnail':one_section[0].video_thumbnail,'course_sections':course_sections,'desc_arr':desc_arr[0],'categories':categories,'data':courses, 'timestamp_arr' :timestamp_arr,'category': filter_arr, 'video' :arr ,'section_boolean':0, 'section_timestamp':section_timestamp,'first_section':one_section[0],'cat_name':category});

       }
         
     }); // main exec 

   })// courses
 });
 });
     
 }); //courses categories
});
}
 }
  else{
 if(req.query.uid && req.query.course || req.query.uid && req.query.course&&  req.query.video_id &&req.query.timestamp || req.query.uid && req.query.course&&  req.query.video_id ||req.query.uid && req.query.timestamp || req.query.uid && req.query.video_id){

  //finding the categories for course
    Course.find({g_course:"false"})
    .populate('cat_id')
    .populate('user')
  
    .exec((err, courses)=>{
      if(err) {
        return (err);
      }
     if(courses.length > 0){
      //loopthrough the courses to get categories
      courses.forEach(element => {
        sub_categories = []
        if(element.cat_id !== null){
  
        if(parseInt(element.cat_id.id) == parseInt(element.course_meta_category) ){
            element.cat_id.sub_categories.forEach(elem => {
                if(parseInt(elem.id) == parseInt(element.course_sub_category )   ){
                    sub_arr.push({id:element.cat_id.id, sub_id:elem.id,sub_name:elem.name})
                     sub_arr = removeDuplicates( sub_arr, "sub_name");
  
                    arr_data.push({_id:element.cat_id._id,
                    id:element.cat_id.id,name:element.cat_id.name ,sub_categories:sub_categories})
                    
                }
    
            });  
        } 
      }       
    });//obj loop
  }
    //removing duplicates
    let filter_arr = arr_data.reduce(function(acc, curr) {
        let findIndex = acc.findIndex(function(item) {
        return item.id === curr.id
        
        })
        if (findIndex === -1) {
            acc.push(curr)
        
        }
        else{
        
        }
        return acc
        }, [])
  
        filter_arr.forEach(elem => {
            sub_arr.forEach(element => {
                if(elem.id == element.id){
                    elem.sub_categories.push({sub_id:element.sub_id,sub_name:element.sub_name})
                }
                
            });
            
        });
      Categories.find({})
      .exec((err, categories)=>{
        if(err) {
          return (err);
        }
      if(categories == null){
        return null
      }
      Course.findOne({g_course:"false",
        $or: [

          { 'course_name': req.query.course },
          {'course_details.video_id':req.query.video_id}
        ]
      }).where({'uid':req.query.uid})   
      .exec((err, courses) => {
          if (err) {
            return (err);
          }
     
  
          if(courses == null){
            return null
          }
          // if(courses != null){
            
         if(courses != null){
          var count = courses.course_details.length

          Categories.findOne({id:courses.course_meta_category})
          .exec((err, course_cat) => {
         
            if (err) {
              return (err);
            }
             if(course_cat == null){
              return console.log('course category shouldnot be null');
            }
  
            Categories.findOne({_id:course_cat._id})
            .exec((err, category) => {
  
              if (err) {
                return (err);
              }
               if(category == null){
               return console.log('course category shouldnt be null');
            }
  
  
          if(courses.course_details.length > 0){
                        
            courses.course_details.forEach(c_details => {
              arr.push(c_details.video_id)
        
          });//course loop
           
          //checking for timestamp data
          if(courses.course_details[0].video_timestamp.length > 0){
  
            courses.course_details[0].video_timestamp.forEach(timestamp_data => {
  
                  
              var regExp = /((([0-9]?[0-9]):([0-5]?[0-9]):([0-5]?[0-9])|([0-5]?[0-9]):([0-5]?[0-9])))/g
  
              var letter_regex =  /[a-zA-Z](.*)[a-zA-Z\?/!@]/g;
              // var letter_regex = /[a-zA-Z](.*)/
                  
              var match_elem =  timestamp_data.match(regExp)
              
              var match_lettr = timestamp_data.match(letter_regex)
  
             
              
              timestamp_arr.push({time:match_elem , title:match_lettr})
              timestamp_arr = removeDuplicates(timestamp_arr , 'time')
      
            });//for timestamp
  
              
          }//if timestamp
          
        }//courses length if
          
        CourseSection.find({complete_course_id:courses._id})
      
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
            
            one_section.push({video_id:null})
            courses.course_details.forEach(element => {
              desc_arr.push({_id:element._id, v_desc:element.video_description})
  
            });
  
  
           for (let index = 0; index < courses.course_details.length; index++) {
             if(index == 0){
              desc.push(courses.course_details[0].video_description)
             }
             
           }
           if(course_sections.length > 0){
            course_sections.forEach(element => {
              if(element.course_section.length == 0){
                CourseSection.findOneAndRemove({_id:element._id})
                .exec((err, course_sections) => {
                  if(err){
                    return res.json({
                      'success': false,
                      'message': 'Error ',
                      "err" :err
                    })
                  }
              })
            }
            });
           
          }
          var course_title = courses.course_title.trim();
          var video_title = courses.course_details[0].video_title.trim();
         
            if(course_sections.length == 0){
  
              if(courses.course_details.length > 0){
         
              courses.course_details.forEach(c_details => {
                if(c_details.video_id == req.query.video_id){
                  courses.course_details.pop({_id:c_details._id})
      
                  for (let index = 0; index <  c_details.video_timestamp.length; index++) {
                    const element =  c_details.video_timestamp[index];
                    timestamp_data_arr.push(element)
                  }
                  
                  if(c_details.video_tag.length > 0){
                    c_details.video_tag.forEach(element1 => {
                      video_tag_arr.push(element1)
                    });
                  }
                  courses.course_details= courses.course_details.unshift({_id:c_details._id ,video_title:c_details.video_title,video_description:c_details.video_description,video_embed_link:c_details.video_embed_link,video_thumbnail:c_details.video_thumbnail,video_timestamp:timestamp_data_arr,video_tag:video_tag_arr})
                  
                }
          
            });//course loop
              arr.push(req.query.video_id)
      
              //checking for timestamp data
              if(courses.course_details[0].video_timestamp.length > 0){
      
                courses.course_details[0].video_timestamp.forEach(timestamp_data => {
                      
                  var regExp = /((([0-9]?[0-9]):([0-5]?[0-9]):([0-5]?[0-9])|([0-5]?[0-9]):([0-5]?[0-9])))/g
      
                  var letter_regex =  /[a-zA-Z](.*)[a-zA-Z\?/!@]/g;
                      
                  var match_elem =  timestamp_data.match(regExp)
                  
                  var match_lettr = timestamp_data.match(letter_regex)
                  
                  timestamp_arr.push({time:match_elem , title:match_lettr})
      
                });//for timestamp
                  
              }//if timestamp
              
            }//courses length if
              
        
                one_section.push({video_id:null})
                courses.course_details.forEach(c_details => {
      
                  desc_arr.push({_id:c_details._id, v_desc:c_details.video_description})
      
                });
                if(req.query.video_id){
                  video_title = courses.course_details[0].video_title
                }
      
              return res.render('view_course' ,{'count':count,'data':courses,'course_title':course_title, 'video_title':video_title,'meta_video_desc':courses.course_details[0].video_description.substring(0,100),'meta_video_thumbnail':courses.course_details[0].video_thumbnail, 'meta_video_title':courses.course_details[0].video_title,'desc_data':desc_arr, 'video_desc' :desc,'categories':categories,'category':filter_arr,'timestamp_arr' :timestamp_arr, 'video' :arr ,'section_boolean':1,'section_timestamp':section_timestamp,'first_section':one_section,'cat_name':category});
          }

            else {
              one_section = []
              desc_arr = []
              //looping through response 
              course_sections.forEach(section_data => {
                section_data.course_section.forEach(courses =>{
                  courses.course_details.forEach(c_ids => {
                    section_data.complete_course_id.course_details.forEach(data => {
                              
                      if(data._id == c_ids.course_id){
                        c_ids.title = data.video_title
  
                        courses.course_details.push( {course_id:data._id , _id:c_ids._id ,video_title:c_ids.title,video_description:data.video_description,video_embed_link:data.video_embed_link,video_thumbnail:data.video_thumbnail,video_id:data.video_id,video_timestamp:data.video_timestamp})
                                  
                        courses.course_details = removeDuplicates( courses.course_details, "_id");
                            
                      }//if match id
                          
                    });// course id
                      
                  })//course details id
  
                })//course section data
                
              section_data = course_sections
  
            })//course response data loop
  
              // removing the duplicate course's
                 for( var index=0; index<course_sections.length; index++){
                  for (let index1 = 0; index1 < course_sections[index].course_section.length; index1++) {
  
                      for (let index11 = 0; index11 < course_sections[index].course_section[index1].course_details.length; index11++) {
                        const element1 =  course_sections[index].course_section[index1].course_details[index11].course_id;
                       // console.log("===section course_ids==:", element1)
                        for( var i=0; i<courses.course_details.length; i++){
  
                        if( (courses.course_details[i]._id == element1)){
  
                          courses.course_details.splice(i, 1);
                    }
                  }
              }
            }
          }
          if(course_sections.length > 0 ){
            for (let index = 0; index < course_sections.length; index++) {
  
            for (let index1 = 0; index1 < course_sections[index].course_section.length; index1++) {
              for (let index2 = 0; index2 < course_sections[index].course_section[index1].course_details.length; index2++) {
                const element =  course_sections[index].course_section[index1].course_details[index2];
                const element1 =  course_sections[index].course_section[index1].course_details[index2];
                const element2 =  course_sections[index].course_section[index1].course_details[index2]
                const element3 =  course_sections[index].course_section[index1].course_details[index2]
                if(element3.video_description != null){
                  element3.video_description = element3.video_description
                }
  
                if(course_sections[index].course_section[index1].course_details[index2].video_timestamp.length > 0){
  
                  course_sections[index].course_section[index1].course_details[index2].video_timestamp.forEach(timestamp_data => {
           
  
                    var regexExp = /((([0-9]?[0-9]):([0-5]?[0-9]):([0-5]?[0-9])|([0-5]?[0-9]):([0-5]?[0-9])))/g
        
                    var lettr_regex =  /[a-zA-Z](.*)[a-zA-Z\?/!@]/g;
                        
                    var match_element =  timestamp_data.match(regexExp)
                    
                    var match_letter = timestamp_data.match(lettr_regex)
                    
                    section_timestamp.push({time:match_element , title:match_letter})
            
                  });//for timestamp
                    
                }//if timestamp
  
                one_section.push({video_title:element.video_title,video_id:element1.video_id,video_embed_link:element2.video_embed_link,video_desc:element3.video_description,video_thumbnail:element.video_thumbnail})
                desc_arr.push({_id:element._id, v_desc:element.video_description})
  
              }
  
            }
              
            }
          }
          courses.course_details.forEach(c_details => {
            if(c_details.video_id == req.query.video_id){
              courses.course_details.pop({_id:c_details._id})
  
              for (let index = 0; index <  c_details.video_timestamp.length; index++) {
                const element =  c_details.video_timestamp[index];
                 timestamp_data_arr.push(element)
              }
              
              if(c_details.video_tag.length > 0){
                c_details.video_tag.forEach(element1 => {
                  video_tag_arr.push(element1)
                });
              }
              courses.course_details= courses.course_details.unshift({_id:c_details._id ,video_title:c_details.video_title,video_description:c_details.video_description,video_embed_link:c_details.video_embed_link,video_thumbnail:c_details.video_thumbnail,video_timestamp:timestamp_data_arr,video_tag:video_tag_arr})
              
            }
      
        });//course loop

          var course_title = courses.course_title.trim();
          var video_title = one_section[0].video_title.trim();
          if(req.query.video_id){
            video_title = video_title
          }

          return res.render('view_course' ,{'count':count,'course_title':course_title,'video_title':video_title,'course_sections':course_sections,'meta_video_title':video_title,'meta_video_desc':one_section[0].video_desc.substring(0,100),'meta_video_thumbnail':one_section[0].video_thumbnail,'desc_data':desc_arr,'video_desc' : desc,'categories':categories,'data':courses, 'timestamp_arr' :timestamp_arr,'category': filter_arr, 'video' :arr ,'section_boolean':0,'section_timestamp':section_timestamp,'first_section':one_section[0],'cat_name':category});
  
          }
            
        }); // main exec 
  
      })// courses
    });
  
  
        }
    });
  
    }); //courses categories
    
   });
  }
  else if(req.query.course && req.query.video_id && req.query.timestamp||req.query.course && req.query.video_id  || req.query.course && req.query.timestamp  ){
  //finding the categories for course
    Course.find({g_course:"false"})
    .populate('cat_id')
    .populate('user')
  
    .exec((err, courses)=>{
      if(err) {
        return (err);
      }
     if(courses.length > 0){
      //loopthrough the courses to get categories
      courses.forEach(element => {
        sub_categories = []
        if(element.cat_id !== null){
  
        if(parseInt(element.cat_id.id) == parseInt(element.course_meta_category) ){
            element.cat_id.sub_categories.forEach(elem => {
                if(parseInt(elem.id) == parseInt(element.course_sub_category )   ){
                    sub_arr.push({id:element.cat_id.id, sub_id:elem.id,sub_name:elem.name})
                     sub_arr = removeDuplicates( sub_arr, "sub_name");
  
                    arr_data.push({_id:element.cat_id._id,
                    id:element.cat_id.id,name:element.cat_id.name ,sub_categories:sub_categories})
                    
                }
    
            });  
        } 
      }       
    });//obj loop
  }
  
    //removing duplicates
    let filter_arr = arr_data.reduce(function(acc, curr) {
        let findIndex = acc.findIndex(function(item) {
        return item.id === curr.id
        
        })
        if (findIndex === -1) {
            acc.push(curr)
        
        }
        else{
        
        }
        return acc
        }, [])
  
        filter_arr.forEach(elem => {
            sub_arr.forEach(element => {
                if(elem.id == element.id){
                    elem.sub_categories.push({sub_id:element.sub_id,sub_name:element.sub_name})
                }
                
            });
            
        });
      Categories.find({})
      .exec((err, categories)=>{
        if(err) {
          return (err);
        }
      if(categories == null){
        return null
      }
      Course.findOne({
        'course_name': req.query.course         
      }).where({'course_details.video_id':req.query.video_id})     
      .exec((err, courses) => {
        var count = courses.course_details.length

          if (err) {
            return (err);
          }
  
          if(courses == null){
            return null
          }
          // if(courses != null){
            
         if(courses != null){
          Categories.findOne({id:courses.course_meta_category})
          .exec((err, course_cat) => {
         
            if (err) {
              return (err);
            }
             if(course_cat == null){
              return console.log('course category shouldnot be null');
            }
  
            Categories.findOne({_id:course_cat._id})
            .exec((err, category) => {
  
              if (err) {
                return (err);
              }
               if(category == null){
               return console.log('course category shouldnt be null');
            }
  
  
          if(courses.course_details.length > 0){
                        
            courses.course_details.forEach(c_details => {
              arr.push(c_details.video_id)
        
          });//course loop
           
          //checking for timestamp data
          if(courses.course_details[0].video_timestamp.length > 0){
  
            courses.course_details[0].video_timestamp.forEach(timestamp_data => {
  
                  
              var regExp = /((([0-9]?[0-9]):([0-5]?[0-9]):([0-5]?[0-9])|([0-5]?[0-9]):([0-5]?[0-9])))/g
  
              var letter_regex =  /[a-zA-Z](.*)[a-zA-Z\?/!@]/g;
              // var letter_regex = /[a-zA-Z](.*)/
                  
              var match_elem =  timestamp_data.match(regExp)
              
              var match_lettr = timestamp_data.match(letter_regex)
  
             
              
              timestamp_arr.push({time:match_elem , title:match_lettr})
              timestamp_arr = removeDuplicates(timestamp_arr , 'time')
      
            });//for timestamp
  
              
          }//if timestamp
          
        }//courses length if
          
        CourseSection.find({complete_course_id:courses._id})
      
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
            
            one_section.push({video_id:null})
            courses.course_details.forEach(element => {
              desc_arr.push({_id:element._id, v_desc:element.video_description})
  
            });
  
  
           for (let index = 0; index < courses.course_details.length; index++) {
             if(index == 0){
              desc.push(courses.course_details[0].video_description)
             }
             
           }
           if(course_sections.length > 0){
            course_sections.forEach(element => {
              if(element.course_section.length == 0){
                CourseSection.findOneAndRemove({_id:element._id})
                .exec((err, course_sections) => {
                  if(err){
                    return res.json({
                      'success': false,
                      'message': 'Error ',
                      "err" :err
                    })
                  }
              })
            }
            });
           
          }
        

           
            if(course_sections.length == 0){
   
              if(courses.course_details.length > 0){
                            
           
              courses.course_details.forEach(c_details => {
                if(c_details.video_id == req.query.video_id){
                  courses.course_details.pop({_id:c_details._id})
                  if(c_details.video_timestamp.length > 0){
                  for (let index = 0; index <  c_details.video_timestamp.length; index++) {
                    const element =  c_details.video_timestamp[index];
                    timestamp_data_arr.push(element)
                  }
                }
                else{
                  timestamp_data_arr = []
                }
                  
                  if(c_details.video_tag.length > 0){
                    c_details.video_tag.forEach(element1 => {
                      video_tag_arr.push(element1)
                    });
                  }
                  // timestamp_data_arr =  timestamp_data_arr.filter((value,index)=>timestamp_data_arr.indexOf(value)!== index)
                  courses.course_details= courses.course_details.unshift({_id:c_details._id ,video_title:c_details.video_title,video_description:c_details.video_description,video_embed_link:c_details.video_embed_link,video_thumbnail:c_details.video_thumbnail,video_timestamp:timestamp_data_arr,video_tag:video_tag_arr})
                  
                }
                arr.push(c_details.video_id)
          
            });//course loop
             //  arr.push(req.query.video_id)
      
              //checking for timestamp data
              if(courses.course_details[0].video_timestamp.length > 0){
      
                courses.course_details[0].video_timestamp.forEach(timestamp_data => {
                      
                  var regExp = /((([0-9]?[0-9]):([0-5]?[0-9]):([0-5]?[0-9])|([0-5]?[0-9]):([0-5]?[0-9])))/g
      
                  var letter_regex =  /[a-zA-Z](.*)[a-zA-Z\?/!@]/g;
                      
                  var match_elem =  timestamp_data.match(regExp)
                  
                  var match_lettr = timestamp_data.match(letter_regex)
                  
                  timestamp_arr.push({time:match_elem , title:match_lettr})
                  // timestamp_arr = removeDuplicates( timestamp_arr, "time");
      
                });//for timestamp
                  
              }//if timestamp
              
            }//courses length if
              
        
                one_section.push({video_id:null})
                courses.course_details.forEach(c_details => {
      
                  desc_arr.push({_id:c_details._id, v_desc:c_details.video_description})
      
                });
                var course_title = courses.course_title.trim();
                var video_title = courses.course_details[0].video_title.trim();
      
                  return res.render('view_course' ,{'count':count,'course_title':course_title,'video_title':video_title,'meta_video_id':courses.course_details[0].video_id,'meta_video_desc':courses.course_details[0].video_description.substring(0,100),'meta_video_thumbnail':courses.course_details[0].video_thumbnail, 'meta_video_title':courses.course_details[0].video_title,'data':courses, 'desc_arr':desc_arr[0],'categories':categories,'category':filter_arr,'timestamp_arr' :timestamp_arr, 'video' :arr ,'section_boolean':1, 'section_timestamp':section_timestamp,'first_section':one_section,'cat_name':category});
                }
            else {
              one_section = []
              desc_arr = []
              //looping through response 
              course_sections.forEach(section_data => {
                section_data.course_section.forEach(courses =>{
                  courses.course_details.forEach(c_ids => {
                    section_data.complete_course_id.course_details.forEach(data => {
                              
                      if(data._id == c_ids.course_id){
                        c_ids.title = data.video_title
  
                        courses.course_details.push( {course_id:data._id , _id:c_ids._id ,video_title:c_ids.title,video_description:data.video_description,video_embed_link:data.video_embed_link,video_thumbnail:data.video_thumbnail,video_id:data.video_id,video_timestamp:data.video_timestamp})
                                  
                        courses.course_details = removeDuplicates( courses.course_details, "_id");
                            
                      }//if match id
                          
                    });// course id
                      
                  })//course details id
  
                })//course section data
                
              section_data = course_sections
  
            })//course response data loop
  
              // removing the duplicate course's
                 for( var index=0; index<course_sections.length; index++){
                  for (let index1 = 0; index1 < course_sections[index].course_section.length; index1++) {
  
                      for (let index11 = 0; index11 < course_sections[index].course_section[index1].course_details.length; index11++) {
                        const element1 =  course_sections[index].course_section[index1].course_details[index11].course_id;
                        for( var i=0; i<courses.course_details.length; i++){
  
                        if( (courses.course_details[i]._id == element1)){
  
                          courses.course_details.splice(i, 1);
                    }
                  }
              }
            }
          }
          if(course_sections.length > 0 ){
            for (let index = 0; index < course_sections.length; index++) {
  
            for (let index1 = 0; index1 < course_sections[index].course_section.length; index1++) {
              for (let index2 = 0; index2 < course_sections[index].course_section[index1].course_details.length; index2++) {
                const element =  course_sections[index].course_section[index1].course_details[index2];
                const element1 =  course_sections[index].course_section[index1].course_details[index2];
                const element2 =  course_sections[index].course_section[index1].course_details[index2]
                const element3 =  course_sections[index].course_section[index1].course_details[index2]
                if(element3.video_description != null){
                  element3.video_description = element3.video_description
                }
  
                if(course_sections[index].course_section[index1].course_details[index2].video_timestamp.length > 0){
  
                  course_sections[index].course_section[index1].course_details[index2].video_timestamp.forEach(timestamp_data => {
           
  
                    var regexExp = /((([0-9]?[0-9]):([0-5]?[0-9]):([0-5]?[0-9])|([0-5]?[0-9]):([0-5]?[0-9])))/g
        
                    var lettr_regex =  /[a-zA-Z](.*)[a-zA-Z\?/!@]/g;
                        
                    var match_element =  timestamp_data.match(regexExp)
                    
                    var match_letter = timestamp_data.match(lettr_regex)
                    
                    section_timestamp.push({time:match_element , title:match_letter})
            
                  });//for timestamp
                    
                }//if timestamp
  
                one_section.push({video_title:element.video_title,video_id:element1.video_id,video_embed_link:element2.video_embed_link,video_desc:element3.video_description,video_thumbnail:element.video_thumbnail})
                desc_arr.push({_id:element._id, v_desc:element.video_description})
  
              }
  
            }
              
            }
          }
          var course_title = courses.course_title.trim();
          var video_title = one_section[0].video_title.trim();

          return res.render('view_course' ,{'count':count,'course_title':course_title,'video_title':video_title,'course_sections':course_sections,'meta_video_title':one_section[0].video_title,'meta_video_desc':one_section[0].video_desc.substring(0,100),'meta_video_thumbnail':one_section[0].video_thumbnail,'desc_data':desc_arr,'video_desc' : desc,'categories':categories,'data':courses, 'timestamp_arr' :timestamp_arr,'category': filter_arr, 'video' :arr ,'section_boolean':0,'section_timestamp':section_timestamp,'first_section':one_section[0],'cat_name':category});
  
          }
            
        }); // main exec 
  
      })// courses
    });
  
  
        }
    });
  
    }); //courses categories
    
   });
  }
  
}
});//view courses route

app.get('/getCourseVideo',function (req,res,next ){
  var section_arr = []
  var videoId = []
  var sections = []
  Course.findOne({g_course:"false",
    $or: [
    { 'course_name': req.query.course },
    {'course_details.video_id':req.query.video_id}
    ]
    }).where({uid:req.query.uid})
    .populate('user')
    .exec((err, data)=>{
        if(data!= null){
          CourseSection.findOne({complete_course_id:data._id})
        .populate({
        path:'complete_course_id',
        select:'course_details',
        })
        .populate({
          path:'complete_course_id',
          select:'user',
          })
        .exec((err, course_sections) =>{
        if(err){
        return next(err);
        }
        if(course_sections == null){
          if(data != null){
            data.course_details.forEach( function (element ,index ) {
              if(!req.query.video_id){
              if(index == 0){
                section_arr.push(element)
                videoId.push(element.video_id)
              }
              }
              if(req.query.video_id){
                if(element.video_id == req.query.video_id ){
                  section_arr.push(element)
                  videoId.push(element.video_id)

                }
              }

            });
          }
          return res.render('getVideo' ,{'data':data ,'arr':section_arr ,'video_id':videoId[0]})
        }
        if(course_sections != null){
          if(!req.query.video_id){
          if( course_sections.course_section.length > 0){
            course_sections.course_section.forEach(element => {
            if(element.course_details.length > 0){
            element.course_details.forEach(c_data => {
            for( var i= 0 ; i< data.course_details.length; i++){
            
            if(c_data.course_id.toString() == data.course_details[i]._id ){
              videoId.push(data.course_details[0].video_id);
              
              section_arr.push({'_id':data.course_details[0]._id,'video_title':data.course_details[0].video_title, 'video_description':data.course_details[0].video_description ,'video_thumbnail':data.course_details[0].video_thumbnail ,'video_id':data.course_details[0].video_id ,'video_timestamp':data.course_details[0].video_timestamp  })
            
              sections.push({'_id':data.course_details[i]._id , 'video_title':data.course_details[i].video_title,'video_description':data.course_details[i].video_description, 'video_thumbnail':data.course_details[i].video_thumbnail,'video_id':data.course_details[i].video_id,'video_embed_link':data.course_details[i].video_embed_link})
              data.course_details.splice(i, 1);
              data.course_details = removeDuplicates(data.course_details , '_id')
              sections = removeDuplicates(sections , 'video_title')
            
            }
            }
          
            })
            }
            });
          }
            }
            if(req.query.video_id){
              section_arr = []
              videoId = []
              if(data.course_details.length > 0){
                data.course_details.forEach(element => {
                  if(element.video_id == req.query.video_id){
                    section_arr.push({'video_desc': element.video_description, 'video_title':element.video_title ,'video_id':req.query.video_id})
                    videoId.push(section_arr[0].video_id)
                  }
                });
              }
            }
          res.render(
            'getVideo',
            { 'data':data ,'video_id':videoId[0],'arr':section_arr
         })
        }
        
        })
        }
        
        
    })
})
//---------------------------------------------------------------------
  // course view page
//---------------------------------------------------------------------
app.get('/view-course', function(req, res,next) {
  
  headerData(req,res,next);
  
})

function headerData (req,res,next) {
  var arr_data = []
  var sub_categories_data = []
  var sub_arr_data = []
  var video = []
  var course_data = []
  var image_preview = []
  var c_id = []
  var sections = []
  sess = req.session;
  var googleUrl ;
  var isMobile = isCallerMobile(req);

//   // handle the case where we don't detect the browser
//   var parser = new UAParser();
//   var ua = req.headers['user-agent'];
//   var browserName = parser.setUA(ua).getBrowser().name;
//   var fullBrowserVersion = parser.setUA(ua).getBrowser().version;
//   var browserVersion = fullBrowserVersion.split(".",1).toString();
//   var browserNamE;

// if (browserName == 'IE' && browserVersion >= 9){
//   browserNamE = 'IE';
// }
// else if (browserName == 'Firefox' && browserVersion >= 24){
//   browserNamE = 'Firefox';
// }

// else if (browserName == 'Chrome' && browserVersion >= 29){
//   browserNamE = 'Chrome';
// }

// else if (browserName == 'Safari' && browserVersion >= 5){
//   browserNamE = 'Safari';
// }

// else{
//   browserNamE = 'Other';

// }

  //finding the categories for course
  Course.find({g_course:"false"})
  .populate('cat_id')
  
  .exec((err, courses_cat_data)=>{
  if (err) return next(err);
  
  if(courses_cat_data == null){
  if (err) return next(err);
  
  }
  if(courses_cat_data.length > 0){
  
  //loopthrough the courses to get categories
  courses_cat_data.forEach(element => {
  sub_categories_data = []
  
  if(element.cat_id != null){
  if(parseInt(element.cat_id.id) == parseInt(element.course_meta_category) ){
  element.cat_id.sub_categories.forEach(elem => {
  if(parseInt(elem.id) == parseInt(element.course_sub_category ) ){
  sub_arr_data.push({id:element.cat_id.id, sub_id:elem.id,sub_name:elem.name})
  sub_arr_data = removeDuplicates( sub_arr_data, "sub_name");
  arr_data.push({_id:element.cat_id._id,
  id:element.cat_id.id,name:element.cat_id.name ,sub_categories:sub_categories_data,
  uid:element.uid,
  course_name:element.course_name})
  }
  });
  
  } //element cat id
  
  }//element cat
  
  });//courses_cat
  
  }//if
  //removing duplicates
  let filter_arr_data = arr_data.reduce(function(acc_data, curr_id) {
  let findIndex = acc_data.findIndex(function(item) {
  return item.id === curr_id.id
  
  })
  if (findIndex === -1) {
  acc_data.push(curr_id)
  }
  else{
  }
  return acc_data
  }, [])
  
  filter_arr_data.forEach(elem => {
  sub_arr_data.forEach(element => {
  if(elem.id == element.id){
  elem.sub_categories.push({sub_id:element.sub_id,sub_name:element.sub_name})
  }
  });
  });//filter_arr_data
  
  Categories.find({}).exec((err,cat_data) =>{
  if (err) return next(err);
  Course.findOne({g_course:"false",
  $or: [
  { 'course_name': req.query.course },
  {'course_details.video_id':req.query.video_id}
  ]
  }).where({uid:req.query.uid})
  .populate('user')
  .exec((err, obj) =>{
  if(err){
  return next(err);
  
  }
  // if(obj != null){
  //   var googleDriveReg = /http(s)?:\/\/drive.google.com.*/gi;
  //   var googlePhotoReg = /http(s)?:\/\/lh3.googleusercontent.com.*/gi;
  //   var driveRegex = new RegExp(googleDriveReg);
  //   var photosRegex = new RegExp(googlePhotoReg);

  //   if (obj.video_link.match(driveRegex)) {
  //       console.log("Successful match");
  //       var parts = obj.video_link.match(/&id=(.+)/);

  //       if (parts == null || parts.length < 2) {
        
  //          googleUrl = "false";
  //       } else {
       
  //         const videoUrl = "https://drive.google.com/uc?export=view&id="+parts[1];
  //         googleUrl = "true";
  //       }

  //   }
  //   else if(obj.video_link.match(photosRegex)){
  //     console.log("Successful google photos match");
  //   }
  //   else {
  //     console.log("No match");
  //     googleUrl = "false";
  //   }
  // }
  if(req.query.video_id){
    if(obj != null){
  if(obj.course_details.length > 0){
  for (let index = 0; index < obj.course_details.length; index++) {
  const element = obj.course_details[index];
  if(element.video_id == req.query.video_id){
  image_preview.push(element.video_thumbnail);
  image_preview = image_preview[0]
  c_id.push(element._id)

  }
  }
  }
}
  }
  else{
  if(obj != null){
  image_preview.push(obj.image_preview);
  image_preview = image_preview[0]
  if(obj.course_details.length > 0){
    c_id.push(obj.course_details[0]._id)

  }
  }
  }
  
  if(obj != null){
  CourseSection.findOne({complete_course_id:obj._id})
  .populate({
  path:'complete_course_id',
  select:'course_details',
  })
  .populate({
    path:'complete_course_id',
    select:'user',
    })
  .exec((err, course_sections) =>{
  if(err){
  return next(err);
  }
  
  if(course_sections == null){
  if(obj != null){
  if(obj.course_details.length > 0){
  
  if(req.query.video_id){
  obj.course_details.forEach(element => {
  if(element.video_id == req.query.video_id){
  video.push(element.video_id);
  course_data.push({'video_desc': element.video_description, 'video_title':element.video_title ,'video_id':element.video_id})
  c_id.push(element._id)

}
  });
  }else if(!req.query.video_id){
  video.push(obj.course_details[0].video_id);
  course_data.push({'count':obj.course_details.length,'video_desc': obj.course_details[0].video_description, 'video_id':obj.course_details[0].video_id,'video_title':obj.course_details[0].video_title})
  c_id.push(obj.course_details[0]._id)

  }
  
  if(sess.user) {
  Favorites.findOne({user:sess.user}).where({course_id:obj._id})
  .populate('user')
  .populate('course_id')
  .exec((err, fav_course) =>{
  if(err){
  return (err);
  }
  User.findOne({_id:sess.user})
  .exec((err, user_data) => {
      if (err) return next(err);

      if (user_data == null) {
          if (err) return next(err);

      }
  if(fav_course == null || fav_course.length == 0){
       if (isMobile) {
          return res.render('mobile-ui/course-view',{'c_id':c_id,'user_info':user_data,'googleUrl':googleUrl,'count':obj.course_details.length,'fav_courses':null,'nonsections':null,'image_preview':image_preview,'course':obj,'course_data':course_data, 'video':video, 'role':sess.email,'user':sess.user,'isLoggedIn':true, 'categories':filter_arr_data ,'allcategories':cat_data,'bool_section_check':false})
      }
      else{
          return res.render('view-course',{'c_id':c_id,'user_info':user_data,'googleUrl':googleUrl,'count':obj.course_details.length,'fav_courses':null,'nonsections':null,'image_preview':image_preview,'course':obj,'course_data':course_data, 'video':video, 'role':sess.email,'user':sess.user,'isLoggedIn':true, 'categories':filter_arr_data ,'allcategories':cat_data,'bool_section_check':false})

      }

  }

  else if(fav_course.length > 0){
      if (isMobile) {
          res.render('mobile-ui/course-view',{'c_id':c_id,'user_info':user_data,'count':obj.course_details.length, 'googleUrl':googleUrl,'fav_courses':fav_course,'nonsections':null,'course':obj ,'image_preview':image_preview,'course_data':course_data, 'user':sess.user, 'role':sess.email,'video':video,'isLoggedIn':true,'categories':filter_arr_data ,'allcategories':cat_data,'bool_section_check':false})
      }
      else{
          res.render('view-course',{'c_id':c_id,'user_info':user_data,'count':obj.course_details.length,'googleUrl':googleUrl, 'fav_courses':fav_course,'nonsections':null,'course':obj ,'image_preview':image_preview,'course_data':course_data, 'user':sess.user, 'role':sess.email,'video':video,'isLoggedIn':true,'categories':filter_arr_data ,'allcategories':cat_data,'bool_section_check':false})
      }

  }
})
  })
  }
  else{
      if (isMobile) {
          res.render('mobile-ui/course-view',{'c_id':c_id,'googleUrl':googleUrl,'count':obj.course_details.length,'fav_courses':null,'nonsections':null,'image_preview':image_preview,'course':obj,'course_data':course_data, 'video':video, 'role':sess.email,'user':sess.user,'isLoggedIn':false, 'categories':filter_arr_data ,'allcategories':cat_data,'bool_section_check':false})
      }
      else{
          res.render('view-course',{'c_id':c_id,'googleUrl':googleUrl,'count':obj.course_details.length,'fav_courses':null,'nonsections':null,'image_preview':image_preview,'course':obj,'course_data':course_data, 'video':video, 'role':sess.email,'user':sess.user,'isLoggedIn':false, 'categories':filter_arr_data ,'allcategories':cat_data,'bool_section_check':false})

      }

  }
  }
  else{
    console.log("=====no course details ====");
   
  }
  }
  }
  else if(course_sections != null){
  if( course_sections.course_section.length > 0){
  course_sections.course_section.forEach(element => {
  if(element.course_details.length > 0){
  element.course_details.forEach(c_data => {
  for( var i= 0 ; i< obj.course_details.length; i++){
  
  if(c_data.course_id.toString() == obj.course_details[i]._id ){
  video.push(obj.course_details[i].video_id);
  course_data.push({'video_title':obj.course_details[0].video_title, 'video_desc':obj.course_details[0].video_description})
  
  sections.push({'_id':obj.course_details[i]._id , 'video_title':obj.course_details[i].video_title,'video_description':obj.course_details[i].video_description, 'video_thumbnail':obj.course_details[i].video_thumbnail,'video_id':obj.course_details[i].video_id,'video_embed_link':obj.course_details[i].video_embed_link})
  obj.course_details.splice(i, 1);
  obj.course_details = removeDuplicates(obj.course_details , '_id')
  course_data = removeDuplicates(course_data , 'video_title')
  
  }
  }
  })
  }
  });
  
  }
  if(course_sections.course_section.length== 0){
    CourseSection.findOneAndRemove({_id:course_sections._id})
    .exec((err , result) =>{
      if(err){
        return next()
      }
      course_data.push({'video_desc': obj.course_details[0].video_description, 'video_title':obj.course_details[0].video_title ,'video_id':obj.course_details[0].video_id})
    
    })
  }
  if(video.length > 0){
    video = video[0]
    }
  if(req.query.video_id){
  if(sections.length > 0){
  course_data = []
  video = []
  for (let index = 0; index < sections.length; index++) {
  const element = sections[index];
  if(element.video_id == req.query.video_id){
  video.push(req.query.video_id);
  
  course_data.push({'video_desc': element.video_description, 'video_title':element.video_title ,'video_id':req.query.video_id})
  c_id.push(element._id)

}
  
  else{
    if(obj.course_details.length > 0){
      obj.course_details.forEach(element => {
        if(element.video_id == req.query.video_id){
          course_data.push({'video_desc': element.video_description, 'video_title':element.video_title ,'video_id':req.query.video_id})
          video = course_data[0].video_id
          c_id.push(course_data[0]._id)

        }
      });
    }
  }
  
  }
  }
  
  }
  
  if(sess.user) {
  Favorites.findOne({user:sess.user}).where({course_id:obj._id})
  .populate('user')
  .populate('course_id')
  .exec((err, fav_course) =>{
  if(err){
  return (err);
  }
    User.findOne({_id:sess.user})
    .exec((err, user_data) => {
        if (err) return next(err);

        if (user_data == null) {
            if (err) return next(err);

        }
  if(fav_course == null || fav_course.length == 0){
      if (isMobile) {
          return res.render('mobile-ui/course-view',{'c_id':c_id,'googleUrl':googleUrl,'user_info':user_data,'count':obj.course_details.length,'fav_courses':null,'image_preview':image_preview,'course':obj,'course_data':course_data,'nonsections':obj, 'video':video, 'role':sess.email,'user':sess.user,'isLoggedIn':true, 'categories':filter_arr_data ,'allcategories':cat_data,'bool_section_check':true})
      }
      else{
          return res.render('view-course',{'c_id':c_id,'googleUrl':googleUrl,'user_info':user_data,'count':obj.course_details.length,'fav_courses':null,'image_preview':image_preview,'course':obj,'course_data':course_data,'nonsections':obj, 'video':video, 'role':sess.email,'user':sess.user,'isLoggedIn':true, 'categories':filter_arr_data ,'allcategories':cat_data,'bool_section_check':true})
      }
  }
 
   if(fav_course!= null){
      if (isMobile) {
          res.render('mobile-ui/course-view',{'c_id':c_id,'googleUrl':googleUrl,'user_info':user_data,'role':sess.email, 'fav_courses':fav_course,'count':obj.course_details.length,'image_preview':image_preview,'sections':sections , 'nonsections':obj,'video':video,'course':obj, 'course_data':course_data,'user':sess.user,'categories':filter_arr_data ,'isLoggedIn':true,'allcategories':cat_data ,'bool_section_check':true})
      }
      else{
          res.render('view-course',{'c_id':c_id,'googleUrl':googleUrl,'user_info':user_data,'role':sess.email, 'fav_courses':fav_course,'count':obj.course_details.length,'image_preview':image_preview,'sections':sections , 'nonsections':obj,'video':video,'course':obj, 'course_data':course_data,'user':sess.user,'categories':filter_arr_data ,'isLoggedIn':true,'allcategories':cat_data ,'bool_section_check':true})
      }

   }
  })
  })
  }
  else{
      if (isMobile) {
          res.render('mobile-ui/course-view',{'c_id':c_id,'googleUrl':googleUrl,'count':obj.course_details.length,'fav_courses':null,'image_preview':image_preview,'course':obj,'course_data':course_data,'nonsections':obj, 'video':video, 'role':sess.email,'user':sess.user,'isLoggedIn':false, 'categories':filter_arr_data ,'allcategories':cat_data,'bool_section_check':true})
      }
      else{
          res.render('view-course',{'c_id':c_id,'googleUrl':googleUrl,'count':obj.course_details.length,'fav_courses':null,'image_preview':image_preview,'course':obj,'course_data':course_data,'nonsections':obj, 'video':video, 'role':sess.email,'user':sess.user,'isLoggedIn':false, 'categories':filter_arr_data ,'allcategories':cat_data,'bool_section_check':true})

      }

  }
  }
  })//course section find
  }
  else{
  res.render('not-found');
  
  }
  })//courses find
  })//categories find
  
  });//course category
  }
    //---------------------------------------------------------------------
    // mobile login page
  //---------------------------------------------------------------------
  app.get('/mobile-login', function(req, res,next) {
    var arr = []
   var sub_categories = []
   var sub_arr = []
   sess = req.session;

   var perPage = parseInt(req.query.currentPage || 9)
   const page = parseInt(req.query.page || 1); // Page 

   Course.countDocuments().exec(function(err, count) {
       if (err) return next(err);

       Course.find({g_course:"false"}).skip((perPage * page) - perPage).sort({'fav_count':-1})
           .limit(perPage)
           .populate('cat_id')

       .exec((err, courses_cat) => {
           if (err) return next(err);

           if (courses_cat == null) {
               if (err) return next(err);

           }
           if (courses_cat.length > 0) {

               //loopthrough the courses to get categories
               courses_cat.forEach(element => {
                   sub_categories = []

                   if (element.cat_id != null) {

                       if (parseInt(element.cat_id.id) == parseInt(element.course_meta_category)) {
                           element.cat_id.sub_categories.forEach(elem => {
                               if (parseInt(elem.id) == parseInt(element.course_sub_category)) {
                                   sub_arr.push({ id: element.cat_id.id, sub_id: elem.id, sub_name: elem.name })
                                   sub_arr = removeDuplicates(sub_arr, "sub_name");
                                   arr.push({
                                       _id: element.cat_id._id,
                                       id: element.cat_id.id,
                                       name: element.cat_id.name,
                                       sub_categories: sub_categories,
                                       uid:element.uid,
                                       course_name:element.course_name
                                   })

                               }

                           });
                       }
                   }
               }); //courses_cat

           } //if  

           //removing duplicates
           let filter_arr = arr.reduce(function(acc, curr) {
               let findIndex = acc.findIndex(function(item) {
                   return item.id === curr.id

               })
               if (findIndex === -1) {
                   acc.push(curr)

               } else {

               }
               return acc
           }, [])

           filter_arr.forEach(elem => {
               sub_arr.forEach(element => {
                   if (elem.id == element.id) {
                       elem.sub_categories.push({ sub_id: element.sub_id, sub_name: element.sub_name })
                   }

               });

           });
           Categories.find({}).exec((err, cat_data) => {
               if (err) return next(err);
               Course.find({}).skip((perPage * page) - perPage).sort({'fav_count':-1})
               .limit(perPage)
               .populate('cat_id')

           .exec((err, courses) => {
               if (err) return next(err);

               if (courses == null) {
                   if (err) return next(err);

               } else {
                   res.render('mobile-ui/login.ejs', {
                       'categories': filter_arr,
                       'user': sess.user,
                       'isLoggedIn': false,
                       'allcategories': cat_data,
                       currentPage: page,
                       pages: Math.ceil(count / perPage),
                       'courses': courses
                   })
               }


           })
       // }

   })
 
})

}); //courses

 })

 app.get('/mobile-signup', function(req, res,next) {
   var arr = []
  var sub_categories = []
  var sub_arr = []
  sess = req.session;

  var perPage = parseInt(req.query.currentPage || 9)
  const page = parseInt(req.query.page || 1); // Page 

  Course.countDocuments().exec(function(err, count) {
      if (err) return next(err);

      Course.find({g_course:"false"}).skip((perPage * page) - perPage).sort({'fav_count':-1})
          .limit(perPage)
          .populate('cat_id')

      .exec((err, courses_cat) => {
          if (err) return next(err);

          if (courses_cat == null) {
              if (err) return next(err);

          }
          if (courses_cat.length > 0) {

              //loopthrough the courses to get categories
              courses_cat.forEach(element => {
                  sub_categories = []

                  if (element.cat_id != null) {

                      if (parseInt(element.cat_id.id) == parseInt(element.course_meta_category)) {
                          element.cat_id.sub_categories.forEach(elem => {
                              if (parseInt(elem.id) == parseInt(element.course_sub_category)) {
                                  sub_arr.push({ id: element.cat_id.id, sub_id: elem.id, sub_name: elem.name })
                                  sub_arr = removeDuplicates(sub_arr, "sub_name");
                                  arr.push({
                                      _id: element.cat_id._id,
                                      id: element.cat_id.id,
                                      name: element.cat_id.name,
                                      sub_categories: sub_categories,
                                      uid:element.uid,
                                      course_name:element.course_name
                                  })

                              }

                          });
                      }
                  }
              }); //courses_cat

          } //if  

          //removing duplicates
          let filter_arr = arr.reduce(function(acc, curr) {
              let findIndex = acc.findIndex(function(item) {
                  return item.id === curr.id

              })
              if (findIndex === -1) {
                  acc.push(curr)

              } else {

              }
              return acc
          }, [])

          filter_arr.forEach(elem => {
              sub_arr.forEach(element => {
                  if (elem.id == element.id) {
                      elem.sub_categories.push({ sub_id: element.sub_id, sub_name: element.sub_name })
                  }

              });

          });
          Categories.find({}).exec((err, cat_data) => {
              if (err) return next(err);
              Course.find({}).skip((perPage * page) - perPage).sort({'fav_count':-1})
              .limit(perPage)
              .populate('cat_id')

          .exec((err, courses) => {
              if (err) return next(err);

              if (courses == null) {
                  if (err) return next(err);

              } else {
                  res.render('mobile-ui/signup.ejs', {
                      'categories': filter_arr,
                      'user': sess.user,
                      'isLoggedIn': false,
                      'allcategories': cat_data,
                      currentPage: page,
                      pages: Math.ceil(count / perPage),
                      'courses': courses
                  })
              }


          })
      // }

  })

})

}); //courses

})

//---------------------------------------------------------------------
  // user favorites
//---------------------------------------------------------------------
app.get('/favorite_courses/:id', function(req, res,next) {
  sess = req.session;
  var isMobile = isCallerMobile(req);

  if(sess.email == "Admin" || sess.email =="Creator" || sess.email == "Normal User"){
  try {

  // GET some data from whereever
  var arr            = []
  var sub_categories = []
  var sub_arr        = []
  var fav_arr = []
  Course.find({g_course:"false"}) 
  .populate('cat_id')

  .exec((err, courses_cat)=>{
    if (err) return next (err);

    if(courses_cat == null){
      if (err) return next (err);

    }
    if(courses_cat.length > 0){
    //loopthrough the courses to get categories
      courses_cat.forEach(element => {
      sub_categories = []

      if(element.cat_id != null){
          
        if(parseInt(element.cat_id.id) == parseInt(element.course_meta_category) ){
          element.cat_id.sub_categories.forEach(elem => {
            if(parseInt(elem.id) == parseInt(element.course_sub_category )   ){
              sub_arr.push({id:element.cat_id.id, sub_id:elem.id,sub_name:elem.name})
                sub_arr = removeDuplicates( sub_arr, "sub_name");
                arr.push({_id:element.cat_id._id,
                  id:element.cat_id.id,name:element.cat_id.name ,sub_categories:sub_categories,
                  uid:element.uid,
                  course_name:element.course_name})
                        
                }
        
              });  
            }   
          }     
        });//courses_cat

      }//if  
      
      //removing duplicates
      let filter_arr = arr.reduce(function(acc, curr) {
        let findIndex = acc.findIndex(function(item) {
        return item.id === curr.id

        })
        if (findIndex === -1) {
            acc.push(curr)
        
        }
        else{
        
        }
        return acc
      }, [])

      filter_arr.forEach(elem => {
          sub_arr.forEach(element => {
              if(elem.id == element.id){
                  elem.sub_categories.push({sub_id:element.sub_id,sub_name:element.sub_name})
              }
          });
      });

      Categories.find({}).exec((err,cat_data) =>{
        if (err) return next (err);
      
        Favorites.find({user:sess.user})
        .populate('user')
        .populate('course_id')

        .exec((err,fav_courses) =>{
        if (err) return next (err);
        if(fav_courses == null){
          return next();
        }
        if(fav_courses != null && fav_courses.length > 0){
          for (let index = 0; index < fav_courses.length; index++) {
            const course_detail = fav_courses[index].course_id;
            const user_name = fav_courses[index].user.name;
            if(course_detail != null && user_name!= null){
              if (course_detail.course_details.length == 0){
  
                return false;
              }
  
              else{
                if( course_detail.course_details[0].video_description!= null || course_detail.course_details[0].video_description!="" ){
                  course_detail.course_details[0].video_description = course_detail.course_details[0].video_description.toString();
                  course_detail.course_details[0].video_description =  course_detail.course_details[0].video_description.replace(/<\s*\/?br\s*[\/]?>/gi,"\n");

                }
             
              }
              fav_arr.push({course_details:course_detail.course_details,_id:course_detail._id,fav_count:course_detail.fav_count,fav_id:fav_courses[index]._id,uid:course_detail.uid,course_title:course_detail.course_title,video_link:course_detail.video_link,user:user_name ,image_preview:course_detail.image_preview,favorite_bool:fav_courses[index].favorite_bool,course_name:course_detail.course_name})

            }

        }
          fav_arr =  fav_arr.sort((a, b) => b.fav_count - a.fav_count);
        }

          if(sess.user){
            User.findOne({_id:sess.user})
            .exec((err, user_data) => {
                if (err) return next(err);

                if (user_data == null) {
                    if (err) return next(err);

                }
                if(isMobile){
                  res.render('mobile-ui/favorites',{ 'user_info':user_data,'role':sess.email,'my_fav':fav_arr,'categories':filter_arr ,'allcategories':cat_data,'isLoggedIn':true,'user':sess.user,
                })
                }
                else{
                  res.render('myfavorites',{ 'user_info':user_data,'role':sess.email,'my_fav':fav_arr,'categories':filter_arr ,'allcategories':cat_data,'isLoggedIn':true,'user':sess.user,
                }) 
                }
          
        })
        }
        else{
          res.redirect('/')
        }
          })

          })

          })
    
        } catch(err) {
          console.log(err);
          return null;
        }
      }
      else{
        res.render('authentication-failed');

      }

})

app.get('/add_course', function(req, res,next) {
  sess = req.session;
var isMobile = isCallerMobile(req);

  if(sess.email == "Admin" || sess.email =="Creator" || sess.email == "Normal User"){
  try {

  // GET some data from whereever
  var arr            = []
  var sub_categories = []
  var sub_arr        = []
  var fav_arr = []
  Course.find({g_course:"false"}) 
  .populate('cat_id')

  .exec((err, courses_cat)=>{
    if (err) return next (err);

    if(courses_cat == null){
      if (err) return next (err);

    }
    if(courses_cat.length > 0){
    //loopthrough the courses to get categories
      courses_cat.forEach(element => {
      sub_categories = []

      if(element.cat_id != null){
          
        if(parseInt(element.cat_id.id) == parseInt(element.course_meta_category) ){
          element.cat_id.sub_categories.forEach(elem => {
            if(parseInt(elem.id) == parseInt(element.course_sub_category )   ){
              sub_arr.push({id:element.cat_id.id, sub_id:elem.id,sub_name:elem.name})
                sub_arr = removeDuplicates( sub_arr, "sub_name");
                arr.push({_id:element.cat_id._id,
                  id:element.cat_id.id,name:element.cat_id.name ,sub_categories:sub_categories,
                  uid:element.uid,
                  course_name:element.course_name})
                        
                }
        
              });  
            }   
          }     
        });//courses_cat

      }//if  
      
      //removing duplicates
      let filter_arr = arr.reduce(function(acc, curr) {
        let findIndex = acc.findIndex(function(item) {
        return item.id === curr.id

        })
        if (findIndex === -1) {
            acc.push(curr)
        
        }
        else{
        
        }
        return acc
      }, [])

      filter_arr.forEach(elem => {
          sub_arr.forEach(element => {
              if(elem.id == element.id){
                  elem.sub_categories.push({sub_id:element.sub_id,sub_name:element.sub_name})
              }
          });
      });

      Categories.find({}).exec((err,cat_data) =>{
        if (err) return next (err);
      
        Favorites.find({user:sess.user})
        .populate('user')
        .populate('course_id')

        .exec((err,fav_courses) =>{
        if (err) return next (err);
        if(fav_courses == null){
          return next();
        }
        if(fav_courses != null && fav_courses.length > 0){
          for (let index = 0; index < fav_courses.length; index++) {
            const course_detail = fav_courses[index].course_id;
            const user_name = fav_courses[index].user.name;
            if(course_detail != null && user_name!= null){
              fav_arr.push({course_details:course_detail.course_details,_id:course_detail._id,fav_count:course_detail.fav_count,fav_id:fav_courses[index]._id,uid:course_detail.uid,course_title:course_detail.course_title,video_link:course_detail.video_link,user:user_name ,image_preview:course_detail.image_preview,favorite_bool:fav_courses[index].favorite_bool,course_name:course_detail.course_name})

            }

        }
          fav_arr =  fav_arr.sort((a, b) => b.fav_count - a.fav_count);
        }

          if(sess.user){
            User.findOne({_id:sess.user})
            .exec((err, user_data) => {
                if (err) return next(err);

                if (user_data == null) {
                    if (err) return next(err);

                }
                if(isMobile){
                  res.render('mobile-ui/add-course',{ 'user_info':user_data,'role':sess.email,'my_fav':fav_arr,'categories':filter_arr ,'allcategories':cat_data,'isLoggedIn':true,'user':sess.user,
                })
                }
                else{
                  
                }
        
        })
        }
        else{
          res.redirect('/')
        }
          })

          })

          })
    
        } catch(err) {
          console.log(err);
          return null;
        }
      }
      else{
        res.render('authentication-failed');

      }

})
app.get('/getFullPreview',function (req,res,next ){
  var section_arr = []
  var videoId = []
  var sections = []
  Course.findOne({g_course:"false",
    $or: [
    { 'course_name': req.query.course },
    {'course_details.video_id':req.query.video_id}
    ]
    }).where({uid:req.query.uid})
    .populate('user')
    .exec((err, data)=>{
        if(data!= null){
          CourseSection.findOne({complete_course_id:data._id})
        .populate({
        path:'complete_course_id',
        select:'course_details',
        })
        .populate({
          path:'complete_course_id',
          select:'user',
          })
        .exec((err, course_sections) =>{
        if(err){
        return next(err);
        }
        if(course_sections == null){
          if(data != null){
            data.course_details.forEach( function (element ,index ) {
              if(!req.query.video_id){
              if(index == 0){
                section_arr.push(element)
                videoId.push(element.video_id)
              }
              }
              if(req.query.video_id){
                if(element.video_id == req.query.video_id ){
                  section_arr.push(element)
                  videoId.push(element.video_id)

                }
              }

            });
          }
          return res.render('fullPreview' ,{'data':data ,'arr':section_arr ,'video_id':videoId[0]})
        }
        if(course_sections != null){
          if(!req.query.video_id){
          if( course_sections.course_section.length > 0){
            course_sections.course_section.forEach(element => {
            if(element.course_details.length > 0){
            element.course_details.forEach(c_data => {
            for( var i= 0 ; i< data.course_details.length; i++){
            
            if(c_data.course_id.toString() == data.course_details[i]._id ){
              videoId.push(data.course_details[0].video_id);
              
              section_arr.push({'_id':data.course_details[0]._id,'video_title':data.course_details[0].video_title, 'video_description':data.course_details[0].video_description ,'video_thumbnail':data.course_details[0].video_thumbnail ,'video_id':data.course_details[0].video_id ,'video_timestamp':data.course_details[0].video_timestamp  })
            
              sections.push({'_id':data.course_details[i]._id , 'video_title':data.course_details[i].video_title,'video_description':data.course_details[i].video_description, 'video_thumbnail':data.course_details[i].video_thumbnail,'video_id':data.course_details[i].video_id,'video_embed_link':data.course_details[i].video_embed_link})
              data.course_details.splice(i, 1);
              data.course_details = removeDuplicates(data.course_details , '_id')
              sections = removeDuplicates(sections , 'video_title')
            
            }
            }
          
            })
            }
            });
          }
            }
            if(req.query.video_id){
              section_arr = []
              videoId = []
              if(data.course_details.length > 0){
                data.course_details.forEach(element => {
                  if(element.video_id == req.query.video_id){
                    section_arr.push({'video_desc': element.video_description, 'video_title':element.video_title ,'video_id':req.query.video_id})
                    videoId.push(section_arr[0].video_id)
                  }
                });
              }
            }
          res.render(
            'fullPreview',
            { 'data':data ,'video_id':videoId[0],'arr':section_arr
         })
        }
        
        })
        }
        
        
    })
})
//---------------------------------------------------------------------
  // edit course sections
//---------------------------------------------------------------------
app.get('/edit_course_section/:id', function(req, res,next) {
  
  var arr            = []
  var sub_categories = []
  var sub_arr        = []
  sess = req.session;
  var boolean = false;
  var isMobile = isCallerMobile(req);
  var googleDriveReg = /http(s)?:\/\/drive.google.com.*/gi;
  var linkUrl ;

  if(sess.email == "Creator" || sess.email == "Admin"){

  Course.find({g_course:"false"}) 
  .populate('cat_id')

  .exec((err, courses_cat)=>{
    if (err) return next(err);

    if(courses_cat == null){
      if (err) return next(err);

    }
    if(courses_cat.length > 0){
    //loopthrough the courses to get categories
      courses_cat.forEach(element => {
      sub_categories = []

      if(element.cat_id != null){
          
        if(parseInt(element.cat_id.id) == parseInt(element.course_meta_category) ){
          element.cat_id.sub_categories.forEach(elem => {
            if(parseInt(elem.id) == parseInt(element.course_sub_category )   ){
              sub_arr.push({id:element.cat_id.id, sub_id:elem.id,sub_name:elem.name})
                sub_arr = removeDuplicates( sub_arr, "sub_name");
                arr.push({_id:element.cat_id._id,
                  id:element.cat_id.id,name:element.cat_id.name ,sub_categories:sub_categories,
                  uid:element.uid,
                  course_name:element.course_name})
                        
                }
        
              });  
            }   
          }     
        });//courses_cat

      }//if  
      
      //removing duplicates
      let filter_arr = arr.reduce(function(acc, curr) {
        let findIndex = acc.findIndex(function(item) {
        return item.id === curr.id

        })
        if (findIndex === -1) {
            acc.push(curr)
        
        }
        else{
        
        }
        return acc
      }, [])

      filter_arr.forEach(elem => {
          sub_arr.forEach(element => {
              if(elem.id == element.id){
                  elem.sub_categories.push({sub_id:element.sub_id,sub_name:element.sub_name})
              }
          });
      });

      Categories.find({}).exec((err,cat_data) =>{
        if (err) return next(err);

         //finding the categories for course
        Course.findOne({_id:req.params.id})
    
        .exec((err, course)=>{
          if (err) return next(err);

          CourseSection.findOne({complete_course_id:course._id})
          .populate({
            path:'complete_course_id',
            select:'course_details',
          })
          .exec((err, section)=>{
           if (err) return next(err);     

           if(section== null){
            var driveRegex = new RegExp(googleDriveReg);
            if (course.video_link.match(driveRegex)) {
              linkUrl = "true";
            }else{
              linkUrl = "false";
            }
            if (sess.user) {
              User.findOne({_id:sess.user})
              .exec((err, user_data) => {
                  if (err) return next(err);

                  if (user_data == null) {
                      if (err) return next(err);

                  }
                  if(isMobile){
                    res.render('mobile-ui/edit-course', {'editId':req.params.id,'linkUrl':linkUrl,'user_info':user_data,'categories':filter_arr , 'user':sess.user, 'isLoggedIn':true,'allcategories':cat_data,
                    'course':course, 'sections':section ,'sections_bool':boolean,'role':sess.email})
                     
                  }
                  else{
                    res.render('edit-coursesections', {'editId':req.params.id,'linkUrl':linkUrl,'user_info':user_data,'categories':filter_arr , 'user':sess.user, 'isLoggedIn':true,'allcategories':cat_data,
                    'course':course, 'sections':section ,'sections_bool':boolean,'role':sess.email})
                     
                  }
                })
            }
            else{
              res.redirect('/')
            }
           }
           else{
            var driveRegex = new RegExp(googleDriveReg);
            if (course.video_link.match(driveRegex)) {
              linkUrl = "true";
            }else{
              linkUrl = "false";
            }
            boolean = true
            //looping through response 
            section.course_section.forEach(courses =>{
               courses.course_details.forEach(c_ids => {
                 courses.course_details.forEach(data => {
                           
                   if(data._id == c_ids.course_id){
                     c_ids.title = data.video_title
 
                     courses.course_details.push( {course_id:data._id , _id:c_ids._id ,video_title:c_ids.title,video_description:data.video_description,video_embed_link:data.video_embed_link,video_thumbnail:data.video_thumbnail,video_id:data.video_id,video_timestamp:data.video_timestamp})
                               
                     courses.course_details = removeDuplicates( courses.course_details, "_id");
                         
                   }//if match id
                       
                 });// course id
                   
               })//course details id
 
             // })//course section data
             
             courses = section
 
         })//course response data loop
            if (sess.user) {
              User.findOne({_id:sess.user})
              .exec((err, user_data) => {
                  if (err) return next(err);

                  if (user_data == null) {
                      if (err) return next(err);

                  }
                  if(isMobile){
                    res.render('mobile-ui/edit-course', {'editId':req.params.id,'linkUrl':linkUrl,'user_info':user_data,'categories':filter_arr , 'user':sess.user, 'isLoggedIn':true,'allcategories':cat_data,
                    'course':course, 'sections':section ,'sections_bool':boolean ,'role':sess.email})
                  }
                  else{
                    res.render('edit-coursesections', {'editId':req.params.id,'linkUrl':linkUrl,'user_info':user_data,'categories':filter_arr , 'user':sess.user, 'isLoggedIn':true,'allcategories':cat_data,
                    'course':course, 'sections':section ,'sections_bool':boolean ,'role':sess.email})
                  }
       
                })
            }
            else{
              res.redirect('/')
            }
           }
                
      })
    })
     
  })
})   
}
else{
  res.render('authentication-failed');
}   
})

// route for categories listup 
app.get('/category-list/:name', (req, res,next) => {
  
  var isMobile = isCallerMobile(req);

  sess = req.session;
  try{
// GET some data from whereever
var arr            = []
var sub_categories = []
var sub_arr        = []
var sub_arrr      = []

Course.find({g_course:"false"}) 
.populate('cat_id')

.exec((err, courses_cat)=>{
  if (err) return next (err);

  if(courses_cat == null){
    if (err) return next (err);

  }
  if(courses_cat.length > 0){
  //loopthrough the courses to get categories
    courses_cat.forEach(element => {
    sub_categories = []

    if(element.cat_id != null){
        
      if(parseInt(element.cat_id.id) == parseInt(element.course_meta_category) ){
        element.cat_id.sub_categories.forEach(elem => {
          if(parseInt(elem.id) == parseInt(element.course_sub_category )   ){
            sub_arr.push({id:element.cat_id.id, sub_id:elem.id,sub_name:elem.name})
              sub_arr = removeDuplicates( sub_arr, "sub_name");
              arr.push({_id:element.cat_id._id,
                id:element.cat_id.id,name:element.cat_id.name ,sub_categories:sub_categories})
                      
              }
      
            });  
          }   
        }     
      });//courses_cat

    }//if  
    
    //removing duplicates
    let filter_arr = arr.reduce(function(acc, curr) {
      let findIndex = acc.findIndex(function(item) {
      return item.id === curr.id

      })
      if (findIndex === -1) {
          acc.push(curr)
      
      }
      else{
      
      }
      return acc
    }, [])

    filter_arr.forEach(elem => {
        sub_arr.forEach(element => {
            if(elem.id == element.id){
                elem.sub_categories.push({sub_id:element.sub_id,sub_name:element.sub_name})
            }
        });
    });
    Categories.findOne({'name' :req.params.name})
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
            Course.find({'cat_id':result._id}).sort({fav_count:-1})
            .populate('user')
            .populate('cat_id')
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
                    var count = obj1.length;
                    if(obj1 != null){
                      if (obj1.length > 0) {
                  
                          //loopthrough the courses to get categories
                          obj1.forEach(element => {
                  
                              if (element.cat_id != null) {
                  
                                  if (parseInt(element.cat_id.id) == parseInt(element.course_meta_category)) {
                                      element.cat_id.sub_categories.forEach(elem => {
                                          if (parseInt(elem.id) == parseInt(element.course_sub_category)) {
                                              sub_arrr.push({_id:element._id,cat_id:element.cat_id._id,course_title:element.course_title,course_name:element.course_name,uid:element.uid,creator:element.user.name, meta_cat_id: element.cat_id.id, sub_id: elem.id, sub_name: elem.name })
                                              sub_arrr = removeDuplicates(sub_arr, "sub_name");
                                          }
                  
                                      });
                                  }
                              }
                             
                          }); //courses_cat
                  
                      } //if
                     
                      if(sess.email == "Creator" || sess.email == "Admin" || sess.email == "Normal User"){
                        User.findOne({_id:sess.user})
                        .exec((err, user_data) => {
                            if (err) return next(err);
                  
                            if (user_data == null) {
                                if (err) return next(err);
                  
                            }
                            if(isMobile){
                              res.render('mobile-ui/categories',{ 'data':obj1,
                              'count':count,'user_info':user_data,'categories':filter_arr ,'isLoggedIn':true,'user':sess.user,'cat_name':req.params.name,
                              'role':sess.email,'sub_arr':sub_arrr
                              })
                            }
                            else{
                              return 
                            }
                         
                        })
                      }
                      else{
                        if(isMobile){
                        res.render('mobile-ui/categories',{ 'data':obj1,
                        'count':count,'categories':filter_arr ,'isLoggedIn':true,'user':sess.user,'cat_name':req.params.name,
                        'role':sess.email,'sub_arr':sub_arrr
                     })
                    }
                    else{
                      return 
                    }
                    }
                
                }
              })

          }
      })

  });// course cat execution ends

  }
  catch (e){

  }
   
});

//---------------------------------------------------------------------
  // user profile
//---------------------------------------------------------------------
app.get('/user_profile/:id' , function (req,res,next){

  sess = req.session;
  var isMobile = isCallerMobile(req);

  if(sess.email == "Creator" || sess.email == "Admin" ||sess.email == "Normal User" ){

  try {

  // GET some data from whereever
  var arr            = []
  var sub_categories = []
  var sub_arr        = []

  Course.find({g_course:"false"}) 
  .populate('cat_id')

  .exec((err, courses_cat)=>{
    if (err) return next (err);

    if(courses_cat == null){
      if (err) return next (err);

    }
    if(courses_cat.length > 0){
    //loopthrough the courses to get categories
      courses_cat.forEach(element => {
      sub_categories = []

      if(element.cat_id != null){
          
        if(parseInt(element.cat_id.id) == parseInt(element.course_meta_category) ){
          element.cat_id.sub_categories.forEach(elem => {
            if(parseInt(elem.id) == parseInt(element.course_sub_category )   ){
              sub_arr.push({id:element.cat_id.id, sub_id:elem.id,sub_name:elem.name})
                sub_arr = removeDuplicates( sub_arr, "sub_name");
                arr.push({_id:element.cat_id._id,
                  id:element.cat_id.id,name:element.cat_id.name ,sub_categories:sub_categories,
                  uid:element.uid,
                  course_name:element.course_name})
                        
                }
        
              });  
            }   
          }     
        });//courses_cat

      }//if  
      
      //removing duplicates
      let filter_arr = arr.reduce(function(acc, curr) {
        let findIndex = acc.findIndex(function(item) {
        return item.id === curr.id

        })
        if (findIndex === -1) {
            acc.push(curr)
        
        }
        else{
        
        }
        return acc
      }, [])

      filter_arr.forEach(elem => {
          sub_arr.forEach(element => {
              if(elem.id == element.id){
                  elem.sub_categories.push({sub_id:element.sub_id,sub_name:element.sub_name})
              }
          });
      });

      Categories.find({}).exec((err,cat_data) =>{
        if (err) return next (err);
       
        User.findOne({
          _id:req.params.id
        })
        .exec((err, result) =>{
          if (err) return next (err);
          if(result == null){
            return next();
          }
          Favorites.find({user:req.params.id})
          .exec((err, fav_count) =>{
            if(err){
              return next(err);

            }
            if(fav_count == null){
              return next();
            }

            var count = fav_count.length;
                
          if(sess.user && sess.email){
            if(isMobile){
              res.render('mobile-ui/profile',{'user_info':result,'fav_count':count, 'role':sess.email,'categories':filter_arr ,'allcategories':cat_data,'isLoggedIn':true,'user':sess.user,'_id':req.params.id,
            })
            }
            else{
              res.render('user_profile',{'user_info':result,'fav_count':count, 'role':sess.email,'categories':filter_arr ,'allcategories':cat_data,'isLoggedIn':true,'user':sess.user,'_id':req.params.id
            })
            }
       
      
        }
        else{
          res.redirect('/')
        }
        
      })           
      })
              })
            })
          
    
        } catch(err) {
          console.log(err);
          return null;
        }
      }
      else{
        res.render('authentication-failed');

      }

})
//---------------------------------------------------------------------
  // redorder section videos
//---------------------------------------------------------------------
app.get('/section_reorder/:id', function(req, res,next) {
  sess = req.session;
  var isMobile = isCallerMobile(req);

  if(sess.email == "Creator" || sess.email == "Admin"){

  try {

  // GET some data from whereever
  var arr            = []
  var sub_categories = []
  var sub_arr        = []
  var section_videos = []

  Course.find({g_course:"false"}) 
  .populate('cat_id')

  .exec((err, courses_cat)=>{
    if (err) return next (err);

    if(courses_cat == null){
      if (err) return next (err);

    }
    if(courses_cat.length > 0){
    //loopthrough the courses to get categories
      courses_cat.forEach(element => {
      sub_categories = []

      if(element.cat_id != null){
          
        if(parseInt(element.cat_id.id) == parseInt(element.course_meta_category) ){
          element.cat_id.sub_categories.forEach(elem => {
            if(parseInt(elem.id) == parseInt(element.course_sub_category )   ){
              sub_arr.push({id:element.cat_id.id, sub_id:elem.id,sub_name:elem.name})
                sub_arr = removeDuplicates( sub_arr, "sub_name");
                arr.push({_id:element.cat_id._id,
                  id:element.cat_id.id,name:element.cat_id.name ,sub_categories:sub_categories,
                  uid:element.uid,
                  course_name:element.course_name})
                        
                }
        
              });  
            }   
          }     
        });//courses_cat

      }//if  
      
      //removing duplicates
      let filter_arr = arr.reduce(function(acc, curr) {
        let findIndex = acc.findIndex(function(item) {
        return item.id === curr.id

        })
        if (findIndex === -1) {
            acc.push(curr)
        
        }
        else{
        
        }
        return acc
      }, [])

      filter_arr.forEach(elem => {
          sub_arr.forEach(element => {
              if(elem.id == element.id){
                  elem.sub_categories.push({sub_id:element.sub_id,sub_name:element.sub_name})
              }
          });
      });

      Categories.find({}).exec((err,cat_data) =>{
        if (err) return next (err);
        CourseSection.findOne({'course_section._id':req.params.id})
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
                    .populate('user')
                    .exec((err, obj1)=>{
                      if(obj1== null){
                        return res.status(500).json({
                          'success' : false,
                          'message': 'Invalid User Id'
                        
                        })
                      }
                      if(obj1 != null){
                                   
                        element.course_details.forEach(element1 => {
                          obj1.course_details.forEach(elm => {
                            if(elm._id == element1.course_id){
                              section_videos.push({_id:element1._id,course_id:elm._id,video_title:elm.video_title,video_thumbnail:elm.video_thumbnail,video_embed_link:elm.video_embed_link,video_id:elm.video_id})
    
                            }
                          });
                        });
                        if(sess.user){
                          User.findOne({_id:sess.user})
                          .exec((err, user_data) => {
                              if (err) return next(err);
  
                              if (user_data == null) {
                                  if (err) return next(err);
  
                              }
                              if(isMobile){
                                res.render('mobile-ui/reorder-section',{'user_info':user_data,'categories':filter_arr ,'allcategories':cat_data,'isLoggedIn':true,'user':sess.user,'_id':req.params.id,
                                'section_id':obj.complete_course_id,
                                'uid':obj1.uid,
                                'role':sess.email,
                                'section_videos':section_videos,
                                'course_name':obj1.course_name})
                              }
                              else{
                                res.render('reorder-section',{'user_info':user_data,'categories':filter_arr ,'allcategories':cat_data,'isLoggedIn':true,'user':sess.user,'_id':req.params.id,
                                'section_id':obj.complete_course_id,
                                'uid':obj1.uid,
                                'role':sess.email,
                                'section_videos':section_videos,
                                'course_name':obj1.course_name})
                              }
                        
                            })
                        }
                        else{
                          res.redirect('/')
                        }
   
                        }

                      });//course exec

                    }//if

                  });//obj for loop 

                }//obj
              })
            })
          })
    
        } catch(err) {
          console.log(err);
          return null;
        }
      }
      else{
        res.render('authentication-failed');

      }
})
app.get('/subcategory-list/:subname', (req, res,next) => {
  
  var isMobile = isCallerMobile(req);

  sess = req.session;
  try{
// GET some data from whereever
var arr            = []
var sub_categories = []
var sub_arr        = []
var arrr = []
Course.find({g_course:"false"}) 
.populate('cat_id')

.exec((err, courses_cat)=>{
  if (err) return next (err);

  if(courses_cat == null){
    if (err) return next (err);

  }
  if(courses_cat.length > 0){
  //loopthrough the courses to get categories
    courses_cat.forEach(element => {
    sub_categories = []

    if(element.cat_id != null){
        
      if(parseInt(element.cat_id.id) == parseInt(element.course_meta_category) ){
        element.cat_id.sub_categories.forEach(elem => {
          if(parseInt(elem.id) == parseInt(element.course_sub_category )   ){
            sub_arr.push({id:element.cat_id.id, sub_id:elem.id,sub_name:elem.name})
              sub_arr = removeDuplicates( sub_arr, "sub_name");
              arr.push({_id:element.cat_id._id,
                id:element.cat_id.id,name:element.cat_id.name ,sub_categories:sub_categories})
                      
              }
      
            });  
          }   
        }     
      });//courses_cat

    }//if  
    
    //removing duplicates
    let filter_arr = arr.reduce(function(acc, curr) {
      let findIndex = acc.findIndex(function(item) {
      return item.id === curr.id

      })
      if (findIndex === -1) {
          acc.push(curr)
      
      }
      else{
      
      }
      return acc
    }, [])

    filter_arr.forEach(elem => {
        sub_arr.forEach(element => {
            if(elem.id == element.id){
                elem.sub_categories.push({sub_id:element.sub_id,sub_name:element.sub_name})
            }
        });
    });
    Categories.findOne({'sub_categories.name' :req.params.subname})
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
            
            if(result.sub_categories.length > 0){
                result.sub_categories.forEach(element => {
                    if(element.name == req.params.subname){
                        arrr.push({id:element.id,name:element.name,meta_id:result._id})
                    }
                });
            }
            Course.find({'cat_id':result._id}).sort({fav_count:-1})
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
                            if(arrr.length > 0){
                            if(element.course_sub_category == arrr[0].id){
                                
                                sub_cat_arr.push({_id:element._id,video_id:videoId,video_link:element.video_link,fav:element.favorite_bool,course_name:element.course_name,uid:element.uid,user:element.user.name,cat_id:element.cat_id,image_preview:element.image_preview,course_title:element.course_title,course_meta_category:element.course_meta_category,course_sub_category:element.course_sub_category})
                            
                        }
                      }
                      else{
                        console.log("===empty")
                      }
                        });

                    }
                    var count = sub_cat_arr.length;
                    console.log("sub_cat_arr",sub_cat_arr)
                    if(sess.email == "Creator" || sess.email == "Admin" || sess.email == "Normal User"){
                      User.findOne({_id:sess.user})
                      .exec((err, user_data) => {
                          if (err) return next(err);
                
                          if (user_data == null) {
                              if (err) return next(err);
                
                          }
                          if(isMobile){
                            res.render('mobile-ui/subcategories',{ 
                           'user_info':user_data,'categories':filter_arr ,'isLoggedIn':true,'user':sess.user,
                            'role':sess.email, 'sub_cat_data':sub_cat_arr,
                            'count':count,'sub_cat_name':req.params.subname
                            })
                          }
                          else{
                            return 
                          }
                       
                      })
                    }
                    else{
                      if(isMobile){
                      res.render('mobile-ui/subcategories',{ 
                      'categories':filter_arr ,'isLoggedIn':true,'user':sess.user,
                      'role':sess.email, 'sub_cat_data':sub_cat_arr,
                      'count':count,'sub_cat_name':req.params.subname
                   })
                  }
                  else{
                    return 
                  }
                  }
                }
            })
            // })
        }
    })
   
                    
                                       

  });// course cat execution ends

  }
  catch (e){

  }
   
});

//---------------------------------------------------------------------
  // get to course comments
//---------------------------------------------------------------------
app.get('/comments', function(req, res,next) {
  const uid = req.query.uid;
  const course = req.query.course;
  const video_id= req.query.video_id;

  res.render('comments.ejs',{'uid':uid,course:course,video_id:video_id})
 
})

//---------------------------------------------------------------------
  // get my courses
//---------------------------------------------------------------------
app.get('/my-courses' , function (req,res,next){
  sess = req.session;

  if(sess.email == "Creator" && sess.user){

    // GET some data from whereever
  var arr            = []
  var sub_categories = []
  var sub_arr        = []
  var perPage = parseInt(req.query.currentPage || 10)
  const page = parseInt(req.query.page || 1); // Page 

  Course.find({g_course:"false"}) 
  .populate('cat_id')

  .exec((err, courses_cat)=>{
    if (err) return next (err);

    if(courses_cat == null){
      if (err) return next (err);

    }
    if(courses_cat.length > 0){
    //loopthrough the courses to get categories
      courses_cat.forEach(element => {
      sub_categories = []

      if(element.cat_id != null){
          
        if(parseInt(element.cat_id.id) == parseInt(element.course_meta_category) ){
          element.cat_id.sub_categories.forEach(elem => {
            if(parseInt(elem.id) == parseInt(element.course_sub_category )   ){
              sub_arr.push({id:element.cat_id.id, sub_id:elem.id,sub_name:elem.name})
                sub_arr = removeDuplicates( sub_arr, "sub_name");
                arr.push({_id:element.cat_id._id,
                  id:element.cat_id.id,name:element.cat_id.name ,sub_categories:sub_categories})
                        
                }
        
              });  
            }   
          }     
        });//courses_cat

      }//if  
      
      //removing duplicates
      let filter_arr = arr.reduce(function(acc, curr) {
        let findIndex = acc.findIndex(function(item) {
        return item.id === curr.id

        })
        if (findIndex === -1) {
            acc.push(curr)
        
        }
        else{
        
        }
        return acc
      }, [])

      filter_arr.forEach(elem => {
          sub_arr.forEach(element => {
              if(elem.id == element.id){
                  elem.sub_categories.push({sub_id:element.sub_id,sub_name:element.sub_name})
              }
          });
      });

      Categories.find({}).exec((err,cat_data) =>{
        if (err) return next (err);
       
  Course.find({user:sess.user}).skip((perPage * page) - perPage).sort({"_id": -1}).limit(perPage)
  .exec((err, course_data) => {
      if (err) return (err);
      if (course_data == null) {
        if (err) return next (err);

      }
  
      if(course_data != null){
        User.findOne({
          _id:sess.user
        })
        .exec((err, result) =>{
          if (err) return next (err);
          if(result == null){
            return next();
          }
          if(result != null){
             course_data.forEach(mydata => {
              if (mydata.course_details.length == 0){
                console.log("===false")

                return false;
              }
  
              else{
                if( mydata.course_details[0].video_description!= null || mydata.course_details[0].video_description!="" ){
                  mydata.course_details[0].video_description = mydata.course_details[0].video_description.toString();
                  mydata.course_details[0].video_description =  mydata.course_details[0].video_description.replace(/<\s*\/?br\s*[\/]?>/gi,"\n");
                 // mydata.course_details[0].video_description  = urlify(mydata.course_details[0].video_description );

                }
             
              }
            });
            
          res.render('mycourses.ejs',{  currentPage: page,
            pages: Math.ceil(courses_cat.length / perPage),
              'obj':course_data,'user_info':result,'role':sess.email,'categories':filter_arr ,'allcategories':cat_data,'isLoggedIn':true,'user':sess.user
          })
        }
        else{
          res.redirect('/')

        }
      })
    }
  })
  })
  })  
}
else{
     
  res.redirect('/')

}
})

app.get('/my-courses/:page' , function (req,res,next){
  sess = req.session;

  if(sess.email == "Creator" && sess.user){

    // GET some data from whereever
  var arr            = []
  var sub_categories = []
  var sub_arr        = []
  var perPage =  10
  const page = parseInt(req.params.page || 1); // Page 
  var reqValue = req.query.value;

  Course.find({g_course:"false"}) 
  .populate('cat_id')

  .exec((err, courses_cat)=>{
    if (err) return next (err);

    if(courses_cat == null){
      if (err) return next (err);

    }
    if(courses_cat.length > 0){
    //loopthrough the courses to get categories
      courses_cat.forEach(element => {
      sub_categories = []

      if(element.cat_id != null){
          
        if(parseInt(element.cat_id.id) == parseInt(element.course_meta_category) ){
          element.cat_id.sub_categories.forEach(elem => {
            if(parseInt(elem.id) == parseInt(element.course_sub_category )   ){
              sub_arr.push({id:element.cat_id.id, sub_id:elem.id,sub_name:elem.name})
                sub_arr = removeDuplicates( sub_arr, "sub_name");
                arr.push({_id:element.cat_id._id,
                  id:element.cat_id.id,name:element.cat_id.name ,sub_categories:sub_categories})
                        
                }
        
              });  
            }   
          }     
        });//courses_cat

      }//if  
      
      //removing duplicates
      let filter_arr = arr.reduce(function(acc, curr) {
        let findIndex = acc.findIndex(function(item) {
        return item.id === curr.id

        })
        if (findIndex === -1) {
            acc.push(curr)
        
        }
        else{
        
        }
        return acc
      }, [])

      filter_arr.forEach(elem => {
          sub_arr.forEach(element => {
              if(elem.id == element.id){
                  elem.sub_categories.push({sub_id:element.sub_id,sub_name:element.sub_name})
              }
          });
      });

      Categories.find({}).exec((err,cat_data) =>{
        if (err) return next (err);

        if(reqValue == "oldest"){
          Course.find({user:sess.user}).skip((perPage * page) - perPage).sort({"_id": 1}).limit(perPage)
          .exec((err, course_data) => {
              if (err) return (err);
              if (course_data == null) {
                if (err) return next (err);
        
              }
          
              if(course_data != null){
                User.findOne({
                  _id:sess.user
                })
                .exec((err, result) =>{
                  if (err) return next (err);
                  if(result == null){
                    return next();
                  }
                  if(result != null){
                    course_data.forEach(mydata => {
                      if (mydata.course_details.length == 0){
        
                        return false;
                      }
          
                      else{
                        if( mydata.course_details[0].video_description!= null || mydata.course_details[0].video_description!="" ){
                          mydata.course_details[0].video_description = mydata.course_details[0].video_description.toString();
                          mydata.course_details[0].video_description =  mydata.course_details[0].video_description.replace(/<\s*\/?br\s*[\/]?>/gi,"\n");
        
                        }
                     
                      }
                    });
                  res.render('mycourses.ejs',{  currentPage: page,
                    pages: Math.ceil(courses_cat.length / perPage),
                      'obj':course_data,'user_info':result,'role':sess.email,'categories':filter_arr ,'allcategories':cat_data,'isLoggedIn':true,'user':sess.user
                  })
                }
                else{
                  res.redirect('/')
                }
              })
            }
          })
        }
        else if(reqValue == "newest" || !reqValue){
         
          Course.find({user:sess.user}).skip((perPage * page) - perPage).sort({"_id": -1}).limit(perPage)
          .exec((err, course_data) => {
              if (err) return (err);
              if (course_data == null) {
                if (err) return next (err);
        
              }
          
              if(course_data != null){
                User.findOne({
                  _id:sess.user
                })
                .exec((err, result) =>{
                  if (err) return next (err);
                  if(result == null){
                    return next();
                  }
                  if(result != null){
                    course_data.forEach(mydata => {
                      if (mydata.course_details.length == 0){
        
                        return false;
                      }
          
                      else{
                        if( mydata.course_details[0].video_description!= null || mydata.course_details[0].video_description!="" ){
                          mydata.course_details[0].video_description = mydata.course_details[0].video_description.toString();
                          mydata.course_details[0].video_description =  mydata.course_details[0].video_description.replace(/<\s*\/?br\s*[\/]?>/gi,"\n");
        
                        }
                     
                      }
                    });
                  res.render('mycourses.ejs',{  currentPage: page,
                    pages: Math.ceil(courses_cat.length / perPage),
                      'obj':course_data,'user_info':result,'role':sess.email,'categories':filter_arr ,'allcategories':cat_data,'isLoggedIn':true,'user':sess.user
                  })
                }
                else{
                  res.redirect('/')
                }
              })
            }
          })
        }
        else if(reqValue == "highest-rated"){
          Course.find({user:sess.user}).skip((perPage * page) - perPage).sort({"fav_count": -1}).limit(perPage)
          .exec((err, course_data) => {
              if (err) return (err);
              if (course_data == null) {
                if (err) return next (err);
        
              }
          
              if(course_data != null){
                User.findOne({
                  _id:sess.user
                })
                .exec((err, result) =>{
                  if (err) return next (err);
                  if(result == null){
                    return next();
                  }
                  if(result!= null){
                    course_data.forEach(mydata => {
                      if (mydata.course_details.length == 0){
        
                        return false;
                      }
          
                      else{
                        if( mydata.course_details[0].video_description!= null || mydata.course_details[0].video_description!="" ){
                          mydata.course_details[0].video_description = mydata.course_details[0].video_description.toString();
                          mydata.course_details[0].video_description =  mydata.course_details[0].video_description.replace(/<\s*\/?br\s*[\/]?>/gi,"\n");
        
                        }
                     
                      }
                    });
                  res.render('mycourses.ejs',{  currentPage: page,
                    pages: Math.ceil(courses_cat.length / perPage),
                      'obj':course_data,'user_info':result,'role':sess.email,'categories':filter_arr ,'allcategories':cat_data,'isLoggedIn':true,'user':sess.user
                  })
                }
                else{
                  res.redirect('/')
                }
              })
            }
          })
        }
 
  })
  })  
}
else{
     
  res.redirect('/')

}
})

app.get('/addVideo', function (req, res,next) {
  
  sess = req.session;
  var sub_categories = [];
  var sub_arr = [];
  var arr_data = [];
 
  if(sess.email == "Admin" || sess.email == "Creator"){
    Course.find({g_course:"false"})
     .populate('cat_id')
     .populate('user')
   
     .exec((err, courses)=>{
       if(err) {
         return next (err);
       }
    if(courses.length > 0){
       //loopthrough the courses to get categories
       courses.forEach(element => {
         sub_categories = []
         if(element.cat_id !== null){
         
         if(parseInt(element.cat_id.id) == parseInt(element.course_meta_category) ){
             element.cat_id.sub_categories.forEach(elem => {
                 if(parseInt(elem.id) == parseInt(element.course_sub_category )   ){
                     sub_arr.push({id:element.cat_id.id, sub_id:elem.id,sub_name:elem.name})
                      sub_arr = removeDuplicates( sub_arr, "sub_name");
   
                     arr_data.push({_id:element.cat_id._id,
                     id:element.cat_id.id,name:element.cat_id.name ,sub_categories:sub_categories,
                     uid:element.uid,
                     course_name:element.course_name})
                     
                 }
     
             });  
         }  
       }      

     });//obj loop
   }
     //removing duplicates
     let filter_arr = arr_data.reduce(function(acc, curr) {
         let findIndex = acc.findIndex(function(item) {
         return item.id === curr.id
         
         })
         if (findIndex === -1) {
             acc.push(curr)
         
         }
         else{
         
         }
         return acc
         }, [])
   
         filter_arr.forEach(elem => {
             sub_arr.forEach(element => {
                 if(elem.id == element.id){
                     elem.sub_categories.push({sub_id:element.sub_id,sub_name:element.sub_name})
                 }
                 
             });
             
         });
         Categories.find({}).exec((err, cat_data) => {
          if (err) return next(err);
          User.findOne({_id:sess.user})
          .exec((err, user_data) => {
              if (err) return next(err);
    
              if (user_data == null) {
                  if (err) return next(err);
    
              }
         res.render('google-drive/add-google-video',{'categories':filter_arr ,'allcategories':cat_data,'isLoggedIn':true,'user':sess.user,
         'role':sess.email,'user_info':user_data});
            });
      });
    });

 }
  else{
    res.render('authentication-failed');

  }
})

//---------------------------------------------------------------------
    // List up google drive courses
//---------------------------------------------------------------------

app.get('/g-list', function(req, res,next) {

  //finding the categories for course
  Course.find({g_course:'true'})
  .populate('cat_id')
  
  .exec((err, g_courses)=>{
      if (err) return next(err);
  
      if(g_courses == null){
          if (err) return next(err);
      }
  
      res.render('google-drive/google-drive-courses-list',{'g_courses':g_courses});

  });
  
 })//list g courses


 //---------------------------------------------------------------------
    // view google drive course
//---------------------------------------------------------------------
 app.get('/view-g-course', function (req, res,next) {
 
  var arr_data = []
  var sub_categories_data = []
  var sub_arr_data = []
  var video = []
  var course_data = []
  var image_preview = []
  var c_id = []
  var sections = []
  var googleUrl ;
  sess = req.session;
  var isMobile = isCallerMobile(req);
  var image_preview = [];

  // handle the case where we don't detect the browser
  var parser = new UAParser();
  var ua = req.headers['user-agent'];
  var browserName = parser.setUA(ua).getBrowser().name;
  var fullBrowserVersion = parser.setUA(ua).getBrowser().version;
  var browserVersion = fullBrowserVersion.split(".",1).toString();
  var browserNamE;

if (browserName == 'IE' && browserVersion >= 9){
  browserNamE = 'IE';
}
else if (browserName == 'Firefox' && browserVersion >= 24){
  browserNamE = 'Firefox';
}

else if (browserName == 'Chrome' && browserVersion >= 29){
  browserNamE = 'Chrome';
}

else if (browserName == 'Safari' && browserVersion >= 5){
  browserNamE = 'Safari';
}

else{
  browserNamE = 'Other';

}
  //finding the categories for course
  Course.find({g_course:'true'})
  .populate('cat_id')
  
  .exec((err, courses_cat_data)=>{
  if (err) return next(err);
  
  if(courses_cat_data == null){
  if (err) return next(err);
  
  }
  if(courses_cat_data.length > 0){
  
  //loopthrough the courses to get categories
  courses_cat_data.forEach(element => {
  sub_categories_data = []
  
  if(element.cat_id != null){
    if(parseInt(element.cat_id.id) == parseInt(element.course_meta_category) ){
      element.cat_id.sub_categories.forEach(elem => {
    if(parseInt(elem.id) == parseInt(element.course_sub_category ) ){
      sub_arr_data.push({id:element.cat_id.id, sub_id:elem.id,sub_name:elem.name})
      sub_arr_data = removeDuplicates( sub_arr_data, "sub_name");
      arr_data.push({_id:element.cat_id._id,
      id:element.cat_id.id,name:element.cat_id.name ,sub_categories:sub_categories_data,
      uid:element.uid,
      course_name:element.course_name})
      }
    });
  
  } //element cat id
  
  }//element cat
  
  });//courses_cat
  
  }//if
  //removing duplicates
  let filter_arr_data = arr_data.reduce(function(acc_data, curr_id) {
  let findIndex = acc_data.findIndex(function(item) {
  return item.id === curr_id.id
  
  })
  if (findIndex === -1) {
  acc_data.push(curr_id)
  }
  else{
  }
  return acc_data
  }, [])
  
  filter_arr_data.forEach(elem => {
    sub_arr_data.forEach(element => {
      if(elem.id == element.id){
        elem.sub_categories.push({sub_id:element.sub_id,sub_name:element.sub_name})
      }
    });
  });//filter_arr_data
  
  Categories.find({}).exec((err,cat_data) =>{
    if (err) return next(err);
      Course.findOne({g_course:"true",
      $or: [
      { 'course_name': req.query.course },
      {'course_details.video_id':req.query.video_id}
      ]
      }).where({uid:req.query.uid})
      .populate('user')
      .exec((err, obj) =>{
       if(err){
      return next(err);
    
  }
 
  if(req.query.video_id){
    if(obj != null){
      if(obj.course_details.length > 0){
        for (let index = 0; index < obj.course_details.length; index++) {
          const element = obj.course_details[index];
          if(element.video_id == req.query.video_id){
            // image_preview.push(element.video_thumbnail);
            // image_preview = image_preview[0]
            c_id.push(element._id);

          }
        }
      }
    }
  }
  else{
    if(obj != null){
      image_preview.push(obj.image_preview);
      image_preview = image_preview[0]
        if(obj.course_details.length > 0){
          c_id.push(obj.course_details[0]._id)

      }
    }
  }
  
  if(obj != null){
    CourseSection.findOne({complete_course_id:obj._id})
    .populate({
      path:'complete_course_id',
      select:'course_details',
    })
    .populate({
      path:'complete_course_id',
      select:'user',
    })
    .exec((err, course_sections) =>{
      if(err){
        return next(err);
      }
  
      if(course_sections == null){

      if(obj != null){
        if(obj.course_details.length > 0){
        
        if(req.query.video_id){
          obj.course_details.forEach(element => {
            if(element.video_id == req.query.video_id){
              video.push(element.video_id);
              course_data.push({'video_desc': element.video_description, 'video_title':element.video_title ,'video_id':element.video_id})
              c_id.push(element._id)
            }
          });
        }else if(!req.query.video_id){
          video.push(obj.course_details[0].video_id);
          course_data.push({'count':obj.course_details.length,'video_desc': obj.course_details[0].video_description, 'video_id':obj.course_details[0].video_id,'video_title':obj.course_details[0].video_title})
          c_id.push(obj.course_details[0]._id)

        }
  
        if(sess.user) {
          Favorites.findOne({user:sess.user}).where({course_id:obj._id})
          .populate('user')
          .populate('course_id')
          .exec((err, fav_course) =>{
          if(err){
            return (err);
        }
        User.findOne({_id:sess.user})
        .exec((err, user_data) => {
            if (err) return next(err);

            if (user_data == null) {
                if (err) return next(err);

            }
            if(fav_course == null || fav_course.length == 0){
                if (isMobile) {
                    return res.render('mobile-ui/course-view',{'browserName':browserNamE,'c_id':c_id,'googleUrl':googleUrl,'user_info':user_data,'count':obj.course_details.length,'fav_courses':null,'nonsections':null,'image_preview':image_preview,'course':obj,'course_data':course_data, 'video':video, 'role':sess.email,'user':sess.user,'isLoggedIn':true, 'categories':filter_arr_data ,'allcategories':cat_data,'bool_section_check':false})
                }
                else{
                    return res.render('google-drive/view-google-drive-course',{'browserName':browserNamE,'c_id':c_id,'user_info':user_data,'googleUrl':googleUrl,'count':obj.course_details.length,'fav_courses':null,'nonsections':null,'image_preview':image_preview,'course':obj,'course_data':course_data, 'video':video, 'role':sess.email,'user':sess.user,'isLoggedIn':true, 'categories':filter_arr_data ,'allcategories':cat_data,'bool_section_check':false})

                }

            }

            else if(fav_course.length > 0){
                if (isMobile) {
                    res.render('mobile-ui/course-view',{'browserName':browserNamE,'c_id':c_id,'googleUrl':googleUrl,'user_info':user_data,'count':obj.course_details.length, 'fav_courses':fav_course,'nonsections':null,'course':obj ,'image_preview':image_preview,'course_data':course_data, 'user':sess.user, 'role':sess.email,'video':video,'isLoggedIn':true,'categories':filter_arr_data ,'allcategories':cat_data,'bool_section_check':false})
                }
                else{
                    res.render('google-drive/view-google-drive-course',{'browserName':browserNamE,'c_id':c_id,'googleUrl':googleUrl,'user_info':user_data,'count':obj.course_details.length, 'fav_courses':fav_course,'nonsections':null,'course':obj ,'image_preview':image_preview,'course_data':course_data, 'user':sess.user, 'role':sess.email,'video':video,'isLoggedIn':true,'categories':filter_arr_data ,'allcategories':cat_data,'bool_section_check':false})
                }

            }
          })
        })
      }
      else{
          if (isMobile) {
              res.render('mobile-ui/course-view',{'browserName':browserNamE,'c_id':c_id,'googleUrl':googleUrl,'count':obj.course_details.length,'fav_courses':null,'nonsections':null,'image_preview':image_preview,'course':obj,'course_data':course_data, 'video':video, 'role':sess.email,'user':sess.user,'isLoggedIn':false, 'categories':filter_arr_data ,'allcategories':cat_data,'bool_section_check':false})
          }
          else{
              res.render('google-drive/view-google-drive-course',{'browserName':browserNamE,'c_id':c_id,'googleUrl':googleUrl,'count':obj.course_details.length,'fav_courses':null,'nonsections':null,'image_preview':image_preview,'course':obj,'course_data':course_data, 'video':video, 'role':sess.email,'user':sess.user,'isLoggedIn':false, 'categories':filter_arr_data ,'allcategories':cat_data,'bool_section_check':false})
          }

        }
      }
      else{
        console.log("=====workinggggg")
      
      }
    }
  }
  else if(course_sections != null){
    if( course_sections.course_section.length > 0){
      course_sections.course_section.forEach(element => {
      if(element.course_details.length > 0){
        element.course_details.forEach(c_data => {
        for( var i= 0 ; i< obj.course_details.length; i++){
    
          if(c_data.course_id.toString() == obj.course_details[i]._id ){
            video.push(obj.course_details[i].video_id);
          
            course_data.push({'video_title':obj.course_details[0].video_title, 'video_desc':obj.course_details[0].video_description})
            
            sections.push({'_id':obj.course_details[i]._id , 'video_title':obj.course_details[i].video_title,'video_description':obj.course_details[i].video_description, 'video_thumbnail':obj.course_details[i].video_thumbnail,'video_id':obj.course_details[i].video_id,'video_embed_link':obj.course_details[i].video_embed_link})
            obj.course_details.splice(i, 1);
            obj.course_details = removeDuplicates(obj.course_details , '_id')
            course_data = removeDuplicates(course_data , 'video_title')
            
          }
        }
      })
    }
  });
  
  }
  if(course_sections.course_section.length== 0){
    CourseSection.findOneAndRemove({_id:course_sections._id})
    .exec((err , result) =>{
      if(err){
        return next()
      }
      course_data.push({'video_desc': obj.course_details[0].video_description, 'video_title':obj.course_details[0].video_title ,'video_id':obj.course_details[0].video_id})
    
    })
  }
  if(video.length > 0){
    video = video[0]
    }
  if(req.query.video_id){
    if(sections.length > 0){
      course_data = []
      video = []
      for (let index = 0; index < sections.length; index++) {
        const element = sections[index];
        if(element.video_id == req.query.video_id){
          video.push(req.query.video_id);
    
          course_data.push({'video_desc': element.video_description, 'video_title':element.video_title ,'video_id':req.query.video_id})
          c_id.push(element._id)

        }
  
        else{
          if(obj.course_details.length > 0){
            obj.course_details.forEach(element => {
              if(element.video_id == req.query.video_id){
                course_data.push({'video_desc': element.video_description, 'video_title':element.video_title ,'video_id':req.query.video_id})
                video = course_data[0].video_id
                c_id.push(course_data[0]._id)

              }
            });
          }
        }
  
      }
    }
  
  }
  
  if(sess.user) {
    Favorites.findOne({user:sess.user}).where({course_id:obj._id})
    .populate('user')
    .populate('course_id')
    .exec((err, fav_course) =>{
    if(err){
      return (err);
    }
    User.findOne({_id:sess.user})
    .exec((err, user_data) => {
        if (err) return next(err);

        if (user_data == null) {
            if (err) return next(err);
        }
        if(fav_course == null || fav_course.length == 0){
            if (isMobile) {
                return res.render('mobile-ui/course-view',{'browserName':browserNamE,'c_id':c_id,'googleUrl':googleUrl,'user_info':user_data,'count':obj.course_details.length,'fav_courses':null,'image_preview':image_preview,'course':obj,'course_data':course_data,'nonsections':obj, 'video':video, 'role':sess.email,'user':sess.user,'isLoggedIn':true, 'categories':filter_arr_data ,'allcategories':cat_data,'bool_section_check':true})
            }
            else{
                return res.render('google-drive/view-google-drive-course',{'browserName':browserNamE,'c_id':c_id,'googleUrl':googleUrl,'user_info':user_data,'count':obj.course_details.length,'fav_courses':null,'image_preview':image_preview,'course':obj,'course_data':course_data,'nonsections':obj, 'video':video, 'role':sess.email,'user':sess.user,'isLoggedIn':true, 'categories':filter_arr_data ,'allcategories':cat_data,'bool_section_check':true})
            }
        }
 
        if(fav_course!= null){
            if (isMobile) {
                res.render('mobile-ui/course-view',{'browserName':browserNamE,'c_id':c_id,'googleUrl':googleUrl,'user_info':user_data,'role':sess.email, 'fav_courses':fav_course,'count':obj.course_details.length,'image_preview':image_preview,'sections':sections , 'nonsections':obj,'video':video,'course':obj, 'course_data':course_data,'user':sess.user,'categories':filter_arr_data ,'isLoggedIn':true,'allcategories':cat_data ,'bool_section_check':true})
            }
            else{
                res.render('google-drive/view-google-drive-course',{'browserName':browserNamE,'c_id':c_id,'googleUrl':googleUrl,'user_info':user_data,'role':sess.email, 'fav_courses':fav_course,'count':obj.course_details.length,'image_preview':image_preview,'sections':sections , 'nonsections':obj,'video':video,'course':obj, 'course_data':course_data,'user':sess.user,'categories':filter_arr_data ,'isLoggedIn':true,'allcategories':cat_data ,'bool_section_check':true})
            }
        }
      })
    })
  }
  else{
      if (isMobile) {
          res.render('mobile-ui/course-view',{'browserName':browserNamE,'c_id':c_id,'googleUrl':googleUrl,'count':obj.course_details.length,'fav_courses':null,'image_preview':image_preview,'course':obj,'course_data':course_data,'nonsections':obj, 'video':video, 'role':sess.email,'user':sess.user,'isLoggedIn':false, 'categories':filter_arr_data ,'allcategories':cat_data,'bool_section_check':true})
      }
      else{
          res.render('google-drive/view-google-drive-course',{'browserName':browserNamE,'c_id':c_id,'googleUrl':googleUrl,'count':obj.course_details.length,'fav_courses':null,'image_preview':image_preview,'course':obj,'course_data':course_data,'nonsections':obj, 'video':video, 'role':sess.email,'user':sess.user,'isLoggedIn':false, 'categories':filter_arr_data ,'allcategories':cat_data,'bool_section_check':true})
      }

      }
    }
  })//course section find
  }
  else{res.render('not-found');}
    })//courses find
    })//categories find
  
  });//course category

});//view-g-course

//---------------------------------------------------------------------
    // edit google drive course
//---------------------------------------------------------------------
app.get('/edit_g_course_section/:id', function(req, res,next) {
  
  var arr            = []
  var sub_categories = []
  var sub_arr        = []
  sess = req.session;
  var boolean = false;
  var isMobile = isCallerMobile(req);
  var googleDriveReg = /http(s)?:\/\/drive.google.com.*/gi;
  var linkUrl ;
  
  if(sess.email == "Creator" || sess.email == "Admin"){

  Course.find({g_course:'true'}) 
  .populate('cat_id')

  .exec((err, courses_cat)=>{
    if (err) return next(err);

    if(courses_cat == null){
      if (err) return next(err);

    }
    if(courses_cat.length > 0){
    //loopthrough the courses to get categories
      courses_cat.forEach(element => {
      sub_categories = []

      if(element.cat_id != null){
          
        if(parseInt(element.cat_id.id) == parseInt(element.course_meta_category) ){
          element.cat_id.sub_categories.forEach(elem => {
            if(parseInt(elem.id) == parseInt(element.course_sub_category )   ){
              sub_arr.push({id:element.cat_id.id, sub_id:elem.id,sub_name:elem.name})
                sub_arr = removeDuplicates( sub_arr, "sub_name");
                arr.push({_id:element.cat_id._id,
                  id:element.cat_id.id,name:element.cat_id.name ,sub_categories:sub_categories,
                  uid:element.uid,
                  course_name:element.course_name})
                        
                }
        
              });  
            }   
          }     
        });//courses_cat

      }//if  
      
      //removing duplicates
      let filter_arr = arr.reduce(function(acc, curr) {
        let findIndex = acc.findIndex(function(item) {
        return item.id === curr.id

        })
        if (findIndex === -1) {
            acc.push(curr)
        
        }
        else{
        
        }
        return acc
      }, [])

      filter_arr.forEach(elem => {
          sub_arr.forEach(element => {
              if(elem.id == element.id){
                  elem.sub_categories.push({sub_id:element.sub_id,sub_name:element.sub_name})
              }
          });
      });

      Categories.find({}).exec((err,cat_data) =>{
        if (err) return next(err);

         //finding the categories for course
        Course.findOne({_id:req.params.id})
    
        .exec((err, course)=>{
          if (err) return next(err);

          CourseSection.findOne({complete_course_id:course._id})
          .populate({
            path:'complete_course_id',
            select:['course_details','video_link'],
          })
          .exec((err, section)=>{

           if (err) return next(err);     

           if(section== null){
            var driveRegex = new RegExp(googleDriveReg);
            if (course.video_link.match(driveRegex)) {
              linkUrl = "true";
            }else{
              linkUrl = "false";
            }
            if (sess.user) {
              User.findOne({_id:sess.user})
              .exec((err, user_data) => {
                  if (err) return next(err);

                  if (user_data == null) {
                      if (err) return next(err);

                  }
                  if(isMobile){
                    res.render('mobile-ui/edit-course', {'editId':req.params.id,'linkUrl':linkUrl,'user_info':user_data,'categories':filter_arr , 'user':sess.user, 'isLoggedIn':true,'allcategories':cat_data,
                    'course':course, 'sections':section ,'sections_bool':boolean,'role':sess.email})
                    
                  }
                  else{
                    res.render('edit-google-drive-course', {'editId':req.params.id,'linkUrl':linkUrl,'user_info':user_data,'categories':filter_arr , 'user':sess.user, 'isLoggedIn':true,'allcategories':cat_data,
                    'course':course, 'sections':section ,'sections_bool':boolean,'role':sess.email})
                     
                  }
                })
            }
            else{
              res.redirect('/')
            }
           }
           else{
            var driveRegex = new RegExp(googleDriveReg);
            if (course.video_link.match(driveRegex)) {
              linkUrl = "true";
            }else{
              linkUrl = "false";
            }
            boolean = true
            //looping through response 
            section.course_section.forEach(courses =>{
               courses.course_details.forEach(c_ids => {
                 courses.course_details.forEach(data => {
                           
                   if(data._id == c_ids.course_id){
                     c_ids.title = data.video_title
 
                     courses.course_details.push( {course_id:data._id , _id:c_ids._id ,video_title:c_ids.title,video_description:data.video_description,video_embed_link:data.video_embed_link,video_thumbnail:data.video_thumbnail,video_id:data.video_id,video_timestamp:data.video_timestamp})
                               
                     courses.course_details = removeDuplicates( courses.course_details, "_id");
                         
                   }//if match id
                       
                 });// course id
                   
               })//course details id
 
             // })//course section data
             
             courses = section
 
         })//course response data loop
            if (sess.user) {
              User.findOne({_id:sess.user})
              .exec((err, user_data) => {
                  if (err) return next(err);

                  if (user_data == null) {
                      if (err) return next(err);

                  }
                  if(isMobile){
                    res.render('mobile-ui/edit-course', {'editId':req.params.id,'linkUrl':linkUrl,'user_info':user_data,'categories':filter_arr , 'user':sess.user, 'isLoggedIn':true,'allcategories':cat_data,
                    'course':course, 'sections':section ,'sections_bool':boolean ,'role':sess.email})
                  }
                  else{
                    res.render('google-drive/edit-google-drive-course', {'editId':req.params.id,'linkUrl':linkUrl,'user_info':user_data,'categories':filter_arr , 'user':sess.user, 'isLoggedIn':true,'allcategories':cat_data,
                    'course':course, 'sections':section ,'sections_bool':boolean ,'role':sess.email})
                  }
             
                })
            }
            else{
              res.redirect('/')
            }
           }
                
      })
    })
     
  })
})   
}
else{
  res.render('authentication-failed');
}   
})//edit google drive course

//---------------------------------------------------------------------
    // reorder google drive course sections
//---------------------------------------------------------------------
app.get('/g_section_reorder/:id', function(req, res,next) {
  sess = req.session;
  var isMobile = isCallerMobile(req);

  if(sess.email == "Creator" || sess.email == "Admin"){

  try {

  // GET some data from whereever
  var arr            = []
  var sub_categories = []
  var sub_arr        = []
  var section_videos = []

  Course.find({g_course:'true'}) 
  .populate('cat_id')

  .exec((err, courses_cat)=>{
    if (err) return next (err);

    if(courses_cat == null){
      if (err) return next (err);

    }
    if(courses_cat.length > 0){
    //loopthrough the courses to get categories
      courses_cat.forEach(element => {
      sub_categories = []

      if(element.cat_id != null){
          
        if(parseInt(element.cat_id.id) == parseInt(element.course_meta_category) ){
          element.cat_id.sub_categories.forEach(elem => {
            if(parseInt(elem.id) == parseInt(element.course_sub_category )   ){
              sub_arr.push({id:element.cat_id.id, sub_id:elem.id,sub_name:elem.name})
                sub_arr = removeDuplicates( sub_arr, "sub_name");
                arr.push({_id:element.cat_id._id,
                  id:element.cat_id.id,name:element.cat_id.name ,sub_categories:sub_categories})
                        
                }
        
              });  
            }   
          }     
        });//courses_cat

      }//if  
      
      //removing duplicates
      let filter_arr = arr.reduce(function(acc, curr) {
        let findIndex = acc.findIndex(function(item) {
        return item.id === curr.id

        })
        if (findIndex === -1) {
            acc.push(curr)
        
        }
        else{
        
        }
        return acc
      }, [])

      filter_arr.forEach(elem => {
          sub_arr.forEach(element => {
              if(elem.id == element.id){
                  elem.sub_categories.push({sub_id:element.sub_id,sub_name:element.sub_name})
              }
          });
      });

      Categories.find({}).exec((err,cat_data) =>{
        if (err) return next (err);
        CourseSection.findOne({'course_section._id':req.params.id})
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
                    .populate('user')
                    .exec((err, obj1)=>{
                      if(obj1== null){
                        return res.status(500).json({
                          'success' : false,
                          'message': 'Invalid User Id'
                        
                        })
                      }
                      if(obj1 != null){
                                   
                        element.course_details.forEach(element1 => {
                          obj1.course_details.forEach(elm => {
                            if(elm._id == element1.course_id){
                              section_videos.push({_id:element1._id,course_id:elm._id,video_title:elm.video_title,video_thumbnail:elm.video_thumbnail,video_embed_link:elm.video_embed_link,video_id:elm.video_id})
    
                            }
                          });
                        });
                        if(sess.user){
                          User.findOne({_id:sess.user})
                          .exec((err, user_data) => {
                              if (err) return next(err);
  
                              if (user_data == null) {
                                  if (err) return next(err);
  
                              }
                              if(isMobile){
                                res.render('mobile-ui/reorder-section',{'user_info':user_data,'categories':filter_arr ,'allcategories':cat_data,'isLoggedIn':true,'user':sess.user,'_id':req.params.id,
                                'section_id':obj.complete_course_id,
                                'uid':obj1.uid,
                                'role':sess.email,
                                'section_videos':section_videos,
                                'course_name':obj1.course_name})
                                 
                              }
                              else{
                                res.render('google-drive/google-drive-section-reorder',{'user_info':user_data,'categories':filter_arr ,'allcategories':cat_data,'isLoggedIn':true,'user':sess.user,'_id':req.params.id,
                                'section_id':obj.complete_course_id,
                                'uid':obj1.uid,
                                'role':sess.email,
                                'section_videos':section_videos,
                                'course_name':obj1.course_name})
                                 
                              }
                            })
                        }
                        else{
                          res.redirect('/')
                        }
   
                        }

                      });//course exec

                    }//if

                  });//obj for loop 

                }//obj
              })
            })
          })
    
        } catch(err) {
          console.log(err);
          return null;
        }
      }
      else{
        res.render('authentication-failed');

      }
})//reorder sections (google)


//---------------------------------------------------------------------
    // add klipse course
//---------------------------------------------------------------------
app.get('/add-klipse-course', function (req, res,next) {
 
  sess = req.session;
  var sub_categories = [];
  var sub_arr = [];
  var arr_data = [];
 
  if(sess.email == "Admin" || sess.email == "Creator"){
    Course.find({g_course:'false'})
     .populate('cat_id')
     .populate('user')
   
     .exec((err, courses)=>{
       if(err) {
         return next (err);
       }
    if(courses.length > 0){
       //loopthrough the courses to get categories
       courses.forEach(element => {
         sub_categories = []
         if(element.cat_id !== null){
         
         if(parseInt(element.cat_id.id) == parseInt(element.course_meta_category) ){
             element.cat_id.sub_categories.forEach(elem => {
                 if(parseInt(elem.id) == parseInt(element.course_sub_category )   ){
                     sub_arr.push({id:element.cat_id.id, sub_id:elem.id,sub_name:elem.name})
                      sub_arr = removeDuplicates( sub_arr, "sub_name");
   
                     arr_data.push({_id:element.cat_id._id,
                     id:element.cat_id.id,name:element.cat_id.name ,sub_categories:sub_categories,
                     uid:element.uid,
                     course_name:element.course_name})
                     
                 }
     
             });  
         }  
       }      

     });//obj loop
   }
     //removing duplicates
     let filter_arr = arr_data.reduce(function(acc, curr) {
         let findIndex = acc.findIndex(function(item) {
         return item.id === curr.id
         
         })
         if (findIndex === -1) {
             acc.push(curr)
         
         }
         else{
         
         }
         return acc
         }, [])
   
         filter_arr.forEach(elem => {
             sub_arr.forEach(element => {
                 if(elem.id == element.id){
                     elem.sub_categories.push({sub_id:element.sub_id,sub_name:element.sub_name})
                 }
                 
             });
             
         });
         Categories.find({}).exec((err, cat_data) => {
          if (err) return next(err);
          User.findOne({_id:sess.user})
          .exec((err, user_data) => {
              if (err) return next(err);
    
              if (user_data == null) {
                  if (err) return next(err);
    
              }
         res.render('klipse/add-klipse-video',{'categories':filter_arr ,'allcategories':cat_data,'isLoggedIn':true,'user':sess.user,
         'role':sess.email,'user_info':user_data});
            });
      });
    });

 }
  else{
    res.render('authentication-failed');

  }
});//add klipse course

//---------------------------------------------------------------------
    // list klipse course
//---------------------------------------------------------------------
app.get('/klipse-list', function (req, res,next) {
  
  //finding the categories for course
  Course.find({kplis_course:'true'})
   .populate('cat_id')
   
  .exec((err, kplis_courses)=>{
    if (err) return next(err);
   
      if(kplis_courses == null){
        if (err) return next(err);
       }
      res.render('klipse/list-klipse-course',{'kplis_courses':kplis_courses});
    });
});// list klipse course

//---------------------------------------------------------------------
    // view-klipse course
//---------------------------------------------------------------------
app.get('/view-klipse-course', function (req, res,next) {
  
  var arr_data = []
  var sub_categories_data = []
  var sub_arr_data = []
  var video = []
  var course_data = []
  var image_preview = []
  var c_id = []
  var sections = []
  var googleUrl ;
  sess = req.session;
  var isMobile = isCallerMobile(req);
  
  //finding the categories for course
  Course.find({kplis_course:'true'})
  .populate('cat_id')
  
  .exec((err, courses_cat_data)=>{
  if (err) return next(err);
  
  if(courses_cat_data == null){
  if (err) return next(err);
  
  }
  if(courses_cat_data.length > 0){
  
  //loopthrough the courses to get categories
  courses_cat_data.forEach(element => {
  sub_categories_data = []
  
  if(element.cat_id != null){
    if(parseInt(element.cat_id.id) == parseInt(element.course_meta_category) ){
      element.cat_id.sub_categories.forEach(elem => {
    if(parseInt(elem.id) == parseInt(element.course_sub_category ) ){
    sub_arr_data.push({id:element.cat_id.id, sub_id:elem.id,sub_name:elem.name})
    sub_arr_data = removeDuplicates( sub_arr_data, "sub_name");
    arr_data.push({_id:element.cat_id._id,
    id:element.cat_id.id,name:element.cat_id.name ,sub_categories:sub_categories_data,
    uid:element.uid,
    course_name:element.course_name})
    }
    });
  
  } //element cat id
  
  }//element cat
  
  });//courses_cat
  
  }//if
  //removing duplicates
  let filter_arr_data = arr_data.reduce(function(acc_data, curr_id) {
  let findIndex = acc_data.findIndex(function(item) {
  return item.id === curr_id.id
  
  })
  if (findIndex === -1) {
  acc_data.push(curr_id)
  }
  else{
  }
  return acc_data
  }, [])
  
  filter_arr_data.forEach(elem => {
    sub_arr_data.forEach(element => {
      if(elem.id == element.id){
        elem.sub_categories.push({sub_id:element.sub_id,sub_name:element.sub_name})
      }
    });
  });//filter_arr_data
  
  Categories.find({}).exec((err,cat_data) =>{
    if (err) return next(err);
      Course.findOne({kplis_course:"true",
      $or: [
      { 'course_name': req.query.course },
      {'course_details.video_id':req.query.video_id}
      ]
      }).where({uid:req.query.uid})
      .populate('user')
      .exec((err, obj) =>{
       if(err){
      return next(err);
    
  }
 
  if(req.query.video_id){
    if(obj != null){
      if(obj.course_details.length > 0){
        for (let index = 0; index < obj.course_details.length; index++) {
          const element = obj.course_details[index];
          if(element.video_id == req.query.video_id){
          // image_preview.push(element.video_thumbnail);
          // image_preview = image_preview[0]
          c_id.push(element._id)

          }
        } 
      }
    }
  }
  else{
  if(obj != null){
  image_preview.push(obj.image_preview);
  image_preview = image_preview[0]
  if(obj.course_details.length > 0){
    c_id.push(obj.course_details[0]._id)

  }
  }
  }
  
  if(obj != null){
  CourseSection.findOne({complete_course_id:obj._id})
  .populate({
  path:'complete_course_id',
  select:'course_details',
  })
  .populate({
    path:'complete_course_id',
    select:'user',
    })
  .exec((err, course_sections) =>{
  if(err){
  return next(err);
  }
  
  if(course_sections == null){

  if(obj != null){
  if(obj.course_details.length > 0){
  
  if(req.query.video_id){
  obj.course_details.forEach(element => {
  if(element.video_id == req.query.video_id){
  video.push(element.video_id);
  course_data.push({'video_desc': element.video_description, 'video_title':element.video_title ,'video_id':element.video_id})
  c_id.push(element._id)

}
  });
  }else if(!req.query.video_id){
  video.push(obj.course_details[0].video_id);
  course_data.push({'count':obj.course_details.length,'video_desc': obj.course_details[0].video_description, 'video_id':obj.course_details[0].video_id,'video_title':obj.course_details[0].video_title})
  c_id.push(obj.course_details[0]._id)

  }
  
  if(sess.user) {
  Favorites.findOne({user:sess.user}).where({course_id:obj._id})
  .populate('user')
  .populate('course_id')
  .exec((err, fav_course) =>{
  if(err){
  return (err);
  }
  User.findOne({_id:sess.user})
  .exec((err, user_data) => {
      if (err) return next(err);

      if (user_data == null) {
          if (err) return next(err);

      }
  if(fav_course == null || fav_course.length == 0){
       if (isMobile) {
          return res.render('mobile-ui/course-view',{'c_id':c_id,'googleUrl':googleUrl,'user_info':user_data,'count':obj.course_details.length,'fav_courses':null,'nonsections':null,'image_preview':image_preview,'course':obj,'course_data':course_data, 'video':video, 'role':sess.email,'user':sess.user,'isLoggedIn':true, 'categories':filter_arr_data ,'allcategories':cat_data,'bool_section_check':false})
      }
      else{
          return res.render('klipse/view-klipse-course',{'c_id':c_id,'user_info':user_data,'googleUrl':googleUrl,'count':obj.course_details.length,'fav_courses':null,'nonsections':null,'image_preview':image_preview,'course':obj,'course_data':course_data, 'video':video, 'role':sess.email,'user':sess.user,'isLoggedIn':true, 'categories':filter_arr_data ,'allcategories':cat_data,'bool_section_check':false})

      }

  }

  else if(fav_course.length > 0){
      if (isMobile) {
          res.render('mobile-ui/course-view',{'c_id':c_id,'googleUrl':googleUrl,'user_info':user_data,'count':obj.course_details.length, 'fav_courses':fav_course,'nonsections':null,'course':obj ,'image_preview':image_preview,'course_data':course_data, 'user':sess.user, 'role':sess.email,'video':video,'isLoggedIn':true,'categories':filter_arr_data ,'allcategories':cat_data,'bool_section_check':false})
      }
      else{
          res.render('klipse/view-klipse-course',{'c_id':c_id,'googleUrl':googleUrl,'user_info':user_data,'count':obj.course_details.length, 'fav_courses':fav_course,'nonsections':null,'course':obj ,'image_preview':image_preview,'course_data':course_data, 'user':sess.user, 'role':sess.email,'video':video,'isLoggedIn':true,'categories':filter_arr_data ,'allcategories':cat_data,'bool_section_check':false})
      }

  }
})
  })
  }
  else{
      if (isMobile) {
          res.render('mobile-ui/course-view',{'c_id':c_id,'googleUrl':googleUrl,'count':obj.course_details.length,'fav_courses':null,'nonsections':null,'image_preview':image_preview,'course':obj,'course_data':course_data, 'video':video, 'role':sess.email,'user':sess.user,'isLoggedIn':false, 'categories':filter_arr_data ,'allcategories':cat_data,'bool_section_check':false})
      }
      else{
          res.render('klipse/view-klipse-course',{'c_id':c_id,'googleUrl':googleUrl,'count':obj.course_details.length,'fav_courses':null,'nonsections':null,'image_preview':image_preview,'course':obj,'course_data':course_data, 'video':video, 'role':sess.email,'user':sess.user,'isLoggedIn':false, 'categories':filter_arr_data ,'allcategories':cat_data,'bool_section_check':false})

      }

  }
  }
  else{
    console.log("=====workinggggg")
   
  }
  }
}
  else if(course_sections != null){
  if( course_sections.course_section.length > 0){
  course_sections.course_section.forEach(element => {
  if(element.course_details.length > 0){
  element.course_details.forEach(c_data => {
  for( var i= 0 ; i< obj.course_details.length; i++){
  
  if(c_data.course_id.toString() == obj.course_details[i]._id ){
  video.push(obj.course_details[i].video_id);
 
  course_data.push({'video_title':obj.course_details[0].video_title, 'video_desc':obj.course_details[0].video_description})
  
  sections.push({'_id':obj.course_details[i]._id , 'video_title':obj.course_details[i].video_title,'video_description':obj.course_details[i].video_description, 'video_thumbnail':obj.course_details[i].video_thumbnail,'video_id':obj.course_details[i].video_id,'video_embed_link':obj.course_details[i].video_embed_link})
  obj.course_details.splice(i, 1);
  obj.course_details = removeDuplicates(obj.course_details , '_id')
  course_data = removeDuplicates(course_data , 'video_title')
  
  }
  }
  })
  }
  });
  
  }
  if(course_sections.course_section.length== 0){
    CourseSection.findOneAndRemove({_id:course_sections._id})
    .exec((err , result) =>{
      if(err){
        return next()
      }
      course_data.push({'video_desc': obj.course_details[0].video_description, 'video_title':obj.course_details[0].video_title ,'video_id':obj.course_details[0].video_id})
    
    })
  }
  if(video.length > 0){
    video = video[0]
    }
  if(req.query.video_id){
  if(sections.length > 0){
  course_data = []
  video = []
  for (let index = 0; index < sections.length; index++) {
  const element = sections[index];
  if(element.video_id == req.query.video_id){
  video.push(req.query.video_id);
  
  course_data.push({'video_desc': element.video_description, 'video_title':element.video_title ,'video_id':req.query.video_id})
  c_id.push(element._id)

}
  
  else{
    if(obj.course_details.length > 0){
      obj.course_details.forEach(element => {
        if(element.video_id == req.query.video_id){
          course_data.push({'video_desc': element.video_description, 'video_title':element.video_title ,'video_id':req.query.video_id})
          video = course_data[0].video_id
          c_id.push(course_data[0]._id)

        }
      });
    }
  }
  
  }
  }
  
  }
  
  if(sess.user) {
    Favorites.findOne({user:sess.user}).where({course_id:obj._id})
    .populate('user')
    .populate('course_id')
    .exec((err, fav_course) =>{
    if(err){
      return (err);
    }
    User.findOne({_id:sess.user})
    .exec((err, user_data) => {
        if (err) return next(err);

        if (user_data == null) {
            if (err) return next(err);

        }
  if(fav_course == null || fav_course.length == 0){
      if (isMobile) {
          return res.render('mobile-ui/course-view',{'c_id':c_id,'googleUrl':googleUrl,'user_info':user_data,'count':obj.course_details.length,'fav_courses':null,'image_preview':image_preview,'course':obj,'course_data':course_data,'nonsections':obj, 'video':video, 'role':sess.email,'user':sess.user,'isLoggedIn':true, 'categories':filter_arr_data ,'allcategories':cat_data,'bool_section_check':true})
      }
      else{
          return res.render('klipse/view-klipse-course',{'c_id':c_id,'googleUrl':googleUrl,'user_info':user_data,'count':obj.course_details.length,'fav_courses':null,'image_preview':image_preview,'course':obj,'course_data':course_data,'nonsections':obj, 'video':video, 'role':sess.email,'user':sess.user,'isLoggedIn':true, 'categories':filter_arr_data ,'allcategories':cat_data,'bool_section_check':true})
      }
  }
 
   if(fav_course!= null){
      if (isMobile) {
          res.render('mobile-ui/course-view',{'c_id':c_id,'googleUrl':googleUrl,'user_info':user_data,'role':sess.email, 'fav_courses':fav_course,'count':obj.course_details.length,'image_preview':image_preview,'sections':sections , 'nonsections':obj,'video':video,'course':obj, 'course_data':course_data,'user':sess.user,'categories':filter_arr_data ,'isLoggedIn':true,'allcategories':cat_data ,'bool_section_check':true})
      }
      else{
          res.render('klipse/view-klipse-course',{'c_id':c_id,'googleUrl':googleUrl,'user_info':user_data,'role':sess.email, 'fav_courses':fav_course,'count':obj.course_details.length,'image_preview':image_preview,'sections':sections , 'nonsections':obj,'video':video,'course':obj, 'course_data':course_data,'user':sess.user,'categories':filter_arr_data ,'isLoggedIn':true,'allcategories':cat_data ,'bool_section_check':true})
      }

   }
  })
  })
  }
  else{
      if (isMobile) {
          res.render('mobile-ui/course-view',{'c_id':c_id,'googleUrl':googleUrl,'count':obj.course_details.length,'fav_courses':null,'image_preview':image_preview,'course':obj,'course_data':course_data,'nonsections':obj, 'video':video, 'role':sess.email,'user':sess.user,'isLoggedIn':false, 'categories':filter_arr_data ,'allcategories':cat_data,'bool_section_check':true})
      }
      else{
          res.render('klipse/view-klipse-course',{'c_id':c_id,'googleUrl':googleUrl,'count':obj.course_details.length,'fav_courses':null,'image_preview':image_preview,'course':obj,'course_data':course_data,'nonsections':obj, 'video':video, 'role':sess.email,'user':sess.user,'isLoggedIn':false, 'categories':filter_arr_data ,'allcategories':cat_data,'bool_section_check':true})
      }

      }
    }
  })//course section find
  }
  else{
    res.render('not-found');
  
    }
    })//courses find
    })//categories find
  
  });//course category

});//view klipse course

//---------------------------------------------------------------------
  // edit klipse course sections
//---------------------------------------------------------------------
app.get('/edit_klipse_course_section/:id', function(req, res,next) {
  
  var arr            = []
  var sub_categories = []
  var sub_arr        = []
  sess = req.session;
  var boolean = false;
  var isMobile = isCallerMobile(req);
  var googleDriveReg = /http(s)?:\/\/app.klipse.co\/embed\/video\/.*/gi;
  var linkUrl ;
  
  if(sess.email == "Creator" || sess.email == "Admin"){

  Course.find({kplis_course:'true'}) 
  .populate('cat_id')

  .exec((err, courses_cat)=>{
    if (err) return next(err);

    if(courses_cat == null){
      if (err) return next(err);

    }
    if(courses_cat.length > 0){
    //loopthrough the courses to get categories
      courses_cat.forEach(element => {
      sub_categories = []

      if(element.cat_id != null){
          
        if(parseInt(element.cat_id.id) == parseInt(element.course_meta_category) ){
          element.cat_id.sub_categories.forEach(elem => {
            if(parseInt(elem.id) == parseInt(element.course_sub_category )   ){
              sub_arr.push({id:element.cat_id.id, sub_id:elem.id,sub_name:elem.name})
                sub_arr = removeDuplicates( sub_arr, "sub_name");
                arr.push({_id:element.cat_id._id,
                  id:element.cat_id.id,name:element.cat_id.name ,sub_categories:sub_categories,
                  uid:element.uid,
                  course_name:element.course_name})
                        
                }
        
              });  
            }   
          }     
        });//courses_cat

      }//if  
      
      //removing duplicates
      let filter_arr = arr.reduce(function(acc, curr) {
        let findIndex = acc.findIndex(function(item) {
        return item.id === curr.id

        })
        if (findIndex === -1) {
            acc.push(curr)
        
        }
        else{
        
        }
        return acc
      }, [])

      filter_arr.forEach(elem => {
          sub_arr.forEach(element => {
              if(elem.id == element.id){
                  elem.sub_categories.push({sub_id:element.sub_id,sub_name:element.sub_name})
              }
          });
      });

      Categories.find({}).exec((err,cat_data) =>{
        if (err) return next(err);

         //finding the categories for course
        Course.findOne({_id:req.params.id})
    
        .exec((err, course)=>{
          if (err) return next(err);

          CourseSection.findOne({complete_course_id:course._id})
          .populate({
            path:'complete_course_id',
            select:['course_details','video_link'],
          })
          .exec((err, section)=>{

           if (err) return next(err);     

           if(section== null){
            var driveRegex = new RegExp(googleDriveReg);
            if (course.video_link.match(driveRegex)) {
              linkUrl = "true";
            }else{
              linkUrl = "false";
            }
            if (sess.user) {
              User.findOne({_id:sess.user})
              .exec((err, user_data) => {
                  if (err) return next(err);

                  if (user_data == null) {
                      if (err) return next(err);

                  }
                  if(isMobile){
                    res.render('mobile-ui/edit-course', {'editId':req.params.id,'linkUrl':linkUrl,'user_info':user_data,'categories':filter_arr , 'user':sess.user, 'isLoggedIn':true,'allcategories':cat_data,
                    'course':course, 'sections':section ,'sections_bool':boolean,'role':sess.email})
                    
                  }
                  else{
                    res.render('klipse/edit-klipse-course', {'editId':req.params.id,'linkUrl':linkUrl,'user_info':user_data,'categories':filter_arr , 'user':sess.user, 'isLoggedIn':true,'allcategories':cat_data,
                    'course':course, 'sections':section ,'sections_bool':boolean,'role':sess.email})
                     
                  }
                })
            }
            else{
              res.redirect('/')
            }
           }
           else{
            var driveRegex = new RegExp(googleDriveReg);
            if (course.video_link.match(driveRegex)) {
              linkUrl = "true";
            }else{
              linkUrl = "false";
            }
            boolean = true
            //looping through response 
            section.course_section.forEach(courses =>{
               courses.course_details.forEach(c_ids => {
                 courses.course_details.forEach(data => {
                           
                   if(data._id == c_ids.course_id){
                     c_ids.title = data.video_title
 
                     courses.course_details.push( {course_id:data._id , _id:c_ids._id ,video_title:c_ids.title,video_description:data.video_description,video_embed_link:data.video_embed_link,video_thumbnail:data.video_thumbnail,video_id:data.video_id,video_timestamp:data.video_timestamp})
                               
                     courses.course_details = removeDuplicates( courses.course_details, "_id");
                         
                   }//if match id
                       
                 });// course id
                   
               })//course details id
 
             // })//course section data
             
             courses = section
 
         })//course response data loop
            if (sess.user) {
              User.findOne({_id:sess.user})
              .exec((err, user_data) => {
                  if (err) return next(err);

                  if (user_data == null) {
                      if (err) return next(err);

                  }
                  if(isMobile){
                    res.render('mobile-ui/edit-course', {'editId':req.params.id,'linkUrl':linkUrl,'user_info':user_data,'categories':filter_arr , 'user':sess.user, 'isLoggedIn':true,'allcategories':cat_data,
                    'course':course, 'sections':section ,'sections_bool':boolean ,'role':sess.email})
                  }
                  else{
                    res.render('klipse/edit-klipse-course', {'editId':req.params.id,'linkUrl':linkUrl,'user_info':user_data,'categories':filter_arr , 'user':sess.user, 'isLoggedIn':true,'allcategories':cat_data,
                    'course':course, 'sections':section ,'sections_bool':boolean ,'role':sess.email})
                  }
             
                })
            }
            else{
              res.redirect('/')
            }
           }
                
      })
    })
     
  })
})   
}
else{
  res.render('authentication-failed');
}   
})// edit klipse course

//---------------------------------------------------------------------
  // reorder klipse course sections
//---------------------------------------------------------------------
app.get('/klipse_section_reorder/:id', function(req, res,next) {
  sess = req.session;
  var isMobile = isCallerMobile(req);

  if(sess.email == "Creator" || sess.email == "Admin"){

  try {

  // GET some data from whereever
  var arr            = []
  var sub_categories = []
  var sub_arr        = []
  var section_videos = []

  Course.find({kplis_course:'true'}) 
  .populate('cat_id')

  .exec((err, courses_cat)=>{
    if (err) return next (err);

    if(courses_cat == null){
      if (err) return next (err);

    }
    if(courses_cat.length > 0){
    //loopthrough the courses to get categories
      courses_cat.forEach(element => {
      sub_categories = []

      if(element.cat_id != null){
          
        if(parseInt(element.cat_id.id) == parseInt(element.course_meta_category) ){
          element.cat_id.sub_categories.forEach(elem => {
            if(parseInt(elem.id) == parseInt(element.course_sub_category )   ){
              sub_arr.push({id:element.cat_id.id, sub_id:elem.id,sub_name:elem.name})
                sub_arr = removeDuplicates( sub_arr, "sub_name");
                arr.push({_id:element.cat_id._id,
                  id:element.cat_id.id,name:element.cat_id.name ,sub_categories:sub_categories})
                        
                }
        
              });  
            }   
          }     
        });//courses_cat

      }//if  
      
      //removing duplicates
      let filter_arr = arr.reduce(function(acc, curr) {
        let findIndex = acc.findIndex(function(item) {
        return item.id === curr.id

        })
        if (findIndex === -1) {
            acc.push(curr)
        
        }
        else{
        
        }
        return acc
      }, [])

      filter_arr.forEach(elem => {
          sub_arr.forEach(element => {
              if(elem.id == element.id){
                  elem.sub_categories.push({sub_id:element.sub_id,sub_name:element.sub_name})
              }
          });
      });

      Categories.find({}).exec((err,cat_data) =>{
        if (err) return next (err);
        CourseSection.findOne({'course_section._id':req.params.id})
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
                    .populate('user')
                    .exec((err, obj1)=>{
                      if(obj1== null){
                        return res.status(500).json({
                          'success' : false,
                          'message': 'Invalid User Id'
                        
                        })
                      }
                      if(obj1 != null){
                                   
                        element.course_details.forEach(element1 => {
                          obj1.course_details.forEach(elm => {
                            if(elm._id == element1.course_id){
                              section_videos.push({_id:element1._id,course_id:elm._id,video_title:elm.video_title,video_thumbnail:elm.video_thumbnail,video_embed_link:elm.video_embed_link,video_id:elm.video_id})
    
                            }
                          });
                        });
                        if(sess.user){
                          User.findOne({_id:sess.user})
                          .exec((err, user_data) => {
                              if (err) return next(err);
  
                              if (user_data == null) {
                                  if (err) return next(err);
  
                              }
                              if(isMobile){
                                res.render('mobile-ui/reorder-section',{'user_info':user_data,'categories':filter_arr ,'allcategories':cat_data,'isLoggedIn':true,'user':sess.user,'_id':req.params.id,
                                'section_id':obj.complete_course_id,
                                'uid':obj1.uid,
                                'role':sess.email,
                                'section_videos':section_videos,
                                'course_name':obj1.course_name})
                                 
                              }
                              else{
                                res.render('klipse/klipse-section-reorder',{'user_info':user_data,'categories':filter_arr ,'allcategories':cat_data,'isLoggedIn':true,'user':sess.user,'_id':req.params.id,
                                'section_id':obj.complete_course_id,
                                'uid':obj1.uid,
                                'role':sess.email,
                                'section_videos':section_videos,
                                'course_name':obj1.course_name})
                                 
                              }
                            })
                        }
                        else{
                          res.redirect('/')
                        }
   
                        }

                      });//course exec

                    }//if

                  });//obj for loop 

                }//obj
              })
            })
          })
    
        } catch(err) {
          console.log(err);
          return null;
        }
      }
      else{
        res.render('authentication-failed');

      }
})



app.get('/google-video-test', function (req, res) {
  res.render('my-test.ejs');
})
//---------------------------------------------------------------------
  // remove duplicates (custom function)
//---------------------------------------------------------------------
function removeDuplicates (originalArray, prop) {

    var newArray = [];
    var lookupObject  = {};

    for(var i in originalArray) {
       lookupObject[originalArray[i][prop]] = originalArray[i];
    }

    for(i in lookupObject) {
        newArray.push(lookupObject[i]);
    }
     return newArray;

  }//remove duplicates


// route for user logout
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if(err) {
            return console.log(err);
        }
        res.redirect('/');
    });
});


// route for handling 404 requests(unavailable routes)
app.use(function (req, res, next) {
  res.render('not-found');

});


//link redirect route
app.get('/redirect', function (req, res) {
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
    return res.redirect(query.q)
});

app.get('/results', function (req, res) {
    // var url_parts = url.parse(req.url, true);
    // var query = url_parts.query;
    return res.redirect('https://www.youtube.com')
});

app.get('/watch', function (req, res) {
    var url_parts = url.parse(req.url, true);
    return res.redirect('https://www.youtube.com/'+url_parts.href)
});


//port listening 
app.listen(app.get('port') ,() => {
    console.log('server listening on port '+ app.get('port'));
    
    });//port listen

});//db connection

export { app }
