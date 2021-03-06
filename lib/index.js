function create(globalOptions){

	var http = null;
	if ( globalOptions.secured ) {
		http = require('https');
	} else {
		http = require('http');
	}

	function buildRequest(options){
		var o = {
			host: globalOptions.host,
			port: globalOptions.port,
			method : options.method,
			path: options.path,
			headers :{
				"accept":"application/json",
			},
			auth : globalOptions.auth
		};
		if( options.timeout || globalOptions.timeout) {
			o.timeout = options.timeout || globalOptions.timeout;
		}
		if(options.body){
			o.body = JSON.stringify(options.body);
			o.headers["content-type"] = "application/json";
		}
		
		if(options.headers){
			Object.keys(options.headers).forEach(function(k){
				o.headers[k] = options.headers[k];
			});
		}
		return o;
	}

	function request(options,callback){
		var o = buildRequest(options);
		var end = false;

		//(FARV) Thanks to NodeJS method parser that produce HPE_INVALID_METHOD
		var methodToUse = http.request;
		if(o.method === 'GET'){
			methodToUse = http.get;
		}

		var req = methodToUse(o, function(resp){
			var body = null;

			resp.on('end', function(){
				end = true;
				if(!body){
					return callback(null, resp, null);
				}

				if(!resp.headers['content-type'] || resp.headers['content-type'].indexOf("application/json") !== 0){
					return callback(null, resp, body);
				}

				var jsonBody = null;
				try{
					var jsonBody = JSON.parse(body);
				}catch(e){
					return callback(e, resp, null);
				}
				return callback(null, resp, jsonBody);
			});
			resp.on('data', function(chunk){
				body = body || "";
				body += chunk;
			});

		})
		.on('timeout', function() {
			if(!end){
				callback('timeout', null, null);
			}
		})
		.on("error", function(e){
			if(!end){
				callback(e, null, null);
			}
		});
		try{
			if(o.body){
				req.write(o.body);
			}
			req.end();
		}
		catch(e){
			callback(e,null,null);
		}
		
	}

	return request;
}

module.exports = create;