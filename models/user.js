const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
const { string } = require('joi');

const userSchema = new Schema({
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    username:{
        type: String,
        required: true,
        unique: true
    }
})
userSchema.statics.findAndValidate = async function(username, password){
    const foundUser = await this.findOne({username})
    if(foundUser!=null){
        const isValid = await bcrypt.compare(password, foundUser.password)
        return isValid ? foundUser : false;
    }
}

module.exports = mongoose.model('User', userSchema)