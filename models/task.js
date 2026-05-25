const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const taskSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String },
    dueDate: { type: Date },
    status: { 
        type: String, 
        enum: ['Pending', 'In Progress', 'Completed'], 
        default: 'Pending' 
    },
    owner: { type: Schema.Types.ObjectId, required: true, refPath: 'ownerModel' },
    ownerModel: { 
        type: String, 
        required: true, 
        enum: ['Student', 'Faculty'] 
    }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
