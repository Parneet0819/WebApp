import * as mongoose from 'mongoose';

const categoriesSchema = new mongoose.Schema({

    id:Number,
    name:{
       type:String,
       unique : true
    },
    sub_categories:[{
          id:Number,
          name:{
             type:String

          }
       }]
  
})

const Categories = mongoose.model('Categories', categoriesSchema);

export default Categories;
