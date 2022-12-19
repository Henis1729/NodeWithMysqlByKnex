import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate';
import validator from 'validator';
import bcrypt from 'bcryptjs';


const ObjectId = mongoose.SchemaTypes.ObjectId;

const userSchema = new mongoose.Schema({
    // _id: {
    //     type: String,
    //     unique: true
    // },
    firstName: {
        type: String,
        trim: true,
    },
    lastName: {
        type: String,
        trim: true,
    },
    userName: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        index: true,
        validate: [validator.isEmail, 'Invalid Email']
    },
    age: {
        type: Number,
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'other']
    },
    dob: {
        type: Date
    },
    password: {
        type: String
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

userSchema.pre('save', async function (next) {
    const user = this
    // if (user.isNew) {
    //     user._id = new mongoose.Types.ObjectId().toString();
    //     next()
    // }
    if (user.isModified('password')) {
        const saltRounds = 10;
        user.password = await bcrypt.hash(this.password, saltRounds);
        next()
    }
});

userSchema.methods.validatePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.plugin(mongoosePaginate);

const User = mongoose.model('user', userSchema);
export default User;