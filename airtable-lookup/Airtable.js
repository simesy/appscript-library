class Airtable {

  /**
   * @param apiKey
   *   An Airtable personal access token (begins `pat...`)
   */
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  /**
   * Get all the records from an Airtable table.
   * 
   * This method is what we expect someone using the class to call.
   * 
   * @param base
   *   Airtable Base ID, you can find this on the URL `app...`
   * @param table
   *   Airtable Table ID, you can find this on the URL `tbl...`
   */
  getTableRecords(base, table) {
    const endPoint = `https://api.airtable.com/v0/${base}/${table}`;
    const results = this._fetchAllResults(endPoint);
    return results;
  }

  /**
   * Internal method that pages over Airtable results and optionally caches them.
   * 
   * @param endPoint
   *   A fully qualified Airtable endpoint for a table.
   * @param cacheSeconds
   *   Seconds to cache. Defaults to 24+ hours. Pass 0 for no caching.
   */
  _fetchAllResults(endPoint, cacheSeconds = 100000) {
    const cache = CacheService.getScriptCache();

    // Early return if something in the cache.
    if (cacheSeconds > 0) {
      const fromCache = cache.get(endPoint);
      if (fromCache !== null) {
        console.log('Loaded from the cache');
        return JSON.parse(fromCache);
      }
    }

    const paging = 'pageSize=100';
    let results = [];
    let offset = false;  
    let callUrl = endPoint + '?' + paging;

    // Initial call.
    let responseJson = this._fetchResponse(callUrl);
    results = responseJson.records;

    let loadMore = ('offset' in responseJson);
    while (loadMore) {
      // Keep calling until we get all the records.
      offset = 'offset=' + responseJson.offset;
      callUrl = endPoint + '?' + paging + '&' + offset;
      responseJson = this._fetchResponse(endPoint);
      results = results.concat(responseJson.records);
      loadMore = ('offset' in responseJson);
    }

    // Cache this result if required.
    if (cacheSeconds > 0) {
      let toCache = JSON.stringify(results);
      if (toCache.length > 100000) {
        console.log('Too much data (' + toCache.length + ') to cache for ' + endPoint);        
      }
      else {
        console.log('Successfully cached ' + toCache.length + ' bytes for ' + endPoint);
        cache.put(endPoint, toCache, cacheSeconds);
      }
    } 
    return results;
  }

  /**
   * A simple call to the Airtable endpoint.
   * 
   * @param endPoint
   *   A full endpoint URL.
   */
  _fetchResponse(endPoint) {
    const httpOptions = {
      'method': 'GET',
      'headers': {
        'Authorization': 'Bearer ' + this.apiKey,
        'Content-Type': 'application/json',
      }
    }
    const response = UrlFetchApp.fetch(endPoint, httpOptions);
    const responseJson = JSON.parse(response.getContentText());
    return responseJson;    
  }
  
}