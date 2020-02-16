const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');


const storeSchema = new mongoose.Schema({
		name:{
			type:String,
			trim:true,
			required:"Please enter a stroe name !"
		},
		slug:String,
		description:{
			type:String,
			trim:true,
		},
		created:{
			type:String,
			default: Date.now
		},
		location:{
			type:{
				type:String,
				default:'Point'
			},
			coordinates:[{
				type:Number,
				required:'you must supply cordinates!'
			}],
			address:{
				type:String,
				required:'yout must supply an address!'
			}
		},
		tags:[String],
		photo:String,
		author:{
			type:mongoose.Types.ObjectId,
			ref:'User'
		}
},{
	toJSON:{virtuals:true},
	toObject:{virtuals:true}
});

storeSchema.index({
	name:'text',
	description:'text'
})

storeSchema.index({
	location:'2dsphere'
})

storeSchema.pre('save',async function(next){
	if(!this.isModified('name')){
		next();
		return;
	}

	this.slug = slug(this.name);
	
	const slugRegex = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`,'i');
	
	//find with self
	const storeWithSlug = await this.constructor.find({slug:slugRegex})

	if(storeWithSlug.length){
		this.slug = `${this.slug}-${storeWithSlug.length+1}`
	}

	next();
});

storeSchema.statics.getStoreByTagList = function(){
	return this.aggregate([
		{
			$unwind:'$tags'	
		},
		{
			$group:{_id:'$tags',count:{$sum:1}}
		},
		{
			$sort:{
				count:-1
			}
		}
	])
}

storeSchema.statics.getTopStore = function(){

	return this.aggregate([

		{$lookup:{ from:'reviews',localField:'_id',foreignField:'store',as:'reviews' }},
		{$match:{ 'reviews.1':{$exists:true} }},
		{$project:{
			photo:'$$ROOT.photo',
			name:'$$ROOT.name',
			reviews:'$$ROOT.reviews',
			averageRating:{$avg:'$reviews.rating'}
		}},
		{$sort:{averageRating:-1}},
		{$limit:10}

	]);

}

storeSchema.virtual('reviews',{
	ref:'Review',
	localField:'_id',
	foreignField:'store'
})


module.exports = mongoose.model("Store",storeSchema);