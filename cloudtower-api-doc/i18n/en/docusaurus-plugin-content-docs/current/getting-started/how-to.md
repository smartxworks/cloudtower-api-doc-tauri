---
title: How To Use API References
sidebar_position: 13
---
import Terminology from '@site/terminology.json'

<>The {Terminology['en-US']['PRODUCT']} API is developed following the OpenApi Specification v3.0.0., and can be called using cURL or any HTTP client. </>

Currently each interface document includes:
 * Request: Request data
   * header parameters: Request parameters in the header
   * request body schema: Request filed description in body
* Response: Return data
  * 200: Description of data fields returned after a successful request.
  * 400: Description of the returned data field when the requested data is incorrect.
  * 404: A return when no corresponding operation resource can be found.
  * 500: An error within the service

Note: The panel explained by each field is folded by default. Click > to expand the details.

The panel to the right of the document includes:
* Try it: Call panel. Click the Try it button to expand the debugging panel, and you can enter parameters in the panel to call the page.
* Request samples: The calling example panel provides JSON examples and curl example codes of API interface calls.
* Response samples: Return to the example panel, which provides examples returned by the API interface.