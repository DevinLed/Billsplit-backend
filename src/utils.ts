export function add(a: number, b: number) {
    return a + b;
}

/**
 * Things to do:
 * - Handle the contact creation/retrieval system
 *   - Check cogn (Y)
 *   - Check dynamo (Y)
 *   - etc
 * - Write a simple http/response utlity file
 *   - Responses.ok(data)
 *     - Returns the proper headers, statuscode, format data, etc
 *   - Enums for specific constants
 *     - HttpMethods.GET, HttpMethods.DELETE
 * - Write a generic handler 'framework' class (see http/handler.ts)
 *   - Meant to reduce copy/paste of common handler things
 *     - Logging
 *     - Default headers
 *     - Routing
 *     - Error handling
 * 
 * - Transaction Items
 *      - Summing up value of items in map for personReceiptAmount (done in front end, need to add section for totals)
 */