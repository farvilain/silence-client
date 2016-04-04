# Silence-client

Super simple client to connect Rest API built with JSON


## How to
`npm install --save silence-client`


```javascript
var client = require('silence-client')({
	host	: "localhost",
	port	: 80,
	secured : false
});

var request = {
	path : "/user",
	method : POST,
	body : {
		name : "farv",
	},
	headers : {
		"requestId" : "12312"
	}
};

client(request, function(err, res, body){
	if(err){
    	console.error(err);
        return;
    }
    console.log(body);
});

```

