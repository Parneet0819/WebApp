import * as mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User'
    },
    course_id: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Course'
    }, 
    favorite_bool:{
        type:Boolean,
        default:false
    },
    created_at: Date,
    updated_at: Date
});


favoriteSchema.pre('save', function(next) {

    const favorite = this;
    const now = new Date();

    if (!favorite.accessed_at) {
        favorite.accessed_at = now;
    }

    next();
});

const Favorites = mongoose.model('Favorites', favoriteSchema);

export default Favorites;
