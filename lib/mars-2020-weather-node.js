var convert = require('convert-units')
var round10 = require('round10').round10;
var fetch = require("node-fetch");


var Mars2020Weather = function(temperatureUnit, pressureUnit) {
	"use strict";

	this.temperatureUnit = (temperatureUnit !== undefined) ? temperatureUnit : 'C';   // "C" | "F" | "K" | "R"; // Temperature
	this.pressureUnit = (pressureUnit !== undefined) ? pressureUnit : 'Pa';  		//"Pa" | "hPa" | "kPa" | "MPa" | "bar" | "torr" | "psi" | "ksi"; // Pressure

	//console.log(this.temperatureUnit +' '+ this.pressureUnit);

	//check if all input units are valid
	var allTempUnit = convert().from('C').possibilities();
	var allPressureUnit = convert().from('Pa').possibilities();

	if(allTempUnit.indexOf(this.temperatureUnit) === -1){
		throw new Error('Unsupported Temperature unit ' + this.temperatureUnit + ', use one of: ' + allTempUnit.join(', '));
	}

	if(allPressureUnit.indexOf(this.pressureUnit) === -1){
		throw new Error('Unsupported Pressure unit ' + this.pressureUnit + ', use one of: ' + allPressureUnit.join(', '));
	}


	var that = this;

	that.lastRequestTime = 0;
	that.lastRawData = undefined; 
	that.lastRawDataConv = undefined;
	
	var API_CALL_LIMIT = 60 * 60 //limit api call: one hour

	var convertData = function(data) {
		var dataConv = JSON.parse(JSON.stringify(data)); //clone object

		for(var i=0; i<dataConv.sol_keys.length; i++){
			var sol = dataConv.sol_keys[i];
			dataConv[sol] = converSolUnit(dataConv[sol]);
		}

		return dataConv;
	}

	var converSolUnit = function(sol) {
		if(that.temperatureUnit !== 'C') {
			sol.min_temp = round10(convert(sol.min_temp).from('C').to(that.temperatureUnit), -3);
			sol.max_temp = round10(convert(sol.max_temp).from('C').to(that.temperatureUnit), -3);
		}

		if(that.pressureUnit !== 'Pa') {
			sol.pressure = round10(convert(sol.pressure).from('Pa').to(that.pressureUnit), -3);
		}

		return sol;
	}

	var getTimestamp = function() {
		return Math.floor(Date.now() / 1000);
	}

	that.request = function(callback){
		if ((typeof callback) !== "function"){
			throw new Error("The argument must be a function");
		}
		
		//skip api call if limit not exceeded
		var now = getTimestamp();
		if(that.lastRawData != undefined && now < (that.lastRequestTime + API_CALL_LIMIT)) {
			callback.call(that, false, that.lastRawDataConv);
			return;
		}

		var url = "https://mars.nasa.gov/rss/api/?feed=weather&category=mars2020&feedtype=json&ver=1.0";

		fetch(url)
			.then(response => {
				if(response.status !== 200) {
					var err = new Error(response.status);
					err.response = response;
   					throw err;
				}
				return response.json();
			})
			.then(data => {
				const rawData = {
					sol_keys: [],
				}

				data.sols.forEach((item) => { 
					rawData.sol_keys.push(item.sol);
					rawData[item.sol] = item;
				 } )

				that.lastRawData = rawData;
				that.lastRawDataConv = convertData(rawData);
				that.lastRequestTime = getTimestamp();
				callback.call(that, false, that.lastRawDataConv);
			  })
			.catch(err =>{
				//console.log(err);
				console.error("Exception caught in JSON.parse");
				callback.call(that, err, {});
			});

	};

	that.getRawData = function(){
		return that.lastRawData;
	};

	that.getConvertedRawData = function(){
		return that.lastRawDataConv;
	};

	that.getSol = function(sol){
		return that.lastRawDataConv[sol];
	};

	that.getSolKeys = function(){
		return that.lastRawDataConv.sol_keys;
	};

	that.getLatestSolKey = function(){
		return that.lastRawDataConv.sol_keys[that.lastRawDataConv.sol_keys.length-1];
	};

	that.getLatestSol = function(){
		return that.lastRawDataConv[that.getLatestSolKey()];
	};
};

module.exports = Mars2020Weather;
