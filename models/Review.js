const mongoose  = require('mongoose');
mongoose.Promise = global.Promise;

const reviewSchema = new  mongoose.Schema({
	created:{
		type:Date,
		default:Date.now
	},
	author:{
		type:mongoose.Types.ObjectId,
		ref:'User',
		required:'You must supply author'
	},
	store:{
		type:mongoose.Types.ObjectId,
		ref:'Store',
		required:'You must supply store'
	},
	text:{
		type:String,
		required:"your required must have text"
	},
	rating:{
		type:Number,
		min:1,
		max:5
	}
});

function autopupulate(next){
	this.populate('author');
	next();
}

reviewSchema.pre('find',autopupulate);
reviewSchema.pre('findOne',autopupulate);

module.exports = mongoose.model('Review',reviewSchema);
