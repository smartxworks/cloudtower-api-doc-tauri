---
title: Introduction to the API reference
sidebar_position: 13
---

import Terminology from '@site/terminology.json'

<>The {Terminology['terminology']['en-US']['PRODUCT']} API is developed based on the OpenAPI v3.0.0 specification and can be called using the <code>curl</code> or any HTTP client. </>

Each API documentation entry consists of the following sections:

- **Request**: Request data.
  - `header parameters`: Parameters required in the request header.
  - `request body schema`: Description of the fields in the request body.
- **Response**: Response data.
  - `200`: Explanation of the data fields returned when the request succeeds.
  - `400`: Explanation of the data fields returned when the request data is invalid.
  - `404`: Returned when the corresponding resource cannot be found.
  - `500`: Returned when an internal service error occurs.

**Note**: Each field description panel is collapsed by default. Click `>` to expand details.

The panel on the right side of the document contains:

- **Try it**: The request panel. Click `Try it` to expand the panel, where you can enter parameters and make API calls directly from the page.
- **Request samples**: The request examples panel. It provides JSON examples and `curl` command samples for calling the API.
- **Response samples**: The response examples panel. It provides example responses returned by the API.