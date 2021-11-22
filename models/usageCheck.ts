import * as mongoose from 'mongoose';

const usageCheckSchema = new mongoose.Schema({

    ip: {
        type:String,
        required:true
    },
    email: {
        type:String,
        required:true
    }, 
    accessed_at:   Date
});


usageCheckSchema.pre('save', function(next) {

    const usageCheck = this;
    const now = new Date();

    if (!usageCheck.accessed_at) {
       usageCheck.accessed_at = now;
    }

    next();
});

const UsageCheck = mongoose.model('UsageCheck', usageCheckSchema);

export default UsageCheck;
