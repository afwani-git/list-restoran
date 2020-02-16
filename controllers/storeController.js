const Store = require('../models/Store');
const User = require('../models/User');
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');

const multerOptions = {
	storage:multer.memoryStorage(),
	fileFilter(req,file,next){
		const mimeType = file.mimetype.startsWith('image/');
		if(	mimeType){
			next(null,true)
		}else{
			next({message:'that filetype isn\'t allowed!!'},false);
		}
	},
}

exports.upload = multer(multerOptions).single('photo');

exports.resize = async (req, res, next) => {
  // check if there is no new file to resize
  if (!req.file) {
    next(); // skip to the next middleware
    return;
  }
  const photo = await jimp.read(req.file.buffer);
  const extension = req.file.mimetype.split("/")[1];
  req.body.photo = `${uuid.v4()}.${extension}`;
	await photo.resize(800,jimp.AUTO);
	await photo.write(`./public/uploads/${req.body.photo}`);
	next();
};


exports.homePage =  (req,res) => {
	res.render('index');
}


exports.addStore = (req,res) => {
		res.render('editStore',{
			title:"💩 ADD STORE"
		});	
}


exports.createStore = async (req,res) => {
	req.body.author = req.user._id;
	const store = await (new Store(req.body)).save();
	req.flash("success",`Successfully created ${store.name},Care to leave to review?`);
	res.redirect(`/store/${store.slug}`);
}


const confirmUser =  (store,user) => {
	if(!store.author._id.equals(user._id)){
		throw Error("You  must own a store in order to edit it");
	}
} 

exports.getStore = async (req,res) => {
	
	const page = req.params.page || 1;
	const limit = 4;
	const skip = (page*limit) - limit;

	const storesPromise = Store.find()
														.skip(skip)
														.limit(limit)
														.sort({created:'decs'});

	const countPromise = Store.count();

	const [stores,count] = await Promise.all([storesPromise,countPromise]);
	const pages = Math.ceil(count/limit);

	if(!stores.length && skip){
		res.redirect(`/stores/page/${pages}`);
		return;
	}

	res.render('stores',{title:'Stores',stores,page,pages,count});
}

exports.deleteStore = async (req,res) => {
	const id = req.params.id;
	const store = await Store.findOne({_id:id});
	confirmUser(store,req.user);
	res.render('editStore',{data:store,action:"edit"});
}

exports.updateStore = async (req, res) => {
  // set the location data to be a point
  req.body.location.type = 'Point';
  // find and update the store
  const store = await Store.findOneAndUpdate({ _id: req.params.id }, req.body, {
    new: true, // return the new store instead of the old one
    runValidators: true
  }).exec();
  req.flash('success', `Successfully updated <strong>${store.name}</strong>. <a href="/stores/${store.slug}">View Store →</a>`);
  res.redirect(`/stores/${store._id}/edit`);
  // Redriect them the store and tell them it worked
};


exports.getStoreBySlug = async (req,res) => {
	const store = await Store.findOne({slug:req.params.slug}).populate('author reviews');
	if(!store) return next();
	res.render('store',{store,title:store.name}); 
}

exports.getStoreByTag = async (req,res) => {
	const tagParam = req.params.tag;
	const tagsPromise = Store.getStoreByTagList();

	const tagsQuery = tagParam || { $exists:true };
	const storesPromise = Store.find({tags:tagsQuery});

	const [tags,stores] = await Promise.all([tagsPromise,storesPromise]);

	// res.json(result);
	res.render('tags',{ tags,stores,title:tagParam });
}

exports.searchStores = async (req,res) => {
	const store = await Store.find(
		{$text:{$search:req.query.q}},
		{score:{$meta:"textScore"}}
	)
	.sort({score:{$meta:"textScore"}})
	.limit(5);
	
	res.json(store)
}

exports.mapStore = async (req,res) => {
	const coordinates = [req.query.lng,req.query.lat].map(parseFloat);
		
	const q = {
		location:{
			$near:{
				$geometry:{
					type:'Point',
					coordinates
				},
				$maxDistance:1000//1km
			}
		}
	}


	const  stores = await Store.find(q).select('slug name photo discription location');
	res.json(stores);
}

exports.mapPage = async (req,res) => {
	res.render('map');
}

exports.heartStore = async (req,res) => {
	const hearts = req.user.hearts.map(obj => obj.toString());
	const operator = hearts.includes(req.params.id) ? '$pull' : '$addToSet';
	const user = await User.findByIdAndUpdate(req.user._id,
	{
		[operator]:{hearts:req.params.id}
	},
	{
		new:true
	});

	res.json(user);
}

exports.getHeart = async (req,res) => {
	const stores = await Store.find({
		_id:{$in:req.user.hearts}
	});

	res.render('stores',{title:'Heart stores',stores})
} 

exports.getTopStore = async (req,res) => {

	const stores = await Store.getTopStore();

	res.render('topStores',{stores,title:"Top Score ⭐"});

}