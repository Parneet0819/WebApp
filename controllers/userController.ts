import User from '../models/user';
import UsageCheck from '../models/usageCheck';
import Course from '../models/courses';
import errorCodes from '../logs/err_codes';
var { nanoid } = require("nanoid");
const session = require('express-session');
import * as fs from 'fs';
import * as bcrypt from 'bcrypt';

export default class UserController  {

    //schema declaration
    model = User;
    SALT_WORK_FACTOR = 10;
    course = Course;

    sess;
    myVar;
    
 //---------------------------------------------------------------------
    // Get by email
//---------------------------------------------------------------------
    getUser = (req, callback) => {
        this.model.findOne({ email: req.body.email  } ,callback);
      
    }// Get by email

   
//---------------------------------------------------------------------
    // add the user(user registration)
//---------------------------------------------------------------------
addUser = (req, res) => {
    console.log("---req---", req.body)
    var short_id;
    if(!req.body.role  && !req.body.email && !req.body.password){
        return res.json({
            'success': false,
            'err_code':errorCodes.ServerErrors['ALL_MISSING_PARMS'],
            'message':'Missing Parameters!'
        });     
    }
     //check for email and password as required fields
     if(!req.body.email && !req.body.password){
        return res.json({
            'success': false,
            'err_code':errorCodes.ServerErrors['MISSING_PARAMETERS'],
            'message':'Email and Password are Missing!'
        });     
    }
      //check for email and role as required fields
      if(!req.body.email && !req.body.role){
        return res.json({
            'success': false,
            'err_code':errorCodes.ServerErrors['EMAIL_ROLE'],
            'message':'Email and Role  are Missing!'
        });     
    }
     //check for email and role as required fields
     if(!req.body.password && !req.body.role){
        return res.json({
            'success': false,
            'err_code':errorCodes.ServerErrors['PWD_ROLE'],
            'message':'Role and Password are Missing!'
        });     
    }
    if (!req.body.role ) {
        res.send({
            'success': false,
            'err_code': errorCodes.ServerErrors['EMPTY_ROLE'],
            'message': 'Role can not be Empty!'
        });
        return;
    }
    if(req.body.email){
       var emailCheck =  this.validateEmail(req.body.email);
       if(emailCheck == false){
        res.send({
            'success': false,
            'err_code': errorCodes.ServerErrors['INVALID_EMAIL'],
            'message': 'Please enter the valid email!'
        });
        return; 
       }
    }
    if(req.body.password){
        var pwdCheck  = this.validatePassowrd(req.body.password)
        if(pwdCheck == false){
            res.send({
                'success': false,
                'err_code': errorCodes.ServerErrors['INVALID_PWD'],
                'message': 'The password should be atleast 8 character with one digit , upper letter and special character!'
            });
            return; 
           }
    }
    if(req.body.role == 'Creator'){
       
        if(!req.body.email){
            return res.json({
                'success': false,
                'err_code':errorCodes.ServerErrors['MISSING_EMAIL'],
                'message':'Email Missing!'
            });     
        }
        if(!req.body.password){
            return res.json({
                'success': false,
                'err_code':errorCodes.ServerErrors['MISSING_PASSWORD'],
                'message':'Password Missing!'
            });     
        }
        this.model.findOne({email:req.body.email})
        .exec((err, exists_user)=>{
            if(err){
                return res.json({
                'success': false,
                'err_code': errorCodes.ServerErrors['INVALID_USER_ID'],
                'message': 'Invalid User!',
                "err" :err
                });
            } 
            if(exists_user){
                return res.json({
                    'success': false,
                    'err_code': errorCodes.ServerErrors['ALREADY_EXISTS'],
                    'message': 'Already Exists!'
                });
            }
            if(exists_user == null){

                //checking for courses data
                this.course.find({})
                        
                .exec((err, obj1)=>{

                    //error
                    if(err){
                        return res.json({
                        'success': false,
                        'err_code': errorCodes.ServerErrors['INVALID_USER_ID'],
                        'message': 'Failed to get the data!',
                        "err" :err
                        });
                    } 

                    //courses null
                    if(obj1 == null ){
                        short_id = nanoid(3);
                        
                        // creating the object for user schema
                        const obj = new User({
                            email: req.body.email,
                            password: req.body.password,
                            name: req.body.name,
                            uid:short_id,
                            role:req.body.role

                        });

                        //saving the object in user schema
                        obj.save((err, savedUser) => {
                            // check for error
                            if (err) {
                                return res.status(400).json({
                                    'success': false,
                                    'err_code': errorCodes.ServerErrors['DATA_SAVING_ERR'],
                                    'message': 'data is not saved'
                                });
                            }
                
                        res.status(200).json({
                            'success': true,
                            'userID': savedUser
                        });

                    });//obj
                }
                else{
                    if(obj1.length <= 20){
                        short_id = nanoid(3);
                    }
                    else if(obj1.length <= 60){
                        short_id = nanoid(5);
                    }

                    else if(obj1.length <= 100){
                        short_id = nanoid(7);

                    }
                    else if (obj1.length <= 1000){
                        short_id = nanoid(9);

                    }
                    else{
                        short_id = nanoid(10);
                    }

                    // creating the object for user schema
                    const obj_data = new User({
                        email: req.body.email,
                        password: req.body.password,
                        name: req.body.name,
                        uid:short_id,
                        role:req.body.role
                    
                    });
                    
                    //saving the object in user schema
                    obj_data.save((err, savedUserData) => {
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
                            'userID': savedUserData
                            
                        });

                    });//obj
                } 
            })

            }//null case
                
        })//course obj
    }
    else if (req.body.role == "Normal User"){
        
        if(!req.body.email){
            return res.json({
                'success': false,
                'err_code':errorCodes.ServerErrors['MISSING_EMAIL'],
                'message':'Email Missing!'
            });     
        }
        if(!req.body.password){
            return res.json({
                'success': false,
                'err_code':errorCodes.ServerErrors['MISSING_PASSWORD'],
                'message':'Password Missing!'
            });     
        }
        this.model.findOne({email:req.body.email})
        .exec((err, exists_user)=>{
            if(err){
                return res.json({
                    'success': false,
                    'err_code': errorCodes.ServerErrors['INVALID_USER_ID'],
                    'message': 'Invalid User!',
                    "err" :err
                });
            } 
            if(exists_user){
                return res.json({
                    'success': false,
                    'err_code': errorCodes.ServerErrors['ALREADY_EXISTS'],
                    'message': 'Already Exists!'
                });
            }
            if(exists_user == null){

                // creating the object for user schema
                const obj_user_data = new User({
                    email: req.body.email,
                    password: req.body.password,
                    name: req.body.name,
                    role:req.body.role

                });
        
                //saving the object in user schema
                obj_user_data.save((err, savedUserData) => {
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
                    'userID': savedUserData
                });

            })
        }

    });//obj

    }//normal user role
    
}//addUser

 validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}
validatePassowrd (passowrd) {
    var regularExpression  = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*(\W|_)).{8,}$/;
    return regularExpression.test(passowrd);
}
//---------------------------------------------------------------------
    // admin login
//--------------------------------------------------------------------- 
    adminSignup = (req, res) => {
        
        var short_id;
        
        if (!req.body.role) {
            res.send({
                'success': false,
                'err_code': 'Invalid',
                'message': 'Role can not be Empty!'
            });
            return;
        }

        if(req.body.role == 'Admin'){
        
        //check for email and password as required fields
        if(!req.body.email){
            res.send({
                'success':false ,
                'err_code':errorCodes.ServerErrors['MISSING_PARAMETERS'],
                'message':'Email is required'
              });
              return;
        }
        if(!req.body.password){
            res.send({
                'success':false ,
                'err_code':errorCodes.ServerErrors['MISSING_PARAMETERS'],
                'message':'password is required'
              });
              return;
        }

        //checking for courses data
        this.course.find({})
        .exec((err, obj1)=>{

            //error
            if(err){
                return res.json({
                'success': false,
                'err_code': errorCodes.ServerErrors['INVALID_USER_ID'],
                'message': 'Failed to get the data!',
                "err" :err
                });
            } 

            //courses null
            if(obj1 == null ){
              short_id = nanoid(3);
                
              // creating the object for user schema
                const obj = new User({
                    email: req.body.email,
                    password: req.body.password,
                    name: req.body.name,
                    uid:short_id,
                    role:req.body.role
                
                });

                //saving the object in user schema
                obj.save((err, savedUser) => {
                    // check for error
                    if (err) {
                        return res.status(400).json({
                            'success': false,
                            'err_code': errorCodes.ServerErrors['DATA_SAVING_ERR'],
                            'message': 'data is not saved'
                            });
                        }

                        
                     
                        res.status(200).json({
                            'success': true,
                            'userID': savedUser,
                        });

                    });//obj

            }//null case
            else{
                if(obj1.length <= 20){
                    short_id = nanoid(3);
                }
                else if(obj1.length <= 60){
                    short_id = nanoid(5);
                }

                else if(obj1.length <= 100){
                    short_id = nanoid(7);
    
                }
                else if (obj1.length <= 1000){
                    short_id = nanoid(9);

                }
                else{
                    short_id = nanoid(10);
                }

                // creating the object for user schema
                const obj_data = new User({
                    email: req.body.email,
                    password: req.body.password,
                    name: req.body.name,
                    uid:short_id,
                    role:req.body.role

                
                });
                
                //saving the object in user schema
                obj_data.save((err, savedUserData) => {
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
                        'userID': savedUserData
                    });

                });//obj
            }    
        })//course obj

    }//admin role

    }//admin login

    getUserEmail = (req, callback) => {
        this.model.findOne({ email: req.query.email  } ,callback);
      
    }// Get by email

//---------------------------------------------------------------------
    // user login
//--------------------------------------------------------------------- 
userLogin = (req, res) => {  
       
    const MAX_ATTEMPTS = 4;
    const LOCK_TIME = 1 * 60 * 1000 ;
    this.getUser(req, (err, user) => {
        if (err) {
            return res.status(500).json({
                'success': false,
                'error': err
            });
        }
        if(!req.body.email && !req.body.password){
            return res.json({
                'success': false,
                'err_code':errorCodes.ServerErrors['MISSING_PARAMETERS'],
                'message':'Email and Password are Missing!'
            });     
        }
        if(!req.body.email){
            return res.json({
                'success': false,
                'err_code':errorCodes.ServerErrors['MISSING_EMAIL'],
                'message':'Email Missing!'
            });     
        }
        if(!req.body.password){
            return res.json({
                'success': false,
                'err_code':errorCodes.ServerErrors['MISSING_PASSWORD'],
                'message':'Password Missing!'
            });     
        }
        // checking if user is null
        if (user == null) {
            return res.json({
                'success': false,
                'err_code':errorCodes.ServerErrors['USER_NOT_FOUND'],
                'message':'Invalid User!'
            });           
        }
       
        else {
            //user passowrd comparison
            user.comparePassword(req.body.password, user.password, (error, isMatch) => {
                if (error) {
                   return res.json({
                        'success': false,
                        'error': error
                    });
                }
                if (isMatch) {                       
                    var ipaddress = req.headers['x-forwarded-for'] ||
                    req.connection.remoteAddress ||
                    req.socket.remoteAddress ||
                    (req.connection.socket ? req.connection.socket.remoteAddress : null);

                    //save ip
                    const p = UsageCheck({
                    ip: ipaddress,
                    email: req.body.email
                    });

                    p.save((err, savedinfo) => {
                        if(err){
                            return res.json({
                                'success': false,
                                'error': err
                            });
                         }  else {
                            if(!!user.lockUntil && user.lockUntil > Date.now() == true){
                                return res.json({
                                    'success': false,
                                    'err_code':errorCodes.ServerErrors['ACCOUNT_LOCKED'],
                                    'message':'Your Account locked yet!'
                                });      
                            }
                            else if(!!user.lockUntil && user.lockUntil > Date.now() == false){
                                User.findOneAndUpdate({_id: user._id,
                                    $set: { loginAttempts: 0 },
                                    $unset: { lockUntil: 1 }
                                })
                                .exec((err, rst) =>{
                                    // this.myStopFunction()
                                 if (err) { 
                                     return res.json({
                                         'success': false,
                                         'error': err
                                     });                     
                                 } else{
                                    
                                     res.json({
                                        'success': true,
                                       'message':  rst.email + ' logged in succesfully!',
                                       'user':rst._id,
                                       'role':rst.role
                                     
                                    });
                                }
                             })
                            }
                           
                           else{
                                // find the user in user schema with email
                                User.findOneAndUpdate({ _id: user._id},{$set: { loginAttempts: 0 }})
                                .exec((err, users)=>{ 
                                    if( req.session){
                                        if(user){
                                          req.session.user = user._id;
                                          req.session.email = user.role;
                                        }
                                        else{
                                          req.session.user = undefined;
                                        }
                                    }

                            res.json({
                                'success': true,
                               'message':  p.email + ' logged in succesfully!',
                               'user':user._id,
                               'role':user.role

                                });
                            });
                        }
                    }
                    });
                
                    } else {
                        User.findOneAndUpdate({ _id: user._id},{ $inc: { loginAttempts: 1 } })
                            .exec((err, result)=>{ 
                                if(result.loginAttempts > MAX_ATTEMPTS){
                                    User.findOneAndUpdate({ _id: user._id},{  lockUntil: Date.now() + LOCK_TIME })
                                    .exec((err, resultt)=>{ 

                                        this.myVar = setTimeout(function() {
                                            console.log('------Interval reached------');
                                            User.findOneAndUpdate({_id:user._id},{ loginAttempts: user.loginAttempts >= 5,
                                                $set: { loginAttempts: 0 },
                                                $unset: { lockUntil: 1 }
                                            })
                                            .exec((err, rst) =>{
                                              
                                             if (err) { 
                                                 return res.json({
                                                     'success': false,
                                                     'error': err
                                                 });                     
                                             } else{
                                         }
                                         })
                                        }, 60000); 
                                        res.json({
                                            'success':false,
                                            'err_code':errorCodes.ServerErrors['MAX_ATTEMPT_LIMIT_REACHED'],
                                            'message':'Account locked for 15 mins'
                                            })                                                                                        
                               
                                        })
                                        
                                        return;
                                    }
                                
                            return res.json({
                                'success': false,
                                'err_code':errorCodes.ServerErrors['LOGIN_INVALID_PASSWORD'],
                                'message':'Password Incorrect!'
                            });
                            
                         });

                  }// else

            });//compare password  
        }
    });// getUser

}// userLogin

//---------------------------------------------------------------------
    // changePassword
//---------------------------------------------------------------------
changePassword = (req,res) =>{
    this.model.findOne({_id:req.body.id})
    .exec((err, obj) =>{
        if(!req.body.password){
            return res.json({
                'success':false,
                'err':3000,
                'message':'Please Enter the password'
            })
        }
        if(req.body.password){
            var pwdCheck  = this.validatePassowrd(req.body.password)
            if(pwdCheck == false){
                res.send({
                    'success': false,
                    'err_code': errorCodes.ServerErrors['INVALID_PWD'],
                    'message': 'The password should be atleast 8 character with one digit , upper letter and special character!'
                });
                return; 
               }
        }

        obj.comparePassword(req.body.old_password, obj.password, (error, isMatch) => {
            if (error) {
                return res.status(500).json({
                    'success': false,
                    'error': error
                });
            }
            if (isMatch) {
                // generate a salt)
                bcrypt.genSalt(this.SALT_WORK_FACTOR, (err, salt) => {
                    if (err) {
                        return res.status(500).json({
                            'success': false,
                            'message': 'Encrypt generate error'
                        });
                    }
                    // hash the password using our new salt

                    bcrypt.hash( req.body.password, salt, (err1, hash) => {
                        if (err1) {
                            return res.status(500).json({
                                'success': false,
                                'message': 'Password encrypt error'
                            });
                        }
                        // override the cleartext password with the hashed one

                        req.body.password = hash;

                        this.model.findOneAndUpdate({_id:req.body.id} , {password: req.body.password})
                        .exec((err, obj1) =>{
                            res.json({
                                'success':true,
                                'message':'Password updated Succesfully'
                            })
                        })

                    });
                });
            }
            else{
                return res.json({
                    'success':false,
                    'err_code':333,
                    'message':'Password not Matched!'
                })
            }
        })
       
    })

}
myStopFunction = () => {
    clearTimeout(this.myVar);
  }
appsignup = (req,res) => {
    if(!req.body.email && !req.body.password  && !req.body.name){
        return res.json({
            'success': false,
            'err_code':errorCodes.ServerErrors['MISSING_PARAMETERS'],
            'message':'Email, Password and Name are Missing!'
        });     
    }
    if(!req.body.email && !req.body.password ){
        return res.json({
            'success': false,
            'err_code':errorCodes.ServerErrors['EMAIL_PASS_MISSING'],
            'message':'Email and Password  are Missing!'
        });     
    }
    if(!req.body.email && !req.body.name){
        return res.json({
            'success': false,
            'err_code':errorCodes.ServerErrors['EMAIL_NAME_MISSING'],
            'message':'Email and Name are Missing!'
        });     
    }
    if(!req.body.password  && !req.body.name){
        return res.json({
            'success': false,
            'err_code':errorCodes.ServerErrors['PWD_NAME_MISSING'],
            'message':'Password and Name are Missing!'
        });     
    }
    if(!req.body.email){
        return res.json({
            'success': false,
            'err_code':errorCodes.ServerErrors['MISSING_EMAIL'],
            'message':'Email Missing!'
        });     
    }
    if(!req.body.password){
        return res.json({
            'success': false,
            'err_code':errorCodes.ServerErrors['MISSING_PASSWORD'],
            'message':'Password Missing!'
        });     
    }
    if(!req.body.name){
        return res.json({
            'success': false,
            'err_code':errorCodes.ServerErrors['MISSING_NAME'],
            'message':'Name Missing!'
        });     
    }
    if(req.body.email){
        var emailCheck =  this.validateEmail(req.body.email);
        console.log("------email check----", emailCheck)
        if(emailCheck == false){
         res.send({
             'success': false,
             'err_code': errorCodes.ServerErrors['INVALID_EMAIL'],
             'message': 'Please enter the valid email!'
         });
         return; 
        }
     }
     if(req.body.password){
         var pwdCheck  = this.validatePassowrd(req.body.password);
         console.log("------pwdCheck check----", pwdCheck)

         if(pwdCheck == false){
             res.send({
                 'success': false,
                 'err_code': errorCodes.ServerErrors['INVALID_PWD'],
                 'message': 'The password should be atleast 8 character with one digit , upper letter and special character!'
             });
             return; 
            }
     }
    this.model.findOne({email:req.body.email})
    .exec((err, exists_user)=>{
        if(err){
            return res.json({
                'success': false,
                'err_code': errorCodes.ServerErrors['INVALID_USER_ID'],
                'message': 'Invalid User!',
                "err" :err
            });
        } 
        if(exists_user){
            return res.json({
                'success': false,
                'err_code': errorCodes.ServerErrors['ALREADY_EXISTS'],
                'message': 'Already Exists!'
            });
        }
        if(exists_user == null){
            // creating the object for user schema
            const obj_data = new User({
                email: req.body.email,
                password: req.body.password,
                name: req.body.name,
                role:'Normal User'

            
            });
    
            //saving the object in user schema
            obj_data.save((err, savedUserData) => {
            
                res.json({
                    'success':true,
                    'data':savedUserData
                })
            })
        }
    })

}

editUserProfile = (req,res) =>{
    var editObj = <any>{};
    console.log("==req==", req.body);
   
    this.model.findOne({_id:req.params.id})
    .exec((err, obj) => {

        if(err){
            return res.json({
                'success':false,
                'err':err
            })
        }
   
    if (req.body.profile_image) {
        
        var buff = req.body.profile_image.value.replace(/^data:image\/(png|gif|jpeg|jpg);base64,/, '') ;
        if(req.body.profile_image.filename){
            req.body.profile_image.filename = req.body.profile_image.filename.replace(/[@+*%^&_=!()#]/g,"-") 

        } 
        var image_file = 'public/uploads/' + req.params.id +'-'+ req.body.profile_image.filename;
        var img_file = '/uploads/' + req.params.id +'-'+ req.body.profile_image.filename;
        if (fs.existsSync(image_file)) { 
               var  local_img = img_file.substr(0, img_file.indexOf('-'));
               var db_img = obj.profile_image.substr(0, obj.profile_image.indexOf('-'));
                if(local_img == db_img){
                    fs.unlinkSync('public/'+obj.profile_image);

                }
        }
       
        fs.writeFile(image_file, buff, {encoding: 'base64'}, function(err){
            return err;
        });
    }
      if (req.body.profile_image) editObj.profile_image = img_file;
      if (req.body.basic_info) editObj.basic_info = req.body.basic_info;
      if (req.body.name) editObj.name = req.body.name;
      if (req.body.email) editObj.email = req.body.email;
    
      User.findOneAndUpdate({_id:req.params.id},editObj,{new:true})
        .exec((err, result1) =>{  
        if(err) {
            return res.json({
                'success':false,
                'err':err,
                
            })
        }
        if(result1 == null){
            return res.json({
                'success':false,
                'message':'Record not Found!'
            })
        }
      
        res.json({
            'success':true,
            'message':'User info updated succesfully!'
        })
    })
})

}
getUserData = (req,res) => {
    this.model.findOne({_id:req.body.id})
    .exec((err, result) =>{
        if(err){
            return res.json({
                'success':false,
                'message':'Error'
               
            })
        }
        if(result == null)
        {
            return res.json({
                'success':false,
                'message':'User doesnot exist'
               
            })  
        }
        var info;
        if(result.basic_info != null){
            info = result.basic_info ;

        }
        res.json({
            'success':true,
            'name':result.name,
            'email':result.email,
            'profile_image':result.profile_image,
            'info':info
            
        })
    })
}

}//userController             


