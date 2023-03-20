

 
const cityForm = document.getElementById("israel_country_form");
const cityInput = document.getElementById("israel_country_input");
const israelTitle = document.getElementById("israel_title");
const israelDataBlock = document.getElementById("israel_data_block");


cityForm.addEventListener('submit', (e) => {
  
    e.preventDefault();
  
    fetchData();
})


async function fetchData()
{
    try {
       
        if (!cityInput.value)
        {   
           
            let res = await fetch('http://localhost:3000/israel?city=general'+cityInput.value);
            // fetch() returns an "ok" field in the response indicating if the
            // request was processed successfully.
            if(!res.ok)
            {
                // If something went wrong
                israelDataBlock.innerHTML = "שגיאת התחברות לשרת";
                throw new Error("No result from URL");
            } else {
                // the request has arrived to the server which has processed
                // it successfully. Get the text content from our server
                // case 2 or 3, we don't know
                let data = await res.text();
                israelDataBlock.innerHTML = data;
            }
        } else {
            // Input was provided. it is assumed to be country data. Hence we
            // send it to the server as a parameter in the query of the URL
            let res = await fetch('http://localhost:3000/israel?city='+cityInput.value);
            // fetch() returns an "ok" field in the response indicating if the
            // request was processed successfully.
            if(!res.ok)
            {
                // If something went wrong
                israelDataBlock.innerHTML = "שגיאת התחברות לשרת";
                throw new Error("No result from URL");
            } else {
                // the request has arrived to the server which has processed
                // it successfully. Get the text content from our server
                // case 2 or 3, we don't know
                let data = await res.text();
                israelDataBlock.innerHTML = data;
            }
        }
    // We always want to catch our errors, if the occured along the way.
    } catch (err)
    {
        israelDataBlock.innerHTML = "...משהו לא תקין";
        // any console.log messages in this file go in the client side's
        // console (browser)
        console.log(err);
    }
}

