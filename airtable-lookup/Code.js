// Demonstration code that calls the service.

const patAirtable = PropertiesService.getScriptProperties().getProperty('airtable-token'); 
const base = 'appVlR8qys1QCNt3H';
const table = 'tblWQ9zX8cQT2erFM';

function doSomeProcess() {
  let productsLookup = {};

  const at = new Airtable(patAirtable);
  const results = at.getTableRecords(base, table);

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