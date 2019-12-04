sap.ui.define(
  [
  	'sap/ui/core/XMLComposite',
  	'sap/ui/core/Fragment',
	'sap/ui/model/Filter',
	'sap/ui/model/FilterOperator'
  ],
  function(XMLComposite,Fragment,Filter,FilterOperator) {
  	"use strict";
  	
    return XMLComposite.extend("fin.re.conmgmts1.controls.selection.BusinessPartner",{
       metadata: {
            properties: {
            	"addMainBP" : false
            },
            events: {
            	
            },
            aggregations: {
            	"items": {
            		
            	}
            }
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
						aFilters.push(new Filter("BusinessPartnerRole", FilterOperator.EQ, "BPR101"));
					} else {
						aFilters.push(new Filter("BusinessPartnerRole", FilterOperator.EQ, "BPL002"));
					}
				} else {
					if (oEvent.getSource().getText() === "Add Main Customer") {
						aFilters.push(new Filter("BusinessPartnerRole", FilterOperator.EQ, "BPR101"));
					} else {
						aFilters.push(new Filter("BusinessPartnerRole", FilterOperator.EQ, "BPL002"));
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
				
				//this.getView().addDependent(this._oSelectBP);
				//jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oSelectBP);
				this._oSelectBP.open();
			}
	});
  }
);