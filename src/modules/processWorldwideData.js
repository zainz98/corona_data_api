/**
 * This module is a server side module which is responsible for the worldwide
 * data processing. the main server module (app.js) calls the methods in this
 * module with the user's selection for a country, and processes this input
 * to provide Corona data
 */
const fs = require('fs');
const chalk = require('chalk');
const path = require('path');

const gotWrapper = require("./gotWrapper.js");
const countriesFile = path.join(__dirname, "../data/ISO3166-1.json");

// This variable holds the country codes data as it will be extracted from
// the file ISO3166-1.json. It's better to upload it once, and not on every run
let countryCodes;

// The URL of the worldwide Corona API
const urlWorldWide = "https://corona-api.com/countries/";

/**
 * This method accepts the country, as it was entered by the client, and passed
 * to the server in app.js (as a parameter in the URL's query string),
 * and returns the country code, if it found a match.
 * The match does not have to be exact, it may be partial.
 */
async function getCountryCode(country)
{
    try {
        // Do this step once, if the countryCodes variable is still undefined
        // upload the file content into it. On the next call this step will
        // be skipped.
        if (countryCodes===undefined)
        {
            // TODO - change to promise readFile()
            countryCodes = await JSON.parse(fs.readFileSync(countriesFile))
        }
        // Find the index of the first element in the countries array (as it
        // was extracted from ISO3166-1.json) that matches the user's input
        // for "country"
        // Note we don't care about lower case/upper case (inpout is case 
        // insensitive) and a partial match will also be sufficient. 
        let index = countryCodes.findIndex((item) => item.englishShortName.toLowerCase().includes(country.toLowerCase()));
        if (index > -1)
        {
            // A match was found! return the two letters country code
            return countryCodes[index].alpha2Code;
        }
    } catch(err) {
        return chalk.red.bgWhite("Something went wrong. Cannot process country code. \n") + err;
    }
}

/**
 * Once a country code is found, we can use this function to get Corona data 
 * and return them as a string.
 * Note that we will need to change all "\n" to "<br>" in order for the new 
 * line characters to take effect in the HTML page.
 */
async function getCountryData(country)
{
    // if anything goes wrong and there is no data to retrieve, the try will
    // make sure our app won't crash, and an error message will be returned
    // in the catch() clause.
    try {
        // call the worldwide Corona API URL wit the country code, as it was
        // found by the getCountryCode() function.
        let countryData = await gotWrapper.makeRequest(urlWorldWide+country); 
    
        let latestData = countryData.data.timeline[0];

       return "      Country: " + countryData.data.name+ "\n" +
              "   Population: " + countryData.data.population + "\n" +
              "      Updated: " + latestData.date + "\n" +
              "    Confirmed: " + latestData.confirmed + "\n" + 
              "New Confirmed: " + latestData.new_confirmed + "\n" +
              "  Active sick: " + latestData.active + "\n" +
              "       Deaths: " + latestData.deaths + "\n" +
              "   New Deaths: " + latestData.new_deaths + "\n"
    } catch (err)
    {
        return chalk.red.bgWhite("Something went wrong. Cannot process country data. \n") + err;
    }
}

module.exports = {
    getCountryCode: getCountryCode,
    getCountryData: getCountryData
}