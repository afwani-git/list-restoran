const mongoose = require('mongoose');
const Review = require('../models/Review');


exports.addReview = async (req,res) => {
	req.body.author = req.user._id;
	req.body.store = req.params.store;
	const newReviews = new Review(req.body);
	await newReviews.save();
	req.flash('success','Reviewd saved !');
	res.redirect('back');
}

