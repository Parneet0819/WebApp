import UserController from './controllers/userController';
import CourseController from './controllers/courseController';
import CourseSectionController from './controllers/courseSectionController';
import CategoryController from './controllers/categoryController';
import FavoriteController from './controllers/favoriteCourseController';
import CommentsController from './controllers/commentsController';

export default function setRoutes (app) {

    const userCtrl = new UserController();
    const courseCtrl  = new CourseController();
    const courseSectionCtrl  = new CourseSectionController();
    const categoryCtrl  = new CategoryController();
    const favCtrl = new FavoriteController();
    const commentCtrl = new CommentsController();

//-------------------------
    // Auth APIs
//-------------------------
    app.route('/login').post(userCtrl.userLogin);
    app.route('/signup').post(userCtrl.addUser);
    app.route('/admin/signup').post(userCtrl.adminSignup);
    app.route('/api/user/editUserProfile/:id').post(userCtrl.editUserProfile);
    app.route('/api/user/changePassword').post(userCtrl.changePassword);
    app.route('/api/user/appsignup').post(userCtrl.appsignup);
    app.route('/api/user/getUserProfile').post(userCtrl.getUserData);

//-------------------------
    // Category APIs
//-------------------------
app.route('/api/course-category/addCourseCategories').post(categoryCtrl.addCourseCategories );//add category 
app.route('/api/course-category/getCategories').get(categoryCtrl.getCategories );//get categories 
app.route('/api/course-category/getParticularCategory').post(categoryCtrl.getParticularCategory );//get particular category 
app.route('/api/course-category/getCategoriesList').get(categoryCtrl.getCategoriesList );//get particular category 

 //-------------------------
    // Course APIs
//-------------------------
    app.route('/api/course/addCourse').post(courseCtrl.addCourse);//add course
    app.route('/api/course/getCourseByCId').post(courseCtrl.getCourseByCId);//get courses by id
    app.route('/api/course/updateCourseById').put(courseCtrl.updateCourseById);//update courses by id
    app.route('/api/course/deleteCourseById').delete(courseCtrl.deleteCourseById);//delete courses by id
    app.route('/api/course/getSelectedCourses').post(courseCtrl.getSelectedCourses);//getselected courses
    app.route('/api/course/addVideoInCourse').post(courseCtrl.addVideoInCourse);//add video to course
    app.route('/api/course/updateCoursePosition').post(courseCtrl.updateCoursePosition);//update course position
    app.route('/api/course/getCourseMetaCategory').post(courseCtrl.getCourseMetaCategory );//get course meta categories 
    app.route('/api/course/updateCourseName').post(courseCtrl.updateCourseName );//update course name 
    app.route('/api/course/deleteCourse').delete(courseCtrl.deleteCourse );//delete course from db
    app.route('/api/course/updateCourseThumbnail').put(courseCtrl.updateCourseThumbnail );//update course thumbnail
    app.route('/api/course/getCourseByCategoryName').post(courseCtrl.getCourseByCategoryName );
    app.route('/api/course/editDescForCourse').put(courseCtrl.editDescForCourse );
    app.route('/api/course/getCourseIdByVideoId').post(courseCtrl.getCourseIdByVideoId );
    app.route('/api/course/editCourseName').post(courseCtrl.editCourseName );
    app.route('/api/course/get-timestamp').get(courseCtrl.getTimestampsForVideo );//get video timestamps
    app.route('/api/course/pagination-data').post(courseCtrl.getPaginationData );//getPaginationData
    app.route('/api/course/editEmptyCourseFields').post(courseCtrl.editEmptyCourseFields );//un favorite the course
    app.route('/api/course/getCourseBySubCategoryName').post(courseCtrl.getCourseBySubCategoryName );//getting course by subcatories 
    app.route('/api/course/getNextPrevCourse').post(courseCtrl.getNextPrevCourse );//getting next and prev course
    app.route('/api/course/getCourses').get(courseCtrl.getCourses );//getting all courses
    app.route('/api/course/getCourseDetails').get(courseCtrl.getCourseDetails );//getting  course detail
    app.route('/api/course/getSubCatList').post(courseCtrl.getSubCatList );//get sub categories 
    app.route('/api/course/getLatestCourse').post(courseCtrl.sortByLatestCourses );//sort courses by latest ones
    app.route('/api/course/getOldestCourse').post(courseCtrl.sortBytOldestCourses );// sort courses by oldest ones
    app.route('/api/course/sortByFavorites').get(courseCtrl.sortByFavorites );//sort courses by favorite ones
       //-------------------------
    // Course Section APIs
    //-------------------------
    app.route('/api/course-section/addCourseSection').post(courseSectionCtrl.addCourseSection);//add course section
    app.route('/api/course-section/getCourseSectionList').post(courseSectionCtrl.getCourseSectionList);//get course section
    app.route('/api/course-section/getSingleCourseSection').post(courseSectionCtrl.getSingleCourseSection);//get single course section
    app.route('/api/course-section/getSectionWithCourseId').post(courseSectionCtrl.getSectionWithCourseId);//get course section by course id
    app.route('/api/course-section/getSectionWithCId').post(courseSectionCtrl.getSectionWithCoId );//get section data with course id
    app.route('/api/course-section/updateSectionData').post(courseSectionCtrl.updateSectionData );//update the section data
    app.route('/api/course-section/removeSectionVideo').post(courseSectionCtrl.removeSectionVideo );//delete the video from section
    app.route('/api/course-section/removeSection').post(courseSectionCtrl.removeSection );//delete the course particular section 
    app.route('/api/course-section/getCourses').post(courseSectionCtrl.getCourses );//getting courses 
    app.route('/api/course-section/deleteSectionAndCourseVideo').post(courseSectionCtrl.deleteSectionAndCourseVideo );//delete video from section and courses 
    app.route('/api/course-section/getParticularSection/:id').get(courseSectionCtrl.getParticularSection );//get video's in a single section
    app.route('/api/course-section/updateSectionPosition').post(courseSectionCtrl.updateSectionPosition );//update the position of section
    app.route('/api/course-section/getRequestedSection').post(courseSectionCtrl.getRequestedSection );// get requested section
    app.route('/api/course/addGoogleVideo').post(courseCtrl.postGoogleVideo );
    app.route('/api/course/addGVideo').post(courseCtrl.addGoogleVideo );
    app.route('/api/course/addGoogleeVideo').post(courseCtrl.addGoogleeVideo );
    app.route('/api/course/addMoreKplisCourse').post(courseCtrl.addMoreKplisCourse );

    //-------------------------
     // Favorite ApIs
    //-------------------------
    app.route('/api/fav/addFavCourse').post(favCtrl.addFavCourse );//add fav course
    app.route('/api/fav/getFavCourses').post(favCtrl.getFavCourses );//get all fav courses
    app.route('/api/fav/unFavCourse').post(favCtrl.unFavCourse );//un favorite the course
    app.route('/api/fav/getFavId').post(favCtrl.getFavId );//get fav course id


     //-------------------------
     // Comments ApIs
    //-------------------------
    app.route('/api/comment/addComment').post(commentCtrl.addComment );//add comment for a course
    app.route('/api/comment/getComments').get(commentCtrl.getComments );// get comments list
    app.route('/api/comment/getSingleComment').post(commentCtrl.getParticularComment ); // get particular comment
    app.route('/api/comment/deleteComment').post(commentCtrl.deleteParticularComment ); // delete particular comment
    app.route('/api/comment/editComment').put(commentCtrl.editComment ); // edit particular comment
    app.route('/api/comment/addReplyToComment').put(commentCtrl.addReplyToComment ); // add particular comment reply
    app.route('/api/comment/editCommentReply').put(commentCtrl.editCommentReply ); // update the particular comment reply
    app.route('/api/comment/deleteCommentReply').delete(commentCtrl.deleteCommentReply ); // update the particular comment reply

}