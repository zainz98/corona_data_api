/**
 * This module is a server side module which is responsible for Israel's
 * data processing. the main server module (app.js) calls the methods in this
 * module with the user's selection for a city in Israel, or for general data.
 * and processes this input to provide Corona data
 */

const chalk = require('chalk');
const gotWrapper = require("./gotWrapper.js");

// URLs for Corona Data (for each city or general Israel's data)
const urlDataPerCityIsrael = "https://datadashboardapi.health.gov.il/api/queries/spotlightPublic"
const urlGeneralInfected = "https://datadashboardapi.health.gov.il/api/queries/infectedPerDate"
const urlGeneralVaccinated = "https://datadashboardapi.health.gov.il/api/queries/vaccinated"

// As the data only updates on a daily basis (and not sooner) it is better 
// to save the data in variebles and to mae sure they are updated only once
// a day or a few times a day, and not on every call (this is not done here)
let dataPerCity;
let dataGeneralInfected;
let dataGeneralInfectedYesterday;
let dataGeneralVaccinated;

/**
 * This method accepts the city in Hebrew, as it is entered by the client,
 * and then passed to the server in app.js (as a parameter in the URL's query
 * string) and returns the city element in the list of cities array from the 
 * Corona API, if it found a match.
 */

async function findCity(city)
{
    try {
        // If the array is empty it means the Corona data was not loaded yet,
        // so load it. A better way would be to make sure some time has passed
        // (for example, 4 hours) since the last update and to refresh the data
        if (dataPerCity === undefined)
            await loadCityData();
        // Check if an element in the array exists for such a city
        let index = dataPerCity.findIndex((item) => item.name == city);
        if (index > -1)
        {
            // the city was found, return the element from the array
            return dataPerCity[index];
        }
    
    } catch (err)
    {
        console.error(chalk.red.bgWhite('HTTP Request to MOH has failed. ' + err));
    }
    
}

/**
 * This method is responsible for getting the Corona data for all cities and
 * store it in an array.
 * Unlike the worldwide Corona API, where we passed the country code as a
 * parameter and got only the the data for the country that we look for,
 * the API in Israel returns an array of ALL cities.
 * So each response is very long and identical to the previous one (if it was)
 * called shortly later.
 */
async function loadCityData()
{
    try {
        dataPerCity = await gotWrapper.makeRequest(urlDataPerCityIsrael);
        if (dataPerCity.length === 0)
        {
            throw new Error("HTTP request has returned no results\nURL: " + urlDataPerCityIsrael);
        }
    } catch (err)
    {
        console.log(chalk.red.bgWhite("Something went wrong.\n") + err);
    }
}

/**
 * THis method is responsible for loading the general Corona data (not city 
 * specific) into different variables.
 * Note that the General information is extracted from different URLs.
 * 
 * For each URL, get the data from the API only if the variable is undefined.
 * if it was already loaded, this step will be skipped.
 * A better way would be to make sure some time has passed (for 
 * example, 4 hours) since the last update and to refresh the data
 */
async function loadGeneralData()
{
    try{
        // load information about newly infection cases
        // for today
        // and for yesterday 
        if (dataGeneralInfected === undefined)
        {
            let dataGeneralInfectedAll = await gotWrapper.makeRequest(urlGeneralInfected);
            if (dataGeneralInfectedAll.length === 0)
            {
                throw new Error("HTTP request has returned no results\nURL: " + urlGeneralInfected);
            } else {
                dataGeneralInfected = dataGeneralInfectedAll[dataGeneralInfectedAll.length-1];
                dataGeneralInfectedYesterday = dataGeneralInfectedAll[dataGeneralInfectedAll.length-2];
            }
        }

        // load information about vaccinations
        if (dataGeneralVaccinated === undefined)
        {
            dataGeneralVaccinatedAll = await gotWrapper.makeRequest(urlGeneralVaccinated);
            if (dataGeneralVaccinatedAll.length === 0)
            {
                throw new Error("HTTP request has returned no results\nURL: " + urlGeneralVaccinated);
            } else {
                dataGeneralVaccinated = dataGeneralVaccinatedAll[dataGeneralVaccinatedAll.length-1];
            }
        }
    } catch (err)
    {
        console.log(chalk.red.bgWhite("Something went wrong.\n") + err);
    }
}

/** 
 * Print the General information, as it was extracted from the Corona API in
 * the method above. Note that all "\n" will have to be replaced with "<br>"
 * in order to see the new line charcters in HTML
 */
async function getIsraelGeneralData()
{
    await loadGeneralData();
    try {
       return "                   Date: " + dataGeneralInfected.date+ "\n" +
              "              Confirmed: " + dataGeneralInfected.sum + "\n" +
              "               New Sick: " + dataGeneralInfected.amount + "\n" +
              "   New Sick (yesterday): " + dataGeneralInfectedYesterday.amount + "\n" +
              "       Total Vaccinated: " + dataGeneralVaccinated.vaccinated_cum + "\n" +
              "Vaccinated Population %: " + dataGeneralVaccinated.vaccinated_population_perc + "\n" +
              "   Total Vaccinated 2nd: " + dataGeneralVaccinated.vaccinated_seconde_dose_cum + "\n" + 
              "   Total Vaccinated 2nd: " + dataGeneralVaccinated.vaccinated_third_dose_cum + "\n";
    } catch (err)
    {
        return chalk.red.bgWhite("Something went wrong. Cannot process Israel General data. \n") + err;
    }
}

/** 
 * Print the city information, as it was extracted from list of city data,
 * according to the user's inp[ut in the HTML page.
 * Note that all "\n" will have to be replaced with "<br>"
 * in order to see the new line charcters in HTML
 */

function getIsraelCityData(cityData)
{
    try {
 
       return "               City: " + reverse(cityData.name)+ "\n" +
              "        Active sick: " + cityData.activeSick + "\n" +
              "              Color: " + reverse(cityData.color) + "\n" +
              "       1st Dose (%): " + cityData.firstDose + "\n" +
              "       2nd Dose (%): " + cityData.secondDose + "\n" +
              "       3rd Dose (%): " + cityData.thirdDose + "\n";
    } catch (err)
    {
        return chalk.red.bgWhite("Something went wrong. Cannot process Israel city data. \n") + err;
    }
}

// This is a helper function that is used to reverse letters orders for Hebrew
// characters.
// Steps:
// 1. split the String to array of characters
// 2. reverse the orders of the elements of the array
// 3. join them together back to a string (with no separators)
function reverse(s){
    return s.split("").reverse().join("");
}



module.exports = {
    findCity: findCity,
    getIsraelGeneralData: getIsraelGeneralData,
    getIsraelCityData: getIsraelCityData
}