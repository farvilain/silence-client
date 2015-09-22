var http = require('http');

function create(host, port, version){

	function createOptions(options){
		var o = {
			host: host,
			port: port,
			method : options.method,
			path: options.path,
			headers :{
				"content-type":"application/json",
				"version" : version
			}
		};
		if(options.headers){
			Object.keys(options.headers).forEach(function(k){
				o.headers[k] = options.headers[k];
			});
		}	
		return o;
	}

	function request(options,callback){
		var o = createOptions(options);
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

		}).on("error", function(e){
			if(!end){
				callback(e, null, null);
			}
		});
		options.body = options.body || {};
		try{
			req.write(JSON.stringify(options.body));
			req.end();
		}
		catch(e){
			callback(e,null,null);
		}
		
	}

	return request;
}

module.exports = create;