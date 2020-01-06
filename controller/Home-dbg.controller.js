sap.ui.define([
	"fin/re/conmgmts1/controller/BaseController"
], function(BaseController) {
	"use strict";

	return BaseController.extend("fin.re.conmgmts1.controller.Home", {

		onInit: function() {
			
			this.getOwnerComponent().getModel().metadataLoaded().then(this._onMetadataLoaded.bind(this));
		},
		_onMetadataLoaded: function() {
		
			
		},
		
		onTilePress: function(oEvent){
			var bukrs = oEvent.getSource().data("bukrs");
			var swenr = oEvent.getSource().data("swenr");
			var recntype = oEvent.getSource().data("recntype");
			if (recntype === "L001" || recntype === "L002") {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("createcntable", {
					companyCode: bukrs,
					busEntity: swenr,
					recntype : recntype
				});
			}
		}
		

	});

});