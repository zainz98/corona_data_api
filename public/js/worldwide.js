/**
 * This file contains the client side code that will be included by the HTML 
 * code (worldwide.ejs).
 * This file is responsible for passing the user input for country (as typed
 * in the web pages) to the server side (app.js) as a request with the country
 * parameter in the URL. After the server side will  extract the Corona Data
 * it will send back a response (to the client) with the information (or a
 * message that indicates if the information was not found)
 */

// These variables hold the DOM elements from the HTML file.
// We will need to access, use or change the HTML content.
// All variables are extracted using the "id" attribute that was defined for
// them in the HTML content 
const countryForm = document.getElementById("worldwide_country_form");
const countryInput = document.getElementById("worldwide_country_input");
const worldTitle = document.getElementById("world_title");
const worldwideDataBlock = document.getElementById("worldwide_data_block");

// This line defines the action to be done when pressing the send button of the
// form (this action is defined as 'submit')
countryForm.addEventListener('submit', (e) => {
    // this line prevents page refresh upon submit, which is the default behavior
    e.preventDefault();
    // As soon as the button is pressed we want to start retrieving the data
    // from the server.
    fetchData();
})

// This method sends a request to the server side.
// the client expects the Corona input as a text 
async function fetchData()
{
    try {
        // case 1
        // user submitted the form with no input
        if (!countryInput.value)
        {   
            // Change HTML page to provide message about required input.
            worldwideDataBlock.innerHTML = "יש להזין ערך"
        } else {
            // Input was provided. it is assumed to be country data. Hence we
            // send it to the server as a parameter in the query of the URL
            let res = await fetch('http://localhost:3000/worldwide?country='+countryInput.value);
            // fetch() returns an "ok" field in the response indicating if the
            // request was processed successfully.
            if(!res.ok)
            {
                // If something went wrong
                worldwideDataBlock.innerHTML = "שגיאת התחברות לשרת";
                throw new Error("No result from URL");
            } else {
                // the request has arrived to the server which has processed
                // it successfully. Get the text content from our server
                // case 2 or 3, we don't know
                let data = await res.text();
                worldwideDataBlock.innerHTML = data;
            }
        }
    // We always want to catch our errors, if the occured along the way.
    } catch (err)
    {
        worldwideDataBlock.innerHTML = "...משהו לא תקין";
        // any console.log messages in this file go in the client side's
        // console (browser)
        console.log(err);
    }
}

