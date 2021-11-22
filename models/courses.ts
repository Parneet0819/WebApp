import * as mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User'
    },
    course_details: [{
        video_description: String,
        video_title:String,
        video_tag:[String],
        video_link:String ,
        video_thumbnail:String  , 
        video_timestamp:[String],
        video_id : String,
        video_embed_link :String,
        channel_title:String,
        channel_link:String
    }],
    image_preview:{
        type:String
    },
    course_meta_category:{
         type:Number
    },
    course_sub_category :{
       type:Number
    },
    uid:{
        type:String
    },
    permalink :{
       type:String
    },
    video_link :String,
    cat_id:{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Categories'
    },
    course_title:String,
    favorite_bool:{
        type:Boolean,
        default:false
    },
    fav_count:{
        type:Number,
        default:0
    },
    g_course:{
        type:String,
        default:false
    },
    kplis_course:{
        type:String,
        default:false
    },
    course_name:String,
    created_at: Date,
    updated_at: Date 

})

courseSchema.pre('save', function(next) {

    const course = this;
    const now = new Date();
    course.updated_at = now;

    if (!course.created_at) {
        course.created_at = now;
    }
   
    next();
});

const Course = mongoose.model('Course', courseSchema);

export default Course;

