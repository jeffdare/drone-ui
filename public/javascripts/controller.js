
function refreshImage ()
{
	console.log($("#droneImage").attr("src"));
	$("#droneImage").attr("src", $("#droneImage").attr("src").split("?")[0] + "?" + new Date().getTime());
}
setInterval(refreshImage,5000);

var DEVICE_EVT_RE = /^iot-2\/type\/(.+)\/id\/(.+)\/evt\/(.+)\/fmt\/(.+)$/;
var DEVICE_CMD_RE = /^iot-2\/type\/(.+)\/id\/(.+)\/cmd\/(.+)\/fmt\/(.+)$/;
var DEVICE_MON_RE = /^iot-2\/type\/(.+)\/id\/(.+)\/mon$/;

function connectIotf (orgId, api_key, auth_token,deviceType, deviceId) {

	var clientId="a:"+orgId+":" +Date.now();
	var hostname = orgId+".messaging.internetofthings.ibmcloud.com";
	var client;

	var client = new Messaging.Client(hostname, 8883,clientId);

	client.onMessageArrived = function(msg) {
	
		var topic = msg.destinationName;
		var payload = JSON.parse(msg.payloadString);
		var match = DEVICE_MON_RE.exec(topic);
		if(match){
			console.log("monitor");
			console.log(payload);
			if(payload.Action ==="Disconnect") {
				$("#connStatus").text('Not Connected');
				$("#connStatus").attr('class','Tabs-value-nc');
			} else {
				$("#connStatus").text('Connected - '+match[2]);
				$("#connStatus").attr('class','Tabs-value-c');
			}
		} else {
			console.log("event");
			console.log(payload);
			if(payload.d){
				$('#battery').attr('value',payload.d.Battery);
				$('#flying').text(payload.d.isFlying);
				$('#flystate').text(payload.d.flyState);
				$('#controlstate').text(payload.d.controlState);
			}
		}
			

	};
	client.onConnectionLost = function(e){
		console.log("Connection Lost at " + Date.now() + " : " + e.errorCode + " : " + e.errorMessage);
		this.connect(connectOptions);
	}

	var connectOptions = {};
	connectOptions.keepAliveInterval = 3600;
	connectOptions.useSSL=true;
	connectOptions.userName=api_key;
	connectOptions.password=auth_token;
	connectOptions.onSuccess = function() {
		console.log("MQTT connected to host: "+client.host+" port : "+client.port+" at " + Date.now());

		var subscribeOptions = {
			qos : 0,
			onSuccess : function() {
				console.log("subscribed to " + subscribeTopic);
			},
			onFailure : function(){
				console.log("Failed to subscribe to " + subscribeTopic);
				console.log("As messages are not available, visualization is not possible");
			}
		};
		var subscribeOptions1 = {
			qos : 0,
			onSuccess : function() {
				console.log("subscribed to " + subscribeTopic1);
			},
			onFailure : function(){
				console.log("Failed to subscribe to " + subscribeTopic1);
				console.log("As messages are not available, visualization is not possible");
			}
		};
		subscribeTopic = "iot-2/type/" + deviceType + "/id/" + deviceId + "/evt/+/fmt/json";
		client.subscribe(subscribeTopic,subscribeOptions);
		subscribeTopic1 = "iot-2/type/" + deviceType + "/id/" + deviceId + "/mon";
		client.subscribe(subscribeTopic1,subscribeOptions1);
	}
	connectOptions.onFailure = function(e) {
		console.log("MQTT connection failed at " + Date.now() + "\nerror: " + e.errorCode + " : " + e.errorMessage);
	}
	console.log("about to connect to " + client.host);
	client.connect(connectOptions);
	
	
}

connectIotf('eu8zyd','a-eu8zyd-0v4qumf4t3','Y95lRqIROX-0qepfXn', 'drone', '+');


