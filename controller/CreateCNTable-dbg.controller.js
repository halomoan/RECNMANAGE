sap.ui.define([
	"fin/re/conmgmts1/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	'sap/ui/model/Filter',
	'sap/ui/model/FilterOperator'

], function(BaseController,JSONModel,Filter,FilterOperator) {
	"use strict";

	return BaseController.extend("fin.re.conmgmts1.controller.CreateCNTable", {
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf fin.re.conmgmts1.view.CreateCNTable
		 */
		onInit: function() {
	
			var oViewModel = new JSONModel({
				Title: "",
				SubTitle: ""
			});
			this.setModel(oViewModel, "viewModel");
			
			
			//this.getOwnerComponent().getModel().metadataLoaded().then(this._onMetadataLoaded.bind(this));
			
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("createcntable").attachPatternMatched(this._onObjectMatched, this);

			
			
		},
		_onMetadataLoaded: function() {
		
		},
		_onObjectMatched: function (oEvent) {
			
/*			this.setParams({
				"bukrs": oEvent.getParameter("arguments").companyCode,
				"swenr" : oEvent.getParameter("arguments").busEntity,
				"recntype" : oEvent.getParameter("arguments").recntype
			});*/
			
			var oViewModel = this.getView().getModel("viewModel");
			
			oViewModel.setProperty("/Title",oEvent.getParameter("arguments").title);
			oViewModel.setProperty("/SubTitle",oEvent.getParameter("arguments").subtitle);
			
			this._refreshTable();
		},
		_refreshTable: function(){
			var oParams = this.getParams();
			var aFilters = [];
				aFilters.push(new Filter("Bukrs", FilterOperator.EQ, oParams.bukrs));
				aFilters.push(new Filter("Swenr", FilterOperator.EQ, oParams.swenr));
				aFilters.push(new Filter("RecnType", FilterOperator.EQ, oParams.recntype));
			
			var oThis = this;
			
			var oModel = this.getOwnerComponent().getModel();
			sap.ui.core.BusyIndicator.show();
			oModel.read("/ZContractListSet", {
				    urlParameters: {
				        "$expand": "NavDetail/ROUnits,NavDetail/BP"
				    },
				    filters: aFilters,
				    success: function(rData) {
				    	var oModelJson = new JSONModel();
				    	var oCreateCNTable = {};
				    	oCreateCNTable.ROUnits = [];	
				    	for(var idx = 0; idx < rData.results.length; idx++) {
				    	
				    		
				    		var oData = rData.results[idx].NavDetail.results[0];
				    		oData.BP = oData.BP.results;
					    	oData.ROUnits = oData.ROUnits.results;
					    	oCreateCNTable.ROUnits.push(oData);
				    	}
				 
				    	oModelJson.setData({ createCNTable : oCreateCNTable } );
				    	oThis.getView().setModel(oModelJson,"CNModel");
				    	sap.ui.core.BusyIndicator.hide();
				    },
				    error: function(oError) {
			            sap.ui.core.BusyIndicator.hide();
			        }
			});	
		}

	});

});