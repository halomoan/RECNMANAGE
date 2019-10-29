/*
 * Copyright (C) 2009-2017 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/util/MockServer"
], function($, MockServer) {
	"use strict";
	var oMockServer,
		_sAppModulePath = "fin/re/conmgmts1/",
		_sJsonFilesModulePath = _sAppModulePath + "localService/mockdata";

	return {

		/**
		 * Initializes the mock server.
		 * You can configure the delay with the URL parameter "serverDelay".
		 * The local mock data in this folder is returned instead of the real data for testing.
		 * @public
		 */
		init: function() {
			var oUriParameters = $.sap.getUriParameters(),
				sJsonFilesUrl = $.sap.getModulePath(_sJsonFilesModulePath),
				sManifestUrl = $.sap.getModulePath(_sAppModulePath + "manifest", ".json"),
				sEntity = "ContractDataSet",
				sErrorParam = oUriParameters.get("errorType"),
				iErrorCode = sErrorParam === "badRequest" ? 400 : 500,
				oManifest = $.sap.syncGetJSON(sManifestUrl).data,
				oMainDataSource = oManifest["sap.app"].dataSources.mainService,
				sMetadataUrl = $.sap.getModulePath(_sAppModulePath + oMainDataSource.settings.localUri.replace(".xml", ""),
					".xml"),
				// ensure there is a trailing slash
				sMockServerUrl = /.*\/$/.test(oMainDataSource.uri) ? oMainDataSource.uri : oMainDataSource.uri + "/";
			oMockServer = new MockServer({
				rootUri: sMockServerUrl
			});

			// configure mock server with a delay of 1s
			MockServer.config({
				autoRespond: true,
				autoRespondAfter: (oUriParameters.get("serverDelay") || 50)
			});

			// load local mock data
			oMockServer.simulate(sMetadataUrl, {
				sMockdataBaseUrl: sJsonFilesUrl,
				bGenerateMissingMockData: true,
				aEntitySetsNames: ["ContractConditionDataSet", "ContractConditionTimesliceDataSet", "ContractDataSet",
					"ContractDocumentData",
					"ContractMainPartnerDataSet", "ContractMainPartnerTimesliceDataSet", "ContractNoticeDataSet",
					"ContractObjectDataSet",
					"ContractObjectTimesliceDataSet", "ContractPartnerDataSet", "ContractPartnerTimesliceDataSet",
					"ContractReminderDataSet",
					"ContractRenewalDataSet", "ContractTermDataSet", "ContractTimelineDataSet", "RecnContractTypeSet"
				]
			});

			var aRequests = oMockServer.getRequests(),
				fnResponse = function(iErrCode, sMessage, aRequest) {
					aRequest.response = function(oXhr) {
						oXhr.respond(iErrCode, {
							"Content-Type": "text/plain;charset=utf-8"
						}, sMessage);
					};
				};

			oMockServer.setRequests(aRequests);

			// handling the metadata error test
			if (oUriParameters.get("metadataError")) {
				aRequests.forEach(function(aEntry) {
					if (aEntry.path.toString().indexOf("$metadata") > -1) {
						fnResponse(500, "metadata Error", aEntry);
					}
				});
			}

			// Handling request errors
			if (sErrorParam) {
				aRequests.forEach(function(aEntry) {
					if (aEntry.path.toString().indexOf(sEntity) > -1) {
						fnResponse(iErrorCode, sErrorParam, aEntry);
					}
				});
			}
			oMockServer.start();

			$.sap.log.info("Running the app with mock data");
		},

		/**
		 * @public returns the mockserver of the app, should be used in integration tests
		 * @returns {sap.ui.core.util.MockServer} the mockserver instance
		 */
		getMockServer: function() {
			return oMockServer;
		}
	};

});
