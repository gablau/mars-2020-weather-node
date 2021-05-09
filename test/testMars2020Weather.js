/* eslint-disable no-undef */
require("should");
const nock = require('nock');

var Mars2020Weather = require("./../lib/mars-2020-weather-node.js");

describe("Testing Mars 2020 Weather Node:", function () {
	"use strict";

	this.slow(500);
	this.timeout(2000);

	it("Request + getLatestSol", function (done) {

		var marsweather = new Mars2020Weather();

		marsweather.request(function(err, response){
			const latestSol = this.getLatestSol();
			latestSol.should.have.properties(["terrestrial_date", "sol", "ls", "season", "min_temp", "max_temp", "pressure", "sunrise", "sunset"]);
			done();
		});

	});

	
	it("Request + getLatestSolKey", function (done) {

		var marsweather = new Mars2020Weather();

		marsweather.request(function(err, response){
			const latestSolKey = this.getLatestSolKey();
			(parseInt(latestSolKey)).should.be.Number();
			(parseInt(latestSolKey)).should.be.greaterThan(69);
			done();
		});

	});


	it("Request + getSolKeys", function (done) {

		var marsweather = new Mars2020Weather();

		marsweather.request(function(err, response){
			const solKeys = this.getSolKeys();
			solKeys.should.be.Array();
			solKeys.length.should.be.greaterThan(5);
			(parseInt(solKeys[0])).should.be.Number();
			(parseInt(solKeys[0])).should.be.greaterThan(69);
			done();
		});

	});
	

	it("Request + getSol", function (done) {

		var marsweather = new Mars2020Weather();

		marsweather.request(function(err, response){
			const latestSolKey = this.getLatestSolKey();
			const sol = this.getSol(latestSolKey);
			sol.should.have.properties(["terrestrial_date", "sol", "ls", "season", "min_temp", "max_temp", "pressure", "sunrise", "sunset"]);
			done();
		});

	});


	it("Request + getRawData", function (done) {

		var marsweather = new Mars2020Weather();

		marsweather.request(function(err, response){
			const rawData = this.getRawData();
			rawData.should.have.properties(["sol_keys"]);
			rawData.should.have.properties(this.getSolKeys());
			done();
		});

	});


	it("Request + getConvertedRawData", function (done) {

		var marsweather = new Mars2020Weather();

		marsweather.request(function(err, response){
			const rawData = this.getConvertedRawData();
			rawData.should.have.properties(["sol_keys"]);
			rawData.should.have.properties(this.getSolKeys());
			done();
		});

	});
	

	it("Constructor + wrong temperature unit", function (done) {

		should.throws(function () {
			var marsweather = new Mars2020Weather('t');
		}, /Error: Unsupported Temperature unit t, use one of: C, K, F, R/);
		done();
	});

	it("Constructor + wrong pressure unit", function (done) {

		should.throws(function () {
			var marsweather = new Mars2020Weather('C',  't');
		}, /Error: Unsupported Pressure unit t, use one of: Pa, kPa, MPa, hPa, bar, torr, psi, ksi/);
		done();
	});

	

	
	it("Request + different units", function (done) {

		var marsweather = new Mars2020Weather('F', 'bar',);

		marsweather.request(function(err, response){
			const latestSol = this.getLatestSol();
			latestSol.should.have.properties(["terrestrial_date", "sol", "ls", "season", "min_temp", "max_temp", "pressure", "sunrise", "sunset"]);
			done();
		});

	});


	it("Double request", function (done) {

		var marsweather = new Mars2020Weather('F', 'bar', 'km/h');

		marsweather.request(function(err, response){
			const latestSol = this.getLatestSol();
			latestSol.should.have.properties(["terrestrial_date", "sol", "ls", "season", "min_temp", "max_temp", "pressure", "sunrise", "sunset"]);

			marsweather.request(function(err, response){
				const latestSol = this.getLatestSol();
				latestSol.should.have.properties(["terrestrial_date", "sol", "ls", "season", "min_temp", "max_temp", "pressure", "sunrise", "sunset"]);
	
				done();
			});
		});

	});
	

	it("Request - Wrong arg.", function(done){

		var marsweather = new Mars2020Weather();

		should.throws(function () {
			marsweather.request("");
		}, /The argument must be a function/);

		done();	
	});

	it("Request + different raw data", function (done) {

		var marsweather = new Mars2020Weather('F', 'bar', 'km/h');

		marsweather.request(function(err, response){
			const rawData = marsweather.getRawData();
			rawData.should.have.properties(["sol_keys"]);
			rawData.should.have.properties(this.getSolKeys());

			const convRawData = marsweather.getConvertedRawData();
			convRawData.should.have.properties(["sol_keys"]);
			convRawData.should.have.properties(this.getSolKeys());

			(rawData).should.not.be.eql(convRawData);
			done();
		});

	});

	it("Request + equal raw data", function (done) {

		var marsweather = new Mars2020Weather();

		marsweather.request(function(err, response){
			const rawData = marsweather.getRawData();
			rawData.should.have.properties(["sol_keys"]);
			rawData.should.have.properties(this.getSolKeys());

			const convRawData = marsweather.getConvertedRawData();
			convRawData.should.have.properties(["sol_keys"]);
			convRawData.should.have.properties(this.getSolKeys());

			(rawData).should.be.eql(convRawData);
			done();
		});

	});


	it("Request + HTTP error 404", function (done) {

		var marsweather = new Mars2020Weather();

		const scope = nock('https://mars.nasa.gov')
			.get('/rss/api/?feed=weather&category=mars2020&feedtype=json&ver=1.0')
			.reply(404, "NOT FOUND");

		marsweather.request(function(err, response){
			err.should.be.an.Object().and.not.be.empty();
			err.should.have.properties(["response", "message"]);
			err.name.should.be.eql('Error');
			err.message.should.be.eql('404');
			err.response.status.should.be.eql(404);
			response.should.be.an.Object().and.be.empty();
			done();
		});

	});

	it("Request + HTTP error data is not json", function (done) {

		var marsweather = new Mars2020Weather();

		const scope = nock('https://mars.nasa.gov')
			.get('/rss/api/?feed=weather&category=mars2020&feedtype=json&ver=1.0')
			.reply(200, "wrong data");

		marsweather.request(function(err, response){
			err.should.be.an.Object().and.not.be.empty();
			err.should.have.properties(["type", "name"]);
			err.name.should.be.eql('FetchError');
			err.type.should.be.eql('invalid-json');
  		response.should.be.an.Object().and.be.empty();
			done();
		});

	});

});