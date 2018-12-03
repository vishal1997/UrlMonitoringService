# Url Monitoring Service

A service to monitor multiple URLs.
Given information (URL, method, data, headers), the server monitors the URL every second. Every second, the server sends a request and record how much time it took to get the complete response.

## REST Specifications
##### POST call:
- Given URL information (URL, method, data, headers), the server returns an ID and starts monitoring the URL at this point.
- The call will be POST /

##### GET call:
- Using the ID, the user can retrieve:
    - The URL information.
    - The last 100 response times of the URL as an array
    - The 50th, 75th, 95th, and 99th percentile of the response times.
    - The call will be GET /<ID>

##### PUT call:
- Using the ID, the user can edit the URL information previously entered so as to continue monitoring using the new URL information.
- The call will be PUT /<ID>

##### DELETE call:
- Using the ID, the user can tell the server to stop monitoring the URL and delete all information for that ID including monitoring data.
- The call will be DELETE /<ID>

##### GET call:
- If an ID is not provided, the user gets a list of all urls being monitored including their ID.
- The call will be GET /

### Diagram
![Screenshot](https://lh3.googleusercontent.com/g9OTSRoW1nLNvJ6N1Nd_ifOqUcF2k884gUiGhUkmWykbz7IwanesTMU4gw2XPLpM9AE7rNonYdFG5A=w1366-h626)

##### Server/Request Handler
- It accepts the user request:
    - If the request is GET/, it fetchs all the url stored in the url collection.
    - If the request is GET/{id}, it fetchs last 100 latency of the given url from urlMonitor collection.
    - If the request is POST/, it generates new url id, adds the url to the url collection and then sends single to UrlMonitoringService to indicate that a new entry is added to the url collection. After getting the single UrlMonitoringServce starts monitoring the new added url. Finally urlId is returned to the user.
    - If the request is PUT/{id}, it updates the entry in the url collection with the new data in the payload and sends single to UrlMonitoringService to start monitoring the updated url.
    - If the request is /DELETE/{id}, it deletes url entry from url and monitorUrl collection, then sends signal to UrlMonitoringSerive to stop monitoring the url.

##### Url Monitoring Service
- When it gets a signal that there is change in url collection. It fetchs the new url list from the url collection and starts monitoring the url by making a https call to the list of url in the url collection.
- Each url is monitored asynchronouly. The time interval between the https request for an url is set to 1 sec i.e, a url is monitored every second.

##### Web Monitor Url
- It makes the https request for the given list of urls and sends the reponse to the log.

##### Parser
- It parse the log file written by the web monitor url and save the parsed result tothe monitorUrl collection. 
- Whenever there is update in the log file the parser starts reading the updated log and saves it to the monitorUrl collection.

##### Log File
- Maintains the responses return by the https call, so that it can be added to the database. The log file is read by the parser and then added to the database.

##### Application log
- It maintains the application log for each date.

##### DB
- url collection: It contains the list of url with the headers, data, method.
- monitorUrl collection: It contains the urlId with the list of latency for each url.

## How to use the application
- Install nodejs
- Install npm
- Move to the project directory
- Run the cammand to install the dependencies
    ```sh
    npm install
    ```
- To run the application 
    ```sh
    node index.js
    ```
- https server listen on port 3001
- htpp server listen on port 3000
- Use postman or any other api testing tool to use the monitoring service.

### Example how to use 
- localhost:3000/
    - Send a POST request
    - In the body write:
        ```sh
        {
    	"url" : "www.yahoo.com",
    	"data" : "Data to be sent",
    	"method": "get"
        }
        ```
    - Duplicate value for url is not accepted
    - It will return an Id, and will start monitoring the url. 
    
- localhost:3000/
    - Send a GET request
    - It will return the list of monitoring url with all its data.
    
- localhost:3000/{id}
    - Send a PUT request
    - In body write:
        ```sh
        {
            "url" : "www.google.com", 
            "data" : "Data to be sent",
            "method": "get"
        }
        ```
    - Duplicate value for url is not accepted
    - It will update the data of the given id and will return the same id.
    
- localhost:3000/{id}
    - Send a GET request
    - It will return:
        - Url Id
        - Url
        - Method
        - Data
        - Headers
        - Latency list
        - 55th, 75th, 95th and 99th percentile of the latency.
        
- localhost:3000/{id}
    - Send a DELETE request
    - It will delete the url details of the given id and return {success: true} if delete is successfull, else it will return {success : false}
