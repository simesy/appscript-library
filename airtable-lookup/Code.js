

const patAirtable = PropertiesService.getScriptProperties().getProperty('airtable-token');  
const productsEndPoint = 'https://api.airtable.com/v0/appVlR8qys1QCNt3H/tblWQ9zX8cQT2erFM';

function doSomeProcess() {
  const paging = 'pageSize=2';

  let productsLookup = {};
  let results = [];
  let offset = false;
 
  const httpOptions = {
    'method': 'GET',
    'headers': {
      'Authorization': 'Bearer ' + patAirtable,
      'Content-Type': 'application/json',
    }
  }

  // Make the first call.
  let callUrl = productsEndPoint + '?' + paging;
  let response = UrlFetchApp.fetch(callUrl, httpOptions);
  let responseJson = JSON.parse(response.getContentText());
  results = responseJson.records;

  let loadMore = ('offset' in responseJson);
  while (loadMore) {
    offset = 'offset=' + responseJson.offset;
    callUrl = productsEndPoint + '?' + paging + '&' + offset;
    console.log(callUrl);
    response = UrlFetchApp.fetch(callUrl, httpOptions);
    responseJson = JSON.parse(response.getContentText());
    results = results.concat(responseJson.records);

    // Still more?
    loadMore = ('offset' in responseJson);
  }

  console.log(results);

  for (let i = 0; i < results.length; i++) {
    productsLookup[results[i].fields['SKU']] = {
      airTableId: results[i].id,
      ProductName: results[i].fields['ProductName'],
      Category: results[i].fields['Category'],
    }
  }

  console.log(productsLookup);
  console.log(productsLookup.A123.ProductName);

}