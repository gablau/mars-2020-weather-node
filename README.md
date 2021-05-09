# A simple NodeJS interface to [NASA Mars 2020 Mission weather API](https://mars.nasa.gov/mars2020/weather/).


## Installation

Using [npm](https://www.npmjs.com/):

    $ npm install --save mars-2020-weather-node

If you don't have or don't want to use npm:

    $ cd ~/.node_modules
    $ git clone git://github.com/gab.lau/mars-2020-weather-node.git

---

## Documentation

### Constructor
```javascript
Mars2020Weather(temperatureUnit, pressureUnit, windSpeedUnit)
```

### Methods

```javascript
request(callback)
```
Make the call to the API to take the data, the call is cached and reused for all other methods, there is an hour limit between two API calls to not overload the service.
Requires a parameter for a `callback` function, see examples



```javascript
getRawData()
```
Returns raw API result without units conversion

```javascript
getConvertedRawData()
```
Returns raw API result with units conversion

```javascript
getSolKeys()
```
Returns all sol keys available

```javascript
getLatestSolKey()
```
Returns latest sol key available

```javascript
getSol(sol_key)
```
Returns sol by `sol_key`

```javascript
getLatestSol()
```
Returns latest sol


### Units of measurement
  Default units: 'C', 'Pa'

	Temperature: 'C', 'F', 'K', 'R'
	Pressure: 'Pa', 'hPa', 'kPa', 'MPa', 'bar', 'torr', 'psi', 'ksi'

---
## Usage

Example use:
```javascript
var Mars2020Weather = require('mars-2020-weather-node');
var marsweather = new Mars2020Weather();

marsweather.request(function(err, response){
    console.log ("Sol: ", this.getLatestSol().sol);
    console.log ("Date: ", this.getLatestSol().terrestrial_date);
    console.log ("Min Temperature ", this.getLatestSol().min_temp);
    console.log ("Max Temperature ", this.getLatestSol().max_temp);
    console.log ("Pressure ", this.getLatestSol().pressure);
});
```

Example use with different units of measurement:
```javascript
var Mars2020Weather = require('mars-2020-weather-node');
var marsweather = new Mars2020Weather('F', 'bar');

marsweather.request(function(err, response){
    console.log ("Sol: ", this.getLatestSol().sol);
    console.log ("Date: ", this.getLatestSol().terrestrial_date);
    console.log ("Min Temperature ", this.getLatestSol().min_temp);
    console.log ("Max Temperature ", this.getLatestSol().max_temp);
    console.log ("Pressure ", this.getLatestSol().pressure);
});
```

Example single sol structure:
```json
  {
    "terrestrial_date": "2021-05-07",
    "sol": "76",
    "ls": "42",
    "season": "mid spring",
    "min_temp": -80.1,
    "max_temp": -22.2,
    "pressure": 752.8,
    "sunrise": "05:47:57",
    "sunset": "18:33:52"
  }, 

```

## Running Unit Tests and Code coverage

Then simply run test this command: ```npm run test```

For code coverage run this command: ```npm run coverage```

---
## Credits

All data provided by: NASA/JPL-Caltech/

## License

[MIT](LICENSE) © Gabriele Lauricella
