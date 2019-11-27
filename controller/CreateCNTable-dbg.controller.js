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
			
			var oViewModel = new JSONModel({
				addMainBP : true
			});
			this.setModel(oViewModel, "viewModel");
			
			var oModel = new JSONModel("/model/CNModel.json");
			this.getView().setModel(oModel,"CNModel");
			
			var oCondFormModel = new JSONModel("/model/CondFModel.json");
			this.getView().setModel(oCondFormModel,"CondFModel");
			
			
			
			// var oBindingModel = new sap.ui.model.Binding(oModel,"/catalog/createCNTable/rows",oModel.getContext("/CNModel"));
			//  oBindingModel.attachChange(function() {
			//  	console.log("refresh");
			//  });
			
		},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf fin.re.conmgmts1.view.CreateCNTable
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf fin.re.conmgmts1.view.CreateCNTable
		 */
		/*	onAfterRendering: function() {
				
		
			},
		*/
		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf fin.re.conmgmts1.view.CreateCNTable
		 */
		//	onExit: function() {
		//
		//	}
		
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
					
						if (oDeleteItem.isparent) {
							for(i = 0; i < oData.catalog.createCNTable.rows.length; i++){
								oRow = oData.catalog.createCNTable.rows[i];
								if (oRow.reobjnr === oDeleteItem.reobjnr ){
									oData.catalog.createCNTable.rows.splice(i,1);
									this._genREText(oRow);
									bDeleted = true;
								}
							}
							bDeleted = true;
						} else {
							for(i = 0; i < oData.catalog.createCNTable.rows.length; i++){
								oRow = oData.catalog.createCNTable.rows[i];
								for(var j = 0; j < oRow.rows.length; j++ ) {{
									if (oRow.rows[j].reobjnr === oDeleteItem.reobjnr ){
										oRow.rows.splice(j,1);
										bDeleted = true;
										this._genREText(oRow);
									}
								
								}
								
							}	
						}
					}	
				}
			
			}
			if (bDeleted) {
				this._calcUnitSize();
				oModel.refresh();
				oTreeTable.clearSelection();
			}
			
			
		},
		
	
		onCollapseAll: function() {
			var oTreeTable = this.byId("createCNTable");
			oTreeTable.collapseAll();
		},
		
		
		onExpandFirstLevel: function() {
			var oTreeTable = this.byId("createCNTable");
			oTreeTable.expandToLevel(1);
		},
		
		/*onToggleExpand: function(){
			var oTreeTable = this.byId("createCNTable");
			var oViewModel = this.getView().getModel("viewModel");
			var iconState = oViewModel.getProperty("/toogleexpand");
			
			if(iconState === "sap-icon://collapse") {
				oTreeTable.collapseAll();
				oViewModel.setProperty("/toogleexpand","sap-icon://expand");	
			} else{
				oTreeTable.expandToLevel(1);
				oViewModel.setProperty("/toogleexpand","sap-icon://collapse");
			}
		},*/
		
		onAddUnit: function(oEvent){
			
			
			this._selectedIdx = oEvent.getSource().getParent().getIndex();
			
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
			oData.rows.push(oRow);
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
				var oTreeTable = oThis.getView().byId("createCNTable");
				var oModel = oTreeTable.getBinding("rows").getModel();
				var oTableCtx = oTreeTable.getContextByIndex(oThis._selectedIdx);
				var oData = oTableCtx.getProperty();
					
				aContexts.map(function(oContext) { 
					
					var oObject = oContext.getObject();
					var bFound = false;
					
					for(var idx in oData.rows){
						if (oData.rows[idx].reobjnr === oObject.ROKey){
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
						var oRow = {"isparent": false,
							"reimkey" : oObject.ROKey,
							"reunit"  : oObject.Xmetxt,
							"unitsize": oObject.ROSize,       
							"uom" : oObject.ROUnit 
						};
						oData.rows.push(oRow);
					}
				});
				
			/*	var retext = "";
				for(var i in oData.rows) {
					if (retext.length > 0) {
						retext = retext + ", " + oData.rows[i].reunit;
					}else{
						retext = oData.rows[i].reunit;
					}
				}
				
				if (oData.bp.length > 0) {
					oData.reunit = retext + " " + oData.bp[0].bpname;
				} else {
					oData.reunit = retext;
				}*/
				
				oThis._genREText(oData);
				
				oThis._calcUnitSize();
				oModel.refresh();
				oTreeTable.expand(oThis._selectedIdx);
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
					oData.indsector = oContext.getObject().IndSector;
					oData.industry = oContext.getObject().Text;
				});
				
				oModel.refresh();
				
			}
		},
		
		onBPManage: function(oEvent){
			
			this._selectedIdx = oEvent.getSource().getParent().getIndex();
			var oThis = this;
			var oView = this.getView();
			var oViewModel = oView.getModel("viewModel");
			var oTreeTable = oView.byId("createCNTable");
			var oTableCtx = oTreeTable.getContextByIndex(this._selectedIdx);
			var oData = oTableCtx.getProperty();
			var sPath = oTableCtx.getPath();
			
		
			this._selectedODATA = oData;
			
			oViewModel.setProperty("/addMainBP",true);
			
		
			for(var item in oData.bp){
				if(oData.bp[item].bprole === this.getMainBPRole()){
					oViewModel.setProperty("/addMainBP",false);
				}
			}
			
			
			if (!this._oManageBP) {
				
				this._oManageBP = sap.ui.xmlfragment("manageBP","fin.re.conmgmts1.fragment.manageBP", this);
				this.getView().addDependent(this._oManageBP);
			}

			var oList = Fragment.byId("manageBP", "listBP");
			var oItemTemplate = new sap.m.StandardListItem({
				title:"{CNModel>bpname}",
				description : "{CNModel>partner}",
				info : "{= ${CNModel>bprole} === '" + this.getMainBPRole() + "' ? 'Main Customer' : 'Contact' }",
				infoState: "{= ${CNModel>bprole} === '" + this.getMainBPRole() + "' ? 'Success' : 'Warning' }",
				type: "Active",
				press: [oThis.onNavToBP ,oThis],
				customData: [
				new sap.ui.core.CustomData({
					key : "partner",
					value: "{CNModel>partner}"
					})
				]
			});
			oList.bindItems("CNModel>" + sPath + "/bp",oItemTemplate);
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
			var oData = this._selectedODATA;
			var oThis = this;
			if (aContexts && aContexts.length) {
			
				aContexts.map(function(oContext) {	
					var bp = { "partner" : oContext.getObject().BusinessPartner,
					  "bprole": oContext.getObject().BusinessPartnerRole,
					  "customerid" : oContext.getObject().Customer,
					  "bpname" : oContext.getObject().BusinessPartnerFullName
					};
					
					if (oContext.getObject().BusinessPartnerRole === oThis.getMainBPRole()){
						
						if (oData.bp.length > 0) {
							if (oData.bp[0].bprole === oThis.getMainBPRole()){
								oData.bp.splice(0,1,bp);
							} else {
								oData.bp.splice(0,0,bp);
							}
						} else {
							oData.bp.push(bp);
						}
						// var bHasMainBPRole = false;
						// for(var idx in oData.bp) {
						// 	if (oData.bp[idx].bprole === oThis.getMainBPRole()){
						// 		bHasMainBPRole = true;
						// 	}
						// }
						// if (!bHasMainBPRole) {
						// 	oThis._selectedODATA.bp.splice(0,0,bp);
						// } else {
						// 	console.log("Failed");
						// }
					} else {
						oThis._selectedODATA.bp.push(bp);
					}
				});
				this._genREText(oData);
				var oModel = this.getView().getModel("CNModel");
				oModel.refresh();
			}
			oEvent.getSource().getBinding("items").filter([]);
			
			this._oManageBP.openBy(this._oEventSource);
		},
		onBPDelete: function(oEvent){
			var oItem = oEvent.getParameter("listItem");
			var idx = oItem.getParent().indexOfItem(oItem);	
			var oModel = this.getView().getModel("CNModel");
			var oData = this._selectedODATA;
			
			oData.bp.splice(idx,1);
			oModel.refresh();
			

		},
		onBPNavBack: function(){
			var oNavCon = Fragment.byId("manageBP", "navCon");
			oNavCon.back();	
		},

		onNavToBP : function (oEvent) {
			//var oCtx = oEvent.getSource().getBindingContext();
			var oItem = oEvent.getSource();
			var sBPId = oItem.data("partner");
			
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
		
			oViewModel.setProperty("/baserent",oData.baserent);
			
			this._oEventSource = oEvent.getSource();
			this._oManageBaseRent.openBy(this._oEventSource);
		},
		onBaseRentClose: function(){
			//var oData = this._selectedODATA;
			//var oView = this.getView();
			var oViewModel = this.getView().getModel("viewModel");
			var oTreeTable = this.getView().byId("createCNTable");
			var oModel = oTreeTable.getBinding("rows").getModel();
			
			//oData.baserent = oViewModel.getProperty("/baserent");
			if (oViewModel.getProperty("/baserent/error")) {
				oViewModel.setProperty("/baserent/unitprice",0.00) ;
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
			
			oViewModel.setProperty("/svcrent",oData.svcrent);
			
			this._oEventSource = oEvent.getSource();
			this._oManageSVCRent.openBy(this._oEventSource);
		},
		onSVCRentClose: function(){
			
			//var oData = this._selectedODATA;
			//var oView = this.getView();
			var oViewModel = this.getView().getModel("viewModel");
			var oTreeTable = this.getView().byId("createCNTable");
			var oModel = oTreeTable.getBinding("rows").getModel();
			
			if (oViewModel.getProperty("/svcrent/error")) {
				oViewModel.setProperty("/svcrent/unitprice",0.00) ;
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
			
			oViewModel.setProperty("/anprent",oData.anprent);
			
			this._oEventSource = oEvent.getSource();
			this._oManageANPRent.openBy(this._oEventSource);
		},
		onANPRentClose: function(){
			
			var oViewModel = this.getView().getModel("viewModel");
			var oTreeTable = this.getView().byId("createCNTable");
			var oModel = oTreeTable.getBinding("rows").getModel();
			
			if (oViewModel.getProperty("/anprent/error")) {
				oViewModel.setProperty("/anprent/unitprice",0.00) ;
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
			
			oViewModel.setProperty("/usrfields",oData.usrfields);
			
			this._oEventSource = oEvent.getSource();
			this._oUserFields.openBy(this._oEventSource);
		},
		
		onUserFieldsClose: function(){
			
			this._oEventSource = null;
			this._oUserFields.close();
		},
		
		onNew: function(){
			sap.ui.core.BusyIndicator.hide();
		},
		onSave: function(){
			
			var oThis = this;
			var oTreeTable = this.byId("createCNTable");
			var oModel =  oTreeTable.getBinding("rows").getModel();
			var oData = oModel.getData();
			
			sap.ui.core.BusyIndicator.show(0);
			
			oModel.create("/MarketListHeaderSet", oData, {
			    	method: "POST",
				    success: function(data) {
				    	sap.ui.core.BusyIndicator.hide();
				    	sap.m.MessageBox.Success(oThis.getResourceBundle().getText("Msg.SuccessSave"), {
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
		},
		_calcUnitSize: function(){
			var oTreeTable = this.getView().byId("createCNTable");
			var oData = oTreeTable.getBinding("rows").getModel().getData();
			
			for(var i = 0; i < 	oData.createCNTable.rows.length; i++){
				var oRow1 = oData.createCNTable.rows[i];
				
				var fTotalSize = 0.00;
				var sUOM = "";
				var fUnitSize = 0.00;
				
				for(var j = 0; j < oRow1.rows.length; j++ ) {
				
					fUnitSize = parseFloat(oRow1.rows[j].unitsize);
					if (fUnitSize > 0 ) {
						fTotalSize = fTotalSize + parseFloat(oRow1.rows[j].unitsize);
						sUOM = oRow1.rows[j].uom;
					} 
					
				}
				oRow1.unitsize = fTotalSize;
				oRow1.uom = sUOM;
			}
		},
		
		_genREText: function(oData){
			var retext = "";
			for(var i in oData.rows) {
				if (retext.length > 0) {
					retext = retext + ", " + oData.rows[i].reunit;
				}else{
					retext = oData.rows[i].reunit;
				}
			}
			
			if (oData.bp.length > 0) {
				retext = retext + " " + oData.bp[0].bpname;
			}
			oData.reunit = retext.trim();
		}
		

	});

});