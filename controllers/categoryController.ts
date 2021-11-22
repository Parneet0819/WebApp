import User from '../models/user';
import Categories from '../models/categories';
import errorCodes from '../logs/err_codes';
import Course from '../models/courses';


export default class CategoryController{
   
    model = Categories


//---------------------------------------------------------------------
    // add categories to course 
//---------------------------------------------------------------------
addCourseCategories = (req,res) => {

    var categories = []
    for(var i = 0; i<req.body.sub_categories.length; i++) {
        var ID= req.body.sub_categories[i].id
        var name = req.body.sub_categories[i].name
        categories.push({id:ID, name:name})
    }

       //adding the Section object
       const obj = new Categories({
        id :req.body.id,
        name:req.body.name,
        sub_categories:categories,
    });

    //saving course section data 
    obj.save((err, categories) => {
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
            'data': categories
        });
    });//categories obj 

}//addCourseCategories

//---------------------------------------------------------------------
    // get categories list
//---------------------------------------------------------------------
getCategories = (req,res) => {

    this.model.find({})
    .exec((err,obj)=>{
        if(err){
            return res.json({
                'success':false,
                err:err,
                'message':'error'
            })
        }
       
        if(obj.length == 0){
            return res.json({
                'success':false,
                err:err,
                'message':'record not found!'
            })     
        }
        res.json({
            'success':true,
            'data':obj
        })
    })
}// getCategories

//---------------------------------------------------------------------
    // get partcular category 
//---------------------------------------------------------------------
getParticularCategory = (req,res) => {
    this.model.findOne({id:req.body.id, name:req.body.name})
    .exec((err,obj)=>{
        if(err){
            return res.json({
                'success':false,
                err:err,
                'message':'error'
            })
        }
       
        if(obj == null){
            return res.json({
                'success':false,
                'message':'record not found!'
            })     
        }
        res.json({
            'success':true,
            'data':obj
        })
    })
}// getParticularCategory

//---------------------------------------------------------------------
    // get categories list for app
//---------------------------------------------------------------------
getCategoriesList = (req,res) => {
    var arr = []
    Course.find({}).select('cat_id')
    .populate('cat_id')
    .exec((err,obj)=>{
        if(err){
            return res.json({
                'success':false,
                err:err,
                'message':'error'
            })
        }
        if(obj.length == 0){
            return res.json({
                'success':false,
                'err_code': errorCodes.ServerErrors['EMPTY_DATA'],
                'message':'record not found!'
            })     
        }
        if(obj.length > 0){
            for (let index = 0; index < obj.length; index++) {
                const element = obj[index].cat_id;
                arr.push({_id:element._id,name:element.name})
            }
            arr = this.removeDuplicates(arr,'_id')
        }

       
       
        res.json({
            'success':true,
            'data':arr
        })
    })
}// getCategories

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

}//CategoryController