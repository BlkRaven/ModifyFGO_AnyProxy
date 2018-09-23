"use strict";
const AnyProxy = require("anyproxy");
const exec = require('child_process').exec;
const fs = require("fs");

//user setting path
const profile = "profile/";
//user turn random number path
const turnfile = "turnfile/";
//server host
const signalServerAddressHost = "http://com.locbytes.xfgo.signal/";
// for new users that do not have setting file on disk
const defaultSetting = "{\"userid\":100100100100,\"password\":\"password\",\"battleCancel\":true,\"uHpSwitch\":true,\"uAtkSwitch\":true,\"uHp\":10,\"uAtk\":10,\"limitCountSwitch\":true,\"skillLv\":true,\"tdLv\":true,\"enemyActNumSwitch\":true,\"enemyActNumTo\":0,\"enemyChargeTurnSwitch\":true,\"enemyChargeTurnto\":6,\"replaceSvtSwitch\":true,\"replaceSvtSpinner\":6,\"replaceSvt2\":true,\"replaceSvt3\":true,\"replaceSvt4\":true,\"replaceSvt5\":true,\"replaceSvt6\":true,\"replaceCraftSwitch\":true,\"replaceCraftSpinner\":1}";
// Proxy Port
const proxyPort = 8001;
// Web UI
const webInterface = false;
// Web Port, when unavailble
const webInterfacePort = 8002;
//show anyproxy log in console
const silent = false;

//check cert
if (!AnyProxy.utils.certMgr.ifRootCAFileExists()) {
	AnyProxy.utils.certMgr.generateRootCA((error, keyPath) => {
		if (!error) {
			const certDir = require('path').dirname(keyPath);
			console.log('根证书生成成功，请从xfgo模块中安装证书，证书本地路径: ', certDir);
			const isWin = /^win/.test(process.platform);
			if (isWin) {
				exec('start .', { cwd: certDir });
			}
		} else {
			console.error('根证书生成失败', error);
		}
	});
}

const options = {
	port: proxyPort,
	webInterface: {
    enable: webInterface,
    webPort: webInterfacePort
  },
	rule: {
		summary: "ModifyFGO by heqyou_free",
		*beforeSendRequest(requestDetail) {
			// cer or random number
			if(requestDetail.url.indexOf(signalServerAddressHost)>=0){
				if(requestDetail.requestOptions.method == "GET"){
					// cer
					if(requestDetail.requestOptions.path.indexOf("getRootCA")>0){
						//read cer form disk
						const rootCA = fs.readFileSync(AnyProxy.utils.certMgr.getRootDirPath()+"/rootCA.crt").toString();
						return responseBody(rootCA);
					}else{
					// random number
						var userId=requestDetail.requestOptions.path.substring(2);
						// get random number
						var randomNum=3+parseInt(Math.random()*15, 10);
						// save random number to disk
						fs.writeFileSync(turnfile+"turn"+userId+".txt",randomNum);
						return responseBody(randomNum.toString());
					}
				}
				if(requestDetail.requestOptions.method == "POST"){
					// get request body
					var optionString = requestDetail.requestData.toString();
					// change String into JSON object
					var option = JSON.parse(optionString);
					// get userid
					var uid = option.uid;
					fs.exists("dirName", function(exists) {
						if(exists){
							// read old setting
							var oldOption = JSON.parse(profile+uid+"options.json");
							// is password correct
							if(option.pw == oldOption.pw){
								// save setting to disk
								fs.writeFileSync(profile+uid+"options.json", optionString);
								return responseBody("success");
							}else{
								return responseBody("failed");
							}
						}else{
						// is new user
							fs.writeFileSync(profile+uid+"options.json", optionString);
							return responseBody("success");
						}
					});
				}
			}else{
				if (requestDetail.url.indexOf("ac.php")>0 && requestDetail.requestData.indexOf("key=battleresult")>0) {
					// get userid
					var uid = getUserID(requestDetail.url);
					// read setting
					var options = readSetting(uid);
					if(options.battleCancel == true){
						// split request data with &
						var data = requestDetail.requestData.toString().split("&");
						// url decode
						data[11]= customUrlDecode(data[11]);
						// get result
						var json = JSON.parse(data[11].substring(7));
						if(json.battleResult == 3){
							//get userid
							var uid = getUserID(requestDetail.url);
							var randomNum = parseInt(fs.readFileSync(turnfile+"turn"+uid+".txt"), 10);
							// set result to win
							json.battleResult = 1;
							// set turn num to random
							json.elapsedTurn = randomNum;
							// clear alive beast
							json.aliveUniqueIds = [];
							// change JSON object into String
							temp=JSON.stringify(json);
							// encode result
							data[11]= "result="+customUrlEncode(temp);
							// connect array with &
							var newRequestData = "";
							data.forEach( value => {
								newRequestData += value;
								for (var i = 1;i<data.length;i++){
									newRequestData += "&";
								}
							});
						}
						return {
							requestData: newRequestData
						};
					}
				}
			}
		},

		*beforeSendResponse(requestDetail, responseDetail) {
			if((requestDetail.requestData.indexOf("key=battlesetup")>0||requestDetail.requestData.indexOf("key=battleresume")>0)&&requestDetail.url.indexOf("ac.php")>0){
				var response = Object.assign({}, responseDetail.response);
				//get response body
				var rawBody = response.body.toString();
				//replace %3D to =
				rawBody = rawBody.replace(/%3D/g, "=");
				//base64 encode
				var jsonStr = new Buffer(rawBody, "base64").toString();
				//change into JSON object
				var decJson = JSON.parse(jsonStr);

				//need XFGO
				decJson.sign="";

				//get setting
				var uid = getUserID(requestDetail.url);
				var options = readSetting(uid);
				var uHp = options.uHp;
				var uAtk = options.uAtk;
				var limitCountSwitch = options.limitCountSwitch;
				var skillLv = options.skillLv;
				var tdLv = options.tdLv;
				var enemyActNumSwitch = options.enemyActNumSwitch;
				var enemyActNumTo = options.enemyActNumTo;
				var enemyChargeTurnSwitch = options.enemyChargeTurnSwitch;
				var enemyChargeTurnto = options.enemyChargeTurnto;
				var replaceSvtSwitch = options.replaceSvtSwitch;
				var replaceSvtSpinner = options.replaceSvtSpinner;
				var replaceSvt1 = options.replaceSvt1;
				var replaceSvt2 = options.replaceSvt2;
				var replaceSvt3 = options.replaceSvt3;
				var replaceSvt4 = options.replaceSvt4;
				var replaceSvt5 = options.replaceSvt5;
				var replaceSvt6 = options.replaceSvt6;
				var replaceCraftSwitch = options.replaceCraftSwitch;
				var replaceCraftSpinner = options.replaceCraftSpinner;

				if (decJson['cache']['replaced']['battle'] != undefined) {
					//foreach does not work here, i have no idea about this.
					var svts = decJson['cache']['replaced']['battle'][0]['battleInfo']['userSvt'];
					for (var i = 0;i<svts.length;i++) {
						var sv = svts[i];
						//----------------------------------------
						//enemy
						if (sv['hpGaugeType'] != undefined) {
							//replace enemy act num
							if(enemyActNumSwitch){
								sv['maxActNum'] = enemyActNumTo;
							}
							//replace enemy charge turn
							if(enemyChargeTurnSwitch){
								sv['chargeTurn'] = enemyChargeTurnto;
							}
							continue;
						}
						//----------------------------------------

						//----------------------------------------
						//svt
						if (sv['status'] != undefined && sv['userId'] != undefined && sv['userId'] != '0' && sv['userId'] != 0) {
							//replace svt hp
							if (typeof sv['hp'] === 'number') {
								sv['hp'] = parseInt(sv['hp'])*uHp;
							}else{
								sv['hp'] = String(parseInt(sv['hp'])*uHp);
							}
							//replace svt atk
							if (typeof sv['atk'] === 'number') {
								sv['atk'] = parseInt(sv['atk'])*uAtk;
							}else{
								sv['atk'] = String(parseInt(sv['atk'])*uAtk);
							}

							//replace skill level
							if (skillLv) {
								sv['skillLv1'] = 10;
								sv['skillLv2'] = 10;
								sv['skillLv3'] = 10;
							}

							//replace treasure device level
							if (tdLv) {
								if(typeof sv["treasureDeviceLv"] == typeof ""){
									sv["treasureDeviceLv"] = "5";
								}
							}

							//replace limit count
							if (limitCountSwitch) {
								sv['limitCount'] = 4;
								sv['dispLimitCount'] = 4;
								sv['commandCardLimitCount'] = 3;
								sv['iconLimitCount'] = 4;
							}

							//replace svt
							if (replaceSvtSwitch) {
								if ((replaceSvt1 && sv['svtId'] == "600200") || replaceSvtSpinner == 1) {
									ReplaceSvt(sv, 602500, 602501, 41650, 13553, 324650, 14246, 12767, false);
								}
								if ((replaceSvt2 && sv['svtId'] == "600100") || replaceSvtSpinner == 2) {
									ReplaceSvt(sv, 500800, 500801, 321550, 322550, 323650, 15259, 11546, false);
								}
								if ((replaceSvt3 && sv['svtId'] == "601400") || replaceSvtSpinner == 3) {
									ReplaceSvt(sv, 501900, 501901, 82550, 100551, 101551, 14409, 11598, false);
								}
								if ((replaceSvt4 && sv['svtId'] == "700900") || replaceSvtSpinner == 4) {
									ReplaceSvt(sv, 500300, 500302, 23650, 25550, 108655, 15359, 11546, false);
								}
								if ((replaceSvt5 && sv['svtId'] == "700500") || replaceSvtSpinner == 5) {
									ReplaceSvt(sv, 702300, 702301, 89550, 2245550, 225550, 14500, 12556, false);
								}
								if ((replaceSvt6 && sv['svtId'] == "701500") || replaceSvtSpinner == 6) {
									//ReplaceSvt(sv, 9939320, 507, 960840, 960845, 89550, 3215000, 3215000, true);
		            	//ReplaceSvt(sv, 9939360, 100, 35551, 960845, 89550, 3215000, 3215000, true);
		            	//ReplaceSvt(sv, 9939370, 9939371, 960842, 960843, 36450, 3215000, 3215000, true);
									ReplaceSvt(sv, 9935510, 9935511, 89550, 321550, 108655, 3215000, 3215000, true);
									sv["treasureDeviceLv"] = 1;
								}
								continue;
							}
						}
						//----------------------------------------

						//----------------------------------------
						//carft
						//失效
						/*
						if (replaceCraftSwitch && sv["parentSvtId"] != undefined) {
							console.log("replace carft");
							var carftMap = [990068,990645,990066,990062,990131,990095,990113,990064,990333,990629,990327,990306]
							sv["skillId1"] = carftMap[replaceCraftSpinner];
						}
						*/
						//----------------------------------------
					}
				}

				//change JSON object into String
				var newJsonStr = JSON.stringify(decJson);
				//change chinese into unicode
				var cnReg = /[\u0391-\uFFE5]/gm;
				if (cnReg.test(newJsonStr)) {
					newJsonStr = newJsonStr.replace(cnReg,
					function(str) {
						return "\\u" + str.charCodeAt(0).toString(16);
					});
				}
				//replace / to \/
				newJsonStr=newJsonStr.replace(/\//g, "\\\/");
				//base64 decode
				var newBodyStr = new Buffer(newJsonStr).toString("base64");
				//replace = to %3D
				newBodyStr = newBodyStr.replace(/=/g, "%3D");
				var newBody = new Buffer(newBodyStr);
				response.body = newBody;
				return {
					response: response
				};
			}
		},

		//when get https request only deal with fgo
		*beforeDealHttpsRequest(requestDetail) {
			if(requestDetail.host.match("bili-fate.bilibiligame.net")){
				return true;
			}
			return false;
		}
	},
	silent: silent
};
const proxyServer = new AnyProxy.ProxyServer(options);
proxyServer.start();
console.log("科技服务端已启动");
console.log("端口号：" + options.port);
console.log("网页端口号：" + options.webInterface.webport);
console.log("输入rs手动重启");
console.log("关闭请使用Ctrl-C");


function customUrlEncode(data) {
	data=data.replace(/"/g,'%22');
	data=data.replace(/'/g,'%27');
	data=data.replace(/:/g,'%3a');
	data=data.replace(/,/g,'%2c');
	data=data.replace(/\[/g,'%5b');
	data=data.replace(/]/g,'%5d');
	data=data.replace(/{/g,'%7b');
	data=data.replace(/}/g,'%7d');
	return data;
}
function customUrlDecode(data) {
	data=data.replace(/%22/g,'"');
	data=data.replace(/%27/g,"'");
	data=data.replace(/%3a/g,':');
	data=data.replace(/%2c/g,',');
	data=data.replace(/%5b/g,'[');
	data=data.replace(/%5d/g,']');
	data=data.replace(/%7b/g,'{');
	data=data.replace(/%7d/g,'}');
	return data;
}
function ReplaceSvt(sv, svtId, treasureDeviceId, skillId1, skillId2, skillId3, hp, atk, NolimitCount) {
	sv["svtId"] = svtId;
	sv["treasureDeviceId"] = treasureDeviceId;
	sv["skillId1"] = skillId1;
	sv["skillId2"] = skillId2;
	sv["skillId3"] = skillId3;
	sv["hp"] = hp;
	sv["atk"] = atk;
	if (NolimitCount) {
		sv["limitCount"] = 0;
		sv["dispLimitCount"] = 0;
		sv["commandCardLimitCount"] = 0;
		sv["iconLimitCount"] = 0;
	}
}

function string2bool(str){return str == "true";}

function readSetting(uid){
	var options = JSON.parse(defaultSetting);
	if(uid != null){
		try{
			options = JSON.parse(fs.readFileSync(profile+uid+"options.json"));
		}catch(e){
		}
	}
	return options;
}
function responseBody(body){
	return {
		response: {
			statusCode: 200,
			header: { 'Content-Type': 'text/html' },
			body: body
		}
	};
}
function getUserID (url) {
	var uidreg = /(?<=userId=)\d\d\d\d\d\d\d\d\d\d\d\d/gi;
	var uid = url.match(uidreg);
	return uid;
}