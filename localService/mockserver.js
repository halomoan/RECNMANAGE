/*
 * Copyright (C) 2009-2017 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define(["jquery.sap.global","sap/ui/core/util/MockServer"],function($,M){"use strict";var m,_="fin/re/conmgmts1/",a=_+"localService/mockdata";return{init:function(){var u=$.sap.getUriParameters(),j=$.sap.getModulePath(a),s=$.sap.getModulePath(_+"manifest",".json"),e="ContractDataSet",E=u.get("errorType"),i=E==="badRequest"?400:500,o=$.sap.syncGetJSON(s).data,b=o["sap.app"].dataSources.mainService,c=$.sap.getModulePath(_+b.settings.localUri.replace(".xml",""),".xml"),d=/.*\/$/.test(b.uri)?b.uri:b.uri+"/";m=new M({rootUri:d});M.config({autoRespond:true,autoRespondAfter:(u.get("serverDelay")||50)});m.simulate(c,{sMockdataBaseUrl:j,bGenerateMissingMockData:true,aEntitySetsNames:["ContractConditionDataSet","ContractConditionTimesliceDataSet","ContractDataSet","ContractDocumentData","ContractMainPartnerDataSet","ContractMainPartnerTimesliceDataSet","ContractNoticeDataSet","ContractObjectDataSet","ContractObjectTimesliceDataSet","ContractPartnerDataSet","ContractPartnerTimesliceDataSet","ContractReminderDataSet","ContractRenewalDataSet","ContractTermDataSet","ContractTimelineDataSet","RecnContractTypeSet"]});var r=m.getRequests(),R=function(f,g,h){h.response=function(x){x.respond(f,{"Content-Type":"text/plain;charset=utf-8"},g);};};m.setRequests(r);if(u.get("metadataError")){r.forEach(function(f){if(f.path.toString().indexOf("$metadata")>-1){R(500,"metadata Error",f);}});}if(E){r.forEach(function(f){if(f.path.toString().indexOf(e)>-1){R(i,E,f);}});}m.start();$.sap.log.info("Running the app with mock data");},getMockServer:function(){return m;}};});
