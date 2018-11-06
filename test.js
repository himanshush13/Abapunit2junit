const xsltProcessor = require('xslt-processor');
 
const fs = require("fs");
const request = require("request");
const path = require("path");
const sapUserName = process.env.SAP_USERNAME;
const sapPassword = process.env.SAP_PASSWORD;
const sapHost = process.env.SAP_HOST;
const sapProtocol = process.env.SAP_PROTOCOL;
const host = sapProtocol +'://'+sapHost
// Read xsl
const xsltData = fs.readFileSync(path.resolve(__dirname, "./aunit2junit.xsl"));
const xslt = xsltProcessor.xmlParse(xsltData.toString()); // xsltString: string of xslt file contents

// Get csrf-token
var optionsGetCSRFToken = {
    method: "GET",
    url: host+'/sap/bc/adt/abapunit/testruns',
    auth : {
        user: sapUserName,
        password: sapPassword
    },
    headers: {
        'X-CSRF-Token': 'fetch'
    }
  };
  
  
  console.debug(JSON.stringify(optionsGetCSRFToken));
  request(optionsGetCSRFToken, callbackGetCXRFToken);



// Read xml
//var xmlData = fs.readFileSync(path.resolve(__dirname, "./example_input.xml"));

//const xml = xsltProcessor.xmlParse(xmlData.toString()); // xmlString: string of xml file contents
//const xslt = xsltProcessor.xmlParse(xsltData.toString()); // xsltString: string of xslt file contents
//const outXmlString = xsltProcessor.xsltProcess(xml, xslt); // outXmlString: output xml string.
//console.log(outXmlString);


function callbackGetCXRFToken(error, response, body) {
    if (!error && response.statusCode == 405 ) {
        runAbapUnitTest(response.headers['x-csrf-token']);
    } else {
        console.error(response.statusCode );
        console.error(body);
    }
}

function runAbapUnitTest(xCSRFToken) {
    var optionsRunUnitTest = {
        method: 'POST',
        url: host+'/sap/bc/adt/abapunit/testruns',
        auth : {
            user: sapUserName,
            password: sapPassword
        },
        headers: {
            'X-CSRF-Token': xCSRFToken,
        },
        /*multipart: {
            chunked: false,
            data: [
              {
                'content-type': 'text/xml',
                body: '<?xml version="1.0" encoding="UTF-8"?><aunit:runConfiguration xmlns:aunit="http://www.sap.com/adt/aunit"><external><coverage active="false"></coverage></external><adtcore:objectSets xmlns:adtcore="http://www.sap.com/adt/core"><objectSet kind="inclusive"><adtcore:objectReferences><adtcore:objectReference adtcore:uri="/sap/bc/adt/oo/classes/zcl_zd_age_rule_dagar"/></adtcore:objectReferences></objectSet></adtcore:objectSets></aunit:runConfiguration>'
              }
            ]
          }*/
    };
    console.debug(JSON.stringify(optionsRunUnitTest));
    request(optionsRunUnitTest, callbackRunUnitTest)
  }

  function callbackRunUnitTest(error, response, body) {
    if (!error & response.statusCode == 200 ) {
        console.debug(body);
        const xml = xsltProcessor.xmlParse(body); // xsltString: string of xslt file contents
        const outXmlString = xsltProcessor.xsltProcess(xml, xslt); // outXmlString: output xml string.
        console.debug(outXmlString);

    } else {
        
        console.error(response.statusCode );
        console.error(body);
    }
}