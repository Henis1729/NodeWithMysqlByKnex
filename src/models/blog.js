import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate';

const ObjectId = mongoose.Schema.Types.ObjectId;;

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    createdBy: {
        type: ObjectId,
        ref: 'user'
    },
    updatedBy: {
        type: ObjectId,
        ref: 'user'
    },
}, {
    timestamps: true,
    strict: false
})

blogSchema.plugin(mongoosePaginate)

const Blog = mongoose.model('blog', blogSchema);
export default Blog;