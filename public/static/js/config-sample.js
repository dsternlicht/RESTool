// A dynamic config sample
export default {
  "name": "RESTool App",
  "favicon": "https://www.commoninja.com/public/favicon.ico",
  "baseUrl": "https://restool-sample-app.herokuapp.com/api",
  "pages": [
    {
      "name": "Cast & Characters",
      "id": "characters",
      "description": "Manage GOT characters location and budget.",
      "methods": {
        "getAll": {
          "label": "Get All",
          "dataPath": "items",
          "url": "/character",
          "queryParams": [
            {
              "name": "search",
              "value": "",
              "label": "Search",
              "type": "text"
            }
          ],
          "display": {
            "type": "cards"
          },
          "fields": [
            {
              "name": "thumbnail",
              "type": "image",
              "label": "Thumbnail"
            },
            {
              "name": "id",
              "type": "text",
              "label": "ID"
            },
            {
              "name": "name",
              "type": "text",
              "label": "Name"
            },
            {
              "name": "realName",
              "type": "text",
              "label": "Real Name"
            },
            {
              "name": "location",
              "type": "text",
              "label": "Current Location"
            },
            {
              "name": "isAlive",
              "type": "boolean",
              "label": "Alive?"
            }
          ]
        },
        "getSingle": {
          "url": "/character/:id",
          "queryParams": [],
          "requestHeaders": {}
        },
        "put": {
          "url": "/character/:id",
          "fields": [
            {
              "name": "numberTest",
              "label": "Number Test",
              "type": "number"
            },
            {
              "name": "location",
              "label": "Location",
              "type": "select",
              "options": ["Kings Landing", "Beyond the Wall", "Winterfell"]
            },
            {
              "name": "isAlive",
              "label": "Alive?",
              "type": "boolean"
            }
          ]
        },
        "post": {
          "url": "/character",
          "fields": [
            {
              "name": "thumbnail",
              "label": "Thumbnail",
              "type": "text"
            },
            {
              "name": "name",
              "label": "Name",
              "type": "text"
            },
            {
              "name": "realName",
              "label": "Real Name",
              "type": "text"
            },
            {
              "name": "location",
              "label": "Location",
              "type": "select",
              "options": ["Kings Landing", "Beyond the Wall", "Winterfell"]
            },
            {
              "name": "isAlive",
              "label": "Alive?",
              "type": "boolean"
            }
          ]
        },
        "delete": {
          "url": "/character/:id"
        }
      },
      "customActions": [{
          "name":"Send Email",
          "url": "/character/:id/sendEmail",
          "actualMethod": "post",
          "icon": "envelope",
          "fields": [
            {
              "name": "id",
              "type": "text",
              "label": "ID",
              "readonly": true
            },
            {
              "name": "title",
              "type": "text",
              "label": "Email Title",
              "required": true
            },
            {
              "name": "body",
              "type": "text",
              "label": "Email Body",
              "required": true
            }
          ]
        },
        {
          "name":"Disable Character",
          "url": "/character/:id/disable",
          "actualMethod": "post",
          "icon": "ban",
          "fields": [
            {
              "name": "id",
              "type": "text",
              "label": "Contact ID",
              "readonly": true
            }
          ]
        }
      ]
    },
    {
      "name": "Employees",
      "id": "employees",
      "description": "Manage GOT employees, people and employees.",
      "methods": {
        "getAll": {
          "label": "Get All",
          "dataPath": "items",
          "url": "/employee",
          "queryParams": [
            {
              "name": "search",
              "value": "",
              "label": "Search",
              "type": "text"
            }
          ],
          "display": {
            "type": "table"
          },
          "fields": [
            {
              "name": "id",
              "type": "text",
              "label": "ID"
            },
            {
              "name": "name",
              "type": "text",
              "label": "Name"
            },
            {
              "name": "jobTitle",
              "type": "text",
              "label": "Job Title"
            },
            {
              "name": "isFired",
              "type": "boolean",
              "label": "Fired?"
            }
          ]
        },
        "getSingle": {
          "url": "/employee/:id",
          "queryParams": [],
          "requestHeaders": {}
        },
        "put": {
          "url": "/employee/:id",
          "fields": [
            {
              "name": "name",
              "label": "Name",
              "type": "text"
            },
            {
              "name": "jobTitle",
              "type": "select",
              "label": "Job Title",
              "options": ["Executive Producer", "Co-Executive Producer", "RESTool creator 😎", "A Knows nothing dude."]
            },
            {
              "name": "isFired",
              "type": "boolean",
              "label": "Fired?"
            }
          ]
        },
        "post": {
          "url": "/employee",
          "fields": [
            {
              "name": "name",
              "label": "Name",
              "type": "text"
            },
            {
              "name": "jobTitle",
              "type": "select",
              "label": "Job Title",
              "options": ["Executive Producer", "Co-Executive Producer", "RESTool creator 😎", "A Knows nothing dude."]
            },
            {
              "name": "isFired",
              "type": "boolean",
              "label": "Fired?"
            }
          ]
        },
        "delete": {
          "url": "/employee/:id"
        }
      }
    },
    {
      "name": "Deads",
      "id": "deads",
      "description": "Manage GOT deads 😵",
      "methods": {
        "getAll": {
          "label": "Get All",
          "dataPath": "items",
          "url": "/dead",
          "queryParams": [
            {
              "name": "search",
              "value": "",
              "label": "Search",
              "type": "text"
            }
          ],
          "display": {
            "type": "table"
          },
          "fields": [
            {
              "name": "id",
              "type": "text",
              "label": "ID"
            },
            {
              "name": "name",
              "type": "text",
              "label": "Name"
            },
            {
              "name": "reason",
              "type": "text",
              "label": "Death Reason"
            }
          ],
          "dataTransform": item => Object.assign(item, { wiki: `https://en.wikipedia.org/wiki/${item.name}` })
        },
        "getSingle": {
          "url": "/dead/:id",
          "queryParams": [],
          "requestHeaders": {}
        },
        "put": {
          "url": "/dead/:id",
          "fields": [
            {
              "name": "name",
              "label": "Name",
              "type": "text"
            },
            {
              "name": "reason",
              "label": "Reason",
              "type": "text"
            }
          ]
        },
        "post": {
          "url": "/dead",
          "fields": [
            {
              "name": "name",
              "label": "Name",
              "type": "text"
            },
            {
              "name": "reason",
              "label": "Reason",
              "type": "text"
            }
          ]
        },
        "delete": {
          "url": "/dead/:id"
        }
      }
    },
    {
      "name": "Extras",
      "id": "extras",
      "description": "Manage GOT extras location and budget.",
      "methods": {
        "getAll": {
          "label": "Get All",
          "dataPath": "items",
          "url": "/extra",
          "queryParams": [
            {
              "name": "search",
              "value": "",
              "label": "Search",
              "type": "text"
            }
          ],
          "display": {
            "type": "table"
          },
          "fields": [
            {
              "name": "id",
              "type": "text",
              "label": "ID"
            },
            {
              "name": "name",
              "type": "text",
              "label": "Name"
            }
          ]
        },
        "getSingle": {
          "url": "/extra/:id",
          "queryParams": [],
          "requestHeaders": {}
        },
        "put": {
          "url": "/extra/:id",
          "fields": [
            {
              "name": "name",
              "label": "Name",
              "type": "text"
            }
          ]
        },
        "post": {
          "url": "/extra",
          "fields": [
            {
              "name": "name",
              "label": "Name",
              "type": "text"
            }
          ]
        },
        "delete": {
          "url": "/extra/:id"
        }
      }
    }
  ]
}

