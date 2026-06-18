
function log(msg){
  $("#log").append(msg + "\n");
}

function authHeader(user, pass){
  return "Basic " + btoa(user + ":" + pass);
}

async function getNamespaces(masterUrl, auth){
  return $.ajax({
    url: masterUrl + "/api/dataStore",
    headers: {"Authorization": auth}
  });
}

async function getKeys(masterUrl, auth, namespace){
  return $.ajax({
    url: masterUrl + "/api/dataStore/" + encodeURIComponent(namespace),
    headers: {"Authorization": auth}
  });
}

async function getValue(masterUrl, auth, namespace, key){
  return $.ajax({
    url: masterUrl + "/api/dataStore/" + encodeURIComponent(namespace) + "/" + encodeURIComponent(key),
    headers: {"Authorization": auth}
  });
}

async function createOrUpdateLocal(namespace,key,value){
	const localUrl = window.location.origin;
	const localPathname = window.location.pathname.split("/apps/")[0];
	const url = localUrl + localPathname + "/dataStore/" +
    encodeURIComponent(namespace) + "/" +
    encodeURIComponent(key);
	
	try{
		await $.ajax({
		  url:url,
		  method:"GET"
		});
		await $.ajax({
		  url:url,
		  method:"PUT",
		  data: JSON.stringify(value),
		  contentType:"application/json"
		});
		log("UPDATED " + namespace + "/" + key);
	}catch(e){
		await $.ajax({
			url:url,
			method:"POST",
			data: JSON.stringify(value),
			contentType:"application/json"
		});
		log("CREATED " + namespace + "/" + key);
	}
}

async function syncAll(){
  $("#log").text("");
  const masterUrl = $("#masterUrl").val().replace(/\/$/,'');
  const auth = authHeader(
    $("#username").val(),
    $("#password").val()
  );
  const namespaces = await getNamespaces(masterUrl, auth);
  for(const namespace of namespaces){
    log("Namespace: " + namespace);
    const keys = await getKeys(masterUrl, auth, namespace);
    for(const key of keys){
      const value = await getValue(
        masterUrl,
        auth,
        namespace,
        key
      );
      await createOrUpdateLocal(
        namespace,
        key,
        value
      );
    }
  }
  log("DONE");
}

$(document).ready(function(){
	$("#syncBtn").on("click", syncAll);
});

