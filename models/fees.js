const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const feesSchema = new Schema({
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    amountTotal: { type: Number, required: true },
    amountPaid: { type: Number, default: 0 },
    dueDate: { type: Date, required: true },
    status: { 
        type: String, 
        enum: ['Paid', 'Pending', 'Overdue'], 
        default: 'Pending' 
    }
}, { timestamps: true });

module.exports = mongoose.model('Fees', feesSchema);
