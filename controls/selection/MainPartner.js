sap.ui.define(
  [
  	"sap/ui/core/Control",
  	"sap/m/Button",
  	"sap/ui/table/Table",
  	"sap/ui/table/Column"
  ],
  function(Control,Table,Column,Button) {
  return Control.extend("fin.re.conmgmts1.controls.selection.MainPartner",{
       metadata: {
            properties: {
            	"ContractID" : "string",
            	"MainPartnerID" : "string",
            	"MainPartnerName" : "string"
            },
            events: {},
            aggregations : {
            	_btnSelect : {type : "sap.m.Button", multiple: false, visibility : "public"}
            }
       },
       init : function () {
       		
			this.setAggregation("_btnSelect", new Button({
				text: "{i18n>Button.Select.MainPartner}",
				press: this._onSubmit.bind(this)
			}));
		},
       renderer: function(oRM,oControl){
       		var oResourceBundle = this.getModel("i18n").getResourceBundle();
           	oRM.write("<Column width='11rem'
           	
           	>");
           	oRM.write("<Label text='" + oResourceBundle.getText("Table.Label.MainPartnerID") + "' />");
           	oRM.write()
						<template>
							<m:Text text="{Name}" wrapping="false" />
						</template>
					</Column>
       },
       
       onAfterRendering: function() {
            //if I need to do any post render actions, it will happen here
            if(sap.ui.core.Control.prototype.onAfterRendering) {
                 sap.ui.core.Control.prototype.onAfterRendering.apply(this,arguments); //run the super class's method first
            }
       }
  });
  }
);