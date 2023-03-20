/**
 * This app starts a server and listens on port 3000 for connections and
 * determines how to response, depending on the URL and the parameters passed
 * in the query
 */
const express = require('express')
const path = require('path');

// Integrate corona app code (almost) exactly as it was used in the corona app.
// note that as this is a server side code it is not going to be in the public folder
const processWorldwideData = require(path.join(__dirname, "./modules/processWorldWideData.js"));
const processIsraelData = require(path.join(__dirname, "./modules/processIsraelData.js"));
// create an express application. this function is the top level function exported by the express module
const app = express()
const port = 3003

// Serve the publuc folder
const publicPath = path.join(__dirname, "../public")
app.use(express.static(publicPath));

// Tells express that it should serve ejs templates (dynamic)
app.set('view engine', 'ejs');

// Define the directory that will be used for the templates.
const templatesPath = path.join(__dirname, "../views");
app.set("views", templatesPath);

/*
  Express's get function (app.get()) is a middleware function used for get
  reuqests, which routes HTTP get requests to the specified path (In the case
  below it is the root path) with the specified callback function.
*/
app.get('', (req, res) => {
  res.render('index')
})

// Server side middleware to serve get request for Worldwide data.
// This method communicates with the client side:
// if the URL is entered with /worldwide extention (with no parameters) it will
// return the page design (from ejs template).
// If the user will type input in the HTML page, and click submit, the GET
// request will be sent, but this time with a country parameter
app.get('/worldwide', async (req, res) => {
    if(!req.query.country)
    {
      // case 0
      // page is accessed from the browser with no 'country' parameter. 
      // render worldwide.ejs page
      res.render('worldwide');
    } else {
      // if we got here it means there is a country parameter

      // case 2+3+4
      // case 1 is empty submit, and is not handled by the server (handled in
      // client side)

      // the call to this function will return the country code (two letters,
      // like IL for Israel, or IT for Italy), which is needed in order to get
      // the Corona data from the COrona Server. 
      let countryCode = await processWorldwideData.getCountryCode(req.query.country)

      // console.log(countryCode);

      if (!countryCode)
      {
        // case 2 - code not found
        // The server will send the client a response with the message below.
        res.send("לא נמצאו תוצאות");
      } else {
        // case 3 - code found, get COrona Data for the country, and send it 
        // through a response.
        res.send(await processWorldwideData.getCountryData(countryCode));
      }
    }
  })
  
  // TODO - this part has to be implemented for your homework
  app.get('/israel', (req, res) => {
    if(!req.query.city)
    {
      // case 0
      // page is accessed from the browser with no 'country' parameter. 
      // render worldwide.ejs page
      res.render('israel');
    } else {
      // if we got here it means there is a country parameter
if(req.query.city=='general'){
  res.send(await processIsraelData.getIsraelGeneralData())
}else{
      // case 2+3+4
      // case 1 is empty submit, and is not handled by the server (handled in
      // client side)

      // the call to this function will return the country code (two letters,
      // like IL for Israel, or IT for Italy), which is needed in order to get
      // the Corona data from the COrona Server. 
      let cityData = await processIsraelData.findCity(req.query.city)

      // console.log(countryCode);

      if (!cityData)
      {
        // case 2 - code not found
        // The server will send the client a response with the message below.
        res.send("לא נמצאו תוצאות");
      } else {
        // case 3 - code found, get COrona Data for the country, and send it 
        // through a response.
        res.send(await processIsraelData.getIsraelCityData(cityData));
      }
    }
  }
  })

  // Any request to our server which is not one of the following will return a 
  // "page not found":
  // http://localhost:3000
  // http://localhost:3000/worldwide*
  // http://localhost:3000/israel*
  app.get('*', (req, res) => {
    res.render("page_not_found")
  })
  
// Start the server on the specified port.
  app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})