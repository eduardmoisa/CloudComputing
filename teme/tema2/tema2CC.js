var http = require('http');
var url = require('url');
var cloth = function (cloth_id, type, brand, price, size) {
	this.Cloth_id = cloth_id;
	this.Type = type;
	this.Brand = brand;
	this.Price = price;
	this.Size = size;
}
var clothes = [];
clothes.push(new cloth('1', 'T-shirt', 'Pull&Bear', '40', 'M'));
clothes.push(new cloth('2', 'Jeans', 'Zara', '129', 'L'));
clothes.push(new cloth('3', 'T-shirt', 'LC-Waikiki', '30', 'XS'));
clothes.push(new cloth('4', 'Jacket', 'Bershka', '299', 'S'));
clothes.push(new cloth('5', 'Vest', 'Tommy-Hilfiger', '320', 'M'));
clothes.push(new cloth('6', 'Dress', 'Zara', '400', 'S'));

var getAllClothes = function(callback) {
	callback(null, clothes);
};

var getClothById = function (cloth_id, callback) {
    var filteredClothes = [];
    for (var i = 0; i < clothes.length; i++) {
        if (clothes[i].Cloth_id.toUpperCase() === cloth_id.toUpperCase()) {
            filteredClothes.push(clothes[i]);
        }
    }
    if (filteredClothes.length != 0)
        callback(null, filteredClothes);
    else
        callback(invalidOperationException());
};

var createCloth = function (newCloth, callback) {
	for(var i = 0; i< clothes.length ; i++){
		if (clothes[i].Cloth_id == newCloth.Cloth_id){
			callback(alreadyExistsException());
			return;
	}
	}
	clothes.push(newCloth);
	if (clothes.length != 0)
		callback(null, newCloth);
	else {
		callback(invalidOperationException());
	}
	
};

var deleteClothById = function(id, callback) {
	var ok = 1
	for(var i = 0; i<clothes.length; i++){
		if(clothes[i].Cloth_id == id){
			ok = 0;
		var i;
		for(i = 0; i<clothes.length; i++){
			if(clothes[i].Cloth_id == id)
				clothes.splice(i, 1);
		}
		if(clothes.length != 0)
			callback(null, clothes);
		else
			callback(invalidOperationException());
		}
		}
		if(ok ==1)
		callback(invalidOperationException());

};

var updateClothById = function(id, updateCloth, callback) {
	var i;
	for(i = 0; i<clothes.length; i++){
			if (clothes[i].Cloth_id.toUpperCase() === id.toUpperCase())
            clothes[i] = updateCloth;
	}
		if (clothes.length != 0)
        callback(null, updateCloth);
    else {
        callback(invalidOperationException());
    }
};

function generateError(err, msg) {
    var error = new Error(msg);
    error.code = err;
    return error;
}

function notFoundException() {
    return generateError("404", "The resource does not exist.");
}
function invalidOperationException() {
    return generateError("400", "The cloth does not exist");
}
function missingInformationException() {
    return generateError("400", "Information of cloth does not exist");
}
function alreadyExistsException(){
	return generateError("409",  "Conflict, the cloth with that Id already exists");
}

function success(response, data) {
    response.writeHead(200, {
        "Content-Type" : "application/json"
    });
    
    response.end(JSON.stringify({
        error : null,
        data : data
    }));
}

function failure(response, err) {
    response.writeHead(err.code, {
        "Content-Type" : "application/json"
    });
    response.end(JSON.stringify({
        error : err.code,
        message : err.message
    }));
}

function parseRequestBody(request, callback) {
    var body = '';
    request.on(
        'readable' ,
        function () {
            var rawBody = request.read();
            if (rawBody) {
                if (typeof rawBody == 'string') {
                    body += rawBody;
                } else if (typeof rawBody == 'object' && rawBody instanceof Buffer) {
                    body += rawBody.toString('utf8');
                }
            }
        });

    request.on(
        'end',
        function() {
            if (body) {
                try {
                    var clothInformation = JSON.parse(body);
                    if (!clothInformation.Cloth_id) {
                        callback(missingInformationException());
                        return;
                    }
                    callback(null, clothInformation);
                } catch (e) {
                    callback(invalidOperationException());
                    return;
                }
            }
        });
}


function processRequest(request, response) {
    request.parsedurl = url.parse(request.url, true);
    var requestUrl = request.parsedurl.pathname;
    
    //handle all clothes
    if(requestUrl == '/allclothes' && request.method == 'GET'){
    	getAllClothes(function (err, clothes){
    		if(err){
    			failure(response, err);
    			return;
    		}
    		success(response, clothes);
    	});
    }
    else if (requestUrl.substr(0,8) == '/clothes' && request.method =='GET'){
    	getClothById(requestUrl.substr(9, requestUrl.length - 9), function(err, cloth){
    		if(err){                     
    			failure(response,err);
    			return;
    		}
    		success(response, cloth);
    	});
    }
    else if(requestUrl == '/allclothes' && request.method == 'POST') {
    	parseRequestBody(request, function(err, newCloth) {
    		if(err){
    			failure(response,err);
    			return;
    		}
    	createCloth(newCloth, function(e, createdCloth){
    		if(e){
    			failure(response, e);
    			return;
    		}
    		success(response, createdCloth);
    		});
    	});
    }
    else if(requestUrl.substr(0,7) == '/update' && request.method =='PUT'){
    	var ask = requestUrl.substr(8, requestUrl.length - 8);
    	var ok = 1;
    		for(var i = 0; i < clothes.length ; i++){
    			if(clothes[i].Cloth_id == ask){
    			ok = 0;
    			break;
    		}
    		}
    	if(ok == 0){	
    		parseRequestBody(request, function(err, updateCloth){
    			if (err) {
    				failure(response, err);
    				return;
    			}
    			updateClothById(requestUrl.substr(8, requestUrl.length - 8), updateCloth, function(e, updatedCloth){
    				if(e){
    					failure(response, e);
    					return;
    				}
    			success(response, updatedCloth);
    			});
    		});
   		 }
    	else {
    		parseRequestBody(request, function(err, ccreateCloth) {
    		if(err){
    			failure(response,err);
    			return;
    		}
    		ccreateCloth.Cloth_id = ask;
    	createCloth(ccreateCloth, function(e, createdCloth){
    		if(e){
    			failure(response, e);
    			return;
    		}
    		success(response, createdCloth);
    		});
    	});
    	}
    }
    else if(requestUrl.substr(0,7) == '/remove' && request.method =='DELETE'){
    	deleteClothById(requestUrl.substr(8, requestUrl.length - 8), function(e, deletedCloth){
    		if(e){
    			failure(response, e);
    			return;
    		}
    		success(response, deletedCloth);
    	});
    }
    else {
        failure(response, notFoundException());
    }
};


var server = http.createServer(processRequest);
server.listen(1996);
console.log("Server listening at port 1996...");

