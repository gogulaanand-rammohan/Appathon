'use strict'

const requestNPM = require('request');
const SUCCESS_CODES = [200,201,202];
const bearer_token = `{enter the bearer token}`;
var userid=0
function cleanOptions(options) {
    return JSON.stringify(options, function (key, value) {
        if (key === 'formData') {
            delete value['attachments[]'].value;
            delete value.description;
            delete value.body;
        }
        return value;
    });
}

function request(options) {
  //console.log("requsr function")
    return new Promise((resolve, reject) => {
        requestNPM(options ,function (error, response, body) {
          //console.log("respnse",response)
            if (error) {
                return reject(
                    `Error during request with options ${cleanOptions(options)}. Status code: ${error.statusCode} Response: ${error.message}`
                );
            }

            if (!SUCCESS_CODES.includes(response.statusCode)) {
                return reject(
                    `Error during request with options ${cleanOptions(options)}. Status code: ${response.statusCode}`
                );
            }

             //console.log(`Request with options ${cleanOptions(options)} succeeded.`);
            return resolve(body);
        });
    });
}

function getOrg() {
    const addr = "https://graph.facebook.com/community"
    const options = {
      method:'GET',
      url:addr,
      headers:{
        Authorization: bearer_token
      }
    }
    resp = requester(options)
    console.log(resp);
    return resp
  }


  
  

function requester(options){

  requestNPM(options, function(error, response, body){
    // console.log("error",error);
    console.log("body",body);

  }) 
}

exports = {

  events: [
    { event: 'onEmployeeCreate', callback: 'onEmployeeCreateHandler' },
    { event: 'onEmployeeUpdate', callback: 'onEmployeeUpdateHandler' }
  ],

  onEmployeeCreateHandler: function(args) {
  	var department_id = args["user"]["job_role_id"] 
  	for( var i = 0; i < args["job_roles"].length; i++){
  		if( args["job_roles"][i]["id"] == department_id ){
  			var department_name = args["job_roles"][i]["name"]
  		}
  	}
	  var manager_id = args["reporting_to_id"]
	  if (manager_id){
		for( let i = 0; i < args["user_emails"].length; i++){
			if( args["user_emails"][i]["user_id"] == manager_id ){
				var manager_email_id = args["user_emails"][i]["email"]
			}
		}
	  }
	  else {
		  manager_email_id = null
	  }
  	var team_id = args["user"]["team_id"] 
  	for( let i = 0; i < args["teams"].length; i++){
  		if( args["teams"][i]["id"] == team_id ){
  			var team_name = args["teams"][i]["name"]
  		}
  	}
  	var options = {
  		method:'POST',
  		url:'https://graph.facebook.com/company/accounts',
  		headers:{
  			Authorization: bearer_token
  		},
  		form:{
			  "name"         : args["user"]["first_name"],
			  "email"        : args["user"]["email"],
			  "work_phone_number" : "09789468802",
			  "work_phone_number_country_prefix" : 91,
			  "department"   : department_name,
			  "title"        : args["user"]["designation"],
			  "division"     : team_name,	
			  "organization" : "Freshworks",
			  "manager"      : manager_email_id,		
			  "hire_date"    : "1573603200",
			  "invited"      : true,
			  "work_address" : "Chennai",
			  "locale"       : "en_US",
			  "auth_method"  : "password"
			}
    }
    //console.log(options["form"])
    request(options)
    	.then(function(response) {
			console.log(response)
    	})
    	.catch(function(err){
    		console.log(err);
    	});
  },

  onEmployeeUpdateHandler: function(args) {
	var email = args["user"]["email"]
	var addr = "https://graph.facebook.com/" + email
	var options = {
		method:'GET',
		url:addr,
		headers:{
			Authorization: bearer_token
		} }; 
request(options)
		.then(function(data) {
		  var result = JSON.parse(data);
		  //console.log(result["id"]);
		  userid = result["id"];
		  //console.log(userid)
		  test(userid,args);
		  
	  })
	  .catch(function(error){
		  //console.log("getworkplaceid");
		  console.log(error);
	  });
	}
  };

function test(id,args){
	//id= userid 
  //console.log(id);
  //console.log("hithere");

  if(args["user"]["terminated"] == true || args["user"]["deleted"] == true){
	var options = {
	  method:'POST',
	  url:"https://graph.facebook.com/"+id+"?active=false",
	  headers:{
		Authorization: bearer_token
	  }
	}
	   request(options);

  }
  else {
	var department_id = args["user"]["job_role_id"] 
	for( var i = 0; i < args["job_roles"].length; i++){
		if( args["job_roles"][i]["id"] == department_id ){
			var department_name = args["job_roles"][i]["name"]
		}
	}

	var team_id = args["user"]["team_id"] 
	for( let i = 0; i < args["teams"].length; i++){
		if( args["teams"][i]["id"] == team_id ){
			var team_name = args["teams"][i]["name"]
		}
	}

	var manager_id = args["reporting_to_id"]
	  if (manager_id){
		for( let i = 0; i < args["user_emails"].length; i++){
			if( args["user_emails"][i]["user_id"] == manager_id ){
				var manager_email_id = args["user_emails"][i]["email"]
			}
		}
	  }
	  else {
		  manager_email_id = null
	  }
	  var options = {
		  method:'POST',
		  url:"https://graph.facebook.com/" + id,
		  headers:{
			  Authorization: bearer_token
		  },
		  form:{
			"name"         : args["user"]["first_name"],
			"email"        : args["user"]["email"],
			"work_phone_number" : "09789468802",
			"work_phone_number_country_prefix" : 91,
			"department"   : department_name,
			"title"        : args["user"]["designation"],
			"division"     : team_name,	
			"organization" : "Freshworks",
			"manager"      : manager_email_id,		
			"hire_date"    : "1573603200",
			"invited"      : true,
			"work_address" : "Chennai",
			"locale"       : "en_US",
			"auth_method"  : "password"
		  }
	}
  request(options);
}
}
