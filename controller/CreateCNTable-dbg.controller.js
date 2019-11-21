sap.ui.define([
	"fin/re/conmgmts1/controller/BaseController",
	'sap/m/MessageBox',
	"sap/ui/model/json/JSONModel",
	'sap/ui/core/Fragment',
	'sap/ui/model/Filter',
	'sap/ui/model/FilterOperator',
	"fin/re/conmgmts1/model/formatter"
], function(BaseController,MessageBox,JSONModel,Fragment,Filter,FilterOperator,formatter) {
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
			
			
			
		/*	var oBindingModel = new sap.ui.model.Binding(oModel,"/",oModel.getContext("/"));
			oBindingModel.attachChange(function() {
					oThis._calcUnitSize();
					
			});*/
			
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
				"Are you sure to delete ?",
				{
					icon: MessageBox.Icon.WARNING,
					title: "Focus on a Button",
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
					
						if (oDeleteItem.isParent) {
							for(i = 0; i < oData.catalog.createCNTable.rows.length; i++){
								oRow = oData.catalog.createCNTable.rows[i];
								if (oRow.reobjnr === oDeleteItem.reobjnr ){
									oData.catalog.createCNTable.rows.splice(i,1);
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
									}
								
								}
								
							}	
						}
					}	
				}
			
			}
			if (bDeleted) {
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
		
		onAddUnit: function(oEvent){
			
			
			this._selectedIdx = oEvent.getSource().getParent().getIndex();
			
			if (!this._oSelectUnit) {
				this._oSelectUnit = sap.ui.xmlfragment("fin.re.conmgmts1.fragment.selectUnit", this);
				this._oSelectUnit.setModel(this.getView().getModel());
			}
			
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
			var oFilter2 = new Filter("Smenr", sap.ui.model.FilterOperator.Contains, sValue);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([oFilter1,oFilter2]);
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
					
					var oRow = {"isParent": false,
						"reobjnr" : oObject.ROKey,
						"reunit"  : oObject.Xmetxt,
						"unitsize": oObject.ROSize,       
						"uom" : oObject.ROUnit 
					};
					oData.rows.push(oRow);
				});
				
				oThis._calcUnitSize();
				oModel.refresh();
				oTreeTable.expand(oThis._selectedIdx);
			}
			
		},
		
		onUnitCancel: function(oEvent){
			//oEvent.getSource().getBinding("items").filter([]);
		},
		
		onBPManage: function(oEvent){
			
			this._selectedIdx = oEvent.getSource().getParent().getIndex();
			
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
				description : "{CNModel>bpid}",
				info : "{= ${CNModel>bprole} === '" + this.getMainBPRole() + "' ? 'Main Customer' : 'Contact' }",
				infoState: "{= ${CNModel>bprole} === '" + this.getMainBPRole() + "' ? 'Success' : 'Warning' }"
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
				path: "/MainPartnerSearchSet",
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
					var bp = { "bpid" : oContext.getObject().BusinessPartner,
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
				//var oList = Fragment.byId("manageBP", "listBP");
				//oList.getBinding("items").refresh();
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

	/*	onNavTomanageBP : function (oEvent) {
			var oCtx = oEvent.getSource().getBindingContext();
			var oNavCon = Fragment.byId("manageBP", "navCon");
			var omanageBP = Fragment.byId("manageBP", "selectListBP");
			oNavCon.to(omanageBP);
			omanageBP.bindElement(oCtx.getPath());
		},
*/
		
		_calcUnitSize: function(){
			var oTreeTable = this.getView().byId("createCNTable");
			var oData = oTreeTable.getBinding("rows").getModel().getData();
			
			for(var i = 0; i < 	oData.catalog.createCNTable.rows.length; i++){
				var oRow1 = oData.catalog.createCNTable.rows[i];
				
				var iTotalSize = 0.00;
				var sUOM = "";
				for(var j = 0; j < oRow1.rows.length; j++ ) {
					//console.log(oRow1.rows[j]);
					iTotalSize = iTotalSize + parseFloat(oRow1.rows[j].unitsize);
					sUOM = oRow1.rows[j].uom;
				}
				oRow1.unitsize = iTotalSize;
				oRow1.uom = sUOM;
			}
		}

	});

});