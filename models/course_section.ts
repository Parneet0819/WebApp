import * as mongoose from 'mongoose';

const sectionSchema = new mongoose.Schema({

    user: {
      type: mongoose.Schema.ObjectId, 
      ref: 'User'
    },
    course_section:[{
      section_name: String,
      course_details: [{
        course_id:{
              type:String,  ref: 'Course'
            } ,
            video_description: String,
            video_title:String,
            video_tag:String,
            video_link:String ,
            video_thumbnail:String  , 
            video_timestamp:[String],
            video_id : String,
            video_embed_link :String,
            channel_title:String,
            channel_link:String
          }
        ]
      }],
    complete_course_id :{
      type: mongoose.Schema.ObjectId, 
      ref: 'Course'
    },
    
    created_at: Date,
    updated_at: Date   
  })

sectionSchema.pre('save', function(next) {
    
    const section = this;
    const now = new Date();
   
    section.updated_at = now;

    if (!section.created_at) {
        section.created_at = now;
    }
    
    next();
});

const CourseSection = mongoose.model('CourseSection', sectionSchema);

export default CourseSection;
