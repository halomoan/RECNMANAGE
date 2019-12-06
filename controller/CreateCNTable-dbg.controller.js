sap.ui.define([
	"fin/re/conmgmts1/controller/BaseController",
	'sap/m/MessageBox',
	"sap/ui/model/json/JSONModel",
	'sap/ui/core/Fragment',
	'sap/ui/model/Sorter',
	'sap/ui/model/Filter',
	'sap/ui/model/FilterOperator',
	"fin/re/conmgmts1/model/formatter"
], function(BaseController,MessageBox,JSONModel,Fragment,Sorter,Filter,FilterOperator,formatter) {
	"use strict";

	return BaseController.extend("fin.re.conmgmts1.controller.CreateCNTable", {
		formatter: formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf fin.re.conmgmts1.view.CreateCNTable
		 */
		onInit: function() {
			
			jQuery.sap.require("sap.ui.core.format.DateFormat");
			var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({pattern: "yyyyMMdd"});
	
			var oViewModel = new JSONModel({
				addMainBP : true,
				mainBPRole : this.getMainBPRole(),
				busy: false,
				today: oDateFormat.format(new Date()),
				durationUnits : [{"key": "day","text": "Day(s)"},{"key": "month","text": "Month(s)"},{"key": "year","text": "Year(s)"}],
				durationUnitKey: "month",
				collapseIcon: "collapse"
			});
			this.setModel(oViewModel, "viewModel");
			
			
			this.getOwnerComponent().getModel().metadataLoaded().then(this._onMetadataLoaded.bind(this));
			
		

			
			
			// var oBindingModel = new sap.ui.model.Binding(oModel,"/catalog/createCNTable/rows",oModel.getContext("/CNModel"));
			//  oBindingModel.attachChange(function() {
			//  	console.log("refresh");
			//  });
			
		},
		_onMetadataLoaded: function() {
			 var oViewModel = this.getView().getModel("viewModel");
			
			
			// var oModel = new JSONModel("/model/CNTemplate.json");
			
			// oModel.attachRequestCompleted(function() {
			// 	var oData = oModel.getData();
			// 	oViewModel.setProperty("/OTemplate",oData.template);
			// });
			
			
			var oModel = new JSONModel("/model/CNModel.json");
			this.getView().setModel(oModel,"CNModel");
			
			var oCondFormModel = new JSONModel("/model/CondFModel.json");
			this.getView().setModel(oCondFormModel,"CondFModel");
			
		
			 this.getView().bindElement({
			 	path: "/ZContractDataSet('TMPL001')",
				events: {
			 		dataRequested: function(){
			 			oViewModel.setProperty("/busy", true);	
			 		},
			 		dataReceived: function(rData) {
			 			var oData = rData.getParameter("data");
			 			oData.BP = [];
			 			oData.ROUnits = [];
			 			oViewModel.setProperty("/OTemplate",oData);
			 				console.log(rData,oData);
						oViewModel.setProperty("/busy", false);
			 		}
				}
			 });

		},


		onDelete: function() {
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			MessageBox.confirm(
				this.getResourceBundle().getText("Dialog.Confirm.Delete"),
				{
					icon: MessageBox.Icon.WARNING,
					title: "Warning",
					actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
					styleClass: bCompact ? "sapUiSizeCompact" : "",
					initialFocus: MessageBox.Action.CANCEL,
					onClose: function(oAction) {
						if (oAction === sap.m.MessageBox.Action.OK) {
							this._onDelete();
						}
					}.bind(this)
				}
				
			);
		},
		
		
		onToggleCollapse: function(){
			
			var oTreeTable = this.byId("createCNTable");
			var oViewModel = this.getView().getModel("viewModel");
			if(oViewModel.getProperty("/collapseIcon") === "collapse"){
				oTreeTable.collapseAll();
				oViewModel.setProperty("/collapseIcon","expand");
			} else{
				oTreeTable.expandToLevel(1);
				oViewModel.setProperty("/collapseIcon","collapse");
			}	
		},
		onAddUnit: function(oEvent){

			
			if(oEvent.getSource().getParent().sParentAggregationName === "rows") {
				this._selectedIdx = oEvent.getSource().getParent().getIndex();
				this._useWizard = false;
			} else{
				this._useWizard = true;
			}
			
			if (!this._oSelectUnit) {
				this._oSelectUnit = sap.ui.xmlfragment("selectRO","fin.re.conmgmts1.fragment.selectUnit", this);
				this._oSelectUnit.setModel(this.getView().getModel());
			}
			
			var oSorter = new sap.ui.model.Sorter("Xmetxt", false);
			
			var aFilters = [];
			aFilters.push(new Filter("Bukrs", FilterOperator.EQ, "1001"));
			aFilters.push(new Filter("Swenr", FilterOperator.EQ, "00001001"));
			aFilters.push(new Filter("Rotype", FilterOperator.EQ, "RU"));
			
			var oTable = Fragment.byId("selectRO", "selectRO-table");
			var oTemplate = oTable.getBindingInfo("items").template;
			
			var oBindingInfo = {
				path: "/RentalObjectSearchSet",
				template: oTemplate,
				sorter : oSorter,
				filters: aFilters
			};
			
			oTable.bindAggregation("items", oBindingInfo);
			this.getView().addDependent(this._oSelectUnit);
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oSelectUnit);
			this._oSelectUnit.open();

		/*	var oTreeTable = this.byId("createCNTable");
			
			
			
			var oModel = oTreeTable.getBinding("rows").getModel();
			
			var oContext = oTreeTable.getContextByIndex(rowIdx);
			var oData = oContext.getProperty();
			
			var oRow = {"isParent": false,
						 "reobjnr" : "1",
						 "reunit"  : "#02-02",
						"unitsize": "1,500.00 SF"
						
						};
			oData.ROUnits.push(oRow);
			oModel.refresh();
			oTreeTable.expand(rowIdx);*/
				
			
		},
		onCloseDialog: function(){
			this._oSelectUnit.close();
		},
		onUnitSearch: function(oEvent){
			var sValue = oEvent.getParameter("value");
		
			var oFilter1 = new Filter("Xmetxt", sap.ui.model.FilterOperator.Contains, sValue);
			//var oFilter2 = new Filter("Smenr", sap.ui.model.FilterOperator.Contains, sValue);
			var oBinding = oEvent.getSource().getBinding("items");
			//oBinding.filter(new Filter([oFilter1,oFilter2],false));
			oBinding.filter([oFilter1]);
		},
		onUnitSelect: function(oEvent){
		
			var oThis = this;
			var aContexts = oEvent.getParameter("selectedContexts");
			
			if (aContexts && aContexts.length) { 
				
				var oData;
				if (this._useWizard ) {
					var oViewModel = this.getView().getModel("viewModel");
					oData = oViewModel.getProperty("/CNTemplate");
				} else {
					var oTreeTable = oThis.getView().byId("createCNTable");
					var oModel = oTreeTable.getBinding("rows").getModel();
					var oTableCtx = oTreeTable.getContextByIndex(oThis._selectedIdx);
					oData = oTableCtx.getProperty();
				}	
				aContexts.map(function(oContext) { 
					
					var oObject = oContext.getObject();
					var bFound = false;
					
					for(var idx in oData.ROUnits){
					
						if (oData.ROUnits[idx].REIMKEY === oObject.ROKey){
							bFound = true; 
							break;
						}
					}
					if (bFound) {
							var bCompact = !!oThis.getView().$().closest(".sapUiSizeCompact").length;
							MessageBox.error(
								oThis.getResourceBundle().getText("Error.SameUnitSelected"),
								{
									styleClass: bCompact ? "sapUiSizeCompact" : ""
								}
							);
					} else{
						var oRow = {"IsParent": false,
							"ODHeaderId" : oData.ODHeaderId,
							"REIMKEY" : oObject.ROKey,
							"REUnit"  : oObject.Xmetxt,
							"UnitSize": oObject.ROSize,       
							"UOM" : oObject.ROUnit 
						};
						oData.ROUnits.push(oRow);
					}
				});
				
			/*	var retext = "";
				for(var i in oData.ROUnits) {
					if (retext.length > 0) {
						retext = retext + ", " + oData.ROUnits[i].reunit;
					}else{
						retext = oData.ROUnits[i].reunit;
					}
				}
				
				if (oData.BP.length > 0) {
					oData.reunit = retext + " " + oData.BP[0].BPname;
				} else {
					oData.reunit = retext;
				}*/
				
				oThis._genREText(oData);
				oThis._calcUnitSize(oData);
				
				if (this._useWizard ) {
					oViewModel.setProperty("/CNTemplate",oData);
				} else {
					oModel.refresh();
					oTreeTable.expand(oThis._selectedIdx);
				}
			}
			
		},
		
		onUnitCancel: function(oEvent){
			//oEvent.getSource().getBinding("items").filter([]);
		},
		
		onSelectInd: function(oEvent){
			this._selectedIdx = oEvent.getSource().getParent().getIndex();
			
			if (!this._oSelectInd) {
				this._oSelectInd = sap.ui.xmlfragment("selectInd","fin.re.conmgmts1.fragment.selectIndustry", this);
				this._oSelectInd.setModel(this.getView().getModel());
			}
			this.getView().addDependent(this._oSelectInd);
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oSelectInd);
			this._oSelectInd.open();
		},
		
		onIndSearch: function(oEvent){
			var sValue = oEvent.getParameter("value");
			var oFilter1;
			var oBinding = oEvent.getSource().getBinding("items");
			
			if (parseInt(sValue)){
				 oFilter1 = new Filter("Ind_Sector", sap.ui.model.FilterOperator.Contains, sValue);
			} else {
				oFilter1 = new Filter("Text", sap.ui.model.FilterOperator.Contains, sValue);
				
			}
			oBinding.filter(new Filter([oFilter1]));
			
			
		},
		onIndSelect: function(oEvent){
			
			var aContexts = oEvent.getParameter("selectedContexts");
			
			if (aContexts && aContexts.length) { 
				
				var oTreeTable = this.getView().byId("createCNTable");
				var oModel = oTreeTable.getBinding("rows").getModel();
				var oTableCtx = oTreeTable.getContextByIndex(this._selectedIdx);
				var oData = oTableCtx.getProperty();
				
				aContexts.map(function(oContext) { 
					oData.IndSector = oContext.getObject().Ind_Sector;
					oData.Industry = oContext.getObject().Text;
				});
				
				oModel.refresh();
				
			}
		},
		
		onBPManage: function(oEvent){
			
			this._selectedIdx = oEvent.getSource().getParent().getIndex();
			this._useWizard = false;
			
			var oThis = this;
			var oView = this.getView();
			var oViewModel = oView.getModel("viewModel");
			var oTreeTable = oView.byId("createCNTable");
			var oTableCtx = oTreeTable.getContextByIndex(this._selectedIdx);
			var oData = oTableCtx.getProperty();
			var sPath = oTableCtx.getPath();
			
		
			this._selectedODATA = oData;
			
			oViewModel.setProperty("/addMainBP",true);
			
		
			for(var item in oData.BP){
				if(oData.BP[item].BusinessPartnerRole === this.getMainBPRole()){
					oViewModel.setProperty("/addMainBP",false);
				}
			}
			
			
			if (!this._oManageBP) {
				
				this._oManageBP = sap.ui.xmlfragment("manageBP","fin.re.conmgmts1.fragment.manageBP", this);
				this.getView().addDependent(this._oManageBP);
			}

			var oList = Fragment.byId("manageBP", "listBP");
			var oItemTemplate = new sap.m.StandardListItem({
				title:"{CNModel>BusinessPartnerFullName}",
				description : "{CNModel>BusinessPartner}",
				icon : "{= ${viewModel>BusinessPartnerRole} === ${viewModel>/mainBPRole} ? 'sap-icon://customer' : 'sap-icon://contacts' }",
				iconDensityAware: false,
				iconInset: false,
				info : "{= ${CNModel>BusinessPartnerRole} === '" + this.getMainBPRole() + "' ? 'Main Customer' : 'Contact' }",
				infoState: "{= ${CNModel>BusinessPartnerRole} === '" + this.getMainBPRole() + "' ? 'Success' : 'Warning' }",
				type: "Active",
				press: [oThis.onNavToBP ,oThis],
				customData: [
				new sap.ui.core.CustomData({
					key : "BusinessPartner",
					value: "{CNModel>BusinessPartner}"
					})
				]
			});
			oList.bindItems("CNModel>" + sPath + "/BP",oItemTemplate);
			this._oEventSource = oEvent.getSource();
			this._oManageBP.openBy(this._oEventSource);
		},
		onBPAdd: function(oEvent){
			
			if (!this._oSelectBP) {
				this._oSelectBP = sap.ui.xmlfragment("selectBP","fin.re.conmgmts1.fragment.selectBP", this);
			}
			
			var oItem = oEvent.getParameter("item");
			var aFilters = [];
			aFilters.push(new Filter("CompanyCode", FilterOperator.EQ, "1001"));
			if (oItem) {
				if (oItem.getText() === "Add Main Customer") {
					aFilters.push(new Filter("BusinessPartnerRole", FilterOperator.EQ, this.getMainBPRole()));
				} else {
					aFilters.push(new Filter("BusinessPartnerRole", FilterOperator.EQ, this.getOtherBPRole()));
				}
			} else {
				if (oEvent.getSource().getText() === "Add Main Customer") {
					aFilters.push(new Filter("BusinessPartnerRole", FilterOperator.EQ, this.getMainBPRole()));
				} else {
					aFilters.push(new Filter("BusinessPartnerRole", FilterOperator.EQ, this.getOtherBPRole()));
				}
			}
			

			var oTable = Fragment.byId("selectBP", "selectBP-table");
			var oTemplate = oTable.getBindingInfo("items").template;
			
			var oBindingInfo = {
				path: "/PartnerSearchSet",
				template: oTemplate,
				filters: aFilters
			};
			
			oTable.bindAggregation("items", oBindingInfo);
			
			this.getView().addDependent(this._oSelectBP);
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oSelectBP);
			this._oSelectBP.open();
			
		
		},
		onBPClose: function(){
			this._oEventSource = null;
			this._oManageBP.close();
		},
		
		onBPSearch: function(oEvent) {
			
			var sQuery = oEvent.getParameter("value");
			
			if (sQuery) {
				var aFilter = [];
				sQuery = sQuery.toUpperCase();
				aFilter.push(new Filter("BusinessPartnerFullName", FilterOperator.Contains, sQuery));
				aFilter.push(new Filter("BusinessPartner", FilterOperator.Contains, sQuery));
				
				var oBinding = oEvent.getSource().getBinding("items");
				oBinding.filter(new Filter(aFilter,false));
			
			}
			
		},
		
		onBPSearchClose: function(oEvent){
			
			var aContexts = oEvent.getParameter("selectedContexts");
			var oData;
			
			if (this._useWizard) {
				var oViewModel = this.getView().getModel("viewModel");
				oData = oViewModel.getProperty("/CNTemplate");
			} else {
				oData = this._selectedODATA;	
			}
			var oThis = this;
			if (aContexts && aContexts.length) {
			
				aContexts.map(function(oContext) {	
					var bp = { 
					  "ODHeaderId" : oData.ODHeaderId,
					  "BusinessPartner" : oContext.getObject().BusinessPartner,
					  "BusinessPartnerRole": oContext.getObject().BusinessPartnerRole,
					  "Customer" : oContext.getObject().Customer,
					  "BusinessPartnerFullName" : oContext.getObject().BusinessPartnerFullName
					};
					
					if (oContext.getObject().BusinessPartnerRole === oThis.getMainBPRole()){
						
						if (oData.BP.length > 0) {
							if (oData.BP[0].BusinessPartnerRole === oThis.getMainBPRole()){
								oData.BP.splice(0,1,bp);
							} else {
								oData.BP.splice(0,0,bp);
							}
						} else {
							oData.BP.push(bp);
						}
						// var bHasMainBPRole = false;
						// for(var idx in oData.BP) {
						// 	if (oData.BP[idx].BProle === oThis.getMainBPRole()){
						// 		bHasMainBPRole = true;
						// 	}
						// }
						// if (!bHasMainBPRole) {
						// 	oThis._selectedODATA.BP.splice(0,0,bp);
						// } else {
						// 	console.log("Failed");
						// }
					} else {
						//oThis._selectedODATA.BP.push(bp);
						oData.BP.push(bp);
					}
				});
				
				
				this._genREText(oData);
				if (this._useWizard) {
					oViewModel.setProperty("/CNTemplate",oData);
				}else{
					var oModel = this.getView().getModel("CNModel");
					oModel.refresh();
				}
			}
			
			
			oEvent.getSource().getBinding("items").filter([]);
			if (!this._useWizard) {
				this._oManageBP.openBy(this._oEventSource);
			}
		},
		onBPDelete: function(oEvent){
			var oItem = oEvent.getParameter("listItem");
			var idx = oItem.getParent().indexOfItem(oItem);	
			var oData;
			
			if (this._useWizard) {
				var oViewModel = this.getView().getModel("viewModel");
				oData = oViewModel.getProperty("/CNTemplate");
				oData.BP.splice(idx,1);
				oViewModel.setProperty("/CNTemplate",oData);
			} else {
				var oModel = this.getView().getModel("CNModel");
				oData = this._selectedODATA;
				oData.BP.splice(idx,1);
				oModel.refresh();
			}
			
		
			

		},
		onBPNavBack: function(){
			var oNavCon = Fragment.byId("manageBP", "navCon");
			oNavCon.back();	
		},

		onNavToBP : function (oEvent) {
			//var oCtx = oEvent.getSource().getBindingContext();
			var oItem = oEvent.getSource();
			
			var sBPId = oItem.data("BusinessPartner");
			
			var oNavCon = Fragment.byId("manageBP", "navCon");
			var omanageBP = Fragment.byId("manageBP", "detail");
			oNavCon.to(omanageBP);
			omanageBP.bindElement("/PartnerSearchSet('" + sBPId + "')");
		},

		onVHBaseRent: function(oEvent){
			if (!this._oManageBaseRent) {
				
				this._oManageBaseRent = sap.ui.xmlfragment("manageBaseRent","fin.re.conmgmts1.fragment.manageBaseRent", this);
				this.getView().addDependent(this._oManageBaseRent);
			}
			
			this._selectedIdx = oEvent.getSource().getParent().getIndex();
			
			var oView = this.getView();
			var oViewModel = oView.getModel("viewModel");
			var oTreeTable = oView.byId("createCNTable");
			var oTableCtx = oTreeTable.getContextByIndex(this._selectedIdx);
			var oData = oTableCtx.getProperty();
			this._selectedODATA = oData;
		
			oViewModel.setProperty("/BaseRent",oData.BaseRent);
			
			this._oEventSource = oEvent.getSource();
			this._oManageBaseRent.openBy(this._oEventSource);
		},
		onBaseRentClose: function(){
			//var oData = this._selectedODATA;
			//var oView = this.getView();
			var oViewModel = this.getView().getModel("viewModel");
			var oTreeTable = this.getView().byId("createCNTable");
			var oModel = oTreeTable.getBinding("rows").getModel();
			
			//oData.BaseRent = oViewModel.getProperty("/BaseRent");
			if (oViewModel.getProperty("/BaseRent/error")) {
				oViewModel.setProperty("/BaseRent/unitprice",0.00) ;
			}
			oModel.refresh();
			
			this._oEventSource = null;
			this._oManageBaseRent.close();
		},
		onVHSVCRent : function(oEvent){
			if (!this._oManageSVCRent) {
				
				this._oManageSVCRent = sap.ui.xmlfragment("manageSVCRent","fin.re.conmgmts1.fragment.manageSVCRent", this);
				this.getView().addDependent(this._oManageSVCRent);
			}
			
			this._selectedIdx = oEvent.getSource().getParent().getIndex();
			
			var oView = this.getView();
			var oViewModel = oView.getModel("viewModel");
			var oTreeTable = oView.byId("createCNTable");
			var oTableCtx = oTreeTable.getContextByIndex(this._selectedIdx);
			var oData = oTableCtx.getProperty();
			this._selectedODATA = oData;
			
			oViewModel.setProperty("/SVCRent",oData.SVCRent);
			
			this._oEventSource = oEvent.getSource();
			this._oManageSVCRent.openBy(this._oEventSource);
		},
		onSVCRentClose: function(){
			
			//var oData = this._selectedODATA;
			//var oView = this.getView();
			var oViewModel = this.getView().getModel("viewModel");
			var oTreeTable = this.getView().byId("createCNTable");
			var oModel = oTreeTable.getBinding("rows").getModel();
			
			if (oViewModel.getProperty("/SVCRent/error")) {
				oViewModel.setProperty("/SVCRent/unitprice",0.00) ;
			}
			oModel.refresh();
			
			this._oEventSource = null;
			this._oManageSVCRent.close();
		},
		
		onVHANPRent : function(oEvent){
			if (!this._oManageANPRent) {
				
				this._oManageANPRent = sap.ui.xmlfragment("manageANPRent","fin.re.conmgmts1.fragment.manageANPRent", this);
				this.getView().addDependent(this._oManageANPRent);
			}
			
			this._selectedIdx = oEvent.getSource().getParent().getIndex();
			
			var oView = this.getView();
			var oViewModel = oView.getModel("viewModel");
			var oTreeTable = oView.byId("createCNTable");
			var oTableCtx = oTreeTable.getContextByIndex(this._selectedIdx);
			var oData = oTableCtx.getProperty();
			this._selectedODATA = oData;
			
			oViewModel.setProperty("/ANPRent",oData.ANPRent);
			
			this._oEventSource = oEvent.getSource();
			this._oManageANPRent.openBy(this._oEventSource);
		},
		onANPRentClose: function(){
			
			var oViewModel = this.getView().getModel("viewModel");
			var oTreeTable = this.getView().byId("createCNTable");
			var oModel = oTreeTable.getBinding("rows").getModel();
			
			if (oViewModel.getProperty("/ANPRent/error")) {
				oViewModel.setProperty("/ANPRent/unitprice",0.00) ;
			}
			oModel.refresh();
			
			this._oEventSource = null;
			this._oManageANPRent.close();
		},
		
		onBSAChange: function(oEvent) {
			var sId = oEvent.getSource().data("myId");
				
			
			var sPath = oEvent.getSource().getBindingContext("CNModel").getPath();
			var oModel = this.getView().getModel("CNModel");
			var oBSARent = oModel.getProperty(sPath);
			
			var amount = oEvent.getParameters().value;
			var sMsg = "";
			
			var regex = /^\d+([,|\.]\d{3})*([,|\.]\d{2})?$/;
				
			if (!regex.test(amount)) {
					sMsg = this.getResourceBundle().getText("Error.NotNumber");
					sap.m.MessageBox.error(sMsg, {
				            title: "Error",                                      
				            initialFocus: null                                   
				        });
				    oBSARent[sId].error = true;
				    
			} else {
				oBSARent[sId].error = false;
			}
			
			oModel.refresh();
			
		},
		
		onManageBSAChange: function(oEvent){
			var sId = oEvent.getSource().data("myId");
			
			
		    var oViewModel = oEvent.getSource().getModel("viewModel");
		    var amount = oEvent.getParameters().value;
		  
		    var regex = /^\d+([,|\.]\d{3})*([,|\.]\d{2})?$/;
		    if (!regex.test(amount)) {
		    	oViewModel.setProperty("/"+sId+"/error",true); 
		    	
		    } else{
		    	oViewModel.setProperty("/"+sId+ "/error",false); 
		    }
			
		},
		
		onSDateChange: function(oEvent){
			var oBinding = oEvent.oSource.getBindingContext("CNModel");
			var sPath = oBinding.getPath();
			var oData = oBinding.getModel().getProperty(sPath);
			var sValue = oEvent.getParameter("value");
			var bValid = oEvent.getParameter("valid");
			if (bValid){
				if (Date.parse(oData.enddate) < Date.parse(sValue)){
					var sMsg = this.getResourceBundle().getText("Error.StartDateIsHigherThanEndDate");
					sap.m.MessageBox.error(sMsg, {
				            title: "Error",                                      
				            initialFocus: null                                   
				    });
				    oData.error.startdate = true;          
				} else{
					oData.error.startdate = false;       
				}
			}
		},
		onEDateChange: function(oEvent){
			var oBinding = oEvent.oSource.getBindingContext("CNModel");
			var sPath = oBinding.getPath();
			var oData = oBinding.getModel().getProperty(sPath);
			var sValue = oEvent.getParameter("value");
			var bValid = oEvent.getParameter("valid");
			if (bValid){
				if (Date.parse(oData.startdate) > Date.parse(sValue)){
					var sMsg = this.getResourceBundle().getText("Error.EndDateIsLowerThanStartDate");
					sap.m.MessageBox.error(sMsg, {
				            title: "Error",                                      
				            initialFocus: null                                   
				    });
				    oData.error.enddate = true; 
				}else{
					oData.error.enddate = false; 
				}
			}
		},
		onUserFields: function(oEvent){
			if (!this._oUserFields) {
				
				this._oUserFields = sap.ui.xmlfragment("manageUserFields","fin.re.conmgmts1.fragment.manageUserFields", this);
				this.getView().addDependent(this._oUserFields);
			}
			
			this._selectedIdx = oEvent.getSource().getParent().getIndex();
			
			var oView = this.getView();
			var oViewModel = oView.getModel("viewModel");
			var oTreeTable = oView.byId("createCNTable");
			var oTableCtx = oTreeTable.getContextByIndex(this._selectedIdx);
			var oData = oTableCtx.getProperty();
			this._selectedODATA = oData;
			
			oViewModel.setProperty("/UserFields",oData.UserFields);
			
			this._oEventSource = oEvent.getSource();
			this._oUserFields.openBy(this._oEventSource);
		},
		
		onUserFieldsClose: function(){
			
			this._oEventSource = null;
			this._oUserFields.close();
		},
		
		onNew: function(){
			if (!this._onNewCN) {
				
				this._onNewCN = sap.ui.xmlfragment("newContract","fin.re.conmgmts1.fragment.newContract", this);
				this.getView().addDependent(this._onNewCN);
			}
			
			var oViewModel = this.getView().getModel("viewModel");
			
			this._useWizard = true;
			
			var wizard = Fragment.byId("newContract", "CreateCNWizard");
			
			if (wizard.getProgressStep()) {
				wizard.setCurrentStep(wizard.getSteps()[0]);
			}
			
			var oData = JSON.parse(JSON.stringify(oViewModel.getProperty("/OTemplate")));
			oData.ODHeaderId = (new Date()).getTime();                         
			oViewModel.setProperty("/CNTemplate",oData);

			this.getView().addDependent(this._onNewCN);
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._onNewCN);
			this._onNewCN.open();
		},
		onNewCNDuration: function(oEvent){
			var iDuration =	oEvent.getParameter("value");
			var oStartDate = Fragment.byId("newContract", "StartDate").getDateValue();
			var oEndDate = new Date(oStartDate.getTime());
			var oDurationUnit = Fragment.byId("newContract", "durationUnit");
			
			switch(oDurationUnit.getSelectedKey()){
				case "day":
						oEndDate.setDate(oStartDate.getDate() + iDuration);
					break;
				case "month":
						oEndDate.setMonth(oStartDate.getMonth() + iDuration);
					break;
				case "year":
						oEndDate = new Date(oEndDate.setFullYear(oStartDate.getFullYear() + iDuration));
					break;
				default:
			}
			
			Fragment.byId("newContract", "EndDate").setDateValue(oEndDate);
			Fragment.byId("newContract", "EndDate").setValueState(sap.ui.core.ValueState.None);
			
			this.onNewCNDurationValidate();
		},
		
		onNewCNStartDate: function(oEvent){
			var oDP = oEvent.oSource;
			
			Fragment.byId("newContract", "LeaseStart").setDateValue(oDP.getDateValue());
		},
		onNewCNEndDate: function(oEvent){
			var wizard = Fragment.byId("newContract", "CreateCNWizard");
			var oEndDate = oEvent.oSource;
			
			var oStartDate = Fragment.byId("newContract", "StartDate");
			
			if (oEndDate.getDateValue() < oStartDate.getDateValue()) {
				oEndDate.setValueState(sap.ui.core.ValueState.Error);
				wizard.invalidateStep(wizard.getSteps()[0]);
			} else{
				oEndDate.setValueState(sap.ui.core.ValueState.None);
				wizard.validateStep(wizard.getSteps()[0]);
			}
			
		},
		onNewCNLeaseStart: function(oEvent){
			var wizard = Fragment.byId("newContract", "CreateCNWizard");
			var oLeaseStart = oEvent.oSource;
			
			var oStartDate = Fragment.byId("newContract", "StartDate");
			var oEndDate = Fragment.byId("newContract", "EndDate");
			
			if (oLeaseStart.getDateValue() < oStartDate.getDateValue() || oLeaseStart.getDateValue() > oEndDate.getDateValue()) {
				oLeaseStart.setValueState(sap.ui.core.ValueState.Error);
				wizard.invalidateStep(wizard.getSteps()[0]);
			} else{
				oLeaseStart.setValueState(sap.ui.core.ValueState.None);
				wizard.validateStep(wizard.getSteps()[0]);
				
			}
			
		},
		onNewCNDurationValidate: function(){
			var wizard = Fragment.byId("newContract", "CreateCNWizard");
			var oStartDate = Fragment.byId("newContract", "StartDate");
			var oEndDate = Fragment.byId("newContract", "EndDate");
			var oLeaseStart = Fragment.byId("newContract", "LeaseStart");
			
			var bValid = oStartDate.getValueState() === sap.ui.core.ValueState.None &&
						 oEndDate.getValueState() === sap.ui.core.ValueState.None &&
						 oLeaseStart.getValueState() === sap.ui.core.ValueState.None;
			
		
			if (bValid) {
				wizard.validateStep(wizard.getSteps()[0]);
			} else {
				wizard.invalidateStep(wizard.getSteps()[0]);
			}
			
		},
		onNewCNClose: function(){
			var oViewModel = this.getView().getModel("viewModel");
			var oNewRow = oViewModel.getProperty("/CNTemplate");
			var oTreeTable = this.getView().byId("createCNTable");
			var oModel = oTreeTable.getBinding("rows").getModel();
			var oData = oModel.getData();
			
			
			if(oData.hasOwnProperty("createCNTable")){
				this._genREText(oNewRow);
				oData.createCNTable.ROUnits.push(oNewRow);
				oModel.refresh();
			}
			
			this._onNewCN.close();
		},
		onNewCNCancel: function(){
				var wizard = Fragment.byId("newContract", "CreateCNWizard");
				wizard.goToStep(wizard.getSteps()[0]);
				this._onNewCN.close();
		},
		onSave: function(){
			
			var oThis = this;
			var oTreeTable = this.byId("createCNTable");
			var aSelectedIndices = oTreeTable.getSelectedIndices();
		
			
			
			if (aSelectedIndices.length > 0) {
				
				var oHeader = {};
				var bValid = true;
				
				oHeader.HeaderId = "1";
				oHeader.ZContractDataSet = [];
				
				for (var idx = 0; idx < aSelectedIndices.length; idx++) {
					var oContext = oTreeTable.getContextByIndex(aSelectedIndices[idx]);
					var oItem = oContext.getProperty();
					
					bValid = this._validateSave(oItem);
					
					if (!bValid) {
						break;
					}
					var oContract = {};
					oContract.HeaderId = "1";
					oContract.ODHeaderId = oItem.ODHeaderId;                         
					oContract.RECNKEY = oItem.RECNKey;
					oContract.RECNText = oItem.REUnit;
					oContract.StartDate = oItem.StartDate;
					oContract.EndDate = oItem.EndDate;
					oContract.IndSector = oItem.IndSector;
					oContract.UnitSize = oItem.UnitSize;
					oContract.UOM = oItem.UOM;
					oContract.IsParent = oItem.IsParent;
					oContract.UserFields = oItem.UserFields;                         
					oContract.BaseRent = oItem.BaseRent;
					oContract.SVCRent = oItem.SVCRent;
					oContract.ANPRent = oItem.anprent;
					oContract.BP = oItem.BP;
					oContract.ROUnits = oItem.ROUnits;
					oHeader.ZContractDataSet.push(oContract);
				}
				
				if(bValid) {
					var oModel = this.getModel();
					oModel.create("/ZContractListSet", oHeader, {
				    	method: "POST",
					    success: function(data) {
					    	sap.ui.core.BusyIndicator.hide();
					    	sap.m.MessageBox.success(oThis.getResourceBundle().getText("Msg.SuccessSave"), {
					            title: "Success",                                      
					            initialFocus: null                                   
					        });
					    },
					     error: function(e) {
					    	sap.ui.core.BusyIndicator.hide();
					    	sap.m.MessageBox.Error(oThis.getResourceBundle().getText("Error.FailToSave"), {
					            title: "Error",                                      
					            initialFocus: null                                   
					        });
					    }
					});
				}
			
			} else {
				MessageBox.warning(this.getResourceBundle().getText("Msg.PickContract"), {
					title: "Warning",                                      
				    initialFocus: null                                   
				});
			}
			
		},
		
		onCopy: function(){
			var oTreeTable = this.getView().byId("createCNTable");
			var aSelectedIndices = oTreeTable.getSelectedIndices();
		
			if (aSelectedIndices.length > 0) {
			
				var oModel = oTreeTable.getBinding("rows").getModel();
				var oData = oModel.getData();
				
				for (var idx = 0; idx < aSelectedIndices.length; idx++) {
					var oContext = oTreeTable.getContextByIndex(aSelectedIndices[idx]);
					var oItem = oContext.getProperty();
					
					var bValid = this._validateCopy(oItem);
					
					if (!bValid) {
						break;
					}
					
					if (oItem.IsParent) {
						oTreeTable.clearSelection();
						oItem.RECNKey = "CN" + oData.createCNTable.ROUnits.length;        
						oData.createCNTable.ROUnits.push(JSON.parse(JSON.stringify(oItem)));
						oModel.refresh();
					}
				}
			}
		},
		onUnitDelete: function(oEvent){
			var oViewModel = this.getView().getModel("viewModel");
			var oData = oViewModel.getProperty("/CNTemplate");
			var oItem = oEvent.getParameter("listItem");
			var idx = oItem.sId.match(/\d+$/);
			
			oData.ROUnits.splice(idx,1);
			this._calcUnitSize(oData);
			oViewModel.setProperty("/CNTemplate",oData);

		},
		_validateSave: function(oItem){
			var sMsg = "";
			var bValid = true;
			
			if(!oItem.IsParent){
				bValid = false;
				sMsg = this.getResourceBundle().getText("Msg.PickContract");
			}
			
			if(!bValid){
				MessageBox.error(sMsg, {
					title: "Error",                                      
					initialFocus: null                                   
				});
			}
			return bValid;
		},
		_validateCopy: function(oItem){
			var sMsg = "";
			var bValid = true;
			
			if(!oItem.IsParent){
				bValid = false;
				sMsg = this.getResourceBundle().getText("Msg.PickContract");
			}
			
			if(!bValid){
				MessageBox.error(sMsg, {
					title: "Error",                                      
					initialFocus: null                                   
				});
			}
			return bValid;
		},
		_onDelete: function(){
			var oTreeTable = this.byId("createCNTable");
			var aSelectedIndices = oTreeTable.getSelectedIndices();
			var oModel =  oTreeTable.getBinding("rows").getModel();
			var oData = oModel.getData();
			var bDeleted = false;
			var i = 0;
			var oRow = null;
			
			
			if (aSelectedIndices.length > 0) {
				for (var idx = 0; idx < aSelectedIndices.length; idx++) {
					
					var oContext = oTreeTable.getContextByIndex(aSelectedIndices[idx]);
				
					var oDeleteItem = oContext.getProperty();
				
				
					if (oDeleteItem.IsParent) {
							
							for(i = 0; i < oData.createCNTable.ROUnits.length; i++){
								oRow = oData.createCNTable.ROUnits[i];
								if (JSON.stringify(oDeleteItem) === JSON.stringify(oRow)){
									oData.createCNTable.ROUnits.splice(i,1);
									this._genREText(oRow);
									bDeleted = true;
								}
							}
							bDeleted = true;
						} else {
							for(i = 0; i < oData.createCNTable.ROUnits.length; i++){
								oRow = oData.createCNTable.ROUnits[i];
								for(var j = 0; j < oRow.ROUnits.length; j++ ) {
									if (JSON.stringify(oRow.ROUnits[j]) === JSON.stringify(oDeleteItem)){
										oRow.ROUnits.splice(j,1);
										bDeleted = true;
										this._genREText(oRow);
									}
								}	
							}
						}
				}
			
			} else {
				MessageBox.warning(this.getResourceBundle().getText("Msg.PickContractorUnit"), {
					title: "Warning",                                      
					initialFocus: null                                   
				});
			}
			if (bDeleted) {
				for(i = 0; i < oData.createCNTable.ROUnits.length; i++){
					oRow = oData.createCNTable.ROUnits[i];
					this._calcUnitSize(oRow);
				}
				oModel.refresh();
				oTreeTable.clearSelection();
			}
		},
		_calcUnitSize: function(oData){
			
			var fTotalSize = 0.00;
			var sUOM = "";
			var fUnitSize = 0.00;
			for(var i = 0; i < 	oData.ROUnits.length; i++){
				var oRow1 = oData.ROUnits[i];
				
				fUnitSize = parseFloat(oRow1.UnitSize);
				if (fUnitSize > 0 ) {
						fTotalSize = fTotalSize + fUnitSize;
						sUOM = oRow1.UOM;
				} 
				
				
				
			}
			oData.UnitSize = fTotalSize;
			oData.UOM = sUOM;
		},
		
		_genREText: function(oData){
			var retext = "";
			for(var i in oData.ROUnits) {
				if (retext.length > 0) {
					retext = retext + ", " + oData.ROUnits[i].REUnit;
				}else{
					retext = oData.ROUnits[i].REUnit;
				}
			}
			
			if (oData.BP.length > 0) {
				retext = retext + " " + oData.BP[0].BusinessPartnerFullName;
			}
			oData.REUnit = retext.trim();
		}
		

	});

});